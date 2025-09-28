import { describe, it, expect } from 'vitest';
import { 
  validateFinding, 
  validateReport, 
  validateBaselineRules,
  validateAnalyzeResponse,
  isDependencyFinding,
  isPatternFinding,
  getStatusIcon,
  getStatusColor,
  getStatusBadgeClass
} from '../../lib/analysis/baseline.types.js';

describe('baseline.types', () => {
  describe('validateFinding', () => {
    it('should validate a dependency finding', () => {
      const finding = {
        kind: 'dependency',
        lang: 'node',
        component: 'react',
        foundVersion: '17.0.0',
        baselineRequired: '18.0.0',
        status: 'affected',
        reason: 'below-baseline',
        file: 'package.json',
      };

      expect(() => validateFinding(finding)).not.toThrow();
    });

    it('should validate a pattern finding', () => {
      const finding = {
        kind: 'pattern',
        lang: 'node',
        file: 'src/App.js',
        line: 42,
        status: 'affected',
        reason: 'deprecated-api',
        issue: 'fs.exists() is deprecated',
        pattern: 'fs\\.exists\\(',
      };

      expect(() => validateFinding(finding)).not.toThrow();
    });

    it('should throw for invalid finding', () => {
      const invalidFinding = {
        kind: 'invalid',
        lang: 'node',
      };

      expect(() => validateFinding(invalidFinding)).toThrow();
    });
  });

  describe('validateReport', () => {
    it('should validate a complete report', () => {
      const report = {
        findings: [
          {
            kind: 'dependency',
            lang: 'node',
            component: 'react',
            foundVersion: '17.0.0',
            baselineRequired: '18.0.0',
            status: 'affected',
            reason: 'below-baseline',
            file: 'package.json',
          }
        ],
        summary: {
          ok: 0,
          affected: 1,
          unknown: 0,
          byLanguage: {
            node: { ok: 0, affected: 1, unknown: 0 }
          }
        },
        metadata: {
          analysisId: 'test-123',
          timestamp: '2024-01-01T00:00:00Z',
          projectName: 'test-project',
          detectedLanguages: ['node'],
          totalFiles: 10,
          scannedFiles: 8,
          skippedFiles: 2,
        }
      };

      expect(() => validateReport(report)).not.toThrow();
    });
  });

  describe('validateBaselineRules', () => {
    it('should validate baseline rules', () => {
      const rules = {
        language_runtimes: {
          node: '>=18.0.0',
          python: '>=3.10.0',
        },
        package_mins: {
          node: {
            react: '>=18.0.0',
          },
          python: {
            numpy: '>=1.22.0',
          },
        },
        deprecated_patterns: {
          node: [
            {
              pattern: 'fs\\.exists\\(',
              message: 'fs.exists() is deprecated',
              alternative: 'Use fs.access()',
            }
          ],
          python: [],
        },
        scan_file_exts: ['.js', '.py'],
        ignore_paths: ['/node_modules/'],
        max_file_size: 2097152,
        max_files: 50000,
        quick_fixes: {
          dependency_upgrade: {
            node: 'npm install {package}@{version}',
            python: 'pip install \'{package}>={version}\'',
          },
          pattern_replacement: {
            node: {
              'fs.exists(': 'Use fs.access()',
            },
            python: {},
          },
        },
      };

      expect(() => validateBaselineRules(rules)).not.toThrow();
    });
  });

  describe('validateAnalyzeResponse', () => {
    it('should validate analyze response', () => {
      const response = {
        analysisId: 'test-123',
        summary: {
          ok: 0,
          affected: 1,
          unknown: 0,
          byLanguage: {
            node: { ok: 0, affected: 1, unknown: 0 }
          }
        },
        artifacts: {
          jsonUrl: 'http://localhost:3001/api/analyze/test-123?format=json',
          csvUrl: 'http://localhost:3001/api/analyze/test-123?format=csv',
        }
      };

      expect(() => validateAnalyzeResponse(response)).not.toThrow();
    });
  });

  describe('type guards', () => {
    it('should identify dependency findings', () => {
      const dependencyFinding = {
        kind: 'dependency',
        lang: 'node',
        component: 'react',
        foundVersion: '17.0.0',
        baselineRequired: '18.0.0',
        status: 'affected',
        reason: 'below-baseline',
        file: 'package.json',
      };

      expect(isDependencyFinding(dependencyFinding)).toBe(true);
      expect(isPatternFinding(dependencyFinding)).toBe(false);
    });

    it('should identify pattern findings', () => {
      const patternFinding = {
        kind: 'pattern',
        lang: 'node',
        file: 'src/App.js',
        line: 42,
        status: 'affected',
        reason: 'deprecated-api',
        issue: 'fs.exists() is deprecated',
        pattern: 'fs\\.exists\\(',
      };

      expect(isPatternFinding(patternFinding)).toBe(true);
      expect(isDependencyFinding(patternFinding)).toBe(false);
    });
  });

  describe('status helpers', () => {
    it('should return correct status icons', () => {
      expect(getStatusIcon('ok')).toBe('✅');
      expect(getStatusIcon('affected')).toBe('⚠️');
      expect(getStatusIcon('unknown')).toBe('❓');
    });

    it('should return correct status colors', () => {
      expect(getStatusColor('ok')).toBe('text-green-600');
      expect(getStatusColor('affected')).toBe('text-yellow-600');
      expect(getStatusColor('unknown')).toBe('text-gray-600');
    });

    it('should return correct status badge classes', () => {
      expect(getStatusBadgeClass('ok')).toBe('bg-green-100 text-green-800');
      expect(getStatusBadgeClass('affected')).toBe('bg-yellow-100 text-yellow-800');
      expect(getStatusBadgeClass('unknown')).toBe('bg-gray-100 text-gray-800');
    });
  });
});
