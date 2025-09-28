import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { SummaryCards, LanguageBreakdown } from '../../../src/components/analyzer/SummaryCards';
import { ReportSummary } from '../../../src/lib/analysis/baseline.types';

describe('SummaryCards', () => {
  const mockSummary: ReportSummary = {
    ok: 10,
    affected: 5,
    unknown: 2,
    byLanguage: {
      node: { ok: 8, affected: 3, unknown: 1 },
      python: { ok: 2, affected: 2, unknown: 1 },
    },
  };

  describe('SummaryCards', () => {
    it('should render summary cards with correct counts', () => {
      render(<SummaryCards summary={mockSummary} />);

      expect(screen.getByText('✅ OK')).toBeInTheDocument();
      expect(screen.getByText('10')).toBeInTheDocument();
      expect(screen.getByText('⚠️ Affected')).toBeInTheDocument();
      expect(screen.getByText('5')).toBeInTheDocument();
      expect(screen.getByText('❓ Unknown')).toBeInTheDocument();
      expect(screen.getByText('2')).toBeInTheDocument();
    });

    it('should show loading state', () => {
      render(<SummaryCards summary={mockSummary} isLoading={true} />);

      // Check for loading skeletons
      const skeletons = document.querySelectorAll('.animate-pulse');
      expect(skeletons.length).toBeGreaterThan(0);
    });

    it('should calculate percentages correctly', () => {
      render(<SummaryCards summary={mockSummary} />);

      // Total is 17, so percentages should be:
      // OK: 10/17 = 58.8% ≈ 59%
      // Affected: 5/17 = 29.4% ≈ 29%
      // Unknown: 2/17 = 11.8% ≈ 12%

      expect(screen.getByText('59% of total')).toBeInTheDocument();
      expect(screen.getByText('29% of total')).toBeInTheDocument();
      expect(screen.getByText('12% of total')).toBeInTheDocument();
    });

    it('should handle zero totals', () => {
      const zeroSummary: ReportSummary = {
        ok: 0,
        affected: 0,
        unknown: 0,
        byLanguage: {},
      };

      render(<SummaryCards summary={zeroSummary} />);

      expect(screen.getAllByText('0% of total')).toHaveLength(3);
    });
  });

  describe('LanguageBreakdown', () => {
    it('should render language breakdown', () => {
      render(<LanguageBreakdown summary={mockSummary} />);

      expect(screen.getByText('Language Breakdown')).toBeInTheDocument();
      expect(screen.getByText('node')).toBeInTheDocument();
      expect(screen.getByText('python')).toBeInTheDocument();
    });

    it('should show language-specific counts', () => {
      render(<LanguageBreakdown summary={mockSummary} />);

      // Node: 8 + 3 + 1 = 12 total
      expect(screen.getByText('12 total')).toBeInTheDocument();
      
      // Python: 2 + 2 + 1 = 5 total
      const totalElements = screen.getAllByText(/total/);
      expect(totalElements).toHaveLength(2);
    });

    it('should show loading state', () => {
      render(<LanguageBreakdown summary={mockSummary} isLoading={true} />);

      const skeletons = document.querySelectorAll('.animate-pulse');
      expect(skeletons.length).toBeGreaterThan(0);
    });

    it('should handle empty language breakdown', () => {
      const emptySummary: ReportSummary = {
        ok: 0,
        affected: 0,
        unknown: 0,
        byLanguage: {},
      };

      render(<LanguageBreakdown summary={emptySummary} />);

      expect(screen.getByText('No language-specific data available')).toBeInTheDocument();
    });

    it('should calculate language percentages correctly', () => {
      render(<LanguageBreakdown summary={mockSummary} />);

      // Node: 8/12 = 66.7% ≈ 67% OK, 3/12 = 25% Affected, 1/12 = 8.3% ≈ 8% Unknown
      // Python: 2/5 = 40% OK, 2/5 = 40% Affected, 1/5 = 20% Unknown

      expect(screen.getByText('OK (67%)')).toBeInTheDocument();
      expect(screen.getByText('Affected (25%)')).toBeInTheDocument();
      expect(screen.getByText('Unknown (8%)')).toBeInTheDocument();
    });

    it('should render progress bars', () => {
      render(<LanguageBreakdown summary={mockSummary} />);

      const progressBars = document.querySelectorAll('.bg-green-500, .bg-yellow-500, .bg-gray-500');
      expect(progressBars.length).toBeGreaterThan(0);
    });
  });
});
