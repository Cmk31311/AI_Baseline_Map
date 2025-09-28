import { z } from 'zod';

// Language types
export const LanguageSchema = z.enum(['python', 'node', 'java', 'go', 'dotnet']);
export type Language = z.infer<typeof LanguageSchema>;

// Status types
export const StatusSchema = z.enum(['ok', 'affected', 'unknown']);
export type Status = z.infer<typeof StatusSchema>;

// Finding types
export const DependencyFindingSchema = z.object({
  kind: z.literal('dependency'),
  lang: LanguageSchema,
  component: z.string(),
  foundVersion: z.string().nullable(),
  baselineRequired: z.string().nullable(),
  status: StatusSchema,
  reason: z.string(),
  file: z.string(),
  quickFix: z.string().optional(),
});

export const PatternFindingSchema = z.object({
  kind: z.literal('pattern'),
  lang: LanguageSchema,
  file: z.string(),
  line: z.number(),
  status: z.literal('affected'),
  reason: z.enum(['deprecated-api', 'code-quality', 'security', 'performance']),
  issue: z.string(),
  pattern: z.string(),
  quickFix: z.string().optional(),
});

export const FindingSchema = z.discriminatedUnion('kind', [
  DependencyFindingSchema,
  PatternFindingSchema,
]);

export type DependencyFinding = z.infer<typeof DependencyFindingSchema>;
export type PatternFinding = z.infer<typeof PatternFindingSchema>;
export type Finding = z.infer<typeof FindingSchema>;

// Summary types
export const LanguageSummarySchema = z.object({
  ok: z.number(),
  affected: z.number(),
  unknown: z.number(),
});

export const ReportSummarySchema = z.object({
  ok: z.number(),
  affected: z.number(),
  unknown: z.number(),
  byLanguage: z.record(LanguageSchema, LanguageSummarySchema),
});

// Report type
export const ReportSchema = z.object({
  findings: z.array(FindingSchema),
  summary: ReportSummarySchema,
  metadata: z.object({
    analysisId: z.string(),
    timestamp: z.string(),
    projectName: z.string().optional(),
    detectedLanguages: z.array(LanguageSchema),
    totalFiles: z.number(),
    scannedFiles: z.number(),
    skippedFiles: z.number(),
    groqAnalysis: z.array(z.object({
      analysis: z.string(),
      filename: z.string(),
      timestamp: z.string(),
    })).optional(),
  }),
});

export type LanguageSummary = z.infer<typeof LanguageSummarySchema>;
export type ReportSummary = z.infer<typeof ReportSummarySchema>;
export type Report = z.infer<typeof ReportSchema>;

// Rules configuration types
export const DeprecatedPatternSchema = z.object({
  pattern: z.string(),
  message: z.string(),
  alternative: z.string(),
});

export const PackageMinsSchema = z.record(LanguageSchema, z.record(z.string(), z.string()));

export const LanguageRuntimesSchema = z.record(LanguageSchema, z.string());

export const QuickFixesSchema = z.object({
  dependency_upgrade: z.record(LanguageSchema, z.string()),
  pattern_replacement: z.record(LanguageSchema, z.record(z.string(), z.string())),
});

export const BaselineRulesSchema = z.object({
  language_runtimes: LanguageRuntimesSchema,
  package_mins: PackageMinsSchema,
  deprecated_patterns: z.record(LanguageSchema, z.array(DeprecatedPatternSchema)),
  scan_file_exts: z.array(z.string()),
  ignore_paths: z.array(z.string()),
  max_file_size: z.number(),
  max_files: z.number(),
  quick_fixes: QuickFixesSchema,
});

export type DeprecatedPattern = z.infer<typeof DeprecatedPatternSchema>;
export type PackageMins = z.infer<typeof PackageMinsSchema>;
export type LanguageRuntimes = z.infer<typeof LanguageRuntimesSchema>;
export type QuickFixes = z.infer<typeof QuickFixesSchema>;
export type BaselineRules = z.infer<typeof BaselineRulesSchema>;

// API types
export const AnalyzeResponseSchema = z.object({
  analysisId: z.string(),
  summary: ReportSummarySchema,
  artifacts: z.object({
    jsonUrl: z.string(),
    csvUrl: z.string(),
  }),
  report: ReportSchema.optional(),
});

export type AnalyzeResponse = z.infer<typeof AnalyzeResponseSchema>;

// Project detection types
export const ProjectManifestSchema = z.object({
  language: LanguageSchema,
  file: z.string(),
  dependencies: z.record(z.string(), z.string()).optional(),
  devDependencies: z.record(z.string(), z.string()).optional(),
  peerDependencies: z.record(z.string(), z.string()).optional(),
  optionalDependencies: z.record(z.string(), z.string()).optional(),
});

export type ProjectManifest = z.infer<typeof ProjectManifestSchema>;

// File processing types
export const ExtractedFileSchema = z.object({
  path: z.string(),
  content: z.string(),
  size: z.number(),
  language: LanguageSchema.optional(),
});

export type ExtractedFile = z.infer<typeof ExtractedFileSchema>;

// Analysis context types
export const AnalysisContextSchema = z.object({
  rules: BaselineRulesSchema,
  extractedFiles: z.array(ExtractedFileSchema),
  manifests: z.array(ProjectManifestSchema),
  detectedLanguages: z.array(LanguageSchema),
});

export type AnalysisContext = z.infer<typeof AnalysisContextSchema>;

// Error types
export const AnalysisErrorSchema = z.object({
  code: z.string(),
  message: z.string(),
  details: z.any().optional(),
});

export type AnalysisError = z.infer<typeof AnalysisErrorSchema>;

// Utility types for UI
export interface FilterOptions {
  language?: Language;
  status?: Status;
  searchText?: string;
}

export interface SortOptions {
  field: 'component' | 'file' | 'status' | 'reason';
  direction: 'asc' | 'desc';
}

// CSV export types
export interface CSVRow {
  Kind: string;
  Language: string;
  Component: string;
  File: string;
  Line: string;
  Status: string;
  Reason: string;
  'Quick Fix': string;
  'Found Version': string;
  'Required Version': string;
}

// Validation helpers
export function validateFinding(finding: unknown): Finding {
  return FindingSchema.parse(finding);
}

export function validateReport(report: unknown): Report {
  return ReportSchema.parse(report);
}

export function validateBaselineRules(rules: unknown): BaselineRules {
  return BaselineRulesSchema.parse(rules);
}

export function validateAnalyzeResponse(response: unknown): AnalyzeResponse {
  return AnalyzeResponseSchema.parse(response);
}

// Type guards
export function isDependencyFinding(finding: Finding): finding is DependencyFinding {
  return finding.kind === 'dependency';
}

export function isPatternFinding(finding: Finding): finding is PatternFinding {
  return finding.kind === 'pattern';
}

// Status helpers
export function getStatusIcon(status: Status): string {
  switch (status) {
    case 'ok':
      return '✅';
    case 'affected':
      return '⚠️';
    case 'unknown':
      return '❓';
    default:
      return '❓';
  }
}

export function getStatusColor(status: Status): string {
  switch (status) {
    case 'ok':
      return 'text-green-600';
    case 'affected':
      return 'text-yellow-600';
    case 'unknown':
      return 'text-gray-600';
    default:
      return 'text-gray-600';
  }
}

export function getStatusBadgeClass(status: Status): string {
  switch (status) {
    case 'ok':
      return 'bg-green-100 text-green-800';
    case 'affected':
      return 'bg-yellow-100 text-yellow-800';
    case 'unknown':
      return 'bg-gray-100 text-gray-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
}
