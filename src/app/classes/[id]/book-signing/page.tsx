"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, BookCheck, Wifi, CheckCircle2, XCircle, AlertTriangle, RotateCcw } from "lucide-react";

type Student = { id: string; name: string; rfidTag: string | null };
type Submission = { student: Student; scannedAt: string };
type Session = {
  id: string;
  label: string;
  class: { name: string; grade: string; students: Student[] };
  submissions: Submission[];
};

const AVATAR_COLORS = ["coral", "mint", "butter", "lavender", "sky"];

export default function BookSigningPage() {
  const { id: classId } = useParams<{ id: string }>();
  const router = useRouter();
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [rfidBuffer, setRfidBuffer] = useState("");
  const [lastScan, setLastScan] = useState<{ name: string; ok: boolean } | null>(null);
  const [done, setDone] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const lastScanTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    fetch("/api/book-sessions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ classId }),
    })
      .then(r => r.json())
      .then(s => setSessionId(s.id));
  }, [classId]);

  const loadSession = useCallback(async () => {
    if (!sessionId) return;
    const res = await fetch(`/api/book-sessions/${sessionId}`);
    const data = await res.json();
    setSession(data);
    setLoading(false);
  }, [sessionId]);

  useEffect(() => {
    if (sessionId) loadSession();
  }, [sessionId, loadSession]);

  useEffect(() => {
    if (!done) inputRef.current?.focus();
  });

  async function handleScan(tag: string) {
    if (!sessionId || !tag.trim()) return;
    const res = await fetch(`/api/book-sessions/${sessionId}/scan`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ rfidTag: tag.trim() }),
    });
    const data = await res.json();
    if (res.ok && !data.duplicate) {
      setLastScan({ name: data.submission.student.name, ok: true });
      loadSession();
    } else if (data.duplicate) {
      setLastScan({ name: data.submission.student.name, ok: false });
    } else {
      setLastScan({ name: `Unknown tag: ${tag}`, ok: false });
    }
    if (lastScanTimer.current) clearTimeout(lastScanTimer.current);
    lastScanTimer.current = setTimeout(() => setLastScan(null), 3000);
  }

  async function scanStudent(studentId: string) {
    if (!sessionId) return;
    const res = await fetch(`/api/book-sessions/${sessionId}/scan`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ studentId }),
    });
    const data = await res.json();
    if (res.ok && !data.duplicate) {
      setLastScan({ name: data.submission.student.name, ok: true });
      loadSession();
    }
    if (lastScanTimer.current) clearTimeout(lastScanTimer.current);
    lastScanTimer.current = setTimeout(() => setLastScan(null), 2000);
  }

  async function unscanStudent(studentId: string) {
    if (!sessionId) return;
    await fetch(`/api/book-sessions/${sessionId}/scan`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ studentId }),
    });
    loadSession();
  }

  if (loading || !session) {
    return (
      <div style={{ minHeight: "100vh", background: "var(--bg)", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <span style={{ display: "flex", alignItems: "center", gap: 10, color: "var(--ink-3)", fontSize: 14 }}>
          <span style={{ width: 16, height: 16, border: "2px solid var(--line-2)", borderTopColor: "var(--coral)", borderRadius: 99, display: "inline-block", animation: "spin 0.6s linear infinite" }} />
          Starting session…
        </span>
      </div>
    );
  }

  const submittedIds = new Set(session.submissions.map(s => s.student.id));
  const submitted = session.class.students.filter(s => submittedIds.has(s.id));
  const missing = session.class.students.filter(s => !submittedIds.has(s.id));
  const total = session.class.students.length;
  const pct = total === 0 ? 0 : Math.round((submitted.length / total) * 100);
  const allTagged = session.class.students.some(s => s.rfidTag);

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)" }}>
      {/* Header bar */}
      <div style={{ background: "var(--card)", borderBottom: "1px solid var(--line)", padding: "14px 28px", display: "flex", alignItems: "center", gap: 16 }}>
        <button
          onClick={() => router.push(`/classes/${classId}`)}
          style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "6px 10px", marginLeft: -10, background: "transparent", border: 0, cursor: "pointer", color: "var(--ink-3)", fontSize: 13, borderRadius: 8 }}
        >
          <ArrowLeft size={14} /> Back
        </button>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 15, fontWeight: 600, color: "var(--ink)" }}>{session.class.name} — Book Signing</div>
          <div style={{ fontSize: 12, color: "var(--ink-3)", marginTop: 1 }}>{session.class.grade}</div>
        </div>
        {!done && (
          <button
            onClick={() => setDone(true)}
            style={{ background: "var(--ink)", color: "white", padding: "8px 18px", borderRadius: 10, border: 0, fontSize: 14, fontWeight: 700, cursor: "pointer", fontFamily: "var(--ff-ui)" }}
          >
            Done
          </button>
        )}
      </div>

      <div style={{ maxWidth: 720, margin: "0 auto", padding: "32px 24px", display: "grid", gap: 20 }}>

        {/* Progress card */}
        <div style={{ background: "var(--card)", border: "1px solid var(--line)", borderRadius: 22, padding: 24, boxShadow: "var(--shadow)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
            <div style={{ flex: 1 }}>
              <div style={{ fontFamily: "var(--ff-display)", fontSize: 52, lineHeight: 1, color: "var(--ink)" }}>
                {submitted.length}
                <span style={{ fontSize: 24, color: "var(--ink-3)", fontFamily: "var(--ff-ui)", fontWeight: 400 }}>/{total}</span>
              </div>
              <div style={{ fontSize: 13.5, color: "var(--ink-3)", marginTop: 4 }}>books submitted</div>
            </div>
            {/* SVG ring */}
            <div style={{ position: "relative", width: 72, height: 72, flexShrink: 0 }}>
              <svg width="72" height="72" viewBox="0 0 56 56" style={{ transform: "rotate(-90deg)" }}>
                <circle cx="28" cy="28" r="24" fill="none" stroke="var(--line)" strokeWidth="6" />
                <circle
                  cx="28" cy="28" r="24" fill="none"
                  stroke={pct === 100 ? "var(--mint)" : "var(--coral)"}
                  strokeWidth="6"
                  strokeDasharray={`${2 * Math.PI * 24}`}
                  strokeDashoffset={`${2 * Math.PI * 24 * (1 - pct / 100)}`}
                  strokeLinecap="round"
                  style={{ transition: "stroke-dashoffset .5s ease" }}
                />
              </svg>
              <span style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12.5, fontWeight: 700, color: "var(--ink-2)" }}>{pct}%</span>
            </div>
          </div>
          <div style={{ height: 8, borderRadius: 99, background: "var(--bg-2)", overflow: "hidden", marginTop: 18 }}>
            <div style={{
              height: "100%", borderRadius: 99,
              background: pct === 100
                ? "linear-gradient(90deg, var(--mint), var(--sky))"
                : "linear-gradient(90deg, var(--coral), var(--butter))",
              width: `${pct}%`, transition: "width .5s ease",
            }} />
          </div>
        </div>

        {/* RFID scanner card */}
        {!done && (
          <div
            style={{
              background: "var(--ink)",
              borderRadius: 22, padding: 24, position: "relative", overflow: "hidden", cursor: "text",
            }}
            onClick={() => inputRef.current?.focus()}
          >
            {/* Concentric circle decoration */}
            <svg width="180" height="180" viewBox="0 0 180 180" style={{ position: "absolute", right: -50, top: -50, opacity: .18, color: "var(--coral)" }}>
              <circle cx="90" cy="90" r="80" fill="none" stroke="currentColor" strokeWidth="10" />
              <circle cx="90" cy="90" r="55" fill="none" stroke="currentColor" strokeWidth="10" />
              <circle cx="90" cy="90" r="30" fill="none" stroke="currentColor" strokeWidth="10" />
            </svg>

            <div style={{ position: "relative" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
                <div style={{ width: 42, height: 42, borderRadius: 14, background: "var(--coral)", display: "grid", placeItems: "center", color: "var(--ink)" }}>
                  <Wifi size={20} strokeWidth={2} />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ color: "white", fontWeight: 700, fontSize: 16 }}>RFID Scanner Active</div>
                  <div style={{ color: "rgba(255,255,255,.85)", fontSize: 13, marginTop: 2 }}>
                    {allTagged ? "Place books in basket — scanning automatically" : "Use the list below to mark manually"}
                  </div>
                </div>
                {/* Pulse dot */}
                <div className="pulse-dot" style={{ width: 10, height: 10, borderRadius: 99, background: "var(--mint)", flexShrink: 0 }} />
              </div>

              {lastScan ? (
                <div style={{
                  display: "flex", alignItems: "center", gap: 8, borderRadius: 12, padding: "10px 14px",
                  fontSize: 14, fontWeight: 600,
                  background: lastScan.ok ? "rgba(255,255,255,.25)" : "rgba(0,0,0,.15)",
                  color: "white",
                }}>
                  {lastScan.ok ? <CheckCircle2 size={16} /> : <XCircle size={16} />}
                  {lastScan.ok ? `✓ ${lastScan.name}` : lastScan.name}
                </div>
              ) : (
                <div style={{ background: "rgba(255,255,255,.15)", borderRadius: 12, padding: "10px 14px", color: "rgba(255,255,255,.8)", fontSize: 14, textAlign: "center" }}>
                  Waiting for scan…
                </div>
              )}

              <input
                ref={inputRef}
                value={rfidBuffer}
                onChange={e => setRfidBuffer(e.target.value)}
                onKeyDown={e => {
                  if (e.key === "Enter") {
                    handleScan(rfidBuffer);
                    setRfidBuffer("");
                  }
                }}
                style={{ opacity: 0, position: "absolute", pointerEvents: "none" }}
                aria-hidden
              />
            </div>
          </div>
        )}

        {/* Missing list */}
        {missing.length > 0 && (
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
              <AlertTriangle size={14} color="var(--coral-ink)" />
              <span style={{ fontSize: 13, fontWeight: 600, color: "var(--ink-2)" }}>Not submitted ({missing.length})</span>
            </div>
            <div style={{ display: "grid", gap: 8 }}>
              {missing.map((s, i) => (
                <div key={s.id} style={{ background: "var(--card)", border: "1px solid var(--coral-soft)", borderRadius: 14, padding: "12px 16px", display: "flex", alignItems: "center", gap: 12 }}>
                  <div style={{
                    width: 36, height: 36, borderRadius: 10, flexShrink: 0,
                    background: "var(--coral-soft)", color: "var(--coral-ink)",
                    display: "grid", placeItems: "center", fontFamily: "var(--ff-display)", fontSize: 17,
                  }}>{s.name.charAt(0).toUpperCase()}</div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 14, fontWeight: 600, color: "var(--ink)" }}>{s.name}</div>
                    {s.rfidTag
                      ? <div style={{ fontSize: 11.5, color: "var(--ink-4)", fontFamily: "monospace", marginTop: 2 }}>{s.rfidTag}</div>
                      : <div style={{ fontSize: 11.5, color: "var(--ink-4)", marginTop: 2 }}>No RFID tag</div>
                    }
                  </div>
                  {!done && (
                    <button
                      onClick={() => scanStudent(s.id)}
                      style={{
                        fontSize: 12.5, fontWeight: 600, color: "var(--coral-ink)",
                        background: "var(--coral-soft)", border: "1px solid var(--coral)",
                        padding: "6px 12px", borderRadius: 8, cursor: "pointer", flexShrink: 0,
                        fontFamily: "var(--ff-ui)",
                      }}
                    >
                      Mark in
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Submitted list */}
        {submitted.length > 0 && (
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
              <CheckCircle2 size={14} color="var(--mint-ink)" />
              <span style={{ fontSize: 13, fontWeight: 600, color: "var(--ink-2)" }}>Submitted ({submitted.length})</span>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 8 }}>
              {submitted.map((s, i) => {
                const col = AVATAR_COLORS[i % AVATAR_COLORS.length];
                return (
                  <div key={s.id} className={`cc-${col}`} style={{ background: "var(--card)", border: "1px solid var(--c-soft)", borderRadius: 12, padding: "10px 14px", display: "flex", alignItems: "center", gap: 10 }}>
                    <div style={{ width: 30, height: 30, borderRadius: 8, background: "var(--c-soft)", color: "var(--c-ink)", display: "grid", placeItems: "center", fontFamily: "var(--ff-display)", fontSize: 15, flexShrink: 0 }}>
                      {s.name.charAt(0).toUpperCase()}
                    </div>
                    <span style={{ fontSize: 13.5, fontWeight: 500, color: "var(--ink)", flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{s.name}</span>
                    {!done && (
                      <button
                        onClick={() => unscanStudent(s.id)}
                        title="Undo"
                        style={{ background: "transparent", border: 0, cursor: "pointer", color: "var(--ink-4)", padding: 4, flexShrink: 0 }}
                      >
                        <RotateCcw size={13} />
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Done summary */}
        {done && (
          <div style={{
            background: missing.length === 0 ? "var(--mint-soft)" : "var(--coral-soft)",
            border: `1px solid ${missing.length === 0 ? "var(--mint)" : "var(--coral)"}`,
            borderRadius: 22, padding: "32px 24px", textAlign: "center",
          }}>
            <div style={{
              width: 64, height: 64, borderRadius: 20, margin: "0 auto 16px",
              background: missing.length === 0 ? "var(--mint)" : "var(--coral)",
              display: "grid", placeItems: "center", color: "white",
            }}>
              {missing.length === 0
                ? <CheckCircle2 size={32} strokeWidth={2} />
                : <AlertTriangle size={32} strokeWidth={2} />}
            </div>
            <h3 className="serif" style={{ margin: "0 0 6px", fontSize: 28, color: "var(--ink)" }}>
              {missing.length === 0 ? "All books in!" : `${missing.length} book${missing.length > 1 ? "s" : ""} missing`}
            </h3>
            <p style={{ margin: "0 0 20px", fontSize: 14, color: "var(--ink-3)" }}>
              {submitted.length} of {total} students submitted their book
            </p>
            <button
              onClick={() => router.push(`/classes/${classId}`)}
              style={{
                background: "var(--card)", border: "1px solid var(--line)", color: "var(--ink-2)",
                padding: "10px 22px", borderRadius: 12, fontSize: 14, fontWeight: 600, cursor: "pointer",
                fontFamily: "var(--ff-ui)",
              }}
            >
              Back to Class
            </button>
          </div>
        )}

        {total === 0 && (
          <div style={{ background: "var(--card)", border: "1px solid var(--line)", borderRadius: 22, padding: "48px 24px", textAlign: "center" }}>
            <BookCheck size={36} color="var(--ink-4)" style={{ marginBottom: 12, display: "block", margin: "0 auto 12px" }} />
            <p style={{ margin: 0, fontSize: 14, fontWeight: 600, color: "var(--ink-3)" }}>No students in this class yet.</p>
            <p style={{ margin: "4px 0 0", fontSize: 13, color: "var(--ink-4)" }}>Add students from the Book Signing tab first.</p>
          </div>
        )}
      </div>
    </div>
  );
}
