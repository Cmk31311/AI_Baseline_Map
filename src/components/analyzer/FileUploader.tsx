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
  maxSize = 200 * 1024 * 1024, // 200MB
  acceptedTypes = ['.zip']
}: FileUploaderProps) {
  const [dragActive, setDragActive] = useState(false);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      onFileSelect(acceptedFiles[0]);
    }
  }, [onFileSelect]);

  const { getRootProps, getInputProps, isDragReject } = useDropzone({
    onDrop,
    accept: undefined, // Accept all file types
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
    <div className="w-full max-w-2xl mx-auto">
      <div
        {...getRootProps()}
        className={`
          relative border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors
          ${isUploading 
            ? 'border-gray-300 bg-gray-50 cursor-not-allowed' 
            : dragActive 
              ? 'border-blue-400 bg-blue-50' 
              : isDragReject
                ? 'border-red-400 bg-red-50'
                : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50'
          }
        `}
      >
        <input {...getInputProps()} disabled={isUploading} />
        
        {isUploading ? (
          <div className="space-y-4">
            <div className="flex justify-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
            <div>
              <h3 className="text-lg font-medium text-gray-900">Analyzing your code...</h3>
              <p className="text-sm text-gray-600 mt-2">
                This may take a few moments depending on the size of your project.
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Upload Icon */}
            <div className="flex justify-center">
              <svg 
                className={`w-12 h-12 ${dragActive ? 'text-blue-500' : 'text-gray-400'}`} 
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

            {/* Upload Text */}
            <div>
              <h3 className="text-lg font-medium text-gray-900">
                Upload your code file or project
              </h3>
              <p className="text-sm text-gray-600 mt-2">
                Drag and drop any file here, or click to browse
              </p>
            </div>

            {/* File Requirements */}
            <div className="text-xs text-gray-500 space-y-1">
              <p>• Maximum file size: {formatFileSize(maxSize)}</p>
              <p>• Supported formats: Any file type (ZIP, JS, TS, Python, Java, etc.)</p>
              <p>• For projects: Upload ZIP archives. For single files: Upload directly</p>
            </div>

            {/* Browse Button */}
            <div className="pt-4">
              <button
                type="button"
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600 mb-3">Examples you can analyze:</p>
          <div className="flex flex-wrap justify-center gap-2">
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
              ZIP project archives
            </span>
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
              JavaScript/TypeScript files
            </span>
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
              Python scripts
            </span>
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
              Java source files
            </span>
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
              CSS/HTML files
            </span>
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
              Configuration files
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
