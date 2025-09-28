import { randomUUID } from 'crypto';
import { loadBaselineRules } from './baseline.loader';
import { detectProjectManifests, detectLanguagesFromFiles } from './detect';
import { analyzeDependencies } from './deps';
import { scanSourceFiles } from './scan';
import { extractZipToMemory } from '../files/unzip';
import { processSingleFile, shouldAnalyzeFile } from '../files/single-file';
import { storeAnalysisResults } from '../files/store';
import {
  Report,
  Finding,
  Language,
  ReportSummary,
  AnalysisContext,
  ExtractedFile,
  ProjectManifest,
  BaselineRules
} from './baseline.types';

interface GroqAnalysisResult {
  analysis: string;
  filename: string;
  timestamp: string;
}

export interface AnalysisOptions {
  maxFiles?: number;
  maxFileSize?: number;
  allowedExtensions?: string[];
  ignorePaths?: string[];
  storeResults?: boolean;
  publicUrl?: string;
}

export interface AnalysisResult {
  report: Report;
  artifacts?: {
    jsonUrl: string;
    csvUrl: string;
    analysisId: string;
  };
}

/**
 * Run complete baseline analysis on a ZIP file
 * @param zipPath Path to ZIP file
 * @param options Analysis options
 * @returns Analysis result with report and artifacts
 */
async function analyzeWithGroq(
  files: ExtractedFile[],
  projectType: string,
  dependencies: string[]
): Promise<GroqAnalysisResult[]> {
  const results: GroqAnalysisResult[] = [];
  
  // Skip Groq analysis if no GROQ_API_KEY is available
  if (!process.env.GROQ_API_KEY) {
    console.log('Skipping Groq analysis: GROQ_API_KEY not configured');
    return results;
  }
  
  // Analyze up to 5 key files to avoid rate limits
  const keyFiles = files
    .filter(file => {
      const fileName = (file as { name?: string; path: string }).name || file.path || 'unknown';
      const ext = fileName.split('.').pop()?.toLowerCase();
      return ['js', 'ts', 'jsx', 'tsx', 'css', 'html', 'vue', 'svelte', 'py', 'java', 'go', 'cs'].includes(ext || '');
    })
    .slice(0, 5);

  for (const file of keyFiles) {
    try {
      // Use absolute URL for server-side fetch
      const baseUrl = process.env.PUBLIC_URL || 'http://localhost:3000';
      const response = await fetch(`${baseUrl}/api/analyze/groq`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          code: file.content,
          filename: (file as { name?: string; path: string }).name || file.path || 'unknown',
          projectType,
          dependencies
        })
      });

      if (response.ok) {
              const result = await response.json();
              results.push(result);
            } else {
              console.error(`Groq analysis failed for ${(file as { name?: string; path: string }).name || file.path}: ${response.status} ${response.statusText}`);
            }
          } catch (error) {
            console.error(`Groq analysis failed for ${(file as { name?: string; path: string }).name || file.path}:`, error);
    }
  }

  return results;
}

export async function runBaselineAnalysis(
  filePath: string,
  options: AnalysisOptions = {}
): Promise<AnalysisResult> {
  const {
    maxFiles = 50000,
    maxFileSize = 2 * 1024 * 1024, // 2MB
    allowedExtensions = ['.py', '.js', '.ts', '.tsx', '.jsx', '.java', '.go', '.cs', '.fs', '.vb'],
    ignorePaths = ['/node_modules/', '/.venv/', '/venv/', '/dist/', '/build/', '/.git/', '/.next/'],
    storeResults = true,
    publicUrl = 'http://localhost:3000',
  } = options;

  const analysisId = randomUUID();
  const startTime = Date.now();

  try {
            // Load baseline rules
            const rules = await loadBaselineRules();
    
    // Determine if file is ZIP or single file
    const isZipFile = filePath.toLowerCase().endsWith('.zip');
    let extractResult;
    
    if (isZipFile) {
      // Extract ZIP file
      extractResult = await extractZipToMemory(filePath, {
        maxFiles,
        maxFileSize,
        allowedExtensions,
        ignorePaths,
      });

      if (extractResult.errors.length > 0) {
        console.warn('Extraction warnings:', extractResult.errors);
      }
    } else {
      // Process single file
      const fs = await import('fs');
      const content = fs.readFileSync(filePath, 'utf8');
      
      if (!shouldAnalyzeFile(filePath)) {
        throw new Error(`File type not supported for analysis: ${filePath}`);
      }
      
      extractResult = processSingleFile(filePath, content, maxFileSize);
    }

    // Detect project manifests and languages
    const manifests = detectProjectManifests(extractResult.files);
    const detectedLanguages = detectLanguagesFromFiles(extractResult.files);
    
    // Create analysis context
    const context: AnalysisContext = {
      rules,
      extractedFiles: extractResult.files,
      manifests,
      detectedLanguages,
    };

    // Run analysis
    const findings = await runAnalysis(context);
    
    // Generate summary
    const summary = generateSummary(findings, detectedLanguages);
    
    // Run Groq AI analysis
    const groqResults = await analyzeWithGroq(
      extractResult.files,
      detectedLanguages.join(', '),
      context.manifests.flatMap(m => Object.keys(m.dependencies || {}))
    );
    
    // Create report
    const report: Report = {
      findings,
      summary,
      metadata: {
        analysisId,
        timestamp: new Date().toISOString(),
        projectName: getProjectName(filePath),
        detectedLanguages,
        totalFiles: extractResult.totalFiles,
        scannedFiles: extractResult.files.length,
        skippedFiles: extractResult.skippedFiles,
        groqAnalysis: groqResults,
      },
    };

    // Store results if requested
    let artifacts;
    if (storeResults) {
      artifacts = storeAnalysisResults(report, { publicUrl });
    }

    const endTime = Date.now();
    console.log(`Analysis completed in ${endTime - startTime}ms`);

    return {
      report,
      artifacts,
    };
  } catch (error) {
    console.error('Analysis failed:', error);
    throw new Error(`Analysis failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Run analysis on extracted files and manifests
 * @param context Analysis context
 * @returns Array of findings
 */
async function runAnalysis(context: AnalysisContext): Promise<Finding[]> {
  const findings: Finding[] = [];

  // Analyze dependencies
  const dependencyFindings = analyzeDependencies(context.manifests, context.rules);
  findings.push(...dependencyFindings);

  // Scan source files for deprecated patterns
  const patternFindings = scanSourceFiles(context.extractedFiles, context.rules);
  findings.push(...patternFindings);

  return findings;
}

/**
 * Generate summary from findings
 * @param findings Array of findings
 * @param detectedLanguages Array of detected languages
 * @returns Report summary
 */
function generateSummary(findings: Finding[], detectedLanguages: Language[]): ReportSummary {
  const summary: ReportSummary = {
    ok: 0,
    affected: 0,
    unknown: 0,
    byLanguage: {},
  };

  // Initialize language summaries
  for (const language of detectedLanguages) {
    summary.byLanguage[language] = {
      ok: 0,
      affected: 0,
      unknown: 0,
    };
  }

  // Count findings by status and language
  for (const finding of findings) {
    if (finding.kind === 'dependency') {
      summary[finding.status]++;
      if (summary.byLanguage[finding.lang]) {
        summary.byLanguage[finding.lang]![finding.status]++;
      }
    } else if (finding.kind === 'pattern') {
      summary.affected++;
      if (summary.byLanguage[finding.lang]) {
        summary.byLanguage[finding.lang]!.affected++;
      }
    }
  }

  return summary;
}

/**
 * Get project name from ZIP path
 * @param zipPath ZIP file path
 * @returns Project name
 */
function getProjectName(zipPath: string): string {
  const pathParts = zipPath.split('/');
  const fileName = pathParts[pathParts.length - 1];
  return fileName.replace(/\.zip$/i, '');
}

/**
 * Run analysis on extracted files (for testing)
 * @param files Array of extracted files
 * @param manifests Array of project manifests
 * @param rules Baseline rules
 * @returns Analysis result
 */
export async function runAnalysisOnFiles(
  files: ExtractedFile[],
  manifests: ProjectManifest[],
  rules: BaselineRules
): Promise<AnalysisResult> {
  const analysisId = randomUUID();
  const detectedLanguages = detectLanguagesFromFiles(files);
  
  const context: AnalysisContext = {
    rules,
    extractedFiles: files,
    manifests,
    detectedLanguages,
  };

  const findings = await runAnalysis(context);
  const summary = generateSummary(findings, detectedLanguages);
  
  const report: Report = {
    findings,
    summary,
    metadata: {
      analysisId,
      timestamp: new Date().toISOString(),
      projectName: 'test-project',
      detectedLanguages,
      totalFiles: files.length,
      scannedFiles: files.length,
      skippedFiles: 0,
    },
  };

  return { report };
}

/**
 * Validate analysis options
 * @param options Analysis options
 * @returns Validated options
 */
export function validateAnalysisOptions(options: AnalysisOptions): AnalysisOptions {
  return {
    maxFiles: Math.min(options.maxFiles || 50000, 100000), // Cap at 100k
    maxFileSize: Math.min(options.maxFileSize || 2 * 1024 * 1024, 10 * 1024 * 1024), // Cap at 10MB
    allowedExtensions: options.allowedExtensions || ['.py', '.js', '.ts', '.tsx', '.jsx', '.java', '.go', '.cs', '.fs', '.vb'],
    ignorePaths: options.ignorePaths || ['/node_modules/', '/.venv/', '/venv/', '/dist/', '/build/', '/.git/', '/.next/'],
    storeResults: options.storeResults !== false,
    publicUrl: options.publicUrl || 'http://localhost:3000',
  };
}

/**
 * Get analysis progress (for long-running analyses)
 * @param context Analysis context
 * @param currentStep Current step
 * @param totalSteps Total steps
 * @returns Progress information
 */
export function getAnalysisProgress(
  context: AnalysisContext,
  currentStep: number,
  totalSteps: number
): {
  step: string;
  progress: number;
  details: string;
} {
  const steps = [
    'Loading baseline rules',
    'Extracting ZIP file',
    'Detecting project manifests',
    'Analyzing dependencies',
    'Scanning source files',
    'Generating report',
  ];

  const step = steps[currentStep] || 'Unknown';
  const progress = (currentStep / totalSteps) * 100;
  
  let details = '';
  if (currentStep === 1) {
    details = `Extracted ${context.extractedFiles.length} files`;
  } else if (currentStep === 2) {
    details = `Found ${context.manifests.length} manifests, ${context.detectedLanguages.length} languages`;
  } else if (currentStep === 3) {
    details = `Analyzing ${context.manifests.length} dependency manifests`;
  } else if (currentStep === 4) {
    details = `Scanning ${context.extractedFiles.length} source files`;
  }

  return {
    step,
    progress,
    details,
  };
}

/**
 * Estimate analysis time
 * @param fileCount Number of files
 * @param manifestCount Number of manifests
 * @returns Estimated time in milliseconds
 */
export function estimateAnalysisTime(fileCount: number, manifestCount: number): number {
  // Base time: 1 second
  let estimated = 1000;
  
  // Add time for file processing: 10ms per file
  estimated += fileCount * 10;
  
  // Add time for manifest processing: 50ms per manifest
  estimated += manifestCount * 50;
  
  // Add time for pattern scanning: 5ms per file
  estimated += fileCount * 5;
  
  return Math.min(estimated, 30000); // Cap at 30 seconds
}

/**
 * Check if analysis is feasible
 * @param fileCount Number of files
 * @param totalSize Total size in bytes
 * @returns Feasibility check result
 */
export function checkAnalysisFeasibility(
  fileCount: number,
  totalSize: number
): {
  feasible: boolean;
  warnings: string[];
  estimatedTime: string;
} {
  const warnings: string[] = [];
  let feasible = true;

  // Check file count
  if (fileCount > 50000) {
    feasible = false;
    warnings.push(`Too many files: ${fileCount} (limit: 50,000)`);
  } else if (fileCount > 10000) {
    warnings.push(`Large number of files: ${fileCount} (analysis may take longer)`);
  }

  // Check total size
  if (totalSize > 100 * 1024 * 1024) { // 100MB
    feasible = false;
    warnings.push(`Archive too large: ${Math.round(totalSize / 1024 / 1024)}MB (limit: 100MB)`);
  } else if (totalSize > 50 * 1024 * 1024) { // 50MB
    warnings.push(`Large archive: ${Math.round(totalSize / 1024 / 1024)}MB (analysis may take longer)`);
  }

  const estimatedTimeMs = estimateAnalysisTime(fileCount, Math.min(fileCount / 100, 50));
  const estimatedTime = `${Math.round(estimatedTimeMs / 1000)}s`;

  return {
    feasible,
    warnings,
    estimatedTime,
  };
}
