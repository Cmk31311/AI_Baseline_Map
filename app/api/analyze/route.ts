import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';
import { randomUUID } from 'crypto';
import { runBaselineAnalysis, validateAnalysisOptions } from '../../../lib/analysis/run';
// ZIP imports removed as per new requirements
import { shouldAnalyzeFile } from '../../../lib/files/single-file';
import { AnalyzeResponse } from '../../../lib/analysis/baseline.types';

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  console.log('Analyze API called with method: POST');
  
  let tempPath: string | undefined;

  try {
    // Parse form data using Next.js built-in FormData
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      console.error('No file found in request');
      return NextResponse.json({ 
        error: 'No file provided'
      }, { status: 400 });
    }

    console.log('File found:', {
      name: file.name,
      type: file.type,
      size: file.size
    });

    // Create temporary directory - use /tmp for Vercel serverless
    const tempDir = process.env.VERCEL ? '/tmp/analyzer' : path.join(process.cwd(), 'tmp', 'analyzer');
    await fs.mkdir(tempDir, { recursive: true });

    // Save uploaded file
    const analysisId = randomUUID();
    const originalName = file.name || 'uploaded-file';
    tempPath = path.join(tempDir, `${analysisId}-${originalName}`);
    
    // Convert File to Buffer and write to disk
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    await fs.writeFile(tempPath, buffer);
    console.log('File saved successfully');

    try {
      // Check if file should be analyzed (early exit for unsupported types)
      if (!shouldAnalyzeFile(originalName)) {
        return NextResponse.json({ 
          error: 'File type not supported for analysis',
          details: { filename: originalName }
        }, { status: 400 });
      }

      // Check file size
      const stats = await fs.stat(tempPath);
      if (stats.size > 200 * 1024 * 1024) { // 200MB limit
        return NextResponse.json({ 
          error: 'File too large',
          details: { 
            size: stats.size,
            maxSize: 200 * 1024 * 1024
          }
        }, { status: 400 });
      }

      // Run analysis
      console.log('Starting analysis for:', originalName);
      const publicUrl = process.env.VERCEL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000';
      const analysisOptions = validateAnalysisOptions({
        maxFiles: 50000,
        maxFileSize: 2 * 1024 * 1024, // 2MB
        allowedExtensions: ['.html', '.htm', '.css', '.js', '.mjs', '.ts', '.svg', '.wasm', '.json', '.webmanifest'],
        storeResults: true,
        publicUrl,
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
      
      console.log('Analysis response:', {
        analysisId: response.analysisId,
        jsonUrl: response.artifacts.jsonUrl,
        csvUrl: response.artifacts.csvUrl
      });

      return NextResponse.json(response);

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
    
    return NextResponse.json({ 
      error: 'Analysis failed',
      message: error instanceof Error ? error.message : 'Unknown error',
      details: error instanceof Error ? error.stack : undefined
    }, { status: 500 });
  }
}
