import YahooFinance from "yahoo-finance2";
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type QuoteBase = any;

const yahooFinance = new YahooFinance();

export interface QuoteData {
  symbol: string;
  shortName: string;
  longName: string;
  regularMarketPrice: number;
  regularMarketChange: number;
  regularMarketChangePercent: number;
  regularMarketVolume: number;
  regularMarketDayHigh: number;
  regularMarketDayLow: number;
  marketCap: number;
  postMarketPrice?: number;
  postMarketChange?: number;
  postMarketChangePercent?: number;
  preMarketPrice?: number;
  preMarketChange?: number;
  preMarketChangePercent?: number;
  marketState: string;
  currency: string;
}

export interface ChartCandle {
  time: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface NewsItem {
  title: string;
  link: string;
  publisher: string;
  publishedAt: number;
  thumbnail?: string;
  relatedTickers?: Array<{ symbol: string; changePercent: number }>;
}

export interface AnalysisData {
  recommendationKey: string;
  numberOfAnalystOpinions: number;
  targetLowPrice: number;
  targetMeanPrice: number;
  targetHighPrice: number;
  targetMedianPrice: number;
  strongBuy: number;
  buy: number;
  hold: number;
  underperform: number;
  sell: number;
  totalRatings: number;
}

function mapQuote(q: QuoteBase): QuoteData {
  return {
    symbol: q.symbol,
    shortName: q.shortName || q.symbol,
    longName: q.longName || q.shortName || q.symbol,
    regularMarketPrice: q.regularMarketPrice ?? 0,
    regularMarketChange: q.regularMarketChange ?? 0,
    regularMarketChangePercent: q.regularMarketChangePercent ?? 0,
    regularMarketVolume: q.regularMarketVolume ?? 0,
    regularMarketDayHigh: q.regularMarketDayHigh ?? 0,
    regularMarketDayLow: q.regularMarketDayLow ?? 0,
    marketCap: q.marketCap ?? 0,
    postMarketPrice: q.postMarketPrice,
    postMarketChange: q.postMarketChange,
    postMarketChangePercent: q.postMarketChangePercent,
    preMarketPrice: q.preMarketPrice,
    preMarketChange: q.preMarketChange,
    preMarketChangePercent: q.preMarketChangePercent,
    marketState: q.marketState ?? "REGULAR",
    currency: q.currency ?? "USD",
  };
}

export async function fetchQuote(symbol: string): Promise<QuoteData | null> {
  try {
    const q = await yahooFinance.quote(symbol, {}, { validateResult: false }) as QuoteBase;
    return mapQuote(q);
  } catch {
    return null;
  }
}

export async function fetchMultiQuote(symbols: string[]): Promise<QuoteData[]> {
  try {
    const results = await yahooFinance.quote(symbols, {}, { validateResult: false }) as QuoteBase[];
    const arr = Array.isArray(results) ? results : [results];
    return arr.map(mapQuote);
  } catch {
    return [];
  }
}

export async function fetchChart(
  symbol: string,
  range: string = "3mo",
): Promise<ChartCandle[]> {
  try {
    const now = new Date();
    const period1Map: Record<string, Date> = {
      "1d": new Date(now.getTime() - 24 * 60 * 60 * 1000),
      "5d": new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000),
      "1mo": new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000),
      "3mo": new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000),
      "6mo": new Date(now.getTime() - 180 * 24 * 60 * 60 * 1000),
      "1y": new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000),
      "2y": new Date(now.getTime() - 2 * 365 * 24 * 60 * 60 * 1000),
    };

    const intervalMap: Record<string, "5m" | "15m" | "1d" | "1wk"> = {
      "1d": "5m",
      "5d": "15m",
      "1mo": "1d",
      "3mo": "1d",
      "6mo": "1d",
      "1y": "1wk",
      "2y": "1wk",
    };

    const period1 = period1Map[range] || period1Map["3mo"];
    const interval = intervalMap[range] || "1d";

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const result = await yahooFinance.chart(symbol, { period1, interval } as any, { validateResult: false }) as any;
    const quotes: Array<{ date: Date; open: number | null; high: number | null; low: number | null; close: number | null; volume: number | null }> = result.quotes || [];
    return quotes
      .filter((q) => q.open != null && q.high != null && q.low != null && q.close != null)
      .map((q) => ({
        time: Math.floor(new Date(q.date).getTime() / 1000),
        open: q.open!,
        high: q.high!,
        low: q.low!,
        close: q.close!,
        volume: q.volume ?? 0,
      }));
  } catch {
    return [];
  }
}

export async function fetchNews(symbol: string): Promise<NewsItem[]> {
  try {
    const result = await yahooFinance.search(symbol, {
      newsCount: 15,
      quotesCount: 0,
    }, { validateResult: false }) as { news?: Array<{
      title: string;
      link: string;
      publisher: string;
      providerPublishTime?: Date;
      thumbnail?: { resolutions?: Array<{ url: string }> };
      relatedTickers?: string[];
    }> };

    return (result.news || []).map((n) => ({
      title: n.title,
      link: n.link,
      publisher: n.publisher,
      publishedAt: n.providerPublishTime
        ? new Date(n.providerPublishTime).getTime()
        : Date.now(),
      thumbnail: n.thumbnail?.resolutions?.[0]?.url,
      relatedTickers: n.relatedTickers?.map((t) => ({
        symbol: t,
        changePercent: 0,
      })),
    }));
  } catch {
    return [];
  }
}

export async function fetchAnalysis(symbol: string): Promise<AnalysisData | null> {
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const summary = await yahooFinance.quoteSummary(symbol, {
      modules: ["financialData", "recommendationTrend"],
    }, { validateResult: false }) as any;

    const fd = summary?.financialData;
    const trend = summary?.recommendationTrend?.trend?.[0];

    const strongBuy = trend?.strongBuy ?? 0;
    const buy = trend?.buy ?? 0;
    const hold = trend?.hold ?? 0;
    const underperform = trend?.underperform ?? 0;
    const sell = trend?.sell ?? 0;
    const totalRatings = strongBuy + buy + hold + underperform + sell || 1;

    return {
      recommendationKey: fd?.recommendationKey ?? "hold",
      numberOfAnalystOpinions: fd?.numberOfAnalystOpinions ?? 0,
      targetLowPrice: fd?.targetLowPrice ?? 0,
      targetMeanPrice: fd?.targetMeanPrice ?? 0,
      targetHighPrice: fd?.targetHighPrice ?? 0,
      targetMedianPrice: fd?.targetMedianPrice ?? 0,
      strongBuy,
      buy,
      hold,
      underperform,
      sell,
      totalRatings,
    };
  } catch {
    return null;
  }
}

// 100 major US stocks — tested safe (Yahoo Finance handles batch of 100 in ~1s)
export const MARKET_MOVERS_SYMBOLS = [
  // Mega-cap Tech
  "AAPL","MSFT","NVDA","GOOGL","GOOG","AMZN","META","TSLA","AVGO","ORCL",
  // Semiconductors
  "AMD","INTC","MU","QCOM","TXN","AMAT","LRCX","KLAC","MRVL","ASML",
  // Software/Cloud
  "CRM","NFLX","ADBE","NOW","PANW","CRWD","SNPS","CDNS","PLTR","DDOG",
  // Financials
  "JPM","BAC","WFC","GS","MS","V","MA","AXP","BLK","SCHW",
  // Healthcare/Pharma
  "LLY","UNH","JNJ","MRK","ABBV","PFE","AMGN","GILD","REGN","VRTX",
  // Consumer
  "WMT","COST","HD","TGT","NKE","SBUX","MCD","CMG","PG","KO",
  // Energy
  "XOM","CVX","COP","EOG","SLB","OXY","PSX","VLO","MPC","HAL",
  // Industrials/Auto
  "CAT","DE","BA","HON","GE","F","GM","UBER","UPS","FDX",
  // ETFs/Indices proxies
  "SPY","QQQ","IWM","GLD","TLT",
  // Other large caps
  "DIS","NFLX","T","VZ","TMUS","PYPL","SQ","COIN","RBLX","SNAP",
];

export const INDEX_SYMBOLS = ["^DJI", "^IXIC", "^GSPC"];
