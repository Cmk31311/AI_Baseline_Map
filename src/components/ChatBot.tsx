import React, { useState, useRef, useEffect } from 'react';
import { getActiveProvider } from '../config/aiConfig';
import type { AIProvider } from '../config/aiConfig';

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
  const [currentProvider] = useState<AIProvider | null>(getActiveProvider());
  
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      text: `Hello! I'm the Baseline Bot 🤖 powered by ${currentProvider?.name || 'Multiple AI Models'}! I can help you with web development, CSS, JavaScript, HTML, and browser compatibility questions.\n\nTry asking me anything!`,
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
          return; // Success, exit early
        } else {
          throw new Error(`${currentProvider.name} API Error`);
        }
      } catch (error) {
        console.log(`${currentProvider.name} error:`, error);
        // Continue to fallback providers
      }
    }

    // Fallback to Ollama if primary provider fails
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);

      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'tinyllama',
          prompt: userMessage.text,
          stream: false,
          options: { 
            temperature: 0.7, 
            max_tokens: 100,
            num_predict: 100
          }
        }),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (response.ok) {
        const data = await response.json();
        const aiResponse = data.response || "I'm here to help!";
        
        const aiMessage: Message = {
          id: Date.now() + 1,
          text: aiResponse,
          isUser: false,
          timestamp: new Date()
        };
        setMessages(prev => [...prev, aiMessage]);
        return; // Success, exit early
      } else {
        throw new Error('Ollama API Error');
      }
    } catch (error) {
      console.log('Ollama fallback error:', error);
      
      // Final fallback to intelligent responses
      const userInput = userMessage.text.toLowerCase();
      let fallbackResponse = "";
      
      if (userInput.includes('hello') || userInput.includes('hi')) {
        fallbackResponse = "Hello! I'm the Baseline Bot. I can help you with web features and compatibility questions.";
      } else if (userInput.includes('how are you')) {
        fallbackResponse = "I'm doing great! I'm here to help you understand web features and their Baseline status.";
      } else if (userInput.includes('css')) {
        fallbackResponse = "CSS (Cascading Style Sheets) is used to style web pages. I can help you understand CSS properties and their browser compatibility.";
      } else if (userInput.includes('javascript')) {
        fallbackResponse = "JavaScript is a programming language for web development. I can help you with JavaScript APIs and browser support.";
      } else if (userInput.includes('html')) {
        fallbackResponse = "HTML (HyperText Markup Language) is the standard markup language for web pages. I can help you with HTML elements and features.";
      } else if (userInput.includes('baseline')) {
        fallbackResponse = "Baseline indicates when web features are safe to use across browsers. 'Widely' = safe everywhere, 'Newly' = recently reached baseline, 'Limited' = not yet baseline.";
      } else {
        fallbackResponse = `You asked: "${userMessage.text}". I'm here to help with web development questions! Ask me about CSS, JavaScript, HTML, or browser compatibility.`;
      }
      
      const fallbackMessage: Message = {
        id: Date.now() + 1,
        text: fallbackResponse,
        isUser: false,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, fallbackMessage]);
    } finally {
      setIsTyping(false);
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
