"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Eye, EyeOff } from "lucide-react";

export default function AuthPage() {
  return (
    <Suspense fallback={<div style={{ minHeight: "100vh", background: "var(--bg-base)" }} />}>
      <AuthForm />
    </Suspense>
  );
}

function AuthForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get("next") || "/dashboard";

  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const supabase = createClient();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { full_name: name },
            emailRedirectTo: `${window.location.origin}/auth/callback`,
          },
        });
        if (error) throw error;
        setMode("signin");
        setPassword("");
        setSuccess("Account created! Check your email to confirm, then sign in below.");
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        router.push(next);
        router.refresh();
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{
      minHeight: "100vh",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      background: "var(--bg-base)",
      padding: "1.5rem",
    }}>
      <div style={{ width: "100%", maxWidth: "420px" }}>

        {/* Logo */}
        <div style={{ textAlign: "center", marginBottom: "2.5rem" }}>
          <a href="/" style={{ display: "inline-flex", alignItems: "center", gap: "10px", textDecoration: "none" }}>
            <SonaLogo size={32} />
            <span style={{
              fontFamily: "var(--font-serif)",
              fontSize: "1.5rem",
              fontWeight: 900,
              color: "var(--text-primary)",
              letterSpacing: "-0.02em",
            }}>Sona</span>
          </a>
          <p style={{
            fontFamily: "var(--font-sans)",
            fontSize: "0.875rem",
            color: "var(--text-muted)",
            marginTop: "0.5rem",
          }}>
            {mode === "signin" ? "Welcome back" : "Create your free account"}
          </p>
        </div>

        {/* Card */}
        <div style={{
          background: "var(--bg-surface)",
          border: "1px solid var(--border-default)",
          borderRadius: "var(--radius-xl)",
          padding: "2rem",
        }}>

          {/* Mode toggle */}
          <div style={{
            display: "flex",
            background: "var(--bg-elevated)",
            borderRadius: "var(--radius-md)",
            padding: "4px",
            marginBottom: "1.75rem",
          }}>
            {(["signin", "signup"] as const).map((m) => (
              <button
                key={m}
                onClick={() => { setMode(m); setError(""); setSuccess(""); }}
                style={{
                  flex: 1,
                  padding: "0.5rem",
                  borderRadius: "calc(var(--radius-md) - 2px)",
                  border: "none",
                  background: mode === m ? "var(--bg-overlay)" : "transparent",
                  color: mode === m ? "var(--text-primary)" : "var(--text-muted)",
                  fontFamily: "var(--font-sans)",
                  fontSize: "0.85rem",
                  fontWeight: mode === m ? 600 : 400,
                  cursor: "pointer",
                  transition: "all 0.2s",
                }}
              >
                {m === "signin" ? "Sign in" : "Sign up"}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            {mode === "signup" && (
              <div>
                <label style={labelStyle}>Full name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ada Kalu"
                  required
                  style={inputStyle}
                  onFocus={(e) => (e.target.style.borderColor = "var(--accent)")}
                  onBlur={(e) => (e.target.style.borderColor = "var(--border-default)")}
                />
              </div>
            )}

            <div>
              <label style={labelStyle}>Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@company.com"
                required
                style={inputStyle}
                onFocus={(e) => (e.target.style.borderColor = "var(--accent)")}
                onBlur={(e) => (e.target.style.borderColor = "var(--border-default)")}
              />
            </div>

            <div>
              <label style={labelStyle}>Password</label>
              <div style={{ position: "relative" }}>
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="········"
                  required
                  minLength={6}
                  style={{ ...inputStyle, paddingRight: "40px" }}
                  onFocus={(e) => (e.target.style.borderColor = "var(--accent)")}
                  onBlur={(e) => (e.target.style.borderColor = "var(--border-default)")}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: "absolute",
                    right: "10px",
                    top: "50%",
                    transform: "translateY(-50%)",
                    background: "none",
                    border: "none",
                    color: "var(--text-muted)",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {error && (
              <div style={{
                background: "var(--red-dim)",
                border: "1px solid rgba(239,68,68,0.25)",
                borderRadius: "var(--radius-md)",
                padding: "0.65rem 0.875rem",
                fontFamily: "var(--font-sans)",
                fontSize: "0.82rem",
                color: "var(--red)",
              }}>
                {error}
              </div>
            )}

            {success && (
              <div style={{
                background: "var(--accent-dim)",
                border: "1px solid rgba(34,197,94,0.25)",
                borderRadius: "var(--radius-md)",
                padding: "0.65rem 0.875rem",
                fontFamily: "var(--font-sans)",
                fontSize: "0.82rem",
                color: "var(--accent)",
              }}>
                {success}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              style={{
                width: "100%",
                background: loading ? "var(--bg-elevated)" : "var(--accent)",
                color: loading ? "var(--text-muted)" : "#000",
                border: "none",
                borderRadius: "var(--radius-md)",
                padding: "0.875rem",
                fontFamily: "var(--font-sans)",
                fontSize: "0.9rem",
                fontWeight: 700,
                cursor: loading ? "not-allowed" : "pointer",
                transition: "all 0.2s",
                marginTop: "0.25rem",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "8px"
              }}
            >
              {loading ? (
                <>
                  <svg className="auth-spinner" width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ animation: "spin 1s linear infinite" }}>
                    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeDasharray="31.4 31.4" opacity="0.3"></circle>
                    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeDasharray="31.4 31.4" strokeDashoffset="31.4"></circle>
                  </svg>
                  <style>{`@keyframes spin { 100% { transform: rotate(360deg); } }`}</style>
                  <span>Please wait…</span>
                </>
              ) : mode === "signin" ? (
                "Sign in to Sona"
              ) : (
                "Create account"
              )}
            </button>
          </form>
        </div>

        <p style={{
          textAlign: "center",
          fontFamily: "var(--font-sans)",
          fontSize: "0.75rem",
          color: "var(--text-muted)",
          marginTop: "1.5rem",
        }}>
          By continuing you agree to our{" "}
          <a href="#" style={{ color: "var(--text-secondary)", textDecoration: "none" }}>Terms</a> and{" "}
          <a href="#" style={{ color: "var(--text-secondary)", textDecoration: "none" }}>Privacy Policy</a>.
        </p>
      </div>
    </div>
  );
}

const labelStyle: React.CSSProperties = {
  display: "block",
  fontFamily: "var(--font-sans)",
  fontSize: "0.78rem",
  color: "var(--text-secondary)",
  marginBottom: "0.4rem",
  fontWeight: 500,
};

const inputStyle: React.CSSProperties = {
  width: "100%",
  background: "var(--bg-elevated)",
  border: "1px solid var(--border-default)",
  borderRadius: "var(--radius-md)",
  padding: "0.75rem 0.875rem",
  color: "var(--text-primary)",
  fontFamily: "var(--font-sans)",
  fontSize: "0.875rem",
  outline: "none",
  transition: "border-color 0.2s",
  boxSizing: "border-box",
};

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
