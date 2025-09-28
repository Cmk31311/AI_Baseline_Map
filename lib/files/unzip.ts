import { createWriteStream, mkdirSync, statSync, existsSync } from 'fs';
import { join, dirname, resolve, normalize } from 'path';
import { pipeline } from 'stream/promises';
import unzipper from 'unzipper';
import { ExtractedFile } from '../analysis/baseline.types';

export interface UnzipOptions {
  maxFiles?: number;
  maxFileSize?: number;
  allowedExtensions?: string[];
  ignorePaths?: string[];
}

export interface UnzipResult {
  files: ExtractedFile[];
  totalFiles: number;
  skippedFiles: number;
  errors: string[];
}

/**
 * Securely extract ZIP file contents
 * @param zipPath Path to ZIP file
 * @param extractPath Path to extract to
 * @param options Extraction options
 * @returns Extraction result
 */
export async function extractZip(
  zipPath: string,
  extractPath: string,
  options: UnzipOptions = {}
): Promise<UnzipResult> {
  const {
    maxFiles = 50000,
    maxFileSize = 10 * 1024 * 1024, // 10MB
    allowedExtensions = ['.py', '.js', '.ts', '.tsx', '.jsx', '.java', '.go', '.cs', '.fs', '.vb'],
    ignorePaths = ['/node_modules/', '/.venv/', '/venv/', '/dist/', '/build/', '/.git/', '/.next/']
  } = options;

  const files: ExtractedFile[] = [];
  const errors: string[] = [];
  let totalFiles = 0;
  let skippedFiles = 0;

  try {
    // Create extract directory
    if (!existsSync(extractPath)) {
      mkdirSync(extractPath, { recursive: true });
    }

    // Open ZIP file
    const zip = unzipper.Open.file(zipPath);
    const directory = await zip;

    // Process each entry
    for (const entry of directory.files) {
      totalFiles++;

      // Check file count limit
      if (totalFiles > maxFiles) {
        errors.push(`Too many files in archive (limit: ${maxFiles})`);
        break;
      }

      // Skip directories
      if (entry.type === 'Directory') {
        continue;
      }

      // Validate file path
      const filePath = normalize(entry.path);
      if (!isValidPath(filePath, extractPath)) {
        errors.push(`Invalid file path: ${filePath}`);
        skippedFiles++;
        continue;
      }

      // Check if path should be ignored
      if (shouldIgnorePath(filePath, ignorePaths)) {
        skippedFiles++;
        continue;
      }

      // Check file extension
      const extension = getFileExtension(filePath);
      if (allowedExtensions.length > 0 && !allowedExtensions.includes(extension)) {
        skippedFiles++;
        continue;
      }

      // Check file size
      if (entry.uncompressedSize > maxFileSize) {
        errors.push(`File too large: ${filePath} (${entry.uncompressedSize} bytes)`);
        skippedFiles++;
        continue;
      }

      try {
        // Extract file
        const fullPath = join(extractPath, filePath);
        const dir = dirname(fullPath);
        
        if (!existsSync(dir)) {
          mkdirSync(dir, { recursive: true });
        }

        await pipeline(
          entry.stream(),
          createWriteStream(fullPath)
        );

        // Read file content for analysis
        const content = await readFileContent(fullPath);
        if (content !== null) {
          files.push({
            path: filePath,
            content,
            size: content.length,
            language: detectLanguageFromExtension(extension),
          });
        }
      } catch (error) {
        errors.push(`Failed to extract ${filePath}: ${error instanceof Error ? error.message : 'Unknown error'}`);
        skippedFiles++;
      }
    }
  } catch (error) {
    errors.push(`Failed to open ZIP file: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }

  return {
    files,
    totalFiles,
    skippedFiles,
    errors,
  };
}

/**
 * Validate file path for security
 * @param filePath File path
 * @param extractPath Base extraction path
 * @returns True if path is valid
 */
function isValidPath(filePath: string, extractPath: string): boolean {
  try {
    // Normalize path
    const normalized = normalize(filePath);
    
    // Check for path traversal
    if (normalized.includes('..') || normalized.startsWith('/')) {
      return false;
    }
    
    // Check if path is within extract directory
    const fullPath = resolve(extractPath, normalized);
    const basePath = resolve(extractPath);
    
    return fullPath.startsWith(basePath);
  } catch {
    return false;
  }
}

/**
 * Check if path should be ignored
 * @param filePath File path
 * @param ignorePaths Array of paths to ignore
 * @returns True if should be ignored
 */
function shouldIgnorePath(filePath: string, ignorePaths: string[]): boolean {
  return ignorePaths.some(ignorePath => 
    filePath.includes(ignorePath) || filePath.startsWith(ignorePath)
  );
}

/**
 * Get file extension from path
 * @param filePath File path
 * @returns File extension with dot
 */
function getFileExtension(filePath: string): string {
  const lastDot = filePath.lastIndexOf('.');
  if (lastDot === -1) return '';
  return filePath.substring(lastDot);
}

/**
 * Detect language from file extension
 * @param extension File extension
 * @returns Language or undefined
 */
function detectLanguageFromExtension(extension: string): 'python' | 'node' | 'java' | 'go' | 'dotnet' | undefined {
  const languageMap: Record<string, 'python' | 'node' | 'java' | 'go' | 'dotnet'> = {
    '.js': 'node',
    '.jsx': 'node',
    '.ts': 'node',
    '.tsx': 'node',
    '.py': 'python',
    '.java': 'java',
    '.go': 'go',
    '.cs': 'dotnet',
    '.fs': 'dotnet',
    '.vb': 'dotnet',
  };
  
  return languageMap[extension];
}

/**
 * Read file content safely
 * @param filePath File path
 * @returns File content or null if error
 */
async function readFileContent(filePath: string): Promise<string | null> {
  try {
    const stats = statSync(filePath);
    
    // Skip very large files
    if (stats.size > 2 * 1024 * 1024) { // 2MB
      return null;
    }
    
    // Read file content
    const content = await import('fs').then(fs => fs.promises.readFile(filePath, 'utf8'));
    return content;
  } catch (error) {
    console.warn(`Failed to read file ${filePath}: ${error}`);
    return null;
  }
}

/**
 * Extract ZIP to memory (for small archives)
 * @param zipPath Path to ZIP file
 * @param options Extraction options
 * @returns Extraction result
 */
export async function extractZipToMemory(
  zipPath: string,
  options: UnzipOptions = {}
): Promise<UnzipResult> {
  const {
    maxFiles = 50000,
    maxFileSize = 2 * 1024 * 1024, // 2MB
    allowedExtensions = ['.py', '.js', '.ts', '.tsx', '.jsx', '.java', '.go', '.cs', '.fs', '.vb'],
    ignorePaths = ['/node_modules/', '/.venv/', '/venv/', '/dist/', '/build/', '/.git/', '/.next/']
  } = options;

  const files: ExtractedFile[] = [];
  const errors: string[] = [];
  let totalFiles = 0;
  let skippedFiles = 0;

  try {
    // Open ZIP file
    const zip = unzipper.Open.file(zipPath);
    const directory = await zip;

    // Process each entry
    for (const entry of directory.files) {
      totalFiles++;

      // Check file count limit
      if (totalFiles > maxFiles) {
        errors.push(`Too many files in archive (limit: ${maxFiles})`);
        break;
      }

      // Skip directories
      if (entry.type === 'Directory') {
        continue;
      }

      // Validate file path
      const filePath = normalize(entry.path);
      if (!isValidPath(filePath, '/')) {
        errors.push(`Invalid file path: ${filePath}`);
        skippedFiles++;
        continue;
      }

      // Check if path should be ignored
      if (shouldIgnorePath(filePath, ignorePaths)) {
        skippedFiles++;
        continue;
      }

      // Check file extension
      const extension = getFileExtension(filePath);
      if (allowedExtensions.length > 0 && !allowedExtensions.includes(extension)) {
        skippedFiles++;
        continue;
      }

      // Check file size
      if (entry.uncompressedSize > maxFileSize) {
        errors.push(`File too large: ${filePath} (${entry.uncompressedSize} bytes)`);
        skippedFiles++;
        continue;
      }

      try {
        // Read file content
        const content = await entry.buffer();
        const contentString = content.toString('utf8');
        
        files.push({
          path: filePath,
          content: contentString,
          size: contentString.length,
          language: detectLanguageFromExtension(extension),
        });
      } catch (error) {
        errors.push(`Failed to read ${filePath}: ${error instanceof Error ? error.message : 'Unknown error'}`);
        skippedFiles++;
      }
    }
  } catch (error) {
    errors.push(`Failed to open ZIP file: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }

  return {
    files,
    totalFiles,
    skippedFiles,
    errors,
  };
}

/**
 * Get ZIP file information
 * @param zipPath Path to ZIP file
 * @returns ZIP file info
 */
export async function getZipInfo(zipPath: string): Promise<{
  totalFiles: number;
  totalSize: number;
  compressedSize: number;
  files: Array<{ path: string; size: number; compressedSize: number }>;
}> {
  try {
    const zip = unzipper.Open.file(zipPath);
    const directory = await zip;
    
    let totalSize = 0;
    let compressedSize = 0;
    const files: Array<{ path: string; size: number; compressedSize: number }> = [];
    
    for (const entry of directory.files) {
      if (entry.type !== 'Directory') {
        totalSize += entry.uncompressedSize;
        compressedSize += entry.compressedSize;
        files.push({
          path: entry.path,
          size: entry.uncompressedSize,
          compressedSize: entry.compressedSize,
        });
      }
    }
    
    return {
      totalFiles: files.length,
      totalSize,
      compressedSize,
      files,
    };
  } catch (error) {
    throw new Error(`Failed to read ZIP info: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Validate ZIP file
 * @param zipPath Path to ZIP file
 * @returns True if valid ZIP
 */
export async function validateZip(zipPath: string): Promise<boolean> {
  try {
    const zip = unzipper.Open.file(zipPath);
    await zip;
    return true;
  } catch {
    return false;
  }
}
