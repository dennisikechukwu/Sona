import { IconMic, IconZap, IconCheck, IconBot, IconLock, IconShare } from "./landing-icons";
import React from "react";

export const mockParticipants = [
  { name: "Ada Kalu",  initials: "AK", color: "#22c55e", speaking: true,  muted: false, bg: "linear-gradient(135deg,#0d1a12,#0a1410)" },
  { name: "James Obi", initials: "JO", color: "#3b82f6", speaking: false, muted: false, bg: "linear-gradient(135deg,#0d1220,#080e1a)" },
  { name: "Fatima N.", initials: "FN", color: "#f59e0b", speaking: false, muted: true,  bg: "linear-gradient(135deg,#1a1408,#12100a)" },
  { name: "You",       initials: "ME", color: "#8b5cf6", speaking: false, muted: false, bg: "linear-gradient(135deg,#120d1a,#0d0a14)" },
];

export const transcriptLines = [
  { speaker: "Ada K.",    time: "0:14", text: "The WebSocket reconnection issue — it drops after 30 seconds on mobile when the screen locks.", highlight: false },
  { speaker: "James O.",  time: "0:41", text: "We need exponential backoff and hook into the iOS app lifecycle events.", highlight: false },
  { speaker: "Ada K.",    time: "1:08", text: "Fatima, can you own the reconnection PR? We need this by Thursday EOD.", highlight: true },
  { speaker: "Fatima N.", time: "1:24", text: "Yes, I'll have a draft PR ready by Thursday end of day.", highlight: false },
  { speaker: "James O.",  time: "1:52", text: "I'll review it Friday morning before the design review.", highlight: false },
  { speaker: "Ada K.",    time: "2:10", text: "Move the design review to 11am — I have a conflict at 10.", highlight: true },
  { speaker: "James O.",  time: "2:18", text: "Done. Sending the updated calendar invite right after this call.", highlight: false },
];

export const features = [
  { icon: React.createElement(IconMic),   title: "Live transcription",    desc: "Every word from every speaker, captured in real time. Speaker-separated, timestamped, and fully searchable — forever." },
  { icon: React.createElement(IconZap),   title: "Instant AI summaries",  desc: "The moment your call ends, Sona delivers a clean structured summary. No waiting, no formatting required from you." },
  { icon: React.createElement(IconCheck), title: "Automatic action items", desc: "Sona detects every commitment, deadline, and follow-up and turns them into a clean task list — with owner names attached." },
  { icon: React.createElement(IconBot),   title: "AI co-pilot sidebar",   desc: "Ask Sona questions mid-call without interrupting. It has full context of everything said — a silent expert always in the room." },
  { icon: React.createElement(IconLock),  title: "Private by default",    desc: "Your calls are never used to train AI models. No third parties. Your recordings stay yours — encrypted, deletable on demand." },
  { icon: React.createElement(IconShare), title: "One-click sharing",     desc: "Share a summary, full transcript, or a specific highlight clip with anyone — formatted and readable in one click." },
];

export const steps = [
  { title: "Start or share a room",          desc: "Click 'Start a meeting' and instantly get a shareable link. Send it to anyone — no account needed to join. Works in any modern browser with zero install." },
  { title: "Talk. Sona listens silently.",   desc: "From the first word, Sona's AI transcribes in real time, identifies each speaker, highlights important moments, and tracks commitments as they're made." },
  { title: "Leave with everything.",         desc: "The moment you hang up, a full summary, timestamped transcript, and extracted action items are on your screen — and optionally in your inbox." },
];

export const problemPoints = [
  "Someone has to stop participating to take notes",
  "Key decisions get forgotten or misremembered later",
  "Action items scatter across Slack, email, and memory",
  "You spend 20 minutes writing a recap after every call",
  "Meeting recordings are saved but never actually watched",
  "New team members have no record of what was decided",
];

export const solutionPoints = [
  "Everyone stays fully present — Sona takes every note",
  "Every decision captured with context and timestamp",
  "Action items auto-extracted and assigned by name",
  "Your summary is ready before you've left your desk",
  "Full transcript is searchable, shareable, permanent",
  "New teammates can read the exact history of any decision",
];

export const testimonials = [
  { quote: "We used to spend 15 minutes after every standup writing a recap. Sona just does it. It's been three months and we've never gone back.", name: "Ada Kalu",     role: "Engineering Lead, Fluxwave",  initials: "AK", color: "#22c55e" },
  { quote: "The action item detection is scary good. It caught a commitment a client made that I completely forgot about. Saved a relationship.",     name: "Emeka Obi",   role: "Sales Director, Buildify",    initials: "EO", color: "#3b82f6" },
  { quote: "I have ADHD. Keeping track of long calls has always been my biggest challenge. Sona genuinely changed everything for me.",                 name: "Priya Sharma", role: "Product Manager, Orbit Labs", initials: "PS", color: "#f59e0b" },
  { quote: "Our investors asked for notes from our board meeting. I sent the Sona summary in 30 seconds. They were impressed.",                        name: "Olu Adeyemi", role: "CEO, Kova Systems",            initials: "OA", color: "#8b5cf6" },
];

export const pricing = [
  {
    name: "Free",  price: "$0",  period: " / forever",
    featured: false,
    desc: "Everything you need to get started. No time limit, no credit card.",
    features: ["Up to 40 min per meeting", "Live transcription", "AI summary per call", "10 meetings / month", "Browser-based, no install"],
    cta: "Start for free",
  },
  {
    name: "Pro",   price: "$12", period: " / month",
    featured: true,
    desc: "For individuals and small teams who meet every day.",
    features: ["Unlimited meeting length", "Unlimited meetings", "Action item detection", "AI co-pilot sidebar", "Searchable transcript history", "Email summaries after calls"],
    cta: "Start Pro free trial",
  },
  {
    name: "Team",  price: "$29", period: " / seat / mo",
    featured: false,
    desc: "For teams that need shared history and collaboration.",
    features: ["Everything in Pro", "Shared team workspace", "Team transcript search", "Custom AI summary templates", "Slack & Notion export", "Priority support"],
    cta: "Talk to us",
  },
];
