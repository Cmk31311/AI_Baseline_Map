import { Language, DependencyFinding, Status } from './baseline.types';
import { BaselineRules } from './baseline.types';
import { compareVersions } from './compare';

/**
 * Analyze dependencies from project manifests
 * @param manifests Array of project manifests
 * @param rules Baseline rules
 * @returns Array of dependency findings
 */
export function analyzeDependencies(
  manifests: Array<{ language: Language; file: string; dependencies?: Record<string, string> }>,
  rules: BaselineRules
): DependencyFinding[] {
  const findings: DependencyFinding[] = [];
  
  for (const manifest of manifests) {
    if (!manifest.dependencies) continue;
    
    const languageRules = rules.package_mins[manifest.language] || {};
    
    for (const [packageName, foundVersion] of Object.entries(manifest.dependencies)) {
      const baselineVersion = languageRules[packageName];
      
      if (!baselineVersion) {
        // No baseline rule for this package
        findings.push({
          kind: 'dependency',
          lang: manifest.language,
          component: packageName,
          foundVersion,
          baselineRequired: null,
          status: 'unknown',
          reason: 'no-baseline-rule',
          file: manifest.file,
        });
        continue;
      }
      
      // Compare versions
      const comparison = compareVersions(foundVersion, baselineVersion, manifest.language);
      
      let status: Status;
      let reason: string;
      
      switch (comparison) {
        case 'greater':
        case 'equal':
          status = 'ok';
          reason = 'meets-baseline';
          break;
        case 'less':
          status = 'affected';
          reason = 'below-baseline';
          break;
        case 'unknown':
          status = 'unknown';
          reason = 'version-parse-error';
          break;
        default:
          status = 'unknown';
          reason = 'unknown-comparison';
      }
      
      findings.push({
        kind: 'dependency',
        lang: manifest.language,
        component: packageName,
        foundVersion,
        baselineRequired: baselineVersion,
        status,
        reason,
        file: manifest.file,
        quickFix: getDependencyQuickFix(rules, manifest.language, packageName, baselineVersion),
      });
    }
  }
  
  return findings;
}

/**
 * Get quick fix for dependency upgrade
 * @param rules Baseline rules
 * @param language Language
 * @param packageName Package name
 * @param version Required version
 * @returns Quick fix string
 */
function getDependencyQuickFix(
  rules: BaselineRules,
  language: Language,
  packageName: string,
  version: string
): string {
  const template = rules.quick_fixes.dependency_upgrade[language] || 'Update {package} to {version}';
  
  return template
    .replace('{package}', packageName)
    .replace('{version}', version);
}

/**
 * Parse version string and extract version number
 * @param versionString Version string (may contain operators)
 * @param language Language context
 * @returns Clean version string
 */
export function parseVersion(versionString: string, language: Language): string {
  if (!versionString || versionString === '*') {
    return '0.0.0';
  }
  
  // Remove common operators and prefixes
  let clean = versionString
    .replace(/^[~^>=<!=]+/, '') // Remove operators
    .replace(/^v/, '') // Remove v prefix
    .trim();
  
  // Handle special cases
  if (clean === 'latest' || clean === '') {
    return '0.0.0';
  }
  
  // Handle Python version specifiers
  if (language === 'python') {
    // Remove Python-specific operators
    clean = clean.replace(/^[~=!<>]+/, '');
  }
  
  // Handle Go version suffixes
  if (language === 'go') {
    // Remove +incompatible, +incompatible.20210101, etc.
    clean = clean.replace(/\+.*$/, '');
  }
  
  // Handle Java version ranges
  if (language === 'java') {
    // Extract version from ranges like [1.0,2.0) or (1.0,2.0]
    const rangeMatch = clean.match(/[[(]([^,]+),/);
    if (rangeMatch) {
      clean = rangeMatch[1];
    }
  }
  
  return clean;
}

/**
 * Check if a version string is valid
 * @param versionString Version string
 * @param language Language context
 * @returns True if valid
 */
export function isValidVersion(versionString: string, language: Language): boolean {
  if (!versionString || versionString === '*') return false;
  
  const clean = parseVersion(versionString, language);
  
  // Basic version pattern validation
  const versionPatterns = {
    node: /^\d+\.\d+\.\d+(-[a-zA-Z0-9.-]+)?(\+[a-zA-Z0-9.-]+)?$/,
    python: /^\d+\.\d+(\.\d+)?([a-zA-Z0-9.-]+)?$/,
    java: /^\d+(\.\d+)*(-[a-zA-Z0-9.-]+)?$/,
    go: /^v?\d+\.\d+\.\d+(-[a-zA-Z0-9.-]+)?(\+[a-zA-Z0-9.-]+)?$/,
    dotnet: /^\d+\.\d+(\.\d+)?(-[a-zA-Z0-9.-]+)?$/,
  };
  
  const pattern = versionPatterns[language];
  return pattern ? pattern.test(clean) : false;
}

/**
 * Normalize package name for comparison
 * @param packageName Package name
 * @param language Language context
 * @returns Normalized package name
 */
export function normalizePackageName(packageName: string, language: Language): string {
  let normalized = packageName.toLowerCase().trim();
  
  // Handle scoped packages (Node.js)
  if (language === 'node' && normalized.startsWith('@')) {
    // Keep @scope/package format
    return normalized;
  }
  
  // Handle Java group:artifact format
  if (language === 'java' && normalized.includes(':')) {
    return normalized;
  }
  
  // Handle Go modules
  if (language === 'go') {
    // Remove common prefixes
    normalized = normalized.replace(/^github\.com\//, '');
    normalized = normalized.replace(/^golang\.org\/x\//, '');
  }
  
  // Handle .NET packages
  if (language === 'dotnet') {
    // Remove common prefixes
    normalized = normalized.replace(/^microsoft\./, '');
    normalized = normalized.replace(/^system\./, '');
  }
  
  return normalized;
}

/**
 * Check if a package is in the baseline rules
 * @param packageName Package name
 * @param language Language
 * @param rules Baseline rules
 * @returns True if package has baseline rules
 */
export function hasBaselineRule(
  packageName: string,
  language: Language,
  rules: BaselineRules
): boolean {
  const languageRules = rules.package_mins[language] || {};
  const normalized = normalizePackageName(packageName, language);
  
  // Check exact match first
  if (languageRules[packageName]) return true;
  if (languageRules[normalized]) return true;
  
  // Check for partial matches (for scoped packages, etc.)
  for (const [rulePackage] of Object.entries(languageRules)) {
    if (normalizePackageName(rulePackage, language) === normalized) {
      return true;
    }
  }
  
  return false;
}

/**
 * Get baseline version for a package
 * @param packageName Package name
 * @param language Language
 * @param rules Baseline rules
 * @returns Baseline version or null
 */
export function getBaselineVersion(
  packageName: string,
  language: Language,
  rules: BaselineRules
): string | null {
  const languageRules = rules.package_mins[language] || {};
  const normalized = normalizePackageName(packageName, language);
  
  // Check exact match first
  if (languageRules[packageName]) return languageRules[packageName];
  if (languageRules[normalized]) return languageRules[normalized];
  
  // Check for partial matches
  for (const [rulePackage, version] of Object.entries(languageRules)) {
    if (normalizePackageName(rulePackage, language) === normalized) {
      return version;
    }
  }
  
  return null;
}

/**
 * Group dependencies by status
 * @param findings Dependency findings
 * @returns Grouped findings
 */
export function groupDependenciesByStatus(findings: DependencyFinding[]) {
  return {
    ok: findings.filter(f => f.status === 'ok'),
    affected: findings.filter(f => f.status === 'affected'),
    unknown: findings.filter(f => f.status === 'unknown'),
  };
}

/**
 * Get dependency summary statistics
 * @param findings Dependency findings
 * @returns Summary statistics
 */
export function getDependencySummary(findings: DependencyFinding[]) {
  const total = findings.length;
  const ok = findings.filter(f => f.status === 'ok').length;
  const affected = findings.filter(f => f.status === 'affected').length;
  const unknown = findings.filter(f => f.status === 'unknown').length;
  
  return {
    total,
    ok,
    affected,
    unknown,
    okPercentage: total > 0 ? (ok / total) * 100 : 0,
    affectedPercentage: total > 0 ? (affected / total) * 100 : 0,
    unknownPercentage: total > 0 ? (unknown / total) * 100 : 0,
  };
}

/**
 * Filter dependencies by language
 * @param findings Dependency findings
 * @param language Language to filter by
 * @returns Filtered findings
 */
export function filterDependenciesByLanguage(
  findings: DependencyFinding[],
  language: Language
): DependencyFinding[] {
  return findings.filter(f => f.lang === language);
}

/**
 * Sort dependencies by status and name
 * @param findings Dependency findings
 * @returns Sorted findings
 */
export function sortDependencies(findings: DependencyFinding[]): DependencyFinding[] {
  const statusOrder = { affected: 0, unknown: 1, ok: 2 };
  
  return [...findings].sort((a, b) => {
    // First by status
    const statusDiff = statusOrder[a.status] - statusOrder[b.status];
    if (statusDiff !== 0) return statusDiff;
    
    // Then by language
    const langDiff = a.lang.localeCompare(b.lang);
    if (langDiff !== 0) return langDiff;
    
    // Finally by component name
    return a.component.localeCompare(b.component);
  });
}
