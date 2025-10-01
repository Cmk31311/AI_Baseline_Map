'use client';

import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';

interface FileUploaderProps {
  onFileSelect: (file: File) => void;
  isUploading: boolean;
  maxSize?: number; // in bytes
  acceptedTypes?: string[];
}

export function FileUploader({ 
  onFileSelect, 
  isUploading, 
  maxSize = 5 * 1024 * 1024, // 5MB
  acceptedTypes = [
    '.html', '.htm',
    '.js', '.mjs', '.ts',
    '.json',
    '.webmanifest',
    '.wasm'
  ]
}: FileUploaderProps) {
  const [dragActive, setDragActive] = useState(false);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      onFileSelect(acceptedFiles[0]);
    }
  }, [onFileSelect]);

  const { getRootProps, getInputProps, isDragReject } = useDropzone({
    onDrop,
    accept: Object.fromEntries(acceptedTypes.map(type => [type, []])) as Record<string, string[]>,
    maxSize,
    multiple: false,
    onDragEnter: () => setDragActive(true),
    onDragLeave: () => setDragActive(false),
  });

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="w-full max-w-3xl mx-auto">
      <div
        {...getRootProps()}
        className={`
          relative border-2 border-dashed rounded-2xl p-12 text-center cursor-pointer transition-all duration-300 transform
          ${isUploading 
            ? 'border-slate-600 bg-slate-800/80 backdrop-blur-sm cursor-not-allowed scale-98' 
            : dragActive 
              ? 'border-blue-400 bg-blue-900/80 backdrop-blur-sm scale-102 shadow-lg' 
              : isDragReject
                ? 'border-red-400 bg-red-900/80 backdrop-blur-sm scale-98'
                : 'border-slate-600 hover:border-blue-400 hover:bg-slate-800/50 hover:shadow-lg hover:scale-101'
          }
        `}
      >
        <input {...getInputProps()} disabled={isUploading} />
        
        {isUploading ? (
          <div className="space-y-6">
            <div className="flex justify-center">
              <div className="relative">
                <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-200"></div>
                <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-600 border-t-transparent absolute top-0 left-0"></div>
              </div>
            </div>
            <div>
              <h3 className="text-xl font-semibold text-white">Analyzing your code...</h3>
              <p className="text-sm text-slate-300 mt-2">
                This may take a few moments depending on the size of your file.
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Upload Icon */}
            <div className="flex justify-center">
              <div className={`w-20 h-20 rounded-full flex items-center justify-center transition-all duration-300 ${
                dragActive ? 'bg-blue-800 text-blue-200' : 'bg-slate-700 text-slate-400'
              }`}>
                <svg 
                  className="w-10 h-10" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2} 
                    d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" 
                  />
                </svg>
              </div>
            </div>

            {/* Upload Text */}
            <div>
              <h3 className="text-2xl font-bold text-white">
                Upload your web file
              </h3>
              <p className="text-lg text-slate-300 mt-2">
                Drag and drop a web file here, or click to browse
              </p>
            </div>

            {/* File Requirements */}
                    <div className="text-sm text-slate-400 space-y-2 bg-slate-800/50 rounded-xl p-4">
                      <p>• Maximum file size: {formatFileSize(maxSize)}</p>
                      <p>• Supported formats: HTML, JavaScript/TypeScript, JSON, Web Manifest, WebAssembly</p>
                      <p>• Single file analysis only (no ZIP archives)</p>
                    </div>

            {/* Browse Button */}
            <div className="pt-4">
              <button
                type="button"
                className="inline-flex items-center px-8 py-3 border border-transparent text-base font-medium rounded-xl text-white bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Browse Files
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Example Files */}
      {!isUploading && (
        <div className="mt-8 text-center">
          <p className="text-base text-slate-300 mb-4 font-medium">Web files you can analyze:</p>
                  <div className="flex flex-wrap justify-center gap-3">
                    <span className="inline-flex items-center px-4 py-2 rounded-xl text-sm font-medium bg-blue-800/50 text-blue-200 border border-blue-600/50 shadow-sm hover:shadow-md transition-shadow">
                      📄 HTML files
                    </span>
                    <span className="inline-flex items-center px-4 py-2 rounded-xl text-sm font-medium bg-yellow-800/50 text-yellow-200 border border-yellow-600/50 shadow-sm hover:shadow-md transition-shadow">
                      ⚡ JavaScript/TypeScript
                    </span>
                    <span className="inline-flex items-center px-4 py-2 rounded-xl text-sm font-medium bg-slate-700/50 text-slate-200 border border-slate-600/50 shadow-sm hover:shadow-md transition-shadow">
                      📋 JSON data
                    </span>
                    <span className="inline-flex items-center px-4 py-2 rounded-xl text-sm font-medium bg-indigo-800/50 text-indigo-200 border border-indigo-600/50 shadow-sm hover:shadow-md transition-shadow">
                      📱 Web Manifest
                    </span>
                    <span className="inline-flex items-center px-4 py-2 rounded-xl text-sm font-medium bg-orange-800/50 text-orange-200 border border-orange-600/50 shadow-sm hover:shadow-md transition-shadow">
                      🚀 WebAssembly
                    </span>
                  </div>
        </div>
      )}
    </div>
  );
}
