import { NextRequest, NextResponse } from 'next/server';
import Groq from 'groq-sdk';

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const { messages } = await request.json();

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json({ error: 'Invalid messages format' }, { status: 400 });
    }

    const lastMessage = messages[messages.length - 1];
    if (!lastMessage || !lastMessage.content) {
      return NextResponse.json({ error: 'No message content provided' }, { status: 400 });
    }

    // Check if API key is available
    if (!process.env.GROQ_API_KEY) {
      return NextResponse.json({ 
        error: 'GROQ_API_KEY not configured. Please add it to your environment variables.' 
      }, { status: 500 });
    }

    // Initialize Groq client
    const groq = new Groq({
      apiKey: process.env.GROQ_API_KEY,
    });

    // Create streaming response
    const stream = new ReadableStream({
      async start(controller) {
        const encoder = new TextEncoder();
        
        try {
          const systemPrompt = `You are a helpful AI assistant that provides information about web development, browser compatibility, and modern web technologies. Answer questions about CSS, JavaScript, HTML, and web APIs with accurate and helpful information.`;

          const completion = await groq.chat.completions.create({
            messages: [
              {
                role: "system",
                content: systemPrompt
              },
              ...messages.map((m: { role: string; content: string }) => ({
                role: m.role as 'user' | 'assistant' | 'system',
                content: m.content,
              }))
            ],
            model: "llama-3.1-8b-instant",
            stream: true,
            max_tokens: 2000,
            temperature: 0.3,
          });

          for await (const chunk of completion) {
            const content = chunk.choices[0]?.delta?.content;
            if (content) {
              controller.enqueue(encoder.encode(content));
            }
          }
          
          controller.close();
        } catch (error) {
          console.error('Groq API error:', error);
          const errorMessage = 'Sorry, I encountered an error. Please try again.';
          controller.enqueue(encoder.encode(errorMessage));
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/plain',
        'Cache-Control': 'no-cache, no-transform',
        'Connection': 'keep-alive',
      },
    });

  } catch (error) {
    console.error('Chat API error:', error);
    return NextResponse.json({ 
      error: 'Internal server error', 
      details: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 });
  }
}