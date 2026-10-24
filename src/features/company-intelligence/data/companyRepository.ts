import type {
  Company,
  CompanyId,
  CompanyIndexEntry,
  CompanyRaw,
} from "./companyTypes";

const DATA_BASE_URL = `${import.meta.env.BASE_URL}data/company-intelligence/`;//"/data/company-intelligence";

export async function getCompanyIndex(): Promise<CompanyIndexEntry[]> {
  const response = await fetch(`${DATA_BASE_URL}companies-index.json`);

  if (!response.ok) {
    throw new Error(
      `Failed to load company index: ${response.status} ${response.statusText}`
    );
  }

  return response.json();
}

export async function getCompany(id: CompanyId): Promise<Company> {
  const response = await fetch(
    `${DATA_BASE_URL}companies/${id}.json`
  );

  if (!response.ok) {
    throw new Error(
      `Failed to load company "${id}": ${response.status} ${response.statusText}`
    );
  }

  const data: CompanyRaw = await response.json();

  return {
    id,
    data,
  };
}