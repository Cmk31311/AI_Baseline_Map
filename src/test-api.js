// Simple test to check Ollama API
const testAPI = async () => {
  try {
    console.log('Testing Ollama API...');
    
    const response = await fetch('/api/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'tinyllama',
        prompt: 'Say hello',
        stream: false,
        options: { max_tokens: 10 }
      })
    });

    if (response.ok) {
      const data = await response.json();
      console.log('✅ API Working! Response:', data.response);
      return true;
    } else {
      console.log('❌ API Error:', response.status);
      return false;
    }
  } catch (error) {
    console.log('❌ Connection Error:', error);
    return false;
  }
};

// Run test when page loads
if (typeof window !== 'undefined') {
  window.testAPI = testAPI;
  console.log('Run testAPI() in browser console to test connection');
}



