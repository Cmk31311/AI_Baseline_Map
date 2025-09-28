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
    
    // Add additional analysis for specific file types
    if (language === 'node' && (extension === '.js' || extension === '.ts' || extension === '.jsx' || extension === '.tsx')) {
      const jsFindings = analyzeJavaScriptPatterns(file, language);
      findings.push(...jsFindings);
    }
    
    if (language === 'python' && extension === '.py') {
      const pyFindings = analyzePythonPatterns(file, language);
      findings.push(...pyFindings);
    }
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
 * Analyze JavaScript-specific patterns
 * @param file File to analyze
 * @param language Language context
 * @returns Array of pattern findings
 */
function analyzeJavaScriptPatterns(
  file: { path?: string; name?: string; content: string },
  language: Language
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
    
    // Check for common JavaScript issues
    const jsPatterns = [
      {
        pattern: /var\s+\w+/g,
        message: "var is deprecated, use let or const",
        alternative: "Use let for variables that change, const for constants"
      },
      {
        pattern: /function\s+\w+\s*\(/g,
        message: "Function declarations are less preferred than arrow functions",
        alternative: "Use arrow functions for better scope handling"
      },
      {
        pattern: /this\.\w+\s*=/g,
        message: "Direct this assignment is discouraged",
        alternative: "Use class properties or bind methods properly"
      },
      {
        pattern: /\barguments\b/g,
        message: "arguments object is deprecated, use rest parameters",
        alternative: "Use ...args rest parameter syntax"
      },
      {
        pattern: /==\s*\w+|\w+\s*==/g,
        message: "== can cause type coercion issues",
        alternative: "Use === for strict equality"
      },
      {
        pattern: /!=\s*\w+|\w+\s*!=/g,
        message: "!= can cause type coercion issues",
        alternative: "Use !== for strict inequality"
      },
      {
        pattern: /typeof\s+\w+\s*===\s*['"]undefined['"]/g,
        message: "typeof undefined check is verbose",
        alternative: "Use === undefined or optional chaining"
      },
      {
        pattern: /for\s*\(\s*var\s+/g,
        message: "var in for loops can cause scope issues",
        alternative: "Use let in for loops"
      },
      {
        pattern: /with\s*\(/g,
        message: "with statement is deprecated and dangerous",
        alternative: "Use explicit variable references"
      },
      {
        pattern: /eval\s*\(/g,
        message: "eval() is dangerous and should be avoided",
        alternative: "Use safer alternatives or refactor code"
      },
      {
        pattern: /new\s+Function\s*\(/g,
        message: "new Function() is dangerous",
        alternative: "Use function declarations or arrow functions"
      },
      {
        pattern: /setTimeout\s*\(\s*['"]/g,
        message: "setTimeout with string is dangerous",
        alternative: "Use function references instead of strings"
      },
      {
        pattern: /setInterval\s*\(\s*['"]/g,
        message: "setInterval with string is dangerous",
        alternative: "Use function references instead of strings"
      },
      {
        pattern: /setImmediate\s*\(\s*['"]/g,
        message: "setImmediate with string is dangerous",
        alternative: "Use function references instead of strings"
      },
      {
        pattern: /process\.nextTick\s*\(\s*['"]/g,
        message: "process.nextTick with string is dangerous",
        alternative: "Use function references instead of strings"
      },
      {
        pattern: /require\s*\(\s*['"]/g,
        message: "Dynamic require() can be dangerous",
        alternative: "Use static imports or proper module loading"
      },
      {
        pattern: /import\s*\(\s*['"]/g,
        message: "Dynamic import() can be dangerous",
        alternative: "Use static imports or proper module loading"
      },
      {
        pattern: /new\s+RegExp\s*\(\s*['"]/g,
        message: "new RegExp() with user input is dangerous",
        alternative: "Use literal regex or sanitize input"
      },
      {
        pattern: /RegExp\s*\(\s*['"]/g,
        message: "RegExp() with user input is dangerous",
        alternative: "Use literal regex or sanitize input"
      },
      {
        pattern: /JSON\.parse\s*\(\s*['"]/g,
        message: "JSON.parse() with untrusted data is dangerous",
        alternative: "Validate and sanitize input before parsing"
      },
      {
        pattern: /JSON\.stringify\s*\(/g,
        message: "JSON.stringify() can expose sensitive data",
        alternative: "Filter sensitive properties before stringifying"
      },
      {
        pattern: /XMLHttpRequest/g,
        message: "XMLHttpRequest is deprecated, use fetch()",
        alternative: "Use fetch() API or axios library"
      },
      {
        pattern: /ActiveXObject/g,
        message: "ActiveXObject is deprecated and insecure",
        alternative: "Use modern alternatives"
      },
      {
        pattern: /attachEvent/g,
        message: "attachEvent is deprecated, use addEventListener",
        alternative: "Use addEventListener() method"
      },
      {
        pattern: /detachEvent/g,
        message: "detachEvent is deprecated, use removeEventListener",
        alternative: "Use removeEventListener() method"
      },
      {
        pattern: /document\.write\s*\(/g,
        message: "document.write() is deprecated and dangerous",
        alternative: "Use DOM manipulation methods"
      },
      {
        pattern: /innerHTML\s*=/g,
        message: "innerHTML assignment can be dangerous",
        alternative: "Use textContent or proper DOM methods"
      },
      {
        pattern: /outerHTML\s*=/g,
        message: "outerHTML assignment can be dangerous",
        alternative: "Use proper DOM manipulation methods"
      },
      {
        pattern: /alert\s*\(/g,
        message: "alert() should not be used in production",
        alternative: "Use proper user interface components or logging"
      },
      {
        pattern: /confirm\s*\(/g,
        message: "confirm() should not be used in production",
        alternative: "Use proper user interface components"
      },
      {
        pattern: /prompt\s*\(/g,
        message: "prompt() should not be used in production",
        alternative: "Use proper user interface components"
      },
      {
        pattern: /debugger\b/g,
        message: "debugger statement should be removed in production",
        alternative: "Remove debugger statements or use proper debugging tools"
      },
      {
        pattern: /console\.(log|warn|error|info|debug|trace|dir|table|time|timeEnd|count|countReset|group|groupEnd|groupCollapsed|assert|clear|profile|profileEnd|timeStamp|markTimeline|timeline|timelineEnd|memory|exception)\s*\(/g,
        message: "console methods should be removed in production",
        alternative: "Use proper logging library or remove debug statements"
      }
    ];
    
    for (const pattern of jsPatterns) {
      try {
        const regex = new RegExp(pattern.pattern.source, 'g');
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
            pattern: pattern.pattern.source,
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
 * Analyze Python-specific patterns
 * @param file File to analyze
 * @param language Language context
 * @returns Array of pattern findings
 */
function analyzePythonPatterns(
  file: { path?: string; name?: string; content: string },
  language: Language
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
    
    // Check for common Python issues
    const pyPatterns = [
      {
        pattern: /urllib2\.|urllib\.request/g,
        message: "urllib2 is deprecated in Python 3, use urllib.request",
        alternative: "Use urllib.request or requests library"
      },
      {
        pattern: /execfile\s*\(/g,
        message: "execfile() is deprecated in Python 3",
        alternative: "Use exec(open(filename).read())"
      },
      {
        pattern: /reload\s*\(/g,
        message: "reload() is deprecated, use importlib.reload()",
        alternative: "Use importlib.reload(module)"
      },
      {
        pattern: /file\s*\(/g,
        message: "file() is deprecated, use open()",
        alternative: "Use open() function instead"
      },
      {
        pattern: /raw_input\s*\(/g,
        message: "raw_input() is deprecated in Python 3, use input()",
        alternative: "Use input() function"
      },
      {
        pattern: /xrange\s*\(/g,
        message: "xrange() is deprecated in Python 3, use range()",
        alternative: "Use range() function"
      },
      {
        pattern: /basestring/g,
        message: "basestring is deprecated in Python 3",
        alternative: "Use str or bytes directly"
      },
      {
        pattern: /unicode\s*\(/g,
        message: "unicode() is deprecated in Python 3",
        alternative: "Use str() function"
      },
      {
        pattern: /long\s*\(/g,
        message: "long() is deprecated in Python 3",
        alternative: "Use int() function"
      },
      {
        pattern: /cmp\s*\(/g,
        message: "cmp() is deprecated in Python 3",
        alternative: "Use (a > b) - (a < b) or operator functions"
      },
      {
        pattern: /reduce\s*\(/g,
        message: "reduce() is deprecated, use functools.reduce()",
        alternative: "Import and use functools.reduce()"
      },
      {
        pattern: /apply\s*\(/g,
        message: "apply() is deprecated in Python 3",
        alternative: "Use function(*args, **kwargs) syntax"
      },
      {
        pattern: /coerce\s*\(/g,
        message: "coerce() is deprecated in Python 3",
        alternative: "Use explicit type conversion"
      },
      {
        pattern: /intern\s*\(/g,
        message: "intern() is deprecated in Python 3",
        alternative: "Use sys.intern() if needed"
      },
      {
        pattern: /unichr\s*\(/g,
        message: "unichr() is deprecated in Python 3",
        alternative: "Use chr() function"
      },
      {
        pattern: /buffer\s*\(/g,
        message: "buffer() is deprecated in Python 3",
        alternative: "Use memoryview() or bytes()"
      },
      {
        pattern: /StandardError/g,
        message: "StandardError is deprecated in Python 3",
        alternative: "Use Exception or specific exception types"
      },
      {
        pattern: /exec\s+\w+\s+in\s+\w+/g,
        message: "exec with 'in' syntax is deprecated",
        alternative: "Use exec(code, globals, locals) syntax"
      },
      {
        pattern: /print\s+\w+/g,
        message: "print statement is deprecated in Python 3",
        alternative: "Use print() function"
      },
      {
        pattern: /raise\s+\w+,\s+\w+/g,
        message: "raise with comma syntax is deprecated",
        alternative: "Use raise Exception('message') syntax"
      },
      {
        pattern: /except\s+\w+,\s+\w+/g,
        message: "except with comma syntax is deprecated",
        alternative: "Use except Exception as e: syntax"
      },
      {
        pattern: /def\s+\w+\s*\([^)]*\):/g,
        message: "Check for Python 2 style function definitions",
        alternative: "Ensure Python 3 compatibility"
      },
      {
        pattern: /from\s+\w+\s+import\s+\*/g,
        message: "Wildcard imports are discouraged",
        alternative: "Import specific functions or use qualified names"
      },
      {
        pattern: /eval\s*\(/g,
        message: "eval() is dangerous and should be avoided",
        alternative: "Use safer alternatives like ast.literal_eval()"
      },
      {
        pattern: /exec\s*\(/g,
        message: "exec() is dangerous and should be avoided",
        alternative: "Use safer alternatives or refactor code"
      },
      {
        pattern: /subprocess\.call.*shell=True/g,
        message: "shell=True in subprocess is dangerous",
        alternative: "Use shell=False and pass arguments as list"
      },
      {
        pattern: /os\.system\s*\(/g,
        message: "os.system() is deprecated, use subprocess",
        alternative: "Use subprocess.run() or subprocess.Popen()"
      },
      {
        pattern: /pickle\.loads\s*\(/g,
        message: "pickle.loads() is unsafe with untrusted data",
        alternative: "Use json.loads() or other safe serialization"
      },
      {
        pattern: /pickle\.load\s*\(/g,
        message: "pickle.load() is unsafe with untrusted data",
        alternative: "Use json.load() or other safe serialization"
      },
      {
        pattern: /md5\.|sha1\./g,
        message: "MD5 and SHA1 are cryptographically broken",
        alternative: "Use hashlib.sha256() or hashlib.sha3_256()"
      },
      {
        pattern: /random\.random\s*\(/g,
        message: "random.random() is not cryptographically secure",
        alternative: "Use secrets module for cryptographic randomness"
      },
      {
        pattern: /time\.time\s*\(/g,
        message: "time.time() is not suitable for timing attacks",
        alternative: "Use time.perf_counter() for timing"
      },
      {
        pattern: /class\s+\w+.*:/g,
        message: "Check for old-style class definitions",
        alternative: "Ensure all classes inherit from object or use new-style classes"
      },
      {
        pattern: /def\s+\w+\s*\(self,\s*[^)]*\):/g,
        message: "Check for Python 2 style method definitions",
        alternative: "Ensure Python 3 compatibility"
      },
      {
        pattern: /import\s+\w+\s*$/g,
        message: "Check for Python 2 style imports",
        alternative: "Ensure Python 3 compatibility"
      }
    ];
    
    for (const pattern of pyPatterns) {
      try {
        const regex = new RegExp(pattern.pattern.source, 'g');
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
            pattern: pattern.pattern.source,
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
