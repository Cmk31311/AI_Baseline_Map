'use client';

import React from 'react';

interface GroqAnalysisProps {
  analysis: {
    analysis: string;
    filename: string;
    timestamp: string;
  }[];
}

export default function GroqAnalysis({ analysis }: GroqAnalysisProps) {
  if (!analysis || analysis.length === 0) {
    return null;
  }

  return (
    <div className="groq-analysis">
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl shadow-lg p-6 mb-6">
        <h3 className="text-2xl font-bold text-white flex items-center">
          <svg className="w-8 h-8 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
          </svg>
          🤖 AI Baseline Analysis
        </h3>
        <p className="text-blue-100 mt-2">Advanced AI-powered analysis of your web file&apos;s baseline compatibility</p>
      </div>
      
      {analysis.map((result, index) => (
        <div key={index} className="mb-8 p-6 bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-200/50">
          <div className="flex items-center justify-between mb-4 pb-4 border-b border-gray-200/50">
            <h4 className="text-lg font-bold text-gray-900 flex items-center">
              <svg className="w-5 h-5 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              📄 {result.filename}
            </h4>
            <span className="text-xs text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
              {new Date(result.timestamp).toLocaleString()}
            </span>
          </div>
          
          <div 
            className="prose prose-lg max-w-none"
            style={{
              color: '#374151',
              lineHeight: '1.7'
            }}
            dangerouslySetInnerHTML={{
              __html: result.analysis
                .replace(/\n/g, '<br>')
                .replace(/\*\*(.*?)\*\*/g, '<strong class="text-gray-900 font-bold">$1</strong>')
                .replace(/\*(.*?)\*/g, '<em class="text-gray-600 italic">$1</em>')
                .replace(/`(.*?)`/g, '<code class="bg-gray-100 px-2 py-1 rounded-lg text-blue-600 font-mono text-sm">$1</code>')
                .replace(/```([\s\S]*?)```/g, '<pre class="bg-gray-900 p-4 rounded-xl overflow-x-auto my-4"><code class="text-green-400 font-mono text-sm">$1</code></pre>')
                .replace(/\|(.*?)\|/g, (match, content) => {
                  const cells = content.split('|').map((cell: string) => cell.trim());
                  return `<div class="grid grid-cols-${cells.length} gap-2 my-4"><div class="bg-gray-50 p-3 rounded-lg border">${cells.join('</div><div class="bg-gray-50 p-3 rounded-lg border">')}</div></div>`;
                })
                .replace(/## (.*?)(<br>|$)/g, '<h2 class="text-2xl font-bold text-gray-900 mt-8 mb-4 pb-2 border-b border-gray-200">$1</h2>')
                .replace(/### (.*?)(<br>|$)/g, '<h3 class="text-xl font-semibold text-blue-600 mt-6 mb-3">$1</h3>')
                .replace(/^(\d+\.\s.*?)(<br>|$)/gm, '<li class="text-gray-700 mb-2 bg-blue-50 p-3 rounded-lg border-l-4 border-blue-400">$1</li>')
                .replace(/^- (.*?)(<br>|$)/gm, '<li class="text-gray-700 mb-2 flex items-start"><span class="text-blue-500 mr-2">•</span>$1</li>')
            }}
          />
        </div>
      ))}
    </div>
  );
}
