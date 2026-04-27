import type { ChangeEvent, CSSProperties } from "react";
import { useId } from "react";

type SliderControlProps = {
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  onChange: (value: number) => void;
  description?: string;
  unit?: string;
  formatValue?: (value: number) => string;
};

export default function SliderControl({
  label,
  value,
  min,
  max,
  step = 1,
  onChange,
  description,
  unit,
  formatValue,
}: SliderControlProps) {
  const inputId = useId();

  const formatDisplay = (inputValue: number) => {
    if (formatValue) return formatValue(inputValue);
    if (unit) return `${inputValue}${unit}`;
    return String(inputValue);
  };

  const displayValue = formatDisplay(value);
  const minLabel = formatDisplay(min);
  const maxLabel = formatDisplay(max);

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    onChange(Number(event.target.value));
  };


   const rawProgress =
   max === min ? 0 : ((value - min) / (max - min)) * 100;

 const progress = Math.min(100, Math.max(0, rawProgress));


    const sliderStyle = {
      "--slider-progress": `${progress}%`,
    } as CSSProperties; 

  return (
    <div className="slider-control">
      <div className="slider-control__header">
        <div className="slider-control__label-group">
          <label className="slider-control__label" htmlFor={inputId}>
            {label}
          </label>

          {description && (
            <p className="slider-control__description">{description}</p>
          )}
        </div>

        <output
          className="slider-control__value"
          htmlFor={inputId}
          aria-live="polite"
        >
          {displayValue}
        </output>
      </div>

      <input
        id={inputId}
        className="slider-control__input"
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={handleChange}
        style={sliderStyle}
      />

      <div className="slider-control__range" aria-hidden="true">
        <span>{minLabel}</span>
        <span>{maxLabel}</span>
      </div>
    </div>
  );
}