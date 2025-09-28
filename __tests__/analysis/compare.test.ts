import { describe, it, expect } from 'vitest';
import { 
  compareVersions, 
  parseVersion, 
  satisfiesRequirement,
  getVersionDifference,
  isPreRelease,
  getLatestStableVersion
} from '../../lib/analysis/compare.js';

describe('compare', () => {
  describe('compareVersions', () => {
    it('should compare Node.js versions correctly', () => {
      expect(compareVersions('18.0.0', '17.0.0', 'node')).toBe('greater');
      expect(compareVersions('17.0.0', '18.0.0', 'node')).toBe('less');
      expect(compareVersions('18.0.0', '18.0.0', 'node')).toBe('equal');
    });

    it('should compare Python versions correctly', () => {
      expect(compareVersions('3.10.0', '3.9.0', 'python')).toBe('greater');
      expect(compareVersions('3.9.0', '3.10.0', 'python')).toBe('less');
      expect(compareVersions('3.10.0', '3.10.0', 'python')).toBe('equal');
    });

    it('should handle version operators', () => {
      expect(compareVersions('>=18.0.0', '17.0.0', 'node')).toBe('greater');
      expect(compareVersions('^18.0.0', '18.0.0', 'node')).toBe('equal');
    });

    it('should return unknown for invalid versions', () => {
      expect(compareVersions('invalid', '18.0.0', 'node')).toBe('unknown');
      expect(compareVersions('18.0.0', 'invalid', 'node')).toBe('unknown');
    });
  });

  describe('parseVersion', () => {
    it('should parse Node.js versions', () => {
      expect(parseVersion('18.0.0', 'node')).toBe('18.0.0');
      expect(parseVersion('^18.0.0', 'node')).toBe('18.0.0');
      expect(parseVersion('~18.0.0', 'node')).toBe('18.0.0');
      expect(parseVersion('>=18.0.0', 'node')).toBe('18.0.0');
    });

    it('should parse Python versions', () => {
      expect(parseVersion('3.10.0', 'python')).toBe('3.10.0');
      expect(parseVersion('>=3.10.0', 'python')).toBe('3.10.0');
      expect(parseVersion('~=3.10.0', 'python')).toBe('3.10.0');
    });

    it('should handle special cases', () => {
      expect(parseVersion('*', 'node')).toBe('0.0.0');
      expect(parseVersion('latest', 'node')).toBe('0.0.0');
      expect(parseVersion('', 'node')).toBe('0.0.0');
    });

    it('should handle Go versions', () => {
      expect(parseVersion('v1.21.0', 'go')).toBe('1.21.0');
      expect(parseVersion('1.21.0+incompatible', 'go')).toBe('1.21.0');
    });

    it('should handle Java version ranges', () => {
      expect(parseVersion('[1.8,2.0)', 'java')).toBe('1.8');
      expect(parseVersion('(1.8,2.0]', 'java')).toBe('1.8');
    });
  });

  describe('satisfiesRequirement', () => {
    it('should check >= requirements', () => {
      expect(satisfiesRequirement('18.0.0', '>=17.0.0', 'node')).toBe(true);
      expect(satisfiesRequirement('16.0.0', '>=17.0.0', 'node')).toBe(false);
    });

    it('should check > requirements', () => {
      expect(satisfiesRequirement('18.0.0', '>17.0.0', 'node')).toBe(true);
      expect(satisfiesRequirement('17.0.0', '>17.0.0', 'node')).toBe(false);
    });

    it('should check <= requirements', () => {
      expect(satisfiesRequirement('17.0.0', '<=18.0.0', 'node')).toBe(true);
      expect(satisfiesRequirement('19.0.0', '<=18.0.0', 'node')).toBe(false);
    });

    it('should check < requirements', () => {
      expect(satisfiesRequirement('17.0.0', '<18.0.0', 'node')).toBe(true);
      expect(satisfiesRequirement('18.0.0', '<18.0.0', 'node')).toBe(false);
    });

    it('should check = requirements', () => {
      expect(satisfiesRequirement('18.0.0', '=18.0.0', 'node')).toBe(true);
      expect(satisfiesRequirement('17.0.0', '=18.0.0', 'node')).toBe(false);
    });

    it('should check ~ requirements (tilde)', () => {
      expect(satisfiesRequirement('18.0.1', '~18.0.0', 'node')).toBe(true);
      expect(satisfiesRequirement('18.1.0', '~18.0.0', 'node')).toBe(false);
    });

    it('should check ^ requirements (caret)', () => {
      expect(satisfiesRequirement('18.1.0', '^18.0.0', 'node')).toBe(true);
      expect(satisfiesRequirement('19.0.0', '^18.0.0', 'node')).toBe(false);
    });
  });

  describe('getVersionDifference', () => {
    it('should describe version differences', () => {
      expect(getVersionDifference('18.0.0', '17.0.0', 'node')).toContain('newer');
      expect(getVersionDifference('17.0.0', '18.0.0', 'node')).toContain('older');
      expect(getVersionDifference('18.0.0', '18.0.0', 'node')).toContain('matches');
    });
  });

  describe('isPreRelease', () => {
    it('should identify pre-release versions', () => {
      expect(isPreRelease('18.0.0-alpha', 'node')).toBe(true);
      expect(isPreRelease('18.0.0-beta', 'node')).toBe(true);
      expect(isPreRelease('18.0.0-rc', 'node')).toBe(true);
      expect(isPreRelease('18.0.0', 'node')).toBe(false);
    });
  });

  describe('getLatestStableVersion', () => {
    it('should return latest stable version', () => {
      const versions = ['18.0.0', '18.0.0-alpha', '17.0.0', '19.0.0-beta'];
      const latest = getLatestStableVersion(versions, 'node');
      
      expect(latest).toBe('18.0.0');
    });

    it('should return null if no stable versions', () => {
      const versions = ['18.0.0-alpha', '17.0.0-beta'];
      const latest = getLatestStableVersion(versions, 'node');
      
      expect(latest).toBeNull();
    });

    it('should return null for empty array', () => {
      const latest = getLatestStableVersion([], 'node');
      
      expect(latest).toBeNull();
    });
  });
});
