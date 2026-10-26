import type { Company } from "../data/companyTypes";
import styles from "./CompanyDetails.module.css";

interface CompanyDetailsProps {
  company: Company;
  onOpenReport: () => void;
}

export function CompanyDetails({
  company,
  onOpenReport,
}: CompanyDetailsProps) {
  const { data } = company;

  return (


    <section>
      <button
  type="button"
  className={styles.reportButton}
  onClick={onOpenReport}
>
  <span>View Report</span>
  <span aria-hidden="true">↗</span>
</button>

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