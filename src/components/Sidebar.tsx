"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import {
  LayoutDashboard, BookOpen, Settings, BookCheck,
  Plus, ChevronLeft, ChevronRight, X,
} from "lucide-react";

type ClassItem = { id: string; name: string; grade: string };

const navItems = [
  { href: "/",             label: "Dashboard",    icon: LayoutDashboard, exact: true },
  { href: "/weekly-vocab", label: "Weekly Vocab", icon: BookOpen,        exact: false },
  { href: "/book-signing", label: "Book Signing", icon: BookCheck,       exact: false },
  { href: "/settings",     label: "Settings",     icon: Settings,        exact: false },
];

const CLASS_COLORS = ["coral", "mint", "butter", "lavender", "sky", "coral", "mint", "butter"];
function classColor(name: string) {
  let h = 0;
  for (const c of name) h = (h * 31 + c.charCodeAt(0)) % CLASS_COLORS.length;
  return CLASS_COLORS[h];
}

interface SidebarProps {
  collapsed: boolean;
  mobileOpen: boolean;
  onToggle: () => void;
  onMobileClose: () => void;
}

export function Sidebar({ collapsed, mobileOpen, onToggle, onMobileClose }: SidebarProps) {
  const pathname = usePathname();
  const [classes, setClasses] = useState<ClassItem[]>([]);

  useEffect(() => {
    fetch("/api/classes")
      .then(r => r.json())
      .then(data => setClasses(Array.isArray(data) ? data : []))
      .catch(() => {});
  }, [pathname]);

  const W = collapsed ? 64 : 252;
  const PAD = collapsed ? 8 : 14;

  const inner = (
    <div style={{
      width: "100%", height: "100%",
      display: "flex", flexDirection: "column",
      padding: `20px ${PAD}px`,
      overflowY: "auto", overflowX: "hidden",
      transition: "padding .2s ease",
    }}>
      {/* Logo */}
      <Link
        href="/"
        onClick={onMobileClose}
        style={{
          display: "flex", alignItems: "center", gap: collapsed ? 0 : 12,
          padding: `6px 6px ${collapsed ? 14 : 22}px`,
          textDecoration: "none", overflow: "hidden",
          transition: "gap .2s ease, padding .2s ease",
        }}
      >
        <div style={{
          width: 38, height: 38, borderRadius: 10, flexShrink: 0,
          background: "var(--ink)", color: "var(--coral)",
          display: "grid", placeItems: "center",
        }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/>
          </svg>
        </div>
        {!collapsed && (
          <div style={{ overflow: "hidden" }}>
            <div className="serif" style={{ fontSize: 22, lineHeight: 1, color: "var(--ink)", whiteSpace: "nowrap" }}>EduDash</div>
            <div style={{ fontSize: 11, color: "var(--ink-3)", marginTop: 2 }}>Teacher toolkit</div>
          </div>
        )}
      </Link>

      <div style={{ height: 1, background: "var(--line)", margin: `0 ${-PAD}px 12px` }} />

      {/* Main nav */}
      <nav style={{ display: "flex", flexDirection: "column", gap: collapsed ? 4 : 2 }}>
        {navItems.map(({ href, label, icon: Icon, exact }) => {
          const active = exact ? pathname === href : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              onClick={onMobileClose}
              title={collapsed ? label : undefined}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: collapsed ? "center" : "flex-start",
                gap: 10,
                padding: collapsed ? "10px 0" : "9px 12px",
                borderRadius: 11, textDecoration: "none",
                background: active ? "var(--card)" : "transparent",
                color: active ? "var(--ink)" : "var(--ink-2)",
                fontSize: 13.5, fontWeight: active ? 600 : 500,
                boxShadow: active ? "var(--shadow-sm), 0 0 0 1px var(--line)" : "none",
                position: "relative",
                transition: "background .12s, color .12s",
              }}
            >
              {active && !collapsed && (
                <span style={{ position: "absolute", left: 0, top: 11, bottom: 11, width: 3, background: "var(--coral)", borderRadius: 99 }} />
              )}
              <Icon size={16} strokeWidth={active ? 2.5 : 2} style={{ flexShrink: 0 }} />
              {!collapsed && label}
            </Link>
          );
        })}
      </nav>

      {/* Classes section */}
      {!collapsed && classes.length > 0 && (
        <div style={{ marginTop: 16 }}>
          <div style={{ height: 1, background: "var(--line)", margin: `0 ${-PAD}px 12px` }} />
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 12px", marginBottom: 6 }}>
            <span style={{ fontSize: 10.5, fontWeight: 700, color: "var(--ink-4)", textTransform: "uppercase", letterSpacing: "0.08em" }}>My Classes</span>
            <Link href="/classes/new" title="New class" onClick={onMobileClose} style={{ color: "var(--ink-4)", display: "grid", placeItems: "center", textDecoration: "none" }}>
              <Plus size={13} strokeWidth={2.2} />
            </Link>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 1 }}>
            {classes.map(cls => {
              const color = classColor(cls.name);
              const isActive = pathname.startsWith(`/classes/${cls.id}`);
              return (
                <Link
                  key={cls.id}
                  href={`/classes/${cls.id}`}
                  onClick={onMobileClose}
                  style={{
                    display: "flex", alignItems: "center", gap: 9,
                    padding: "7px 12px", borderRadius: 10, textDecoration: "none",
                    background: isActive ? "var(--card)" : "transparent",
                    color: isActive ? "var(--ink)" : "var(--ink-2)",
                    fontSize: 13, fontWeight: isActive ? 600 : 400,
                    boxShadow: isActive ? "var(--shadow-sm), 0 0 0 1px var(--line)" : "none",
                    position: "relative", transition: "background .12s, color .12s",
                  }}
                >
                  {isActive && <span style={{ position: "absolute", left: 0, top: 9, bottom: 9, width: 3, background: "var(--coral)", borderRadius: 99 }} />}
                  <div className={`cc-${color}`} style={{
                    width: 22, height: 22, borderRadius: 7, flexShrink: 0,
                    background: "var(--c)", color: "white",
                    display: "grid", placeItems: "center",
                    fontFamily: "var(--ff-display)", fontSize: 12,
                  }}>{cls.name.charAt(0)}</div>
                  <span style={{ flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{cls.name}</span>
                  <span style={{ fontSize: 11, color: "var(--ink-4)", flexShrink: 0 }}>{cls.grade}</span>
                </Link>
              );
            })}
          </div>
        </div>
      )}

      {/* Spacer */}
      <div style={{ flex: 1, minHeight: 16 }} />

      {/* Footer card */}
      {!collapsed && (
        <div style={{
          background: "var(--card)", border: "1px solid var(--line)",
          borderRadius: 13, padding: "10px 12px",
          position: "relative", overflow: "hidden", marginTop: 12, marginBottom: 8,
        }}>
          <svg width="44" height="44" viewBox="0 0 44 44" style={{ position: "absolute", right: -6, bottom: -6, color: "var(--butter)", opacity: .25 }}>
            <circle cx="22" cy="22" r="20" fill="currentColor" />
          </svg>
          <div style={{ position: "relative" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
              <div style={{ width: 26, height: 26, borderRadius: 8, background: "linear-gradient(135deg, var(--lavender), var(--sky))", color: "white", display: "grid", placeItems: "center", fontFamily: "var(--ff-display)", fontSize: 13 }}>T</div>
              <div style={{ fontSize: 12.5, fontWeight: 600, color: "var(--ink)" }}>Teacher</div>
            </div>
            <div style={{ fontSize: 10.5, color: "var(--ink-4)" }}>EduDash · {new Date().getFullYear()}</div>
          </div>
        </div>
      )}

      {/* Collapse toggle — desktop only, hidden on mobile via CSS */}
      <button
        className="sidebar-toggle-btn"
        onClick={onToggle}
        title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        style={{
          display: "flex",
          alignItems: "center", justifyContent: "center",
          gap: 6,
          width: "100%",
          padding: collapsed ? "10px 0" : "8px 12px",
          borderRadius: 10,
          border: "1px solid var(--line)",
          background: "transparent",
          cursor: "pointer",
          color: "var(--ink-3)",
          fontSize: 12.5, fontWeight: 500,
          fontFamily: "inherit",
        }}
      >
        {collapsed
          ? <ChevronRight size={16} />
          : <><ChevronLeft size={15} /><span>Collapse</span></>}
      </button>
    </div>
  );

  return (
    <>
      {/* Desktop spacer — pushes main content right, hidden on mobile */}
      <div
        className="sidebar-spacer"
        style={{ width: W, flexShrink: 0, transition: "width .2s ease" }}
      />

      {/* Desktop panel — fixed, hidden on mobile via CSS */}
      <aside
        className="sidebar-panel sidebar-desktop"
        style={{
          position: "fixed", top: 0, left: 0,
          width: W, height: "100vh",
          background: "var(--card-warm)",
          borderRight: "1px solid var(--line)",
          transition: "width .2s ease",
          zIndex: 30,
          overflow: "hidden",
        }}
      >
        {inner}
      </aside>

      {/* Mobile panel — fixed overlay, shown via data-open */}
      <aside
        className="sidebar-panel sidebar-mobile"
        data-open={mobileOpen}
        style={{
          position: "fixed", top: 0, left: 0,
          width: 260, height: "100vh",
          background: "var(--card-warm)",
          borderRight: "1px solid var(--line)",
          zIndex: 50,
          overflow: "hidden",
          transform: mobileOpen ? "translateX(0)" : "translateX(-100%)",
          transition: "transform .25s ease",
        }}
      >
        {/* Close button */}
        <button
          onClick={onMobileClose}
          style={{
            position: "absolute", top: 12, right: 12,
            width: 32, height: 32, borderRadius: 8,
            border: "1px solid var(--line)",
            background: "var(--card)", cursor: "pointer",
            display: "grid", placeItems: "center",
            color: "var(--ink-3)", zIndex: 1,
          }}
        >
          <X size={15} />
        </button>
        {inner}
      </aside>
    </>
  );
}
