"use client";

import type { EvaluationResult } from "@/lib/types";

interface ActionCardProps {
  evaluation: EvaluationResult;
}

export function ActionCard({ evaluation }: ActionCardProps) {
  const { 
    state, 
    compositeScore, 
    action, 
    reason, 
    marketPhase, 
    usdPressure, 
    realYieldPressure, 
    suggestedAllocation,
    recentHigh,
    drawdownPct,
    currentGoldZone,
    dynamicZones,
    zoneSource
  } = evaluation;

  let stateColorClass = "text-wait";
  let bgColorClass = "bg-wait";

  if (state === "STARTER BUY") { stateColorClass = "text-starter"; bgColorClass = "bg-starter"; }
  else if (state === "ADD") { stateColorClass = "text-add"; bgColorClass = "bg-add"; }
  else if (state === "AGGRESSIVE ADD") { stateColorClass = "text-aggressive"; bgColorClass = "bg-aggressive"; }
  else if (state === "DO NOT BUY") { stateColorClass = "text-donotbuy"; bgColorClass = "bg-donotbuy"; }

  return (
    <div className="action-card">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div>
          <div className="metric-header" style={{ marginBottom: "0.5rem" }}>Current State</div>
          <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
            <div className={`status-indicator ${bgColorClass}`}>{state}</div>
            <div className="market-phase-badge">{marketPhase}</div>
          </div>
        </div>
        <div style={{ textAlign: "right" }}>
          <div className="metric-header">Composite Score</div>
          <div className={`metric-value ${stateColorClass}`}>{compositeScore.toFixed(0)}</div>
        </div>
      </div>

      <div className="confidence-bar-bg">
        <div className={`confidence-bar-fill ${bgColorClass}`} style={{ width: `${compositeScore}%` }}></div>
      </div>

      {/* NEW GOLD ZONE INFO SECTION */}
      <div className="gold-zone-details" style={{ 
        marginTop: "1.25rem", 
        padding: "1rem", 
        background: "rgba(255,184,0,0.03)", 
        borderRadius: "10px",
        border: "1px solid rgba(255,184,0,0.1)",
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gap: "1rem"
      }}>
        <div>
          <div className="metric-header" style={{ fontSize: "0.65rem", textTransform: "uppercase" }}>Recent High ({evaluation.zoneSource})</div>
          <div style={{ fontWeight: 700, fontSize: "1.1rem", color: "var(--gold-color)" }}>${recentHigh.toFixed(2)}</div>
          <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginTop: "0.25rem" }}>
            Drawdown: <span style={{ color: drawdownPct > 5 ? "var(--accent-red)" : "inherit", fontWeight: 600 }}>{drawdownPct.toFixed(1)}%</span>
          </div>
        </div>
        <div style={{ textAlign: "right" }}>
          <div className="metric-header" style={{ fontSize: "0.65rem", textTransform: "uppercase" }}>Current Gold Zone</div>
          <div style={{ fontWeight: 700, fontSize: "1rem" }}>{currentGoldZone}</div>
          <div style={{ fontSize: "0.65rem", color: "var(--text-muted)", marginTop: "0.25rem" }}>
             {zoneSource === "Auto" ? "Volatility Adjusted" : "Fixed Entry"}
          </div>
        </div>
        
        <div style={{ gridColumn: "span 2", paddingTop: "0.5rem", borderTop: "1px solid rgba(255,255,255,0.05)" }}>
           <div className="metric-header" style={{ fontSize: "0.6rem", marginBottom: "0.4rem" }}>Dynamic Zone Boundaries</div>
           <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.7rem", gap: "0.5rem" }}>
              <div className="zone-pill">Support: {dynamicZones.earlySupport[0]}–{dynamicZones.earlySupport[1]}</div>
              <div className="zone-pill">Starter: {dynamicZones.starterBuy[0]}–{dynamicZones.starterBuy[1]}</div>
              <div className="zone-pill">Aggressive: {dynamicZones.aggressiveAdd[0]}–{dynamicZones.aggressiveAdd[1]}</div>
           </div>
        </div>
      </div>

      <div className="action-text">{action}</div>
      
      <div className="suggested-allocation" style={{ 
        padding: "0.75rem", 
        background: "rgba(255,255,255,0.03)", 
        borderRadius: "8px",
        border: "1px solid var(--border-color)"
      }}>
        <div className="metric-header" style={{ fontSize: "0.7rem", marginBottom: "0.25rem" }}>Suggested Allocation Action</div>
        <div style={{ fontWeight: 600, color: "var(--gold-color)" }}>{suggestedAllocation}</div>
      </div>

      <div className="pressure-meters" style={{ display: "flex", gap: "1.5rem", marginTop: "0.5rem" }}>
        <div style={{ flex: 1 }}>
          <div className="metric-header" style={{ fontSize: "0.7rem", marginBottom: "0.5rem" }}>USD Pressure</div>
          <div style={{ height: "6px", background: "var(--surface-hover)", borderRadius: "3px", overflow: "hidden" }}>
             <div style={{ 
                height: "100%", 
                width: usdPressure === "High" ? "100%" : usdPressure === "Medium" ? "66%" : "33%",
                background: usdPressure === "High" ? "var(--accent-red)" : usdPressure === "Medium" ? "var(--gold-dim)" : "var(--accent-green)",
                transition: "width 0.3s ease"
             }} />
          </div>
          <div style={{ fontSize: "0.65rem", marginTop: "0.25rem", color: "var(--text-muted)", textAlign: "right" }}>{usdPressure}</div>
        </div>
        <div style={{ flex: 1 }}>
          <div className="metric-header" style={{ fontSize: "0.7rem", marginBottom: "0.5rem" }}>Real Yield Pressure</div>
          <div style={{ height: "6px", background: "var(--surface-hover)", borderRadius: "3px", overflow: "hidden" }}>
             <div style={{ 
                height: "100%", 
                width: realYieldPressure === "High" ? "100%" : realYieldPressure === "Medium" ? "66%" : "33%",
                background: realYieldPressure === "High" ? "var(--accent-red)" : realYieldPressure === "Medium" ? "var(--gold-dim)" : "var(--accent-green)",
                transition: "width 0.3s ease"
             }} />
          </div>
          <div style={{ fontSize: "0.65rem", marginTop: "0.25rem", color: "var(--text-muted)", textAlign: "right" }}>{realYieldPressure}</div>
        </div>
      </div>

      <div className="reason-text" style={{ marginTop: "0.5rem" }}>{reason}</div>

      <style jsx>{`
        .zone-pill {
          background: rgba(255,255,255,0.05);
          padding: 0.2rem 0.4rem;
          border-radius: 4px;
          border: 1px solid rgba(255,255,255,0.1);
          color: var(--text-muted);
          white-space: nowrap;
        }
      `}</style>
    </div>
  );
}

