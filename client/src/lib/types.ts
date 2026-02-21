export type Company = {
  id: string;
  name: string;
  website: string;
  description: string;
  sector: string;
  stage: string;
  location: string;
  founded: number;
  employees: string;
  tags: string[];
  signals: { date: string; event: string }[];
};

export type EnrichmentResult = {
  summary: string;
  what_they_do: string[];
  keywords: string[];
  signals: string[];
  sources: { url: string; timestamp: string }[];
  cached_at: string;
};

export type SavedList = {
  id: string;
  name: string;
  companyIds: string[];
  createdAt: string;
};

export type SavedSearch = {
  id: string;
  name: string;
  filters: {
    search: string;
    sector: string;
    stage: string;
    location: string;
    sortBy: string;
    sortDir: "asc" | "desc";
  };
  savedAt: string;
};

export type CompanyFilters = {
  search: string;
  sector: string;
  stage: string;
  location: string;
  sortBy: string;
  sortDir: "asc" | "desc";
  page: number;
};

export const SECTORS = [
  "FinTech", "LegalTech", "HealthTech", "SaaS", "Climate",
  "Logistics", "DataTech", "EdTech", "CyberSecurity", "AgTech",
  "HRTech", "PropTech",
] as const;

export const STAGES = ["Pre-Seed", "Seed", "Series A", "Series B"] as const;

export const SECTOR_COLORS: Record<string, string> = {
  FinTech: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  LegalTech: "bg-purple-500/20 text-purple-400 border-purple-500/30",
  HealthTech: "bg-green-500/20 text-green-400 border-green-500/30",
  SaaS: "bg-indigo-500/20 text-indigo-400 border-indigo-500/30",
  Climate: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
  Logistics: "bg-orange-500/20 text-orange-400 border-orange-500/30",
  DataTech: "bg-cyan-500/20 text-cyan-400 border-cyan-500/30",
  EdTech: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
  CyberSecurity: "bg-red-500/20 text-red-400 border-red-500/30",
  AgTech: "bg-lime-500/20 text-lime-400 border-lime-500/30",
  HRTech: "bg-violet-500/20 text-violet-400 border-violet-500/30",
  PropTech: "bg-amber-500/20 text-amber-400 border-amber-500/30",
};

export const STAGE_STYLES: Record<string, string> = {
  "Pre-Seed": "border border-muted-foreground/30 text-muted-foreground",
  "Seed": "border border-primary/50 text-primary",
  "Series A": "bg-primary/20 text-primary border border-primary/30",
  "Series B": "bg-primary/30 text-primary border border-primary/40",
};
