"use client";

import type { MarketData, ThresholdSettings } from "@/lib/types";

interface RuleBreakdownProps {
  current: MarketData;
  goldHistory: number[];
  dxyHistory: number[];
  yieldHistory: number[];
  settings: ThresholdSettings;
}

export function RuleBreakdown({ current, dxyHistory, yieldHistory, settings }: RuleBreakdownProps) {
  const { goldPrice, dxy, realYield } = current;

  const dxy5DayHigh = Math.max(...[...dxyHistory, dxy].slice(-5));
  const yield5DayHigh = Math.max(...[...yieldHistory, realYield].slice(-5));

  const rules = [
    { label: "Gold in Starter Buy zone?", passed: goldPrice >= settings.goldStarterLower && goldPrice <= settings.goldStarterUpper },
    { label: "DXY not making new 5-day high?", passed: dxy < dxy5DayHigh },
    { label: "Real yield not making new 5-day high?", passed: realYield < yield5DayHigh },
    { label: "Gold reclaiming confirmation level?", passed: goldPrice >= settings.goldReclaim },
    { label: "DXY rolling over (below weak threshold)?", passed: dxy < settings.dxyWeak },
    { label: "Panic flush (Aggressive Add) active?", passed: goldPrice >= settings.goldAggressiveLower && goldPrice <= settings.goldAggressiveUpper },
  ];

  return (
    <div className="rules-card">
      <h3>Rule Breakdown</h3>
      {rules.map((rule, idx) => (
        <div key={idx} className="rule-item">
          <span className="rule-label">{rule.label}</span>
          <span className={rule.passed ? "rule-pass" : "rule-fail"}>
            {rule.passed ? "PASS" : "FAIL"}
          </span>
        </div>
      ))}
    </div>
  );
}
