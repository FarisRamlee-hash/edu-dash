"use client";

import { useState, useEffect } from "react";
import { Menu } from "lucide-react";
import { Sidebar } from "@/components/Sidebar";

export function LayoutShell({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  // Restore collapse pref from localStorage (client-side only)
  useEffect(() => {
    try {
      if (localStorage.getItem("edudash-sidebar") === "collapsed") setCollapsed(true);
    } catch {}
  }, []);

  function toggleCollapse() {
    setCollapsed(v => {
      try { localStorage.setItem("edudash-sidebar", v ? "open" : "collapsed"); } catch {}
      return !v;
    });
  }

  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      {/* Mobile backdrop — only rendered when open; always visible (not display:none) */}
      {mobileOpen && (
        <div
          onClick={() => setMobileOpen(false)}
          style={{
            position: "fixed", inset: 0,
            background: "rgba(0,0,0,.45)",
            zIndex: 40,
          }}
        />
      )}

      <Sidebar
        collapsed={collapsed}
        mobileOpen={mobileOpen}
        onToggle={toggleCollapse}
        onMobileClose={() => setMobileOpen(false)}
      />

      <main style={{ flex: 1, minWidth: 0, position: "relative" }}>
        {/* Mobile top bar — hidden on desktop via CSS */}
        <div className="mobile-topbar">
          <button
            onClick={() => setMobileOpen(true)}
            aria-label="Open menu"
            style={{
              width: 38, height: 38, borderRadius: 10,
              border: "1px solid var(--line)",
              background: "var(--card)", cursor: "pointer",
              display: "grid", placeItems: "center",
              color: "var(--ink)", flexShrink: 0,
            }}
          >
            <Menu size={18} />
          </button>
          <span className="serif" style={{ fontSize: 18, color: "var(--ink)" }}>EduDash</span>
        </div>

        {children}
      </main>
    </div>
  );
}
