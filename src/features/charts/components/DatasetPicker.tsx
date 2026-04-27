import { useEffect, useRef, useState } from "react";
import type { XYDataset } from "../xy/types";

type DatasetPickerProps = {
  datasets: XYDataset[];
  value: string;
  onChange: (id: string) => void;
  label?: string;
};

export default function DatasetPicker({
  datasets,
  value,
  onChange,
  label = "Dataset",
}: DatasetPickerProps) {

  const [open, setOpen] = useState(false);

  const active = datasets.find((d) => d.id === value);

  const ref = useRef<HTMLDivElement | null>(null);

useEffect(() => {
  function handleClickOutside(event: MouseEvent) {
    if (ref.current && !ref.current.contains(event.target as Node)) {
      setOpen(false);
    }
  }

  document.addEventListener("mousedown", handleClickOutside);
  return () => {
    document.removeEventListener("mousedown", handleClickOutside);
  };
}, []);

  return (
    <div ref={ref} className="dataset-picker">

      <button
        type="button"
        className="dataset-picker__button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-haspopup="listbox"
      >
        <span>{active?.label ?? "Select dataset"}</span>
        <span className="dataset-picker__chevron">
          {open ? "▴" : "▾"}
        </span>
      </button>

      {open && (
        <div className="dataset-picker__menu" role="listbox">
          {datasets.map((dataset) => (
            <button
              key={dataset.id}
              type="button"
              className={[
                "dataset-picker__item",
                dataset.id === value
                  ? "dataset-picker__item--active"
                  : "",
              ]
                .filter(Boolean)
                .join(" ")}
              onClick={() => {
                onChange(dataset.id);
                setOpen(false);
              }}
            >
              {dataset.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}