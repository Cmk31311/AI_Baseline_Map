import { describe, it, expect } from 'vitest';
import { 
  analyzeDependencies,
  parseVersion,
  isValidVersion,
  normalizePackageName,
  hasBaselineRule,
  getBaselineVersion,
  groupDependenciesByStatus,
  getDependencySummary,
  filterDependenciesByLanguage,
  sortDependencies
} from '../../lib/analysis/deps.js';
import { getDefaultBaselineRules } from '../../lib/analysis/baseline.loader.js';

describe('deps', () => {
  const mockRules = getDefaultBaselineRules();

  describe('analyzeDependencies', () => {
    it('should analyze Node.js dependencies', () => {
      const manifests = [
        {
          language: 'node' as const,
          file: 'package.json',
          dependencies: {
            'react': '17.0.0',
            'next': '13.0.0',
          }
        }
      ];

      const findings = analyzeDependencies(manifests, mockRules);
      
      expect(findings).toHaveLength(2);
      expect(findings[0].kind).toBe('dependency');
      expect(findings[0].lang).toBe('node');
      expect(findings[0].component).toBe('react');
      expect(findings[0].status).toBe('affected');
    });

    it('should handle unknown packages', () => {
      const manifests = [
        {
          language: 'node' as const,
          file: 'package.json',
          dependencies: {
            'unknown-package': '1.0.0',
          }
        }
      ];

      const findings = analyzeDependencies(manifests, mockRules);
      
      expect(findings).toHaveLength(1);
      expect(findings[0].status).toBe('unknown');
      expect(findings[0].reason).toBe('no-baseline-rule');
    });

    it('should handle Python dependencies', () => {
      const manifests = [
        {
          language: 'python' as const,
          file: 'requirements.txt',
          dependencies: {
            'numpy': '1.21.0',
            'pandas': '1.4.0',
          }
        }
      ];

      const findings = analyzeDependencies(manifests, mockRules);
      
      expect(findings).toHaveLength(2);
      expect(findings[0].lang).toBe('python');
    });
  });

  describe('parseVersion', () => {
    it('should parse Node.js versions', () => {
      expect(parseVersion('18.0.0', 'node')).toBe('18.0.0');
      expect(parseVersion('^18.0.0', 'node')).toBe('18.0.0');
      expect(parseVersion('~18.0.0', 'node')).toBe('18.0.0');
    });

    it('should parse Python versions', () => {
      expect(parseVersion('>=1.22.0', 'python')).toBe('1.22.0');
      expect(parseVersion('~=1.22.0', 'python')).toBe('1.22.0');
    });

    it('should handle special cases', () => {
      expect(parseVersion('*', 'node')).toBe('0.0.0');
      expect(parseVersion('latest', 'node')).toBe('0.0.0');
    });
  });

  describe('isValidVersion', () => {
    it('should validate Node.js versions', () => {
      expect(isValidVersion('18.0.0', 'node')).toBe(true);
      expect(isValidVersion('18.0.0-alpha', 'node')).toBe(true);
      expect(isValidVersion('invalid', 'node')).toBe(false);
    });

    it('should validate Python versions', () => {
      expect(isValidVersion('3.10.0', 'python')).toBe(true);
      expect(isValidVersion('3.10.0a1', 'python')).toBe(true);
      expect(isValidVersion('invalid', 'python')).toBe(false);
    });
  });

  describe('normalizePackageName', () => {
    it('should normalize Node.js package names', () => {
      expect(normalizePackageName('React', 'node')).toBe('react');
      expect(normalizePackageName('@types/node', 'node')).toBe('@types/node');
    });

    it('should normalize Python package names', () => {
      expect(normalizePackageName('NumPy', 'python')).toBe('numpy');
      expect(normalizePackageName('pandas', 'python')).toBe('pandas');
    });

    it('should normalize Java package names', () => {
      expect(normalizePackageName('org.springframework:spring-core', 'java')).toBe('org.springframework:spring-core');
    });
  });

  describe('hasBaselineRule', () => {
    it('should check if package has baseline rule', () => {
      expect(hasBaselineRule('react', 'node', mockRules)).toBe(true);
      expect(hasBaselineRule('unknown-package', 'node', mockRules)).toBe(false);
    });
  });

  describe('getBaselineVersion', () => {
    it('should get baseline version for package', () => {
      const version = getBaselineVersion('react', 'node', mockRules);
      expect(version).toBe('>=18.0.0');
    });

    it('should return null for unknown package', () => {
      const version = getBaselineVersion('unknown-package', 'node', mockRules);
      expect(version).toBeNull();
    });
  });

  describe('groupDependenciesByStatus', () => {
    it('should group dependencies by status', () => {
      const findings = [
        {
          kind: 'dependency' as const,
          lang: 'node' as const,
          component: 'react',
          foundVersion: '17.0.0',
          baselineRequired: '18.0.0',
          status: 'affected' as const,
          reason: 'below-baseline',
          file: 'package.json',
        },
        {
          kind: 'dependency' as const,
          lang: 'node' as const,
          component: 'next',
          foundVersion: '13.0.0',
          baselineRequired: '13.0.0',
          status: 'ok' as const,
          reason: 'meets-baseline',
          file: 'package.json',
        }
      ];

      const grouped = groupDependenciesByStatus(findings);
      
      expect(grouped.ok).toHaveLength(1);
      expect(grouped.affected).toHaveLength(1);
      expect(grouped.unknown).toHaveLength(0);
    });
  });

  describe('getDependencySummary', () => {
    it('should calculate dependency summary', () => {
      const findings = [
        {
          kind: 'dependency' as const,
          lang: 'node' as const,
          component: 'react',
          foundVersion: '17.0.0',
          baselineRequired: '18.0.0',
          status: 'affected' as const,
          reason: 'below-baseline',
          file: 'package.json',
        },
        {
          kind: 'dependency' as const,
          lang: 'node' as const,
          component: 'next',
          foundVersion: '13.0.0',
          baselineRequired: '13.0.0',
          status: 'ok' as const,
          reason: 'meets-baseline',
          file: 'package.json',
        }
      ];

      const summary = getDependencySummary(findings);
      
      expect(summary.total).toBe(2);
      expect(summary.ok).toBe(1);
      expect(summary.affected).toBe(1);
      expect(summary.unknown).toBe(0);
      expect(summary.okPercentage).toBe(50);
      expect(summary.affectedPercentage).toBe(50);
    });
  });

  describe('filterDependenciesByLanguage', () => {
    it('should filter dependencies by language', () => {
      const findings = [
        {
          kind: 'dependency' as const,
          lang: 'node' as const,
          component: 'react',
          foundVersion: '17.0.0',
          baselineRequired: '18.0.0',
          status: 'affected' as const,
          reason: 'below-baseline',
          file: 'package.json',
        },
        {
          kind: 'dependency' as const,
          lang: 'python' as const,
          component: 'numpy',
          foundVersion: '1.21.0',
          baselineRequired: '1.22.0',
          status: 'affected' as const,
          reason: 'below-baseline',
          file: 'requirements.txt',
        }
      ];

      const nodeFindings = filterDependenciesByLanguage(findings, 'node');
      const pythonFindings = filterDependenciesByLanguage(findings, 'python');
      
      expect(nodeFindings).toHaveLength(1);
      expect(pythonFindings).toHaveLength(1);
    });
  });

  describe('sortDependencies', () => {
    it('should sort dependencies by status and name', () => {
      const findings = [
        {
          kind: 'dependency' as const,
          lang: 'node' as const,
          component: 'next',
          foundVersion: '13.0.0',
          baselineRequired: '13.0.0',
          status: 'ok' as const,
          reason: 'meets-baseline',
          file: 'package.json',
        },
        {
          kind: 'dependency' as const,
          lang: 'node' as const,
          component: 'react',
          foundVersion: '17.0.0',
          baselineRequired: '18.0.0',
          status: 'affected' as const,
          reason: 'below-baseline',
          file: 'package.json',
        }
      ];

      const sorted = sortDependencies(findings);
      
      expect(sorted[0].status).toBe('affected');
      expect(sorted[1].status).toBe('ok');
    });
  });
});
