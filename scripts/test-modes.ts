import { evaluateState } from "../lib/rulesEngine";
import { defaultSettings, ThresholdSettings } from "../lib/types";

const mockMarketData = {
  timestamp: "2026-03-19T11:14:41-04:00",
  goldPrice: 4700,
  dxy: 100,
  realYield: 2.0,
};

const goldHistory = [4800, 4850, 4900, 4880, 4820]; // High is 4900
const dxyHistory = [100.1, 100.2, 100.0, 99.9, 100.0];
const yieldHistory = [1.9, 1.95, 2.0, 2.05, 2.0];

const settingsAuto: ThresholdSettings = {
  ...defaultSettings,
  goldZoneMode: "AUTO",
  swingHighLookback: 60,
};

const settingsManual: ThresholdSettings = {
  ...defaultSettings,
  goldZoneMode: "MANUAL",
  goldStarterLower: 4680,
  goldStarterUpper: 4725,
  goldAggressiveLower: 4550,
  goldAggressiveUpper: 4625,
};

console.log("--- Testing AUTO Mode ---");
const resultAuto = evaluateState(mockMarketData, goldHistory, dxyHistory, yieldHistory, settingsAuto);
console.log(`Mode: ${resultAuto.zoneSource}`);
console.log(`Zone: ${resultAuto.currentGoldZone}`);
console.log(`Drawdown: ${resultAuto.drawdownPct.toFixed(2)}%`);

console.log("\n--- Testing MANUAL Mode (Starter Buy) ---");
const resultManualStarter = evaluateState(mockMarketData, goldHistory, dxyHistory, yieldHistory, settingsManual);
console.log(`Mode: ${resultManualStarter.zoneSource}`);
console.log(`Zone: ${resultManualStarter.currentGoldZone}`);
console.log(`Price: ${mockMarketData.goldPrice}`);

console.log("\n--- Testing MANUAL Mode (Aggressive Add) ---");
const resultManualAggressive = evaluateState({ ...mockMarketData, goldPrice: 4600 }, goldHistory, dxyHistory, yieldHistory, settingsManual);
console.log(`Mode: ${resultManualAggressive.zoneSource}`);
console.log(`Zone: ${resultManualAggressive.currentGoldZone}`);
console.log(`Price: 4600`);

console.log("\n--- Testing MANUAL Mode (Extended) ---");
const resultManualExtended = evaluateState({ ...mockMarketData, goldPrice: 4800 }, goldHistory, dxyHistory, yieldHistory, settingsManual);
console.log(`Mode: ${resultManualExtended.zoneSource}`);
console.log(`Zone: ${resultManualExtended.currentGoldZone}`);
console.log(`Price: 4800`);

console.log("\n--- Testing MANUAL Mode (Panic) ---");
const resultManualPanic = evaluateState({ ...mockMarketData, goldPrice: 4500 }, goldHistory, dxyHistory, yieldHistory, settingsManual);
console.log(`Mode: ${resultManualPanic.zoneSource}`);
console.log(`Zone: ${resultManualPanic.currentGoldZone}`);
console.log(`Price: 4500`);
