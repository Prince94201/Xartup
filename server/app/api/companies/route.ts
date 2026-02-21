/**
 * GET /api/companies
 * Returns a filtered/sorted/paginated list of mock companies for discovery UI.
 */

import { NextResponse } from "next/server";
import { companies } from "../../../lib/mock-data";

// Allow calling this API from a separately deployed frontend (Vite) app.
// Set CORS_ALLOW_ORIGIN in Vercel env, e.g. https://xartup-work.vercel.app
const ALLOW_ORIGIN = process.env.CORS_ALLOW_ORIGIN ?? "*";

function withCors(res: NextResponse) {
  res.headers.set("Access-Control-Allow-Origin", ALLOW_ORIGIN);
  res.headers.set("Vary", "Origin");
  res.headers.set("Access-Control-Allow-Methods", "GET,OPTIONS");
  res.headers.set("Access-Control-Allow-Headers", "Content-Type, Authorization");
  return res;
}

export async function OPTIONS() {
  return withCors(new NextResponse(null, { status: 204 }));
}

type SortBy = "name" | "founded" | "employees";

type SortDir = "asc" | "desc";

function parseIntParam(v: string | null, fallback: number): number {
  const n = Number.parseInt(v ?? "", 10);
  return Number.isFinite(n) && n > 0 ? n : fallback;
}

function employeesLowerBound(employees: string): number {
  // "1-10" -> 1, "11-50" -> 11, etc.
  const m = employees.match(/^(\d+)/);
  return m ? Number.parseInt(m[1], 10) : 0;
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);

  const search = (searchParams.get("search") ?? "").trim().toLowerCase();
  const sector = (searchParams.get("sector") ?? "all").trim();
  const stage = (searchParams.get("stage") ?? "all").trim();
  const location = (searchParams.get("location") ?? "all").trim();

  const sortBy = ((searchParams.get("sortBy") ?? "name").trim() as SortBy) || "name";
  const sortDir = ((searchParams.get("sortDir") ?? "asc").trim() as SortDir) || "asc";

  const page = parseIntParam(searchParams.get("page"), 1);
  const limit = parseIntParam(searchParams.get("limit"), 8);

  let filtered = companies.slice();

  if (search) {
    filtered = filtered.filter((c) => {
      const name = c.name.toLowerCase();
      const desc = c.description.toLowerCase();
      return name.includes(search) || desc.includes(search);
    });
  }

  if (sector && sector !== "all") {
    filtered = filtered.filter((c) => c.sector === sector);
  }
  if (stage && stage !== "all") {
    filtered = filtered.filter((c) => c.stage === stage);
  }
  if (location && location !== "all") {
    filtered = filtered.filter((c) => c.location === location);
  }

  filtered.sort((a, b) => {
    let cmp = 0;

    if (sortBy === "name") {
      cmp = a.name.localeCompare(b.name);
    } else if (sortBy === "founded") {
      cmp = a.founded - b.founded;
    } else if (sortBy === "employees") {
      cmp = employeesLowerBound(a.employees) - employeesLowerBound(b.employees);
    } else {
      cmp = a.name.localeCompare(b.name);
    }

    return sortDir === "desc" ? -cmp : cmp;
  });

  const total = filtered.length;
  const totalPages = Math.max(1, Math.ceil(total / limit));
  const safePage = Math.min(Math.max(1, page), totalPages);

  const start = (safePage - 1) * limit;
  const data = filtered.slice(start, start + limit);

  return withCors(
    NextResponse.json({
      data,
      total,
      page: safePage,
      totalPages,
    })
  );
}
