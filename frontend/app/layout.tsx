import type { Metadata } from "next";
import "./globals.css";
import { ShellLayout } from "@/components/layout/ShellLayout";

export const metadata: Metadata = {
  title: "REVIVE — Revenue Recovery Intelligence & Value Engine",
  description: "Autonomous payment recovery intelligence layer for the Razorpay Buildathon.",
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

