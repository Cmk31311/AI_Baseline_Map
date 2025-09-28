'use client';

import React from 'react';
import { Language, Status } from '../../../lib/analysis/baseline.types';

interface FiltersBarProps {
  languageFilter: Language | 'all';
  statusFilter: Status | 'all';
  searchText: string;
  onLanguageChange: (language: Language | 'all') => void;
  onStatusChange: (status: Status | 'all') => void;
  onSearchChange: (text: string) => void;
  onClearFilters: () => void;
  totalFindings: number;
  filteredFindings: number;
}

export function FiltersBar({
  languageFilter,
  statusFilter,
  searchText,
  onLanguageChange,
  onStatusChange,
  onSearchChange,
  onClearFilters,
  totalFindings,
  filteredFindings,
}: FiltersBarProps) {
  const languages: (Language | 'all')[] = ['all', 'python', 'node', 'java', 'go', 'dotnet'];
  const statuses: (Status | 'all')[] = ['all', 'ok', 'affected', 'unknown'];

  const hasActiveFilters = languageFilter !== 'all' || statusFilter !== 'all' || searchText.trim() !== '';

  return (
    <div className="bg-white rounded-lg shadow p-6 mb-6">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 flex-1">
          {/* Language Filter */}
          <div className="flex-1">
            <label htmlFor="language-filter" className="block text-sm font-medium text-gray-700 mb-1">
              Language
            </label>
            <select
              id="language-filter"
              value={languageFilter}
              onChange={(e) => onLanguageChange(e.target.value as Language | 'all')}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              {languages.map((lang) => (
                <option key={lang} value={lang}>
                  {lang === 'all' ? 'All Languages' : lang.charAt(0).toUpperCase() + lang.slice(1)}
                </option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div className="flex-1">
            <label htmlFor="status-filter" className="block text-sm font-medium text-gray-700 mb-1">
              Status
            </label>
            <select
              id="status-filter"
              value={statusFilter}
              onChange={(e) => onStatusChange(e.target.value as Status | 'all')}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              {statuses.map((status) => (
                <option key={status} value={status}>
                  {status === 'all' ? 'All Statuses' : getStatusLabel(status)}
                </option>
              ))}
            </select>
          </div>

          {/* Search */}
          <div className="flex-1">
            <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-1">
              Search
            </label>
            <input
              id="search"
              type="text"
              placeholder="Search by component, file, or reason..."
              value={searchText}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>

        {/* Results and Clear */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
          {/* Results Count */}
          <div className="text-sm text-gray-600">
            {hasActiveFilters ? (
              <span>
                Showing {filteredFindings} of {totalFindings} findings
              </span>
            ) : (
              <span>{totalFindings} findings</span>
            )}
          </div>

          {/* Clear Filters */}
          {hasActiveFilters && (
            <button
              onClick={onClearFilters}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
            >
              Clear Filters
            </button>
          )}
        </div>
      </div>

      {/* Active Filters Display */}
      {hasActiveFilters && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="flex flex-wrap gap-2">
            <span className="text-sm text-gray-600">Active filters:</span>
            
            {languageFilter !== 'all' && (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                Language: {languageFilter}
                <button
                  onClick={() => onLanguageChange('all')}
                  className="ml-1.5 inline-flex items-center justify-center w-4 h-4 rounded-full text-blue-400 hover:bg-blue-200 hover:text-blue-500"
                >
                  <span className="sr-only">Remove</span>
                  <svg className="w-2 h-2" stroke="currentColor" fill="none" viewBox="0 0 8 8">
                    <path strokeLinecap="round" strokeWidth="1.5" d="m1 1 6 6m0-6-6 6" />
                  </svg>
                </button>
              </span>
            )}

            {statusFilter !== 'all' && (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                Status: {getStatusLabel(statusFilter)}
                <button
                  onClick={() => onStatusChange('all')}
                  className="ml-1.5 inline-flex items-center justify-center w-4 h-4 rounded-full text-green-400 hover:bg-green-200 hover:text-green-500"
                >
                  <span className="sr-only">Remove</span>
                  <svg className="w-2 h-2" stroke="currentColor" fill="none" viewBox="0 0 8 8">
                    <path strokeLinecap="round" strokeWidth="1.5" d="m1 1 6 6m0-6-6 6" />
                  </svg>
                </button>
              </span>
            )}

            {searchText.trim() !== '' && (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                Search: "{searchText}"
                <button
                  onClick={() => onSearchChange('')}
                  className="ml-1.5 inline-flex items-center justify-center w-4 h-4 rounded-full text-purple-400 hover:bg-purple-200 hover:text-purple-500"
                >
                  <span className="sr-only">Remove</span>
                  <svg className="w-2 h-2" stroke="currentColor" fill="none" viewBox="0 0 8 8">
                    <path strokeLinecap="round" strokeWidth="1.5" d="m1 1 6 6m0-6-6 6" />
                  </svg>
                </button>
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function getStatusLabel(status: Status): string {
  switch (status) {
    case 'ok':
      return '✅ OK';
    case 'affected':
      return '⚠️ Affected';
    case 'unknown':
      return '❓ Unknown';
    default:
      return status;
  }
}
