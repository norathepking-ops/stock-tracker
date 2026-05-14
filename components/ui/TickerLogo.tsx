"use client";

import { useState } from "react";

const DOMAIN_MAP: Record<string, string> = {
  AAPL: "apple.com",
  MSFT: "microsoft.com",
  GOOGL: "google.com",
  GOOG: "google.com",
  AMZN: "amazon.com",
  META: "meta.com",
  TSLA: "tesla.com",
  NVDA: "nvidia.com",
  AVGO: "broadcom.com",
  ORCL: "oracle.com",
  AMD: "amd.com",
  INTC: "intel.com",
  MU: "micron.com",
  QCOM: "qualcomm.com",
  TXN: "ti.com",
  AMAT: "appliedmaterials.com",
  LRCX: "lamresearch.com",
  KLAC: "kla.com",
  MRVL: "marvell.com",
  CRM: "salesforce.com",
  NFLX: "netflix.com",
  ADBE: "adobe.com",
  NOW: "servicenow.com",
  PANW: "paloaltonetworks.com",
  CRWD: "crowdstrike.com",
  SNPS: "synopsys.com",
  CDNS: "cadence.com",
  PLTR: "palantir.com",
  DDOG: "datadoghq.com",
  JPM: "jpmorganchase.com",
  BAC: "bankofamerica.com",
  WFC: "wellsfargo.com",
  GS: "goldmansachs.com",
  MS: "morganstanley.com",
  V: "visa.com",
  MA: "mastercard.com",
  AXP: "americanexpress.com",
  BLK: "blackrock.com",
  SCHW: "schwab.com",
  LLY: "lilly.com",
  UNH: "unitedhealthgroup.com",
  JNJ: "jnj.com",
  MRK: "merck.com",
  ABBV: "abbvie.com",
  PFE: "pfizer.com",
  AMGN: "amgen.com",
  GILD: "gilead.com",
  REGN: "regeneron.com",
  VRTX: "vrtx.com",
  WMT: "walmart.com",
  COST: "costco.com",
  HD: "homedepot.com",
  TGT: "target.com",
  NKE: "nike.com",
  SBUX: "starbucks.com",
  MCD: "mcdonalds.com",
  CMG: "chipotle.com",
  PG: "pg.com",
  KO: "coca-cola.com",
  XOM: "exxonmobil.com",
  CVX: "chevron.com",
  COP: "conocophillips.com",
  CAT: "caterpillar.com",
  DE: "deere.com",
  BA: "boeing.com",
  HON: "honeywell.com",
  GE: "ge.com",
  F: "ford.com",
  GM: "gm.com",
  UBER: "uber.com",
  UPS: "ups.com",
  FDX: "fedex.com",
  DIS: "disney.com",
  T: "att.com",
  VZ: "verizon.com",
  TMUS: "t-mobile.com",
  PYPL: "paypal.com",
  SQ: "squareup.com",
  COIN: "coinbase.com",
  RBLX: "roblox.com",
  SNAP: "snap.com",
  NET: "cloudflare.com",
  SPOT: "spotify.com",
  SPY: "ssga.com",
  QQQ: "invesco.com",
  "BTC-USD": "bitcoin.org",
};

const FALLBACK_COLORS = [
  "#6c5ce7", "#00b894", "#0984e3", "#e17055", "#fd79a8",
  "#fdcb6e", "#55efc4", "#a29bfe", "#74b9ff", "#fab1a0",
];

function getColor(symbol: string) {
  let hash = 0;
  for (let i = 0; i < symbol.length; i++) {
    hash = symbol.charCodeAt(i) + ((hash << 5) - hash);
  }
  return FALLBACK_COLORS[Math.abs(hash) % FALLBACK_COLORS.length];
}

interface TickerLogoProps {
  symbol: string;
  size?: number;
}

export default function TickerLogo({ symbol, size = 34 }: TickerLogoProps) {
  const [imgFailed, setImgFailed] = useState(false);

  const clean = symbol.replace("^", "").toUpperCase();
  const isIndex = symbol.startsWith("^") || symbol.includes("=F");
  const domain = DOMAIN_MAP[clean];

  const label = clean.slice(0, 2);
  const bg = getColor(symbol);
  const fontSize = Math.round(size * 0.36);

  const circleStyle: React.CSSProperties = {
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
  };

  if (!isIndex && domain && !imgFailed) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={`https://logo.clearbit.com/${domain}`}
        alt={clean}
        width={size}
        height={size}
        style={{
          width: size,
          height: size,
          borderRadius: "50%",
          objectFit: "cover",
          flexShrink: 0,
          display: "block",
        }}
        onError={() => setImgFailed(true)}
      />
    );
  }

  return <div style={circleStyle}>{label}</div>;
}
