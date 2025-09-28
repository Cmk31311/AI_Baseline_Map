import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ResultsTable } from '../../../src/components/analyzer/ResultsTable';
import { Finding } from '../../../src/lib/analysis/baseline.types';

describe('ResultsTable', () => {
  const mockFindings: Finding[] = [
    {
      kind: 'dependency',
      lang: 'node',
      component: 'react',
      foundVersion: '17.0.0',
      baselineRequired: '18.0.0',
      status: 'affected',
      reason: 'below-baseline',
      file: 'package.json',
      quickFix: 'npm install react@^18.0.0',
    },
    {
      kind: 'pattern',
      lang: 'node',
      file: 'src/App.js',
      line: 42,
      status: 'affected',
      reason: 'deprecated-api',
      issue: 'fs.exists() is deprecated',
      pattern: 'fs\\.exists\\(',
      quickFix: 'Use fs.access() instead',
    },
    {
      kind: 'dependency',
      lang: 'python',
      component: 'numpy',
      foundVersion: '1.22.0',
      baselineRequired: '1.22.0',
      status: 'ok',
      reason: 'meets-baseline',
      file: 'requirements.txt',
    },
  ];

  it('should render findings table', () => {
    render(<ResultsTable findings={mockFindings} />);

    expect(screen.getByText('Analysis Results')).toBeInTheDocument();
    expect(screen.getByText('3 findings')).toBeInTheDocument();
  });

  it('should show loading state', () => {
    render(<ResultsTable findings={[]} isLoading={true} />);

    expect(screen.getByText('Analysis Results')).toBeInTheDocument();
    const skeletons = document.querySelectorAll('.animate-pulse');
    expect(skeletons.length).toBeGreaterThan(0);
  });

  it('should show empty state when no findings', () => {
    render(<ResultsTable findings={[]} />);

    expect(screen.getByText('No findings')).toBeInTheDocument();
    expect(screen.getByText('No baseline compatibility issues found.')).toBeInTheDocument();
  });

  it('should render table headers', () => {
    render(<ResultsTable findings={mockFindings} />);

    expect(screen.getByText('Kind')).toBeInTheDocument();
    expect(screen.getByText('Language')).toBeInTheDocument();
    expect(screen.getByText('Component')).toBeInTheDocument();
    expect(screen.getByText('File')).toBeInTheDocument();
    expect(screen.getByText('Status')).toBeInTheDocument();
    expect(screen.getByText('Reason')).toBeInTheDocument();
    expect(screen.getByText('Quick Fix')).toBeInTheDocument();
  });

  it('should render dependency findings', () => {
    render(<ResultsTable findings={mockFindings} />);

    expect(screen.getAllByText('📦 Dependency')).toHaveLength(2);
    expect(screen.getByText('react')).toBeInTheDocument();
    expect(screen.getByText('Found: 17.0.0')).toBeInTheDocument();
    expect(screen.getByText('Required: 18.0.0')).toBeInTheDocument();
  });

  it('should render pattern findings', () => {
    render(<ResultsTable findings={mockFindings} />);

    expect(screen.getByText('🔍 Pattern')).toBeInTheDocument();
    expect(screen.getByText('src/App.js')).toBeInTheDocument();
    expect(screen.getByText('Line 42')).toBeInTheDocument();
  });

  it('should show status badges', () => {
    render(<ResultsTable findings={mockFindings} />);

    expect(screen.getAllByText('⚠️ Affected')).toHaveLength(2);
    expect(screen.getByText('✅ OK')).toBeInTheDocument();
  });

  it('should show quick fixes', () => {
    render(<ResultsTable findings={mockFindings} />);

    expect(screen.getByText('npm install react@^18.0.0')).toBeInTheDocument();
    expect(screen.getByText('Use fs.access() instead')).toBeInTheDocument();
  });

  it('should handle sorting by clicking headers', () => {
    render(<ResultsTable findings={mockFindings} />);

    const statusHeader = screen.getByText('Status');
    fireEvent.click(statusHeader);

    // Should sort by status (affected first, then ok)
    const rows = screen.getAllByRole('row');
    expect(rows[1]).toHaveTextContent('⚠️ Affected');
  });

  it('should handle sorting by different fields', () => {
    render(<ResultsTable findings={mockFindings} />);

    const languageHeader = screen.getByText('Language');
    fireEvent.click(languageHeader);

    // Should sort by language
    expect(languageHeader).toBeInTheDocument();
  });

  it('should toggle sort direction on same field', () => {
    render(<ResultsTable findings={mockFindings} />);

    const statusHeader = screen.getByText('Status');
    
    // First click - ascending
    fireEvent.click(statusHeader);
    
    // Second click - descending
    fireEvent.click(statusHeader);
    
    expect(statusHeader).toBeInTheDocument();
  });

  it('should show sort icons', () => {
    render(<ResultsTable findings={mockFindings} />);

    const headers = screen.getAllByRole('columnheader');
    const sortIcons = headers.filter(header => 
      header.querySelector('svg')
    );
    
    expect(sortIcons.length).toBeGreaterThan(0);
  });

  it('should truncate long file paths', () => {
    const longPathFinding: Finding = {
      kind: 'dependency',
      lang: 'node',
      component: 'react',
      foundVersion: '17.0.0',
      baselineRequired: '18.0.0',
      status: 'affected',
      reason: 'below-baseline',
      file: '/very/long/path/to/some/deeply/nested/package.json',
    };

    render(<ResultsTable findings={[longPathFinding]} />);

    const fileCell = screen.getByTitle('/very/long/path/to/some/deeply/nested/package.json');
    expect(fileCell).toBeInTheDocument();
  });

  it('should show empty quick fix for findings without quick fixes', () => {
    const findingWithoutQuickFix: Finding = {
      kind: 'dependency',
      lang: 'node',
      component: 'unknown-package',
      foundVersion: '1.0.0',
      baselineRequired: null,
      status: 'unknown',
      reason: 'no-baseline-rule',
      file: 'package.json',
    };

    render(<ResultsTable findings={[findingWithoutQuickFix]} />);

    expect(screen.getByText('—')).toBeInTheDocument();
  });

  it('should handle findings with missing versions', () => {
    const findingWithoutVersion: Finding = {
      kind: 'dependency',
      lang: 'node',
      component: 'react',
      foundVersion: null,
      baselineRequired: '18.0.0',
      status: 'unknown',
      reason: 'version-parse-error',
      file: 'package.json',
    };

    render(<ResultsTable findings={[findingWithoutVersion]} />);

    expect(screen.getByText('react')).toBeInTheDocument();
    expect(screen.getByText('version-parse-error')).toBeInTheDocument();
  });
});
