"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  Wallet,
  CreditCard,
  Users,
  Coins,
  Menu,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const quickLinks = [
  { name: "Dashboard", href: "/", icon: Home },
  { name: "Contas", href: "/accounts", icon: Wallet },
  { name: "Cartões", href: "/cards", icon: CreditCard },
  { name: "Pessoas", href: "/people", icon: Users },
  { name: "Empréstimos", href: "/loans", icon: Coins },
];

export function Topbar() {
  const pathname = usePathname();

  return (
    <header className="flex h-14 items-center gap-4 border-b border-border/50 bg-background/95 px-4 backdrop-blur supports-backdrop-filter:bg-background/60 md:px-6 sticky top-0 z-50">
      <div className="flex md:hidden items-center">
        <Button variant="ghost" size="icon" className="md:hidden">
          <Menu className="h-5 w-5" />
          <span className="sr-only">Toggle navigation menu</span>
        </Button>
      </div>

      <nav className="hidden md:flex items-center gap-1 flex-1">
        {quickLinks.map((link) => {
          const isActive =
            link.href === "/"
              ? pathname === "/"
              : pathname.startsWith(link.href);

          return (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200",
                isActive
                  ? "text-primary bg-primary/10"
                  : "text-muted-foreground hover:text-white hover:bg-white/5"
              )}
            >
              <link.icon className="w-4 h-4" />
              {link.name}
            </Link>
          );
        })}
      </nav>

      {/* Mobile: mostra página atual */}
      <div className="flex md:hidden items-center flex-1">
        <span className="text-sm font-semibold text-white">
          {quickLinks.find((l) =>
            l.href === "/" ? pathname === "/" : pathname.startsWith(l.href)
          )?.name || "ThinkCard"}
        </span>
      </div>
    </header>
  );
}
