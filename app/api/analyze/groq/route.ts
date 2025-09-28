import { NextRequest, NextResponse } from 'next/server';
import Groq from 'groq-sdk';

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

interface GroqAnalysisRequest {
  code: string;
  filename: string;
  projectType?: string;
  dependencies?: string[];
}

export async function POST(request: NextRequest) {
  try {
    const { code, filename }: GroqAnalysisRequest = await request.json();

    if (!code || !filename) {
      return NextResponse.json({ error: 'Code and filename are required' }, { status: 400 });
    }

    // Check if API key is available
    if (!process.env.GROQ_API_KEY) {
      return NextResponse.json({ 
        error: 'GROQ_API_KEY not configured. Please add it to your environment variables.' 
      }, { status: 500 });
    }

    // Skip analysis for build/vendor files
    const skipPatterns = [
      /node_modules/,
      /\.git/,
      /dist/,
      /build/,
      /\.next/,
      /vendor/,
      /\.cache/,
      /coverage/,
      /\.env/,
      /package-lock\.json/,
      /yarn\.lock/,
      /\.log$/
    ];

    if (skipPatterns.some(pattern => pattern.test(filename))) {
      return NextResponse.json({ 
        error: 'Skipping analysis for build/vendor files' 
      }, { status: 400 });
    }

    // Mask secrets in code
    const maskedCode = code
      .replace(/(api[_-]?key|secret|password|token)\s*[:=]\s*["']?[^"'\s]+["']?/gi, '$1 = "•••"')
      .replace(/(bearer|authorization)\s*:\s*["']?[^"'\s]+["']?/gi, '$1: "•••"')
      .replace(/["'][a-zA-Z0-9]{20,}["']/g, '"•••"')
      .substring(0, 200); // Limit to 200 characters to avoid rate limits

    const completion = await groq.chat.completions.create({
      messages: [
        {
          role: "system",
          content: `Analyze code for web compatibility. Return:

## Summary
[Brief overview]

## Score: [0-100] - [PASS/WARN/FAIL]

## Findings
| Severity | Finding | Fix |
|----------|---------|-----|
| [HIGH/MED/LOW] | [Issue] | [Solution] |

## Auto-Fix
\`\`\`[language]
[Code changes]
\`\`\`

## Next Steps
1. [Recommendation 1]
2. [Recommendation 2]

Keep it short.`
        },
        {
          role: "user",
          content: `File: ${filename}

\`\`\`${filename.split('.').pop() || 'text'}
${maskedCode}
\`\`\`

Analyze compatibility.`
        }
      ],
      model: "llama-3.1-8b-instant",
      max_tokens: 300,
      temperature: 0.3,
    });

    const analysis = completion.choices[0]?.message?.content;
    
    if (!analysis) {
      return NextResponse.json({ error: 'No analysis generated' }, { status: 500 });
    }

    return NextResponse.json({ 
      analysis,
      filename,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Groq analysis error:', error);
    return NextResponse.json({ 
      error: 'Analysis failed', 
      details: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 });
  }
}
