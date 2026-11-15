import React, { useState } from 'react';
import {
  Star,
  GitFork,
  Clock,
  Bookmark,
  GitCompare,
  Terminal,
  Check,
  ExternalLink,
  ChevronRight,
} from 'lucide-react';
import { SkillRecord } from '@/lib/api-client';
import { RankingBadge, SecurityBadge } from './ui/badges';

interface SkillCardProps {
  skill: SkillRecord;
  onSelect: (skill: SkillRecord) => void;
  onToggleSave: (skill: SkillRecord) => void;
  onToggleCompare: (skill: SkillRecord) => void;
  isSelectedForCompare?: boolean;
}

export function SkillCard({
  skill,
  onSelect,
  onToggleSave,
  onToggleCompare,
  isSelectedForCompare = false,
}: SkillCardProps) {
  const [copied, setCopied] = useState(false);

  const handleCopyInstall = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(skill.installCommand);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };

  const formattedDate = new Date(skill.lastUpdatedAt).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <div
      onClick={() => onSelect(skill)}
      className="glass-panel glass-panel-hover group relative flex cursor-pointer flex-col justify-between rounded-xl p-5"
    >
      <div>
        {/* Top Row: Category + Ranking + Security */}
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          <span className="rounded-md bg-slate-800/80 px-2.5 py-0.5 text-xs font-medium text-slate-300 border border-slate-700/60">
            {skill.category?.name || 'Agent Skill'}
          </span>
          <div className="flex items-center gap-1.5">
            <SecurityBadge status={skill.securityStatus} />
            <RankingBadge tier={skill.rankingTier} />
          </div>
        </div>

        {/* Title & Repo */}
        <div className="mb-2 flex items-start justify-between gap-3">
          <div>
            <h3 className="text-base font-semibold text-slate-100 group-hover:text-purple-300 transition-colors">
              {skill.name}
            </h3>
            <div className="mt-0.5 flex items-center gap-2 text-xs text-slate-400">
              <span className="font-mono text-slate-300">{skill.repository.fullName}</span>
              <span>•</span>
              <span className="inline-flex items-center gap-1 text-amber-300/90">
                <Star className="h-3 w-3 fill-amber-400/80 text-amber-400" />
                {skill.repository.stars.toLocaleString()}
              </span>
              <span className="inline-flex items-center gap-1 text-slate-400">
                <GitFork className="h-3 w-3" />
                {skill.repository.forks.toLocaleString()}
              </span>
            </div>
          </div>

          {/* Intelligence Score Pill */}
          <div className="flex flex-col items-end">
            <div className="flex items-baseline gap-0.5 rounded-lg border border-purple-500/30 bg-purple-950/40 px-2.5 py-1">
              <span className="text-base font-bold text-purple-200">{skill.overallScore}</span>
              <span className="text-[10px] text-purple-400">/100</span>
            </div>
          </div>
        </div>

        {/* Description */}
        <p className="mb-4 line-clamp-2 text-xs leading-relaxed text-slate-300/90">
          {skill.description}
        </p>

        {/* Supported Agents */}
        <div className="mb-4 flex flex-wrap items-center gap-1.5">
          {skill.supportedAgents.slice(0, 3).map((agent) => (
            <span
              key={agent}
              className="rounded bg-blue-500/10 border border-blue-500/20 px-2 py-0.5 text-[11px] text-blue-300"
            >
              {agent}
            </span>
          ))}
          {skill.supportedAgents.length > 3 && (
            <span className="text-[11px] text-slate-400">
              +{skill.supportedAgents.length - 3} more
            </span>
          )}
        </div>
      </div>

      {/* Bottom Install & Actions Bar */}
      <div className="border-t border-slate-800/80 pt-3">
        <div className="mb-2.5 flex items-center justify-between gap-2 rounded-lg bg-slate-950/70 px-2.5 py-1.5 border border-slate-800/80">
          <div className="flex items-center gap-1.5 overflow-hidden">
            <Terminal className="h-3.5 w-3.5 shrink-0 text-purple-400" />
            <code className="truncate font-mono text-[11px] text-slate-300">
              {skill.installCommand}
            </code>
          </div>
          <button
            type="button"
            onClick={handleCopyInstall}
            className="shrink-0 rounded px-1.5 py-0.5 text-[11px] font-medium text-slate-300 hover:bg-slate-800 hover:text-white transition-colors"
            title="Copy verified installation command"
          >
            {copied ? (
              <span className="inline-flex items-center gap-1 text-emerald-400">
                <Check className="h-3 w-3" /> Copied
              </span>
            ) : (
              'Copy'
            )}
          </button>
        </div>

        <div className="flex items-center justify-between text-xs text-slate-400">
          <span className="inline-flex items-center gap-1">
            <Clock className="h-3 w-3" />
            Updated {formattedDate}
          </span>

          <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
            <button
              type="button"
              onClick={() => onToggleCompare(skill)}
              className={`inline-flex items-center gap-1 rounded-md border px-2 py-1 text-xs font-medium transition-colors ${
                isSelectedForCompare
                  ? 'border-blue-500/60 bg-blue-500/20 text-blue-200'
                  : 'border-slate-700/70 bg-slate-900/60 text-slate-300 hover:border-slate-600'
              }`}
              title="Add to skill comparison"
            >
              <GitCompare className="h-3.5 w-3.5" />
              {isSelectedForCompare ? 'Comparing' : 'Compare'}
            </button>

            <button
              type="button"
              onClick={() => onToggleSave(skill)}
              className={`inline-flex items-center gap-1 rounded-md border px-2 py-1 text-xs font-medium transition-colors ${
                skill.isSaved
                  ? 'border-purple-500/60 bg-purple-500/20 text-purple-200'
                  : 'border-slate-700/70 bg-slate-900/60 text-slate-300 hover:border-slate-600'
              }`}
              title="Save skill to workspace bookmarks"
            >
              <Bookmark className={`h-3.5 w-3.5 ${skill.isSaved ? 'fill-purple-400' : ''}`} />
              {skill.isSaved ? 'Saved' : 'Save'}
            </button>

            <button
              type="button"
              onClick={() => onSelect(skill)}
              className="inline-flex items-center gap-0.5 rounded-md bg-purple-600/20 border border-purple-500/40 px-2 py-1 text-xs font-medium text-purple-200 hover:bg-purple-600/30 transition-colors"
            >
              Inspect
              <ChevronRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
