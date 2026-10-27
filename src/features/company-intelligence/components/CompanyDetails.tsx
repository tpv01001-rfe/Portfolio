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
  <span>Visa rapport</span>
  <span aria-hidden="true">↗</span>
</button>

      <h2>{data.company}</h2>



      <p>{data.summary}</p>

      <dl>
        <dt>Sektor</dt>
        <dd>{data.sector}</dd>

        <dt>Industri</dt>
        <dd>{data.industry}</dd>

        <dt>Stad</dt>
        <dd>{data.city}</dd>

        <dt>Organisationsnummer</dt>
        <dd>{data.organization_number}</dd>

        <dt>Antal anställda</dt>
        <dd>{data.employees ?? "Okänd"}</dd>
      </dl>
    </section>
  );
}