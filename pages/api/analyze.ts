import { NextApiRequest, NextApiResponse } from 'next';
import formidable from 'formidable';
import { promises as fs } from 'fs';
import path from 'path';
import { randomUUID } from 'crypto';
import { runBaselineAnalysis, validateAnalysisOptions, checkAnalysisFeasibility } from '../../lib/analysis/run';
import { validateZip, getZipInfo } from '../../lib/files/unzip';
import { shouldAnalyzeFile } from '../../lib/files/single-file';
import { AnalyzeResponse } from '../../lib/analysis/baseline.types';

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  console.log('Analyze API called with method:', req.method);
  
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  let tempPath: string | undefined;

  try {
    // Parse form data
    const form = formidable({
      maxFileSize: 200 * 1024 * 1024, // 200MB
      filter: ({ mimetype, originalFilename }) => {
        // Accept all file types
        console.log('Filter check:', { mimetype, originalFilename });
        return true;
      },
    });

    console.log('Parsing form data...');
    const [fields, files] = await form.parse(req);
    console.log('Parsed fields:', Object.keys(fields));
    console.log('Parsed files:', Object.keys(files));
    console.log('Files object:', files);
    
    const file = Array.isArray(files.file) ? files.file[0] : files.file;

    if (!file) {
      console.error('No file found in request. Available files:', Object.keys(files));
      return res.status(400).json({ 
        error: 'No file provided',
        debug: {
          fieldsKeys: Object.keys(fields),
          filesKeys: Object.keys(files),
          filesContent: files
        }
      });
    }

    console.log('File found:', {
      originalFilename: file.originalFilename,
      mimetype: file.mimetype,
      size: file.size,
      filepath: file.filepath
    });

    // Create temporary directory
    const tempDir = path.join(process.cwd(), 'tmp', 'analyzer');
    await fs.mkdir(tempDir, { recursive: true });

    // Save uploaded file
    const analysisId = randomUUID();
    const originalName = file.originalFilename || 'uploaded-file';
    tempPath = path.join(tempDir, `${analysisId}-${originalName}`);
    
    console.log('Copying file from', file.filepath, 'to', tempPath);
    await fs.copyFile(file.filepath, tempPath);
    console.log('File copied successfully');

    try {
      // Check if file should be analyzed
      if (!shouldAnalyzeFile(originalName)) {
        return res.status(400).json({ 
          error: 'File type not supported for analysis',
          details: { filename: originalName }
        });
      }

      // Check file size
      const stats = await fs.stat(tempPath);
      if (stats.size > 200 * 1024 * 1024) { // 200MB limit
        return res.status(400).json({ 
          error: 'File too large',
          details: { 
            size: stats.size,
            maxSize: 200 * 1024 * 1024
          }
        });
      }

      // For ZIP files, validate and get info
      let feasibility: { feasible: boolean; warnings: string[]; estimatedTime: string } = { feasible: true, warnings: [], estimatedTime: '1-2 minutes' };
      if (originalName.toLowerCase().endsWith('.zip')) {
        const isValidZip = await validateZip(tempPath);
        if (!isValidZip) {
          return res.status(400).json({ error: 'Invalid ZIP file' });
        }

        const zipInfo = await getZipInfo(tempPath);
        feasibility = checkAnalysisFeasibility(zipInfo.totalFiles, zipInfo.totalSize);
        if (!feasibility.feasible) {
          return res.status(400).json({ 
            error: 'Analysis not feasible',
            warnings: feasibility.warnings,
            details: {
              totalFiles: zipInfo.totalFiles,
              totalSize: zipInfo.totalSize,
              estimatedTime: feasibility.estimatedTime,
            }
          });
        }
      }

      // Run analysis
      console.log('Starting analysis for:', originalName);
      const analysisOptions = validateAnalysisOptions({
        maxFiles: 50000,
        maxFileSize: 2 * 1024 * 1024, // 2MB
        storeResults: true,
        publicUrl: process.env.PUBLIC_URL || 'http://localhost:3000',
      });

      console.log('Analysis options:', analysisOptions);
      const result = await runBaselineAnalysis(tempPath, analysisOptions);
      console.log('Analysis completed successfully');

      if (!result.artifacts) {
        throw new Error('Failed to store analysis results');
      }

      // Create response
      const response: AnalyzeResponse = {
        analysisId: result.artifacts.analysisId,
        summary: result.report.summary,
        artifacts: {
          jsonUrl: result.artifacts.jsonUrl,
          csvUrl: result.artifacts.csvUrl,
        },
        report: result.report, // Include full report for Groq analysis
      };

      return res.status(200).json(response);

    } finally {
      // Clean up temporary file
      try {
        await fs.unlink(tempPath);
      } catch (error) {
        console.warn(`Failed to cleanup temp file ${tempPath}: ${error}`);
      }
    }

  } catch (error) {
    console.error('Analysis API error:', error);
    
    // Clean up temporary file on error
    try {
      if (typeof tempPath !== 'undefined') {
        await fs.unlink(tempPath);
      }
    } catch (cleanupError) {
      console.warn(`Failed to cleanup temp file on error: ${cleanupError}`);
    }
    
    return res.status(500).json({ 
      error: 'Analysis failed',
      message: error instanceof Error ? error.message : 'Unknown error',
      details: error instanceof Error ? error.stack : undefined
    });
  }
}
