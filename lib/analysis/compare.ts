import semver from 'semver';
import { Language } from './baseline.types';

export type ComparisonResult = 'greater' | 'equal' | 'less' | 'unknown';

/**
 * Compare two version strings
 * @param version1 First version
 * @param version2 Second version (baseline)
 * @param language Language context for parsing
 * @returns Comparison result
 */
export function compareVersions(
  version1: string,
  version2: string,
  language: Language
): ComparisonResult {
  try {
    const v1 = parseVersion(version1, language);
    const v2 = parseVersion(version2, language);
    
    if (!v1 || !v2) {
      return 'unknown';
    }
    
    // Use semver for Node.js packages
    if (language === 'node') {
      return compareWithSemver(v1, v2);
    }
    
    // Use custom comparison for other languages
    return compareVersionsCustom(v1, v2, language);
  } catch (error) {
    console.warn(`Version comparison failed: ${error}`);
    return 'unknown';
  }
}

/**
 * Compare versions using semver (for Node.js)
 * @param version1 First version
 * @param version2 Second version
 * @returns Comparison result
 */
function compareWithSemver(version1: string, version2: string): ComparisonResult {
  try {
    // Clean versions for semver
    const v1 = cleanVersionForSemver(version1);
    const v2 = cleanVersionForSemver(version2);
    
    if (!semver.valid(v1) || !semver.valid(v2)) {
      return 'unknown';
    }
    
    const result = semver.compare(v1, v2);
    
    if (result > 0) return 'greater';
    if (result < 0) return 'less';
    return 'equal';
  } catch (error) {
    return 'unknown';
  }
}

/**
 * Clean version string for semver parsing
 * @param version Version string
 * @returns Cleaned version
 */
function cleanVersionForSemver(version: string): string {
  // Remove common prefixes and suffixes
  let cleaned = version
    .replace(/^v/, '') // Remove v prefix
    .replace(/^[~^>=<!=]+/, '') // Remove operators
    .trim();
  
  // Handle pre-release versions
  if (cleaned.includes('-')) {
    const parts = cleaned.split('-');
    cleaned = parts[0];
  }
  
  // Handle build metadata
  if (cleaned.includes('+')) {
    const parts = cleaned.split('+');
    cleaned = parts[0];
  }
  
  return cleaned;
}

/**
 * Custom version comparison for non-Node.js languages
 * @param version1 First version
 * @param version2 Second version
 * @param language Language context
 * @returns Comparison result
 */
function compareVersionsCustom(
  version1: string,
  version2: string,
  language: Language
): ComparisonResult {
  try {
    const v1Parts = parseVersionParts(version1, language);
    const v2Parts = parseVersionParts(version2, language);
    
    if (!v1Parts || !v2Parts) {
      return 'unknown';
    }
    
    // Compare major, minor, patch
    for (let i = 0; i < Math.max(v1Parts.length, v2Parts.length); i++) {
      const v1Part = v1Parts[i] || 0;
      const v2Part = v2Parts[i] || 0;
      
      if (v1Part > v2Part) return 'greater';
      if (v1Part < v2Part) return 'less';
    }
    
    return 'equal';
  } catch (error) {
    return 'unknown';
  }
}

/**
 * Parse version into numeric parts
 * @param version Version string
 * @param language Language context
 * @returns Array of numeric parts
 */
function parseVersionParts(version: string, language: Language): number[] | null {
  try {
    // Clean version
    let cleaned = version
      .replace(/^v/, '')
      .replace(/^[~^>=<!=]+/, '')
      .trim();
    
    // Handle different version formats
    if (language === 'python') {
      // Python: 1.2.3, 1.2, 1.2.3a1, 1.2.3b1, 1.2.3rc1
      cleaned = cleaned.replace(/[a-zA-Z].*$/, ''); // Remove pre-release info
    } else if (language === 'java') {
      // Java: 1.8.0, 11, 17.0.1
      cleaned = cleaned.replace(/[a-zA-Z].*$/, ''); // Remove pre-release info
    } else if (language === 'go') {
      // Go: v1.21.0, 1.21.0
      cleaned = cleaned.replace(/[a-zA-Z].*$/, ''); // Remove pre-release info
    } else if (language === 'dotnet') {
      // .NET: 6.0.0, 7.0.0-preview.1
      cleaned = cleaned.replace(/[a-zA-Z].*$/, ''); // Remove pre-release info
    }
    
    // Split by dots and convert to numbers
    const parts = cleaned.split('.').map(part => {
      const num = parseInt(part, 10);
      return isNaN(num) ? 0 : num;
    });
    
    return parts.length > 0 ? parts : null;
  } catch (error) {
    return null;
  }
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
    const rangeMatch = clean.match(/[\[\(]([^,]+),/);
    if (rangeMatch) {
      clean = rangeMatch[1];
    }
  }
  
  return clean;
}

/**
 * Check if a version satisfies a requirement
 * @param version Version to check
 * @param requirement Requirement (e.g., ">=1.0.0", "~1.2.3")
 * @param language Language context
 * @returns True if version satisfies requirement
 */
export function satisfiesRequirement(
  version: string,
  requirement: string,
  language: Language
): boolean {
  try {
    if (language === 'node') {
      // Use semver for Node.js
      const cleanVersion = cleanVersionForSemver(version);
      if (!semver.valid(cleanVersion)) return false;
      
      return semver.satisfies(cleanVersion, requirement);
    }
    
    // Custom logic for other languages
    return satisfiesRequirementCustom(version, requirement, language);
  } catch (error) {
    return false;
  }
}

/**
 * Custom requirement satisfaction check
 * @param version Version to check
 * @param requirement Requirement
 * @param language Language context
 * @returns True if version satisfies requirement
 */
function satisfiesRequirementCustom(
  version: string,
  requirement: string,
  language: Language
): boolean {
  try {
    const cleanVersion = parseVersion(version, language);
    const cleanRequirement = parseVersion(requirement, language);
    
    if (!cleanVersion || !cleanRequirement) return false;
    
    // Extract operator from requirement
    const operatorMatch = requirement.match(/^([~^>=<!=]+)/);
    const operator = operatorMatch ? operatorMatch[1] : '>=';
    
    const comparison = compareVersions(cleanVersion, cleanRequirement, language);
    
    switch (operator) {
      case '>=':
        return comparison === 'greater' || comparison === 'equal';
      case '>':
        return comparison === 'greater';
      case '<=':
        return comparison === 'less' || comparison === 'equal';
      case '<':
        return comparison === 'less';
      case '=':
      case '==':
        return comparison === 'equal';
      case '~':
        // Tilde: allow patch-level changes
        return satisfiesTilde(cleanVersion, cleanRequirement, language);
      case '^':
        // Caret: allow minor-level changes
        return satisfiesCaret(cleanVersion, cleanRequirement, language);
      default:
        return comparison === 'equal';
    }
  } catch (error) {
    return false;
  }
}

/**
 * Check if version satisfies tilde requirement
 * @param version Version to check
 * @param requirement Requirement
 * @param language Language context
 * @returns True if satisfies
 */
function satisfiesTilde(
  version: string,
  requirement: string,
  language: Language
): boolean {
  const vParts = parseVersionParts(version, language);
  const rParts = parseVersionParts(requirement, language);
  
  if (!vParts || !rParts) return false;
  
  // Major and minor must match, patch can be higher
  if (vParts[0] !== rParts[0]) return false;
  if (vParts[1] !== rParts[1]) return false;
  
  return vParts[2] >= (rParts[2] || 0);
}

/**
 * Check if version satisfies caret requirement
 * @param version Version to check
 * @param requirement Requirement
 * @param language Language context
 * @returns True if satisfies
 */
function satisfiesCaret(
  version: string,
  requirement: string,
  language: Language
): boolean {
  const vParts = parseVersionParts(version, language);
  const rParts = parseVersionParts(requirement, language);
  
  if (!vParts || !rParts) return false;
  
  // Major must match, minor and patch can be higher
  if (vParts[0] !== rParts[0]) return false;
  
  return vParts[1] > (rParts[1] || 0) || 
         (vParts[1] === (rParts[1] || 0) && vParts[2] >= (rParts[2] || 0));
}

/**
 * Get version difference description
 * @param version1 First version
 * @param version2 Second version
 * @param language Language context
 * @returns Description of difference
 */
export function getVersionDifference(
  version1: string,
  version2: string,
  language: Language
): string {
  const comparison = compareVersions(version1, version2, language);
  
  switch (comparison) {
    case 'greater':
      return `${version1} is newer than ${version2}`;
    case 'less':
      return `${version1} is older than ${version2}`;
    case 'equal':
      return `${version1} matches ${version2}`;
    case 'unknown':
      return `Cannot compare ${version1} with ${version2}`;
    default:
      return 'Unknown comparison';
  }
}

/**
 * Check if a version is a pre-release
 * @param version Version string
 * @param language Language context
 * @returns True if pre-release
 */
export function isPreRelease(version: string, language: Language): boolean {
  const clean = parseVersion(version, language);
  
  // Check for common pre-release indicators
  return /[a-zA-Z]/.test(clean) || 
         clean.includes('-') || 
         clean.includes('alpha') ||
         clean.includes('beta') ||
         clean.includes('rc') ||
         clean.includes('preview');
}

/**
 * Get the latest stable version from a list
 * @param versions Array of version strings
 * @param language Language context
 * @returns Latest stable version or null
 */
export function getLatestStableVersion(
  versions: string[],
  language: Language
): string | null {
  const stableVersions = versions.filter(v => !isPreRelease(v, language));
  
  if (stableVersions.length === 0) return null;
  
  let latest = stableVersions[0];
  
  for (const version of stableVersions) {
    if (compareVersions(version, latest, language) === 'greater') {
      latest = version;
    }
  }
  
  return latest;
}
