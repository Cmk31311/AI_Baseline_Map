import { ExtractedFile } from '../analysis/baseline.types';

export interface SingleFileResult {
  files: ExtractedFile[];
  totalFiles: number;
  skippedFiles: number;
}

/**
 * Process a single file for analysis
 * @param filePath Path to the file
 * @param content File content
 * @param maxFileSize Maximum file size in bytes
 * @returns Single file result
 */
export function processSingleFile(
  filePath: string,
  content: string,
  maxFileSize: number = 2 * 1024 * 1024 // 2MB
): SingleFileResult {
  // Check file size
  const fileSize = Buffer.byteLength(content, 'utf8');
  if (fileSize > maxFileSize) {
    return {
      files: [],
      totalFiles: 1,
      skippedFiles: 1
    };
  }

  // Create extracted file object
  const extractedFile: ExtractedFile = {
    name: filePath,
    content: content,
    size: fileSize
  };

  return {
    files: [extractedFile],
    totalFiles: 1,
    skippedFiles: 0
  };
}

/**
 * Detect file type from extension
 * @param filename File name
 * @returns File type category
 */
export function detectFileType(filename: string): string {
  const ext = filename.split('.').pop()?.toLowerCase();
  
  const typeMap: Record<string, string> = {
    // Web files
    'js': 'javascript',
    'jsx': 'javascript',
    'ts': 'typescript',
    'tsx': 'typescript',
    'html': 'html',
    'htm': 'html',
    'css': 'css',
    'scss': 'css',
    'sass': 'css',
    'less': 'css',
    
    // Python
    'py': 'python',
    'pyw': 'python',
    
    // Java
    'java': 'java',
    'kt': 'kotlin',
    'scala': 'scala',
    
    // C/C++
    'c': 'c',
    'cpp': 'cpp',
    'cc': 'cpp',
    'cxx': 'cpp',
    'h': 'c',
    'hpp': 'cpp',
    
    // C#
    'cs': 'csharp',
    'fs': 'fsharp',
    'vb': 'vbnet',
    
    // Go
    'go': 'go',
    
    // Rust
    'rs': 'rust',
    
    // PHP
    'php': 'php',
    
    // Ruby
    'rb': 'ruby',
    
    // Swift
    'swift': 'swift',
    
    // Configuration files
    'json': 'json',
    'yaml': 'yaml',
    'yml': 'yaml',
    'xml': 'xml',
    'toml': 'toml',
    'ini': 'ini',
    'cfg': 'config',
    'conf': 'config',
    
    // Documentation
    'md': 'markdown',
    'txt': 'text',
    'rst': 'restructuredtext',
    
    // Shell scripts
    'sh': 'shell',
    'bash': 'shell',
    'zsh': 'shell',
    'fish': 'shell',
    'ps1': 'powershell',
    'bat': 'batch',
    'cmd': 'batch',
    
    // SQL
    'sql': 'sql',
    
    // Docker
    'dockerfile': 'dockerfile',
    'dockerignore': 'dockerignore',
    
    // Git
    'gitignore': 'gitignore',
    'gitattributes': 'gitattributes',
    
    // Package managers
    'package.json': 'package.json',
    'requirements.txt': 'requirements.txt',
    'pom.xml': 'pom.xml',
    'build.gradle': 'gradle',
    'go.mod': 'go.mod',
    'cargo.toml': 'cargo.toml',
    'composer.json': 'composer.json',
    'gemfile': 'gemfile',
    'podfile': 'podfile',
    'pubspec.yaml': 'pubspec.yaml'
  };

  return typeMap[ext || ''] || 'unknown';
}

/**
 * Check if file should be analyzed
 * @param filename File name
 * @returns Whether file should be analyzed
 */
export function shouldAnalyzeFile(filename: string): boolean {
  const ext = filename.split('.').pop()?.toLowerCase();
  
  // Skip binary files (but allow ZIP for project archives)
  const binaryExtensions = [
    'exe', 'dll', 'so', 'dylib', 'bin', 'dat', 'db', 'sqlite',
    'jpg', 'jpeg', 'png', 'gif', 'bmp', 'svg', 'ico', 'webp',
    'mp3', 'mp4', 'avi', 'mov', 'wav', 'flac', 'ogg',
    'rar', '7z', 'tar', 'gz', 'bz2', 'xz',
    'pdf', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx',
    'woff', 'woff2', 'ttf', 'otf', 'eot'
  ];
  
  if (binaryExtensions.includes(ext || '')) {
    return false;
  }
  
  // Skip very large files (over 1MB for single file analysis)
  return true;
}
