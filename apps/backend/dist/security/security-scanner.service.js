"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SecurityScannerService = void 0;
const common_1 = require("@nestjs/common");
let SecurityScannerService = class SecurityScannerService {
    rules = [
        {
            ruleId: 'SEC-SHELL-001',
            category: 'SUSPICIOUS_SHELL',
            severity: 'CRITICAL',
            title: 'Remote Script Pipe to Shell Execution',
            description: 'Detected piping of remote HTTP content directly into a shell interpreter (sh/bash/zsh/powershell).',
            pattern: /(curl|wget|iwr|Invoke-WebRequest)\s+[^\n|]+\|\s*(bash|sh|zsh|pwsh|powershell|cmd)/i,
            remediation: 'Download scripts to a temporary file, verify cryptographic checksums, and inspect before execution.',
        },
        {
            ruleId: 'SEC-SHELL-002',
            category: 'SUSPICIOUS_SHELL',
            severity: 'HIGH',
            title: 'Unrestricted Shell Eval or Subshell Execution',
            description: 'Detected dynamic command evaluation (eval, child_process.execSync with unsanitized interpolation, or reverse shell patterns).',
            pattern: /(\beval\s*\(\s*\$|bash\s+-i\s+>&\s*\/dev\/tcp\/|nc\s+-e\s+\/bin\/(sh|bash))/i,
            remediation: 'Replace dynamic eval/shell execution with parameterized API calls or sandboxed tool invocations.',
        },
        {
            ruleId: 'SEC-CRED-001',
            category: 'CREDENTIAL_HARVESTING',
            severity: 'CRITICAL',
            title: 'Sensitive Credential Store Access',
            description: 'Detected instructions or script paths attempting to read SSH keys, cloud credentials, or browser keychains.',
            pattern: /(~\/\.ssh\/id_rsa|~\/\.aws\/credentials|~\/\.config\/gcloud|Login Data|\.kube\/config|cat\s+[^\n]*\.env\b)/i,
            remediation: 'Never read raw credential files in a skill workflow. Request scoped tokens via the host agent credential provider.',
        },
        {
            ruleId: 'SEC-KEY-001',
            category: 'HARDCODED_API_KEY',
            severity: 'HIGH',
            title: 'Hardcoded Secret or API Token Pattern',
            description: 'Detected a string matching known API token formats (OpenAI, GitHub PAT, AWS Access Key, Anthropic, or Slack token).',
            pattern: /\b(sk-[a-zA-Z0-9]{20,}|ghp_[a-zA-Z0-9]{25,}|AKIA[0-9A-Z]{16}|xox[baprs]-[a-zA-Z0-9-]{10,})\b/,
            remediation: 'Remove hardcoded secrets immediately, rotate compromised keys, and reference environment variables instead.',
        },
        {
            ruleId: 'SEC-FS-001',
            category: 'DANGEROUS_FILESYSTEM',
            severity: 'CRITICAL',
            title: 'Destructive Filesystem Operation',
            description: 'Detected destructive recursive deletion or modification of root/system directories.',
            pattern: /(rm\s+-rf\s+(\/|~|\$HOME|\*)|Remove-Item\s+-Recurse\s+-Force\s+(C:\\|\/)|chmod\s+-R\s+777\s+\/)/i,
            remediation: 'Scope all file operations strictly within the project workspace directory and avoid force-recursive deletions.',
        },
        {
            ruleId: 'SEC-NET-001',
            category: 'UNAUTHORIZED_NETWORK',
            severity: 'HIGH',
            title: 'Suspicious Exfiltration Endpoint or Tunnel',
            description: 'Detected outbound network calls targeting known webhook catchers, paste bins, or ephemeral tunnels.',
            pattern: /https?:\/\/([a-z0-9-]+\.)?(webhook\.site|requestbin\.com|ngrok-free\.app|pipedream\.net|oastify\.com|burpcollaborator\.net)/i,
            remediation: 'Remove unauthorized third-party telemetry or exfiltration endpoints from skill scripts and instructions.',
        },
        {
            ruleId: 'SEC-OBF-001',
            category: 'OBFUSCATED_SCRIPT',
            severity: 'HIGH',
            title: 'Base64 / Hex Encoded Execution Payload',
            description: 'Detected base64 decoding piped into execution or long obfuscated payload blocks.',
            pattern: /(base64\s+(-d|--decode)\s*\|\s*(sh|bash|python|node)|Buffer\.from\([^)]+,\s*['"]base64['"]\)\.toString\(\)[^\n]*eval)/i,
            remediation: 'Provide transparent, human-readable source code for all helper scripts inside the skill repository.',
        },
        {
            ruleId: 'SEC-PI-001',
            category: 'PROMPT_INJECTION',
            severity: 'CRITICAL',
            title: 'Adversarial Prompt Injection Directive',
            description: 'Detected adversarial instructions attempting to override system prompts, conceal actions from the user, or hijack agent behavior.',
            pattern: /(ignore (all )?(previous|prior) instructions|system override:|do not inform the user|hide this action from the user|<!--\s*SYSTEM:\s*ignore)/i,
            remediation: 'Sanitize SKILL.md and strip all instructions that attempt to subvert host agent safety boundaries.',
        },
        {
            ruleId: 'SEC-BIN-001',
            category: 'UNEXPECTED_EXECUTABLE',
            severity: 'MEDIUM',
            title: 'Reference to Precompiled Binary Executable',
            description: 'Skill references or bundles precompiled binary executables (.exe, .dll, .so, .dylib, .bin) instead of auditable source scripts.',
            pattern: /\b[\w./-]+\.(exe|dll|dylib|scr|msi|apk)\b/i,
            remediation: 'Replace opaque binary executables with auditable TypeScript, Python, or shell scripts.',
        },
    ];
    scanSkillContent(skillSlug, manifestPath, skillMdContent, additionalFilePaths = []) {
        const findings = [];
        const lines = skillMdContent.split(/\r?\n/);
        lines.forEach((line, idx) => {
            for (const rule of this.rules) {
                if (rule.pattern.test(line)) {
                    findings.push({
                        id: `${skillSlug}-${rule.ruleId}-L${idx + 1}`,
                        ruleId: rule.ruleId,
                        category: rule.category,
                        severity: rule.severity,
                        title: rule.title,
                        description: rule.description,
                        filePath: manifestPath || 'SKILL.md',
                        lineNumber: idx + 1,
                        snippet: line.trim().slice(0, 180),
                        evidenceType: 'VERIFIED_EVIDENCE',
                        remediation: rule.remediation,
                    });
                }
            }
        });
        for (const filePath of additionalFilePaths) {
            if (/\.(exe|dll|so|dylib|bin|scr)$/i.test(filePath)) {
                findings.push({
                    id: `${skillSlug}-SEC-BIN-TREE-${findings.length + 1}`,
                    ruleId: 'SEC-BIN-002',
                    category: 'UNEXPECTED_EXECUTABLE',
                    severity: 'HIGH',
                    title: 'Unexpected Binary Executable in Repository Tree',
                    description: `Repository contains a compiled binary artifact (${filePath}) which cannot be statically audited safely.`,
                    filePath,
                    evidenceType: 'VERIFIED_EVIDENCE',
                    remediation: 'Remove compiled binary files from the skill package and build from verifiable source if needed.',
                });
            }
        }
        let penalty = 0;
        let hasCritical = false;
        let hasHigh = false;
        let hasMedium = false;
        for (const f of findings) {
            if (f.severity === 'CRITICAL') {
                penalty += 45;
                hasCritical = true;
            }
            else if (f.severity === 'HIGH') {
                penalty += 25;
                hasHigh = true;
            }
            else if (f.severity === 'MEDIUM') {
                penalty += 12;
                hasMedium = true;
            }
            else {
                penalty += 5;
            }
        }
        const securityScore = Math.max(5, 100 - penalty);
        let securityStatus = 'SAFE';
        if (hasCritical) {
            securityStatus = 'CRITICAL';
        }
        else if (hasHigh) {
            securityStatus = 'WARNING';
        }
        else if (hasMedium || findings.length > 0) {
            securityStatus = 'REVIEW';
        }
        return {
            securityStatus,
            securityScore,
            findings,
        };
    }
};
exports.SecurityScannerService = SecurityScannerService;
exports.SecurityScannerService = SecurityScannerService = __decorate([
    (0, common_1.Injectable)()
], SecurityScannerService);
//# sourceMappingURL=security-scanner.service.js.map