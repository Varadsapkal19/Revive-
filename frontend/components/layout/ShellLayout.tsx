"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Sidebar } from "@/components/layout/Sidebar";
import { TopBar } from "@/components/layout/TopBar";

const PUBLIC_AUTH_ROUTES = ["/login", "/register", "/forgot-password", "/reset-password"];

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

    const isAuthRoute = PUBLIC_AUTH_ROUTES.includes(pathname);

    // Strict Auth Guard: If not logged in and not on public auth route, redirect to /login
    if (!isAuthed && !isAuthRoute) {
      router.replace("/login");
    } else if (isAuthed && isAuthRoute) {
      router.replace("/dashboard");
    }
  }, [pathname, router]);

  const isAuthRoute = PUBLIC_AUTH_ROUTES.includes(pathname);

  // While checking auth token, display a clean minimal spinner matching brand palette
  if (!authChecked) {
    return (
      <div className="min-h-screen bg-[#F5F2E9] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-6 h-6 border-2 border-[#E7E3D8] border-t-[#202421] rounded-full animate-spin" />
          <span className="text-xs font-medium text-[#77786F] tracking-tight">Verifying secure workspace...</span>
        </div>
      </div>
    );
  }

  // If not authenticated and not on a public auth route, block rendering completely
  if (!isAuthenticated && !isAuthRoute) {
    return (
      <div className="min-h-screen bg-[#F5F2E9] flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-[#E7E3D8] border-t-[#202421] rounded-full animate-spin" />
      </div>
    );
  }

  // Public authentication pages layout (standalone, no sidebar, no topbar)
  if (isAuthRoute) {
    return <main className="min-h-screen bg-[#F5F2E9]">{children}</main>;
  }

  // Authenticated application layout
  return (
    <div className="flex bg-[#F5F2E9] min-h-screen text-[#202421]">
      <Sidebar />
      <div className="flex-1 ml-64 min-h-screen flex flex-col">
        <TopBar />
        <main className="flex-1 p-8">{children}</main>
      </div>
    </div>
  );
}
