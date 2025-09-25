// AI Configuration - Multiple LLM Providers
export interface AIProvider {
  name: string;
  apiUrl: string;
  apiKey?: string;
  model: string;
  headers: Record<string, string>;
  body: (prompt: string) => any;
  parseResponse: (data: any) => string;
  enabled: boolean;
}

export const AI_PROVIDERS: Record<string, AIProvider> = {
  // Groq API - Fast and Free (Recommended)
  groq: {
    name: 'Groq',
    apiUrl: 'https://api.groq.com/openai/v1/chat/completions',
    apiKey: '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', // Replace with your Groq API key
    model: 'llama-3.1-8b-instant',
    enabled: true,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer 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'
    },
    body: (prompt: string) => ({
      model: 'llama-3.1-8b-instant',
      messages: [
        {
          role: 'system',
          content: 'You are a helpful web development assistant specializing in Baseline features and browser compatibility. Keep responses concise and helpful.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      max_tokens: 200,
      temperature: 0.7
    }),
    parseResponse: (data: any) => data.choices?.[0]?.message?.content || "I'm here to help!"
  },

  // OpenAI API - Most Reliable
  openai: {
    name: 'OpenAI',
    apiUrl: 'https://api.openai.com/v1/chat/completions',
    apiKey: 'sk-your_openai_api_key_here', // Replace with your OpenAI API key
    model: 'gpt-3.5-turbo',
    enabled: false, // Disabled by default (requires API key)
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer sk-your_openai_api_key_here'
    },
    body: (prompt: string) => ({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: 'You are a helpful web development assistant specializing in Baseline features and browser compatibility. Keep responses concise and helpful.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      max_tokens: 200,
      temperature: 0.7
    }),
    parseResponse: (data: any) => data.choices?.[0]?.message?.content || "I'm here to help!"
  },

  // Google Gemini API - Free tier available
  gemini: {
    name: 'Google Gemini',
    apiUrl: 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent',
    apiKey: 'your_gemini_api_key_here', // Replace with your Gemini API key
    model: 'gemini-pro',
    enabled: false, // Disabled by default (requires API key)
    headers: {
      'Content-Type': 'application/json'
    },
    body: (prompt: string) => ({
      contents: [{
        parts: [{
          text: `You are a helpful web development assistant specializing in Baseline features and browser compatibility. Keep responses concise and helpful.\n\nUser: ${prompt}`
        }]
      }],
      generationConfig: {
        maxOutputTokens: 200,
        temperature: 0.7
      }
    }),
    parseResponse: (data: any) => data.candidates?.[0]?.content?.parts?.[0]?.text || "I'm here to help!"
  },

  // Hugging Face Inference API - Free tier
  huggingface: {
    name: 'Hugging Face',
    apiUrl: 'https://api-inference.huggingface.co/models/microsoft/DialoGPT-medium',
    apiKey: 'hf_your_huggingface_token_here', // Replace with your Hugging Face token
    model: 'microsoft/DialoGPT-medium',
    enabled: false, // Disabled by default (requires API key)
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer hf_your_huggingface_token_here'
    },
    body: (prompt: string) => ({
      inputs: prompt,
      parameters: {
        max_length: 200,
        temperature: 0.7
      }
    }),
    parseResponse: (data: any) => Array.isArray(data) ? data[0]?.generated_text || "I'm here to help!" : data.generated_text || "I'm here to help!"
  },

  // Ollama - Local (fallback)
  ollama: {
    name: 'Ollama (Local)',
    apiUrl: '/api/generate',
    model: 'tinyllama',
    enabled: true,
    headers: {
      'Content-Type': 'application/json'
    },
    body: (prompt: string) => ({
      model: 'tinyllama',
      prompt: prompt,
      stream: false,
      options: { 
        temperature: 0.7, 
        max_tokens: 100,
        num_predict: 100
      }
    }),
    parseResponse: (data: any) => data.response || "I'm here to help!"
  }
};

// Get the first enabled provider
export const getActiveProvider = (): AIProvider | null => {
  const enabledProviders = Object.values(AI_PROVIDERS).filter(provider => provider.enabled);
  return enabledProviders.length > 0 ? enabledProviders[0] : null;
};

// Get provider by name
export const getProvider = (name: string): AIProvider | null => {
  return AI_PROVIDERS[name] || null;
};
