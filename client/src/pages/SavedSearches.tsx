import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { getSavedSearches, deleteSearch } from "@/lib/storage";
import { SavedSearch } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";
import { Bookmark, Play, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import EmptyState from "@/components/EmptyState";

export default function SavedSearches() {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [searches, setSearches] = useState<SavedSearch[]>(getSavedSearches);

  const handleRun = (search: SavedSearch) => {
    const params = new URLSearchParams();
    Object.entries(search.filters).forEach(([k, v]) => {
      if (v) params.set(k, v);
    });
    navigate(`/companies?${params}`);
  };

  const handleDelete = (id: string) => {
    deleteSearch(id);
    setSearches(getSavedSearches());
    toast({ title: "Search deleted" });
  };

  const filterSummary = (f: SavedSearch["filters"]) => {
    const parts: string[] = [];
    if (f.search) parts.push(`Search: "${f.search}"`);
    if (f.sector) parts.push(`Sector: ${f.sector}`);
    if (f.stage) parts.push(`Stage: ${f.stage}`);
    if (f.location) parts.push(`Location: ${f.location}`);
    return parts.length > 0 ? parts.join(" · ") : "No filters";
  };

  return (
    <div className="w-full max-w-3xl space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-bold text-foreground">Saved Searches</h1>
        <p className="text-sm text-muted-foreground">
          Re-run saved filters instantly from here.
        </p>
      </div>

      {searches.length === 0 ? (
        <EmptyState
          icon={Bookmark}
          title="No saved searches yet"
          description="Save a search from the companies page to quickly re-run it later"
        />
      ) : (
        <div className="space-y-3">
          {searches.map((search, i) => (
            <div key={search.id} className="bg-card border border-border rounded-xl p-5 card-hover animate-stagger" style={{ animationDelay: `${i * 50}ms` }}>
              <div className="flex items-start justify-between mb-2">
                <h3 className="font-semibold text-foreground">{search.name}</h3>
                <span className="text-xs text-muted-foreground shrink-0">{new Date(search.savedAt).toLocaleDateString()}</span>
              </div>
              <p className="text-sm text-muted-foreground mb-4">{filterSummary(search.filters)}</p>
              <div className="flex gap-2">
                <Button size="sm" onClick={() => handleRun(search)}>
                  <Play className="w-3.5 h-3.5 mr-1.5" /> Run Search
                </Button>
                <Button size="sm" variant="destructive" onClick={() => handleDelete(search.id)}>
                  <Trash2 className="w-3.5 h-3.5" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
