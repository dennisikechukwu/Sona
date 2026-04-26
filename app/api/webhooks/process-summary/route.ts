import { Receiver } from "@upstash/qstash";
import Groq from "groq-sdk";
import { Resend } from "resend";
import { createServiceClient } from "@/lib/supabase/server";
import type { TranscriptLine, ActionItem } from "@/lib/types";

// ─── Clients ──────────────────────────────────────────────────────────────────
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
const resend = new Resend(process.env.RESEND_API_KEY);

const receiver = new Receiver({
  currentSigningKey: process.env.QSTASH_CURRENT_SIGNING_KEY!,
  nextSigningKey: process.env.QSTASH_NEXT_SIGNING_KEY!,
});

// ─── Payload shape from QStash ────────────────────────────────────────────────
interface ProcessSummaryPayload {
  meetingId: string;
  hostId: string;
  lines: TranscriptLine[];
  durationSeconds: number;
  participantIds: string[];
}

/**
 * POST /api/webhooks/process-summary
 *
 * BACKGROUND WORKER — called by QStash, NOT by the browser.
 * This runs asynchronously after the host has already closed the room.
 *
 * Steps:
 *   1. Verify QStash signature (security)
 *   2. Generate AI summary via Groq
 *   3. Save summary + action items to Supabase
 *   4. Send summary emails to all participants via Resend
 */
export async function POST(request: Request) {
  // ── 0. Verify QStash signature ────────────────────────────────────────────
  const body = await request.text();

  // In development (localhost), QStash can't reach your machine — skip verification
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const isLocalhost = appUrl.includes("localhost") || appUrl.includes("127.0.0.1");

  if (!isLocalhost) {
    const signature = request.headers.get("upstash-signature");
    if (!signature) {
      console.error("[process-summary] Missing QStash signature");
      return new Response("Unauthorized", { status: 401 });
    }

    try {
      await receiver.verify({ signature, body });
    } catch (err) {
      console.error("[process-summary] Invalid QStash signature:", err);
      return new Response("Unauthorized", { status: 401 });
    }
  }

  // ── 1. Parse payload ──────────────────────────────────────────────────────
  let payload: ProcessSummaryPayload;
  try {
    payload = JSON.parse(body);
  } catch {
    console.error("[process-summary] Invalid JSON body");
    return new Response("Bad Request", { status: 400 });
  }

  const { meetingId, hostId, lines, durationSeconds, participantIds } = payload;

  if (!meetingId || !lines?.length) {
    console.error("[process-summary] Missing meetingId or lines");
    return new Response("Bad Request", { status: 400 });
  }

  console.log(`[process-summary] Processing meeting ${meetingId} (${lines.length} lines)`);

  const adminClient = createServiceClient();

  // ── 2. Generate AI summary via Groq ───────────────────────────────────────
  let summary = "";
  let keyTopics: string[] = [];
  let actionItems: ActionItem[] = [];

  const transcriptText = lines
    .map((l) => `[${l.time}] ${l.speaker}: ${l.text}`)
    .join("\n");

  try {
    const completion = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content: `You are a meeting assistant. Analyze the transcript and return ONLY a valid JSON object. Every string value MUST be wrapped in double quotes. Do not include any text outside the JSON object.

The JSON object must have exactly these keys:
{
  "summary": "A 2-4 sentence summary of what was discussed and decided.",
  "key_topics": ["topic1", "topic2", "topic3"],
  "action_items": [{"text": "task description", "owner": "person name", "due": "date or TBD"}]
}

Rules:
- "summary" must be a valid JSON string (wrapped in double quotes, with special characters escaped).
- "key_topics" must be an array of 3-6 short strings (max 4 words each).
- "action_items" must be an array of objects. Only include items explicitly mentioned. Use "Unknown" for owner if not specified, "TBD" for due if no date mentioned. Return an empty array [] if no action items were discussed.
- Escape any apostrophes or special characters inside string values.`,
        },
        {
          role: "user",
          content: `Transcript:\n${transcriptText}`,
        },
      ],
      temperature: 0.2,
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
    console.error("[process-summary] Groq summarization error:", groqErr);
    summary = "AI summary could not be generated for this session.";
  }

  // ── 3. Save summary to Supabase ───────────────────────────────────────────
  await adminClient.from("summaries").delete().eq("meeting_id", meetingId);
  const { error: summaryError } = await adminClient.from("summaries").insert({
    meeting_id: meetingId,
    summary_text: summary || null,
    key_topics: keyTopics,
  });
  if (summaryError) console.error("[process-summary] Summary save error:", summaryError);

  // ── 4. Save action items to Supabase ──────────────────────────────────────
  await adminClient.from("action_items").delete().eq("meeting_id", meetingId);
  if (actionItems.length > 0) {
    const { error: actionError } = await adminClient.from("action_items").insert(
      actionItems.map((a) => ({
        meeting_id: meetingId,
        text: a.text,
        owner_name: a.owner,
        due_date: a.due,
      }))
    );
    if (actionError) console.error("[process-summary] Action items save error:", actionError);
  }

  // ── 5. Send summary emails via Resend ─────────────────────────────────────
  try {
    const { data: profile } = await adminClient
      .from("profiles")
      .select("display_name")
      .eq("id", hostId)
      .single();

    const { data: { user: hostUser } } = await adminClient.auth.admin.getUserById(hostId);
    const firstName = (
      profile?.display_name || hostUser?.email?.split("@")[0] || "there"
    ).split(" ")[0];

    const durationLabel =
      durationSeconds >= 60
        ? `${Math.floor(durationSeconds / 60)}m ${durationSeconds % 60}s`
        : `${durationSeconds}s`;

    // Gather all participant emails
    let emails: string[] = [];
    if (hostUser?.email) emails.push(hostUser.email);

    if (participantIds?.length) {
      const uniqueIds = Array.from(new Set(participantIds));
      for (const pid of uniqueIds) {
        if (pid === hostId) continue;
        try {
          const { data: { user: pUser } } = await adminClient.auth.admin.getUserById(pid);
          if (pUser?.email) emails.push(pUser.email);
        } catch { }
      }
    }

    if (emails.length > 0) {
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
      console.log(`[process-summary] Emails sent to ${emails.length} recipients`);
    }
  } catch (emailErr) {
    // Email failure should not cause QStash to retry
    console.error("[process-summary] Email send error:", emailErr);
  }

  console.log(`[process-summary] ✅ Completed for meeting ${meetingId}`);

  // Return 200 so QStash knows the job succeeded (no retry needed)
  return new Response("OK", { status: 200 });
}

// ─── Email template ───────────────────────────────────────────────────────────

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

    ${topics.length
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
      Powered by Sona AI · Groq Whisper<br>
      <a href="${appUrl}/dashboard" style="color:#22c55e;text-decoration:none">View full transcript in dashboard →</a>
    </p>
  </div>
</body>
</html>`;
}
