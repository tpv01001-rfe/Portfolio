import type { CompanyRaw } from "../data/companyTypes";

import {
  calculateFinancialSustainability,
  calculateCommercialTraction,
  calculateOperationalScalability,
} from "./reportCalculations";

import styles from "./CompanyReport.module.css";

interface CompanyReportProps {
  company: CompanyRaw;
}

function display(value: string | number | null | undefined) {
  return value == null || value === ""
    ? "Not Available"
    : String(value);
}

function displayList(items?: string[] | null): string {
  return items?.length
    ? items.join(", ")
    : "Not Available";
}

function ReportList({
  items,
}: {
  items?: string[] | null;
}) {
  if (!items?.length) {
    return <p>Not Available</p>;
  }

  return (
    <ul>
      {items.map((item, index) => (
        <li key={`${index}-${item}`}>{item}</li>
      ))}
    </ul>
  );
}

function ScoreCard({
  title,
  score,
  description,
}: {
  title: string;
  score: number | null | undefined;
  description: string;
}) {
  const validScore =
    score == null || !Number.isFinite(score)
      ? null
      : Math.min(100, Math.max(0, score));

  return (
    <section className={styles.card}>
      <h2>{title}</h2>

      {validScore === null ? (
        <p>Not Available</p>
      ) : (
        <>
          <div className={styles.scoreNumber}>
            {validScore}
          </div>

          <p>{description}</p>

          <div className={styles.scoreBar}>
            <div
              className={styles.scoreFill}
              style={{ width: `${validScore}%` }}
            />
          </div>
        </>
      )}
    </section>
  );
}

export function CompanyReport({
  company,
}: CompanyReportProps) {
  const financialScore =
    calculateFinancialSustainability(company);

  const commercialScore =
    calculateCommercialTraction(company);

  const scalabilityScore =
    calculateOperationalScalability(company);

  const address = [
    company.street,
    `${company.postal_code} ${company.city}`,
    company.country,
  ];

  return (
    <article className={styles.report}>
      <header className={styles.header}>
        <h1>{company.company}</h1>

        <p>{company.industry}</p>

        <div className={styles.meta}>
          <span>{company.country}</span>
          <span>{company.city}</span>
          <span>{company.organization_type}</span>
          <span>{company.organization_number}</span>
        </div>
      </header>

      <div className={styles.content}>
        <section className={styles.kpiGrid}>
          <div className={styles.kpi}>
            <strong>{display(company.employees)}</strong>
            <span>Employees</span>
          </div>

          <div className={styles.kpi}>
            <strong>{display(company.revenue_estimate)}</strong>
            <span>Revenue</span>
          </div>

          <div className={styles.kpi}>
            <strong>{display(company.growth_signal)}</strong>
            <span>Growth Signal</span>
          </div>

          <div className={styles.kpi}>
            <strong>{display(company.profitability_signal)}</strong>
            <span>Profitability</span>
          </div>
        </section>

        <section className={styles.card}>
          <h2>Executive Summary</h2>
          <p>{display(company.summary)}</p>
        </section>

        <section className={styles.card}>
          <h2>Market Profile</h2>
          <p><strong>Sector:</strong> {company.sector}</p>
          <p><strong>Industry:</strong> {company.industry}</p>
          <p>
            <strong>Target Market:</strong>{" "}
            {display(company.target_market)}
          </p>
        </section>

        <section className={styles.card}>
          <h2>Strategic Positioning</h2>
          <p>{display(company.strategy_notes)}</p>
        </section>

        <section className={styles.card}>
          <h2>Technology Profile</h2>
          <p>{display(company.technology_notes)}</p>
        </section>

        <section className={styles.card}>
          <h2>Partnership Network</h2>
          {/* <p>{company.partners.length
            ? company.partners.join(", ")
            : "Not Available"}</p> */}

            <p>{displayList(company.partners)}</p>
          <p>
            <strong>Partnership Signal:</strong>{" "}
            {display(company.partnership_signal)}
          </p>
        </section>

        <section className={styles.card}>
          <h2>Customer Segments</h2>
          {/* <p>{company.customer_segments.length
            ? company.customer_segments.join(", ")
            : "Not Available"}</p> */}

            <p>{displayList(company.customer_segments)}</p>
        </section>

        <section className={styles.card}>
          <h2>Notable Clients</h2>
          {/* <p>{company.notable_clients?.length
            ? company.notable_clients.join(", ")
            : "Not Available"}</p> */}
            <p>{displayList(company.notable_clients)}</p>
        </section>

        <section className={styles.card}>
          <h2>Business Signals</h2>
          <p>
            <strong>Growth Outlook:</strong>{" "}
            {display(company.growth_signal)}
          </p>
          <p>
            <strong>Profitability Status:</strong>{" "}
            {display(company.profitability_signal)}
          </p>
          <p>
            <strong>Organization Type:</strong>{" "}
            {company.organization_type}
          </p>
        </section>

        <section className={styles.card}>
          <h2>Mergers & Acquisitions</h2>
          <p>
            <strong>Acquired:</strong>{" "}
            {company.has_been_acquired ? "Yes" : "No"}
          </p>
          <p>
            <strong>Acquired By:</strong>{" "}
            {display(company.acquired_by)}
          </p>
          {/* <p>
            <strong>Acquisitions Made:</strong>{" "}
            {company.acquisitions_made?.length
              ? company.acquisitions_made.join(", ")
              : "Not Available"}
          </p> */}
          <p>
  <strong>Acquisitions Made:</strong>{" "}
  {displayList(company.acquisitions_made)}
</p>
          <p>
            <strong>Merger Activity:</strong>{" "}
            {display(company.merger_activity)}
          </p>
        </section>

        <section className={styles.card}>
          <h2>Digital Presence</h2>

          {company.website ? (
            <a
              href={company.website}
              target="_blank"
              rel="noopener noreferrer"
            >
              {company.website}
            </a>
          ) : (
            <p>Not Available</p>
          )}

          <address>
            {address.map((line) => (
              <div key={line}>{line}</div>
            ))}
          </address>
        </section>

        <section className={styles.swotGrid}>
          <div className={`${styles.swotCard} ${styles.strength}`}>
            <h3>Strengths</h3>
            <ReportList items={company.strengths} />
          </div>

          <div className={`${styles.swotCard} ${styles.weakness}`}>
            <h3>Weaknesses</h3>
            <ReportList items={company.weaknesses} />
          </div>

          <div className={`${styles.swotCard} ${styles.opportunity}`}>
            <h3>Opportunities</h3>
            <ReportList items={company.opportunities} />
          </div>

          <div className={`${styles.swotCard} ${styles.threat}`}>
            <h3>Threats</h3>
            <ReportList items={company.threats} />
          </div>
        </section>

        <section className={styles.scores}>
          <ScoreCard
            title="AI Business Score"
            score={company.business_score}
            description="Overall Business Attractiveness"
          />

          <ScoreCard
            title="Financial Sustainability"
            score={financialScore}
            description="Overall Financial Sustainability"
          />

          <ScoreCard
            title="Commercial Traction"
            score={commercialScore}
            description="Overall Commercial Traction"
          />

          <ScoreCard
            title="Operational Scalability"
            score={scalabilityScore}
            description="Operational Scalability Indicator"
          />
        </section>

        <section className={styles.card}>
          <h2>AI Executive Assessment</h2>
          <p>{display(company.ai_assessment)}</p>
        </section>

        <section className={styles.card}>
          <h2>Risk Assessment</h2>
          <p>{display(company.risk_notes)}</p>
        </section>

        <section className={styles.card}>
          <h2>Data Sources</h2>
          <ul>
            <li>Company website</li>
            <li>Public company information</li>
            <li>Commercial databases</li>
            <li>AI-generated market analysis</li>
          </ul>
          <small>
            Source categories from the report template;
            individual sources have not been verified here.
          </small>
        </section>
      </div>

      <footer className={styles.footer}>
        Generated Business Intelligence Report
        <div>
          {company.company} · {company.organization_number}
        </div>
      </footer>
    </article>
  );
}