export type CompanyId = string;

export type CompanySector =
  | "Information Technology"
  | "Agriculture & Farming"
  | "Defence"
  | "Other"
  | "GreenTech"
  | "Robotics & Manufacturing"
  | "Health"
  | "Science & Engineering"
  | "Transportation & Logistics"
  | "Telecommunication"
  | "Food & Beverages"
  | "Data & Analytics";

export interface CompanyIndexEntry {
  id: CompanyId;
  name: string;
  sector: CompanySector;
  city: string;
  country: string;
}

export interface CompanyRaw {

  company: string;
  organization_number: string;

  street: string;
  postal_code: string;
  city: string;
  sector: CompanySector;
  country: string;

  website: string | null;
  industry: string;
  summary: string;

  employees: number | null;
  organization_type: string;

  revenue_estimate: string | null;
  growth_signal: string | null;
  profitability_signal: string | null;

  has_been_acquired: boolean;
  acquired_by: string | null;
  acquisitions_made: string[] | null;
  merger_activity: string | null;

  partners: string[];
  partnership_signal: string | null;

  customer_segments: string[];
  notable_clients: string[] | null;
  target_market: string | null;

  strategy_notes: string | null;
  technology_notes: string | null;
  risk_notes: string | null;

  // Added by the latest AI prompt.
  ai_assessment?: string | null;

  strengths?: string[];
  weaknesses?: string[];
  opportunities?: string[];
  threats?: string[];

  business_score?: number | null;
}

export interface Company {
  id: CompanyId;
  data: CompanyRaw;
}