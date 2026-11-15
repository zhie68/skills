import React from 'react';
import { ShieldCheck, ShieldAlert, AlertTriangle, CheckCircle2, Sparkles } from 'lucide-react';

export function RankingBadge({ tier }: { tier: 'S' | 'A' | 'B' | 'C' | 'D' | string }) {
  const styles: Record<string, string> = {
    S: 'bg-purple-500/20 text-purple-300 border-purple-500/40',
    A: 'bg-blue-500/20 text-blue-300 border-blue-500/40',
    B: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
    C: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
    D: 'bg-rose-500/20 text-rose-300 border-rose-500/40',
  };

  return (
    <span
      className={`inline-flex items-center justify-center rounded-md border px-2 py-0.5 text-xs font-semibold tracking-wide ${
        styles[tier] || styles.C
      }`}
    >
      Tier {tier}
    </span>
  );
}

export function SecurityBadge({
  status,
}: {
  status: 'SAFE' | 'REVIEW' | 'WARNING' | 'CRITICAL' | string;
}) {
  if (status === 'SAFE') {
    return (
      <span className="inline-flex items-center gap-1 rounded-md border border-emerald-500/30 bg-emerald-500/10 px-2 py-0.5 text-xs font-medium text-emerald-300">
        <ShieldCheck className="h-3.5 w-3.5" />
        Verified Safe
      </span>
    );
  }
  if (status === 'CRITICAL') {
    return (
      <span className="inline-flex items-center gap-1 rounded-md border border-rose-500/40 bg-rose-500/15 px-2 py-0.5 text-xs font-medium text-rose-300">
        <ShieldAlert className="h-3.5 w-3.5" />
        Critical Risk
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 rounded-md border border-amber-500/40 bg-amber-500/15 px-2 py-0.5 text-xs font-medium text-amber-300">
      <AlertTriangle className="h-3.5 w-3.5" />
      {status}
    </span>
  );
}

export function EvidenceBadge({
  type,
}: {
  type: 'VERIFIED_EVIDENCE' | 'AI_INFERENCE' | string;
}) {
  if (type === 'VERIFIED_EVIDENCE') {
    return (
      <span className="inline-flex items-center gap-1 rounded border border-cyan-500/30 bg-cyan-500/10 px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wider text-cyan-300">
        <CheckCircle2 className="h-3 w-3" />
        Verified Evidence
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 rounded border border-purple-500/30 bg-purple-500/10 px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wider text-purple-300">
      <Sparkles className="h-3 w-3" />
      AI Inference
    </span>
  );
}
