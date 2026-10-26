import { useEffect, useRef } from "react";
import type { CompanyRaw } from "../data/companyTypes";
import { CompanyReport } from "./CompanyReport";
import styles from "./ReportModal.module.css";

interface ReportModalProps {
  company: CompanyRaw | null;
  onClose: () => void;
}

export function ReportModal({
  company,
  onClose,
}: ReportModalProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (company && !dialog.open) {
      dialog.showModal();
    } else if (!company && dialog.open) {
      dialog.close();
    }
  }, [company]);

  return (
    <dialog
      ref={dialogRef}
      className={styles.dialog}
      onClose={onClose}
      aria-label="Company report"
    >
      <div className={styles.toolbar}>
        <span>{company?.company} — Business Intelligence Report</span>

        <button
          type="button"
          onClick={onClose}
          className={styles.closeButton}
          aria-label="Close report"
        >
          ✕
        </button>
      </div>

      <div className={styles.content}>
        {company && <CompanyReport company={company} />}
      </div>
    </dialog>
  );
}