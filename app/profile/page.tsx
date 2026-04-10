export const dynamic = "force-dynamic";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import ProfileClient from "./ProfileClient";

export default async function ProfilePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth");

  const [profileRes, meetingsRes] = await Promise.all([
    supabase.from("profiles").select("*").eq("id", user.id).single(),
    supabase
      .from("meetings")
      .select(`
        id, room_id, title, started_at, ended_at, participant_count,
        transcripts(lines),
        summaries(summary_text, key_topics),
        action_items(id, text, owner_name, due_date, done)
      `)
      .eq("host_id", user.id)
      .order("started_at", { ascending: false })
      .limit(30),
  ]);

  return (
    <ProfileClient
      user={{ id: user.id, email: user.email ?? "" }}
      profile={profileRes.data}
      meetings={meetingsRes.data ?? []}
    />
  );
}
