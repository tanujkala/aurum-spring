"use client";

import type { EvaluationResult } from "@/lib/types";

interface RuleBreakdownProps {
  evaluation: EvaluationResult;
}

export function RuleBreakdown({ evaluation }: RuleBreakdownProps) {
  const { scores, compositeScore, zoneSource, drawdownPct, currentGoldZone } = evaluation;

  const contributions = [
    { 
      label: "Gold Price Alignment (40%)", 
      score: scores.gold, 
      weight: 0.4,
      subText: `${currentGoldZone} (${zoneSource} Mode)`
    },
    { 
      label: "Real Yield Trend (30%)", 
      score: scores.realYield, 
      weight: 0.3,
      subText: "10Y Treasury Inflation Protected"
    },
    { 
      label: "DXY Multi-Day Trend (30%)", 
      score: scores.dxy, 
      weight: 0.3,
      subText: "Broad Dollar Basket Strength"
    },
  ];

  return (
    <div className={`rules-card mode-${zoneSource.toLowerCase()}`}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
        <h3 style={{ margin: 0 }}>Macro Score Contribution</h3>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "0.2rem" }}>
          {zoneSource === "AUTO" && (
            <>
              <div style={{ fontSize: "0.7rem", color: "var(--text-muted)", background: "rgba(255,255,255,0.05)", padding: "0.1rem 0.4rem", borderRadius: "4px" }}>
                  Recent High: ${evaluation.recentHigh.toFixed(0)}
              </div>
              <div style={{ fontSize: "0.7rem", color: "var(--text-muted)", background: "rgba(255,255,255,0.05)", padding: "0.1rem 0.4rem", borderRadius: "4px" }}>
                  Drawdown: {drawdownPct.toFixed(1)}%
              </div>
            </>
          )}
          {zoneSource === "MANUAL" && (
            <div style={{ fontSize: "0.6rem", fontWeight: 700, color: "#fbbf24", background: "rgba(245, 158, 11, 0.1)", padding: "0.1rem 0.4rem", borderRadius: "4px", border: "1px solid rgba(245, 158, 11, 0.2)" }}>
              MANUAL OVERRIDE ACTIVE
            </div>
          )}
        </div>
      </div>
      
      {contributions.map((item, idx) => (
        <div key={idx} className="rule-item" style={{ alignItems: "flex-start", marginBottom: "1rem" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.15rem" }}>
            <span className="rule-label" style={{ fontSize: "0.85rem" }}>{item.label}</span>
            <span style={{ fontSize: "0.65rem", color: "var(--text-muted)" }}>
              {item.subText}
            </span>
          </div>
          <div style={{ textAlign: "right" }}>
             <span className="rule-pass" style={{ color: item.score >= 60 ? "var(--accent-green)" : "var(--gold-dim)", fontWeight: 700 }}>
              +{(item.score * item.weight).toFixed(1)}
            </span>
             <div style={{ fontSize: "0.6rem", color: "rgba(255,255,255,0.2)" }}>RAW: {item.score.toFixed(0)}</div>
          </div>
        </div>
      ))}
      
      {/* Zone Boundaries */}
      <div className="zone-boundaries" style={{ marginTop: "1rem", padding: "0.75rem", background: "rgba(0,0,0,0.2)", borderRadius: "8px", fontSize: "0.7rem" }}>
        <div style={{ color: "var(--text-muted)", marginBottom: "0.4rem", textTransform: "uppercase", letterSpacing: "0.05em", fontSize: "0.6rem" }}>
          {zoneSource === "AUTO" ? "Dynamic Gold Zones" : "Manual Price Thresholds"}
        </div>
        <div className="gold-zone-details" style={{ padding: 0, background: "transparent", border: "none", marginTop: 0 }}>
          {zoneSource === "AUTO" ? (
            <>
              <div>Early Support:</div> <div style={{ textAlign: "right", color: "var(--gold-dim)" }}>${evaluation.dynamicZones.earlySupport[1].toFixed(0)} – ${evaluation.dynamicZones.earlySupport[0].toFixed(0)}</div>
              <div>Starter Buy:</div> <div style={{ textAlign: "right", color: "var(--gold-dim)" }}>${evaluation.dynamicZones.starterBuy[1].toFixed(0)} – ${evaluation.dynamicZones.starterBuy[0].toFixed(0)}</div>
              <div>Aggressive Add:</div> <div style={{ textAlign: "right", color: "var(--gold-dim)" }}>${evaluation.dynamicZones.aggressiveAdd[1].toFixed(0)} – ${evaluation.dynamicZones.aggressiveAdd[0].toFixed(0)}</div>
              <div>Panic Threshold:</div> <div style={{ textAlign: "right", color: "rgba(239, 68, 68, 0.8)" }}>&lt; ${evaluation.dynamicZones.panicThreshold.toFixed(0)}</div>
            </>
          ) : (
            <>
              <div>Starter Buy:</div> <div style={{ textAlign: "right", color: "#fbbf24" }}>${evaluation.adjustedConfig?.starterLower} – ${evaluation.adjustedConfig?.starterUpper}</div>
              <div>Aggressive Add:</div> <div style={{ textAlign: "right", color: "#fbbf24" }}>${evaluation.adjustedConfig?.aggressiveLower} – ${evaluation.adjustedConfig?.aggressiveUpper}</div>
              <div>Extended Abv:</div> <div style={{ textAlign: "right", color: "var(--text-muted)" }}>&gt; ${evaluation.adjustedConfig?.starterUpper}</div>
              <div>Panic Below:</div> <div style={{ textAlign: "right", color: "rgba(239, 68, 68, 0.8)" }}>&lt; ${evaluation.adjustedConfig?.aggressiveLower}</div>
            </>
          )}
        </div>
      </div>

      <div className="rule-item" style={{ marginTop: "1rem", paddingTop: "1rem", borderTop: "1px solid var(--surface-hover)" }}>
        <span className="rule-label" style={{ fontWeight: 700, color: "var(--text-primary)" }}>Total Composite Score</span>
        <span style={{ fontWeight: 700, fontSize: "1.25rem", color: "var(--gold-color)" }}>
          {compositeScore.toFixed(1)}
        </span>
      </div>
    </div>
  );
}

