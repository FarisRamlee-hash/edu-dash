import Link from "next/link";
import { db } from "@/lib/db";
import { AlertTriangle, Plus } from "lucide-react";

interface CChapter { id: string; number: number; title: string; status: string }
interface CHomework { id: string; title: string; dueDate: Date; status: string }
interface CStudent { id: string }
interface ClassRow { id: string; name: string; grade: string; subject: string; chapters: CChapter[]; homework: CHomework[]; students: CStudent[] }

export const dynamic = "force-dynamic";

const CLASS_COLORS = ["coral", "mint", "butter", "lavender", "sky", "coral", "mint", "butter"];
function classColor(name: string) {
  let h = 0;
  for (const c of name) h = (h * 31 + c.charCodeAt(0)) % CLASS_COLORS.length;
  return CLASS_COLORS[h];
}

function startOfWeek() {
  const d = new Date(); d.setHours(0, 0, 0, 0);
  const day = d.getDay();
  d.setDate(d.getDate() - (day === 0 ? 6 : day - 1));
  return d;
}
function endOfWeek() {
  const d = startOfWeek();
  d.setDate(d.getDate() + 6); d.setHours(23, 59, 59, 999);
  return d;
}

function greeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
}
function todayLabel() {
  return new Date().toLocaleDateString("en-MY", { weekday: "long", day: "numeric", month: "long" });
}

export default async function DashboardPage() {
  const classes = await db.class.findMany({
    orderBy: { createdAt: "asc" },
    include: {
      chapters: { orderBy: { number: "asc" } },
      homework: { orderBy: { dueDate: "asc" } },
      students: { select: { id: true } },
    },
  });

  const allClasses = classes as unknown as ClassRow[];
  const totalOverdue = allClasses.reduce((n, cls) =>
    n + cls.homework.filter(h => h.status === "pending" && new Date(h.dueDate) < new Date()).length, 0);
  const totalHW = allClasses.reduce((n, cls) =>
    n + cls.homework.filter(h => h.status === "pending").length, 0);

  return (
    <div className="fade-in page-outer">
      {/* Header */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 28 }}>
        <div>
          <p style={{ margin: 0, color: "var(--ink-3)", fontSize: 14 }}>{todayLabel()}</p>
          <h1 className="serif" style={{ margin: "6px 0 0", fontSize: 52, lineHeight: 1.02, color: "var(--ink)" }}>
            {greeting()},{" "}
            <span className="serif-i" style={{ color: "var(--coral-ink)" }}>Cikgu</span>
            <SquiggleUnder />
          </h1>
        </div>
        <Link href="/classes/new" style={{
          display: "inline-flex", alignItems: "center", gap: 8,
          padding: "10px 16px", borderRadius: 10, textDecoration: "none",
          background: "var(--ink)", color: "white", fontSize: 14, fontWeight: 700,
          transition: "background .15s",
        }}>
          <Plus size={16} strokeWidth={2.2} /> New class
        </Link>
      </div>

      {/* Stat cards */}
      {allClasses.length > 0 && (
        <div className="stat-grid">
          <StatCard label="Classes" value={allClasses.length} color="lavender" icon="bookmark" />
          <StatCard label="Pending homework" value={totalHW} color="butter" icon="clip" />
          <StatCard label="Overdue" value={totalOverdue} color={totalOverdue > 0 ? "coral" : "mint"} icon="alert" />
        </div>
      )}

      {/* Upcoming this week */}
      {allClasses.length > 0 && (() => {
        const now = new Date();
        const weekEnd = endOfWeek();
        const upcoming = allClasses.flatMap(cls =>
          cls.homework
            .filter(h => h.status === "pending" && new Date(h.dueDate) <= weekEnd)
            .map(h => ({ ...h, className: cls.name, classId: cls.id, color: classColor(cls.name), overdue: new Date(h.dueDate) < now }))
        ).sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());

        if (upcoming.length === 0) return null;
        return (
          <div style={{ marginBottom: 36 }}>
            <div style={{ display: "flex", alignItems: "baseline", gap: 12, marginBottom: 12 }}>
              <h2 className="serif" style={{ margin: 0, fontSize: 20, color: "var(--ink)" }}>This week</h2>
              <span style={{ fontSize: 13, color: "var(--ink-3)" }}>{upcoming.length} due</span>
            </div>
            <div style={{ display: "grid", gap: 8 }}>
              {upcoming.map(h => (
                <Link key={h.id} href={`/classes/${h.classId}?tab=homework`} style={{ textDecoration: "none", display: "flex", alignItems: "center", gap: 12, background: "var(--card)", border: `1px solid ${h.overdue ? "var(--coral-soft)" : "var(--line)"}`, borderRadius: 14, padding: "10px 14px" }}>
                  <div className={`cc-${h.color}`} style={{ width: 8, height: 8, borderRadius: 99, background: "var(--c)", flexShrink: 0 }} />
                  <span style={{ fontSize: 13.5, fontWeight: 600, color: "var(--ink)", flex: 1 }}>{h.title}</span>
                  <span style={{ fontSize: 12, color: "var(--ink-3)", background: "var(--bg-2)", padding: "3px 8px", borderRadius: 6 }}>{h.className}</span>
                  <span style={{ fontSize: 12, fontWeight: 600, color: h.overdue ? "var(--coral-ink)" : "var(--ink-3)", flexShrink: 0 }}>
                    {h.overdue ? "Overdue" : new Date(h.dueDate).toLocaleDateString("en-MY", { weekday: "short", day: "numeric", month: "short" })}
                  </span>
                </Link>
              ))}
            </div>
          </div>
        );
      })()}

      {/* Section header */}
      {allClasses.length > 0 && (
        <div style={{ display: "flex", alignItems: "baseline", gap: 12, marginBottom: 16 }}>
          <h2 className="serif" style={{ margin: 0, fontSize: 24, color: "var(--ink)" }}>Your classes</h2>
          <span style={{ fontSize: 13, color: "var(--ink-3)" }}>{allClasses.length} active</span>
        </div>
      )}

      {allClasses.length === 0 ? (
        <EmptyState />
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(290px, 1fr))", gap: 14 }}>
          {allClasses.map((cls) => {
            const color = classColor(cls.name);
            const currentChapter = cls.chapters.find(c => c.status === "in-progress");
            const pendingHW = cls.homework.filter(h => h.status === "pending");
            const overdueHW = pendingHW.filter(h => new Date(h.dueDate) < new Date());
            const completedChapters = cls.chapters.filter(c => c.status === "completed").length;
            const pct = cls.chapters.length ? Math.round((completedChapters / cls.chapters.length) * 100) : 0;

            return (
              <Link key={cls.id} href={`/classes/${cls.id}`} className={`cc-${color} class-card`} style={{
                textDecoration: "none", display: "block",
                background: "var(--card)", border: "1px solid var(--line)",
                borderRadius: 18, padding: 18, position: "relative",
              }}>
                {/* Top row */}
                <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 14 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <div style={{
                      width: 44, height: 44, borderRadius: 12, background: "var(--c-soft)", color: "var(--c-ink)",
                      display: "grid", placeItems: "center",
                      fontFamily: "var(--ff-display)", fontSize: 22, fontWeight: 700,
                      border: "1px solid var(--c)",
                    }}>{cls.name.charAt(0)}</div>
                    <div>
                      <div style={{ fontSize: 16, fontWeight: 600, color: "var(--ink)" }}>{cls.name}</div>
                      <div style={{ fontSize: 12, color: "var(--ink-3)", marginTop: 2 }}>{cls.grade} · {cls.subject}</div>
                    </div>
                  </div>
                  {overdueHW.length > 0 && (
                    <span style={{
                      display: "inline-flex", alignItems: "center", gap: 5,
                      padding: "3px 9px", borderRadius: 99, fontSize: 11.5, fontWeight: 600,
                      background: "var(--coral-soft)", color: "var(--coral-ink)",
                    }}>
                      <AlertTriangle size={11} strokeWidth={2.2} /> {overdueHW.length}
                    </span>
                  )}
                </div>

                {/* Info rows */}
                <div style={{ display: "grid", gap: 8, marginBottom: 14 }}>
                  <InfoRow>
                    {currentChapter
                      ? <span style={{ color: "var(--ink-2)" }}>Ch {currentChapter.number}: <b style={{ fontWeight: 600 }}>{currentChapter.title}</b></span>
                      : <span style={{ color: "var(--ink-4)" }}>No active chapter</span>}
                  </InfoRow>
                  <InfoRow>
                    {pendingHW.length > 0
                      ? <span style={{ color: "var(--ink-2)" }}><b style={{ fontWeight: 600 }}>{pendingHW.length}</b> homework pending</span>
                      : <span style={{ color: "var(--ink-4)" }}>No pending homework</span>}
                  </InfoRow>
                  <InfoRow>
                    <span style={{ color: "var(--ink-2)" }}><b style={{ fontWeight: 600 }}>{cls.students.length}</b> students</span>
                  </InfoRow>
                </div>

                {cls.chapters.length > 0 && (
                  <div>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: "var(--ink-3)", marginBottom: 6, fontWeight: 500 }}>
                      <span>Progress</span><span>{completedChapters}/{cls.chapters.length}</span>
                    </div>
                    <div style={{ height: 8, borderRadius: 99, background: "var(--c-soft)", overflow: "hidden" }}>
                      <div style={{ height: "100%", width: `${pct}%`, background: "var(--c)", borderRadius: 99, transition: "width .4s" }} />
                    </div>
                  </div>
                )}
              </Link>
            );
          })}

          {/* Add class card */}
          <Link href="/classes/new" className="add-class-card" style={{
            textDecoration: "none", display: "flex", flexDirection: "column",
            alignItems: "center", justifyContent: "center", gap: 10,
            background: "transparent", border: "1.5px dashed var(--line-2)",
            borderRadius: 18, padding: 18, minHeight: 200, color: "var(--ink-3)",
          }}>
            <div style={{
              width: 44, height: 44, borderRadius: 14, background: "var(--card)",
              display: "grid", placeItems: "center", border: "1px solid var(--line)",
            }}>
              <Plus size={20} strokeWidth={2} />
            </div>
            <span style={{ fontSize: 14, fontWeight: 500 }}>Add a class</span>
          </Link>
        </div>
      )}
    </div>
  );
}

function StatCard({ label, value, color, icon }: { label: string; value: number; color: string; icon: string }) {
  const icons: Record<string, React.ReactNode> = {
    bookmark: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z"/></svg>,
    clip: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="8" height="4" x="8" y="2" rx="1" ry="1"/><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/></svg>,
    alert: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><path d="M12 9v4"/><path d="M12 17h.01"/></svg>,
  };
  return (
    <div className={`cc-${color}`} style={{
      background: "var(--c-soft)", borderRadius: 18, padding: "18px 20px",
      display: "flex", alignItems: "center", gap: 16, position: "relative", overflow: "hidden",
    }}>
      <div style={{
        width: 42, height: 42, borderRadius: 12, background: "var(--card)",
        display: "grid", placeItems: "center", color: "var(--c-ink)", flexShrink: 0,
        boxShadow: "var(--shadow-sm)",
      }}>{icons[icon]}</div>
      <div>
        <div style={{ fontFamily: "var(--ff-display)", fontSize: 36, lineHeight: 1, color: "var(--ink)" }}>{value}</div>
        <div style={{ fontSize: 12.5, color: "var(--c-ink)", fontWeight: 500, marginTop: 4 }}>{label}</div>
      </div>
      <svg width="60" height="60" viewBox="0 0 60 60" style={{ position: "absolute", right: -10, bottom: -10, color: "var(--c)", opacity: .18 }}>
        <circle cx="30" cy="30" r="22" fill="currentColor" />
      </svg>
    </div>
  );
}

function InfoRow({ children }: { children: React.ReactNode }) {
  return <div style={{ display: "flex", alignItems: "center", fontSize: 13.5 }}>{children}</div>;
}

function SquiggleUnder() {
  return (
    <svg width="92" height="10" viewBox="0 0 92 10" style={{ display: "block", marginTop: -2, color: "var(--coral)" }}>
      <path d="M2 6 Q 12 1, 22 6 T 42 6 T 62 6 T 82 6 T 90 5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function EmptyState() {
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "80px 20px", textAlign: "center" }}>
      <div style={{ width: 72, height: 72, borderRadius: 22, background: "var(--coral-soft)", display: "grid", placeItems: "center", marginBottom: 20 }}>
        <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="var(--coral-ink)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z"/>
        </svg>
      </div>
      <h2 className="serif" style={{ margin: 0, fontSize: 22, color: "var(--ink)" }}>No classes yet</h2>
      <p style={{ margin: "8px 0 24px", fontSize: 14, color: "var(--ink-3)", maxWidth: 300 }}>Add your first class to start tracking chapters, homework, and notes.</p>
      <Link href="/classes/new" style={{
        display: "inline-flex", alignItems: "center", gap: 8,
        padding: "10px 20px", borderRadius: 10, textDecoration: "none",
        background: "var(--ink)", color: "white", fontSize: 14, fontWeight: 700,
      }}>
        <Plus size={16} /> Create your first class
      </Link>
    </div>
  );
}
