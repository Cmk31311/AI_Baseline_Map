'use client';

import React from 'react';
import { ReportSummary, Language } from '../../../lib/analysis/baseline.types';

interface SummaryCardsProps {
  summary: ReportSummary;
  isLoading?: boolean;
}

export function SummaryCards({ summary, isLoading = false }: SummaryCardsProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-white rounded-lg shadow p-6 animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
            <div className="h-8 bg-gray-200 rounded w-1/2"></div>
          </div>
        ))}
      </div>
    );
  }

  const total = summary.ok + summary.affected + summary.unknown;
  const okPercentage = total > 0 ? Math.round((summary.ok / total) * 100) : 0;
  const affectedPercentage = total > 0 ? Math.round((summary.affected / total) * 100) : 0;
  const unknownPercentage = total > 0 ? Math.round((summary.unknown / total) * 100) : 0;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      {/* OK Card */}
      <div className="bg-white rounded-lg shadow p-6 border-l-4 border-green-500">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">✅ OK</p>
            <p className="text-3xl font-bold text-green-600">{summary.ok}</p>
            <p className="text-sm text-gray-500">{okPercentage}% of total</p>
          </div>
          <div className="text-green-500">
            <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
          </div>
        </div>
      </div>

      {/* Affected Card */}
      <div className="bg-white rounded-lg shadow p-6 border-l-4 border-yellow-500">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">⚠️ Affected</p>
            <p className="text-3xl font-bold text-yellow-600">{summary.affected}</p>
            <p className="text-sm text-gray-500">{affectedPercentage}% of total</p>
          </div>
          <div className="text-yellow-500">
            <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          </div>
        </div>
      </div>

      {/* Unknown Card */}
      <div className="bg-white rounded-lg shadow p-6 border-l-4 border-gray-500">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">❓ Unknown</p>
            <p className="text-3xl font-bold text-gray-600">{summary.unknown}</p>
            <p className="text-sm text-gray-500">{unknownPercentage}% of total</p>
          </div>
          <div className="text-gray-500">
            <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
}

interface LanguageBreakdownProps {
  summary: ReportSummary;
  isLoading?: boolean;
}

export function LanguageBreakdown({ summary, isLoading = false }: LanguageBreakdownProps) {
  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow p-6 mb-8">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Language Breakdown</h3>
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
              <div className="h-2 bg-gray-200 rounded"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  const languages = Object.entries(summary.byLanguage) as [Language, { ok: number; affected: number; unknown: number }][];

  if (languages.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-6 mb-8">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Language Breakdown</h3>
        <p className="text-gray-500">No language-specific data available</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow p-6 mb-8">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Language Breakdown</h3>
      <div className="space-y-4">
        {languages.map(([language, stats]) => {
          const total = stats.ok + stats.affected + stats.unknown;
          const okPercentage = total > 0 ? Math.round((stats.ok / total) * 100) : 0;
          const affectedPercentage = total > 0 ? Math.round((stats.affected / total) * 100) : 0;
          const unknownPercentage = total > 0 ? Math.round((stats.unknown / total) * 100) : 0;

          return (
            <div key={language} className="border-b border-gray-200 pb-4 last:border-b-0 last:pb-0">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-medium text-gray-900 capitalize">{language}</h4>
                <span className="text-sm text-gray-500">{total} total</span>
              </div>
              
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div className="text-center">
                  <div className="text-green-600 font-semibold">{stats.ok}</div>
                  <div className="text-gray-500">OK ({okPercentage}%)</div>
                </div>
                <div className="text-center">
                  <div className="text-yellow-600 font-semibold">{stats.affected}</div>
                  <div className="text-gray-500">Affected ({affectedPercentage}%)</div>
                </div>
                <div className="text-center">
                  <div className="text-gray-600 font-semibold">{stats.unknown}</div>
                  <div className="text-gray-500">Unknown ({unknownPercentage}%)</div>
                </div>
              </div>
              
              {/* Progress bar */}
              <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
                <div className="flex h-2 rounded-full">
                  {stats.ok > 0 && (
                    <div 
                      className="bg-green-500 h-2 rounded-l-full" 
                      style={{ width: `${okPercentage}%` }}
                    ></div>
                  )}
                  {stats.affected > 0 && (
                    <div 
                      className="bg-yellow-500 h-2" 
                      style={{ width: `${affectedPercentage}%` }}
                    ></div>
                  )}
                  {stats.unknown > 0 && (
                    <div 
                      className="bg-gray-500 h-2 rounded-r-full" 
                      style={{ width: `${unknownPercentage}%` }}
                    ></div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
