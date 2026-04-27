import SliderControl from "../../../../shared/ui/controls//SliderControl";

type CycloidControlsProps = {
  speed: number;
  onSpeedChange: (value: number) => void;
  radius: number;
  onRadiusChange: (value: number) => void;
};

export default function CycloidControls({
  speed,
  onSpeedChange,
  radius,
  onRadiusChange,
}: CycloidControlsProps) {
  return (
    <div className="controls-stack">
      <SliderControl
        label="Speed"
        min={0}
        max={2}
        step={0.1}
        value={speed}
        onChange={onSpeedChange}
      />

      <SliderControl
        label="Radius"
        min={10}
        max={100}
        step={1}
        value={radius}
        onChange={onRadiusChange}
      />
    </div>
  );
}