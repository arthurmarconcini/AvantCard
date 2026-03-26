"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import {
  Menu,
  User,
  Settings,
  LogOut,
  ChevronDown,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const pageTitles: Record<string, string> = {
  "/": "Dashboard",
  "/accounts": "Minhas Contas",
  "/cards": "Cartões",
  "/people": "Pessoas",
  "/loans": "Empréstimos",
  "/reports": "Relatórios",
  "/settings": "Configurações",
  "/profile": "Perfil",
};

function getPageTitle(pathname: string): string {
  if (pageTitles[pathname]) return pageTitles[pathname];
  const match = Object.keys(pageTitles).find(
    (route) => route !== "/" && pathname.startsWith(route)
  );
  return match ? pageTitles[match] : "ThinkCard";
}

export function Topbar() {
  const pathname = usePathname();
  const { data: session } = useSession();

  const userName = session?.user?.name ?? "Usuário";
  const userEmail = session?.user?.email ?? "";
  const userInitials = userName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const pageTitle = getPageTitle(pathname);

  return (
    <header className="flex h-16 items-center justify-between border-b border-border bg-background/95 px-4 backdrop-blur supports-backdrop-filter:bg-background/60 md:px-6 sticky top-0 z-50">
      {/* Mobile: hamburger + título */}
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" className="lg:hidden">
          <Menu className="h-5 w-5" />
          <span className="sr-only">Toggle navigation menu</span>
        </Button>
        <h1 className="text-lg font-semibold tracking-tight text-foreground">
          {pageTitle}
        </h1>
      </div>

      {/* Dropdown do usuário */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button className="flex items-center gap-2 rounded-xl px-2 py-1.5 transition-all duration-200 hover:bg-white/5 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary">
            <Avatar className="h-8 w-8">
              <AvatarFallback className="bg-primary/20 text-primary text-sm font-bold">
                {userInitials}
              </AvatarFallback>
            </Avatar>
            <span className="hidden md:block text-sm font-medium text-foreground">
              {userName}
            </span>
            <ChevronDown className="hidden md:block h-4 w-4 text-muted-foreground" />
          </button>
        </DropdownMenuTrigger>

        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuLabel className="font-normal">
            <div className="flex flex-col gap-1">
              <p className="text-sm font-medium leading-none">{userName}</p>
              <p className="text-xs text-muted-foreground leading-none">
                {userEmail}
              </p>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem asChild>
            <Link href="/profile" className="cursor-pointer">
              <User className="mr-2 h-4 w-4" />
              Perfil
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link href="/settings" className="cursor-pointer">
              <Settings className="mr-2 h-4 w-4" />
              Configurações
            </Link>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            className="text-red-400 focus:text-red-400 focus:bg-red-500/10 cursor-pointer"
            onClick={() => signOut({ callbackUrl: "/login" })}
          >
            <LogOut className="mr-2 h-4 w-4" />
            Sair
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  );
}
