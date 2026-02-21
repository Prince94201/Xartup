/**
 * Shared TypeScript types for the VC Scout backend.
 * Centralizes data contracts used by API routes and mock data.
 */

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

export type Sector =
  | "FinTech"
  | "LegalTech"
  | "HealthTech"
  | "SaaS"
  | "Climate"
  | "Logistics"
  | "DataTech"
  | "EdTech"
  | "CyberSecurity"
  | "AgTech"
  | "HRTech"
  | "PropTech";

export type Stage = "Pre-Seed" | "Seed" | "Series A" | "Series B";

export type EmployeeCount = "1-10" | "11-50" | "51-100" | "101-500";

export type CompanySignal = { date: string; event: string };

export type Company = {
  id: string;
  name: string;
  website: string;
  description: string;
  sector: Sector;
  stage: Stage;
  location: string;
  founded: number;
  employees: EmployeeCount;
  tags: string[];
  signals: CompanySignal[];
  enriched?: EnrichmentResult;
};
