// app/api/score/route.ts — Get score breakdown, rules, and paginated transaction ledger

import { NextRequest, NextResponse } from "next/server";
import { requireSession } from "@/lib/auth";
import { ScoreService } from "@/lib/score-service";
import { SCORE_RULE_DESCRIPTIONS } from "@/lib/score-config";
import { parseBoundedInteger } from "@/lib/validation";

export async function GET(request: NextRequest) {
  const { user, error } = await requireSession(request);
  if (error || !user) {
    return NextResponse.json({ error }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const page = parseBoundedInteger(searchParams.get("page"), 1, 1, 1_000);
  const limit = parseBoundedInteger(searchParams.get("limit"), 20, 1, 100);

  if (!page || !limit) {
    return NextResponse.json({ error: "Invalid pagination parameters" }, { status: 400 });
  }

  const ledger = await ScoreService.getUserScoreLedger(user.id, page, limit);

  return NextResponse.json({
    user: {
      id: user.id,
      generatedName: user.generatedName,
      generatedNumber: user.generatedNumber,
      score: ledger.score,
      uniquePandals: ledger.uniquePandals,
    },
    rules: SCORE_RULE_DESCRIPTIONS,
    history: ledger.transactions,
    pagination: ledger.pagination,
  });
}
