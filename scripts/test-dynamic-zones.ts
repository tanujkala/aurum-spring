import { evaluateState } from "../lib/rulesEngine";
import { defaultSettings } from "../lib/types";
import type { MarketData } from "../lib/types";

const mockGoldHistory = [5100, 5120, 5150, 5130, 5110, 5090, 5100, 5120, 5140, 5150]; // High is 5150
const mockDxyHistory = [100, 100.1, 100.2, 100.1, 100.0];
const mockYieldHistory = [2.0, 2.1, 2.2, 2.1, 2.0];

const settings = { ...defaultSettings };

console.log("--- TEST 1: AUTO MODE - STARTER BUY ---");
// High: 5150. 10% drawdown = 4635. 
// Starter Buy (8-12%): 4738 to 4532
const currentData1: MarketData = {
  timestamp: new Date().toISOString(),
  goldPrice: 4600, // Inside Starter Buy (8-12% of 5150)
  dxy: 100,
  realYield: 2.0
};

const res1 = evaluateState(currentData1, mockGoldHistory, mockDxyHistory, mockYieldHistory, settings);
console.log("Zone:", res1.currentGoldZone);
console.log("Score:", res1.compositeScore);
console.log("Recent High:", res1.recentHigh);
console.log("Drawdown %:", res1.drawdownPct.toFixed(2));
console.log("Dynamic Zones:", res1.dynamicZones);

console.log("\n--- TEST 2: AUTO MODE - AGGRESSIVE ADD ---");
const currentData2: MarketData = {
  timestamp: new Date().toISOString(),
  goldPrice: 4300, // Inside Aggressive Add (12-18% of 5150)
  dxy: 100,
  realYield: 2.0
};
const res2 = evaluateState(currentData2, mockGoldHistory, mockDxyHistory, mockYieldHistory, settings);
console.log("Zone:", res2.currentGoldZone);
console.log("State:", res2.state);

console.log("\n--- TEST 3: MANUAL MODE ---");
const manualSettings = { ...settings, goldZoneMode: "Manual" as const, goldStarterLower: 4680, goldStarterUpper: 4725 };
const currentData3: MarketData = {
  timestamp: new Date().toISOString(),
  goldPrice: 4700, // Inside Manual Starter Buy
  dxy: 100,
  realYield: 2.0
};
const res3 = evaluateState(currentData3, mockGoldHistory, mockDxyHistory, mockYieldHistory, manualSettings);
console.log("Zone:", res3.currentGoldZone);
console.log("State:", res3.state);

console.log("\n--- TEST 4: RISK FLOOR ---");
const currentData4: MarketData = {
  timestamp: new Date().toISOString(),
  goldPrice: 3500, // Below Risk Floor (4000)
  dxy: 100,
  realYield: 2.0
};
const res4 = evaluateState(currentData4, mockGoldHistory, mockDxyHistory, mockYieldHistory, settings);
console.log("State (expected DO NOT BUY):", res4.state);
console.log("Action:", res4.action);
