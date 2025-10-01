import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';
import { randomUUID } from 'crypto';
import { runBaselineAnalysis, validateAnalysisOptions } from '../../../lib/analysis/run';
// ZIP imports removed as per new requirements
import { shouldAnalyzeFile } from '../../../lib/files/single-file';
import { AnalyzeResponse, Report } from '../../../lib/analysis/baseline.types';

// Temporary storage for Vercel (in-memory only)
declare global {
  var tempReports: Map<string, Report>;
}

// Initialize tempReports if not exists
if (!global.tempReports) {
  global.tempReports = new Map();
}

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
      if (stats.size > 5 * 1024 * 1024) { // 5MB limit
        return NextResponse.json({ 
          error: 'File too large',
          details: { 
            size: stats.size,
            maxSize: 5 * 1024 * 1024
          }
        }, { status: 400 });
      }

      // Run analysis
      console.log('Starting analysis for:', originalName);
      
      // Determine public URL - use request headers if on Vercel
      let publicUrl: string;
      if (process.env.VERCEL) {
        const host = request.headers.get('host');
        const protocol = request.headers.get('x-forwarded-proto') || 'https';
        publicUrl = `${protocol}://${host}`;
        console.log('Constructed Vercel URL from headers:', publicUrl);
      } else {
        publicUrl = 'http://localhost:3000';
      }
      const analysisOptions = validateAnalysisOptions({
        maxFiles: 50000,
        maxFileSize: 5 * 1024 * 1024, // 5MB
        allowedExtensions: ['.html', '.htm', '.js', '.mjs', '.ts', '.json', '.webmanifest', '.wasm'],
        storeResults: true,
        publicUrl,
      });

      console.log('Analysis options:', analysisOptions);
      const result = await runBaselineAnalysis(tempPath, analysisOptions);
      console.log('Analysis completed successfully');
      console.log('Is Vercel:', !!process.env.VERCEL);
      console.log('Public URL:', publicUrl);

      // For Vercel deployment, include the full report directly in the response
      let response: AnalyzeResponse;
      
      if (process.env.VERCEL) {
        // On Vercel, return the report directly since file storage is not persistent
        const analysisId = result.artifacts?.analysisId || randomUUID();
        response = {
          analysisId,
          summary: result.report.summary,
          artifacts: {
            jsonUrl: `${publicUrl}/api/analyze/${analysisId}?format=json`,
            csvUrl: `${publicUrl}/api/analyze/${analysisId}?format=csv`,
          },
          report: result.report,
        };
        
        // Store the report temporarily for the download endpoints
        try {
          global.tempReports.set(analysisId, result.report);
          console.log(`Stored report ${analysisId} in temp storage`);
        } catch (error) {
          console.error('Failed to store report in temp storage:', error);
          // Don't fail the request, but log the error
        }
      } else {
        // On local development, use file storage
        if (!result.artifacts) {
          throw new Error('Failed to store analysis results');
        }
        
        response = {
          analysisId: result.artifacts.analysisId,
          summary: result.report.summary,
          artifacts: {
            jsonUrl: result.artifacts.jsonUrl,
            csvUrl: result.artifacts.csvUrl,
          },
          report: result.report,
        };
      }
      
      console.log('Analysis response:', {
        analysisId: response.analysisId,
        jsonUrl: response.artifacts.jsonUrl,
        csvUrl: response.artifacts.csvUrl,
        isVercel: !!process.env.VERCEL
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
