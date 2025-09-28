import { NextRequest, NextResponse } from 'next/server';
import Groq from 'groq-sdk';

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

interface GroqAnalysisRequest {
  code: string;
  filename: string;
  projectType?: string;
  dependencies?: string[];
}

/**
 * Get file type description for better analysis context
 */
function getFileTypeDescription(extension: string): string {
  const typeMap: Record<string, string> = {
    'html': 'HTML',
    'htm': 'HTML',
    'css': 'CSS',
    'js': 'JavaScript',
    'mjs': 'JavaScript ES Module',
    'ts': 'TypeScript',
    'svg': 'SVG',
    'wasm': 'WebAssembly',
    'json': 'JSON',
    'webmanifest': 'Web App Manifest'
  };
  
  return typeMap[extension] || 'web file';
}

/**
 * Get maximum code length based on file type
 */
function getMaxCodeLength(extension: string): number {
  const lengthMap: Record<string, number> = {
    'html': 3000,    // HTML can be longer for baseline analysis
    'htm': 3000,
    'css': 2500,     // CSS can be longer for baseline analysis
    'js': 2000,      // JavaScript for baseline analysis
    'mjs': 2000,
    'ts': 2000,      // TypeScript for baseline analysis
    'svg': 1500,     // SVG for baseline analysis
    'wasm': 500,     // WebAssembly (binary, limited text)
    'json': 1000,    // JSON for baseline analysis
    'webmanifest': 800 // Web manifest for baseline analysis
  };
  
  return lengthMap[extension] || 1500;
}

export async function POST(request: NextRequest) {
  try {
    const { code, filename }: GroqAnalysisRequest = await request.json();

    if (!code || !filename) {
      return NextResponse.json({ error: 'Code and filename are required' }, { status: 400 });
    }

    // Check if API key is available
    if (!process.env.GROQ_API_KEY) {
      console.error('GROQ_API_KEY not found in environment variables');
      return NextResponse.json({ 
        error: 'GROQ_API_KEY not configured. Please add it to your environment variables.' 
      }, { status: 500 });
    }
    
    console.log('GROQ_API_KEY found:', process.env.GROQ_API_KEY.substring(0, 10) + '...');

    // Initialize Groq client only when needed
    const groq = new Groq({
      apiKey: process.env.GROQ_API_KEY,
    });

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
      /\.log$/,
      /\.lock$/,
      /\.min\./,
      /\.bundle\./
    ];

    if (skipPatterns.some(pattern => pattern.test(filename))) {
      return NextResponse.json({ 
        error: 'Skipping analysis for build/vendor files' 
      }, { status: 400 });
    }

    // Determine file type for better analysis
    const fileExt = filename.split('.').pop()?.toLowerCase() || '';
    const fileType = getFileTypeDescription(fileExt);
    
    // Mask secrets in code and limit size based on file type
    const maxCodeLength = getMaxCodeLength(fileExt);
    const maskedCode = code
      .replace(/(api[_-]?key|secret|password|token)\s*[:=]\s*["']?[^"'\s]+["']?/gi, '$1 = "•••"')
      .replace(/(bearer|authorization)\s*:\s*["']?[^"'\s]+["']?/gi, '$1: "•••"')
      .replace(/["'][a-zA-Z0-9]{20,}["']/g, '"•••"')
      .replace(/(https?:\/\/[^\s"']+)/gi, 'https://example.com')
      .replace(/([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/gi, 'user@example.com')
      .substring(0, maxCodeLength);
    
    console.log(`Processing ${filename}: ${code.length} chars -> ${maskedCode.length} chars (max: ${maxCodeLength})`);
    
    const completion = await groq.chat.completions.create({
      messages: [
        {
          role: "system",
          content: `You are a Baseline Web Features expert. Analyze ${fileType} files against baseline web standards and modern browser compatibility.

**Baseline Web Features Focus:**
- Widely Available features (safe everywhere)
- Newly Available features (recently reached baseline)
- Limited Availability features (use with caution)
- Browser support and compatibility
- Modern web APIs and standards
- Performance and accessibility

**Analysis Requirements:**
1. Identify specific baseline web features used
2. Check browser compatibility for each feature
3. Flag deprecated or non-baseline APIs
4. Provide specific fixes and alternatives
5. Rate overall baseline compliance

Return analysis in this exact format:

## Summary
[2-3 sentence overview of baseline web feature compliance]

## Score: [0-100] - [PASS/WARN/FAIL]
[PASS: 85-100, WARN: 70-84, FAIL: 0-69]

## Baseline Features Analysis
| Feature | Status | Browser Support | Recommendation |
|---------|--------|-----------------|----------------|
| [Feature name] | [Widely Available/Newly Available/Limited] | [Support details] | [Action needed] |

## Issues Found
| Severity | Issue | Affected Feature | Fix |
|----------|-------|------------------|-----|
| HIGH/MED/LOW | [Specific problem] | [Baseline feature] | [Specific solution] |

## Code Improvements
\`\`\`${fileExt}
[Specific code changes with baseline-compliant alternatives]
\`\`\`

## Next Steps
1. [Priority baseline compliance action]
2. [Browser support improvement]
3. [Modern web standard adoption]

Focus on baseline web features and browser compatibility.`
        },
        {
          role: "user",
          content: `Analyze this ${fileType} file for baseline web feature compliance:

**File:** ${filename}
**Type:** ${fileExt.toUpperCase()}

\`\`\`${fileExt}
${maskedCode}
\`\`\`

Provide a detailed baseline web features analysis focusing on:
- Which baseline web features are used
- Browser compatibility for each feature
- Deprecated or non-baseline APIs
- Specific fixes for better baseline compliance
- Modern web standards adoption`
        }
      ],
      model: "llama-3.1-8b-instant",
      max_tokens: 1200,
      temperature: 0.1,
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
