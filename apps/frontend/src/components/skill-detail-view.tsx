import React, { useState } from 'react';
import {
  ExternalLink,
  Terminal,
  Copy,
  Check,
  Bookmark,
  GitCompare,
  RefreshCw,
  Star,
  GitFork,
  Eye,
  AlertCircle,
  FileCode2,
  Shield,
  CheckCircle2,
  Sparkles,
  ArrowLeft,
  History,
  Layers,
} from 'lucide-react';
import { SkillRecord } from '@/lib/api-client';
import { EvidenceBadge, RankingBadge, SecurityBadge } from './ui/badges';

interface SkillDetailViewProps {
  skill: SkillRecord;
  onBack: () => void;
  onToggleSave: (skill: SkillRecord) => void;
  onToggleCompare: (skill: SkillRecord) => void;
  onReanalyze: (skillId: string, customMarkdown?: string) => Promise<void>;
  onSelectRelated: (skill: SkillRecord) => void;
  isSelectedForCompare?: boolean;
  isReanalyzing?: boolean;
}

export function SkillDetailView({
  skill,
  onBack,
  onToggleSave,
  onToggleCompare,
  onReanalyze,
  onSelectRelated,
  isSelectedForCompare = false,
  isReanalyzing = false,
}: SkillDetailViewProps) {
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'manifest' | 'security' | 'changelog'>('overview');
  const [editableMarkdown, setEditableMarkdown] = useState(skill.skillMdContent);

  const handleCopyCommand = () => {
    navigator.clipboard.writeText(skill.installCommand);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const scoreMetrics = [
    {
      label: 'Technical Capability (25%)',
      value: skill.scoreBreakdown.technicalCapability,
      color: 'bg-purple-500',
    },
    {
      label: 'Innovation & Complexity (20%)',
      value: skill.scoreBreakdown.innovationAndComplexity,
      color: 'bg-indigo-500',
    },
    {
      label: 'Community Adoption (15%)',
      value: skill.scoreBreakdown.communityAdoption,
      color: 'bg-blue-500',
    },
    {
      label: 'Maintenance & Updates (15%)',
      value: skill.scoreBreakdown.maintenanceAndUpdates,
      color: 'bg-cyan-500',
    },
    {
      label: 'Documentation Quality (10%)',
      value: skill.scoreBreakdown.documentationQuality,
      color: 'bg-teal-500',
    },
    {
      label: 'Security & Reliability (15%)',
      value: skill.scoreBreakdown.securityAndReliability,
      color: skill.securityStatus === 'SAFE' ? 'bg-emerald-500' : 'bg-rose-500',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Top Navigation & Action Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-2 rounded-lg border border-slate-800 bg-slate-900/80 px-3.5 py-2 text-xs font-medium text-slate-300 hover:border-slate-700 hover:text-white transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Skill Radar
        </button>

        <div className="flex flex-wrap items-center gap-2.5">
          <a
            href={skill.repository.htmlUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-700/80 bg-slate-900/80 px-3.5 py-2 text-xs font-medium text-slate-200 hover:border-purple-500/50 transition-colors"
          >
            <ExternalLink className="h-3.5 w-3.5" />
            Open Repository
          </a>

          <button
            type="button"
            onClick={() => onToggleCompare(skill)}
            className={`inline-flex items-center gap-1.5 rounded-lg border px-3.5 py-2 text-xs font-medium transition-colors ${
              isSelectedForCompare
                ? 'border-blue-500/60 bg-blue-500/20 text-blue-200'
                : 'border-slate-700/80 bg-slate-900/80 text-slate-200 hover:border-blue-500/40'
            }`}
          >
            <GitCompare className="h-3.5 w-3.5" />
            {isSelectedForCompare ? 'In Comparison Tray' : 'Compare Skill'}
          </button>

          <button
            type="button"
            onClick={() => onToggleSave(skill)}
            className={`inline-flex items-center gap-1.5 rounded-lg border px-3.5 py-2 text-xs font-medium transition-colors ${
              skill.isSaved
                ? 'border-purple-500/60 bg-purple-500/20 text-purple-200'
                : 'border-slate-700/80 bg-slate-900/80 text-slate-200 hover:border-purple-500/40'
            }`}
          >
            <Bookmark className={`h-3.5 w-3.5 ${skill.isSaved ? 'fill-purple-400' : ''}`} />
            {skill.isSaved ? 'Saved' : 'Save Skill'}
          </button>

          <button
            type="button"
            disabled={isReanalyzing}
            onClick={() => onReanalyze(skill.id, editableMarkdown)}
            className="inline-flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-purple-600 to-blue-600 px-4 py-2 text-xs font-semibold text-white shadow-sm hover:from-purple-500 hover:to-blue-500 disabled:opacity-50 transition-all"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isReanalyzing ? 'animate-spin' : ''}`} />
            {isReanalyzing ? 'Analyzing...' : 'Reanalyze Skill'}
          </button>
        </div>
      </div>

      {/* Header Overview Card */}
      <div className="glass-panel rounded-2xl p-6">
        <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-start">
          <div className="space-y-3 max-w-3xl">
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-md bg-purple-500/15 border border-purple-500/30 px-2.5 py-0.5 text-xs font-medium text-purple-300">
                {skill.category.name}
              </span>
              <RankingBadge tier={skill.rankingTier} />
              <SecurityBadge status={skill.securityStatus} />
              <span className="font-mono text-xs text-slate-400">
                v{skill.currentVersion} • {skill.manifestPath}
              </span>
            </div>

            <h1 className="text-2xl font-bold tracking-tight text-white">{skill.name}</h1>
            <p className="text-sm leading-relaxed text-slate-300">{skill.description}</p>

            {/* Repository telemetry row */}
            <div className="flex flex-wrap items-center gap-4 pt-1 text-xs text-slate-400">
              <span className="font-mono text-slate-200">{skill.repository.fullName}</span>
              <span className="inline-flex items-center gap-1 text-amber-300">
                <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                {skill.repository.stars.toLocaleString()} stars
              </span>
              <span className="inline-flex items-center gap-1">
                <GitFork className="h-3.5 w-3.5" />
                {skill.repository.forks.toLocaleString()} forks
              </span>
              <span className="inline-flex items-center gap-1">
                <Eye className="h-3.5 w-3.5" />
                {skill.repository.watchers.toLocaleString()} watchers
              </span>
              <span className="inline-flex items-center gap-1">
                <AlertCircle className="h-3.5 w-3.5" />
                {skill.repository.openIssues} open issues
              </span>
              <span>Language: {skill.repository.language}</span>
              <span>License: {skill.repository.license}</span>
            </div>
          </div>

          {/* Score Box */}
          <div className="flex shrink-0 flex-col items-center justify-center rounded-xl border border-purple-500/30 bg-slate-950/80 px-6 py-4 text-center">
            <span className="text-xs uppercase tracking-wider text-slate-400">
              Skill Intelligence Score
            </span>
            <div className="mt-1 flex items-baseline gap-1">
              <span className="text-4xl font-extrabold text-purple-300">
                {skill.overallScore}
              </span>
              <span className="text-sm text-slate-400">/100</span>
            </div>
            <span className="mt-1 text-xs text-slate-400">
              Engine: {skill.llmProviderUsed}
            </span>
          </div>
        </div>

        {/* Verified Installation Box */}
        <div className="mt-6 rounded-xl border border-slate-800 bg-slate-950/90 p-4">
          <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Terminal className="h-4 w-4 text-purple-400" />
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-300">
                Verified Installation Command ({skill.installMethod})
              </span>
              <EvidenceBadge type="VERIFIED_EVIDENCE" />
            </div>
            <span className="text-xs text-slate-400">
              Source: <code>{skill.installSourceDoc}</code>
            </span>
          </div>
          <div className="flex items-center justify-between gap-3 rounded-lg border border-slate-800/90 bg-slate-900/90 px-4 py-2.5">
            <code className="font-mono text-sm text-purple-200">{skill.installCommand}</code>
            <button
              type="button"
              onClick={handleCopyCommand}
              className="inline-flex items-center gap-1.5 rounded-md bg-purple-600/20 border border-purple-500/40 px-3 py-1.5 text-xs font-medium text-purple-200 hover:bg-purple-600/30 transition-colors"
            >
              {copied ? (
                <>
                  <Check className="h-3.5 w-3.5 text-emerald-400" />
                  Copied Command
                </>
              ) : (
                <>
                  <Copy className="h-3.5 w-3.5" />
                  Copy Command
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Sub-navigation Tabs */}
      <div className="flex border-b border-slate-800 gap-2">
        {[
          { id: 'overview', label: 'AI Intelligence & Evidence Breakdown', icon: Sparkles },
          { id: 'manifest', label: 'SKILL.md Preview & Sandbox', icon: FileCode2 },
          {
            id: 'security',
            label: `Security Analysis (${skill.securityFindings.length})`,
            icon: Shield,
          },
          { id: 'changelog', label: `Versions & Changelog (${skill.versions.length})`, icon: History },
        ].map((tab) => {
          const Icon = tab.icon;
          const active = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id as any)}
              className={`inline-flex items-center gap-2 border-b-2 px-4 py-3 text-xs font-semibold transition-colors ${
                active
                  ? 'border-purple-500 text-purple-300'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <Icon className="h-4 w-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* TAB 1: OVERVIEW */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Left 2 Columns: Capabilities, Verified Evidence vs AI Inference */}
          <div className="space-y-6 lg:col-span-2">
            {/* Technical Summary */}
            <div className="glass-panel rounded-xl p-5 space-y-3">
              <h3 className="text-sm font-semibold text-white">Executive Technical Summary</h3>
              <p className="text-xs leading-relaxed text-slate-300">{skill.technicalSummary}</p>
            </div>

            {/* Verified Evidence vs AI Inference Dual Columns */}
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="glass-panel rounded-xl p-5 border-l-2 border-l-cyan-500">
                <div className="mb-3 flex items-center justify-between">
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-cyan-300 flex items-center gap-1.5">
                    <CheckCircle2 className="h-4 w-4" />
                    Verified Repository Evidence
                  </h4>
                  <EvidenceBadge type="VERIFIED_EVIDENCE" />
                </div>
                <ul className="space-y-2.5 text-xs text-slate-300">
                  {skill.verifiedEvidence.map((item, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="mt-1 h-1.5 w-1.5 rounded-full bg-cyan-400 shrink-0" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="glass-panel rounded-xl p-5 border-l-2 border-l-purple-500">
                <div className="mb-3 flex items-center justify-between">
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-purple-300 flex items-center gap-1.5">
                    <Sparkles className="h-4 w-4" />
                    AI Architectural Inference
                  </h4>
                  <EvidenceBadge type="AI_INFERENCE" />
                </div>
                <ul className="space-y-2.5 text-xs text-slate-300">
                  {skill.aiInferredAnalysis.map((item, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="mt-1 h-1.5 w-1.5 rounded-full bg-purple-400 shrink-0" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Main Capabilities */}
            <div className="glass-panel rounded-xl p-5 space-y-3">
              <h3 className="text-sm font-semibold text-white">Main Technical Capabilities</h3>
              <div className="space-y-2.5">
                {skill.capabilities.map((cap, idx) => (
                  <div
                    key={idx}
                    className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-slate-800/80 bg-slate-900/50 px-3.5 py-2.5"
                  >
                    <span className="text-xs text-slate-200">{cap.statement}</span>
                    <div className="flex items-center gap-2">
                      {cap.sourceRef && (
                        <code className="text-[10px] text-slate-400">{cap.sourceRef}</code>
                      )}
                      <EvidenceBadge type={cap.evidenceType} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Strengths & Weaknesses */}
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="glass-panel rounded-xl p-5 space-y-3">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-emerald-300">
                  Key Strengths
                </h4>
                <div className="space-y-2.5">
                  {skill.strengths.map((st, idx) => (
                    <div key={idx} className="rounded-lg bg-slate-900/60 p-3 space-y-1.5">
                      <p className="text-xs text-slate-200">{st.statement}</p>
                      <EvidenceBadge type={st.evidenceType} />
                    </div>
                  ))}
                </div>
              </div>

              <div className="glass-panel rounded-xl p-5 space-y-3">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-amber-300">
                  Limitations & Caveats
                </h4>
                <div className="space-y-2.5">
                  {skill.weaknesses.map((wk, idx) => (
                    <div key={idx} className="rounded-lg bg-slate-900/60 p-3 space-y-1.5">
                      <p className="text-xs text-slate-200">{wk.statement}</p>
                      <EvidenceBadge type={wk.evidenceType} />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Weighted Score Breakdown, Supported Agents, Dependencies */}
          <div className="space-y-6">
            <div className="glass-panel rounded-xl p-5 space-y-4">
              <h3 className="text-sm font-semibold text-white">
                Weighted Score Breakdown (0–100)
              </h3>
              <div className="space-y-3.5">
                {scoreMetrics.map((m) => (
                  <div key={m.label} className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-300">{m.label}</span>
                      <span className="font-mono font-semibold text-white">{m.value}/100</span>
                    </div>
                    <div className="h-2 w-full overflow-hidden rounded-full bg-slate-800">
                      <div
                        className={`h-full rounded-full ${m.color}`}
                        style={{ width: `${m.value}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="glass-panel rounded-xl p-5 space-y-3">
              <h3 className="text-sm font-semibold text-white">Supported Agent Platforms</h3>
              <div className="flex flex-wrap gap-2">
                {skill.supportedAgents.map((agent) => (
                  <span
                    key={agent}
                    className="rounded-lg border border-blue-500/30 bg-blue-500/10 px-3 py-1 text-xs font-medium text-blue-300"
                  >
                    {agent}
                  </span>
                ))}
              </div>
            </div>

            <div className="glass-panel rounded-xl p-5 space-y-3">
              <h3 className="text-sm font-semibold text-white">Detected Dependencies</h3>
              <div className="flex flex-wrap gap-1.5">
                {skill.dependencies.map((dep) => (
                  <code
                    key={dep}
                    className="rounded border border-slate-700 bg-slate-900 px-2.5 py-1 font-mono text-xs text-slate-300"
                  >
                    {dep}
                  </code>
                ))}
              </div>
            </div>

            <div className="glass-panel rounded-xl p-5 space-y-3">
              <h3 className="text-sm font-semibold text-white">Recommended Use Cases</h3>
              <ul className="space-y-2 text-xs text-slate-300">
                {skill.useCases.map((uc, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <Layers className="h-3.5 w-3.5 text-purple-400 shrink-0 mt-0.5" />
                    <span>{uc}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: SKILL.MD PREVIEW & LIVE RE-ANALYZER */}
      {activeTab === 'manifest' && (
        <div className="glass-panel rounded-xl p-5 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <h3 className="text-sm font-semibold text-white">
                SKILL.md Manifest Inspector ({skill.manifestPath})
              </h3>
              <p className="text-xs text-slate-400">
                Inspect raw skill instructions or edit below to test live AI Intelligence & Static Security re-analysis.
              </p>
            </div>
            <button
              type="button"
              disabled={isReanalyzing}
              onClick={() => onReanalyze(skill.id, editableMarkdown)}
              className="inline-flex items-center gap-1.5 rounded-lg bg-purple-600 px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-purple-500 disabled:opacity-50"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${isReanalyzing ? 'animate-spin' : ''}`} />
              Run Analyzer on Manifest
            </button>
          </div>
          <textarea
            value={editableMarkdown}
            onChange={(e) => setEditableMarkdown(e.target.value)}
            rows={18}
            className="w-full rounded-xl border border-slate-800 bg-slate-950 p-4 font-mono text-xs leading-relaxed text-slate-200 focus:border-purple-500 focus:outline-none"
          />
        </div>
      )}

      {/* TAB 3: SECURITY ANALYSIS */}
      {activeTab === 'security' && (
        <div className="glass-panel rounded-xl p-5 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-4">
            <div>
              <h3 className="text-sm font-semibold text-white">
                Zero-Execution Static Security Audit
              </h3>
              <p className="text-xs text-slate-400">
                Repository content and SKILL.md instructions are treated as untrusted data and never executed automatically.
              </p>
            </div>
            <SecurityBadge status={skill.securityStatus} />
          </div>

          {skill.securityFindings.length === 0 ? (
            <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-6 text-center space-y-2">
              <p className="text-sm font-semibold text-emerald-300">
                No Static Security Violations Detected
              </p>
              <p className="text-xs text-slate-300">
                Passed all 9 static inspection rules (shell pipes, credential harvesting, hardcoded API keys, destructive FS, unauthorized network, obfuscated payloads, prompt injection, and binary executables).
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {skill.securityFindings.map((finding) => (
                <div
                  key={finding.id}
                  className="rounded-xl border border-rose-500/30 bg-rose-950/20 p-4 space-y-2"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="rounded bg-rose-500/20 px-2 py-0.5 font-mono text-xs font-bold text-rose-300">
                        {finding.severity} • {finding.ruleId}
                      </span>
                      <span className="text-xs font-semibold text-white">{finding.title}</span>
                    </div>
                    <EvidenceBadge type={finding.evidenceType} />
                  </div>
                  <p className="text-xs text-slate-300">{finding.description}</p>
                  {finding.snippet && (
                    <div className="rounded-lg bg-slate-950 p-2.5 font-mono text-xs text-rose-200 border border-rose-500/20">
                      Line {finding.lineNumber || 1}: <code>{finding.snippet}</code>
                    </div>
                  )}
                  <p className="text-xs text-emerald-300">
                    <strong>Remediation:</strong> {finding.remediation}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 4: CHANGELOG & VERSIONS */}
      {activeTab === 'changelog' && (
        <div className="glass-panel rounded-xl p-5 space-y-4">
          <h3 className="text-sm font-semibold text-white">Version History & Manifest Checksums</h3>
          <div className="space-y-3">
            {skill.versions.map((ver) => (
              <div
                key={ver.id}
                className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-slate-800 bg-slate-900/60 p-4"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-sm font-bold text-purple-300">
                      v{ver.version}
                    </span>
                    <code className="rounded bg-slate-800 px-2 py-0.5 text-xs text-slate-300">
                      commit {ver.commitSha}
                    </code>
                    <code className="text-[11px] text-slate-400">
                      sha256:{ver.contentHash}
                    </code>
                  </div>
                  <p className="text-xs text-slate-300">{ver.changelog}</p>
                </div>
                <span className="text-xs text-slate-400">
                  {new Date(ver.releasedAt).toLocaleDateString()}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Related Skills */}
      {skill.relatedSkills && skill.relatedSkills.length > 0 && (
        <div className="space-y-3 pt-2">
          <h3 className="text-sm font-semibold text-white">Related Compatible Skills</h3>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
            {skill.relatedSkills.map((rel) => (
              <div
                key={rel.id}
                onClick={() => onSelectRelated(rel)}
                className="glass-panel glass-panel-hover cursor-pointer rounded-xl p-4 space-y-2"
              >
                <div className="flex items-center justify-between">
                  <RankingBadge tier={rel.rankingTier} />
                  <span className="font-mono text-xs font-bold text-purple-300">
                    {rel.overallScore}/100
                  </span>
                </div>
                <h4 className="text-xs font-semibold text-white">{rel.name}</h4>
                <p className="line-clamp-2 text-[11px] text-slate-400">{rel.description}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
