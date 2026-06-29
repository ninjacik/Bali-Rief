import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { ReactNode } from "react";
import { ArrowLeft, AlertTriangle, Home, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";

interface AppLayoutProps {
  children: ReactNode;
  title: string;
  subtitle?: string;
  backHref?: string;
  backLabel?: string;
  role?: "pelapor" | "relawan" | "admin" | "donatur";
  actions?: ReactNode;
  showLogout?: boolean;
}

const roleColors = {
  pelapor: "bg-primary text-primary-foreground",
  relawan: "bg-secondary text-secondary-foreground",
  admin: "bg-chart-4 text-white",
  donatur: "bg-rose-500 text-white",
};

const roleLabels = {
  pelapor: "Pelapor",
  relawan: "Relawan",
  admin: "Admin",
  donatur: "Donatur",
};

export default function AppLayout({ children, title, subtitle, backHref, backLabel, role, actions, showLogout }: AppLayoutProps) {
  const { logout, user } = useAuth();

  const handleLogout = async () => {
    await logout();
    window.location.href = import.meta.env.BASE_URL || "/";
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 border-b bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60">
        <div className="max-w-6xl mx-auto px-4 h-14 flex items-center gap-3">
          <Button asChild variant="ghost" size="icon" className="shrink-0">
            <Link href="/">
              <Home className="h-4 w-4" />
            </Link>
          </Button>
          {backHref && (
            <Button asChild variant="ghost" size="sm" className="shrink-0">
              <Link href={backHref}>
                <ArrowLeft className="h-4 w-4 mr-1" />
                {backLabel || "Kembali"}
              </Link>
            </Button>
          )}
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <AlertTriangle className="h-5 w-5 text-primary shrink-0" />
            <span className="font-semibold text-sm truncate">{title}</span>
            {subtitle && <span className="text-muted-foreground text-sm hidden sm:block truncate">— {subtitle}</span>}
          </div>
          <div className="flex items-center gap-2">
            {actions}
            {role && (
              <span className={cn("text-xs font-semibold px-2.5 py-1 rounded-full", roleColors[role])}>
                {roleLabels[role]}
              </span>
            )}
            {(showLogout || user) && (
              <Button variant="ghost" size="icon" onClick={handleLogout} title="Keluar" className="shrink-0">
                <LogOut className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </header>
      <main className="max-w-6xl mx-auto px-4 py-6">
        {children}
      </main>
    </div>
  );
}

export function NavTabs({ tabs }: { tabs: { href: string; label: string }[] }) {
  const [location] = useLocation();
  return (
    <div className="flex gap-1 border-b mb-6 overflow-x-auto">
      {tabs.map(tab => (
        <Link key={tab.href} href={tab.href}>
          <button className={cn(
            "px-4 py-2 text-sm font-medium border-b-2 whitespace-nowrap transition-colors",
            location === tab.href
              ? "border-primary text-primary"
              : "border-transparent text-muted-foreground hover:text-foreground"
          )}>
            {tab.label}
          </button>
        </Link>
      ))}
    </div>
  );
}
