import { randomUUID } from 'crypto';
import { loadBaselineRules } from './baseline.loader';
import { detectProjectManifests, detectLanguagesFromFiles } from './detect';
import { analyzeDependencies } from './deps';
import { scanSourceFiles } from './scan';
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
    allowedExtensions = ['.html', '.htm', '.css', '.js', '.mjs', '.ts', '.svg', '.wasm', '.json', '.webmanifest'],
    ignorePaths = ['/node_modules/', '/.venv/', '/venv/', '/dist/', '/build/', '/.git/', '/.next/'],
    storeResults = true,
    publicUrl = 'http://localhost:3000',
  } = options;

  const analysisId = randomUUID();
  const startTime = Date.now();

  try {
            // Load baseline rules
            const rules = await loadBaselineRules();
    
    // Process single file
    const fs = await import('fs');
    const content = fs.readFileSync(filePath, 'utf8');
    
    if (!shouldAnalyzeFile(filePath)) {
      throw new Error(`File type not supported for analysis: ${filePath}`);
    }
    
    const extractResult = processSingleFile(filePath, content, maxFileSize);

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
    
    // Add additional analysis findings
    const additionalFindings = await runAdditionalAnalysis(context);
    findings.push(...additionalFindings);
    
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
 * Run additional analysis for enhanced detection
 * @param context Analysis context
 * @returns Array of additional findings
 */
async function runAdditionalAnalysis(context: AnalysisContext): Promise<Finding[]> {
  const findings: Finding[] = [];

  // Analyze code quality and best practices
  const qualityFindings = analyzeCodeQuality(context.extractedFiles);
  findings.push(...qualityFindings);

  // Analyze security vulnerabilities
  const securityFindings = analyzeSecurityVulnerabilities(context.extractedFiles);
  findings.push(...securityFindings);

  // Analyze performance issues
  const performanceFindings = analyzePerformanceIssues(context.extractedFiles);
  findings.push(...performanceFindings);

  return findings;
}

/**
 * Analyze code quality and best practices
 * @param files Array of extracted files
 * @returns Array of quality findings
 */
function analyzeCodeQuality(files: Array<{ path?: string; name?: string; content: string; size: number }>): Finding[] {
  const findings: Finding[] = [];

  for (const file of files) {
    const filePath = file.path || file.name || 'unknown';
    const extension = getFileExtension(filePath);
    const language = detectLanguageFromExtension(extension);
    
    if (!language) continue;

    const lines = file.content.split('\n');
    
    // Check for code quality issues
    for (let lineIndex = 0; lineIndex < lines.length; lineIndex++) {
      const line = lines[lineIndex];
      const lineNumber = lineIndex + 1;
      
      // Skip empty lines and comments
      if (isCommentLine(line, language) || line.trim() === '') {
        continue;
      }

      // Check for long lines
      if (line.length > 120) {
        findings.push({
          kind: 'pattern',
          lang: language,
          file: filePath,
          line: lineNumber,
          status: 'affected',
          reason: 'code-quality',
          issue: 'Line is too long (>120 characters)',
          pattern: 'long-line',
          quickFix: 'Break long lines for better readability',
        });
      }

      // Check for trailing whitespace
      if (line.endsWith(' ') || line.endsWith('\t')) {
        findings.push({
          kind: 'pattern',
          lang: language,
          file: filePath,
          line: lineNumber,
          status: 'affected',
          reason: 'code-quality',
          issue: 'Trailing whitespace detected',
          pattern: 'trailing-whitespace',
          quickFix: 'Remove trailing whitespace',
        });
      }

      // Check for mixed tabs and spaces
      if (line.includes('\t') && line.includes(' ')) {
        findings.push({
          kind: 'pattern',
          lang: language,
          file: filePath,
          line: lineNumber,
          status: 'affected',
          reason: 'code-quality',
          issue: 'Mixed tabs and spaces for indentation',
          pattern: 'mixed-indentation',
          quickFix: 'Use consistent indentation (prefer spaces)',
        });
      }

      // Check for TODO/FIXME comments
      if (line.toLowerCase().includes('todo') || line.toLowerCase().includes('fixme')) {
        findings.push({
          kind: 'pattern',
          lang: language,
          file: filePath,
          line: lineNumber,
          status: 'affected',
          reason: 'code-quality',
          issue: 'TODO/FIXME comment found',
          pattern: 'todo-comment',
          quickFix: 'Address TODO/FIXME items before production',
        });
      }

      // Check for console.log in production code
      if (language === 'node' && line.includes('console.log')) {
        findings.push({
          kind: 'pattern',
          lang: language,
          file: filePath,
          line: lineNumber,
          status: 'affected',
          reason: 'code-quality',
          issue: 'console.log should be removed in production',
          pattern: 'console-log',
          quickFix: 'Use proper logging library or remove debug statements',
        });
      }

      // Check for print statements in Python
      if (language === 'python' && line.includes('print(')) {
        findings.push({
          kind: 'pattern',
          lang: language,
          file: filePath,
          line: lineNumber,
          status: 'affected',
          reason: 'code-quality',
          issue: 'print() should be removed in production',
          pattern: 'print-statement',
          quickFix: 'Use proper logging library or remove debug statements',
        });
      }
    }
  }

  return findings;
}

/**
 * Analyze security vulnerabilities
 * @param files Array of extracted files
 * @returns Array of security findings
 */
function analyzeSecurityVulnerabilities(files: Array<{ path?: string; name?: string; content: string; size: number }>): Finding[] {
  const findings: Finding[] = [];

  for (const file of files) {
    const filePath = file.path || file.name || 'unknown';
    const extension = getFileExtension(filePath);
    const language = detectLanguageFromExtension(extension);
    
    if (!language) continue;

    const lines = file.content.split('\n');
    
    // Check for security vulnerabilities
    for (let lineIndex = 0; lineIndex < lines.length; lineIndex++) {
      const line = lines[lineIndex];
      const lineNumber = lineIndex + 1;
      
      // Skip empty lines and comments
      if (isCommentLine(line, language) || line.trim() === '') {
        continue;
      }

      // Check for hardcoded passwords
      if (line.toLowerCase().includes('password') && line.includes('=') && !line.includes('input(')) {
        findings.push({
          kind: 'pattern',
          lang: language,
          file: filePath,
          line: lineNumber,
          status: 'affected',
          reason: 'security',
          issue: 'Potential hardcoded password detected',
          pattern: 'hardcoded-password',
          quickFix: 'Use environment variables or secure credential storage',
        });
      }

      // Check for hardcoded API keys
      if (line.toLowerCase().includes('api') && line.toLowerCase().includes('key') && line.includes('=')) {
        findings.push({
          kind: 'pattern',
          lang: language,
          file: filePath,
          line: lineNumber,
          status: 'affected',
          reason: 'security',
          issue: 'Potential hardcoded API key detected',
          pattern: 'hardcoded-api-key',
          quickFix: 'Use environment variables or secure credential storage',
        });
      }

      // Check for SQL injection vulnerabilities
      if (line.includes('SELECT') || line.includes('INSERT') || line.includes('UPDATE') || line.includes('DELETE')) {
        if (line.includes('+') || line.includes('${') || line.includes('%s')) {
          findings.push({
            kind: 'pattern',
            lang: language,
            file: filePath,
            line: lineNumber,
            status: 'affected',
            reason: 'security',
            issue: 'Potential SQL injection vulnerability',
            pattern: 'sql-injection',
            quickFix: 'Use parameterized queries or prepared statements',
          });
        }
      }

      // Check for XSS vulnerabilities
      if (line.includes('innerHTML') || line.includes('outerHTML') || line.includes('document.write')) {
        findings.push({
          kind: 'pattern',
          lang: language,
          file: filePath,
          line: lineNumber,
          status: 'affected',
          reason: 'security',
          issue: 'Potential XSS vulnerability',
          pattern: 'xss-vulnerability',
          quickFix: 'Use textContent or sanitize HTML content',
        });
      }

      // Check for unsafe deserialization
      if (line.includes('pickle.load') || line.includes('unpickle') || line.includes('deserialize')) {
        findings.push({
          kind: 'pattern',
          lang: language,
          file: filePath,
          line: lineNumber,
          status: 'affected',
          reason: 'security',
          issue: 'Unsafe deserialization detected',
          pattern: 'unsafe-deserialization',
          quickFix: 'Use safe serialization formats like JSON',
        });
      }
    }
  }

  return findings;
}

/**
 * Analyze performance issues
 * @param files Array of extracted files
 * @returns Array of performance findings
 */
function analyzePerformanceIssues(files: Array<{ path?: string; name?: string; content: string; size: number }>): Finding[] {
  const findings: Finding[] = [];

  for (const file of files) {
    const filePath = file.path || file.name || 'unknown';
    const extension = getFileExtension(filePath);
    const language = detectLanguageFromExtension(extension);
    
    if (!language) continue;

    const lines = file.content.split('\n');
    
    // Check for performance issues
    for (let lineIndex = 0; lineIndex < lines.length; lineIndex++) {
      const line = lines[lineIndex];
      const lineNumber = lineIndex + 1;
      
      // Skip empty lines and comments
      if (isCommentLine(line, language) || line.trim() === '') {
        continue;
      }

      // Check for synchronous file operations
      if (language === 'node' && (line.includes('fs.readFileSync') || line.includes('fs.writeFileSync'))) {
        findings.push({
          kind: 'pattern',
          lang: language,
          file: filePath,
          line: lineNumber,
          status: 'affected',
          reason: 'performance',
          issue: 'Synchronous file operation can block the event loop',
          pattern: 'sync-file-operation',
          quickFix: 'Use asynchronous file operations (fs.promises)',
        });
      }

      // Check for blocking operations
      if (line.includes('sleep(') || line.includes('time.sleep(')) {
        findings.push({
          kind: 'pattern',
          lang: language,
          file: filePath,
          line: lineNumber,
          status: 'affected',
          reason: 'performance',
          issue: 'Blocking sleep operation detected',
          pattern: 'blocking-sleep',
          quickFix: 'Use asynchronous alternatives or reduce sleep time',
        });
      }

      // Check for inefficient loops
      if (line.includes('for') && line.includes('in') && line.includes('range(')) {
        if (line.includes('len(') || line.includes('.length')) {
          findings.push({
            kind: 'pattern',
            lang: language,
            file: filePath,
            line: lineNumber,
            status: 'affected',
            reason: 'performance',
            issue: 'Inefficient loop with len()/length call',
            pattern: 'inefficient-loop',
            quickFix: 'Cache length or use enumerate()/entries()',
          });
        }
      }

      // Check for string concatenation in loops
      if (line.includes('+=') && line.includes('str') || line.includes('+=') && line.includes('string')) {
        findings.push({
          kind: 'pattern',
          lang: language,
          file: filePath,
          line: lineNumber,
          status: 'affected',
          reason: 'performance',
          issue: 'String concatenation in loop is inefficient',
          pattern: 'string-concatenation',
          quickFix: 'Use join() or StringBuilder for better performance',
        });
      }
    }
  }

  return findings;
}

/**
 * Get file extension from path
 * @param filePath File path
 * @returns File extension with dot
 */
function getFileExtension(filePath: string): string {
  const lastDot = filePath.lastIndexOf('.');
  if (lastDot === -1) return '';
  return filePath.substring(lastDot);
}

/**
 * Detect language from file extension
 * @param extension File extension
 * @returns Language or null
 */
function detectLanguageFromExtension(extension: string): Language | null {
  const languageMap: Record<string, Language> = {
    '.html': 'node',
    '.htm': 'node',
    '.css': 'node',
    '.js': 'node',
    '.jsx': 'node',
    '.mjs': 'node',
    '.ts': 'node',
    '.tsx': 'node',
    '.svg': 'node',
    '.wasm': 'node',
    '.json': 'node',
    '.webmanifest': 'node',
    '.py': 'python',
    '.java': 'java',
    '.go': 'go',
    '.cs': 'dotnet',
    '.fs': 'dotnet',
    '.vb': 'dotnet',
  };
  
  return languageMap[extension] || null;
}

/**
 * Check if a line is a comment
 * @param line Line content
 * @param language Language context
 * @returns True if comment line
 */
function isCommentLine(line: string, language: Language): boolean {
  const trimmed = line.trim();
  
  switch (language) {
    case 'node':
    case 'java':
    case 'go':
    case 'dotnet':
      return trimmed.startsWith('//') || trimmed.startsWith('/*') || trimmed.startsWith('*') || trimmed.startsWith('<!--');
    
    case 'python':
      return trimmed.startsWith('#');
    
    default:
      return false;
  }
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
    allowedExtensions: options.allowedExtensions || ['.html', '.htm', '.css', '.js', '.mjs', '.ts', '.svg', '.wasm', '.json', '.webmanifest'],
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
