import { useState, useEffect, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import { fetchCompanies } from "@/lib/api";
import { Company, CompanyFilters } from "@/lib/types";
import { saveSearch, getLists, addCompanyToList, saveList, getRecentlyViewed } from "@/lib/storage";
import { getCompanyById } from "@/lib/api";
import CompanyCard from "@/components/CompanyCard";
import FiltersPanel from "@/components/FiltersPanel";
import CompanyPagination from "@/components/CompanyPagination";
import EmptyState from "@/components/EmptyState";
import { useToast } from "@/hooks/use-toast";
import { LayoutGrid, Table, SearchX, Filter, X, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

export default function Companies() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { toast } = useToast();

  const getFilters = (): CompanyFilters => ({
    search: searchParams.get("search") || "",
    sector: searchParams.get("sector") || "",
    stage: searchParams.get("stage") || "",
    location: searchParams.get("location") || "",
    sortBy: searchParams.get("sortBy") || "name",
    sortDir: (searchParams.get("sortDir") as "asc" | "desc") || "asc",
    page: Number(searchParams.get("page")) || 1,
  });

  const [filters, setFiltersState] = useState<CompanyFilters>(getFilters);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [view, setView] = useState<"grid" | "table">("grid");
  const [searchInput, setSearchInput] = useState(filters.search);
  const [saveModalOpen, setSaveModalOpen] = useState(false);
  const [saveSearchName, setSaveSearchName] = useState("");
  const [listPickerOpen, setListPickerOpen] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  // Recently viewed
  const recentIds = getRecentlyViewed();
  const recentCompanies = recentIds.map(getCompanyById).filter(Boolean) as Company[];

  const updateFilters = useCallback((updates: Partial<CompanyFilters>) => {
    const newFilters = { ...filters, ...updates };
    if (!("page" in updates)) newFilters.page = 1;
    setFiltersState(newFilters);

    const params = new URLSearchParams();
    Object.entries(newFilters).forEach(([k, v]) => {
      if (v && v !== "asc" && k !== "sortBy" && k !== "page") params.set(k, String(v));
      else if (k === "sortBy" && v !== "name") params.set(k, String(v));
      else if (k === "sortDir" && v !== "asc") params.set(k, String(v));
      else if (k === "page" && Number(v) > 1) params.set(k, String(v));
    });
    setSearchParams(params, { replace: true });
  }, [filters, setSearchParams]);

  // Debounce search input
  useEffect(() => {
    const t = setTimeout(() => {
      if (searchInput !== filters.search) updateFilters({ search: searchInput });
    }, 400);
    return () => clearTimeout(t);
  }, [searchInput]);

  // Sync from URL on mount
  useEffect(() => {
    setFiltersState(getFilters());
    setSearchInput(searchParams.get("search") || "");
  }, []);

  // Fetch companies
  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    fetchCompanies(filters)
      .then((res) => {
        if (cancelled) return;
        setCompanies(res.data);
        setTotal(res.total);
        setTotalPages(res.totalPages);
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err.message);
          toast({ title: "Error", description: err.message, variant: "destructive" });
        }
      })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [filters]);

  const handleReset = () => {
    const reset: CompanyFilters = { search: "", sector: "", stage: "", location: "", sortBy: "name", sortDir: "asc", page: 1 };
    setFiltersState(reset);
    setSearchInput("");
    setSearchParams({}, { replace: true });
  };

  const handleSaveSearch = () => {
    if (!saveSearchName.trim()) return;
    saveSearch({
      id: crypto.randomUUID(),
      name: saveSearchName.trim(),
      filters: { search: filters.search, sector: filters.sector, stage: filters.stage, location: filters.location, sortBy: filters.sortBy, sortDir: filters.sortDir },
      savedAt: new Date().toISOString(),
    });
    setSaveModalOpen(false);
    setSaveSearchName("");
    toast({ title: "Search saved!" });
  };

  const handleSaveToList = (company: Company) => {
    setSelectedCompany(company);
    setListPickerOpen(true);
  };

  const lists = getLists();
  const [newListName, setNewListName] = useState("");

  const handleAddToList = (listId: string) => {
    if (selectedCompany) {
      addCompanyToList(listId, selectedCompany.id);
      toast({ title: `Added to list` });
      setListPickerOpen(false);
    }
  };

  const handleCreateAndAdd = () => {
    if (!newListName.trim() || !selectedCompany) return;
    const newList = { id: crypto.randomUUID(), name: newListName.trim(), companyIds: [selectedCompany.id], createdAt: new Date().toISOString() };
    saveList(newList);
    toast({ title: `Created list "${newList.name}"` });
    setListPickerOpen(false);
    setNewListName("");
  };

  const filtersPanelContent = (
    <FiltersPanel
      filters={filters}
      onChange={updateFilters}
      onReset={handleReset}
      onSaveSearch={() => setSaveModalOpen(true)}
      searchValue={searchInput}
      onSearchChange={setSearchInput}
    />
  );

  return (
    <div className="space-y-6">
      {/* Recently Viewed */}
      {recentCompanies.length > 0 && (
        <div>
          <h3 className="text-sm font-medium text-muted-foreground mb-3">Recently Viewed</h3>
          <div className="flex gap-3 overflow-x-auto pb-2">
            {recentCompanies.map((c) => (
              <a key={c.id} href={`/companies/${c.id}`} className="shrink-0 px-4 py-2.5 bg-card border border-border rounded-lg hover:border-primary/50 transition-colors text-sm text-foreground">
                {c.name}
              </a>
            ))}
          </div>
        </div>
      )}

      <div className="flex gap-6">
        {/* Desktop Filters */}
        <aside className="hidden lg:block w-[280px] shrink-0 sticky top-20 self-start">
          <div className="bg-card border border-border rounded-xl p-5">
            {filtersPanelContent}
          </div>
        </aside>

        {/* Mobile Filters Button */}
        <div className="lg:hidden fixed bottom-6 right-6 z-30">
          <Button onClick={() => setMobileFiltersOpen(true)} className="shadow-xl rounded-full h-12 w-12 p-0">
            <Filter className="w-5 h-5" />
          </Button>
        </div>

        {/* Mobile Filters Drawer */}
        {mobileFiltersOpen && (
          <div className="fixed inset-0 z-40 lg:hidden">
            <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" onClick={() => setMobileFiltersOpen(false)} />
            <div className="absolute bottom-0 left-0 right-0 bg-card border-t border-border rounded-t-2xl p-6 max-h-[80vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-semibold text-foreground">Filters</h3>
                <button onClick={() => setMobileFiltersOpen(false)}><X className="w-5 h-5 text-muted-foreground" /></button>
              </div>
              {filtersPanelContent}
            </div>
          </div>
        )}

        {/* Results */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-sm text-muted-foreground">
              {loading ? "Loading..." : `${total} companies found`}
            </h2>
            <div className="flex gap-1">
              {(["grid", "table"] as const).map((v) => (
                <button
                  key={v}
                  onClick={() => setView(v)}
                  className={`p-2 rounded-md transition-colors ${view === v ? "bg-secondary text-foreground" : "text-muted-foreground hover:text-foreground"}`}
                >
                  {v === "grid" ? <LayoutGrid className="w-4 h-4" /> : <Table className="w-4 h-4" />}
                </button>
              ))}
            </div>
          </div>

          {error && (
            <div className="rounded-xl border border-destructive/50 bg-destructive/10 p-6 text-center mb-6">
              <AlertTriangle className="w-8 h-8 text-destructive mx-auto mb-3" />
              <p className="text-destructive font-medium mb-3">{error}</p>
              <Button onClick={() => updateFilters({})} variant="outline" size="sm">Retry</Button>
            </div>
          )}

          {loading ? (
            <div className={view === "grid" ? "grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4" : "space-y-2"}>
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="bg-card border border-border rounded-xl p-5 space-y-3">
                  <div className="flex gap-2"><div className="h-5 w-16 skeleton-shimmer rounded-full" /><div className="h-5 w-14 skeleton-shimmer rounded-full" /></div>
                  <div className="h-5 w-32 skeleton-shimmer rounded" />
                  <div className="h-4 w-full skeleton-shimmer rounded" />
                  <div className="h-4 w-2/3 skeleton-shimmer rounded" />
                </div>
              ))}
            </div>
          ) : companies.length === 0 ? (
            <EmptyState
              icon={SearchX}
              title="No companies match your filters"
              description="Try adjusting your search or filter criteria"
              action={{ label: "Reset filters", onClick: handleReset }}
            />
          ) : view === "grid" ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {companies.map((c, i) => (
                <CompanyCard key={c.id} company={c} index={i} onSave={handleSaveToList} />
              ))}
            </div>
          ) : (
            <div className="bg-card border border-border rounded-xl overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border text-muted-foreground text-left">
                    <th className="p-3 font-medium">Name</th>
                    <th className="p-3 font-medium hidden md:table-cell">Sector</th>
                    <th className="p-3 font-medium hidden md:table-cell">Stage</th>
                    <th className="p-3 font-medium hidden lg:table-cell">Location</th>
                    <th className="p-3 font-medium hidden lg:table-cell">Founded</th>
                    <th className="p-3 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {companies.map((c) => (
                    <tr key={c.id} className="border-b border-border last:border-0 hover:bg-secondary/50 transition-colors">
                      <td className="p-3 font-medium text-foreground">{c.name}</td>
                      <td className="p-3 hidden md:table-cell text-muted-foreground">{c.sector}</td>
                      <td className="p-3 hidden md:table-cell text-muted-foreground">{c.stage}</td>
                      <td className="p-3 hidden lg:table-cell text-muted-foreground">{c.location}</td>
                      <td className="p-3 hidden lg:table-cell text-muted-foreground">{c.founded}</td>
                      <td className="p-3">
                        <a href={`/companies/${c.id}`} className="text-primary hover:underline text-xs">View</a>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {!loading && !error && total > 0 && (
            <CompanyPagination
              page={filters.page}
              totalPages={totalPages}
              total={total}
              onPageChange={(p) => updateFilters({ page: p })}
            />
          )}
        </div>
      </div>

      {/* Save Search Modal */}
      <Dialog open={saveModalOpen} onOpenChange={setSaveModalOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Save Search</DialogTitle></DialogHeader>
          <div className="space-y-4 pt-2">
            <Input
              value={saveSearchName}
              onChange={(e) => setSaveSearchName(e.target.value)}
              placeholder="Search name..."
              onKeyDown={(e) => e.key === "Enter" && handleSaveSearch()}
              autoFocus
            />
            <Button onClick={handleSaveSearch} className="w-full" disabled={!saveSearchName.trim()}>Save</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* List Picker Modal */}
      <Dialog open={listPickerOpen} onOpenChange={setListPickerOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Save to List</DialogTitle></DialogHeader>
          <div className="space-y-3 pt-2">
            {lists.length > 0 ? (
              lists.map((list) => (
                <button
                  key={list.id}
                  onClick={() => handleAddToList(list.id)}
                  className="w-full text-left p-3 rounded-lg bg-secondary hover:bg-secondary/80 text-sm text-foreground transition-colors"
                >
                  {list.name} <span className="text-muted-foreground">({list.companyIds.length})</span>
                </button>
              ))
            ) : (
              <p className="text-sm text-muted-foreground text-center py-2">No lists yet</p>
            )}
            <div className="border-t border-border pt-3 flex gap-2">
              <Input
                value={newListName}
                onChange={(e) => setNewListName(e.target.value)}
                placeholder="New list name..."
                onKeyDown={(e) => e.key === "Enter" && handleCreateAndAdd()}
              />
              <Button onClick={handleCreateAndAdd} disabled={!newListName.trim()} size="sm">Create</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
