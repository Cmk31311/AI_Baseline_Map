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
  const analysisId = randomUUID();
  
  // On local development, store files on disk
  if (!process.env.VERCEL) {
    const {
      baseDir = join(process.cwd(), 'tmp', 'analysis'),
      publicUrl = 'http://localhost:3000',
      ttl = 24 * 60 * 60 * 1000, // 24 hours
    } = options;

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

  // On Vercel, return in-memory URLs (no file storage)
  const publicUrl = process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'https://your-app.vercel.app';
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

  // Add findings
  for (const finding of report.findings) {
    if (finding.kind === 'dependency') {
      rows.push({
        Kind: 'Dependency',
        Language: finding.lang,
        Component: finding.component,
        'Found Version': finding.foundVersion || '',
        'Required Version': finding.baselineRequired || '',
        Status: finding.status,
        Reason: finding.reason,
        File: finding.file,
        Line: '',
        'Quick Fix': finding.quickFix || '',
      });
    } else {
      rows.push({
        Kind: 'Pattern',
        Language: finding.lang,
        Component: '',
        'Found Version': '',
        Status: finding.status,
        Reason: finding.issue,
        File: finding.file,
        Line: finding.line.toString(),
        'Quick Fix': finding.quickFix || '',
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
  baseDir: string = process.env.VERCEL ? '/tmp/analysis' : join(process.cwd(), 'tmp', 'analysis')
): Promise<string | null> {
  // On Vercel, files are not stored persistently
  if (process.env.VERCEL) {
    console.log('File storage not available on Vercel:', analysisId);
    return null;
  }

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
  baseDir: string = process.env.VERCEL ? '/tmp/analysis' : join(process.cwd(), 'tmp', 'analysis')
): boolean {
  // On Vercel, files are not stored persistently
  if (process.env.VERCEL) {
    console.log('File existence check not available on Vercel:', analysisId);
    return false;
  }

  const analysisDir = join(baseDir, analysisId);
  return existsSync(analysisDir);
}