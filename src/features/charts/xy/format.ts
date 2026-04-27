
export function formatTickLabel(value: number) {
  if (Number.isInteger(value)) {
    return String(value);
  }
  return value.toFixed(1);
}

