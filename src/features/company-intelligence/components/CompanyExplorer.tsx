import { useEffect, useMemo, useState } from "react";

import styles from "./CompanyExplorer.module.css";

import { CompanyFilters } from "./CompanyFilters";
import type { CompanyId, CompanySector } from "../data/companyTypes";

import { CompanyList } from "./CompanyList";
import { CompanyDetails } from "./CompanyDetails";

import { getCompany, getCompanyIndex } from "../data/companyRepository";

import type { Company, CompanyIndexEntry } from "../data/companyTypes";
import { CompanyMap } from "../map/CompanyMap";

export function CompanyExplorer() {
  const [companies, setCompanies] = useState<CompanyIndexEntry[]>([]);
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);

  const [search, setSearch] = useState("");
  const [sector, setSector] = useState<CompanySector | "all">("all");

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const sectors = useMemo(() => {
    return [...new Set(companies.map((company) => company.sector))]
      .sort();
  }, [companies]);

  const filteredCompanies = useMemo(() => {
    const query = search.trim().toLocaleLowerCase("sv");

    return companies.filter((company) => {
      const matchesSearch =
        company.name.toLocaleLowerCase("sv").includes(query) ||
        company.city.toLocaleLowerCase("sv").includes(query);

      const matchesSector =
        sector === "all" || company.sector === sector;

      return matchesSearch && matchesSector;
    });
  }, [companies, search, sector]);

  useEffect(() => {
    async function loadCompanies() {
      try {
        const index = await getCompanyIndex();
        setCompanies(index);
      } catch (error) {
        setError(
          error instanceof Error
            ? error.message
            : "Failed to load companies"
        );
      } finally {
        setIsLoading(false);
      }
    }

    loadCompanies();
  }, []);



  const handleSelectCompany = async (id: CompanyId) => {
    if (selectedCompany?.id === id) {
      setSelectedCompany(null);
      return;
    }

    try {
      const company = await getCompany(id);
      setSelectedCompany(company);
    } catch (error) {
      console.error("Failed to load company:", error);
    }
  };

  if (isLoading) {
    return <p>Loading companies...</p>;
  }

  if (error && companies.length === 0) {
    return <p>{error}</p>;
  }


  return (
    <div className={styles.explorer}>
      <aside className={styles.sidebar}>
        <CompanyFilters
          search={search}
          sector={sector}
          sectors={sectors}
          onSearchChange={setSearch}
          onSectorChange={setSector}
        />

        <p className={styles.results}>
          Showing {filteredCompanies.length} of {companies.length} companies
        </p>

        <CompanyList
          companies={filteredCompanies}
          selectedCompanyId={selectedCompany?.id ?? null}
          onSelectCompany={handleSelectCompany}
        />
      </aside>

      <section className={styles.content}>
        <CompanyMap
          visibleCompanyIds={filteredCompanies.map((company) => company.id)}
          selectedCompanyId={selectedCompany?.id ?? null}
          onSelectCompany={handleSelectCompany}
        />

        {error && <p role="alert">{error}</p>}

        {selectedCompany ? (
          <CompanyDetails company={selectedCompany} />
        ) : (
          <div className={styles.emptyState}>
            <p>Select a company to explore its profile.</p>
          </div>
        )}
      </section>


    </div>
  );
}