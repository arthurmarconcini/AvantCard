"use client";

import { usePathname } from "next/navigation";
import { Sidebar } from "@/components/layout/sidebar";
import { Topbar } from "@/components/layout/topbar";

const AUTH_ROUTES = ["/login", "/register", "/forgot-password", "/reset-password"];

export function AuthLayoutWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAuthPage = AUTH_ROUTES.some((route) => pathname.startsWith(route));

  if (isAuthPage) {
    return <>{children}</>;
  }

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex flex-col flex-1 w-full overflow-hidden">
        <Topbar />
        <main className="flex-1 w-full p-4 md:p-6 lg:p-8 overflow-y-auto no-scrollbar">
          {children}
        </main>
      </div>
    </div>
  );
}
