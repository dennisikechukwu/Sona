export const dynamic = "force-dynamic";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import DashboardClient from "./DashboardClient";

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth");

  const [profileRes, meetingsRes] = await Promise.all([
    supabase.from("profiles").select("*").eq("id", user.id).single(),
    supabase
      .from("meetings")
      .select("id, room_id, title, started_at, ended_at, participant_count")
      .eq("host_id", user.id)
      .order("started_at", { ascending: false })
      .limit(20),
  ]);

  return (
    <DashboardClient
      user={{ id: user.id, email: user.email ?? "" }}
      profile={profileRes.data}
      meetings={meetingsRes.data ?? []}
    />
  );
}
