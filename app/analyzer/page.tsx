'use client';

import React, { useState, useMemo } from 'react';
import { FileUploader } from '../../src/components/analyzer/FileUploader';
import { SummaryCards, LanguageBreakdown } from '../../src/components/analyzer/SummaryCards';
import { FiltersBar } from '../../src/components/analyzer/FiltersBar';
import { ResultsTable } from '../../src/components/analyzer/ResultsTable';
import GroqAnalysis from '../../src/components/analyzer/GroqAnalysis';
import { Finding, Language, Status, AnalyzeResponse } from '../../lib/analysis/baseline.types';

interface AnalysisState {
  isAnalyzing: boolean;
  report: AnalyzeResponse | null;
  error: string | null;
}

export default function AnalyzerPage() {
  const [analysisState, setAnalysisState] = useState<AnalysisState>({
    isAnalyzing: false,
    report: null,
    error: null,
  });

  const [filters, setFilters] = useState({
    language: 'all' as Language | 'all',
    status: 'all' as Status | 'all',
    searchText: '',
  });

  const [findings, setFindings] = useState<Finding[]>([]);

  // Filter findings based on current filters
  const filteredFindings = useMemo(() => {
    return findings.filter(finding => {
      // Language filter
      if (filters.language !== 'all' && finding.lang !== filters.language) {
        return false;
      }

      // Status filter
      if (filters.status !== 'all' && finding.status !== filters.status) {
        return false;
      }

      // Search text filter
      if (filters.searchText.trim() !== '') {
        const searchLower = filters.searchText.toLowerCase();
        const matchesComponent = finding.kind === 'dependency' && 
          finding.component.toLowerCase().includes(searchLower);
        const matchesFile = finding.file.toLowerCase().includes(searchLower);
        const matchesReason = (finding.kind === 'dependency' ? finding.reason : finding.issue)
          .toLowerCase().includes(searchLower);

        if (!matchesComponent && !matchesFile && !matchesReason) {
          return false;
        }
      }

      return true;
    });
  }, [findings, filters]);

  const handleFileSelect = async (file: File) => {
    setAnalysisState({
      isAnalyzing: true,
      report: null,
      error: null,
    });

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/analyze', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Analysis failed');
      }

      const result: AnalyzeResponse = await response.json();
      
      // Fetch the full report
      const reportResponse = await fetch(result.artifacts.jsonUrl);
      if (!reportResponse.ok) {
        throw new Error('Failed to fetch analysis report');
      }

      const fullReport = await reportResponse.json();
      setFindings(fullReport.findings || []);

      setAnalysisState({
        isAnalyzing: false,
        report: result,
        error: null,
      });
    } catch (error) {
      setAnalysisState({
        isAnalyzing: false,
        report: null,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      });
    }
  };

  const handleLanguageChange = (language: Language | 'all') => {
    setFilters(prev => ({ ...prev, language }));
  };

  const handleStatusChange = (status: Status | 'all') => {
    setFilters(prev => ({ ...prev, status }));
  };

  const handleSearchChange = (searchText: string) => {
    setFilters(prev => ({ ...prev, searchText }));
  };

  const handleClearFilters = () => {
    setFilters({
      language: 'all',
      status: 'all',
      searchText: '',
    });
  };

  const handleDownloadJSON = () => {
    if (analysisState.report?.artifacts.jsonUrl) {
      window.open(analysisState.report.artifacts.jsonUrl, '_blank');
    }
  };

  const handleDownloadCSV = () => {
    if (analysisState.report?.artifacts.csvUrl) {
      window.open(analysisState.report.artifacts.csvUrl, '_blank');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900">
      {/* Header */}
      <div className="bg-slate-800/90 backdrop-blur-sm shadow-lg border-b border-slate-700/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-8">
            <div className="flex items-center space-x-4">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-xl flex items-center justify-center shadow-lg">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white">
                  Baseline Compatibility Analyzer
                </h1>
                <p className="mt-2 text-sm text-slate-300">
                  Upload your web file to analyze baseline compatibility and identify deprecated APIs
                </p>
              </div>
            </div>
            <div className="flex space-x-4">
              <button
                onClick={() => window.location.href = '/'}
                className="inline-flex items-center px-6 py-3 border border-slate-600 rounded-xl shadow-sm text-sm font-medium text-slate-200 bg-slate-700/80 backdrop-blur-sm hover:bg-slate-600 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Back to Baseline Map
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {!analysisState.report && !analysisState.isAnalyzing && (
          <div className="text-center">
            <FileUploader
              onFileSelect={handleFileSelect}
              isUploading={analysisState.isAnalyzing}
            />
          </div>
        )}

        {analysisState.isAnalyzing && (
          <div className="text-center">
            <FileUploader
              onFileSelect={handleFileSelect}
              isUploading={true}
            />
          </div>
        )}

        {analysisState.error && (
          <div className="max-w-2xl mx-auto">
            <div className="bg-red-900/80 backdrop-blur-sm border border-red-700/50 rounded-2xl p-6 shadow-lg">
              <div className="flex">
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 bg-red-800 rounded-full flex items-center justify-center">
                    <svg className="h-6 w-6 text-red-200" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                  </div>
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-semibold text-red-200">Analysis Failed</h3>
                  <div className="mt-2 text-sm text-red-300">
                    <p>{analysisState.error}</p>
                  </div>
                  <div className="mt-4">
                    <button
                      onClick={() => setAnalysisState({ isAnalyzing: false, report: null, error: null })}
                      className="inline-flex items-center px-4 py-2 text-sm font-medium text-red-200 bg-red-800 rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 transition-colors duration-200"
                    >
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                      </svg>
                      Try again
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {analysisState.report && (
          <div className="space-y-8">
            {/* Download Actions */}
            <div className="flex justify-end space-x-4">
              <button
                onClick={handleDownloadJSON}
                className="inline-flex items-center px-6 py-3 border border-slate-600 rounded-xl shadow-sm text-sm font-medium text-slate-200 bg-slate-700/80 backdrop-blur-sm hover:bg-slate-600 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Download JSON
              </button>
              <button
                onClick={handleDownloadCSV}
                className="inline-flex items-center px-6 py-3 border border-slate-600 rounded-xl shadow-sm text-sm font-medium text-slate-200 bg-slate-700/80 backdrop-blur-sm hover:bg-slate-600 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Download CSV
              </button>
            </div>

            {/* Summary Cards */}
            <SummaryCards summary={analysisState.report.summary} />

            {/* Language Breakdown */}
            <LanguageBreakdown summary={analysisState.report.summary} />

            {/* Filters */}
            <FiltersBar
              languageFilter={filters.language}
              statusFilter={filters.status}
              searchText={filters.searchText}
              onLanguageChange={handleLanguageChange}
              onStatusChange={handleStatusChange}
              onSearchChange={handleSearchChange}
              onClearFilters={handleClearFilters}
              totalFindings={findings.length}
              filteredFindings={filteredFindings.length}
            />

            {/* Results Table */}
            <ResultsTable findings={filteredFindings} />

            {/* Groq AI Analysis */}
            {analysisState.report?.report?.metadata?.groqAnalysis && (
              <div className="mt-8">
                <GroqAnalysis analysis={analysisState.report.report.metadata.groqAnalysis} />
              </div>
            )}

            {/* New Analysis Button */}
            <div className="text-center pt-8">
              <button
                onClick={() => {
                  setAnalysisState({ isAnalyzing: false, report: null, error: null });
                  setFindings([]);
                  setFilters({ language: 'all', status: 'all', searchText: '' });
                }}
                className="inline-flex items-center px-8 py-4 border border-transparent text-base font-medium rounded-2xl text-white bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Analyze Another File
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
