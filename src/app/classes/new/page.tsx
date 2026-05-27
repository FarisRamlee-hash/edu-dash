"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const SUBJECTS = ["English", "Bahasa Malaysia", "Mathematics", "Science", "History"];
const QUICK_GRADES = ["Year 4", "Year 5", "Form 1", "Form 2", "Form 3"];

export default function NewClassPage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ name: "", grade: "", subject: "English" });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    const res = await fetch("/api/classes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const data = await res.json();
    router.push(`/classes/${data.id}`);
  }

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)", display: "flex", alignItems: "flex-start", justifyContent: "center", paddingTop: 64, paddingBottom: 64, paddingLeft: 16, paddingRight: 16 }}>
      <div style={{ width: "100%", maxWidth: 480 }}>
        {/* Back */}
        <button onClick={() => router.back()} style={{
          display: "inline-flex", alignItems: "center", gap: 6, padding: "6px 10px",
          marginLeft: -10, marginBottom: 24, background: "transparent", border: 0, cursor: "pointer",
          color: "var(--ink-3)", fontSize: 13, borderRadius: 8,
        }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
          Back
        </button>

        <div style={{ background: "var(--card)", border: "1px solid var(--line)", borderRadius: 22, overflow: "hidden", boxShadow: "var(--shadow)" }}>
          {/* Header */}
          <div style={{
            background: "linear-gradient(135deg, var(--coral) 0%, var(--butter) 100%)",
            padding: "24px 28px", position: "relative", overflow: "hidden",
          }}>
            <svg width="160" height="160" viewBox="0 0 160 160" style={{ position: "absolute", right: -40, top: -40, opacity: .15 }}>
              <circle cx="80" cy="80" r="70" fill="none" stroke="white" strokeWidth="12" />
              <circle cx="80" cy="80" r="44" fill="none" stroke="white" strokeWidth="12" />
            </svg>
            <div style={{ position: "relative" }}>
              <div style={{
                width: 44, height: 44, borderRadius: 14, background: "rgba(255,255,255,.22)",
                display: "grid", placeItems: "center", color: "white", marginBottom: 12,
              }}>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/>
                </svg>
              </div>
              <div style={{ fontFamily: "var(--ff-display)", fontSize: 28, color: "white", lineHeight: 1.1 }}>New class</div>
              <div style={{ fontSize: 13, color: "rgba(255,255,255,.85)", marginTop: 4 }}>Fill in the details to get started</div>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} style={{ padding: 28, display: "grid", gap: 22 }}>
            {/* Class name */}
            <FieldLabel label="Class Name" hint="e.g. 4 Bestari, 5 Amanah">
              <input
                required type="text" placeholder="e.g. 4 Bestari"
                value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                style={inputStyle}
              />
            </FieldLabel>

            {/* Grade */}
            <FieldLabel label="Grade / Year" hint="Select or type below">
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 8 }}>
                {QUICK_GRADES.map(g => (
                  <button key={g} type="button" onClick={() => setForm(f => ({ ...f, grade: g }))} style={{
                    padding: "6px 14px", borderRadius: 99, fontSize: 12.5, fontWeight: 600, cursor: "pointer",
                    border: "1.5px solid",
                    background: form.grade === g ? "var(--coral)" : "transparent",
                    color: form.grade === g ? "white" : "var(--ink-3)",
                    borderColor: form.grade === g ? "var(--coral)" : "var(--line-2)",
                    transition: "all .12s",
                  }}>{g}</button>
                ))}
              </div>
              <input
                required type="text" placeholder="Or type: Year 6, Form 4…"
                value={form.grade} onChange={e => setForm(f => ({ ...f, grade: e.target.value }))}
                style={inputStyle}
              />
            </FieldLabel>

            {/* Subject */}
            <FieldLabel label="Subject">
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                {SUBJECTS.map(s => (
                  <button key={s} type="button" onClick={() => setForm(f => ({ ...f, subject: s }))} style={{
                    padding: "6px 14px", borderRadius: 99, fontSize: 12.5, fontWeight: 600, cursor: "pointer",
                    border: "1.5px solid",
                    background: form.subject === s ? "var(--coral)" : "transparent",
                    color: form.subject === s ? "white" : "var(--ink-3)",
                    borderColor: form.subject === s ? "var(--coral)" : "var(--line-2)",
                    transition: "all .12s",
                  }}>{s}</button>
                ))}
              </div>
            </FieldLabel>

            <button
              type="submit"
              disabled={saving || !form.name || !form.grade}
              style={{
                width: "100%", padding: "12px 0", borderRadius: 12, border: 0, cursor: "pointer",
                background: "var(--coral)", color: "white", fontSize: 15, fontWeight: 700,
                opacity: saving || !form.name || !form.grade ? .5 : 1,
                boxShadow: "0 6px 16px -8px var(--coral)", transition: "opacity .15s",
                marginTop: 4,
              }}
            >
              {saving ? "Creating…" : "Create class →"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

function FieldLabel({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div>
      <div style={{ display: "flex", alignItems: "baseline", gap: 8, marginBottom: 8 }}>
        <label style={{ fontSize: 13, fontWeight: 600, color: "var(--ink-2)" }}>{label}</label>
        {hint && <span style={{ fontSize: 12, color: "var(--ink-4)" }}>{hint}</span>}
      </div>
      {children}
    </div>
  );
}

const inputStyle: React.CSSProperties = {
  width: "100%", padding: "10px 12px", border: "1px solid var(--line)", borderRadius: 10,
  background: "var(--card)", color: "var(--ink)", fontSize: 14, outline: "none",
  fontFamily: "var(--ff-ui)",
};
