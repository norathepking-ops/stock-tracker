"use client";

const COLORS = [
  "#6c5ce7", "#00b894", "#0984e3", "#e17055", "#fd79a8",
  "#fdcb6e", "#55efc4", "#a29bfe", "#74b9ff", "#fab1a0",
];

function getColor(symbol: string) {
  let hash = 0;
  for (let i = 0; i < symbol.length; i++) {
    hash = symbol.charCodeAt(i) + ((hash << 5) - hash);
  }
  return COLORS[Math.abs(hash) % COLORS.length];
}

interface TickerLogoProps {
  symbol: string;
  size?: number;
}

export default function TickerLogo({ symbol, size = 44 }: TickerLogoProps) {
  const label = symbol.replace("^", "").slice(0, 2).toUpperCase();
  const bg = getColor(symbol);
  const fontSize = size * 0.36;

  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: "50%",
        background: bg,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0,
        fontSize,
        fontWeight: 700,
        color: "#fff",
        letterSpacing: "-0.5px",
      }}
    >
      {label}
    </div>
  );
}
