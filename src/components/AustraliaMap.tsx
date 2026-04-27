import { useState } from "react";

const STATES: { code: string; name: string; d: string; labelX: number; labelY: number }[] = [
  // Simplified geographic outlines (approximate, not survey-grade)
  {
    code: "WA",
    name: "Western Australia",
    d: "M 30 130 L 30 290 L 200 290 L 200 230 L 230 200 L 230 130 L 200 110 L 100 90 L 60 100 Z",
    labelX: 110, labelY: 200,
  },
  {
    code: "NT",
    name: "Northern Territory",
    d: "M 230 130 L 230 200 L 200 230 L 320 230 L 320 90 L 250 90 Z",
    labelX: 270, labelY: 160,
  },
  {
    code: "SA",
    name: "South Australia",
    d: "M 200 230 L 200 290 L 320 290 L 360 270 L 360 230 L 320 230 Z",
    labelX: 280, labelY: 265,
  },
  {
    code: "QLD",
    name: "Queensland",
    d: "M 320 90 L 320 230 L 460 230 L 480 170 L 470 100 L 420 80 Z",
    labelX: 400, labelY: 160,
  },
  {
    code: "NSW",
    name: "New South Wales",
    d: "M 320 230 L 360 230 L 360 270 L 460 270 L 480 250 L 460 230 Z",
    labelX: 410, labelY: 250,
  },
  {
    code: "VIC",
    name: "Victoria",
    d: "M 360 270 L 360 290 L 440 305 L 480 290 L 480 250 L 460 270 Z",
    labelX: 420, labelY: 285,
  },
  {
    code: "TAS",
    name: "Tasmania",
    d: "M 420 330 L 420 360 L 460 360 L 460 330 Z",
    labelX: 440, labelY: 348,
  },
  {
    code: "ACT",
    name: "Australian Capital Territory",
    d: "M 445 252 L 445 262 L 458 262 L 458 252 Z",
    labelX: 451, labelY: 258,
  },
];

interface Props {
  value?: string;
  onChange: (state: string) => void;
}

export const AustraliaMap = ({ value, onChange }: Props) => {
  const [hover, setHover] = useState<string | null>(null);
  const active = hover ?? value;
  const activeName = STATES.find(s => s.code === active)?.name;

  return (
    <div className="w-full">
      <div className="bg-secondary/40 rounded-lg p-3 border border-border">
        <svg
          viewBox="0 0 510 380"
          className="w-full h-auto max-h-[340px]"
          role="img"
          aria-label="Map of Australian states - click to select"
        >
          {STATES.map(s => (
            <g key={s.code}>
              <path
                d={s.d}
                className={`au-state-path ${value === s.code ? "selected" : ""}`}
                onClick={() => onChange(s.code)}
                onMouseEnter={() => setHover(s.code)}
                onMouseLeave={() => setHover(null)}
                aria-label={s.name}
              />
              <text
                x={s.labelX}
                y={s.labelY}
                textAnchor="middle"
                className="pointer-events-none select-none"
                fontSize={s.code === "ACT" ? "8" : "12"}
                fontWeight="600"
                fill={value === s.code ? "white" : "hsl(218 75% 18%)"}
              >
                {s.code}
              </text>
            </g>
          ))}
        </svg>
        <div className="text-center mt-2 text-sm">
          {active ? (
            <span className="font-medium text-primary">{activeName} ({active})</span>
          ) : (
            <span className="text-muted-foreground">Click a state on the map</span>
          )}
        </div>
      </div>
    </div>
  );
};
