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
      <h3 className="text-lg font-semibold mb-4 text-white">🤖 AI Baseline Analysis</h3>
      
      {analysis.map((result, index) => (
        <div key={index} className="mb-6 p-4 bg-gray-800 rounded-lg border border-gray-700">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-md font-medium text-blue-400">
              📄 {result.filename}
            </h4>
            <span className="text-xs text-gray-400">
              {new Date(result.timestamp).toLocaleString()}
            </span>
          </div>
          
          <div 
            className="prose prose-invert max-w-none"
            style={{
              color: '#e5e7eb',
              lineHeight: '1.6'
            }}
            dangerouslySetInnerHTML={{
              __html: result.analysis
                .replace(/\n/g, '<br>')
                .replace(/\*\*(.*?)\*\*/g, '<strong class="text-white">$1</strong>')
                .replace(/\*(.*?)\*/g, '<em class="text-gray-300">$1</em>')
                .replace(/`(.*?)`/g, '<code class="bg-gray-700 px-1 py-0.5 rounded text-green-400">$1</code>')
                .replace(/```([\s\S]*?)```/g, '<pre class="bg-gray-900 p-3 rounded overflow-x-auto"><code class="text-green-400">$1</code></pre>')
                .replace(/\|(.*?)\|/g, (match, content) => {
                  const cells = content.split('|').map((cell: string) => cell.trim());
                  return `<div class="table-cell border border-gray-600 px-2 py-1">${cells.join('</div><div class="table-cell border border-gray-600 px-2 py-1">')}</div>`;
                })
                .replace(/## (.*?)(<br>|$)/g, '<h2 class="text-xl font-bold text-white mt-6 mb-3">$1</h2>')
                .replace(/### (.*?)(<br>|$)/g, '<h3 class="text-lg font-semibold text-blue-300 mt-4 mb-2">$1</h3>')
                .replace(/^(\d+\.\s.*?)(<br>|$)/gm, '<li class="text-gray-300 mb-1">$1</li>')
                .replace(/^- (.*?)(<br>|$)/gm, '<li class="text-gray-300 mb-1">• $1</li>')
            }}
          />
        </div>
      ))}
    </div>
  );
}
