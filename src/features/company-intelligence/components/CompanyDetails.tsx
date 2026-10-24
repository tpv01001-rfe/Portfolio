import type { Company } from "../data/companyTypes";

interface CompanyDetailsProps {
  company: Company;
}

export function CompanyDetails({
  company,
}: CompanyDetailsProps) {
  const { data } = company;

  return (
    <section>
      <h2>{data.company}</h2>

      <p>{data.summary}</p>

      <dl>
        <dt>Sector</dt>
        <dd>{data.sector}</dd>

        <dt>Industry</dt>
        <dd>{data.industry}</dd>

        <dt>City</dt>
        <dd>{data.city}</dd>

        <dt>Organization number</dt>
        <dd>{data.organization_number}</dd>

        <dt>Employees</dt>
        <dd>{data.employees ?? "Unknown"}</dd>
      </dl>
    </section>
  );
}