import { writeFileSync, mkdirSync, existsSync } from 'fs';
import { join } from 'path';
import { randomUUID } from 'crypto';
import Papa from 'papaparse';
import { Report, CSVRow } from '../analysis/baseline.types';

export interface StoredArtifacts {
  jsonUrl: string;
  csvUrl: string;
  analysisId: string;
}

export interface StorageOptions {
  baseDir?: string;
  publicUrl?: string;
  ttl?: number; // Time to live in milliseconds
}

/**
 * Store analysis results and return public URLs
 * @param report Analysis report
 * @param options Storage options
 * @returns Stored artifacts with public URLs
 */
export function storeAnalysisResults(
  report: Report,
  options: StorageOptions = {}
): StoredArtifacts {
  const {
    baseDir = join(process.cwd(), 'tmp', 'analysis'),
    publicUrl = 'http://localhost:3000',
    ttl = 24 * 60 * 60 * 1000, // 24 hours
  } = options;

  const analysisId = randomUUID();
  
  // Ensure base directory exists
  if (!existsSync(baseDir)) {
    mkdirSync(baseDir, { recursive: true });
  }

  // Create analysis directory
  const analysisDir = join(baseDir, analysisId);
  if (!existsSync(analysisDir)) {
    mkdirSync(analysisDir, { recursive: true });
  }

  // Store JSON report
  const jsonPath = join(analysisDir, 'report.json');
  writeFileSync(jsonPath, JSON.stringify(report, null, 2));

  // Store CSV report
  const csvPath = join(analysisDir, 'report.csv');
  const csvContent = generateCSV(report);
  writeFileSync(csvPath, csvContent);

  // Schedule cleanup
  scheduleCleanup(analysisDir, ttl);

  return {
    jsonUrl: `${publicUrl}/api/analyze/${analysisId}?format=json`,
    csvUrl: `${publicUrl}/api/analyze/${analysisId}?format=csv`,
    analysisId,
  };
}

/**
 * Generate CSV content from report
 * @param report Analysis report
 * @returns CSV content
 */
function generateCSV(report: Report): string {
  const rows: CSVRow[] = [];

  for (const finding of report.findings) {
    if (finding.kind === 'dependency') {
      rows.push({
        Kind: 'Dependency',
        Language: finding.lang,
        Component: finding.component,
        File: finding.file,
        Line: '',
        Status: finding.status,
        Reason: finding.reason,
        'Quick Fix': finding.quickFix || '',
        'Found Version': finding.foundVersion || '',
        'Required Version': finding.baselineRequired || '',
      });
    } else if (finding.kind === 'pattern') {
      rows.push({
        Kind: 'Pattern',
        Language: finding.lang,
        Component: '',
        File: finding.file,
        Line: finding.line.toString(),
        Status: finding.status,
        Reason: finding.issue,
        'Quick Fix': finding.quickFix || '',
        'Found Version': '',
        'Required Version': '',
      });
    }
  }

  return Papa.unparse(rows);
}

/**
 * Schedule cleanup of analysis files
 * @param analysisDir Analysis directory path
 * @param ttl Time to live in milliseconds
 */
function scheduleCleanup(analysisDir: string, ttl: number): void {
  setTimeout(async () => {
    try {
      if (existsSync(analysisDir)) {
        // Remove directory and all contents
        const { rmSync } = await import('fs');
        rmSync(analysisDir, { recursive: true, force: true });
      }
    } catch (error) {
      console.warn(`Failed to cleanup analysis directory ${analysisDir}: ${error}`);
    }
  }, ttl);
}

/**
 * Get stored analysis report
 * @param analysisId Analysis ID
 * @param format Format (json or csv)
 * @param baseDir Base directory for storage
 * @returns Report content or null if not found
 */
export async function getStoredAnalysis(
  analysisId: string,
  format: 'json' | 'csv' = 'json',
  baseDir: string = join(process.cwd(), 'tmp', 'analysis')
): Promise<string | null> {
  try {
    const analysisDir = join(baseDir, analysisId);
    const filePath = join(analysisDir, `report.${format}`);
    
    if (!existsSync(filePath)) {
      return null;
    }

    const { readFileSync } = await import('fs');
    const content = readFileSync(filePath, 'utf8');
    return content;
  } catch (error) {
    console.warn(`Failed to read stored analysis ${analysisId}: ${error}`);
    return null;
  }
}

/**
 * Check if analysis exists
 * @param analysisId Analysis ID
 * @param baseDir Base directory for storage
 * @returns True if analysis exists
 */
export function analysisExists(
  analysisId: string,
  baseDir: string = join(process.cwd(), 'tmp', 'analysis')
): boolean {
  const analysisDir = join(baseDir, analysisId);
  return existsSync(analysisDir);
}

/**
 * Clean up old analysis files
 * @param baseDir Base directory for storage
 * @param maxAge Maximum age in milliseconds
 * @returns Number of cleaned up analyses
 */
export async function cleanupOldAnalyses(
  baseDir: string = join(process.cwd(), 'tmp', 'analysis'),
  maxAge: number = 24 * 60 * 60 * 1000 // 24 hours
): Promise<number> {
  let cleanedCount = 0;

  try {
    if (!existsSync(baseDir)) {
      return 0;
    }

    const { readdirSync, statSync, rmSync } = await import('fs');
    const entries = readdirSync(baseDir, { withFileTypes: true });

    for (const entry of entries) {
      if (entry.isDirectory()) {
        const analysisDir = join(baseDir, entry.name);
        const stats = statSync(analysisDir);
        const age = Date.now() - stats.mtime.getTime();

        if (age > maxAge) {
          try {
            rmSync(analysisDir, { recursive: true, force: true });
            cleanedCount++;
          } catch (error) {
            console.warn(`Failed to cleanup ${analysisDir}: ${error}`);
          }
        }
      }
    }
  } catch (error) {
    console.warn(`Failed to cleanup old analyses: ${error}`);
  }

  return cleanedCount;
}

/**
 * Get analysis metadata
 * @param analysisId Analysis ID
 * @param baseDir Base directory for storage
 * @returns Analysis metadata or null
 */
export async function getAnalysisMetadata(
  analysisId: string,
  baseDir: string = join(process.cwd(), 'tmp', 'analysis')
): Promise<{ createdAt: Date; size: number } | null> {
  try {
    const analysisDir = join(baseDir, analysisId);
    
    if (!existsSync(analysisDir)) {
      return null;
    }

    const { statSync } = await import('fs');
    const stats = statSync(analysisDir);

    return {
      createdAt: stats.birthtime,
      size: stats.size,
    };
  } catch (error) {
    console.warn(`Failed to get metadata for ${analysisId}: ${error}`);
    return null;
  }
}

/**
 * List all stored analyses
 * @param baseDir Base directory for storage
 * @returns Array of analysis IDs
 */
export async function listStoredAnalyses(
  baseDir: string = join(process.cwd(), 'tmp', 'analysis')
): Promise<string[]> {
  try {
    if (!existsSync(baseDir)) {
      return [];
    }

    const { readdirSync } = await import('fs');
    const entries = readdirSync(baseDir, { withFileTypes: true });

    return entries
      .filter(entry => entry.isDirectory())
      .map(entry => entry.name);
  } catch (error) {
    console.warn(`Failed to list stored analyses: ${error}`);
    return [];
  }
}

/**
 * Delete specific analysis
 * @param analysisId Analysis ID
 * @param baseDir Base directory for storage
 * @returns True if deleted successfully
 */
export async function deleteAnalysis(
  analysisId: string,
  baseDir: string = join(process.cwd(), 'tmp', 'analysis')
): Promise<boolean> {
  try {
    const analysisDir = join(baseDir, analysisId);
    
    if (!existsSync(analysisDir)) {
      return false;
    }

    const { rmSync } = await import('fs');
    rmSync(analysisDir, { recursive: true, force: true });
    return true;
  } catch (error) {
    console.warn(`Failed to delete analysis ${analysisId}: ${error}`);
    return false;
  }
}

/**
 * Get storage statistics
 * @param baseDir Base directory for storage
 * @returns Storage statistics
 */
export async function getStorageStats(
  baseDir: string = join(process.cwd(), 'tmp', 'analysis')
): Promise<{
  totalAnalyses: number;
  totalSize: number;
  oldestAnalysis: Date | null;
  newestAnalysis: Date | null;
}> {
  try {
    if (!existsSync(baseDir)) {
      return {
        totalAnalyses: 0,
        totalSize: 0,
        oldestAnalysis: null,
        newestAnalysis: null,
      };
    }

    const { readdirSync, statSync } = await import('fs');
    const entries = readdirSync(baseDir, { withFileTypes: true });
    const analyses = entries.filter(entry => entry.isDirectory());

    let totalSize = 0;
    let oldestDate: Date | null = null;
    let newestDate: Date | null = null;

    for (const analysis of analyses) {
      const analysisDir = join(baseDir, analysis.name);
      const stats = statSync(analysisDir);
      
      totalSize += stats.size;
      
      if (!oldestDate || stats.birthtime < oldestDate) {
        oldestDate = stats.birthtime;
      }
      
      if (!newestDate || stats.birthtime > newestDate) {
        newestDate = stats.birthtime;
      }
    }

    return {
      totalAnalyses: analyses.length,
      totalSize,
      oldestAnalysis: oldestDate,
      newestAnalysis: newestDate,
    };
  } catch (error) {
    console.warn(`Failed to get storage stats: ${error}`);
    return {
      totalAnalyses: 0,
      totalSize: 0,
      oldestAnalysis: null,
      newestAnalysis: null,
    };
  }
}
