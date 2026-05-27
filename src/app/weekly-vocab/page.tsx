"use client";

import { useEffect, useState } from "react";
import { BookOpen, Upload, CheckCircle2, ExternalLink, Calendar, Sparkles, Loader2 } from "lucide-react";

type VocabWord = { word: string; definition: string };
type Class = { id: string; name: string; grade: string };
type VocabEntry = {
  id: string;
  weekOf: string;
  words: VocabWord[];
  sentences: string[];
  pdfUrl?: string;
  uploadedAt?: string;
  class?: { name: string };
};

export default function WeeklyVocabPage() {
  const [classes, setClasses] = useState<Class[]>([]);
  const [history, setHistory] = useState<VocabEntry[]>([]);
  const [classId, setClassId] = useState("");
  const [weekOf, setWeekOf] = useState(getThisMonday());
  const [words, setWords] = useState<VocabWord[]>(Array(5).fill(null).map(() => ({ word: "", definition: "" })));
  const [sentences, setSentences] = useState<string[]>(Array(5).fill(""));
  const [saving, setSaving] = useState(false);
  const [generating, setGenerating] = useState<string | null>(null);
  const [aiGenerating, setAiGenerating] = useState(false);
  const [topic, setTopic] = useState("");
  const [showAiBox, setShowAiBox] = useState(false);
  const [msg, setMsg] = useState<{ text: string; type: "success" | "error" | "info" } | null>(null);

  useEffect(() => {
    fetch("/api/classes").then(r => r.json()).then(setClasses);
    loadHistory();
  }, []);

  async function loadHistory() {
    const res = await fetch("/api/weekly-vocab");
    setHistory(await res.json());
  }

  async function generateWithAI() {
    if (!topic.trim()) return;
    setAiGenerating(true);
    setMsg(null);
    const res = await fetch("/api/ai-vocab", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ topic: topic.trim() }),
    });
    const data = await res.json();
    setAiGenerating(false);
    if (res.ok && data.words && data.sentences) {
      setWords(data.words);
      setSentences(data.sentences);
      setShowAiBox(false);
      setMsg({ text: `Generated ${data.words.length} words about "${topic}" — review and save!`, type: "success" });
    } else {
      setMsg({ text: data.error ?? "AI generation failed. Check your ANTHROPIC_API_KEY.", type: "error" });
    }
  }

  async function save() {
    if (!words.some(w => w.word) || !sentences.some(s => s)) {
      setMsg({ text: "Please fill in at least some words and sentences.", type: "error" });
      return;
    }
    setSaving(true);
    setMsg(null);
    const res = await fetch("/api/weekly-vocab", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ classId: classId || null, weekOf, words, sentences }),
    });
    setSaving(false);
    if (res.ok) {
      setMsg({ text: "Saved! Click Generate & Upload to create the PDF.", type: "success" });
      setWords(Array(5).fill(null).map(() => ({ word: "", definition: "" })));
      setSentences(Array(5).fill(""));
      loadHistory();
    } else {
      setMsg({ text: "Error saving. Please try again.", type: "error" });
    }
  }

  async function generateAndUpload(vocabId: string) {
    setGenerating(vocabId);
    setMsg(null);
    const res = await fetch(`/api/weekly-vocab/${vocabId}/generate-pdf`, { method: "POST" });
    const data = await res.json();
    setGenerating(null);
    if (res.ok) {
      setMsg({
        text: data.classroomPostId ? "PDF uploaded to Drive and posted to Classroom!" : "PDF generated and uploaded to Google Drive!",
        type: "success",
      });
    } else {
      setMsg({ text: data.error ?? "Failed to generate PDF.", type: "error" });
    }
    loadHistory();
  }

  return (
    <div className="fade-in" style={{ padding: "32px 40px 60px", maxWidth: 760 }}>
      {/* Page header */}
      <div style={{ marginBottom: 28 }}>
        <p style={{ margin: 0, color: "var(--ink-3)", fontSize: 14 }}>
          {new Date().toLocaleDateString("en-MY", { weekday: "long", day: "numeric", month: "long" })}
        </p>
        <h1 style={{ margin: "6px 0 0", fontSize: 48, lineHeight: 1.05, color: "var(--ink)", fontFamily: "var(--ff-display)", fontWeight: 400 }}>
          Weekly <span style={{ fontStyle: "italic", color: "var(--lavender-ink)" }}>vocabulary</span>
        </h1>
      </div>

      {/* Form card */}
      <div style={{ background: "var(--card)", border: "1px solid var(--line)", borderRadius: 22, overflow: "hidden", boxShadow: "var(--shadow)", marginBottom: 32 }}>
        {/* Gradient header */}
        <div style={{ background: "linear-gradient(135deg, var(--lavender) 0%, var(--sky) 100%)", padding: "24px 28px", position: "relative", overflow: "hidden" }}>
          <svg width="220" height="80" viewBox="0 0 220 80" style={{ position: "absolute", right: -20, bottom: -10, opacity: .18 }}>
            <path d="M0 40 Q 30 10, 55 40 T 110 40 T 165 40 T 220 40" fill="none" stroke="white" strokeWidth="12" strokeLinecap="round"/>
            <path d="M0 60 Q 30 30, 55 60 T 110 60 T 165 60 T 220 60" fill="none" stroke="white" strokeWidth="8" strokeLinecap="round"/>
          </svg>
          <div style={{ position: "relative", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
              <div style={{ width: 44, height: 44, borderRadius: 14, background: "rgba(255,255,255,.22)", display: "grid", placeItems: "center", color: "white", flexShrink: 0 }}>
                <BookOpen size={20} strokeWidth={2} />
              </div>
              <div>
                <div style={{ fontFamily: "var(--ff-display)", fontSize: 22, color: "white", lineHeight: 1.1 }}>New Vocab Sheet</div>
                <div style={{ fontSize: 13, color: "rgba(255,255,255,.85)", marginTop: 3 }}>Fill in 5 words &amp; 5 sentences</div>
              </div>
            </div>
            {/* AI Generate button */}
            <button
              onClick={() => setShowAiBox(v => !v)}
              style={{ display: "inline-flex", alignItems: "center", gap: 7, padding: "8px 14px", borderRadius: 10, border: 0, cursor: "pointer", background: "rgba(255,255,255,.22)", color: "white", fontSize: 13, fontWeight: 600, backdropFilter: "blur(6px)", fontFamily: "var(--ff-ui)" }}
            >
              <Sparkles size={14} /> Generate with AI
            </button>
          </div>
        </div>

        {/* AI generation box */}
        {showAiBox && (
          <div style={{ background: "var(--lavender-soft)", borderBottom: "1px solid var(--lavender)", padding: "16px 28px", display: "flex", gap: 10, alignItems: "center" }}>
            <Sparkles size={15} color="var(--lavender-ink)" style={{ flexShrink: 0 }} />
            <input
              autoFocus
              type="text"
              placeholder="Enter a topic… e.g. ocean animals, climate change, healthy food"
              value={topic}
              onChange={e => setTopic(e.target.value)}
              onKeyDown={e => e.key === "Enter" && generateWithAI()}
              style={{ ...inputStyle, flex: 1, background: "var(--card)", borderColor: "var(--lavender)" }}
            />
            <button
              onClick={generateWithAI}
              disabled={aiGenerating || !topic.trim()}
              style={{ display: "inline-flex", alignItems: "center", gap: 7, padding: "10px 16px", borderRadius: 10, border: 0, cursor: aiGenerating || !topic.trim() ? "default" : "pointer", background: "var(--lavender)", color: "white", fontSize: 13, fontWeight: 600, opacity: aiGenerating || !topic.trim() ? .6 : 1, fontFamily: "var(--ff-ui)", flexShrink: 0 }}
            >
              {aiGenerating ? <><Loader2 size={13} style={{ animation: "spin .6s linear infinite" }} /> Generating…</> : "Generate →"}
            </button>
          </div>
        )}

        <div style={{ padding: 28, display: "grid", gap: 24 }}>
          {/* Week + Class row */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            <FieldLabel label="Week Of">
              <div style={{ position: "relative" }}>
                <Calendar size={14} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "var(--ink-4)", pointerEvents: "none" }} />
                <input type="date" value={weekOf} onChange={e => setWeekOf(e.target.value)} style={{ ...inputStyle, paddingLeft: 34 }} />
              </div>
            </FieldLabel>
            <FieldLabel label="Class (optional)">
              <select value={classId} onChange={e => setClassId(e.target.value)} style={{ ...inputStyle, appearance: "none" }}>
                <option value="">All classes</option>
                {classes.map(c => <option key={c.id} value={c.id}>{c.name} ({c.grade})</option>)}
              </select>
            </FieldLabel>
          </div>

          {/* Vocab words */}
          <FieldLabel label="Vocabulary Words">
            <div style={{ display: "grid", gap: 8 }}>
              {words.map((w, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <span style={{ width: 26, height: 26, borderRadius: 8, flexShrink: 0, background: "var(--lavender-soft)", color: "var(--lavender-ink)", display: "grid", placeItems: "center", fontSize: 12, fontWeight: 700 }}>{i + 1}</span>
                  <input type="text" placeholder="Word" value={w.word} onChange={e => setWords(prev => prev.map((x, idx) => idx === i ? { ...x, word: e.target.value } : x))} style={{ ...inputStyle, width: 130 }} />
                  <input type="text" placeholder="Definition or meaning" value={w.definition} onChange={e => setWords(prev => prev.map((x, idx) => idx === i ? { ...x, definition: e.target.value } : x))} style={{ ...inputStyle, flex: 1 }} />
                </div>
              ))}
            </div>
          </FieldLabel>

          {/* Sentences */}
          <FieldLabel label="Example Sentences">
            <div style={{ display: "grid", gap: 8 }}>
              {sentences.map((s, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <span style={{ width: 26, height: 26, borderRadius: 8, flexShrink: 0, background: "var(--sky-soft)", color: "var(--sky-ink)", display: "grid", placeItems: "center", fontSize: 12, fontWeight: 700 }}>{i + 1}</span>
                  <input type="text" placeholder={`Write sentence ${i + 1}…`} value={s} onChange={e => setSentences(prev => prev.map((x, idx) => idx === i ? e.target.value : x))} style={{ ...inputStyle, flex: 1 }} />
                </div>
              ))}
            </div>
          </FieldLabel>

          {msg && (
            <div style={{ display: "flex", alignItems: "center", gap: 8, borderRadius: 12, padding: "10px 14px", fontSize: 13.5, fontWeight: 500, background: msg.type === "success" ? "var(--mint-soft)" : msg.type === "error" ? "var(--coral-soft)" : "var(--lavender-soft)", color: msg.type === "success" ? "var(--mint-ink)" : msg.type === "error" ? "var(--coral-ink)" : "var(--lavender-ink)" }}>
              {msg.type === "success" && <CheckCircle2 size={15} />}
              {msg.text}
            </div>
          )}

          <button onClick={save} disabled={saving} style={{ width: "100%", padding: "12px 0", borderRadius: 12, border: 0, cursor: saving ? "default" : "pointer", background: "var(--lavender)", color: "white", fontSize: 15, fontWeight: 700, opacity: saving ? .5 : 1, boxShadow: "0 6px 16px -8px var(--lavender)", transition: "opacity .15s", fontFamily: "var(--ff-ui)" }}>
            {saving ? "Saving…" : "Save Vocab Sheet"}
          </button>
        </div>
      </div>

      {/* History */}
      {history.length > 0 && (
        <div>
          <h2 style={{ margin: "0 0 14px", fontSize: 18, fontFamily: "var(--ff-display)", fontWeight: 400, color: "var(--ink)" }}>Past Sheets</h2>
          <div style={{ display: "grid", gap: 10 }}>
            {history.map(entry => (
              <div key={entry.id} style={{ background: "var(--card)", border: "1px solid var(--line)", borderRadius: 16, padding: "14px 18px", display: "flex", alignItems: "center", gap: 14 }}>
                <div style={{ width: 40, height: 40, borderRadius: 12, background: "var(--lavender-soft)", display: "grid", placeItems: "center", flexShrink: 0 }}>
                  <BookOpen size={18} color="var(--lavender-ink)" />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ margin: 0, fontSize: 14, fontWeight: 600, color: "var(--ink)" }}>
                    Week of {new Date(entry.weekOf).toLocaleDateString("en-MY", { day: "numeric", month: "long", year: "numeric" })}
                    {entry.class && <span style={{ fontWeight: 400, color: "var(--ink-3)", marginLeft: 8 }}>· {entry.class.name}</span>}
                  </p>
                  <p style={{ margin: "3px 0 0", fontSize: 12.5, color: "var(--ink-4)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {entry.words.filter(w => w.word).map(w => w.word).join(" · ")}
                  </p>
                </div>
                {entry.uploadedAt ? (
                  <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
                    <span style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "4px 10px", borderRadius: 99, fontSize: 12, fontWeight: 600, background: "var(--mint-soft)", color: "var(--mint-ink)" }}>
                      <CheckCircle2 size={12} /> Uploaded
                    </span>
                    {entry.pdfUrl && !entry.pdfUrl.startsWith("data:") && (
                      <a href={entry.pdfUrl} target="_blank" rel="noopener noreferrer" style={{ display: "inline-flex", alignItems: "center", gap: 4, fontSize: 12.5, color: "var(--lavender-ink)", textDecoration: "none", fontWeight: 500 }}>
                        <ExternalLink size={12} /> View
                      </a>
                    )}
                  </div>
                ) : (
                  <button
                    onClick={() => generateAndUpload(entry.id)}
                    disabled={generating === entry.id}
                    style={{ display: "inline-flex", alignItems: "center", gap: 7, background: "var(--lavender)", color: "white", padding: "7px 14px", borderRadius: 10, border: 0, fontSize: 12.5, fontWeight: 600, cursor: generating === entry.id ? "default" : "pointer", opacity: generating === entry.id ? .6 : 1, flexShrink: 0, fontFamily: "var(--ff-ui)" }}
                  >
                    {generating === entry.id ? <><Loader2 size={12} style={{ animation: "spin .6s linear infinite" }} /> Generating…</> : <><Upload size={13} /> Generate &amp; Upload</>}
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

function FieldLabel({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "var(--ink-2)", marginBottom: 8 }}>{label}</label>
      {children}
    </div>
  );
}

const inputStyle: React.CSSProperties = {
  width: "100%", padding: "10px 12px", border: "1px solid var(--line)", borderRadius: 10,
  background: "var(--card)", color: "var(--ink)", fontSize: 14, outline: "none", fontFamily: "var(--ff-ui)",
};

function getThisMonday(): string {
  const d = new Date();
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  return new Date(d.setDate(diff)).toISOString().split("T")[0];
}
