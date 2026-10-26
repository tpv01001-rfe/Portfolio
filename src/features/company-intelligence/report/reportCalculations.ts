export interface ReportCalculationData {
  revenue_estimate?: string | null;
  growth_signal?: string | null;
  profitability_signal?: string | null;
  partners?: string[] | null;
  notable_clients?: string[] | null;
  customer_segments?: string[] | null;
  partnership_signal?: string | null;
  organization_type?: string | null;
  technology_notes?: string | null;
}

const clampScore = (score: number): number =>
  Math.min(Math.max(score, 0), 100);

export function calculateFinancialSustainability(
  data: ReportCalculationData
): number {
  let score = 30;

  if (data.revenue_estimate === "1B+ SEK") score += 40;
  else if (data.revenue_estimate === "100M-1B SEK") score += 30;
  else if (data.revenue_estimate === "10M-100M SEK") score += 20;

  if (data.growth_signal === "growth") score += 20;
  if (data.profitability_signal === "unprofitable") score -= 25;
  if (data.profitability_signal === "profitable") score += 10;

  return clampScore(score);
}

export function calculateCommercialTraction(
  data: ReportCalculationData
): number {
  const partnerCount = data.partners?.length ?? 0;
  const clientCount = data.notable_clients?.length ?? 0;
  const segmentCount = data.customer_segments?.length ?? 0;

  let score =
    partnerCount * 15 +
    clientCount * 15 +
    segmentCount * 8;

  if (
    data.partnership_signal
      ?.toLowerCase()
      .includes("strong")
  ) {
    score += 20;
  }

  return clampScore(score);
}

export function calculateOperationalScalability(
  data: ReportCalculationData
): number {
  let score = 40;

  if (data.organization_type === "Enterprise") {
    score += 20;
  }

  const techNotes =
    (data.technology_notes ?? "").toLowerCase();

  if (
    techNotes.includes("industrial scale") ||
    techNotes.includes("scale")
  ) {
    score += 20;
  }

  if (
    techNotes.includes("proprietary") ||
    techNotes.includes("formulations")
  ) {
    score += 20;
  }

  return clampScore(score);
}

/*
export function calculateDataCompleteness(
  data: CompanyRaw
): number {
  const fields = [
    data.employees,
    data.revenue_estimate,
    data.growth_signal,
    data.profitability_signal,
    data.partners,
    data.customer_segments,
    data.notable_clients,
    data.target_market,
    data.strategy_notes,
    data.technology_notes,
    data.risk_notes,
    data.ai_assessment,
    data.strengths,
    data.weaknesses,
    data.threats,
  ];

  const filled = fields.filter((value) => {
    if (value == null) return false;
    if (typeof value === "string") {
      return value.trim().length > 0;
    }
    if (Array.isArray(value)) {
      return value.length > 0;
    }
    return true;
  }).length;

  return Math.round((filled / fields.length) * 100);
}
  */