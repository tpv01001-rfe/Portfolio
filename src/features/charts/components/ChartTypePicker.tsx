type ChartTypeOption<T extends string> = {
  id: T;
  label: string;
  description?: string;
};

type ChartTypePickerProps<T extends string> = {
  value: T;
  options: ChartTypeOption<T>[];
  onChange: (id: T) => void;
};

export default function ChartTypePicker<T extends string>({
  value,
  options,
  onChange,
}: ChartTypePickerProps<T>) {
  return (
    <div className="chart-type-picker" role="tablist" aria-label="Chart type">
      {options.map((option) => {
        const isActive = option.id === value;

        return (
          <button
            key={option.id}
            type="button"
            role="tab"
            aria-selected={isActive}
            className={[
              "chart-type-picker__item",
              isActive ? "chart-type-picker__item--active" : "",
            ]
              .filter(Boolean)
              .join(" ")}
            onClick={() => onChange(option.id)}
          >
            <span className="chart-type-picker__icon" aria-hidden="true">
              {option.id === "xy" ? "⌁" : "●"}
            </span>

            <span className="chart-type-picker__content">
              <span className="chart-type-picker__label">
                {option.label}
              </span>

              {option.description && (
                <span className="chart-type-picker__description">
                  {option.description}
                </span>
              )}
            </span>
          </button>
        );
      })}
    </div>
  );
}