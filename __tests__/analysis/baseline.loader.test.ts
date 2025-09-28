import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { 
  loadBaselineRules, 
  getCachedBaselineRules, 
  clearRulesCache,
  isRulesCacheValid,
  getDefaultBaselineRules,
  loadBaselineRulesWithFallback,
  validateRulesStructure,
  getLanguageRules,
  shouldScanFile,
  shouldIgnorePath,
  getDependencyUpgradeTemplate,
  getPatternQuickFix
} from '../../lib/analysis/baseline.loader.js';

describe('baseline.loader', () => {
  beforeEach(() => {
    clearRulesCache();
  });

  afterEach(() => {
    clearRulesCache();
  });

  describe('loadBaselineRules', () => {
    it('should load rules from YAML file', () => {
      const rules = loadBaselineRules();
      
      expect(rules).toBeDefined();
      expect(rules.language_runtimes).toBeDefined();
      expect(rules.package_mins).toBeDefined();
      expect(rules.deprecated_patterns).toBeDefined();
      expect(rules.scan_file_exts).toBeDefined();
      expect(rules.ignore_paths).toBeDefined();
    });

    it('should cache rules after loading', () => {
      loadBaselineRules();
      const cachedRules = getCachedBaselineRules();
      
      expect(cachedRules).toBeDefined();
      expect(cachedRules.language_runtimes).toBeDefined();
    });
  });

  describe('getCachedBaselineRules', () => {
    it('should throw if rules not loaded', () => {
      expect(() => getCachedBaselineRules()).toThrow('Baseline rules not loaded');
    });

    it('should return cached rules after loading', () => {
      loadBaselineRules();
      const cachedRules = getCachedBaselineRules();
      
      expect(cachedRules).toBeDefined();
    });
  });

  describe('clearRulesCache', () => {
    it('should clear the cache', () => {
      loadBaselineRules();
      clearRulesCache();
      
      expect(() => getCachedBaselineRules()).toThrow('Baseline rules not loaded');
    });
  });

  describe('isRulesCacheValid', () => {
    it('should return false if no cache', () => {
      expect(isRulesCacheValid()).toBe(false);
    });

    it('should return true if cache is valid', () => {
      loadBaselineRules();
      expect(isRulesCacheValid()).toBe(true);
    });
  });

  describe('getDefaultBaselineRules', () => {
    it('should return default rules', () => {
      const defaultRules = getDefaultBaselineRules();
      
      expect(defaultRules).toBeDefined();
      expect(defaultRules.language_runtimes).toBeDefined();
      expect(defaultRules.package_mins).toBeDefined();
      expect(defaultRules.deprecated_patterns).toBeDefined();
    });
  });

  describe('loadBaselineRulesWithFallback', () => {
    it('should load rules with fallback', () => {
      const rules = loadBaselineRulesWithFallback();
      
      expect(rules).toBeDefined();
      expect(rules.language_runtimes).toBeDefined();
    });
  });

  describe('validateRulesStructure', () => {
    it('should validate correct rules structure', () => {
      const rules = getDefaultBaselineRules();
      expect(validateRulesStructure(rules)).toBe(true);
    });

    it('should reject invalid rules structure', () => {
      const invalidRules = { invalid: 'structure' };
      expect(validateRulesStructure(invalidRules)).toBe(false);
    });
  });

  describe('getLanguageRules', () => {
    it('should return language-specific rules', () => {
      const rules = getDefaultBaselineRules();
      const nodeRules = getLanguageRules(rules, 'node');
      
      expect(nodeRules).toBeDefined();
      expect(nodeRules.packageMins).toBeDefined();
      expect(nodeRules.deprecatedPatterns).toBeDefined();
      expect(nodeRules.runtime).toBeDefined();
    });
  });

  describe('shouldScanFile', () => {
    it('should return true for supported file extensions', () => {
      const rules = getDefaultBaselineRules();
      
      expect(shouldScanFile(rules, '.js')).toBe(true);
      expect(shouldScanFile(rules, '.py')).toBe(true);
      expect(shouldScanFile(rules, '.ts')).toBe(true);
    });

    it('should return false for unsupported file extensions', () => {
      const rules = getDefaultBaselineRules();
      
      expect(shouldScanFile(rules, '.txt')).toBe(false);
      expect(shouldScanFile(rules, '.md')).toBe(false);
    });
  });

  describe('shouldIgnorePath', () => {
    it('should return true for ignored paths', () => {
      const rules = getDefaultBaselineRules();
      
      expect(shouldIgnorePath(rules, '/node_modules/package')).toBe(true);
      expect(shouldIgnorePath(rules, '/.venv/lib')).toBe(true);
      expect(shouldIgnorePath(rules, '/dist/build')).toBe(true);
    });

    it('should return false for non-ignored paths', () => {
      const rules = getDefaultBaselineRules();
      
      expect(shouldIgnorePath(rules, '/src/components')).toBe(false);
      expect(shouldIgnorePath(rules, '/lib/utils')).toBe(false);
    });
  });

  describe('getDependencyUpgradeTemplate', () => {
    it('should return template for supported language', () => {
      const rules = getDefaultBaselineRules();
      const template = getDependencyUpgradeTemplate(rules, 'node');
      
      expect(template).toBeDefined();
      expect(template).toContain('{package}');
      expect(template).toContain('{version}');
    });

    it('should return fallback for unsupported language', () => {
      const rules = getDefaultBaselineRules();
      const template = getDependencyUpgradeTemplate(rules, 'rust' as any);
      
      expect(template).toBe('Update {package} to {version}');
    });
  });

  describe('getPatternQuickFix', () => {
    it('should return quick fix for known pattern', () => {
      const rules = getDefaultBaselineRules();
      const quickFix = getPatternQuickFix(rules, 'node', 'fs.exists(');
      
      expect(quickFix).toBeDefined();
    });

    it('should return undefined for unknown pattern', () => {
      const rules = getDefaultBaselineRules();
      const quickFix = getPatternQuickFix(rules, 'node', 'unknown.pattern');
      
      expect(quickFix).toBeUndefined();
    });
  });
});
