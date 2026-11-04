import type { Metadata } from "next";
import "./globals.css";
import { ShellLayout } from "@/components/layout/ShellLayout";

export const metadata: Metadata = {
  title: "REVIVE — Autonomous Revenue Intelligence Engine",
  description: "AI-powered payment failure recovery and financial operations platform.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-slate-50 min-h-screen text-slate-900 antialiased">
        <ShellLayout>{children}</ShellLayout>
      </body>
    </html>
  );
}

