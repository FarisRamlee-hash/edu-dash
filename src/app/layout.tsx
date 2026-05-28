import type { Metadata } from "next";
import { Bricolage_Grotesque, Hanken_Grotesk } from "next/font/google";
import { LayoutShell } from "@/components/LayoutShell";
import "./globals.css";

const bricolage = Bricolage_Grotesque({
  subsets: ["latin"],
  axes: ["opsz"],
  variable: "--font-bricolage",
  display: "swap",
});

const hanken = Hanken_Grotesk({
  subsets: ["latin"],
  variable: "--font-hanken",
  display: "swap",
});

export const metadata: Metadata = {
  title: "EduDash — Teacher Toolkit",
  description: "Track classes, homework, chapters, and weekly vocabulary",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${bricolage.variable} ${hanken.variable}`} style={{ colorScheme: "light" }}>
      <body style={{ background: "var(--bg)", color: "var(--ink)", fontFamily: "var(--ff-ui)", margin: 0 }}>
        <LayoutShell>{children}</LayoutShell>
      </body>
    </html>
  );
}
