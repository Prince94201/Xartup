import { CompanyFilters, SECTORS, STAGES } from "@/lib/types";
import { getUniqueLocations } from "@/lib/api";
import { Search, RotateCcw, Save } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

type Props = {
  filters: CompanyFilters;
  onChange: (filters: Partial<CompanyFilters>) => void;
  onReset: () => void;
  onSaveSearch: () => void;
  searchValue: string;
  onSearchChange: (v: string) => void;
};

export default function FiltersPanel({ filters, onChange, onReset, onSaveSearch, searchValue, onSearchChange }: Props) {
  const locations = getUniqueLocations();

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-foreground">Filters</h3>
        <button onClick={onReset} className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1 transition-colors">
          <RotateCcw className="w-3 h-3" /> Reset all
        </button>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          value={searchValue}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search companies..."
          className="pl-9 bg-secondary border-border text-sm"
        />
      </div>

      <div className="space-y-3">
        <label className="text-xs font-medium text-muted-foreground">Sector</label>
        <Select value={filters.sector || "all"} onValueChange={(v) => onChange({ sector: v === "all" ? "" : v })}>
          <SelectTrigger className="bg-secondary border-border text-sm"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Sectors</SelectItem>
            {SECTORS.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-3">
        <label className="text-xs font-medium text-muted-foreground">Stage</label>
        <Select value={filters.stage || "all"} onValueChange={(v) => onChange({ stage: v === "all" ? "" : v })}>
          <SelectTrigger className="bg-secondary border-border text-sm"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Stages</SelectItem>
            {STAGES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-3">
        <label className="text-xs font-medium text-muted-foreground">Location</label>
        <Select value={filters.location || "all"} onValueChange={(v) => onChange({ location: v === "all" ? "" : v })}>
          <SelectTrigger className="bg-secondary border-border text-sm"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Locations</SelectItem>
            {locations.map((l) => <SelectItem key={l} value={l}>{l}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-3">
        <label className="text-xs font-medium text-muted-foreground">Sort By</label>
        <Select value={filters.sortBy || "name"} onValueChange={(v) => onChange({ sortBy: v })}>
          <SelectTrigger className="bg-secondary border-border text-sm"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="name">Name</SelectItem>
            <SelectItem value="founded">Founded Year</SelectItem>
            <SelectItem value="employees">Employees</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-3">
        <label className="text-xs font-medium text-muted-foreground">Direction</label>
        <div className="flex gap-1">
          {(["asc", "desc"] as const).map((dir) => (
            <button
              key={dir}
              onClick={() => onChange({ sortDir: dir })}
              className={`flex-1 py-2 text-xs font-medium rounded-md transition-colors ${
                filters.sortDir === dir
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary text-muted-foreground hover:text-foreground"
              }`}
            >
              {dir === "asc" ? "Ascending" : "Descending"}
            </button>
          ))}
        </div>
      </div>

      <Button onClick={onSaveSearch} variant="outline" className="w-full text-sm" size="sm">
        <Save className="w-3.5 h-3.5 mr-1.5" /> Save this search
      </Button>
    </div>
  );
}
