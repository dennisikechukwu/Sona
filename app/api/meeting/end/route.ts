import { Client } from "@upstash/qstash";
import { createClient, createServiceClient } from "@/lib/supabase/server";
import { createRateLimiter } from "@/lib/ratelimit";
import type { TranscriptLine } from "@/lib/types";

// ─── QStash client (publishes background jobs) ───────────────────────────────
const qstash = new Client({ token: process.env.QSTASH_TOKEN! });

/**
 * POST /api/meeting/end
 *
 * FAST PATH — this is what the host's browser awaits.
 * It does only three things:
 *   1. Validate the host
 *   2. Save transcript + update meeting row
 *   3. Publish a QStash message so AI summarisation happens in the background
 *
 * Total latency: ~200ms (no Groq, no Resend, no blocking)
 */
export async function POST(request: Request) {
  try {
    // ── Rate limit ────────────────────────────────────────────────────────────
    const ip = request.headers.get("x-forwarded-for") ?? "anonymous";
    const ratelimit = createRateLimiter();
    const { success } = await ratelimit.limit(`summarize_${ip}`);

    if (!success) {
      return Response.json({ error: "Rate limit exceeded. Too many summaries." }, { status: 429 });
    }

    // ── Auth ──────────────────────────────────────────────────────────────────
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });

    // ── Parse body ────────────────────────────────────────────────────────────
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

    // ── 1. Verify host ownership ──────────────────────────────────────────────
    const adminClient = createServiceClient();

    const { data: meetingCheck } = await adminClient
      .from("meetings")
      .select("host_id")
      .eq("room_id", roomId)
      .single();

    if (meetingCheck?.host_id !== user.id) {
      return Response.json({ error: "Only the host can officially end meetings" }, { status: 403 });
    }

    // ── 2. Update meeting record ──────────────────────────────────────────────
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

    // ── 3. Save transcript (fast Supabase insert) ─────────────────────────────
    if (lines?.length) {
      await adminClient.from("transcripts").delete().eq("meeting_id", meeting.id);
      const { error: transcriptError } = await adminClient
        .from("transcripts")
        .insert({ meeting_id: meeting.id, lines });
      if (transcriptError) {
        console.error("Transcript save error:", transcriptError);
      }
    }

    // ── 4. Dispatch background processing ───────────────────────────────────
    // Production: QStash calls the webhook (auto-retries, signed requests)
    // Local dev:  QStash can't reach localhost, so we call the webhook directly
    if (lines?.length) {
      const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
      const isLocalhost = appUrl.includes("localhost") || appUrl.includes("127.0.0.1");
      const payload = {
        meetingId: meeting.id,
        hostId: user.id,
        lines,
        durationSeconds,
        participantIds,
      };

      if (isLocalhost) {
        // Local dev: call the webhook directly (non-blocking — we don't await it)
        fetch(`${appUrl}/api/webhooks/process-summary`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }).then(() => {
          console.log(`[Dev] process-summary called for meeting ${meeting.id}`);
        }).catch((err) => {
          console.error("[Dev] process-summary call failed:", err);
        });
      } else {
        // Production: use QStash (auto-retries 3x, signed, background)
        try {
          await qstash.publishJSON({
            url: `${appUrl}/api/webhooks/process-summary`,
            body: payload,
            retries: 3,
          });
          console.log(`[QStash] Published process-summary job for meeting ${meeting.id}`);
        } catch (qstashErr) {
          // QStash publish failure should NOT block the host.
          // The transcript is already saved — summary can be regenerated later.
          console.error("[QStash] Publish failed (transcript is safe):", qstashErr);
        }
      }
    }

    // ── 5. Return instantly ───────────────────────────────────────────────────
    return Response.json({
      success: true,
      meetingId: meeting.id,
      // No summary/keyTopics/actionItems — those are generated in the background
    });
  } catch (err) {
    console.error("Meeting end error:", err);
    return Response.json({ error: "Failed to process meeting end" }, { status: 500 });
  }
}
