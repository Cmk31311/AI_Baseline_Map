import { NextRequest, NextResponse } from 'next/server';
import { getStoredAnalysis, analysisExists } from '../../../../lib/files/store';
import { validateReport, Report } from '../../../../lib/analysis/baseline.types';

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Temporary storage for Vercel (in-memory only) - will be populated by analyze route
declare global {
  var tempReports: Map<string, Report>;
}

// Initialize tempReports if not exists
if (!global.tempReports) {
  global.tempReports = new Map();
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    const analysisId = resolvedParams.id;
    const { searchParams } = new URL(request.url);
    const format = searchParams.get('format') || 'json';

    // Validate analysis ID
    if (!analysisId || typeof analysisId !== 'string') {
      return NextResponse.json({ error: 'Invalid analysis ID' }, { status: 400 });
    }

    console.log(`Fetching analysis ${analysisId} in format ${format}`);

    // On Vercel, check temp storage first
    if (process.env.VERCEL) {
      const report = global.tempReports.get(analysisId);
      if (!report) {
        console.log(`Analysis ${analysisId} not found in temp storage`);
        return NextResponse.json({ error: 'Analysis not found' }, { status: 404 });
      }

      console.log(`Found analysis ${analysisId} in temp storage`);
      
      // Return appropriate format
      let content: string;
      let contentType: string;
      let filename: string;

      if (format === 'json') {
        content = JSON.stringify(report, null, 2);
        contentType = 'application/json';
        filename = `analysis-${analysisId}.json`;
        
        // Validate JSON content
        try {
          validateReport(report);
        } catch (error) {
          console.warn(`Invalid JSON content for analysis ${analysisId}: ${error}`);
        }
      } else if (format === 'csv') {
        // Generate CSV from report
        content = generateCSV(report);
        contentType = 'text/csv';
        filename = `analysis-${analysisId}.csv`;
      } else {
        return NextResponse.json({ error: 'Invalid format. Use "json" or "csv"' }, { status: 400 });
      }

      // Set appropriate headers
      const headers = new Headers();
      headers.set('Content-Type', contentType);
      headers.set('Content-Disposition', `attachment; filename="${filename}"`);
      headers.set('Access-Control-Allow-Origin', '*');
      headers.set('Access-Control-Allow-Methods', 'GET, OPTIONS');
      headers.set('Access-Control-Allow-Headers', 'Content-Type');

      return new NextResponse(content, { status: 200, headers });
    }

    // On local development, check file storage
    // Check if analysis exists
    if (!analysisExists(analysisId)) {
      return NextResponse.json({ error: 'Analysis not found' }, { status: 404 });
    }

    // Get stored analysis
    const content = await getStoredAnalysis(analysisId, format as 'json' | 'csv');
    if (!content) {
      return NextResponse.json({ error: 'Analysis data not found' }, { status: 404 });
    }

    // Set appropriate headers
    const headers = new Headers();
    if (format === 'json') {
      headers.set('Content-Type', 'application/json');
      headers.set('Content-Disposition', `attachment; filename="analysis-${analysisId}.json"`);
      
      // Validate JSON content
      try {
        const report = JSON.parse(content);
        validateReport(report);
      } catch (error) {
        console.warn(`Invalid JSON content for analysis ${analysisId}: ${error}`);
      }
    } else if (format === 'csv') {
      headers.set('Content-Type', 'text/csv');
      headers.set('Content-Disposition', `attachment; filename="analysis-${analysisId}.csv"`);
    } else {
      return NextResponse.json({ error: 'Invalid format. Use "json" or "csv"' }, { status: 400 });
    }

    // Add CORS headers
    headers.set('Access-Control-Allow-Origin', '*');
    headers.set('Access-Control-Allow-Methods', 'GET, OPTIONS');
    headers.set('Access-Control-Allow-Headers', 'Content-Type');

    return new NextResponse(content, { status: 200, headers });

  } catch (error) {
    console.error('Get analysis API error:', error);
    
    return NextResponse.json({ 
      error: 'Failed to retrieve analysis',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

// Handle OPTIONS request for CORS
export async function OPTIONS() {
  const headers = new Headers();
  headers.set('Access-Control-Allow-Origin', '*');
  headers.set('Access-Control-Allow-Methods', 'GET, OPTIONS');
  headers.set('Access-Control-Allow-Headers', 'Content-Type');
  
  return new NextResponse(null, { status: 200, headers });
}

// Generate CSV content from report
function generateCSV(report: Report): string {
  const rows: Array<Record<string, string>> = [];

  // Add findings
  for (const finding of report.findings || []) {
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

  // Simple CSV generation
  if (rows.length === 0) {
    return 'Kind,Language,Component,Found Version,Required Version,Status,Reason,File,Quick Fix\n';
  }

  const headers = Object.keys(rows[0]).join(',');
  const csvRows = rows.map(row => 
    Object.values(row).map(value => 
      typeof value === 'string' && value.includes(',') ? `"${value}"` : value
    ).join(',')
  );

  return [headers, ...csvRows].join('\n');
}