"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Sidebar } from "@/components/layout/Sidebar";
import { TopBar } from "@/components/layout/TopBar";

export function ShellLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [authChecked, setAuthChecked] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const token = typeof window !== "undefined" ? localStorage.getItem("revive_token") : null;
    const isAuthed = Boolean(token);
    setIsAuthenticated(isAuthed);
    setAuthChecked(true);

    // Strict Auth Guard: If not logged in and not on login page, block everything & redirect to /login
    if (!isAuthed && pathname !== "/login") {
      router.replace("/login");
    } else if (isAuthed && pathname === "/login") {
      router.replace("/dashboard");
    }
  }, [pathname, router]);

  // While checking auth token, display a clean minimal spinner
  if (!authChecked) {
    return (
      <div className="min-h-screen bg-[#fafafa] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-5 h-5 border-2 border-zinc-200 border-t-zinc-900 rounded-full animate-spin" />
          <span className="text-xs font-medium text-zinc-400 tracking-tight">Verifying secure session...</span>
        </div>
      </div>
    );
  }

  // If not authenticated and not on login page, DO NOT RENDER ANYTHING (Block access completely)
  if (!isAuthenticated && pathname !== "/login") {
    return (
      <div className="min-h-screen bg-[#fafafa] flex items-center justify-center">
        <div className="w-5 h-5 border-2 border-zinc-200 border-t-zinc-900 rounded-full animate-spin" />
      </div>
    );
  }

  // Login page layout (standalone, no sidebar, no topbar)
  if (pathname === "/login") {
    return <main className="min-h-screen bg-[#fafafa]">{children}</main>;
  }

  // Authenticated application layout
  return (
    <div className="flex bg-[#fafafa] min-h-screen">
      <Sidebar />
      <div className="flex-1 ml-64 min-h-screen flex flex-col">
        <TopBar />
        <main className="flex-1 p-8">{children}</main>
      </div>
    </div>
  );
}
