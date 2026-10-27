import type { CompanySector } from "../data/companyTypes";
import styles from "./CompanyFilters.module.css";

import { SelectControl } from "../../../shared/ui/controls/SelectControl";

interface CompanyFiltersProps {
    search: string;
    sector: CompanySector | "all";
    sectors: CompanySector[];
    onSearchChange: (value: string) => void;
    onSectorChange: (value: CompanySector | "all") => void;
}

export function CompanyFilters({
    search,
    sector,
    sectors,
    onSearchChange,
    onSectorChange,
}: CompanyFiltersProps) {
    return (
        <div className={styles.filters}>
            <div className={styles.field}>
                <label
                    htmlFor="company-search"
                    className={styles.label}
                >
                    Sök företag
                </label>

                <input
                    id="company-search"
                    className={styles.control}
                    type="search"
                    value={search}
                    placeholder="Företagsnamn eller stad..."
                    onChange={(event) =>
                        onSearchChange(event.target.value)
                    }
                />
            </div>

            <div className={styles.field}>

                <SelectControl
                    label="Sektor"
                    value={sector}
                    options={[
                        { value: "all", label: "Alla sektorer" },
                        ...sectors.map((item) => ({
                            value: item,
                            label: item,
                        })),
                    ]}
                    onChange={onSectorChange}
                    placement="auto"
                />

            </div>
        </div>
    );
}