"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { Plus, X, AlertCircle, Check, ChevronDown, ChevronUp, Phone, FileText, Upload, Loader2, ExternalLink, Pencil } from "lucide-react";

type Chapter   = { id: string; number: number; title: string; status: string };
type Homework  = { id: string; title: string; description?: string; dueDate: string; status: string };
type Note      = { id: string; content: string; createdAt: string };
type ClassData = { id: string; name: string; grade: string; subject: string; chapters: Chapter[]; homework: Homework[]; notes: Note[] };
type Tab       = "overview" | "chapters" | "homework" | "notes" | "book-signing" | "attendance" | "marks" | "contacts" | "textbooks";
type Student   = { id: string; name: string; rfidTag: string | null };
type BookSession = { id: string; label: string; createdAt: string; _count: { submissions: number } };

const CLASS_COLORS = ["coral", "mint", "butter", "lavender", "sky", "coral", "mint", "butter"];
function classColor(name: string) {
  let h = 0;
  for (const c of name) h = (h * 31 + c.charCodeAt(0)) % CLASS_COLORS.length;
  return CLASS_COLORS[h];
}

const TABS: { id: Tab; label: string; emoji: string }[] = [
  { id: "overview",    label: "Overview",   emoji: "⚡" },
  { id: "chapters",    label: "Chapters",   emoji: "📖" },
  { id: "homework",    label: "Homework",   emoji: "📋" },
  { id: "attendance",  label: "Attendance", emoji: "✅" },
  { id: "marks",       label: "Marks",      emoji: "🏆" },
  { id: "notes",       label: "Notes",      emoji: "📝" },
  { id: "contacts",    label: "Contacts",   emoji: "📞" },
  { id: "book-signing",label: "Books",      emoji: "📚" },
  { id: "textbooks",   label: "Textbooks",  emoji: "📄" },
];

export default function ClassPage() {
  const { id } = useParams<{ id: string }>();
  const router  = useRouter();
  const searchParams = useSearchParams();
  const [cls, setCls] = useState<ClassData | null>(null);
  const initialTab = (searchParams.get("tab") as Tab) ?? "overview";
  const [tab, setTab] = useState<Tab>(initialTab);

  const load = useCallback(async () => {
    const res = await fetch(`/api/classes/${id}`);
    if (!res.ok) { router.push("/"); return; }
    setCls(await res.json());
  }, [id, router]);

  useEffect(() => { load(); }, [load]);

  if (!cls) return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: 300 }}>
      <div style={{ width: 24, height: 24, border: "2.5px solid var(--coral)", borderTopColor: "transparent", borderRadius: "50%", animation: "spin 0.7s linear infinite" }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );

  const color = classColor(cls.name);
  const tabCount = (t: Tab): number | null => {
    if (t === "chapters") return cls.chapters.length;
    if (t === "homework") return cls.homework.length;
    if (t === "notes")    return cls.notes.length;
    return null;
  };

  return (
    <div className={`fade-in cc-${color}`} style={{ padding: "24px 40px 60px", maxWidth: 960 }}>
      {/* Back */}
      <button onClick={() => router.push("/")} style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "6px 10px", marginLeft: -10, background: "transparent", border: 0, cursor: "pointer", color: "var(--ink-3)", fontSize: 13, borderRadius: 8 }}>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
        Dashboard
      </button>

      {/* Header */}
      <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", margin: "12px 0 24px" }}>
        <div style={{ display: "flex", gap: 18, alignItems: "center" }}>
          <div style={{ width: 64, height: 64, borderRadius: 18, background: "var(--c)", color: "white", display: "grid", placeItems: "center", fontFamily: "var(--ff-display)", fontSize: 36, boxShadow: "0 1px 0 rgba(255,255,255,.4) inset, 0 10px 24px -10px var(--c)" }}>{cls.name.charAt(0)}</div>
          <div>
            <h1 style={{ margin: 0, fontSize: 44, lineHeight: 1, color: "var(--ink)", fontFamily: "var(--ff-display)", fontWeight: 400 }}>{cls.name}</h1>
            <p style={{ margin: "6px 0 0", fontSize: 14, color: "var(--ink-3)" }}>{cls.grade} · {cls.subject}</p>
          </div>
        </div>
        <button onClick={async () => {
          if (!confirm(`Delete "${cls.name}"? This cannot be undone.`)) return;
          await fetch(`/api/classes/${id}`, { method: "DELETE" });
          router.push("/");
        }} style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "8px 12px", background: "transparent", border: "1px solid var(--line)", borderRadius: 10, cursor: "pointer", color: "var(--ink-4)", fontSize: 12.5, fontWeight: 500 }}>
          <X size={13} /> Delete
        </button>
      </div>

      {/* Tab bar — scrollable */}
      <div style={{ overflowX: "auto", paddingBottom: 2, marginBottom: 24 }}>
        <div style={{ display: "flex", gap: 4, padding: 5, background: "var(--card-warm)", borderRadius: 14, border: "1px solid var(--line)", width: "max-content" }}>
          {TABS.map(({ id: t, label, emoji }) => {
            const active = tab === t;
            const count  = tabCount(t);
            return (
              <button key={t} onClick={() => setTab(t)} style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "8px 14px", borderRadius: 10, border: 0, cursor: "pointer", background: active ? "var(--card)" : "transparent", color: active ? "var(--ink)" : "var(--ink-3)", fontSize: 13, fontWeight: active ? 600 : 500, boxShadow: active ? "var(--shadow-sm), 0 0 0 1px var(--line)" : "none", transition: "all .15s", whiteSpace: "nowrap" }}>
                <span style={{ fontSize: 14 }}>{emoji}</span>
                {label}
                {count !== null && count > 0 && (
                  <span style={{ fontSize: 11, padding: "1px 6px", borderRadius: 99, background: active ? "var(--c-soft)" : "oklch(0% 0 0 / .04)", color: active ? "var(--c-ink)" : "var(--ink-3)", fontWeight: 600 }}>{count}</span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {tab === "overview"   && <OverviewTab   cls={cls} classId={id} color={color} onTabSwitch={setTab} />}
      {tab === "chapters"   && <ChaptersTab   cls={cls} onRefresh={load} />}
      {tab === "homework"   && <HomeworkTab   cls={cls} classId={id} onRefresh={load} />}
      {tab === "notes"      && <NotesTab      cls={cls} onRefresh={load} />}
      {tab === "book-signing" && <BookSigningTab classId={id} />}
      {tab === "attendance" && <AttendanceTab  classId={id} />}
      {tab === "marks"      && <MarksTab       classId={id} />}
      {tab === "contacts"   && <ContactsTab    classId={id} />}
      {tab === "textbooks"  && <TextbooksTab   classId={id} subject={cls.subject} />}
    </div>
  );
}

// ─── Overview ────────────────────────────────────────────────────────────────
function OverviewTab({ cls, classId, color, onTabSwitch }: { cls: ClassData; classId: string; color: string; onTabSwitch: (t: Tab) => void }) {
  const [students, setStudents] = useState<Student[]>([]);
  const [sessions, setSessions] = useState<BookSession[]>([]);

  useEffect(() => {
    fetch(`/api/students?classId=${classId}`).then(r => r.json()).then(setStudents).catch(() => {});
    fetch(`/api/book-sessions?classId=${classId}`).then(r => r.json()).then(setSessions).catch(() => {});
  }, [classId]);

  const completedChapters = cls.chapters.filter(c => c.status === "completed").length;
  const inProgressChapter = cls.chapters.find(c => c.status === "in-progress");
  const pendingHW = cls.homework.filter(h => h.status === "pending");
  const overdueHW = pendingHW.filter(h => new Date(h.dueDate) < new Date());
  const pct = cls.chapters.length ? Math.round((completedChapters / cls.chapters.length) * 100) : 0;
  const upcomingHW = [...pendingHW]
    .filter(h => new Date(h.dueDate) >= new Date())
    .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
    .slice(0, 3);

  const quickActions: { label: string; desc: string; tab: Tab; color: string; emoji: string }[] = [
    { label: "Chapters",   desc: `${completedChapters}/${cls.chapters.length} done`, tab: "chapters",    color: "sky",      emoji: "📖" },
    { label: "Homework",   desc: `${pendingHW.length} pending`,                      tab: "homework",     color: "butter",   emoji: "📋" },
    { label: "Attendance", desc: `${students.length} students`,                      tab: "attendance",   color: "mint",     emoji: "✅" },
    { label: "Marks",      desc: "Track scores",                                     tab: "marks",        color: "lavender", emoji: "🏆" },
    { label: "Notes",      desc: `${cls.notes.length} notes`,                        tab: "notes",        color: "coral",    emoji: "📝" },
    { label: "Contacts",   desc: "Parent logs",                                      tab: "contacts",     color: "sky",      emoji: "📞" },
    { label: "Books",      desc: `${sessions.length} sessions`,                      tab: "book-signing", color: "mint",     emoji: "📚" },
    { label: "Textbooks",  desc: "PDFs & resources",                                 tab: "textbooks",    color: "butter",   emoji: "📄" },
  ];

  return (
    <div style={{ display: "grid", gap: 24 }}>

      {/* Stat strip */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 10 }}>
        {[
          { label: "Students",  value: students.length,          color: "lavender" },
          { label: "Chapters",  value: `${pct}%`,                color: color },
          { label: "Pending HW",value: pendingHW.length,         color: "butter" },
          { label: "Overdue",   value: overdueHW.length,         color: overdueHW.length > 0 ? "coral" : "mint" },
        ].map(s => (
          <div key={s.label} className={`cc-${s.color}`} style={{ background: "var(--c-soft)", borderRadius: 14, padding: "14px 16px" }}>
            <div style={{ fontFamily: "var(--ff-display)", fontSize: 28, lineHeight: 1, color: "var(--ink)" }}>{s.value}</div>
            <div style={{ fontSize: 11.5, color: "var(--c-ink)", fontWeight: 600, marginTop: 4 }}>{s.label}</div>
          </div>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        {/* Current chapter */}
        <div style={{ background: "var(--card)", border: "1px solid var(--line)", borderRadius: 16, padding: 18 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: "var(--ink-4)", textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 12 }}>Current Chapter</div>
          {inProgressChapter ? (
            <>
              <div className={`cc-${color}`} style={{ display: "inline-flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                <div style={{ width: 36, height: 36, borderRadius: 10, background: "var(--c)", color: "white", display: "grid", placeItems: "center", fontFamily: "var(--ff-display)", fontSize: 18 }}>
                  {inProgressChapter.number}
                </div>
              </div>
              <div style={{ fontSize: 15, fontWeight: 600, color: "var(--ink)", lineHeight: 1.3 }}>{inProgressChapter.title}</div>
              <span style={{ display: "inline-flex", marginTop: 8, fontSize: 11.5, padding: "3px 9px", borderRadius: 99, background: "var(--sky-soft)", color: "var(--sky-ink)", fontWeight: 600 }}>In progress</span>
            </>
          ) : cls.chapters.length === 0 ? (
            <div style={{ color: "var(--ink-4)", fontSize: 13.5 }}>No chapters yet</div>
          ) : (
            <div style={{ color: "var(--ink-4)", fontSize: 13.5 }}>No chapter in progress</div>
          )}
          {cls.chapters.length > 0 && (
            <div style={{ marginTop: 14 }}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: "var(--ink-3)", marginBottom: 5, fontWeight: 500 }}>
                <span>Progress</span><span>{completedChapters}/{cls.chapters.length}</span>
              </div>
              <div className={`cc-${color}`} style={{ height: 7, borderRadius: 99, background: "var(--c-soft)", overflow: "hidden" }}>
                <div style={{ height: "100%", width: `${pct}%`, background: "var(--c)", borderRadius: 99, transition: "width .4s" }} />
              </div>
            </div>
          )}
        </div>

        {/* Upcoming homework */}
        <div style={{ background: "var(--card)", border: "1px solid var(--line)", borderRadius: 16, padding: 18 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: "var(--ink-4)", textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 12 }}>Upcoming Homework</div>
          {overdueHW.length > 0 && (
            <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 10, padding: "7px 10px", borderRadius: 10, background: "var(--coral-soft)" }}>
              <span style={{ fontSize: 12, fontWeight: 700, color: "var(--coral-ink)" }}>⚠ {overdueHW.length} overdue</span>
            </div>
          )}
          {upcomingHW.length === 0 && overdueHW.length === 0 ? (
            <div style={{ color: "var(--ink-4)", fontSize: 13.5 }}>No pending homework 🎉</div>
          ) : (
            <div style={{ display: "grid", gap: 7 }}>
              {upcomingHW.map(hw => (
                <div key={hw.id} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <div style={{ width: 6, height: 6, borderRadius: 99, background: "var(--butter)", flexShrink: 0 }} />
                  <span style={{ flex: 1, fontSize: 13, color: "var(--ink-2)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{hw.title}</span>
                  <span style={{ fontSize: 11.5, color: "var(--ink-4)", flexShrink: 0 }}>{new Date(hw.dueDate).toLocaleDateString("en-MY", { day: "numeric", month: "short" })}</span>
                </div>
              ))}
            </div>
          )}
          {pendingHW.length > 3 && (
            <button onClick={() => onTabSwitch("homework")} style={{ marginTop: 10, fontSize: 12.5, color: "var(--ink-3)", background: "transparent", border: 0, cursor: "pointer", padding: 0 }}>
              +{pendingHW.length - 3} more →
            </button>
          )}
        </div>
      </div>

      {/* Quick navigation */}
      <div>
        <div style={{ fontSize: 11, fontWeight: 700, color: "var(--ink-4)", textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 10 }}>Quick Access</div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(130px, 1fr))", gap: 8 }}>
          {quickActions.map(a => (
            <button key={a.tab} onClick={() => onTabSwitch(a.tab)} className={`cc-${a.color}`}
              style={{ display: "flex", flexDirection: "column", alignItems: "flex-start", gap: 4, padding: "12px 14px", borderRadius: 14, border: "1px solid var(--line)", background: "var(--card)", cursor: "pointer", textAlign: "left", transition: "background .12s, border-color .12s" }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = "var(--c-soft)"; (e.currentTarget as HTMLElement).style.borderColor = "var(--c)"; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "var(--card)"; (e.currentTarget as HTMLElement).style.borderColor = "var(--line)"; }}
            >
              <span style={{ fontSize: 18 }}>{a.emoji}</span>
              <span style={{ fontSize: 13, fontWeight: 600, color: "var(--ink)" }}>{a.label}</span>
              <span style={{ fontSize: 11.5, color: "var(--ink-3)" }}>{a.desc}</span>
            </button>
          ))}
        </div>
      </div>

    </div>
  );
}

// ─── Chapters ────────────────────────────────────────────────────────────────
function ChaptersTab({ cls, onRefresh }: { cls: ClassData; onRefresh: () => void }) {
  const [adding, setAdding] = useState(false);
  const [form, setForm] = useState({ number: "", title: "" });

  async function add() {
    if (!form.number || !form.title) return;
    await fetch("/api/chapters", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ classId: cls.id, number: Number(form.number), title: form.title }) });
    setForm({ number: "", title: "" }); setAdding(false); onRefresh();
  }

  const statusMeta: Record<string, { label: string; bg: string; fg: string }> = {
    upcoming:      { label: "Upcoming",    bg: "oklch(0% 0 0 / .04)", fg: "var(--ink-3)" },
    "in-progress": { label: "In progress", bg: "var(--sky-soft)",     fg: "var(--sky-ink)" },
    completed:     { label: "Completed",   bg: "var(--mint-soft)",    fg: "var(--mint-ink)" },
  };

  return (
    <div>
      <div style={{ display: "grid", gap: 8, marginBottom: 12 }}>
        {cls.chapters.length === 0 && !adding && <Empty text="No chapters added yet" />}
        {cls.chapters.map(ch => {
          const meta = statusMeta[ch.status] ?? statusMeta.upcoming;
          return (
            <div key={ch.id} style={{ display: "flex", alignItems: "center", gap: 12, background: "var(--card)", border: "1px solid var(--line)", borderRadius: 14, padding: "12px 14px" }}>
              <div style={{ width: 32, height: 32, borderRadius: 10, background: "var(--c-soft)", color: "var(--c-ink)", fontFamily: "var(--ff-display)", fontSize: 18, display: "grid", placeItems: "center", flexShrink: 0 }}>{ch.number}</div>
              <span style={{ flex: 1, fontSize: 14.5, fontWeight: 500, color: "var(--ink)" }}>{ch.title}</span>
              <select value={ch.status} onChange={async e => { await fetch(`/api/chapters/${ch.id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status: e.target.value }) }); onRefresh(); }}
                style={{ fontSize: 12, fontWeight: 600, padding: "5px 24px 5px 10px", borderRadius: 99, border: 0, cursor: "pointer", background: meta.bg, color: meta.fg, appearance: "none", outline: "none" }}>
                <option value="upcoming">Upcoming</option>
                <option value="in-progress">In progress</option>
                <option value="completed">Completed</option>
              </select>
              <button onClick={async () => { await fetch(`/api/chapters/${ch.id}`, { method: "DELETE" }); onRefresh(); }} style={iconBtnStyle}><X size={14} /></button>
            </div>
          );
        })}
      </div>
      {adding ? (
        <div style={{ background: "var(--card)", border: "1px solid var(--c)", borderRadius: 14, padding: 14 }}>
          <div style={{ display: "flex", gap: 8, marginBottom: 10 }}>
            <input placeholder="No." value={form.number} onChange={e => setForm(f => ({ ...f, number: e.target.value }))} style={{ ...inputSm, width: 70, textAlign: "center" }} />
            <input placeholder="Chapter title" autoFocus value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} onKeyDown={e => e.key === "Enter" && add()} style={inputSm} />
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <button onClick={add} style={btnCoral}><Check size={14} strokeWidth={2.2} /> Add</button>
            <button onClick={() => { setAdding(false); setForm({ number: "", title: "" }); }} style={btnGhost}>Cancel</button>
          </div>
        </div>
      ) : (
        <button onClick={() => setAdding(true)} style={addLinkStyle}><Plus size={14} strokeWidth={2.2} /> Add chapter</button>
      )}
    </div>
  );
}

// ─── Homework (with per-student tracking) ─────────────────────────────────────
function HomeworkTab({ cls, classId, onRefresh }: { cls: ClassData; classId: string; onRefresh: () => void }) {
  const [adding, setAdding] = useState(false);
  const [form, setForm]  = useState({ title: "", description: "", dueDate: "" });
  const [expanded, setExpanded] = useState<string | null>(null);
  const [students, setStudents] = useState<Student[]>([]);
  const [submissions, setSubmissions] = useState<Record<string, Set<string>>>({}); // hwId -> Set of studentIds

  useEffect(() => {
    fetch(`/api/students?classId=${classId}`).then(r => r.json()).then(setStudents);
  }, [classId]);

  async function loadSubmissions(hwId: string) {
    const res = await fetch(`/api/homework-submissions?homeworkId=${hwId}`);
    const data = await res.json();
    setSubmissions(prev => ({ ...prev, [hwId]: new Set(data.map((s: { student: { id: string } }) => s.student.id)) }));
  }

  async function toggleSubmission(hwId: string, studentId: string) {
    const submitted = submissions[hwId]?.has(studentId);
    if (submitted) {
      await fetch("/api/homework-submissions", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ homeworkId: hwId, studentId }) });
      setSubmissions(prev => { const s = new Set(prev[hwId]); s.delete(studentId); return { ...prev, [hwId]: s }; });
    } else {
      await fetch("/api/homework-submissions", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ homeworkId: hwId, studentId }) });
      setSubmissions(prev => { const s = new Set(prev[hwId]); s.add(studentId); return { ...prev, [hwId]: s }; });
    }
  }

  function handleExpand(hwId: string) {
    if (expanded === hwId) { setExpanded(null); return; }
    setExpanded(hwId);
    if (!submissions[hwId]) loadSubmissions(hwId);
  }

  const statusMeta: Record<string, { label: string; bg: string; fg: string; side: string }> = {
    pending:   { label: "Pending",   bg: "var(--butter-soft)", fg: "var(--butter-ink)", side: "var(--butter)" },
    submitted: { label: "Submitted", bg: "var(--sky-soft)",    fg: "var(--sky-ink)",    side: "var(--sky)" },
    graded:    { label: "Graded",    bg: "var(--mint-soft)",   fg: "var(--mint-ink)",   side: "var(--mint)" },
  };
  const sorted = [...cls.homework].sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());

  return (
    <div>
      <div style={{ display: "grid", gap: 8, marginBottom: 12 }}>
        {sorted.length === 0 && !adding && <Empty text="No homework assigned yet" />}
        {sorted.map(hw => {
          const meta    = statusMeta[hw.status] ?? statusMeta.pending;
          const overdue = hw.status === "pending" && new Date(hw.dueDate) < new Date();
          const isOpen  = expanded === hw.id;
          const subs    = submissions[hw.id];
          const subCount = subs?.size ?? 0;

          return (
            <div key={hw.id} style={{ background: "var(--card)", border: "1px solid var(--line)", borderLeft: `4px solid ${overdue ? "var(--coral)" : meta.side}`, borderRadius: 14, overflow: "hidden" }}>
              <div style={{ padding: "12px 14px", display: "flex", alignItems: "flex-start", gap: 12 }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 14.5, fontWeight: 600, color: "var(--ink)" }}>{hw.title}</div>
                  {hw.description && <div style={{ fontSize: 13, color: "var(--ink-3)", marginTop: 3 }}>{hw.description}</div>}
                  <div style={{ marginTop: 6, fontSize: 12, display: "flex", alignItems: "center", gap: 10 }}>
                    {overdue
                      ? <span style={{ color: "var(--coral-ink)", fontWeight: 600, display: "inline-flex", alignItems: "center", gap: 4 }}><AlertCircle size={11} strokeWidth={2.2} /> Overdue · {new Date(hw.dueDate).toLocaleDateString("en-MY", { day: "numeric", month: "short" })}</span>
                      : <span style={{ color: "var(--ink-3)" }}>Due {new Date(hw.dueDate).toLocaleDateString("en-MY", { day: "numeric", month: "short", year: "numeric" })}</span>}
                    {students.length > 0 && (
                      <span style={{ color: "var(--ink-4)", fontWeight: 500 }}>
                        {subs ? `${subCount}/${students.length} submitted` : `${students.length} students`}
                      </span>
                    )}
                  </div>
                </div>
                <button onClick={async () => {
                  const next = hw.status === "pending" ? "submitted" : hw.status === "submitted" ? "graded" : "pending";
                  await fetch(`/api/homework/${hw.id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status: next }) }); onRefresh();
                }} style={{ background: meta.bg, color: meta.fg, fontSize: 12, fontWeight: 600, padding: "5px 12px", borderRadius: 99, border: 0, cursor: "pointer", flexShrink: 0 }}>{meta.label}</button>
                {students.length > 0 && (
                  <button onClick={() => handleExpand(hw.id)} style={{ ...iconBtnStyle, color: isOpen ? "var(--ink-2)" : "var(--ink-4)" }}>
                    {isOpen ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                  </button>
                )}
                <button onClick={async () => { await fetch(`/api/homework/${hw.id}`, { method: "DELETE" }); onRefresh(); }} style={iconBtnStyle}><X size={14} /></button>
              </div>

              {/* Per-student submission panel */}
              {isOpen && students.length > 0 && (
                <div style={{ borderTop: "1px solid var(--line)", padding: "12px 14px", background: "var(--bg)", display: "grid", gap: 6 }}>
                  <p style={{ margin: "0 0 8px", fontSize: 11, fontWeight: 600, color: "var(--ink-3)", textTransform: "uppercase", letterSpacing: "0.06em" }}>Student Submissions</p>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 6 }}>
                    {students.map((s, i) => {
                      const done = subs?.has(s.id) ?? false;
                      const col = ["coral","mint","butter","lavender","sky"][i % 5];
                      return (
                        <button key={s.id} onClick={() => toggleSubmission(hw.id, s.id)} className={`cc-${col}`}
                          style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 10px", borderRadius: 10, border: `1px solid ${done ? "var(--mint)" : "var(--line)"}`, background: done ? "var(--mint-soft)" : "var(--card)", cursor: "pointer", textAlign: "left" }}>
                          <div style={{ width: 24, height: 24, borderRadius: 7, background: done ? "var(--mint)" : "var(--c-soft)", display: "grid", placeItems: "center", flexShrink: 0 }}>
                            {done ? <Check size={12} color="white" strokeWidth={2.5} /> : <span style={{ fontSize: 11, color: "var(--c-ink)", fontWeight: 700 }}>{s.name.charAt(0)}</span>}
                          </div>
                          <span style={{ fontSize: 13, fontWeight: 500, color: done ? "var(--mint-ink)" : "var(--ink-2)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{s.name}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
      {adding ? (
        <div style={{ background: "var(--card)", border: "1px solid var(--c)", borderRadius: 14, padding: 14, display: "grid", gap: 10 }}>
          <input placeholder="Homework title *" autoFocus value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} style={inputSm} />
          <input placeholder="Description (optional)" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} style={inputSm} />
          <input type="date" value={form.dueDate} onChange={e => setForm(f => ({ ...f, dueDate: e.target.value }))} style={inputSm} />
          <div style={{ display: "flex", gap: 8 }}>
            <button onClick={async () => {
              if (!form.title || !form.dueDate) return;
              await fetch("/api/homework", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ classId: cls.id, ...form }) });
              setForm({ title: "", description: "", dueDate: "" }); setAdding(false); onRefresh();
            }} style={btnCoral}><Check size={14} strokeWidth={2.2} /> Save</button>
            <button onClick={() => setAdding(false)} style={btnGhost}>Cancel</button>
          </div>
        </div>
      ) : (
        <button onClick={() => setAdding(true)} style={addLinkStyle}><Plus size={14} strokeWidth={2.2} /> Add homework</button>
      )}
    </div>
  );
}

// ─── Attendance ───────────────────────────────────────────────────────────────
type AttendanceRecord = { studentId: string; status: string; student: { id: string; name: string } };
const ATT_STATUS = ["present", "absent", "late"] as const;
const ATT_META: Record<string, { label: string; bg: string; fg: string; border: string }> = {
  present: { label: "Present", bg: "var(--mint-soft)",   fg: "var(--mint-ink)",   border: "var(--mint)" },
  absent:  { label: "Absent",  bg: "var(--coral-soft)",  fg: "var(--coral-ink)",  border: "var(--coral)" },
  late:    { label: "Late",    bg: "var(--butter-soft)", fg: "var(--butter-ink)", border: "var(--butter)" },
};

function AttendanceTab({ classId }: { classId: string }) {
  const today = new Date().toISOString().split("T")[0];
  const [date, setDate] = useState(today);
  const [students, setStudents]   = useState<Student[]>([]);
  const [records, setRecords]     = useState<Record<string, string>>({}); // studentId -> status
  const [saving, setSaving]       = useState(false);
  const [saved, setSaved]         = useState(false);

  useEffect(() => {
    fetch(`/api/students?classId=${classId}`).then(r => r.json()).then((s: Student[]) => {
      setStudents(s);
      // default everyone to present
      const defaults: Record<string, string> = {};
      s.forEach(st => { defaults[st.id] = "present"; });
      setRecords(defaults);
    });
  }, [classId]);

  useEffect(() => {
    if (!students.length) return;
    fetch(`/api/attendance?classId=${classId}&date=${date}`)
      .then(r => r.json())
      .then((data: AttendanceRecord[]) => {
        const map: Record<string, string> = {};
        students.forEach(s => { map[s.id] = "present"; }); // default
        data.forEach(r => { map[r.studentId] = r.status; });
        setRecords(map);
      });
  }, [date, students, classId]);

  async function save() {
    setSaving(true);
    const payload = students.map(s => ({ studentId: s.id, status: records[s.id] ?? "present" }));
    await fetch("/api/attendance", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ classId, date, records: payload }) });
    setSaving(false); setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  const counts = { present: 0, absent: 0, late: 0 };
  students.forEach(s => { const st = records[s.id] ?? "present"; if (st in counts) counts[st as keyof typeof counts]++; });

  if (students.length === 0) return <Empty text="No students yet — add students in the Books tab first" />;

  return (
    <div style={{ display: "grid", gap: 20 }}>
      {/* Date picker + summary */}
      <div style={{ display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap" }}>
        <input type="date" value={date} onChange={e => setDate(e.target.value)} style={{ ...inputSm, width: "auto" }} />
        <div style={{ display: "flex", gap: 8 }}>
          {(["present","absent","late"] as const).map(s => (
            <span key={s} style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "4px 10px", borderRadius: 99, fontSize: 12, fontWeight: 600, background: ATT_META[s].bg, color: ATT_META[s].fg }}>
              {counts[s]} {ATT_META[s].label}
            </span>
          ))}
        </div>
      </div>

      {/* Student list */}
      <div style={{ display: "grid", gap: 8 }}>
        {students.map((s, i) => {
          const status = records[s.id] ?? "present";
          const col = ["coral","mint","butter","lavender","sky"][i % 5];
          return (
            <div key={s.id} className={`cc-${col}`} style={{ display: "flex", alignItems: "center", gap: 12, background: "var(--card)", border: "1px solid var(--line)", borderRadius: 14, padding: "10px 14px" }}>
              <div style={{ width: 34, height: 34, borderRadius: 10, background: "var(--c-soft)", color: "var(--c-ink)", display: "grid", placeItems: "center", fontFamily: "var(--ff-display)", fontSize: 16, flexShrink: 0 }}>{s.name.charAt(0)}</div>
              <span style={{ flex: 1, fontSize: 14, fontWeight: 500, color: "var(--ink)" }}>{s.name}</span>
              <div style={{ display: "flex", gap: 6 }}>
                {ATT_STATUS.map(st => {
                  const m = ATT_META[st];
                  const active = status === st;
                  return (
                    <button key={st} onClick={() => setRecords(r => ({ ...r, [s.id]: st }))}
                      style={{ padding: "5px 12px", borderRadius: 99, border: `1.5px solid ${active ? m.border : "var(--line)"}`, background: active ? m.bg : "transparent", color: active ? m.fg : "var(--ink-4)", fontSize: 12, fontWeight: active ? 700 : 500, cursor: "pointer", transition: "all .12s" }}>
                      {m.label}
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      <div style={{ display: "flex", gap: 10 }}>
        <button onClick={save} disabled={saving} style={{ ...btnCoral, opacity: saving ? .6 : 1 }}>
          {saving ? "Saving…" : saved ? <><Check size={14} strokeWidth={2.5} /> Saved!</> : <><Check size={14} strokeWidth={2.2} /> Save attendance</>}
        </button>
      </div>
    </div>
  );
}

// ─── Marks ────────────────────────────────────────────────────────────────────
type Assessment = { id: string; title: string; maxScore: number; date: string; marks: { studentId: string; score: number; student: { id: string; name: string } }[] };

function MarksTab({ classId }: { classId: string }) {
  const [students, setStudents]     = useState<Student[]>([]);
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [adding, setAdding]         = useState(false);
  const [form, setForm]             = useState({ title: "", maxScore: "100", date: new Date().toISOString().split("T")[0] });
  const [editing, setEditing]       = useState<string | null>(null); // assessmentId
  const [scores, setScores]         = useState<Record<string, string>>({});

  async function load() {
    const [sRes, aRes] = await Promise.all([
      fetch(`/api/students?classId=${classId}`),
      fetch(`/api/assessments?classId=${classId}`),
    ]);
    setStudents(await sRes.json());
    setAssessments(await aRes.json());
  }
  useEffect(() => { load(); }, [classId]);

  async function createAssessment() {
    if (!form.title || !form.date) return;
    await fetch("/api/assessments", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ classId, ...form }) });
    setForm({ title: "", maxScore: "100", date: new Date().toISOString().split("T")[0] });
    setAdding(false); load();
  }

  function startEditing(a: Assessment) {
    setEditing(a.id);
    const map: Record<string, string> = {};
    a.marks.forEach(m => { map[m.studentId] = String(m.score); });
    setScores(map);
  }

  async function saveMarks(assessmentId: string) {
    const marks = students.map(s => ({ studentId: s.id, score: parseFloat(scores[s.id] ?? "0") || 0 }));
    await fetch(`/api/assessments/${assessmentId}/marks`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ marks }) });
    setEditing(null); load();
  }

  if (students.length === 0) return <Empty text="No students yet — add students in the Books tab first" />;

  return (
    <div style={{ display: "grid", gap: 20 }}>
      {assessments.length === 0 && !adding && <Empty text="No assessments yet — add one below" />}

      {assessments.map(a => {
        const markMap: Record<string, number> = {};
        a.marks.forEach(m => { markMap[m.studentId] = m.score; });
        const scored  = a.marks.length;
        const avg     = scored ? Math.round(a.marks.reduce((s, m) => s + m.score, 0) / scored) : null;
        const highest = scored ? Math.max(...a.marks.map(m => m.score)) : null;
        const isEdit  = editing === a.id;

        return (
          <div key={a.id} style={{ background: "var(--card)", border: "1px solid var(--line)", borderRadius: 18, overflow: "hidden" }}>
            <div style={{ padding: "14px 16px", display: "flex", alignItems: "center", gap: 12, borderBottom: isEdit ? "1px solid var(--line)" : "none" }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 15, fontWeight: 600, color: "var(--ink)" }}>{a.title}</div>
                <div style={{ fontSize: 12, color: "var(--ink-3)", marginTop: 2 }}>
                  {new Date(a.date).toLocaleDateString("en-MY", { day: "numeric", month: "short", year: "numeric" })} · Max: {a.maxScore}
                  {avg !== null && <span style={{ marginLeft: 10, color: "var(--sky-ink)", fontWeight: 600 }}>Avg: {avg}</span>}
                  {highest !== null && <span style={{ marginLeft: 8, color: "var(--mint-ink)", fontWeight: 600 }}>Top: {highest}</span>}
                </div>
              </div>
              {!isEdit && <button onClick={() => startEditing(a)} style={{ ...btnGhost, padding: "6px 12px", fontSize: 12.5 }}>Enter marks</button>}
              {isEdit  && <button onClick={() => saveMarks(a.id)} style={{ ...btnCoral, padding: "6px 12px", fontSize: 12.5 }}><Check size={13} /> Save</button>}
              {isEdit  && <button onClick={() => setEditing(null)} style={{ ...btnGhost, padding: "6px 12px", fontSize: 12.5 }}>Cancel</button>}
              <button onClick={async () => { await fetch(`/api/assessments/${a.id}`, { method: "DELETE" }); load(); }} style={iconBtnStyle}><X size={14} /></button>
            </div>

            {isEdit && (
              <div style={{ padding: "12px 16px", background: "var(--bg)", display: "grid", gap: 6 }}>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 8 }}>
                  {students.map((s, i) => {
                    const col = ["coral","mint","butter","lavender","sky"][i % 5];
                    const val = scores[s.id] ?? "";
                    const num = parseFloat(val);
                    const pct = !isNaN(num) ? num / a.maxScore : null;
                    const scoreColor = pct === null ? "var(--ink-3)" : pct >= 0.7 ? "var(--mint-ink)" : pct >= 0.5 ? "var(--butter-ink)" : "var(--coral-ink)";
                    return (
                      <div key={s.id} className={`cc-${col}`} style={{ display: "flex", alignItems: "center", gap: 8, background: "var(--card)", border: "1px solid var(--line)", borderRadius: 10, padding: "8px 10px" }}>
                        <div style={{ width: 28, height: 28, borderRadius: 8, background: "var(--c-soft)", color: "var(--c-ink)", display: "grid", placeItems: "center", fontFamily: "var(--ff-display)", fontSize: 13, flexShrink: 0 }}>{s.name.charAt(0)}</div>
                        <span style={{ flex: 1, fontSize: 13, color: "var(--ink-2)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{s.name}</span>
                        <input type="number" min={0} max={a.maxScore} placeholder="–" value={val}
                          onChange={e => setScores(sc => ({ ...sc, [s.id]: e.target.value }))}
                          style={{ width: 56, padding: "5px 8px", border: "1px solid var(--line)", borderRadius: 8, fontSize: 13, fontWeight: 700, color: scoreColor, background: "var(--bg)", outline: "none", textAlign: "center", fontFamily: "var(--ff-ui)" }} />
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Score summary bar (when not editing) */}
            {!isEdit && scored > 0 && (
              <div style={{ padding: "8px 16px 14px" }}>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))", gap: 6 }}>
                  {students.map((s, i) => {
                    const score = markMap[s.id];
                    const col = ["coral","mint","butter","lavender","sky"][i % 5];
                    const pct  = score !== undefined ? score / a.maxScore : null;
                    const barColor = pct === null ? "var(--line)" : pct >= 0.7 ? "var(--mint)" : pct >= 0.5 ? "var(--butter)" : "var(--coral)";
                    return (
                      <div key={s.id} className={`cc-${col}`} style={{ display: "flex", alignItems: "center", gap: 7 }}>
                        <div style={{ width: 22, height: 22, borderRadius: 6, background: "var(--c-soft)", color: "var(--c-ink)", display: "grid", placeItems: "center", fontSize: 10, fontWeight: 700, flexShrink: 0 }}>{s.name.charAt(0)}</div>
                        <span style={{ fontSize: 12, color: "var(--ink-3)", flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{s.name}</span>
                        <span style={{ fontSize: 12.5, fontWeight: 700, color: barColor }}>
                          {score !== undefined ? `${score}/${a.maxScore}` : "–"}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        );
      })}

      {adding ? (
        <div style={{ background: "var(--card)", border: "1px solid var(--c)", borderRadius: 14, padding: 14, display: "grid", gap: 10 }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr auto auto", gap: 10 }}>
            <input autoFocus placeholder="Assessment title *" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} style={inputSm} />
            <input type="number" placeholder="Max" value={form.maxScore} onChange={e => setForm(f => ({ ...f, maxScore: e.target.value }))} style={{ ...inputSm, width: 80, textAlign: "center" }} />
            <input type="date" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} style={{ ...inputSm, width: "auto" }} />
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <button onClick={createAssessment} style={btnCoral}><Check size={14} strokeWidth={2.2} /> Create</button>
            <button onClick={() => setAdding(false)} style={btnGhost}>Cancel</button>
          </div>
        </div>
      ) : (
        <button onClick={() => setAdding(true)} style={addLinkStyle}><Plus size={14} strokeWidth={2.2} /> Add assessment</button>
      )}
    </div>
  );
}

// ─── Notes ────────────────────────────────────────────────────────────────────
const NOTE_COLORS = ["butter", "mint", "lavender", "coral", "sky"];
function NotesTab({ cls, onRefresh }: { cls: ClassData; onRefresh: () => void }) {
  const [text, setText]   = useState("");
  const [saving, setSaving] = useState(false);

  async function addNote() {
    if (!text.trim()) return;
    setSaving(true);
    await fetch("/api/notes", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ classId: cls.id, content: text.trim() }) });
    setText(""); setSaving(false); onRefresh();
  }

  return (
    <div>
      <div style={{ background: "var(--card)", border: "1px solid var(--line)", borderRadius: 14, padding: 14, marginBottom: 24 }}>
        <textarea rows={3} placeholder="Write a remark, reminder, or observation…" value={text}
          onChange={e => setText(e.target.value)}
          onKeyDown={e => { if (e.key === "Enter" && e.metaKey) addNote(); }}
          style={{ width: "100%", resize: "none", border: 0, outline: "none", background: "transparent", fontSize: 14, color: "var(--ink)", lineHeight: 1.5, fontFamily: "var(--ff-ui)" }} />
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: "1px solid var(--line)", paddingTop: 10, marginTop: 6 }}>
          <span style={{ fontSize: 11, color: "var(--ink-4)" }}>⌘↵ to save</span>
          <button onClick={addNote} disabled={saving || !text.trim()} style={{ ...btnCoral, opacity: saving || !text.trim() ? .4 : 1, padding: "8px 14px", fontSize: 13 }}>
            <Plus size={13} strokeWidth={2.2} /> Add note
          </button>
        </div>
      </div>
      {cls.notes.length === 0 && <Empty text="No notes yet — jot a remark above" />}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: 14 }}>
        {cls.notes.map((note, i) => {
          const c = NOTE_COLORS[i % NOTE_COLORS.length];
          const rotation = ["-0.6deg", "0.4deg", "-0.3deg", "0.7deg"][i % 4];
          return (
            <div key={note.id} className={`cc-${c}`} style={{ background: "var(--c-soft)", border: "1px solid var(--c)", borderRadius: 14, padding: 16, position: "relative", transform: `rotate(${rotation})`, boxShadow: "var(--shadow-sm)" }}>
              <div style={{ position: "absolute", top: -8, left: "50%", transform: "translateX(-50%)", width: 14, height: 14, borderRadius: 99, background: "var(--c)", boxShadow: "0 1px 0 rgba(255,255,255,.4) inset, 0 4px 8px -2px var(--c-ink)" }} />
              <p style={{ margin: 0, fontSize: 14, lineHeight: 1.55, color: "var(--ink)", whiteSpace: "pre-wrap" }}>{note.content}</p>
              <p style={{ margin: "12px 0 0", fontSize: 11, color: "var(--c-ink)", fontWeight: 500 }}>{new Date(note.createdAt).toLocaleDateString("en-MY", { day: "numeric", month: "short", year: "numeric" })}</p>
              <button onClick={async () => { await fetch(`/api/notes/${note.id}`, { method: "DELETE" }); onRefresh(); }} style={{ ...iconBtnStyle, position: "absolute", top: 8, right: 8 }}><X size={12} /></button>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Contacts ─────────────────────────────────────────────────────────────────
type ContactEntry = { id: string; student: string; note: string; date: string };
function ContactsTab({ classId }: { classId: string }) {
  const [logs, setLogs]     = useState<ContactEntry[]>([]);
  const [form, setForm]     = useState({ student: "", note: "", date: new Date().toISOString().split("T")[0] });
  const [adding, setAdding] = useState(false);
  const [students, setStudents] = useState<Student[]>([]);

  async function load() {
    const [lRes, sRes] = await Promise.all([fetch(`/api/contacts?classId=${classId}`), fetch(`/api/students?classId=${classId}`)]);
    setLogs(await lRes.json());
    setStudents(await sRes.json());
  }
  useEffect(() => { load(); }, [classId]);

  async function add() {
    if (!form.student || !form.note) return;
    await fetch("/api/contacts", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ classId, ...form }) });
    setForm({ student: "", note: "", date: new Date().toISOString().split("T")[0] });
    setAdding(false); load();
  }

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <p style={{ margin: 0, fontSize: 13, color: "var(--ink-3)" }}>Log parent/guardian contact notes</p>
        <button onClick={() => setAdding(v => !v)} style={{ ...btnCoral, padding: "8px 14px", fontSize: 13 }}><Plus size={13} strokeWidth={2.2} /> New log</button>
      </div>

      {adding && (
        <div style={{ background: "var(--card)", border: "1px solid var(--coral)", borderRadius: 14, padding: 16, marginBottom: 16, display: "grid", gap: 10 }}>
          {students.length > 0 ? (
            <select value={form.student} onChange={e => setForm(f => ({ ...f, student: e.target.value }))} style={{ ...inputSm, appearance: "none" }}>
              <option value="">Select student…</option>
              {students.map(s => <option key={s.id} value={s.name}>{s.name}</option>)}
            </select>
          ) : (
            <input placeholder="Student name" value={form.student} onChange={e => setForm(f => ({ ...f, student: e.target.value }))} style={inputSm} />
          )}
          <input type="date" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} style={inputSm} />
          <textarea rows={3} autoFocus placeholder="What was discussed? Any follow-up needed?" value={form.note}
            onChange={e => setForm(f => ({ ...f, note: e.target.value }))}
            style={{ ...inputSm, resize: "vertical", lineHeight: 1.5 }} />
          <div style={{ display: "flex", gap: 8 }}>
            <button onClick={add} style={btnCoral}><Check size={14} strokeWidth={2.2} /> Save</button>
            <button onClick={() => setAdding(false)} style={btnGhost}>Cancel</button>
          </div>
        </div>
      )}

      {logs.length === 0 && !adding && <Empty text="No contact logs yet — record parent communications here" />}

      <div style={{ display: "grid", gap: 10 }}>
        {logs.map(log => (
          <div key={log.id} style={{ background: "var(--card)", border: "1px solid var(--line)", borderRadius: 14, padding: "14px 16px", display: "flex", gap: 14 }}>
            <div style={{ width: 38, height: 38, borderRadius: 12, background: "var(--sky-soft)", display: "grid", placeItems: "center", flexShrink: 0 }}>
              <Phone size={16} color="var(--sky-ink)" />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                <span style={{ fontSize: 14, fontWeight: 600, color: "var(--ink)" }}>{log.student}</span>
                <span style={{ fontSize: 11.5, color: "var(--ink-4)" }}>{new Date(log.date).toLocaleDateString("en-MY", { day: "numeric", month: "short", year: "numeric" })}</span>
              </div>
              <p style={{ margin: 0, fontSize: 13.5, color: "var(--ink-2)", lineHeight: 1.5, whiteSpace: "pre-wrap" }}>{log.note}</p>
            </div>
            <button onClick={async () => { await fetch("/api/contacts", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: log.id }) }); load(); }} style={iconBtnStyle}><X size={14} /></button>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Book Signing ─────────────────────────────────────────────────────────────
function BookSigningTab({ classId }: { classId: string }) {
  const router = useRouter();
  const [students, setStudents]   = useState<Student[]>([]);
  const [sessions, setSessions]   = useState<BookSession[]>([]);
  const [importing, setImporting] = useState(false);
  const [importText, setImportText] = useState("");
  const [editingStudent, setEditingStudent] = useState<string | null>(null);
  const [editTag, setEditTag]     = useState("");
  const CLASS_PALETTE = ["coral", "mint", "butter", "lavender", "sky"];

  async function load() {
    const [sRes, bRes] = await Promise.all([fetch(`/api/students?classId=${classId}`), fetch(`/api/book-sessions?classId=${classId}`)]);
    setStudents(await sRes.json());
    setSessions(await bRes.json());
  }
  useEffect(() => { load(); }, [classId]);

  const tagged = students.filter(s => s.rfidTag).length;

  return (
    <div style={{ display: "grid", gap: 28 }}>
      {/* Start CTA */}
      <div className="cc-coral" style={{ background: "linear-gradient(135deg, var(--coral) 0%, oklch(76% 0.13 50) 100%)", borderRadius: 22, padding: "22px 24px", position: "relative", overflow: "hidden", boxShadow: "0 1px 0 rgba(255,255,255,.3) inset, 0 16px 36px -16px var(--coral-ink)" }}>
        <svg width="180" height="180" viewBox="0 0 180 180" style={{ position: "absolute", right: -40, top: -40, opacity: .14 }}>
          <circle cx="90" cy="90" r="80" fill="none" stroke="white" strokeWidth="14" />
          <circle cx="90" cy="90" r="50" fill="none" stroke="white" strokeWidth="14" />
        </svg>
        <div style={{ display: "flex", alignItems: "center", gap: 18, position: "relative" }}>
          <div style={{ width: 56, height: 56, borderRadius: 18, background: "rgba(255,255,255,.22)", display: "grid", placeItems: "center", color: "white" }}>
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12.55a11 11 0 0 1 14.08 0"/><path d="M1.42 9a16 16 0 0 1 21.16 0"/><path d="M8.53 16.11a6 6 0 0 1 6.95 0"/><circle cx="12" cy="20" r="1" fill="currentColor"/></svg>
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontFamily: "var(--ff-display)", fontSize: 28, color: "white", lineHeight: 1.1 }}>Start book check</div>
            <div style={{ fontSize: 14, color: "rgba(255,255,255,.85)", marginTop: 4 }}>{students.length} students · {tagged} RFID tags assigned</div>
          </div>
          <button onClick={() => router.push(`/classes/${classId}/book-signing`)} disabled={students.length === 0}
            style={{ background: "white", color: "var(--coral-ink)", padding: "12px 20px", border: 0, borderRadius: 14, cursor: students.length ? "pointer" : "not-allowed", fontSize: 14, fontWeight: 700, display: "inline-flex", alignItems: "center", gap: 8, opacity: students.length ? 1 : .5, boxShadow: "0 6px 14px -8px rgba(0,0,0,.3)" }}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"/></svg>
            Start marking
          </button>
        </div>
      </div>

      {/* Past sessions */}
      {sessions.length > 0 && (
        <div>
          <SectionHeader>Past sessions</SectionHeader>
          <div style={{ display: "grid", gap: 8 }}>
            {sessions.map(s => {
              const missing = students.length - s._count.submissions;
              return (
                <div key={s.id} style={{ background: "var(--card)", border: "1px solid var(--line)", borderRadius: 14, padding: "12px 14px", display: "flex", alignItems: "center", gap: 12 }}>
                  <div style={{ width: 38, height: 38, borderRadius: 12, background: "var(--lavender-soft)", color: "var(--lavender-ink)", display: "grid", placeItems: "center" }}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="8" height="12" x="8" y="2" rx="1"/><path d="M4 14h16"/></svg>
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 14, fontWeight: 600, color: "var(--ink)" }}>{new Date(s.createdAt).toLocaleDateString("en-MY", { weekday: "short", day: "numeric", month: "short", year: "numeric" })}</div>
                    <div style={{ fontSize: 12, color: "var(--ink-3)", marginTop: 2 }}>{s._count.submissions}/{students.length} submitted{missing > 0 && <span style={{ color: "var(--coral-ink)", fontWeight: 600 }}> · {missing} missing</span>}</div>
                  </div>
                  {missing > 0
                    ? <span style={{ fontSize: 11.5, padding: "3px 10px", borderRadius: 99, background: "var(--coral-soft)", color: "var(--coral-ink)", fontWeight: 600 }}>{missing} missing</span>
                    : <span style={{ fontSize: 11.5, padding: "3px 10px", borderRadius: 99, background: "var(--mint-soft)", color: "var(--mint-ink)", fontWeight: 600, display: "inline-flex", alignItems: "center", gap: 4 }}><Check size={11} strokeWidth={2.4} /> All in</span>}
                  <button onClick={async () => { await fetch(`/api/book-sessions/${s.id}`, { method: "DELETE" }); load(); }} style={iconBtnStyle}><X size={13} /></button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Students */}
      <div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
          <SectionHeader inline>Students ({students.length})</SectionHeader>
          <button onClick={() => setImporting(true)} style={{ background: "transparent", border: 0, cursor: "pointer", color: "var(--coral-ink)", fontSize: 12.5, fontWeight: 600, display: "inline-flex", alignItems: "center", gap: 5 }}>
            <Plus size={12} strokeWidth={2.4} /> Import list
          </button>
        </div>
        {importing && (
          <div style={{ background: "var(--card)", border: "1px solid var(--coral)", borderRadius: 14, padding: 14, marginBottom: 12 }}>
            <p style={{ margin: "0 0 8px", fontSize: 11, fontWeight: 600, color: "var(--ink-3)", textTransform: "uppercase", letterSpacing: "0.06em" }}>Paste names — one per line</p>
            <textarea rows={6} autoFocus placeholder={"Ahmad Faris\nSiti Aisyah\nMuhammad Harith…"} value={importText} onChange={e => setImportText(e.target.value)}
              style={{ width: "100%", padding: "10px 12px", border: "1px solid var(--line)", borderRadius: 10, background: "var(--card)", color: "var(--ink)", fontSize: 14, outline: "none", fontFamily: "var(--ff-ui)", resize: "vertical" }} />
            <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
              <button onClick={async () => {
                const names = importText.split("\n").map(n => n.trim()).filter(Boolean);
                if (!names.length) return;
                await fetch("/api/students/import", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ classId, names }) });
                setImportText(""); setImporting(false); load();
              }} style={btnCoral}>Import {importText.split("\n").filter(l => l.trim()).length} students</button>
              <button onClick={() => { setImporting(false); setImportText(""); }} style={btnGhost}>Cancel</button>
            </div>
          </div>
        )}
        {students.length === 0 && !importing && <Empty text="No students yet — import a list to get started" />}
        <div style={{ display: "grid", gap: 8 }}>
          {students.map((s, i) => {
            const col = CLASS_PALETTE[i % CLASS_PALETTE.length];
            return (
              <div key={s.id} className={`cc-${col}`} style={{ background: "var(--card)", border: "1px solid var(--line)", borderRadius: 14, padding: "10px 14px", display: "flex", alignItems: "center", gap: 12 }}>
                <div style={{ width: 34, height: 34, borderRadius: 10, background: "var(--c-soft)", color: "var(--c-ink)", display: "grid", placeItems: "center", fontFamily: "var(--ff-display)", fontSize: 16 }}>{s.name.charAt(0)}</div>
                <span style={{ flex: 1, fontSize: 14, fontWeight: 500, color: "var(--ink)" }}>{s.name}</span>
                {editingStudent === s.id ? (
                  <div style={{ display: "flex", gap: 6 }}>
                    <input autoFocus placeholder="A4:F3:0X" value={editTag} onChange={e => setEditTag(e.target.value)}
                      onKeyDown={async e => {
                        if (e.key === "Enter") { await fetch(`/api/students/${s.id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name: s.name, rfidTag: editTag || null }) }); setEditingStudent(null); load(); }
                        if (e.key === "Escape") setEditingStudent(null);
                      }}
                      style={{ width: 130, padding: "6px 10px", fontSize: 12, fontFamily: "ui-monospace, monospace", border: "1px solid var(--coral)", borderRadius: 8, outline: "none", background: "var(--card)", color: "var(--ink)" }} />
                    <button onClick={async () => { await fetch(`/api/students/${s.id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name: s.name, rfidTag: editTag || null }) }); setEditingStudent(null); load(); }} style={{ ...btnCoral, padding: "6px 10px", fontSize: 12 }}>Save</button>
                  </div>
                ) : (
                  <button onClick={() => { setEditingStudent(s.id); setEditTag(s.rfidTag ?? ""); }} style={{ background: s.rfidTag ? "var(--card-warm)" : "transparent", border: `1px dashed ${s.rfidTag ? "transparent" : "var(--line-2)"}`, color: s.rfidTag ? "var(--ink-2)" : "var(--ink-4)", fontSize: 11.5, padding: "5px 10px", borderRadius: 8, fontFamily: "ui-monospace, monospace", cursor: "pointer" }}>
                    {s.rfidTag ?? "set tag"}
                  </button>
                )}
                <button onClick={async () => { await fetch(`/api/students/${s.id}`, { method: "DELETE" }); load(); }} style={iconBtnStyle}><X size={14} /></button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ─── Textbooks ────────────────────────────────────────────────────────────────
type Textbook = { id: string; title: string; subject: string; filename: string; fileSize: number; remarks: string; addedAt: string };

function TextbooksTab({ classId, subject }: { classId: string; subject: string }) {
  const [books, setBooks]       = useState<Textbook[]>([]);
  const [uploading, setUploading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({
    title: "", subject, remarks: "",
    addedAt: new Date().toISOString().split("T")[0],
    file: null as File | null,
  });
  const [editForm, setEditForm] = useState({ title: "", subject: "", remarks: "" });

  async function load() {
    const res = await fetch(`/api/textbooks?classId=${classId}`);
    setBooks(await res.json());
  }
  useEffect(() => { load(); }, [classId]);

  async function upload() {
    if (!form.file || !form.title.trim()) return;
    setUploading(true);
    const fd = new FormData();
    fd.append("file",    form.file);
    fd.append("classId", classId);
    fd.append("title",   form.title.trim());
    fd.append("subject", form.subject.trim());
    fd.append("remarks", form.remarks.trim());
    fd.append("addedAt", form.addedAt);
    await fetch("/api/textbooks", { method: "POST", body: fd });
    setForm({ title: "", subject, remarks: "", addedAt: new Date().toISOString().split("T")[0], file: null });
    setShowForm(false);
    setUploading(false);
    load();
  }

  async function saveEdit(id: string) {
    await fetch(`/api/textbooks/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(editForm),
    });
    setEditingId(null);
    load();
  }

  function fmt(bytes: number) {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  }

  return (
    <div style={{ display: "grid", gap: 20 }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <p style={{ margin: 0, fontSize: 13, color: "var(--ink-3)" }}>
          PDF textbooks &amp; resources for this class
        </p>
        <button onClick={() => setShowForm(v => !v)} style={{ ...btnCoral, padding: "8px 14px", fontSize: 13 }}>
          <Upload size={13} strokeWidth={2.2} /> Upload PDF
        </button>
      </div>

      {/* Upload form */}
      {showForm && (
        <div style={{ background: "var(--card)", border: "1px solid var(--coral)", borderRadius: 16, padding: 20, display: "grid", gap: 12 }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            <div style={{ display: "grid", gap: 4 }}>
              <label style={{ fontSize: 11.5, fontWeight: 600, color: "var(--ink-3)", textTransform: "uppercase", letterSpacing: "0.06em" }}>Title *</label>
              <input placeholder="e.g. Year 4 English Textbook" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} style={inputSm} />
            </div>
            <div style={{ display: "grid", gap: 4 }}>
              <label style={{ fontSize: 11.5, fontWeight: 600, color: "var(--ink-3)", textTransform: "uppercase", letterSpacing: "0.06em" }}>Subject</label>
              <input placeholder={subject} value={form.subject} onChange={e => setForm(f => ({ ...f, subject: e.target.value }))} style={inputSm} />
            </div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            <div style={{ display: "grid", gap: 4 }}>
              <label style={{ fontSize: 11.5, fontWeight: 600, color: "var(--ink-3)", textTransform: "uppercase", letterSpacing: "0.06em" }}>Date Added</label>
              <input type="date" value={form.addedAt} onChange={e => setForm(f => ({ ...f, addedAt: e.target.value }))} style={inputSm} />
            </div>
            <div style={{ display: "grid", gap: 4 }}>
              <label style={{ fontSize: 11.5, fontWeight: 600, color: "var(--ink-3)", textTransform: "uppercase", letterSpacing: "0.06em" }}>PDF File *</label>
              <input type="file" accept=".pdf,application/pdf" onChange={e => setForm(f => ({ ...f, file: e.target.files?.[0] ?? null }))}
                style={{ ...inputSm, padding: "7px 12px", fontSize: 12.5 }} />
            </div>
          </div>
          <div style={{ display: "grid", gap: 4 }}>
            <label style={{ fontSize: 11.5, fontWeight: 600, color: "var(--ink-3)", textTransform: "uppercase", letterSpacing: "0.06em" }}>Remarks</label>
            <textarea rows={2} placeholder="e.g. Used for Chapter 3–5, supplementary reading…" value={form.remarks}
              onChange={e => setForm(f => ({ ...f, remarks: e.target.value }))}
              style={{ ...inputSm, resize: "vertical", lineHeight: 1.5 }} />
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <button onClick={upload} disabled={uploading || !form.file || !form.title.trim()} style={{ ...btnCoral, opacity: (uploading || !form.file || !form.title.trim()) ? 0.5 : 1 }}>
              {uploading ? <><Loader2 size={14} style={{ animation: "spin 0.7s linear infinite" }} /> Uploading…</> : <><Check size={14} /> Save</>}
            </button>
            <button onClick={() => setShowForm(false)} style={btnGhost}>Cancel</button>
          </div>
        </div>
      )}

      {/* Empty state */}
      {books.length === 0 && !showForm && (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 14, padding: "60px 20px", textAlign: "center" }}>
          <div style={{ width: 64, height: 64, borderRadius: 20, background: "var(--butter-soft)", display: "grid", placeItems: "center" }}>
            <FileText size={30} color="var(--butter-ink)" />
          </div>
          <div>
            <div style={{ fontSize: 15, fontWeight: 600, color: "var(--ink)", marginBottom: 4 }}>No textbooks yet</div>
            <div style={{ fontSize: 13, color: "var(--ink-3)" }}>Upload a PDF to keep all resources in one place</div>
          </div>
        </div>
      )}

      {/* Book cards */}
      <div style={{ display: "grid", gap: 10 }}>
        {books.map(book => (
          <div key={book.id} style={{ background: "var(--card)", border: "1px solid var(--line)", borderRadius: 16, overflow: "hidden" }}>
            {editingId === book.id ? (
              /* Edit mode */
              <div style={{ padding: 16, display: "grid", gap: 10 }}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                  <input placeholder="Title" value={editForm.title} onChange={e => setEditForm(f => ({ ...f, title: e.target.value }))} style={inputSm} autoFocus />
                  <input placeholder="Subject" value={editForm.subject} onChange={e => setEditForm(f => ({ ...f, subject: e.target.value }))} style={inputSm} />
                </div>
                <textarea rows={2} placeholder="Remarks" value={editForm.remarks} onChange={e => setEditForm(f => ({ ...f, remarks: e.target.value }))} style={{ ...inputSm, resize: "vertical" }} />
                <div style={{ display: "flex", gap: 8 }}>
                  <button onClick={() => saveEdit(book.id)} style={{ ...btnCoral, padding: "8px 14px", fontSize: 13 }}><Check size={13} /> Save</button>
                  <button onClick={() => setEditingId(null)} style={{ ...btnGhost, padding: "8px 14px", fontSize: 13 }}>Cancel</button>
                </div>
              </div>
            ) : (
              /* View mode */
              <div style={{ display: "flex", gap: 0 }}>
                {/* PDF icon strip */}
                <div style={{ width: 56, background: "var(--butter-soft)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <FileText size={22} color="var(--butter-ink)" />
                </div>
                <div style={{ flex: 1, padding: "14px 16px", minWidth: 0 }}>
                  <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 10 }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 15, fontWeight: 600, color: "var(--ink)", marginBottom: 3 }}>{book.title}</div>
                      <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
                        {book.subject && (
                          <span style={{ fontSize: 11.5, padding: "2px 8px", borderRadius: 99, background: "var(--lavender-soft)", color: "var(--lavender-ink)", fontWeight: 600 }}>{book.subject}</span>
                        )}
                        <span style={{ fontSize: 12, color: "var(--ink-4)" }}>
                          {new Date(book.addedAt).toLocaleDateString("en-MY", { day: "numeric", month: "short", year: "numeric" })}
                        </span>
                        <span style={{ fontSize: 11.5, color: "var(--ink-4)" }}>{fmt(book.fileSize)}</span>
                      </div>
                      {book.remarks && (
                        <p style={{ margin: "8px 0 0", fontSize: 13, color: "var(--ink-3)", lineHeight: 1.5 }}>{book.remarks}</p>
                      )}
                    </div>
                    {/* Actions */}
                    <div style={{ display: "flex", gap: 4, flexShrink: 0 }}>
                      <a href={`/uploads/textbooks/${book.filename}`} target="_blank" rel="noopener noreferrer"
                        title="Open PDF"
                        style={{ width: 32, height: 32, borderRadius: 9, border: "1px solid var(--line)", background: "var(--card-warm)", color: "var(--ink-3)", display: "grid", placeItems: "center", textDecoration: "none" }}>
                        <ExternalLink size={13} />
                      </a>
                      <button onClick={() => { setEditingId(book.id); setEditForm({ title: book.title, subject: book.subject, remarks: book.remarks }); }}
                        title="Edit" style={{ ...iconBtnStyle, width: 32, height: 32, border: "1px solid var(--line)", background: "var(--card-warm)" }}>
                        <Pencil size={13} />
                      </button>
                      <button onClick={async () => { await fetch(`/api/textbooks/${book.id}`, { method: "DELETE" }); load(); }}
                        title="Delete" style={{ ...iconBtnStyle, width: 32, height: 32, border: "1px solid var(--line)", background: "var(--card-warm)" }}>
                        <X size={13} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Shared helpers ───────────────────────────────────────────────────────────
function SectionHeader({ children, inline }: { children: React.ReactNode; inline?: boolean }) {
  return <h3 style={{ margin: inline ? 0 : "0 0 12px", fontSize: 11, fontWeight: 600, color: "var(--ink-3)", textTransform: "uppercase", letterSpacing: "0.08em", display: "inline-flex", alignItems: "center", gap: 6 }}>{children}</h3>;
}
function Empty({ text }: { text: string }) {
  return <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 10, padding: "40px 20px", color: "var(--ink-3)", fontSize: 13.5 }}>{text}</div>;
}

const inputSm: React.CSSProperties   = { flex: 1, padding: "10px 12px", border: "1px solid var(--line)", borderRadius: 10, background: "var(--card)", color: "var(--ink)", fontSize: 14, outline: "none", fontFamily: "var(--ff-ui)" };
const btnCoral: React.CSSProperties  = { display: "inline-flex", alignItems: "center", gap: 6, padding: "10px 16px", borderRadius: 12, border: 0, cursor: "pointer", background: "var(--coral)", color: "white", fontSize: 14, fontWeight: 600, fontFamily: "var(--ff-ui)" };
const btnGhost: React.CSSProperties  = { display: "inline-flex", alignItems: "center", gap: 6, padding: "10px 16px", borderRadius: 12, border: "1px solid var(--line)", cursor: "pointer", background: "transparent", color: "var(--ink-2)", fontSize: 14, fontWeight: 500, fontFamily: "var(--ff-ui)" };
const addLinkStyle: React.CSSProperties = { display: "inline-flex", alignItems: "center", gap: 6, padding: "8px 12px", background: "transparent", border: 0, cursor: "pointer", color: "var(--coral-ink)", fontSize: 13.5, fontWeight: 600, borderRadius: 8, fontFamily: "var(--ff-ui)" };
const iconBtnStyle: React.CSSProperties = { width: 26, height: 26, borderRadius: 8, border: 0, background: "transparent", color: "var(--ink-4)", cursor: "pointer", display: "grid", placeItems: "center" };
