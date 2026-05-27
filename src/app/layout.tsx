import type { Metadata } from "next";
import { Geist } from "next/font/google";
import { Instrument_Serif } from "next/font/google";
import { Sidebar } from "@/components/Sidebar";
import "./globals.css";

const geist = Geist({ subsets: ["latin"], variable: "--font-geist" });
const instrumentSerif = Instrument_Serif({
  subsets: ["latin"],
  weight: "400",
  style: ["normal", "italic"],
  variable: "--font-instrument-serif",
});

export const metadata: Metadata = {
  title: "EduDash — Teacher Toolkit",
  description: "Track classes, homework, chapters, and weekly vocabulary",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${geist.variable} ${instrumentSerif.variable}`} style={{ colorScheme: "light" }}>
      <body style={{ background: "var(--bg)", color: "var(--ink)", fontFamily: "var(--ff-ui)", margin: 0 }}>
        <div style={{ display: "flex", minHeight: "100vh" }}>
          <Sidebar />
          <main style={{ flex: 1, minWidth: 0 }}>{children}</main>
        </div>
      </body>
    </html>
  );
}
