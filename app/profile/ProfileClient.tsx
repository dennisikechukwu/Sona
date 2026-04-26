"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import type { TranscriptLine } from "@/lib/types";
import { Mic, Camera } from "lucide-react";
import ResponsiveStyles from "@/components/shared/ResponsiveStyles";

const IconMenu = () => (<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>);
const IconX = () => (<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>);

type ActionItem = { id: string; text: string; owner_name: string | null; due_date: string | null; done: boolean };
type Meeting = {
  id: string;
  room_id: string;
  title: string | null;
  started_at: string;
  ended_at: string | null;
  participant_count: number;
  transcripts: { lines: TranscriptLine[] }[] | null;
  summaries: { summary_text: string | null; key_topics: string[] }[] | null;
  action_items: ActionItem[] | null;
};

interface Props {
  user: { id: string; email: string };
  profile: { id: string; display_name: string | null; avatar_url: string | null } | null;
  meetings: Meeting[];
}

export default function ProfileClient({ user, profile, meetings }: Props) {
  const router = useRouter();
  const supabase = createClient();

  const [displayName, setDisplayName] = useState(profile?.display_name || user.email.split("@")[0]);
  const [avatarUrl, setAvatarUrl] = useState(profile?.avatar_url || null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [selectedMeeting, setSelectedMeeting] = useState<Meeting | null>(null);
  const [activeTab, setActiveTab] = useState<"transcript" | "summary" | "tasks">("transcript");

  // Refs for scrolling to a specific meeting
  const meetingRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const searchParams = useSearchParams();

  // Auto-select and scroll to a meeting from ?meeting= query param
  useEffect(() => {
    const meetingId = searchParams.get("meeting");
    if (meetingId) {
      const found = meetings.find((m) => m.id === meetingId);
      if (found) {
        setSelectedMeeting(found);
        // Wait for DOM to render the selected meeting, then scroll
        setTimeout(() => {
          const el = meetingRefs.current[meetingId];
          if (el) {
            el.scrollIntoView({ behavior: "smooth", block: "center" });
          }
        }, 300);
      }
    }
  }, [searchParams, meetings]);

  const initials = displayName.slice(0, 2).toUpperCase();

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  async function handleAvatarUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploadingAvatar(true);

      const img = new Image();
      img.src = URL.createObjectURL(file);
      await new Promise((res) => (img.onload = res));

      const size = 256;
      const canvas = document.createElement("canvas");
      canvas.width = size;
      canvas.height = size;
      const ctx = canvas.getContext("2d");
      
      const minDim = Math.min(img.width, img.height);
      const sx = (img.width - minDim) / 2;
      const sy = (img.height - minDim) / 2;

      ctx?.drawImage(img, sx, sy, minDim, minDim, 0, 0, size, size);

      const blob = await new Promise<Blob | null>((res) => canvas.toBlob(res, "image/webp", 0.8));
      if (!blob) throw new Error("Could not process image");

      const fileName = `${user.id}-${Date.now()}.webp`;
      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(fileName, blob, { contentType: "image/webp", upsert: true });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage.from("avatars").getPublicUrl(fileName);
      setAvatarUrl(publicUrl);

      const { error: updateError } = await supabase.from("profiles").update({ avatar_url: publicUrl }).eq("id", user.id);
      if (updateError) throw updateError;

      router.refresh();
    } catch (err) {
      console.error("Avatar upload failed:", err);
      alert("Failed to upload image.");
    } finally {
      setUploadingAvatar(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  async function saveProfile(e: React.SyntheticEvent) {
    e.preventDefault();
    setSaving(true);
    await supabase.from("profiles").update({ display_name: displayName }).eq("id", user.id);
    setSaved(true);
    setSaving(false);
    setTimeout(() => setSaved(false), 2000);
    router.refresh();
  }

  const [signingOut, setSigningOut] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const navRef = useRef<HTMLElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuOpen && navRef.current && !navRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [menuOpen]);

  async function signOut() {
    setSigningOut(true);
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  }

  function formatDate(iso: string) {
    return new Date(iso).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
  }

  function formatDuration(started: string, ended: string | null) {
    if (!ended) return "In progress";
    const ms = new Date(ended).getTime() - new Date(started).getTime();
    const m = Math.floor(ms / 60000);
    const h = Math.floor(m / 60);
    return h > 0 ? `${h}h ${m % 60}m` : `${m}m`;
  }

  return (
    <>
      <ResponsiveStyles />
      <div style={{ minHeight: "100vh", background: "var(--bg-base)" }}>

        {/* Nav */}
        <nav ref={navRef} style={{ borderBottom: "1px solid var(--border-subtle)", background: "var(--bg-surface)", position: "sticky", top: 0, zIndex: 10 }}>
          <div className="app-nav-inner">
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <a href="/dashboard" style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none" }}>
                <SonaLogo size={24} />
                <span style={{ fontFamily: "var(--font-serif)", fontWeight: 900, fontSize: "1.05rem", color: "var(--text-primary)" }}>Sona</span>
              </a>
              <span style={{ fontFamily: "var(--font-sans)", fontSize: "0.75rem", color: "var(--text-muted)" }}>/ Profile</span>
            </div>
            
            {/* Desktop right side */}
            <div className="app-nav-links">
              <button
                onClick={signOut}
                disabled={signingOut}
                style={{
                  background: signingOut ? "rgba(239,68,68,0.08)" : "rgba(239,68,68,0.12)",
                  border: "1px solid rgba(239,68,68,0.35)",
                  borderRadius: "var(--radius-md)",
                  padding: "6px 14px",
                  fontFamily: "var(--font-sans)",
                  fontSize: "0.8rem",
                  fontWeight: 600,
                  color: signingOut ? "rgba(239,68,68,0.5)" : "var(--red)",
                  cursor: signingOut ? "not-allowed" : "pointer",
                  transition: "all 0.2s",
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                }}
                onMouseEnter={(e) => { if (!signingOut) { e.currentTarget.style.background = "rgba(239,68,68,0.2)"; e.currentTarget.style.borderColor = "rgba(239,68,68,0.6)"; } }}
                onMouseLeave={(e) => { e.currentTarget.style.background = signingOut ? "rgba(239,68,68,0.08)" : "rgba(239,68,68,0.12)"; e.currentTarget.style.borderColor = "rgba(239,68,68,0.35)"; }}
              >
                {signingOut ? (
                  <>
                    <span style={{ width: 10, height: 10, border: "1.5px solid rgba(239,68,68,0.4)", borderTopColor: "var(--red)", borderRadius: "50%", animation: "spin 0.7s linear infinite", display: "inline-block" }} />
                    Signing out…
                  </>
                ) : "Sign out"}
              </button>
            </div>

            {/* Hamburger for Mobile */}
            <button
              className="app-nav-hamburger"
              onClick={() => setMenuOpen((v) => !v)}
              aria-label="Toggle menu"
            >
              {menuOpen ? <IconX /> : <IconMenu />}
            </button>
          </div>

          {/* Mobile drop-down */}
          <div className={`app-mobile-menu${menuOpen ? "" : " closed"}`}>
            <a href="/dashboard" className="app-mobile-link" onClick={() => setMenuOpen(false)}>
              Back to Dashboard
            </a>
            <button 
              onClick={() => { setMenuOpen(false); signOut(); }}
              disabled={signingOut}
              className="app-mobile-link"
              style={{ width: "100%", background: "none", border: "none", color: "var(--red)", textAlign: "left", cursor: "pointer" }}
            >
              {signingOut ? "Signing out..." : "Sign out"}
            </button>
          </div>
        </nav>

        <main className="profile-main" style={{ maxWidth: 900, margin: "0 auto", padding: "2.5rem 1.5rem" }}>
          <div className="profile-grid">

            {/* Left: Profile card */}
            <div className="profile-left-panel" style={{ background: "var(--bg-surface)", border: "1px solid var(--border-default)", borderRadius: "var(--radius-xl)", padding: "1.75rem", position: "sticky", top: 76 }}>
              <div style={{ textAlign: "center", marginBottom: "1.5rem" }}>
                <div style={{ position: "relative", width: 72, height: 72, margin: "0 auto 0.875rem" }}>
                  <div 
                    onClick={() => fileInputRef.current?.click()}
                    onMouseEnter={(e) => { const overlay = e.currentTarget.querySelector('.avatar-overlay') as HTMLElement; if (overlay) overlay.style.opacity = '1'; }}
                    onMouseLeave={(e) => { const overlay = e.currentTarget.querySelector('.avatar-overlay') as HTMLElement; if (overlay) overlay.style.opacity = '0'; }}
                    style={{ width: "100%", height: "100%", borderRadius: "50%", background: "var(--accent-dim)", border: "2px solid rgba(34,197,94,0.3)", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "var(--font-serif)", fontWeight: 700, fontSize: "1.5rem", color: "var(--accent)", cursor: "pointer", position: "relative", overflow: "hidden" }}
                  >
                    {uploadingAvatar ? (
                      <span style={{ width: 24, height: 24, border: "2px solid rgba(34,197,94,0.2)", borderTopColor: "var(--accent)", borderRadius: "50%", animation: "spin 0.7s linear infinite", display: "inline-block" }} />
                    ) : avatarUrl ? (
                      <img src={avatarUrl} alt="Avatar" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    ) : initials}
                    
                    {!uploadingAvatar && (
                      <div className="avatar-overlay" style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.6)", display: "flex", alignItems: "center", justifyContent: "center", opacity: 0, transition: "opacity 0.2s" }}>
                        <span style={{ fontSize: "0.6rem", color: "#fff", fontFamily: "var(--font-sans)", fontWeight: 600 }}>UPLOAD</span>
                      </div>
                    )}
                  </div>

                  {/* Camera Badge */}
                  <div 
                    onClick={() => fileInputRef.current?.click()}
                    style={{ position: "absolute", bottom: 0, left: 0, width: 22, height: 22, borderRadius: "50%", background: "var(--bg-elevated)", border: "1px solid var(--border-default)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--text-muted)", cursor: "pointer", boxShadow: "0 2px 4px rgba(0,0,0,0.2)", zIndex: 2, transition: "color 0.2s" }}
                    onMouseEnter={(e) => (e.currentTarget.style.color = "var(--text-primary)")}
                    onMouseLeave={(e) => (e.currentTarget.style.color = "var(--text-muted)")}
                    title="Upload profile picture"
                  >
                    <Camera size={11} strokeWidth={2.5} />
                  </div>
                </div>
                <input type="file" ref={fileInputRef} accept="image/*" style={{ display: "none" }} onChange={handleAvatarUpload} />
                <div style={{ fontFamily: "var(--font-sans)", fontSize: "0.78rem", color: "var(--text-muted)" }}>{user.email}</div>
              </div>

            <form onSubmit={saveProfile}>
              <label style={{ display: "block", fontFamily: "var(--font-sans)", fontSize: "0.75rem", color: "var(--text-secondary)", marginBottom: "0.4rem", fontWeight: 500 }}>
                Display name
              </label>
              <input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                style={{ width: "100%", background: "var(--bg-elevated)", border: "1px solid var(--border-default)", borderRadius: "var(--radius-md)", padding: "0.65rem 0.75rem", color: "var(--text-primary)", fontFamily: "var(--font-sans)", fontSize: "0.85rem", outline: "none", boxSizing: "border-box", marginBottom: "0.875rem", transition: "border-color 0.2s" }}
                onFocus={(e) => (e.target.style.borderColor = "var(--accent)")}
                onBlur={(e) => (e.target.style.borderColor = "var(--border-default)")}
              />
              <button
                type="submit"
                disabled={saving}
                style={{ width: "100%", background: saved ? "var(--accent-dim)" : "var(--accent)", color: saved ? "var(--accent)" : "#000", border: saved ? "1px solid rgba(34,197,94,0.3)" : "none", borderRadius: "var(--radius-md)", padding: "0.65rem", fontFamily: "var(--font-sans)", fontSize: "0.85rem", fontWeight: 700, cursor: "pointer", transition: "all 0.2s" }}
              >
                {saving ? "Saving…" : saved ? "✓ Saved" : "Save changes"}
              </button>
            </form>

            <div style={{ marginTop: "1.5rem", paddingTop: "1.5rem", borderTop: "1px solid var(--border-subtle)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.5rem" }}>
                <span style={{ fontFamily: "var(--font-sans)", fontSize: "0.78rem", color: "var(--text-muted)" }}>Total meetings</span>
                <span style={{ fontFamily: "var(--font-sans)", fontSize: "0.78rem", color: "var(--text-primary)", fontWeight: 600 }}>{meetings.length}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ fontFamily: "var(--font-sans)", fontSize: "0.78rem", color: "var(--text-muted)" }}>Completed</span>
                <span style={{ fontFamily: "var(--font-sans)", fontSize: "0.78rem", color: "var(--text-primary)", fontWeight: 600 }}>{meetings.filter((m) => m.ended_at).length}</span>
              </div>
            </div>
          </div>

          {/* Right: Meeting history */}
          <div>
            <h2 style={{ fontFamily: "var(--font-serif)", fontWeight: 700, fontSize: "1.2rem", color: "var(--text-primary)", marginBottom: "1.25rem", letterSpacing: "-0.01em" }}>
              Meeting history
            </h2>

            {meetings.length === 0 ? (
              <div style={{ background: "var(--bg-surface)", border: "1px dashed var(--border-default)", borderRadius: "var(--radius-lg)", padding: "3rem", textAlign: "center" }}>
                <div style={{ marginBottom: "0.75rem", display: "flex", justifyContent: "center" }}>
                  <Mic size={32} color="var(--text-muted)" />
                </div>
                <div style={{ fontFamily: "var(--font-sans)", fontSize: "0.875rem", color: "var(--text-muted)" }}>No meetings yet. Start your first one from the dashboard.</div>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "0.875rem" }}>
                {meetings.map((m) => (
                  <div key={m.id} ref={(el) => { meetingRefs.current[m.id] = el; }}>
                    <button
                      onClick={() => setSelectedMeeting(selectedMeeting?.id === m.id ? null : m)}
                      style={{ width: "100%", textAlign: "left", background: selectedMeeting?.id === m.id ? "var(--bg-elevated)" : "var(--bg-surface)", border: `1px solid ${selectedMeeting?.id === m.id ? "rgba(34,197,94,0.3)" : "var(--border-subtle)"}`, borderRadius: "var(--radius-lg)", padding: "1.1rem 1.25rem", cursor: "pointer", transition: "all 0.2s", display: "flex", alignItems: "center", justifyContent: "space-between", gap: "0.5rem", flexWrap: "wrap" }}
                      onMouseEnter={(e) => { if (selectedMeeting?.id !== m.id) { (e.currentTarget as HTMLElement).style.borderColor = "rgba(34,197,94,0.2)"; (e.currentTarget as HTMLElement).style.background = "var(--bg-elevated)"; } }}
                      onMouseLeave={(e) => { if (selectedMeeting?.id !== m.id) { (e.currentTarget as HTMLElement).style.borderColor = "var(--border-subtle)"; (e.currentTarget as HTMLElement).style.background = "var(--bg-surface)"; } }}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: "0.875rem" }}>
                        <div style={{ width: 38, height: 38, borderRadius: "var(--radius-md)", background: "var(--accent-dim)", border: "1px solid rgba(34,197,94,0.2)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                          <Mic size={18} color="var(--accent)" />
                        </div>
                        <div>
                          <div style={{ fontFamily: "var(--font-sans)", fontWeight: 600, fontSize: "0.875rem", color: "var(--text-primary)" }}>
                            {m.title || `Meeting · ${m.room_id}`}
                          </div>
                          <div style={{ fontFamily: "var(--font-sans)", fontSize: "0.75rem", color: "var(--text-muted)", marginTop: 2 }}>
                            {formatDate(m.started_at)} · {formatDuration(m.started_at, m.ended_at)}
                          </div>
                        </div>
                      </div>
                      <span style={{ fontFamily: "var(--font-sans)", fontSize: "0.72rem", color: "var(--accent)" }}>
                        {selectedMeeting?.id === m.id ? "▲ Close" : "▼ View"}
                      </span>
                    </button>

                    {/* Expanded meeting detail */}
                    {selectedMeeting?.id === m.id && (
                      <div style={{ background: "var(--bg-elevated)", border: "1px solid rgba(34,197,94,0.2)", borderTop: "none", borderRadius: "0 0 var(--radius-lg) var(--radius-lg)", animation: "fadeIn 0.2s ease" }}>
                        {/* Tabs */}
                        <div style={{ display: "flex", borderBottom: "1px solid var(--border-subtle)" }}>
                          {(["transcript", "summary", "tasks"] as const).map((tab) => (
                            <button key={tab} onClick={() => setActiveTab(tab)} style={{ flex: 1, padding: "0.65rem 0.25rem", background: "none", border: "none", borderBottom: activeTab === tab ? "2px solid var(--accent)" : "2px solid transparent", color: activeTab === tab ? "var(--accent)" : "var(--text-muted)", fontFamily: "var(--font-sans)", fontSize: "0.75rem", fontWeight: activeTab === tab ? 600 : 400, cursor: "pointer", textTransform: "capitalize" }}>
                              {tab === "tasks" ? "Action items" : tab}
                            </button>
                          ))}
                        </div>

                        <div style={{ padding: "1.25rem", maxHeight: 400, overflowY: "auto" }}>
                          {activeTab === "transcript" && (
                            <div>
                              {m.transcripts?.[0]?.lines?.length ? (
                                m.transcripts[0].lines.map((line, i) => (
                                  <div key={i} style={{ marginBottom: "0.875rem" }}>
                                    <div style={{ fontFamily: "var(--font-sans)", fontSize: "0.68rem", color: "var(--accent)", fontWeight: 600, marginBottom: 2 }}>{line.speaker} · {line.time}</div>
                                    <div style={{ fontFamily: "var(--font-sans)", fontSize: "0.82rem", color: "var(--text-primary)", lineHeight: 1.65, fontWeight: 300 }}>{line.text}</div>
                                  </div>
                                ))
                              ) : (
                                <div style={{ fontFamily: "var(--font-sans)", fontSize: "0.8rem", color: "var(--text-muted)" }}>No transcript available.</div>
                              )}
                            </div>
                          )}

                          {activeTab === "summary" && (
                            <div>
                              {m.summaries?.[0] ? (
                                <>
                                  <p style={{ fontFamily: "var(--font-sans)", fontSize: "0.875rem", color: "var(--text-secondary)", lineHeight: 1.75, fontWeight: 300, margin: "0 0 1rem" }}>{m.summaries[0].summary_text}</p>
                                  {m.summaries[0].key_topics?.length > 0 && (
                                    <div>
                                      <div style={{ fontFamily: "var(--font-sans)", fontSize: "0.68rem", color: "var(--text-muted)", letterSpacing: "0.08em", fontWeight: 600, textTransform: "uppercase", marginBottom: "0.5rem" }}>Key topics</div>
                                      {m.summaries[0].key_topics.map((t, i) => (
                                        <span key={i} style={{ display: "inline-block", background: "var(--bg-overlay)", border: "1px solid var(--border-default)", borderRadius: "var(--radius-full)", padding: "3px 10px", fontSize: "0.72rem", fontFamily: "var(--font-sans)", color: "var(--text-secondary)", margin: "0 4px 4px 0" }}>{t}</span>
                                      ))}
                                    </div>
                                  )}
                                </>
                              ) : (
                                <div style={{ fontFamily: "var(--font-sans)", fontSize: "0.8rem", color: "var(--text-muted)" }}>No summary available.</div>
                              )}
                            </div>
                          )}

                          {activeTab === "tasks" && (
                            <div>
                              {m.action_items?.length ? (
                                m.action_items.map((item) => (
                                  <div key={item.id} style={{ display: "flex", gap: 10, marginBottom: "0.75rem", padding: "0.75rem", background: "var(--bg-overlay)", border: "1px solid var(--border-subtle)", borderRadius: "var(--radius-md)", opacity: item.done ? 0.5 : 1 }}>
                                    <div style={{ width: 16, height: 16, borderRadius: 4, border: `1.5px solid ${item.done ? "var(--accent)" : "var(--border-strong)"}`, background: item.done ? "var(--accent)" : "transparent", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.6rem", color: "#fff", flexShrink: 0, marginTop: 1 }}>
                                      {item.done ? "✓" : ""}
                                    </div>
                                    <div>
                                      <div style={{ fontFamily: "var(--font-sans)", fontSize: "0.8rem", color: "var(--text-primary)", fontWeight: 400, textDecoration: item.done ? "line-through" : "none" }}>{item.text}</div>
                                      <div style={{ marginTop: 3, fontFamily: "var(--font-sans)", fontSize: "0.68rem", color: "var(--text-muted)" }}>
                                        {item.owner_name && <span style={{ color: "var(--accent)", marginRight: 8 }}>{item.owner_name}</span>}
                                        {item.due_date && `Due: ${item.due_date}`}
                                      </div>
                                    </div>
                                  </div>
                                ))
                              ) : (
                                <div style={{ fontFamily: "var(--font-sans)", fontSize: "0.8rem", color: "var(--text-muted)" }}>No action items were detected.</div>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
    </>
  );
}

function SonaLogo({ size = 28 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 28 28" fill="none">
      <circle cx="14" cy="14" r="13" fill="var(--accent)" opacity="0.12" />
      <circle cx="14" cy="14" r="9" fill="var(--accent)" opacity="0.22" />
      <circle cx="14" cy="14" r="5" fill="var(--accent)" opacity="0.5" />
      <circle cx="14" cy="14" r="2.5" fill="var(--accent)" />
    </svg>
  );
}
