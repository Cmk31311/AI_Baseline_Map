import { NextRequest, NextResponse } from 'next/server';
import { getStoredAnalysis, analysisExists } from '../../../../lib/files/store';
import { validateReport } from '../../../../lib/analysis/baseline.types';

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

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
