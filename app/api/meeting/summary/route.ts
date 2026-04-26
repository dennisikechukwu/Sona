import { createServiceClient } from "@/lib/supabase/server";
import { createClient } from "@/lib/supabase/server";

/**
 * GET /api/meeting/summary?roomId=xxx
 *
 * Polls for the AI summary of a meeting.
 * Returns the summary, key topics, and action items if ready.
 * Returns { ready: false } if still processing.
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const roomId = searchParams.get("roomId");

  if (!roomId) {
    return Response.json({ error: "roomId required" }, { status: 400 });
  }

  // Auth check
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const adminClient = createServiceClient();

  // Find the meeting
  const { data: meeting } = await adminClient
    .from("meetings")
    .select("id")
    .eq("room_id", roomId)
    .single();

  if (!meeting) {
    return Response.json({ ready: false });
  }

  // Check if summary exists
  const { data: summary } = await adminClient
    .from("summaries")
    .select("summary_text, key_topics")
    .eq("meeting_id", meeting.id)
    .single();

  if (!summary) {
    return Response.json({ ready: false });
  }

  // Fetch action items
  const { data: actionItems } = await adminClient
    .from("action_items")
    .select("text, owner_name, due_date, done")
    .eq("meeting_id", meeting.id);

  return Response.json({
    ready: true,
    summary: summary.summary_text || "",
    keyTopics: summary.key_topics || [],
    actionItems: (actionItems || []).map((a) => ({
      text: a.text,
      owner: a.owner_name || "Unknown",
      due: a.due_date || "TBD",
      done: a.done,
    })),
  });
}
