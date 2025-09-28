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
          <div key={i} className="bg-slate-800/80 backdrop-blur-sm rounded-2xl shadow-lg p-6 animate-pulse">
            <div className="h-4 bg-slate-700 rounded w-3/4 mb-2"></div>
            <div className="h-8 bg-slate-700 rounded w-1/2"></div>
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
      <div className="bg-slate-800/80 backdrop-blur-sm rounded-2xl shadow-lg p-6 border border-green-600/50 hover:shadow-xl transition-all duration-300 transform hover:scale-105">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold text-slate-300 mb-2">✅ OK</p>
            <p className="text-4xl font-bold text-green-400 mb-1">{summary.ok}</p>
            <p className="text-sm text-slate-400">{okPercentage}% of total</p>
          </div>
          <div className="w-16 h-16 bg-green-800/50 rounded-2xl flex items-center justify-center">
            <svg className="w-8 h-8 text-green-400" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
          </div>
        </div>
      </div>

      {/* Affected Card */}
      <div className="bg-slate-800/80 backdrop-blur-sm rounded-2xl shadow-lg p-6 border border-yellow-600/50 hover:shadow-xl transition-all duration-300 transform hover:scale-105">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold text-slate-300 mb-2">⚠️ Affected</p>
            <p className="text-4xl font-bold text-yellow-400 mb-1">{summary.affected}</p>
            <p className="text-sm text-slate-400">{affectedPercentage}% of total</p>
          </div>
          <div className="w-16 h-16 bg-yellow-800/50 rounded-2xl flex items-center justify-center">
            <svg className="w-8 h-8 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          </div>
        </div>
      </div>

      {/* Unknown Card */}
      <div className="bg-slate-800/80 backdrop-blur-sm rounded-2xl shadow-lg p-6 border border-slate-600/50 hover:shadow-xl transition-all duration-300 transform hover:scale-105">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold text-slate-300 mb-2">❓ Unknown</p>
            <p className="text-4xl font-bold text-slate-400 mb-1">{summary.unknown}</p>
            <p className="text-sm text-slate-400">{unknownPercentage}% of total</p>
          </div>
          <div className="w-16 h-16 bg-slate-700/50 rounded-2xl flex items-center justify-center">
            <svg className="w-8 h-8 text-slate-400" fill="currentColor" viewBox="0 0 20 20">
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
      <div className="bg-slate-800/80 backdrop-blur-sm rounded-2xl shadow-lg p-6 mb-8">
        <h3 className="text-lg font-semibold text-white mb-4">Language Breakdown</h3>
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="animate-pulse">
              <div className="h-4 bg-slate-700 rounded w-1/4 mb-2"></div>
              <div className="h-2 bg-slate-700 rounded"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  const languages = Object.entries(summary.byLanguage) as [Language, { ok: number; affected: number; unknown: number }][];

  if (languages.length === 0) {
    return (
      <div className="bg-slate-800/80 backdrop-blur-sm rounded-2xl shadow-lg p-6 mb-8">
        <h3 className="text-lg font-semibold text-white mb-4">Language Breakdown</h3>
        <p className="text-slate-400">No language-specific data available</p>
      </div>
    );
  }

  return (
    <div className="bg-slate-800/80 backdrop-blur-sm rounded-2xl shadow-lg p-6 mb-8 border border-slate-600/50">
      <h3 className="text-xl font-bold text-white mb-6 flex items-center">
        <svg className="w-6 h-6 mr-2 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
        Language Breakdown
      </h3>
      <div className="space-y-6">
        {languages.map(([language, stats]) => {
          const total = stats.ok + stats.affected + stats.unknown;
          const okPercentage = total > 0 ? Math.round((stats.ok / total) * 100) : 0;
          const affectedPercentage = total > 0 ? Math.round((stats.affected / total) * 100) : 0;
          const unknownPercentage = total > 0 ? Math.round((stats.unknown / total) * 100) : 0;

          return (
            <div key={language} className="bg-slate-700/50 rounded-xl p-4 border border-slate-600/50">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-semibold text-white capitalize text-lg">{language}</h4>
                <span className="text-sm text-slate-300 bg-slate-600 px-3 py-1 rounded-full">{total} total</span>
              </div>
              
              <div className="grid grid-cols-3 gap-4 text-sm mb-3">
                <div className="text-center bg-green-800/50 rounded-lg p-3">
                  <div className="text-green-400 font-bold text-lg">{stats.ok}</div>
                  <div className="text-slate-300">OK ({okPercentage}%)</div>
                </div>
                <div className="text-center bg-yellow-800/50 rounded-lg p-3">
                  <div className="text-yellow-400 font-bold text-lg">{stats.affected}</div>
                  <div className="text-slate-300">Affected ({affectedPercentage}%)</div>
                </div>
                <div className="text-center bg-slate-600 rounded-lg p-3">
                  <div className="text-slate-300 font-bold text-lg">{stats.unknown}</div>
                  <div className="text-slate-400">Unknown ({unknownPercentage}%)</div>
                </div>
              </div>
              
              {/* Progress bar */}
              <div className="w-full bg-slate-600 rounded-full h-3 overflow-hidden">
                <div className="flex h-3 rounded-full">
                  {stats.ok > 0 && (
                    <div 
                      className="bg-green-500 h-3 rounded-l-full transition-all duration-500" 
                      style={{ width: `${okPercentage}%` }}
                    ></div>
                  )}
                  {stats.affected > 0 && (
                    <div 
                      className="bg-yellow-500 h-3 transition-all duration-500" 
                      style={{ width: `${affectedPercentage}%` }}
                    ></div>
                  )}
                  {stats.unknown > 0 && (
                    <div 
                      className="bg-gray-500 h-3 rounded-r-full transition-all duration-500" 
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
