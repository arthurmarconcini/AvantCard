"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Wallet,
  CreditCard,
  PieChart,
  Settings,
  HelpCircle,
  Home,
  Users,
  Coins,
} from "lucide-react";
import { cn } from "@/lib/utils";

const navigation = [
  { name: "Dashboard", href: "/", icon: Home },
  { name: "Minhas Contas", href: "/accounts", icon: Wallet },
  { name: "Cartões", href: "/cards", icon: CreditCard },
  { name: "Pessoas", href: "/people", icon: Users },
  { name: "Empréstimos", href: "/loans", icon: Coins },
  { name: "Relatórios", href: "/reports", icon: PieChart },
];

const secondaryNavigation = [
  { name: "Configurações", href: "/settings", icon: Settings },
  { name: "Ajuda", href: "/help", icon: HelpCircle },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden lg:flex w-64 flex-col bg-card border-r border-border min-h-screen sticky top-0">
      {/* Brand & Logo Area */}
      <div className="flex items-center h-16 shrink-0 px-6 border-b border-border">
        <div className="flex items-center gap-2">
          {/* Logo Icon (Using primary Neon Green) */}
          <div className="bg-primary/10 p-2 rounded-lg">
            <Wallet className="h-6 w-6 text-primary" />
          </div>
          {/* Brand Name */}
          <span className="text-xl font-bold tracking-tight text-foreground">
            Think<span className="text-primary">Card</span>
          </span>
        </div>
      </div>

      {/* Primary Navigation Options */}
      <nav className="flex-1 flex flex-col gap-1 px-3 py-6 overflow-y-auto no-scrollbar">
        <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 px-3">
          Menu Principal
        </div>
        {navigation.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "group flex items-center gap-x-3 rounded-md px-3 py-2 text-sm font-medium transition-all duration-200",
                isActive
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              <item.icon
                className={cn(
                  "h-5 w-5 shrink-0 transition-colors duration-200",
                  isActive ? "text-primary" : "text-muted-foreground group-hover:text-foreground"
                )}
                aria-hidden="true"
              />
              {item.name}
            </Link>
          );
        })}

        {/* Separator / Spacer */}
        <div className="mt-8 mb-2">
          <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-3">
            Preferências
          </div>
        </div>

        {/* Secondary Navigation Options */}
        {secondaryNavigation.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "group flex items-center gap-x-3 rounded-md px-3 py-2 text-sm font-medium transition-all duration-200",
                isActive
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              <item.icon
                className={cn(
                  "h-5 w-5 shrink-0 transition-colors duration-200",
                  isActive ? "text-primary" : "text-muted-foreground group-hover:text-foreground"
                )}
                aria-hidden="true"
              />
              {item.name}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
