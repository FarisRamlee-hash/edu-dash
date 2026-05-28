"use client";

import { useEffect, useState } from "react";
import { Link2, FolderOpen, CheckCircle2, AlertCircle, Sparkles, Key } from "lucide-react";

type Settings = {
  connected: boolean;
  driveFolderId?: string;
  classroomCourseId?: string;
  courses?: Array<{ id: string; name: string }>;
};

export default function SettingsPage() {
  const [settings, setSettings] = useState<Settings | null>(null);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<{ text: string; type: "success" | "error" } | null>(null);
  const [folderId, setFolderId] = useState("");
  const [courseId, setCourseId] = useState("");

  async function load() {
    const res = await fetch("/api/settings");
    const data = await res.json();
    setSettings(data);
    setFolderId(data.driveFolderId ?? "");
    setCourseId(data.classroomCourseId ?? "");
  }

  useEffect(() => { load(); }, []);

  async function saveSettings() {
    setSaving(true);
    setMsg(null);
    await fetch("/api/settings", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ driveFolderId: folderId || null, classroomCourseId: courseId || null }),
    });
    setSaving(false);
    setMsg({ text: "Settings saved!", type: "success" });
    setTimeout(() => setMsg(null), 3000);
    load();
  }

  if (!settings) return (
    <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "40px", color: "var(--ink-3)", fontSize: 14 }}>
      <span style={{ width: 16, height: 16, border: "2px solid var(--line-2)", borderTopColor: "var(--coral)", borderRadius: 99, display: "inline-block", animation: "spin .6s linear infinite" }} />
      Loading…
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );

  return (
    <div className="fade-in" style={{ padding: "32px 40px 60px", maxWidth: 680 }}>
      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <p style={{ margin: 0, color: "var(--ink-3)", fontSize: 14 }}>
          {new Date().toLocaleDateString("en-MY", { weekday: "long", day: "numeric", month: "long" })}
        </p>
        <h1 className="serif" style={{ margin: "6px 0 0", fontSize: 48, lineHeight: 1.02, color: "var(--ink)" }}>
          Settings
        </h1>
      </div>

      <div style={{ display: "grid", gap: 16 }}>

        {/* Google Account card */}
        <div style={{ background: "var(--card)", border: "1px solid var(--line)", borderRadius: 22, overflow: "hidden", boxShadow: "var(--shadow)" }}>
          <div style={{ background: "var(--ink)", padding: "22px 26px", position: "relative", overflow: "hidden" }}>
            <svg width="140" height="140" viewBox="0 0 140 140" style={{ position: "absolute", right: -30, top: -30, opacity: .18, color: "var(--coral)" }}>
              <circle cx="70" cy="70" r="60" fill="none" stroke="currentColor" strokeWidth="10"/>
              <circle cx="70" cy="70" r="35" fill="none" stroke="currentColor" strokeWidth="10"/>
            </svg>
            <div style={{ position: "relative", display: "flex", alignItems: "center", gap: 14 }}>
              <div style={{ width: 44, height: 44, borderRadius: 12, background: "var(--coral)", display: "grid", placeItems: "center", color: "var(--ink)", flexShrink: 0 }}>
                <Link2 size={20} strokeWidth={2} />
              </div>
              <div>
                <div className="serif" style={{ fontSize: 20, color: "white", lineHeight: 1.1 }}>Google Account</div>
                <div style={{ fontSize: 13, color: "rgba(255,255,255,.7)", marginTop: 3 }}>Connect for Drive uploads &amp; Classroom posts</div>
              </div>
              {settings.connected && (
                <span style={{ marginLeft: "auto", display: "inline-flex", alignItems: "center", gap: 5, padding: "5px 12px", borderRadius: 99, background: "rgba(255,255,255,.22)", color: "white", fontSize: 12.5, fontWeight: 600 }}>
                  <CheckCircle2 size={13} /> Connected
                </span>
              )}
            </div>
          </div>

          <div style={{ padding: "20px 26px" }}>
            {settings.connected ? (
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <span style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "6px 14px", borderRadius: 99, background: "var(--mint-soft)", color: "var(--mint-ink)", fontSize: 13, fontWeight: 600 }}>
                  <CheckCircle2 size={14} /> Google account connected
                </span>
                <a href="/api/auth/google" style={{ fontSize: 13, color: "var(--ink-3)", textDecoration: "none", fontWeight: 500 }}>
                  Reconnect →
                </a>
              </div>
            ) : (
              <div style={{ display: "grid", gap: 12 }}>
                <div style={{ display: "flex", alignItems: "flex-start", gap: 10, background: "var(--butter-soft)", border: "1px solid var(--butter)", borderRadius: 12, padding: "12px 14px" }}>
                  <AlertCircle size={15} color="var(--butter-ink)" style={{ flexShrink: 0, marginTop: 1 }} />
                  <p style={{ margin: 0, fontSize: 13.5, color: "var(--butter-ink)", lineHeight: 1.5 }}>
                    No Google account connected. Sign in to enable PDF uploads to Drive and posts to Classroom.
                  </p>
                </div>
                <a href="/api/auth/google" style={{
                  display: "inline-flex", alignItems: "center", gap: 10, width: "fit-content",
                  background: "var(--card)", border: "1px solid var(--line)", borderRadius: 12,
                  padding: "10px 18px", textDecoration: "none", fontSize: 14, fontWeight: 600,
                  color: "var(--ink)", boxShadow: "var(--shadow-sm)",
                }}>
                  <svg width="18" height="18" viewBox="0 0 24 24">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                  </svg>
                  Sign in with Google
                </a>
              </div>
            )}
          </div>
        </div>

        {/* Drive & Classroom card */}
        <div style={{ background: "var(--card)", border: "1px solid var(--line)", borderRadius: 22, overflow: "hidden", boxShadow: "var(--shadow)" }}>
          <div style={{ background: "linear-gradient(135deg, var(--sky) 0%, var(--mint) 100%)", padding: "22px 26px", position: "relative", overflow: "hidden" }}>
            <div style={{ position: "relative", display: "flex", alignItems: "center", gap: 14 }}>
              <div style={{ width: 44, height: 44, borderRadius: 14, background: "rgba(255,255,255,.22)", display: "grid", placeItems: "center", color: "white", flexShrink: 0 }}>
                <FolderOpen size={20} strokeWidth={2} />
              </div>
              <div>
                <div style={{ fontFamily: "var(--ff-display)", fontSize: 20, color: "white", lineHeight: 1.1 }}>Drive &amp; Classroom</div>
                <div style={{ fontSize: 13, color: "rgba(255,255,255,.85)", marginTop: 3 }}>Where generated PDFs get saved and posted</div>
              </div>
            </div>
          </div>

          <div style={{ padding: "20px 26px", display: "grid", gap: 18 }}>
            {/* Drive folder */}
            <div>
              <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "var(--ink-2)", marginBottom: 6 }}>
                Drive Folder ID <span style={{ fontWeight: 400, color: "var(--ink-4)", fontSize: 12 }}>(optional)</span>
              </label>
              <input
                type="text"
                placeholder="Leave blank to save in root"
                value={folderId}
                onChange={e => setFolderId(e.target.value)}
                style={inputStyle}
              />
              <p style={{ margin: "6px 0 0", fontSize: 12, color: "var(--ink-4)", lineHeight: 1.5 }}>
                Open a folder in Drive — the ID is the last part of the URL:
                {" "}<code style={{ background: "var(--bg-2)", padding: "1px 5px", borderRadius: 5, fontSize: 11.5 }}>drive.google.com/drive/folders/<strong>FOLDER_ID</strong></code>
              </p>
            </div>

            {/* Classroom course */}
            <div>
              <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "var(--ink-2)", marginBottom: 6 }}>
                Classroom Course <span style={{ fontWeight: 400, color: "var(--ink-4)", fontSize: 12 }}>(optional)</span>
              </label>
              {settings.courses && settings.courses.length > 0 ? (
                <select value={courseId} onChange={e => setCourseId(e.target.value)} style={{ ...inputStyle, appearance: "none" }}>
                  <option value="">Don&apos;t post to Classroom</option>
                  {settings.courses.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              ) : (
                <input
                  type="text"
                  placeholder={settings.connected ? "No courses found" : "Connect Google account first"}
                  value={courseId}
                  onChange={e => setCourseId(e.target.value)}
                  disabled={!settings.connected}
                  style={{ ...inputStyle, opacity: settings.connected ? 1 : .5 }}
                />
              )}
            </div>
          </div>
        </div>

        {/* AI / Vocab Generator card */}
        <div style={{ background: "var(--card)", border: "1px solid var(--line)", borderRadius: 22, overflow: "hidden", boxShadow: "var(--shadow)" }}>
          <div style={{ background: "var(--ink)", padding: "22px 26px", position: "relative", overflow: "hidden" }}>
            <svg width="120" height="120" viewBox="0 0 120 120" style={{ position: "absolute", right: -20, top: -20, opacity: .18, color: "var(--lavender)" }}>
              <circle cx="60" cy="60" r="50" fill="none" stroke="currentColor" strokeWidth="8"/>
              <circle cx="60" cy="60" r="28" fill="none" stroke="currentColor" strokeWidth="8"/>
            </svg>
            <div style={{ position: "relative", display: "flex", alignItems: "center", gap: 14 }}>
              <div style={{ width: 44, height: 44, borderRadius: 12, background: "var(--lavender)", display: "grid", placeItems: "center", color: "white", flexShrink: 0 }}>
                <Sparkles size={20} strokeWidth={2} />
              </div>
              <div>
                <div className="serif" style={{ fontSize: 20, color: "white", lineHeight: 1.1 }}>AI Vocab Generator</div>
                <div style={{ fontSize: 13, color: "rgba(255,255,255,.7)", marginTop: 3 }}>Powered by Claude — generates words &amp; sentences automatically</div>
              </div>
            </div>
          </div>
          <div style={{ padding: "20px 26px", display: "grid", gap: 12 }}>
            <div style={{ display: "flex", alignItems: "flex-start", gap: 10, background: "var(--lavender-soft)", border: "1px solid var(--lavender)", borderRadius: 12, padding: "12px 14px" }}>
              <Key size={14} color="var(--lavender-ink)" style={{ flexShrink: 0, marginTop: 2 }} />
              <div style={{ fontSize: 13.5, color: "var(--lavender-ink)", lineHeight: 1.6 }}>
                Add <code style={{ background: "rgba(0,0,0,.07)", padding: "1px 5px", borderRadius: 4, fontSize: 12.5 }}>ANTHROPIC_API_KEY=sk-ant-…</code> to your{" "}
                <code style={{ background: "rgba(0,0,0,.07)", padding: "1px 5px", borderRadius: 4, fontSize: 12.5 }}>.env.local</code> file to enable the{" "}
                <strong>Generate with AI</strong> button in Weekly Vocab.
              </div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              <a href="https://console.anthropic.com/settings/keys" target="_blank" rel="noopener noreferrer"
                style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 7, padding: "9px 0", borderRadius: 10, border: "1px solid var(--lavender)", background: "var(--lavender-soft)", color: "var(--lavender-ink)", fontSize: 13, fontWeight: 600, textDecoration: "none" }}>
                Get API key →
              </a>
              <a href="https://docs.anthropic.com" target="_blank" rel="noopener noreferrer"
                style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 7, padding: "9px 0", borderRadius: 10, border: "1px solid var(--line)", background: "transparent", color: "var(--ink-3)", fontSize: 13, fontWeight: 500, textDecoration: "none" }}>
                Docs
              </a>
            </div>
          </div>
        </div>

        {/* Setup guide */}
        <div style={{ background: "var(--butter-soft)", border: "1px solid var(--butter)", borderRadius: 18, padding: "18px 22px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--butter-ink)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 8v4"/><path d="M12 16h.01"/></svg>
            <span style={{ fontSize: 13, fontWeight: 700, color: "var(--butter-ink)" }}>First-time setup — Google Cloud Console</span>
          </div>
          <ol style={{ margin: 0, padding: "0 0 0 18px", display: "grid", gap: 6 }}>
            {[
              <>Go to <strong>console.cloud.google.com</strong> and create a project</>,
              <>Enable <strong>Google Drive API</strong> and <strong>Google Classroom API</strong></>,
              <>Create <strong>OAuth 2.0 credentials</strong> (Web Application type)</>,
              <><code style={{ background: "rgba(0,0,0,.08)", padding: "1px 4px", borderRadius: 4, fontSize: 12 }}>http://localhost:3001/api/auth/google/callback</code> as redirect URI</>,
              <>Copy Client ID + Secret into <code style={{ background: "rgba(0,0,0,.08)", padding: "1px 4px", borderRadius: 4, fontSize: 12 }}>.env</code></>,
              <>Click <strong>Sign in with Google</strong> above</>,
            ].map((step, i) => (
              <li key={i} style={{ fontSize: 13.5, color: "var(--butter-ink)", lineHeight: 1.5 }}>{step}</li>
            ))}
          </ol>
        </div>

        {/* Message */}
        {msg && (
          <div style={{ display: "flex", alignItems: "center", gap: 8, borderRadius: 12, padding: "10px 14px", fontSize: 13.5, fontWeight: 500, background: msg.type === "success" ? "var(--mint-soft)" : "var(--coral-soft)", color: msg.type === "success" ? "var(--mint-ink)" : "var(--coral-ink)" }}>
            <CheckCircle2 size={15} /> {msg.text}
          </div>
        )}

        <button onClick={saveSettings} disabled={saving} style={{ width: "100%", padding: "13px 0", borderRadius: 10, border: 0, cursor: saving ? "default" : "pointer", background: "var(--ink)", color: "white", fontSize: 15, fontWeight: 700, opacity: saving ? .6 : 1, transition: "opacity .15s", fontFamily: "var(--ff-ui)" }}>
          {saving ? "Saving…" : "Save Settings"}
        </button>
      </div>
    </div>
  );
}

const inputStyle: React.CSSProperties = {
  width: "100%", padding: "10px 12px", border: "1px solid var(--line)", borderRadius: 10,
  background: "var(--card)", color: "var(--ink)", fontSize: 14, outline: "none",
  fontFamily: "var(--ff-ui)",
};
