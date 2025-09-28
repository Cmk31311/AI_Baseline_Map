import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import YAML from 'yaml';
import { BaselineRules, validateBaselineRules } from './baseline.types';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Cache for loaded rules
let rulesCache: BaselineRules | null = null;
let rulesCacheTimestamp: number = 0;

/**
 * Load baseline rules from YAML configuration file
 * @param configPath Optional path to config file, defaults to config/baseline.rules.yaml
 * @returns Parsed and validated baseline rules
 */
export function loadBaselineRules(configPath?: string): BaselineRules {
  const defaultPath = join(__dirname, '../../config/baseline.rules.yaml');
  const path = configPath || defaultPath;
  
  try {
    // Check if we have cached rules and they're still valid
    const stats = require('fs').statSync(path);
    const mtime = stats.mtime.getTime();
    
    if (rulesCache && mtime <= rulesCacheTimestamp) {
      return rulesCache;
    }
    
    // Read and parse YAML file
    const yamlContent = readFileSync(path, 'utf8');
    const rawRules = YAML.parse(yamlContent);
    
    // Validate and parse rules
    const rules = validateBaselineRules(rawRules);
    
    // Update cache
    rulesCache = rules;
    rulesCacheTimestamp = mtime;
    
    return rules;
  } catch (error) {
    throw new Error(`Failed to load baseline rules from ${path}: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Get cached baseline rules without file system access
 * @returns Cached rules or throws if not loaded
 */
export function getCachedBaselineRules(): BaselineRules {
  if (!rulesCache) {
    throw new Error('Baseline rules not loaded. Call loadBaselineRules() first.');
  }
  return rulesCache;
}

/**
 * Clear the rules cache (useful for testing)
 */
export function clearRulesCache(): void {
  rulesCache = null;
  rulesCacheTimestamp = 0;
}

/**
 * Check if rules are cached and up to date
 * @param configPath Optional path to config file
 * @returns True if cached rules are valid
 */
export function isRulesCacheValid(configPath?: string): boolean {
  if (!rulesCache) return false;
  
  try {
    const defaultPath = join(__dirname, '../../config/baseline.rules.yaml');
    const path = configPath || defaultPath;
    const stats = require('fs').statSync(path);
    const mtime = stats.mtime.getTime();
    
    return mtime <= rulesCacheTimestamp;
  } catch {
    return false;
  }
}

/**
 * Get default baseline rules (fallback if file loading fails)
 * @returns Minimal default rules
 */
export function getDefaultBaselineRules(): BaselineRules {
  return {
    language_runtimes: {
      node: '>=18.0.0',
      python: '>=3.10.0',
      java: '>=17.0.0',
      go: '>=1.21.0',
      dotnet: '>=6.0.0',
    },
    package_mins: {
      node: {
        react: '>=18.0.0',
        next: '>=13.0.0',
        express: '>=4.18.0',
      },
      python: {
        numpy: '>=1.22.0',
        pandas: '>=1.4.0',
        torch: '>=2.0.0',
      },
      java: {},
      go: {},
      dotnet: {},
    },
    deprecated_patterns: {
      node: [
        {
          pattern: 'fs\\.exists\\(',
          message: 'fs.exists() is deprecated, use fs.access() or fs.stat()',
          alternative: 'Use fs.access() or fs.promises.access()',
        },
      ],
      python: [
        {
          pattern: 'numpy\\.asscalar',
          message: 'numpy.asscalar is deprecated, use item() instead',
          alternative: 'Use numpy.item() or direct array indexing',
        },
      ],
      java: [],
      go: [],
      dotnet: [],
    },
    scan_file_exts: ['.py', '.js', '.ts', '.tsx', '.jsx', '.java', '.go', '.cs'],
    ignore_paths: ['/node_modules/', '/.venv/', '/venv/', '/dist/', '/build/', '/.git/'],
    max_file_size: 2097152, // 2MB
    max_files: 50000,
    quick_fixes: {
      dependency_upgrade: {
        node: 'npm install {package}@{version}',
        python: 'pip install \'{package}>={version}\'',
        java: 'Update {package} to version {version} in pom.xml or build.gradle',
        go: 'go get {package}@{version}',
        dotnet: 'dotnet add package {package} --version {version}',
      },
      pattern_replacement: {
        node: {
          'fs.exists(': 'Use fs.access() or fs.promises.access()',
        },
        python: {
          'numpy.asscalar': 'Use .item() method instead',
        },
        java: {},
        go: {},
        dotnet: {},
      },
    },
  };
}

/**
 * Load baseline rules with fallback to defaults
 * @param configPath Optional path to config file
 * @returns Baseline rules (loaded or default)
 */
export function loadBaselineRulesWithFallback(configPath?: string): BaselineRules {
  try {
    return loadBaselineRules(configPath);
  } catch (error) {
    console.warn(`Failed to load baseline rules: ${error instanceof Error ? error.message : 'Unknown error'}`);
    console.warn('Using default baseline rules');
    return getDefaultBaselineRules();
  }
}

/**
 * Validate that a rules object has all required fields
 * @param rules Rules object to validate
 * @returns True if valid
 */
export function validateRulesStructure(rules: any): rules is BaselineRules {
  try {
    validateBaselineRules(rules);
    return true;
  } catch {
    return false;
  }
}

/**
 * Get rules for a specific language
 * @param rules Baseline rules
 * @param language Language to get rules for
 * @returns Rules specific to the language
 */
export function getLanguageRules(rules: BaselineRules, language: keyof BaselineRules['package_mins']) {
  return {
    packageMins: rules.package_mins[language] || {},
    deprecatedPatterns: rules.deprecated_patterns[language] || [],
    runtime: rules.language_runtimes[language],
  };
}

/**
 * Check if a file extension should be scanned
 * @param rules Baseline rules
 * @param extension File extension (with or without dot)
 * @returns True if should be scanned
 */
export function shouldScanFile(rules: BaselineRules, extension: string): boolean {
  const ext = extension.startsWith('.') ? extension : `.${extension}`;
  return rules.scan_file_exts.includes(ext);
}

/**
 * Check if a path should be ignored
 * @param rules Baseline rules
 * @param filePath File path to check
 * @returns True if should be ignored
 */
export function shouldIgnorePath(rules: BaselineRules, filePath: string): boolean {
  if (!filePath || !rules.ignore_paths) {
    return false;
  }
  return rules.ignore_paths.some(ignorePath => 
    filePath.includes(ignorePath) || filePath.startsWith(ignorePath)
  );
}

/**
 * Get quick fix template for dependency upgrade
 * @param rules Baseline rules
 * @param language Language
 * @returns Template string
 */
export function getDependencyUpgradeTemplate(rules: BaselineRules, language: keyof BaselineRules['quick_fixes']['dependency_upgrade']): string {
  return rules.quick_fixes.dependency_upgrade[language] || 'Update {package} to {version}';
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
  language: keyof BaselineRules['quick_fixes']['pattern_replacement'], 
  pattern: string
): string | undefined {
  return rules.quick_fixes.pattern_replacement[language]?.[pattern];
}
