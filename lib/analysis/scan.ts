import { Language, PatternFinding, BaselineRules } from './baseline.types';
import { shouldScanFile, shouldIgnorePath } from './baseline.loader';

/**
 * Scan source files for deprecated patterns
 * @param files Array of extracted files
 * @param rules Baseline rules
 * @returns Array of pattern findings
 */
export function scanSourceFiles(
  files: Array<{ path?: string; name?: string; content: string; size: number }>,
  rules: BaselineRules
): PatternFinding[] {
  const findings: PatternFinding[] = [];
  
  for (const file of files) {
    // Skip files that are too large
    if (file.size > rules.max_file_size) {
      console.warn(`Skipping large file: ${file.path || file.name} (${file.size} bytes)`);
      continue;
    }
    
    // Skip ignored paths
    const filePath = file.path || file.name || 'unknown';
    if (shouldIgnorePath(rules, filePath)) {
      continue;
    }
    
    // Skip files that shouldn't be scanned
    const extension = getFileExtension(filePath);
    if (!shouldScanFile(rules, extension)) {
      continue;
    }
    
    // Detect language from file extension
    const language = detectLanguageFromExtension(extension);
    if (!language) {
      continue;
    }
    
    // Get deprecated patterns for this language
    const patterns = rules.deprecated_patterns[language] || [];
    if (patterns.length === 0) {
      continue;
    }
    
            // Scan file content
            const fileFindings = scanFileContent(file, language, patterns);
    findings.push(...fileFindings);
  }
  
  return findings;
}

/**
 * Scan a single file for deprecated patterns
 * @param file File to scan
 * @param language Language of the file
 * @param patterns Deprecated patterns to look for
 * @param rules Baseline rules
 * @returns Array of pattern findings
 */
function scanFileContent(
  file: { path?: string; name?: string; content: string },
  language: Language,
  patterns: Array<{ pattern: string; message: string; alternative: string }>
): PatternFinding[] {
  const findings: PatternFinding[] = [];
  const lines = file.content.split('\n');
  const filePath = file.path || file.name || 'unknown';
  
  for (let lineIndex = 0; lineIndex < lines.length; lineIndex++) {
    const line = lines[lineIndex];
    const lineNumber = lineIndex + 1;
    
    // Skip empty lines and comments
    if (isCommentLine(line, language) || line.trim() === '') {
      continue;
    }
    
    // Check each pattern
    for (const pattern of patterns) {
      try {
        const regex = new RegExp(pattern.pattern, 'g');
        let match;
        
        while ((match = regex.exec(line)) !== null) {
          // Avoid infinite loops with zero-length matches
          if (match.index === regex.lastIndex) {
            regex.lastIndex++;
          }
          
                  findings.push({
                    kind: 'pattern',
                    lang: language,
                    file: filePath,
                    line: lineNumber,
                    status: 'affected',
                    reason: 'deprecated-api',
                    issue: pattern.message,
                    pattern: pattern.pattern,
                    quickFix: pattern.alternative,
                  });
        }
      } catch (error) {
        console.warn(`Invalid regex pattern: ${pattern.pattern} - ${error}`);
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
    '.js': 'node',
    '.jsx': 'node',
    '.ts': 'node',
    '.tsx': 'node',
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
      return trimmed.startsWith('//') || trimmed.startsWith('/*') || trimmed.startsWith('*');
    
    case 'python':
      return trimmed.startsWith('#');
    
    default:
      return false;
  }
}

/**
 * Get quick fix for pattern replacement
 * @param rules Baseline rules
 * @param language Language
 * @param pattern Pattern to replace
 * @returns Quick fix suggestion or undefined
 */
export function getPatternQuickFix(
  rules: BaselineRules,
  language: Language,
  pattern: string
): string | undefined {
  return rules.quick_fixes.pattern_replacement[language]?.[pattern];
}

/**
 * Group pattern findings by file
 * @param findings Pattern findings
 * @returns Grouped findings by file
 */
export function groupPatternFindingsByFile(findings: PatternFinding[]): Record<string, PatternFinding[]> {
  const grouped: Record<string, PatternFinding[]> = {};
  
  for (const finding of findings) {
    if (!grouped[finding.file]) {
      grouped[finding.file] = [];
    }
    grouped[finding.file].push(finding);
  }
  
  return grouped;
}

/**
 * Group pattern findings by language
 * @param findings Pattern findings
 * @returns Grouped findings by language
 */
export function groupPatternFindingsByLanguage(findings: PatternFinding[]): Record<Language, PatternFinding[]> {
  const grouped: Record<Language, PatternFinding[]> = {
    python: [],
    node: [],
    java: [],
    go: [],
    dotnet: []
  };
  
  for (const finding of findings) {
    if (!grouped[finding.lang]) {
      grouped[finding.lang] = [];
    }
    grouped[finding.lang].push(finding);
  }
  
  return grouped;
}

/**
 * Get pattern summary statistics
 * @param findings Pattern findings
 * @returns Summary statistics
 */
export function getPatternSummary(findings: PatternFinding[]) {
  const total = findings.length;
  const byLanguage = groupPatternFindingsByLanguage(findings);
  const byFile = groupPatternFindingsByFile(findings);
  
  return {
    total,
    affectedFiles: Object.keys(byFile).length,
    byLanguage: Object.fromEntries(
      Object.entries(byLanguage).map(([lang, findings]) => [
        lang,
        {
          count: findings.length,
          files: new Set(findings.map(f => f.file)).size,
        },
      ])
    ),
  };
}

/**
 * Filter pattern findings by language
 * @param findings Pattern findings
 * @param language Language to filter by
 * @returns Filtered findings
 */
export function filterPatternFindingsByLanguage(
  findings: PatternFinding[],
  language: Language
): PatternFinding[] {
  return findings.filter(f => f.lang === language);
}

/**
 * Filter pattern findings by file
 * @param findings Pattern findings
 * @param filePath File path to filter by
 * @returns Filtered findings
 */
export function filterPatternFindingsByFile(
  findings: PatternFinding[],
  filePath: string
): PatternFinding[] {
  return findings.filter(f => f.file === filePath);
}

/**
 * Sort pattern findings by file and line
 * @param findings Pattern findings
 * @returns Sorted findings
 */
export function sortPatternFindings(findings: PatternFinding[]): PatternFinding[] {
  return [...findings].sort((a, b) => {
    // First by file path
    const fileDiff = a.file.localeCompare(b.file);
    if (fileDiff !== 0) return fileDiff;
    
    // Then by line number
    return a.line - b.line;
  });
}

/**
 * Get unique patterns found
 * @param findings Pattern findings
 * @returns Array of unique patterns
 */
export function getUniquePatterns(findings: PatternFinding[]): string[] {
  const patterns = new Set<string>();
  
  for (const finding of findings) {
    patterns.add(finding.pattern);
  }
  
  return Array.from(patterns);
}

/**
 * Get pattern frequency
 * @param findings Pattern findings
 * @returns Pattern frequency map
 */
export function getPatternFrequency(findings: PatternFinding[]): Record<string, number> {
  const frequency: Record<string, number> = {};
  
  for (const finding of findings) {
    frequency[finding.pattern] = (frequency[finding.pattern] || 0) + 1;
  }
  
  return frequency;
}

/**
 * Get most common patterns
 * @param findings Pattern findings
 * @param limit Maximum number of patterns to return
 * @returns Array of most common patterns
 */
export function getMostCommonPatterns(
  findings: PatternFinding[],
  limit: number = 10
): Array<{ pattern: string; count: number }> {
  const frequency = getPatternFrequency(findings);
  
  return Object.entries(frequency)
    .map(([pattern, count]) => ({ pattern, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, limit);
}

/**
 * Check if a file contains any deprecated patterns
 * @param filePath File path
 * @param findings Pattern findings
 * @returns True if file has deprecated patterns
 */
export function fileHasDeprecatedPatterns(
  filePath: string,
  findings: PatternFinding[]
): boolean {
  return findings.some(f => f.file === filePath);
}

/**
 * Get files with deprecated patterns
 * @param findings Pattern findings
 * @returns Array of file paths
 */
export function getFilesWithDeprecatedPatterns(findings: PatternFinding[]): string[] {
  const files = new Set<string>();
  
  for (const finding of findings) {
    files.add(finding.file);
  }
  
  return Array.from(files);
}

/**
 * Get line numbers with deprecated patterns for a file
 * @param filePath File path
 * @param findings Pattern findings
 * @returns Array of line numbers
 */
export function getDeprecatedPatternLines(
  filePath: string,
  findings: PatternFinding[]
): number[] {
  return findings
    .filter(f => f.file === filePath)
    .map(f => f.line)
    .sort((a, b) => a - b);
}
