import { ReactNode, useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Building2, List, Bookmark, Search, Bell, ChevronRight, Menu, X } from "lucide-react";
import { Input } from "@/components/ui/input";

const NAV_ITEMS = [
  { to: "/companies", label: "Companies", icon: Building2 },
  { to: "/lists", label: "Lists", icon: List },
  { to: "/saved", label: "Saved Searches", icon: Bookmark },
];

function SidebarContent({ search, setSearch, onNavigate }: {
  search: string;
  setSearch: (v: string) => void;
  onNavigate?: () => void;
}) {
  const location = useLocation();
  const navigate = useNavigate();

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (search.trim()) {
      navigate(`/companies?search=${encodeURIComponent(search.trim())}`);
      onNavigate?.();
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="p-5 pb-4">
        <Link to="/companies" className="flex items-center gap-2.5 mb-6">
          <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center overflow-hidden">
            <img src="/placeholder.svg" alt="Logo" className="w-5 h-5" />
          </div>
          <span className="text-foreground font-semibold text-lg tracking-tight">VC Scout</span>
        </Link>

        <form onSubmit={handleSearchSubmit}>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              id="global-search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search... (press /)"
              className="pl-9 bg-secondary border-border text-sm h-9"
            />
          </div>
        </form>
      </div>

      <nav className="flex-1 px-3">
        {NAV_ITEMS.map((item) => {
          const active = location.pathname.startsWith(item.to);
          return (
            <Link
              key={item.to}
              to={item.to}
              onClick={onNavigate}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg mb-1 text-sm font-medium transition-colors ${
                active
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-secondary hover:text-foreground"
              }`}
            >
              <item.icon className="w-4 h-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="p-5 pt-3">
        <div className="flex items-center gap-2 text-xs text-muted-foreground/50">
          <span>Powered by AI</span>
        </div>
      </div>
    </div>
  );
}

export default function AppLayout({ children }: { children: ReactNode }) {
  const [search, setSearch] = useState("");
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();

  // Keyboard shortcut: "/" to focus search
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "/" && !["INPUT", "TEXTAREA"].includes((e.target as HTMLElement).tagName)) {
        e.preventDefault();
        document.getElementById("global-search")?.focus();
      }
      if (e.key === "Escape") setMobileOpen(false);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  // Build breadcrumb
  const pathParts = location.pathname.split("/").filter(Boolean);
  const breadcrumbs = pathParts.map((part, i) => ({
    label: part.charAt(0).toUpperCase() + part.slice(1),
    path: "/" + pathParts.slice(0, i + 1).join("/"),
  }));

  return (
    <div className="flex min-h-screen w-full bg-background">
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex w-60 flex-col border-r border-border bg-sidebar fixed inset-y-0 left-0 z-30">
        <SidebarContent search={search} setSearch={setSearch} />
      </aside>

      {/* Mobile sidebar overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div
            className="absolute inset-0 bg-background/80 backdrop-blur-sm"
            onClick={() => setMobileOpen(false)}
          />
          <aside className="relative h-full w-[84vw] max-w-[20rem] bg-sidebar border-r border-border">
            <button
              onClick={() => setMobileOpen(false)}
              className="absolute top-4 right-4 text-muted-foreground hover:text-foreground"
            >
              <X className="w-5 h-5" />
            </button>
            <SidebarContent
              search={search}
              setSearch={setSearch}
              onNavigate={() => setMobileOpen(false)}
            />
          </aside>
        </div>
      )}

      {/* Main content */}
      <div className="flex min-h-screen flex-1 flex-col lg:ml-60">
        {/* Top bar */}
        <header className="sticky top-0 z-20 h-14 border-b border-border bg-background/80 backdrop-blur-md">
          <div className="mx-auto flex h-full w-full max-w-6xl items-center justify-between px-4 sm:px-6">
            <div className="flex min-w-0 items-center gap-3">
              <button
                onClick={() => setMobileOpen(true)}
                className="lg:hidden text-muted-foreground hover:text-foreground"
                aria-label="Open navigation menu"
              >
                <Menu className="w-5 h-5" />
              </button>

              <nav className="flex min-w-0 items-center gap-1 text-sm text-muted-foreground">
                <Link
                  to="/companies"
                  className="hover:text-foreground transition-colors shrink-0"
                >
                  Home
                </Link>
                {breadcrumbs.map((bc) => (
                  <span key={bc.path} className="flex min-w-0 items-center gap-1">
                    <ChevronRight className="w-3 h-3 shrink-0" />
                    <Link
                      to={bc.path}
                      className="hover:text-foreground transition-colors capitalize truncate max-w-[40vw] sm:max-w-none"
                      title={bc.label}
                    >
                      {bc.label}
                    </Link>
                  </span>
                ))}
              </nav>
            </div>

            <div className="flex items-center gap-3">
              <button className="relative text-muted-foreground hover:text-foreground transition-colors" aria-label="Notifications">
                <Bell className="w-5 h-5" />
                <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-primary rounded-full" />
              </button>
              <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-xs font-medium text-primary">
                VC
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1">
          <div className="mx-auto w-full max-w-6xl px-4 py-5 sm:px-6 sm:py-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
