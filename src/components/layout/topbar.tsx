"use client";

import { Bell, Search, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function Topbar() {
  return (
    <header className="flex h-16 items-center gap-4 border-b border-border/50 bg-background/95 px-4 backdrop-blur supports-backdrop-filter:bg-background/60 md:px-6 sticky top-0 z-50">
      <div className="flex md:hidden items-center">
        {/* Mobile Menu Trigger Placeholder */}
        <Button variant="ghost" size="icon" className="md:hidden">
          <Menu className="h-5 w-5" />
          <span className="sr-only">Toggle navigation menu</span>
        </Button>
      </div>
      
      <div className="flex w-full items-center gap-4 md:ml-auto md:gap-2 lg:gap-4">
        <form className="ml-auto flex-1 sm:flex-initial">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Pesquisar..."
              className="pl-8 sm:w-[300px] md:w-[200px] lg:w-[300px] bg-muted/50 focus-visible:ring-primary border-none"
            />
          </div>
        </form>
        
        <Button variant="outline" size="icon" className="rounded-full relative">
          <Bell className="h-4 w-4 text-foreground" />
          <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-primary" />
          <span className="sr-only">Notificações</span>
        </Button>
        
      </div>
    </header>
  );
}
