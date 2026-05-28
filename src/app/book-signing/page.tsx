"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { BookCheck, Play, Users, Calendar, Hash } from "lucide-react";

type Class = { id: string; name: string; grade: string; subject: string };
type SessionStats = Record<string, { count: number; lastDate: string }>;

const CLASS_COLORS = ["coral", "mint", "butter", "lavender", "sky", "coral", "mint", "butter"];
function classColor(name: string) {
  let h = 0;
  for (const c of name) h = (h * 31 + c.charCodeAt(0)) % CLASS_COLORS.length;
  return CLASS_COLORS[h];
}

function relativeDate(iso: string) {
  const d = new Date(iso);
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffDays = Math.floor(diffMs / 86400000);
  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return `${diffDays}d ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)}w ago`;
  return d.toLocaleDateString("en-MY", { day: "numeric", month: "short" });
}

export default function BookSigningPage() {
  const router = useRouter();
  const [classes, setClasses] = useState<Class[]>([]);
  const [stats, setStats] = useState<SessionStats>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch("/api/classes").then(r => r.json()),
      fetch("/api/book-sessions?summary=true").then(r => r.json()),
    ]).then(([classData, statsData]) => {
      setClasses(Array.isArray(classData) ? classData : []);
      setStats(statsData ?? {});
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  return (
    <div className="fade-in page-outer" style={{ maxWidth: 900 }}>
      {/* Header */}
      <div style={{ marginBottom: 32 }}>
        <p style={{ margin: 0, color: "var(--ink-3)", fontSize: 14 }}>
          {new Date().toLocaleDateString("en-MY", { weekday: "long", day: "numeric", month: "long" })}
        </p>
        <h1 className="serif" style={{ margin: "6px 0 0", fontSize: 48, lineHeight: 1.02, color: "var(--ink)" }}>
          Book{" "}
          <span className="serif-i" style={{ color: "var(--coral-ink)" }}>signing</span>
        </h1>
        <p style={{ margin: "10px 0 0", fontSize: 14, color: "var(--ink-3)", maxWidth: 480 }}>
          Pick a class to start a book collection session. Place RFID books in the basket and track who hasn&apos;t submitted.
        </p>
      </div>

      {loading && (
        <div style={{ display: "flex", alignItems: "center", gap: 10, color: "var(--ink-3)", fontSize: 14, padding: "40px 0" }}>
          <span style={{ width: 18, height: 18, border: "2px solid var(--line-2)", borderTopColor: "var(--coral)", borderRadius: 99, display: "inline-block", animation: "spin 0.6s linear infinite" }} />
          Loading classes…
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      )}

      {!loading && classes.length === 0 && (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: "80px 20px", textAlign: "center" }}>
          <div style={{ width: 72, height: 72, borderRadius: 22, background: "var(--coral-soft)", display: "grid", placeItems: "center", marginBottom: 20 }}>
            <BookCheck size={36} color="var(--coral-ink)" />
          </div>
          <h2 className="serif" style={{ margin: 0, fontSize: 22, color: "var(--ink)" }}>No classes yet</h2>
          <p style={{ margin: "8px 0 24px", fontSize: 14, color: "var(--ink-3)", maxWidth: 300 }}>
            Create a class first, then add students to use book signing.
          </p>
          <button
            onClick={() => router.push("/classes/new")}
            style={{ background: "var(--ink)", color: "white", padding: "10px 20px", borderRadius: 10, border: 0, fontSize: 14, fontWeight: 700, cursor: "pointer", fontFamily: "var(--ff-ui)" }}
          >
            Create a class
          </button>
        </div>
      )}

      {!loading && classes.length > 0 && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 14 }}>
          {classes.map(cls => {
            const color = classColor(cls.name);
            return (
              <div key={cls.id} className={`cc-${color}`} style={{ background: "var(--card)", border: "1px solid var(--line)", borderRadius: 20, overflow: "hidden", boxShadow: "var(--shadow)" }}>
                {/* Coloured top strip */}
                <div style={{ height: 5, background: "var(--c)" }} />
                <div style={{ padding: "18px 20px 20px" }}>
                  {/* Class info */}
                  <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 14 }}>
                    <div style={{ width: 44, height: 44, borderRadius: 14, background: "var(--c)", color: "white", display: "grid", placeItems: "center", fontFamily: "var(--ff-display)", fontSize: 22, boxShadow: "0 1px 0 rgba(255,255,255,.4) inset, 0 6px 14px -8px var(--c)", flexShrink: 0 }}>
                      {cls.name.charAt(0)}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 16, fontWeight: 600, color: "var(--ink)" }}>{cls.name}</div>
                      <div style={{ fontSize: 12, color: "var(--ink-3)", marginTop: 2 }}>{cls.grade} · {cls.subject}</div>
                    </div>
                  </div>

                  {/* Session stats */}
                  {stats[cls.id] ? (
                    <div style={{ display: "flex", gap: 8, marginBottom: 14 }}>
                      <div style={{ flex: 1, background: "var(--c-soft)", borderRadius: 10, padding: "8px 12px", display: "flex", alignItems: "center", gap: 7 }}>
                        <Hash size={12} color="var(--c-ink)" strokeWidth={2.5} />
                        <div>
                          <div style={{ fontSize: 15, fontWeight: 700, color: "var(--c-ink)", lineHeight: 1 }}>{stats[cls.id].count}</div>
                          <div style={{ fontSize: 10.5, color: "var(--ink-4)", marginTop: 2 }}>sessions</div>
                        </div>
                      </div>
                      <div style={{ flex: 1, background: "var(--c-soft)", borderRadius: 10, padding: "8px 12px", display: "flex", alignItems: "center", gap: 7 }}>
                        <Calendar size={12} color="var(--c-ink)" strokeWidth={2.5} />
                        <div>
                          <div style={{ fontSize: 13, fontWeight: 600, color: "var(--c-ink)", lineHeight: 1 }}>{relativeDate(stats[cls.id].lastDate)}</div>
                          <div style={{ fontSize: 10.5, color: "var(--ink-4)", marginTop: 2 }}>last session</div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div style={{ marginBottom: 14, padding: "8px 12px", background: "oklch(0% 0 0 / .03)", borderRadius: 10, fontSize: 12, color: "var(--ink-4)" }}>
                      No sessions yet
                    </div>
                  )}

                  {/* Actions */}
                  <div style={{ display: "flex", gap: 8 }}>
                    <button
                      onClick={() => router.push(`/classes/${cls.id}/book-signing`)}
                      style={{
                        flex: 1, display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 8,
                        background: "var(--c)", color: "white", padding: "10px 0",
                        borderRadius: 12, border: 0, cursor: "pointer", fontSize: 14, fontWeight: 700,
                        boxShadow: "0 4px 12px -6px var(--c)", fontFamily: "var(--ff-ui)",
                      }}
                    >
                      <Play size={13} fill="white" strokeWidth={0} /> Start session
                    </button>
                    <button
                      onClick={() => router.push(`/classes/${cls.id}?tab=book-signing`)}
                      title="Manage students"
                      style={{ width: 42, height: 42, borderRadius: 12, border: "1px solid var(--line)", background: "transparent", cursor: "pointer", display: "grid", placeItems: "center", color: "var(--ink-3)" }}
                    >
                      <Users size={16} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
