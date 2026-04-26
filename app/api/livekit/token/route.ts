import { AccessToken } from "livekit-server-sdk";
import { createClient, createServiceClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const room = searchParams.get("room");

  if (!room) {
    return Response.json({ error: "room is required" }, { status: 400 });
  }

  const guestName = searchParams.get("guestName");

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  let identity = "";
  let name = "";
  let avatarUrl = "";

  if (user) {
    // Authenticated Flow
    const profileRes = await supabase
      .from("profiles")
      .select("display_name, avatar_url")
      .eq("id", user.id)
      .single();

    identity = user.id;
    const profileData = profileRes.data as { display_name: string | null, avatar_url: string | null } | null;
    const profileName = profileData?.display_name;
    name = profileName || user.email?.split("@")[0] || "Host";
    avatarUrl = profileData?.avatar_url || "";
  } else if (guestName) {
    // Guest Flow
    identity = `guest_${Math.random().toString(36).substring(2, 9)}`;
    name = guestName.slice(0, 32); // Max 32 chars
  } else {
    return Response.json({ error: "Unauthorized. Please join with a name." }, { status: 401 });
  }

  const adminSupa = createServiceClient();
  const meetingRes = await adminSupa
    .from("meetings")
    .select("host_id")
    .eq("room_id", room)
    .limit(1)
    .maybeSingle();

  let isHost = false;

  if (meetingRes.data) {
    // If the meeting already exists, evaluate if they are the host.
    isHost = meetingRes.data.host_id === user?.id;
  } else if (user) {
    // If no meeting exists yet, an authenticated user claims it fallback.
    isHost = true;
    await adminSupa.from("meetings").insert({
      room_id: room,
      host_id: user.id,
      started_at: new Date().toISOString()
    });
  } else {
    // A guest entered a non-existent room URL. Default to guest.
    isHost = false;
  }

  const at = new AccessToken(
    process.env.LIVEKIT_API_KEY!,
    process.env.LIVEKIT_API_SECRET!,
    { identity, name, metadata: JSON.stringify({ avatar_url: avatarUrl }) }
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
