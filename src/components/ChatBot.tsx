import React, { useState, useRef, useEffect } from 'react';
import { getActiveProvider } from '../config/aiConfig';

interface ChatBotProps {
  onClose: () => void;
}

interface Message {
  id: number;
  text: string;
  isUser: boolean;
  timestamp: Date;
}


export default function ChatBot({ onClose }: ChatBotProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      text: `Hello! I'm the Baseline Bot 🤖 powered by GROQ AI! I can help you with web development, CSS, JavaScript, HTML, and browser compatibility questions.\n\nTry asking me anything!`,
      isUser: false,
      timestamp: new Date()
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async () => {
    if (!inputText.trim()) return;

    const userMessage: Message = {
      id: Date.now(),
      text: inputText,
      isUser: true,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setIsTyping(true);

    try {
      // Get the current active provider dynamically
      const currentProvider = getActiveProvider();
      
      // Try the active AI provider first
      if (currentProvider) {
        try {
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 8000); // 8 second timeout

          const response = await fetch(currentProvider.apiUrl, {
            method: 'POST',
            headers: currentProvider.headers,
            body: JSON.stringify(currentProvider.body(userMessage.text)),
            signal: controller.signal
          });

          clearTimeout(timeoutId);

          if (response.ok) {
            const data = await response.json();
            const aiResponse = currentProvider.parseResponse(data);
            
            const aiMessage: Message = {
              id: Date.now() + 1,
              text: aiResponse,
              isUser: false,
              timestamp: new Date()
            };
            setMessages(prev => [...prev, aiMessage]);
            setIsTyping(false); // Hide thinking icon when response received
            return; // Success, exit early
          } else {
            throw new Error(`${currentProvider.name} API Error`);
          }
        } catch (error) {
          console.log(`${currentProvider.name} error:`, error);
          // Continue to fallback providers
        }
      }

      // If GROQ fails, show helpful message with demo responses
      console.log('GROQ API failed, showing demo responses');
      
      // Provide intelligent demo responses based on user input
      const userInput = userMessage.text.toLowerCase();
      let demoResponse = "";
      
      if (userInput.includes('hello') || userInput.includes('hi') || userInput.includes('hey')) {
        demoResponse = "Hello! I'm the Baseline Bot 🤖. I can help you with web development questions! Ask me about CSS, JavaScript, HTML, or browser compatibility.";
      } else if (userInput.includes('css') || userInput.includes('style')) {
        demoResponse = "CSS is great! I can help with CSS properties, layouts, and browser compatibility. What specific CSS question do you have?";
      } else if (userInput.includes('javascript') || userInput.includes('js')) {
        demoResponse = "JavaScript is powerful! I can assist with ES6 features, DOM manipulation, and modern JavaScript concepts. What would you like to know?";
      } else if (userInput.includes('html')) {
        demoResponse = "HTML is the foundation of web development! I can help with semantic elements, accessibility, and modern HTML features.";
      } else if (userInput.includes('browser') || userInput.includes('compatibility')) {
        demoResponse = "Browser compatibility is crucial! I can help you understand which features work across different browsers and their Baseline status.";
      } else if (userInput.includes('baseline')) {
        demoResponse = "Baseline indicates when web features are safe to use! 'Widely' = safe everywhere, 'Newly' = recently reached baseline, 'Limited' = not yet baseline.";
      } else if (userInput.includes('api') || userInput.includes('key')) {
        demoResponse = "To get a real GROQ API key: 1) Go to https://console.groq.com/ 2) Sign up for free 3) Create an API key 4) Replace the key in .env.local file";
      } else {
        demoResponse = `You asked: "${userMessage.text}". I'm here to help with web development! Ask me about CSS, JavaScript, HTML, or browser compatibility. To get real AI responses, add your GROQ API key to .env.local`;
      }
      
      const demoMessage: Message = {
        id: Date.now() + 1,
        text: demoResponse,
        isUser: false,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, demoMessage]);
      setIsTyping(false);
    } catch (finalError) {
      console.error('All requests failed:', finalError);
      const errorMessage: Message = {
        id: Date.now() + 1,
        text: "I'm here to help with web development questions! Ask me about CSS, JavaScript, HTML, or browser compatibility.",
        isUser: false,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsTyping(false); // Ensure thinking icon is always hidden
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="chatbot">
      <div className="chatbot-header">
        <div className="chatbot-title">
          <div className="ai-icon-small">
            <svg viewBox="0 0 24 24" className="ai-brain-small">
              <defs>
                <linearGradient id="brainGradientSmall" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#00d4ff" />
                  <stop offset="50%" stopColor="#7c3aed" />
                  <stop offset="100%" stopColor="#ec4899" />
                </linearGradient>
              </defs>
              <path d="M12 2C8.5 2 6 4.5 6 8c0 1.5.5 2.8 1.2 3.8-.7 1.2-1.2 2.5-1.2 3.9 0 3.3 2.7 6 6 6s6-2.7 6-6c0-1.4-.5-2.7-1.2-3.9.7-1 1.2-2.3 1.2-3.8 0-3.5-2.5-6-6-6z" fill="url(#brainGradientSmall)" />
              <rect x="10" y="10" width="4" height="4" rx="1" fill="url(#brainGradientSmall)" opacity="0.8" />
            </svg>
          </div>
          Baseline Bot
        </div>
        <div className="chatbot-controls">
          <button className="btn btn-close" onClick={onClose} aria-label="Close chat">
            ✕
          </button>
        </div>
      </div>

      <div className="chatbot-messages">
        {messages.map((message) => (
          <div key={message.id} className={`chat-msg ${message.isUser ? 'user' : 'assistant'}`}>
            <div className="bubble">
              {message.text}
            </div>
          </div>
        ))}
        
        {isTyping && (
          <div className="chat-msg assistant">
            <div className="bubble typing-indicator">
              <div className="typing-dots">
                <span></span>
                <span></span>
                <span></span>
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      <div className="chatbot-input">
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Ask about web features..."
          className="chat-input"
        />
        <button 
          className="btn btn-send" 
          onClick={handleSendMessage}
          disabled={!inputText.trim()}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/>
          </svg>
        </button>
      </div>
    </div>
  );
}
