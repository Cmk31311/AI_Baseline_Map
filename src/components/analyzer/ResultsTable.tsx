'use client';

import React, { useState, useMemo } from 'react';
import { Finding, isDependencyFinding, isPatternFinding } from '../../../lib/analysis/baseline.types';

interface ResultsTableProps {
  findings: Finding[];
  isLoading?: boolean;
}

type SortField = 'kind' | 'language' | 'component' | 'file' | 'status' | 'reason';
type SortDirection = 'asc' | 'desc';

export function ResultsTable({ findings, isLoading = false }: ResultsTableProps) {
  const [sortField, setSortField] = useState<SortField>('status');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');

  const sortedFindings = useMemo(() => {
    return [...findings].sort((a, b) => {
      let aValue: string | number;
      let bValue: string | number;

      switch (sortField) {
        case 'kind':
          aValue = a.kind;
          bValue = b.kind;
          break;
        case 'language':
          aValue = a.lang;
          bValue = b.lang;
          break;
        case 'component':
          aValue = isDependencyFinding(a) ? a.component : '';
          bValue = isDependencyFinding(b) ? b.component : '';
          break;
        case 'file':
          aValue = a.file;
          bValue = b.file;
          break;
        case 'status':
          aValue = a.status;
          bValue = b.status;
          break;
        case 'reason':
          aValue = isDependencyFinding(a) ? a.reason : a.issue;
          bValue = isDependencyFinding(b) ? b.reason : b.issue;
          break;
        default:
          return 0;
      }

      if (typeof aValue === 'string' && typeof bValue === 'string') {
        const comparison = aValue.localeCompare(bValue);
        return sortDirection === 'asc' ? comparison : -comparison;
      }

      if (typeof aValue === 'number' && typeof bValue === 'number') {
        return sortDirection === 'asc' ? aValue - bValue : bValue - aValue;
      }

      return 0;
    });
  }, [findings, sortField, sortDirection]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const getSortIcon = (field: SortField) => {
    if (sortField !== field) {
      return (
        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
        </svg>
      );
    }

    return sortDirection === 'asc' ? (
      <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
      </svg>
    ) : (
      <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
      </svg>
    );
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Analysis Results</h3>
        </div>
        <div className="p-6">
          <div className="animate-pulse space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-16 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (findings.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Analysis Results</h3>
        </div>
        <div className="p-6 text-center">
          <div className="text-gray-500">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">No findings</h3>
            <p className="mt-1 text-sm text-gray-500">No baseline compatibility issues found.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900">Analysis Results</h3>
        <p className="text-sm text-gray-600 mt-1">{findings.length} findings</p>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('kind')}
              >
                <div className="flex items-center space-x-1">
                  <span>Kind</span>
                  {getSortIcon('kind')}
                </div>
              </th>
              <th
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('language')}
              >
                <div className="flex items-center space-x-1">
                  <span>Language</span>
                  {getSortIcon('language')}
                </div>
              </th>
              <th
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('component')}
              >
                <div className="flex items-center space-x-1">
                  <span>Component</span>
                  {getSortIcon('component')}
                </div>
              </th>
              <th
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('file')}
              >
                <div className="flex items-center space-x-1">
                  <span>File</span>
                  {getSortIcon('file')}
                </div>
              </th>
              <th
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('status')}
              >
                <div className="flex items-center space-x-1">
                  <span>Status</span>
                  {getSortIcon('status')}
                </div>
              </th>
              <th
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('reason')}
              >
                <div className="flex items-center space-x-1">
                  <span>Reason</span>
                  {getSortIcon('reason')}
                </div>
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Quick Fix
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {sortedFindings.map((finding, index) => (
              <tr key={index} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    finding.kind === 'dependency' 
                      ? 'bg-blue-100 text-blue-800' 
                      : 'bg-purple-100 text-purple-800'
                  }`}>
                    {finding.kind === 'dependency' ? '📦 Dependency' : '🔍 Pattern'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 capitalize">
                  {finding.lang}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {isDependencyFinding(finding) ? (
                    <div>
                      <div className="font-medium">{finding.component}</div>
                      {finding.foundVersion && (
                        <div className="text-xs text-gray-500">
                          Found: {finding.foundVersion}
                          {finding.baselineRequired && (
                            <span> | Required: {finding.baselineRequired}</span>
                          )}
                        </div>
                      )}
                    </div>
                  ) : (
                    <span className="text-gray-400">—</span>
                  )}
                </td>
                <td className="px-6 py-4 text-sm text-gray-900">
                  <div className="max-w-xs truncate" title={finding.file}>
                    {finding.file}
                  </div>
                  {isPatternFinding(finding) && (
                    <div className="text-xs text-gray-500">Line {finding.line}</div>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    finding.status === 'ok' 
                      ? 'bg-green-100 text-green-800'
                      : finding.status === 'affected'
                      ? 'bg-yellow-100 text-yellow-800'
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {finding.status === 'ok' ? '✅ OK' : finding.status === 'affected' ? '⚠️ Affected' : '❓ Unknown'}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm text-gray-900">
                  <div className="max-w-xs">
                    {isDependencyFinding(finding) ? finding.reason : finding.issue}
                  </div>
                </td>
                <td className="px-6 py-4 text-sm text-gray-900">
                  {finding.quickFix ? (
                    <div className="max-w-xs">
                      <span className="text-blue-600">{finding.quickFix}</span>
                    </div>
                  ) : (
                    <span className="text-gray-400">—</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
