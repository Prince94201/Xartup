/**
 * GET /api/companies/[id]
 * Returns a single mock company by id.
 */

import { NextResponse } from "next/server";
import { companies } from "../../../../lib/mock-data";

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

export async function GET(
  _req: Request,
  ctx: { params: Promise<{ id: string }> }
) {
  const { id } = await ctx.params;

  const company = companies.find((c) => c.id === id);

  if (!company) {
    return withCors(
      NextResponse.json({ error: "Company not found" }, { status: 404 })
    );
  }

  return withCors(NextResponse.json(company));
}
