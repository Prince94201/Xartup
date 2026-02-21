import { Company, CompanyFilters, EnrichmentResult } from "./types";
import { MOCK_COMPANIES } from "./mock-data";

const API_BASE = "https://xartup-ochre.vercel.app/api";
const USE_MOCK = false; // Toggle to false when real API is available

type CompaniesResponse = {
  data: Company[];
  total: number;
  page: number;
  totalPages: number;
};

function mockFetchCompanies(filters: CompanyFilters): CompaniesResponse {
  let results = [...MOCK_COMPANIES];

  if (filters.search) {
    const q = filters.search.toLowerCase();
    results = results.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.description.toLowerCase().includes(q) ||
        c.tags.some((t) => t.toLowerCase().includes(q))
    );
  }
  if (filters.sector) results = results.filter((c) => c.sector === filters.sector);
  if (filters.stage) results = results.filter((c) => c.stage === filters.stage);
  if (filters.location) results = results.filter((c) => c.location === filters.location);

  const sortBy = filters.sortBy || "name";
  const dir = filters.sortDir === "desc" ? -1 : 1;
  results.sort((a, b) => {
    if (sortBy === "founded") return (a.founded - b.founded) * dir;
    if (sortBy === "employees") return a.employees.localeCompare(b.employees) * dir;
    return a.name.localeCompare(b.name) * dir;
  });

  const limit = 9;
  const page = filters.page || 1;
  const total = results.length;
  const totalPages = Math.max(1, Math.ceil(total / limit));
  const start = (page - 1) * limit;
  const data = results.slice(start, start + limit);

  return { data, total, page, totalPages };
}

export async function fetchCompanies(filters: CompanyFilters): Promise<CompaniesResponse> {
  if (USE_MOCK) {
    await new Promise((r) => setTimeout(r, 300));
    return mockFetchCompanies(filters);
  }

  const params = new URLSearchParams();
  if (filters.search) params.set("search", filters.search);
  if (filters.sector) params.set("sector", filters.sector);
  if (filters.stage) params.set("stage", filters.stage);
  if (filters.location) params.set("location", filters.location);
  if (filters.sortBy) params.set("sortBy", filters.sortBy);
  if (filters.sortDir) params.set("sortDir", filters.sortDir);
  params.set("page", String(filters.page || 1));
  params.set("limit", "9");

  const res = await fetch(`${API_BASE}/companies?${params}`);
  if (!res.ok) throw new Error(`Failed to fetch companies: ${res.statusText}`);
  return res.json();
}

export async function fetchCompany(id: string): Promise<Company> {
  if (USE_MOCK) {
    await new Promise((r) => setTimeout(r, 200));
    const company = MOCK_COMPANIES.find((c) => c.id === id);
    if (!company) throw new Error("Company not found");
    return company;
  }

  const res = await fetch(`${API_BASE}/companies/${id}`);
  if (!res.ok) {
    if (res.status === 404) throw new Error("Company not found");
    throw new Error(`Failed to fetch company: ${res.statusText}`);
  }
  return res.json();
}

export async function enrichCompany(url: string): Promise<EnrichmentResult> {
  if (USE_MOCK) {
    await new Promise((r) => setTimeout(r, 2000));
    return {
      summary: "An innovative technology company focused on disrupting their sector through AI-powered solutions. Strong team with enterprise traction and growing revenue.",
      what_they_do: [
        "Provides AI-powered analytics and automation tools",
        "Serves enterprise clients across multiple verticals",
        "Offers API-first platform with developer-friendly documentation",
        "Maintains SOC 2 compliance and enterprise security standards",
      ],
      keywords: ["AI", "enterprise", "analytics", "automation", "API-first", "B2B SaaS"],
      signals: [
        "Recent fundraise indicates strong investor interest",
        "Growing team suggests scaling operations",
        "Enterprise partnerships signal product-market fit",
        "International expansion underway",
      ],
      sources: [
        { url, timestamp: new Date().toISOString() },
        { url: "https://techcrunch.com", timestamp: new Date().toISOString() },
      ],
      cached_at: new Date().toISOString(),
    };
  }

  const res = await fetch(`${API_BASE}/enrich`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ url }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(err.error || "Enrichment failed");
  }
  return res.json();
}

export function getUniqueLocations(): string[] {
  return [...new Set(MOCK_COMPANIES.map((c) => c.location))].sort();
}

export function getCompanyById(id: string): Company | undefined {
  return MOCK_COMPANIES.find((c) => c.id === id);
}
