import type {
  CompanyId,
  CompanyIndexEntry,
} from "../data/companyTypes";

import styles from "./CompanyList.module.css";

interface CompanyListProps {
  companies: CompanyIndexEntry[];
  selectedCompanyId: CompanyId | null;
  onSelectCompany: (id: CompanyId) => void;
}

export function CompanyList({
  companies,
  selectedCompanyId,
  onSelectCompany,
}: CompanyListProps) {
  
  return (
    <section className={styles.container}>
      <h2 className={styles.heading}>Företag</h2>

      {companies.length === 0 ? (
        <p className={styles.empty}>Inga matchande företag.</p>
      ) : (
        <ul className={styles.list}>
          {companies.map((company) => (
            <li key={company.id}>
              <button
                type="button"
                className={`${styles.companyButton} ${
                  selectedCompanyId === company.id
                    ? styles.selected
                    : ""
                }`}
                onClick={() => onSelectCompany(company.id)}
                aria-pressed={selectedCompanyId === company.id}
              >
                <span className={styles.companyInfo}>
                  <span className={styles.companyName}>
                    {company.name}
                  </span>

                  <span
                    className={styles.companySector}
                    title={company.sector}
                  >
                    {company.sector}
                  </span>
                </span>

                <span className={styles.chevron} aria-hidden="true">
                  ›
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}