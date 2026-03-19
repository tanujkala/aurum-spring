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

async function fetchYield(): Promise<number> {
  const url = [
    "https://api.stlouisfed.org/fred/series/observations",
    `?series_id=DFII10`,
    `&api_key=${FRED_API_KEY}`,
    `&file_type=json`,
    `&sort_order=desc`,
    `&limit=10`,
  ].join("");

  const res = await fetch(url, { next: { revalidate: 0 } });
  if (!res.ok) throw new Error(`FRED HTTP ${res.status}`);
  const json = await res.json();
  const latest = json.observations?.find(
    (o: { value: string }) => o.value !== "."
  );
  if (!latest) throw new Error("FRED: no valid observation");
  return Math.round(parseFloat(latest.value) * 100) / 100;
}

async function fetchDXY(): Promise<number> {
  const url = `https://api.twelvedata.com/price?symbol=EUR/USD,USD/JPY,GBP/USD,USD/CAD,USD/SEK,USD/CHF&apikey=${TWELVEDATA_KEY}`;
  const res = await fetch(url, { next: { revalidate: 0 } });
  if (!res.ok) throw new Error(`TwelveData HTTP ${res.status}`);
  const json = await res.json();

  if (json.code && json.status === "error") throw new Error(json.message);
  if (!json["EUR/USD"] || !json["USD/JPY"])
    throw new Error("TwelveData: missing FX data");

  const eurusd = parseFloat(json["EUR/USD"].price);
  const usdjpy = parseFloat(json["USD/JPY"].price);
  const gbpusd = parseFloat(json["GBP/USD"].price);
  const usdcad = parseFloat(json["USD/CAD"].price);
  const usdsek = parseFloat(json["USD/SEK"].price);
  const usdchf = parseFloat(json["USD/CHF"].price);

  // Official ICE DXY Formula
  const dxy =
    50.14348112 *
    Math.pow(eurusd, -0.576) *
    Math.pow(usdjpy, 0.136) *
    Math.pow(gbpusd, -0.119) *
    Math.pow(usdcad, 0.091) *
    Math.pow(usdsek, 0.042) *
    Math.pow(usdchf, 0.036);

  return Math.round(dxy * 1000) / 1000;
}

// ─── Route Handler ────────────────────────────────────────────────────────────

export async function GET() {
  const now = Date.now();

  // Return cached data if fresh
  if (cache && now - cacheTime < CACHE_TTL_MS) {
    return NextResponse.json({ ...cache, cached: true });
  }

  // Fetch all 3 in parallel
  const [goldResult, yieldResult, dxyResult] = await Promise.allSettled([
    fetchGold(),
    fetchYield(),
    fetchDXY(),
  ]);

  const goldPrice =
    goldResult.status === "fulfilled" ? goldResult.value : cache?.goldPrice ?? 4671.8;
  const realYield =
    yieldResult.status === "fulfilled" ? yieldResult.value : cache?.realYield ?? 2.0;
  const dxy =
    dxyResult.status === "fulfilled" ? dxyResult.value : cache?.dxy ?? 100.0;

  const data: CachedData = {
    goldPrice,
    dxy,
    realYield,
    timestamp: new Date().toISOString(),
    live: {
      gold: goldResult.status === "fulfilled",
      dxy: dxyResult.status === "fulfilled",
      yield: yieldResult.status === "fulfilled",
    },
  };

  // Update cache
  cache = data;
  cacheTime = now;

  return NextResponse.json({ ...data, cached: false });
}
