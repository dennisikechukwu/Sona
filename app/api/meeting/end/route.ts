import Groq from "groq-sdk";
import { Resend } from "resend";
import { createClient, createServiceClient } from "@/lib/supabase/server";
import { createRateLimiter } from "@/lib/ratelimit";
import type { TranscriptLine, ActionItem } from "@/lib/types";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: Request) {
  try {
    const ip = request.headers.get("x-forwarded-for") ?? "anonymous";
    const ratelimit = createRateLimiter();
    const { success } = await ratelimit.limit(`summarize_${ip}`);
    
    if (!success) {
      return Response.json({ error: "Rate limit exceeded. Too many summaries." }, { status: 429 });
    }

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });

    const { roomId, lines, durationSeconds, participantCount, participantIds = [] } = await request.json() as {
      roomId: string;
      lines: TranscriptLine[];
      durationSeconds: number;
      participantCount?: number;
      participantIds?: string[];
    };

    if (!roomId) {
      return Response.json({ error: "roomId required" }, { status: 400 });
    }

    // ── 1. Save / update meeting record ──────────────────────────────────────
    const adminClient = createServiceClient();
    
    const { data: meetingCheck } = await adminClient
      .from("meetings")
      .select("host_id")
      .eq("room_id", roomId)
      .single();
      
    if (meetingCheck?.host_id !== user.id) {
      return Response.json({ error: "Only the host can officially end meetings" }, { status: 403 });
    }

    const { data: meeting, error: meetingError } = await adminClient
      .from("meetings")
      .update({
        ended_at: new Date().toISOString(),
        ...(participantCount != null ? { participant_count: participantCount } : {}),
      })
      .eq("room_id", roomId)
      .select()
      .single();

    if (meetingError || !meeting) {
      console.error("Meeting update error:", meetingError);
      return Response.json({ error: "Failed to save meeting" }, { status: 500 });
    }

    // ── 2. Save transcript ────────────────────────────────────────────────────
    // Delete any previous transcript for this meeting first (idempotent)
    if (lines?.length) {
      await adminClient.from("transcripts").delete().eq("meeting_id", meeting.id);
      const { error: transcriptError } = await adminClient
        .from("transcripts")
        .insert({ meeting_id: meeting.id, lines });
      if (transcriptError) {
        console.error("Transcript save error:", transcriptError);
      }
    }

    // ── 3. Generate AI summary with Groq ─────────────────────────────────────
    let summary = "";
    let keyTopics: string[] = [];
    let actionItems: ActionItem[] = [];

    if (lines?.length) {
      const transcriptText = lines
        .map((l) => `[${l.time}] ${l.speaker}: ${l.text}`)
        .join("\n");

      try {
        const completion = await groq.chat.completions.create({
          model: "llama-3.3-70b-versatile",
          // Force pure JSON output — no markdown wrapping
          response_format: { type: "json_object" },
          messages: [
            {
              role: "system",
              content: `You are a meeting assistant. Given a transcript, respond with a single valid JSON object containing exactly these keys:
- "summary": a 2-4 sentence plain-text summary of what was discussed and decided
- "key_topics": an array of 3-6 short topic strings (max 4 words each)
- "action_items": an array of objects with { "text": string, "owner": string, "due": string }. Only include action items that were explicitly mentioned. Use "Unknown" for owner if not specified, and "TBD" for due if no date mentioned.`,
            },
            {
              role: "user",
              content: `Transcript:\n${transcriptText}`,
            },
          ],
          temperature: 0.3,
          max_tokens: 1024,
        });

        const raw = completion.choices[0]?.message?.content ?? "{}";
        // Strip markdown code fences if the model ignores response_format
        const cleaned = raw
          .replace(/^```(?:json)?\s*/i, "")
          .replace(/\s*```\s*$/i, "")
          .trim();

        const parsed = JSON.parse(cleaned);
        summary = typeof parsed.summary === "string" ? parsed.summary : "";
        keyTopics = Array.isArray(parsed.key_topics) ? parsed.key_topics : [];
        actionItems = Array.isArray(parsed.action_items)
          ? parsed.action_items.map((a: { text: string; owner: string; due: string }) => ({
              text: String(a.text ?? ""),
              owner: String(a.owner ?? "Unknown"),
              due: String(a.due ?? "TBD"),
              done: false,
            }))
          : [];
      } catch (groqErr) {
        console.error("Groq summarization error:", groqErr);
        summary = "AI summary could not be generated for this session.";
      }
    }

    // ── 4. Save summary ───────────────────────────────────────────────────────
    // Delete previous summaries for this meeting (idempotent)
    await adminClient.from("summaries").delete().eq("meeting_id", meeting.id);
    const { error: summaryError } = await adminClient.from("summaries").insert({
      meeting_id: meeting.id,
      summary_text: summary || null,
      key_topics: keyTopics,
    });
    if (summaryError) console.error("Summary save error:", summaryError);

    // ── 5. Save action items ──────────────────────────────────────────────────
    await adminClient.from("action_items").delete().eq("meeting_id", meeting.id);
    if (actionItems.length > 0) {
      const { error: actionError } = await adminClient.from("action_items").insert(
        actionItems.map((a) => ({
          meeting_id: meeting.id,
          text: a.text,
          owner_name: a.owner,
          due_date: a.due,
        }))
      );
      if (actionError) console.error("Action items save error:", actionError);
    }

    // ── 6. Send summary email ─────────────────────────────────────────────────
    try {
      const { data: profile } = await adminClient
        .from("profiles")
        .select("display_name")
        .eq("id", user.id)
        .single();

      const firstName = (
        profile?.display_name || user.email?.split("@")[0] || "there"
      ).split(" ")[0];

      const durationLabel =
        durationSeconds >= 60
          ? `${Math.floor(durationSeconds / 60)}m ${durationSeconds % 60}s`
          : `${durationSeconds}s`;

      let emails: string[] = [user.email!];
      if (participantIds && participantIds.length > 0) {
        const uniqueIds = Array.from(new Set(participantIds));
        for (const pid of uniqueIds) {
          if (pid === user.id) continue;
          try {
            const { data: { user: pUser } } = await adminClient.auth.admin.getUserById(pid);
            if (pUser?.email) emails.push(pUser.email);
          } catch {}
        }
      }

      await Promise.allSettled(
        emails.map((recipient) =>
          resend.emails.send({
            from: process.env.RESEND_FROM_EMAIL!,
            to: recipient,
            subject: `Your Sona meeting summary — ${new Date().toLocaleDateString("en-US", { month: "short", day: "numeric" })}`,
            html: buildEmailHtml(firstName, durationLabel, summary, keyTopics, actionItems),
          })
        )
      );
    } catch (emailErr) {
      // Email failure should not block the response
      console.error("Email send error:", emailErr);
    }

    return Response.json({
      success: true,
      meetingId: meeting.id,
      summary,
      keyTopics,
      actionItems,
    });
  } catch (err) {
    console.error("Meeting end error:", err);
    return Response.json({ error: "Failed to process meeting end" }, { status: 500 });
  }
}

function buildEmailHtml(
  name: string,
  duration: string,
  summary: string,
  topics: string[],
  actions: ActionItem[]
) {
  const topicsHtml = topics
    .map(
      (t) =>
        `<span style="display:inline-block;background:#0d1f12;border:1px solid #1e4d2b;border-radius:999px;padding:3px 12px;font-size:12px;color:#22c55e;margin:0 4px 4px 0">${t}</span>`
    )
    .join("");

  const actionsHtml = actions.length
    ? actions
        .map(
          (a) => `<tr>
            <td style="padding:10px 0;border-bottom:1px solid #1e2230;font-size:14px;color:#c8ccd8">${a.text}</td>
            <td style="padding:10px 12px;border-bottom:1px solid #1e2230;font-size:13px;color:#22c55e;white-space:nowrap">${a.owner}</td>
            <td style="padding:10px 0;border-bottom:1px solid #1e2230;font-size:13px;color:#555b6e;white-space:nowrap">${a.due}</td>
          </tr>`
        )
        .join("")
    : `<tr><td colspan="3" style="padding:12px 0;font-size:13px;color:#555b6e">No action items were detected in this meeting.</td></tr>`;

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://sona.app";

  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#0a0b0f;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif">
  <div style="max-width:600px;margin:0 auto;padding:40px 24px">
    <div style="margin-bottom:32px">
      <span style="font-size:22px;font-weight:900;color:#f0f1f5;letter-spacing:-0.02em">Sona</span>
      <span style="font-size:13px;color:#555b6e;margin-left:10px">Meeting Summary</span>
    </div>

    <h1 style="font-size:20px;font-weight:700;color:#f0f1f5;margin:0 0 6px">Hi ${name},</h1>
    <p style="font-size:14px;color:#8b909e;margin:0 0 32px">Here's your AI summary from today's Sona meeting (${duration}).</p>

    <div style="background:#12141a;border:1px solid #1e2230;border-radius:16px;padding:24px;margin-bottom:24px">
      <div style="font-size:11px;font-weight:600;color:#555b6e;letter-spacing:0.08em;text-transform:uppercase;margin-bottom:12px">AI Summary</div>
      <p style="font-size:14px;color:#c8ccd8;line-height:1.8;margin:0">${summary || "No summary available for this session."}</p>
    </div>

    ${
      topics.length
        ? `<div style="background:#12141a;border:1px solid #1e2230;border-radius:16px;padding:24px;margin-bottom:24px">
      <div style="font-size:11px;font-weight:600;color:#555b6e;letter-spacing:0.08em;text-transform:uppercase;margin-bottom:12px">Key Topics</div>
      <div>${topicsHtml}</div>
    </div>`
        : ""
    }

    <div style="background:#12141a;border:1px solid #1e2230;border-radius:16px;padding:24px;margin-bottom:32px">
      <div style="font-size:11px;font-weight:600;color:#555b6e;letter-spacing:0.08em;text-transform:uppercase;margin-bottom:12px">Action Items</div>
      <table style="width:100%;border-collapse:collapse">
        <thead>
          <tr>
            <th style="text-align:left;font-size:11px;color:#555b6e;font-weight:500;padding-bottom:8px">Task</th>
            <th style="text-align:left;font-size:11px;color:#555b6e;font-weight:500;padding-bottom:8px;padding-left:12px">Owner</th>
            <th style="text-align:left;font-size:11px;color:#555b6e;font-weight:500;padding-bottom:8px">Due</th>
          </tr>
        </thead>
        <tbody>${actionsHtml}</tbody>
      </table>
    </div>

    <p style="font-size:12px;color:#555b6e;text-align:center">
      Powered by Sona AI · Groq Whisper + LLaMA<br>
      <a href="${appUrl}/dashboard" style="color:#22c55e;text-decoration:none">View full transcript in dashboard →</a>
    </p>
  </div>
</body>
</html>`;
}
