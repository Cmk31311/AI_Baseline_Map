import { Request, Response } from 'express';
import { runBaselineAnalysis, validateAnalysisOptions } from '../../lib/analysis/run.js';
import { validateZip, getZipInfo } from '../../lib/files/unzip.js';
import { checkAnalysisFeasibility } from '../../lib/analysis/run.js';
import { AnalyzeResponse } from '../../lib/analysis/baseline.types.js';
import { writeFileSync, mkdirSync, existsSync } from 'fs';
import { join } from 'path';
import { randomUUID } from 'crypto';

export async function analyzeRoute(req: Request, res: Response) {
  try {
    // Check if file was uploaded
    if (!req.file) {
      return res.status(400).json({ error: 'No file provided' });
    }

    const file = req.file;
    
    // Validate file type
    if (!file.originalname.toLowerCase().endsWith('.zip')) {
      return res.status(400).json({ error: 'File must be a ZIP archive' });
    }

    // Validate file size (200MB limit)
    const maxSize = 200 * 1024 * 1024; // 200MB
    if (file.size > maxSize) {
      return res.status(400).json({ 
        error: `File too large: ${Math.round(file.size / 1024 / 1024)}MB (limit: 200MB)` 
      });
    }

    // Create temporary directory
    const tempDir = join(process.cwd(), 'tmp', 'uploads');
    if (!existsSync(tempDir)) {
      mkdirSync(tempDir, { recursive: true });
    }

    // Save uploaded file
    const tempId = randomUUID();
    const tempPath = join(tempDir, `${tempId}.zip`);
    
    // File is already in buffer from multer
    writeFileSync(tempPath, file.buffer);

    try {
      // Validate ZIP file
      const isValidZip = await validateZip(tempPath);
      if (!isValidZip) {
        return res.status(400).json({ error: 'Invalid ZIP file' });
      }

      // Get ZIP info
      const zipInfo = await getZipInfo(tempPath);
      
      // Check feasibility
      const feasibility = checkAnalysisFeasibility(zipInfo.totalFiles, zipInfo.totalSize);
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

      // Run analysis
      const analysisOptions = validateAnalysisOptions({
        maxFiles: 50000,
        maxFileSize: 2 * 1024 * 1024, // 2MB
        storeResults: true,
        publicUrl: process.env.PUBLIC_URL || 'http://localhost:3001',
      });

      const result = await runBaselineAnalysis(tempPath, analysisOptions);

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
      };

      return res.json(response);

    } finally {
      // Clean up temporary file
      try {
        const { unlinkSync } = require('fs');
        unlinkSync(tempPath);
      } catch (error) {
        console.warn(`Failed to cleanup temp file ${tempPath}: ${error}`);
      }
    }

  } catch (error) {
    console.error('Analysis API error:', error);
    
    return res.status(500).json({ 
      error: 'Analysis failed',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}

// Handle OPTIONS request for CORS
export async function optionsRoute(req: Request, res: Response) {
  res.status(200).header({
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  }).send();
}
