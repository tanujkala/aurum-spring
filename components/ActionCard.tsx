"use client";

import type { EvaluationResult } from "@/lib/types";

interface ActionCardProps {
  evaluation: EvaluationResult;
}

export function ActionCard({ evaluation }: ActionCardProps) {
  const { state, confidence, action, reason } = evaluation;

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
          <div className={`status-indicator ${bgColorClass}`}>{state}</div>
        </div>
        <div style={{ textAlign: "right" }}>
          <div className="metric-header">Confidence</div>
          <div className={`metric-value ${stateColorClass}`}>{confidence}</div>
        </div>
      </div>

      <div className="confidence-bar-bg">
        <div className={`confidence-bar-fill ${bgColorClass}`} style={{ width: `${confidence}%` }}></div>
      </div>

      <div className="action-text">{action}</div>
      <div className="reason-text">{reason}</div>
    </div>
  );
}
