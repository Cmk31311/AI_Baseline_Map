// Test script to verify Ollama connection
const testOllama = async () => {
  try {
    console.log('Testing Ollama connection...');
    
    const response = await fetch('/api/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama3.2',
        prompt: 'Hello, respond with just "AI is working"',
        stream: false,
        options: {
          temperature: 0.1,
          max_tokens: 10
        }
      })
    });

    if (response.ok) {
      const data = await response.json();
      console.log('✅ Ollama is working! Response:', data.response);
      return true;
    } else {
      console.log('❌ Ollama API error:', response.status);
      return false;
    }
  } catch (error) {
    console.log('❌ Ollama connection failed:', error);
    return false;
  }
};

// Run test when page loads
if (typeof window !== 'undefined') {
  window.testOllama = testOllama;
  console.log('Run testOllama() in browser console to test connection');
}



