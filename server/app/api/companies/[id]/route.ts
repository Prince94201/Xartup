/**
 * GET /api/companies/[id]
 * Returns a single mock company by id.
 */

import { NextResponse } from "next/server";
import { companies } from "../../../../lib/mock-data";

export async function GET(
  _req: Request,
  ctx: { params: Promise<{ id: string }> }
) {
  const { id } = await ctx.params;

  const company = companies.find((c) => c.id === id);

  if (!company) {
    return NextResponse.json({ error: "Company not found" }, { status: 404 });
  }

  return NextResponse.json(company);
}
