import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { FiltersBar } from '../../../src/components/analyzer/FiltersBar';

describe('FiltersBar', () => {
  const mockProps = {
    languageFilter: 'all' as const,
    statusFilter: 'all' as const,
    searchText: '',
    onLanguageChange: vi.fn(),
    onStatusChange: vi.fn(),
    onSearchChange: vi.fn(),
    onClearFilters: vi.fn(),
    totalFindings: 100,
    filteredFindings: 100,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render all filter controls', () => {
    render(<FiltersBar {...mockProps} />);

    expect(screen.getByLabelText('Language')).toBeInTheDocument();
    expect(screen.getByLabelText('Status')).toBeInTheDocument();
    expect(screen.getByLabelText('Search')).toBeInTheDocument();
  });

  it('should show total findings count when no filters are active', () => {
    render(<FiltersBar {...mockProps} />);

    expect(screen.getByText('100 findings')).toBeInTheDocument();
  });

  it('should show filtered findings count when filters are active', () => {
    const propsWithFilters = {
      ...mockProps,
      languageFilter: 'node' as const,
      filteredFindings: 50,
    };

    render(<FiltersBar {...propsWithFilters} />);

    expect(screen.getByText('Showing 50 of 100 findings')).toBeInTheDocument();
  });

  it('should call onLanguageChange when language filter changes', () => {
    render(<FiltersBar {...mockProps} />);

    const languageSelect = screen.getByLabelText('Language');
    fireEvent.change(languageSelect, { target: { value: 'node' } });

    expect(mockProps.onLanguageChange).toHaveBeenCalledWith('node');
  });

  it('should call onStatusChange when status filter changes', () => {
    render(<FiltersBar {...mockProps} />);

    const statusSelect = screen.getByLabelText('Status');
    fireEvent.change(statusSelect, { target: { value: 'affected' } });

    expect(mockProps.onStatusChange).toHaveBeenCalledWith('affected');
  });

  it('should call onSearchChange when search text changes', () => {
    render(<FiltersBar {...mockProps} />);

    const searchInput = screen.getByLabelText('Search');
    fireEvent.change(searchInput, { target: { value: 'react' } });

    expect(mockProps.onSearchChange).toHaveBeenCalledWith('react');
  });

  it('should show clear filters button when filters are active', () => {
    const propsWithFilters = {
      ...mockProps,
      languageFilter: 'node' as const,
    };

    render(<FiltersBar {...propsWithFilters} />);

    expect(screen.getByText('Clear Filters')).toBeInTheDocument();
  });

  it('should not show clear filters button when no filters are active', () => {
    render(<FiltersBar {...mockProps} />);

    expect(screen.queryByText('Clear Filters')).not.toBeInTheDocument();
  });

  it('should call onClearFilters when clear button is clicked', () => {
    const propsWithFilters = {
      ...mockProps,
      languageFilter: 'node' as const,
    };

    render(<FiltersBar {...propsWithFilters} />);

    const clearButton = screen.getByText('Clear Filters');
    fireEvent.click(clearButton);

    expect(mockProps.onClearFilters).toHaveBeenCalled();
  });

  it('should show active filters display when filters are active', () => {
    const propsWithFilters = {
      ...mockProps,
      languageFilter: 'node' as const,
      statusFilter: 'affected' as const,
      searchText: 'react',
    };

    render(<FiltersBar {...propsWithFilters} />);

    expect(screen.getByText('Active filters:')).toBeInTheDocument();
    expect(screen.getByText('Language: node')).toBeInTheDocument();
    expect(screen.getByText('Status: ⚠️ Affected')).toBeInTheDocument();
    expect(screen.getByText('Search: "react"')).toBeInTheDocument();
  });

  it('should allow removing individual filters', () => {
    const propsWithFilters = {
      ...mockProps,
      languageFilter: 'node' as const,
    };

    render(<FiltersBar {...propsWithFilters} />);

    const removeLanguageButton = screen.getByRole('button', { name: /remove/i });
    fireEvent.click(removeLanguageButton);

    expect(mockProps.onLanguageChange).toHaveBeenCalledWith('all');
  });

  it('should show correct status labels', () => {
    const propsWithStatus = {
      ...mockProps,
      statusFilter: 'affected' as const,
    };

    render(<FiltersBar {...propsWithStatus} />);

    const statusSelect = screen.getByLabelText('Status') as HTMLSelectElement;
    expect(statusSelect.value).toBe('affected');
  });

  it('should show correct language options', () => {
    render(<FiltersBar {...mockProps} />);

    const languageSelect = screen.getByLabelText('Language') as HTMLSelectElement;
    const options = Array.from(languageSelect.options).map(option => option.value);
    
    expect(options).toContain('all');
    expect(options).toContain('python');
    expect(options).toContain('node');
    expect(options).toContain('java');
    expect(options).toContain('go');
    expect(options).toContain('dotnet');
  });

  it('should show correct status options', () => {
    render(<FiltersBar {...mockProps} />);

    const statusSelect = screen.getByLabelText('Status') as HTMLSelectElement;
    const options = Array.from(statusSelect.options).map(option => option.value);
    
    expect(options).toContain('all');
    expect(options).toContain('ok');
    expect(options).toContain('affected');
    expect(options).toContain('unknown');
  });
});
