import { NextResponse } from "next/server";

// ─── API Keys (server-side only, never exposed to browser) ────────────────────
const GOLDAPI_KEY = process.env.GOLDAPI_KEY || "";
const FRED_API_KEY = process.env.FRED_API_KEY || "";
const TWELVEDATA_KEY = process.env.TWELVEDATA_KEY || "";

// ─── In-memory cache (protects TwelveData's 8 credit/min free tier) ───────────
interface CachedData {
  goldPrice: number;
  dxy: number;
  realYield: number;
  timestamp: string;
  live: { gold: boolean; dxy: boolean; yield: boolean };
}

let cache: CachedData | null = null;
let cacheTime = 0;
const CACHE_TTL_MS = 60_000; // 60 seconds

// ─── Fetchers ─────────────────────────────────────────────────────────────────

async function fetchGold(): Promise<number> {
  const res = await fetch("https://www.goldapi.io/api/XAU/USD", {
    headers: { "x-access-token": GOLDAPI_KEY },
    next: { revalidate: 0 },
  });
  if (!res.ok) throw new Error(`GoldAPI HTTP ${res.status}`);
  const json = await res.json();
  if (typeof json.price !== "number") throw new Error("GoldAPI: no price field");
  return Math.round(json.price * 100) / 100;
}

async function fetchYieldHistory(): Promise<number[]> {
  const url = [
    "https://api.stlouisfed.org/fred/series/observations",
    `?series_id=DFII10`,
    `&api_key=${FRED_API_KEY}`,
    `&file_type=json`,
    `&sort_order=desc`,
    `&limit=30`,
  ].join("");

  const res = await fetch(url, { next: { revalidate: 0 } });
  if (!res.ok) throw new Error(`FRED HTTP ${res.status}`);
  const json = await res.json();
  const values = json.observations
    ?.filter((o: { value: string }) => o.value !== ".")
    .map((o: { value: string }) => Math.round(parseFloat(o.value) * 100) / 100)
    .reverse(); // Back to chronological order
  
  if (!values || values.length === 0) throw new Error("FRED: no valid observations");
  return values;
}

async function fetchTwelveDataHistory(symbol: string, outputsize: number = 90): Promise<number[]> {
  const url = `https://api.twelvedata.com/time_series?symbol=${symbol}&interval=1day&outputsize=${outputsize}&apikey=${TWELVEDATA_KEY}`;
  const res = await fetch(url, { next: { revalidate: 0 } });
  if (!res.ok) throw new Error(`TwelveData History HTTP ${res.status}`);
  const json = await res.json();

  if (json.code && json.status === "error") throw new Error(json.message);
  if (!json.values) throw new Error(`TwelveData: no historical values for ${symbol}`);

  return json.values
    .map((v: { close: string }) => Math.round(parseFloat(v.close) * 100) / 100)
    .reverse(); // Back to chronological order
}

// ─── Route Handler ────────────────────────────────────────────────────────────

export async function GET() {
  const now = Date.now();

  // Return cached data if fresh (optional: history might be bigger, but CACHE_TTL is short)
  if (cache && now - cacheTime < CACHE_TTL_MS) {
    return NextResponse.json({ ...cache, cached: true });
  }

  // Fetch everything in parallel
  const [
    goldSpotResult,
    yieldHistResult,
    goldHistResult,
    dxyHistResult
  ] = await Promise.allSettled([
    fetchGold(),
    fetchYieldHistory(),
    fetchTwelveDataHistory("XAU/USD", 90),
    fetchTwelveDataHistory("DXY", 90),
  ]);

  const goldPrice = goldSpotResult.status === "fulfilled" ? goldSpotResult.value : cache?.goldPrice ?? 4671.8;
  const yieldHistory = yieldHistResult.status === "fulfilled" ? yieldHistResult.value : (cache as any)?.yieldHistory ?? [2.0];
  const goldHistory = goldHistResult.status === "fulfilled" ? goldHistResult.value : (cache as any)?.goldHistory ?? [4671.8];
  const dxyHistory = dxyHistResult.status === "fulfilled" ? dxyHistResult.value : (cache as any)?.dxyHistory ?? [100.0];

  const latestYield = yieldHistory[yieldHistory.length - 1];
  const latestDxy = dxyHistory[dxyHistory.length - 1];

  const data = {
    goldPrice,
    dxy: latestDxy,
    realYield: latestYield,
    goldHistory,
    dxyHistory,
    yieldHistory,
    timestamp: new Date().toISOString(),
    live: {
      gold: goldSpotResult.status === "fulfilled",
      dxy: dxyHistResult.status === "fulfilled",
      yield: yieldHistResult.status === "fulfilled",
    },
  };

  // Update cache
  cache = data as any;
  cacheTime = now;

  return NextResponse.json({ ...data, cached: false });
}
