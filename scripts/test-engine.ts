import { evaluateState } from "../lib/rulesEngine";
import { defaultSettings } from "../lib/types";

const mockHistory = (base: number, periods: number) => Array(periods).fill(base);

const scenarios = [
  {
    name: "Aggressive Buy Zone (Hostile Macro)",
    data: { goldPrice: 4600, dxy: 105, realYield: 2.5 }, // Gold in aggressive, but macro bad
    expectedState: "DO NOT BUY" // DXY/Yield new highs (macro hostile) but composite score might still be low
  },
  {
    name: "Aggressive Buy Zone (Stabilizing Macro)",
    data: { goldPrice: 4600, dxy: 100, realYield: 2.0 },
    goldHistory: mockHistory(4650, 10),
    dxyHistory: [101, 101, 101, 100.5, 100.2],
    yieldHistory: [2.1, 2.1, 2.05, 2.02, 2.0],
    expectedState: "AGGRESSIVE ADD"
  },
  {
    name: "Starter Buy Zone (Flat Macro)",
    data: { goldPrice: 4700, dxy: 100, realYield: 2.0 },
    goldHistory: mockHistory(4750, 10),
    dxyHistory: mockHistory(100, 10),
    yieldHistory: mockHistory(2.0, 10),
    expectedState: "STARTER BUY"
  },
  {
    name: "Overbought / Hostile",
    data: { goldPrice: 5100, dxy: 103, realYield: 2.5 },
    goldHistory: mockHistory(5000, 10),
    dxyHistory: [100, 101, 102, 102.5, 102.8],
    yieldHistory: [2.0, 2.1, 2.3, 2.4, 2.45],
    expectedState: "DO NOT BUY"
  }
];

function runTests() {
  console.log("--- Aurum Spring Rules Engine Verification ---\n");
  
  scenarios.forEach(s => {
    const result = evaluateState(
      { ...s.data, timestamp: "" },
      s.goldHistory || mockHistory(s.data.goldPrice, 10),
      s.dxyHistory || mockHistory(s.data.dxy, 10),
      s.yieldHistory || mockHistory(s.data.realYield, 10),
      defaultSettings
    );
    
    console.log(`Scenario: ${s.name}`);
    console.log(`Result: ${result.state} | Score: ${result.compositeScore.toFixed(1)}`);
    console.log(`Phase: ${result.marketPhase} | USD: ${result.usdPressure} | Yield: ${result.realYieldPressure}`);
    console.log(`Action: ${result.action}`);
    console.log(`Scores: Gold ${result.scores.gold}, DXY ${result.scores.dxy}, Yield ${result.scores.realYield}`);
    console.log("-----------------------------------\n");
  });
}

runTests();
