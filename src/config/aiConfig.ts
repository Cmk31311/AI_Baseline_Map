export const aiConfig = {
  groq: {
    apiKey: process.env.GROQ_API_KEY || '',
    model: 'llama-3.1-70b-versatile',
    maxTokens: 4000,
    temperature: 0.1,
  },
  analysis: {
    maxCodeLength: 50000,
    timeout: 30000,
  }
}
