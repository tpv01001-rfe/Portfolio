type CheckboxControlProps = {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
};

export default function CheckboxControl({
  label,
  checked,
  onChange,
}: CheckboxControlProps) {
  return (
    <label className="checkbox-control">
      <input
        className="checkbox-control__input"
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
      />
      <span className="checkbox-control__label">{label}</span>
    </label>
  );
}