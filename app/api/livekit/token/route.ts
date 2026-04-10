import { AccessToken } from "livekit-server-sdk";
import { createClient, createServiceClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const room = searchParams.get("room");

  if (!room) {
    return Response.json({ error: "room is required" }, { status: 400 });
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const profileRes = await supabase
    .from("profiles")
    .select("display_name")
    .eq("id", user.id)
    .single();

  const identity = user.id;
  const profileName = (profileRes.data as { display_name: string | null } | null)?.display_name;
  const name = profileName || user.email?.split("@")[0] || "Guest";

  const adminSupa = await createServiceClient();
  const meetingRes = await adminSupa
    .from("meetings")
    .select("host_id")
    .eq("room_id", room)
    .limit(1)
    .maybeSingle();

  let isHost = false;

  if (meetingRes.data) {
    // If the meeting already exists, evaluate if they are the host.
    isHost = meetingRes.data.host_id === user.id;
  } else {
    // If no meeting exists yet, the very first person to hit this endpoint for the room
    // claims the room. We confidently use the Service Client to bypass any RLS hurdles that
    // were previously causing silent client-side `upsert` failures.
    isHost = true;
    await adminSupa.from("meetings").insert({
      room_id: room,
      host_id: user.id,
      started_at: new Date().toISOString()
    });
  }

  const at = new AccessToken(
    process.env.LIVEKIT_API_KEY!,
    process.env.LIVEKIT_API_SECRET!,
    { identity, name }
  );

  at.addGrant({
    roomJoin: true,
    room,
    canPublish: true,
    canSubscribe: true,
    canPublishData: true,
  });

  const token = await at.toJwt();
  return Response.json({ token, identity, name, isHost });
}
