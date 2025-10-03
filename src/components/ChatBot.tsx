'use client';

import React, { useState, useRef, useEffect } from 'react';

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
      text: "Hello! I'm the Baseline Web Features Bot 🤖! I have access to the most current web platform features data from the official web-features database.\n\nI can help you with:\n• **Accurate baseline status** of web features (🟢 Widely/🟡 Newly/🔴 Limited availability)\n• **Real-time browser support** information from current data\n• **Specific feature details** including specs, Can I Use links, and dates\n• **CSS features** like Grid, Flexbox, Container Queries, Custom Properties\n• **JavaScript APIs** and their current compatibility status\n• **Progressive enhancement** strategies and best practices\n• **Feature detection** recommendations\n\nAsk me about any specific web feature (like 'CSS Grid' or 'Fetch API') and I'll give you the most up-to-date information from our database!",
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
      // Create AI message placeholder for streaming
      const aiMessageId = Date.now() + 1;
            const aiMessage: Message = {
        id: aiMessageId,
        text: '',
              isUser: false,
              timestamp: new Date()
            };
            setMessages(prev => [...prev, aiMessage]);

      // Call our streaming chat API
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: [
            ...messages.map(m => ({ role: m.isUser ? 'user' : 'assistant', content: m.text })),
            { role: 'user', content: userMessage.text }
          ]
        })
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      if (!response.body) {
        throw new Error('No response body');
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let accumulatedText = '';

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        accumulatedText += chunk;

        // Update the AI message with accumulated text
        setMessages(prev => prev.map(msg => 
          msg.id === aiMessageId 
            ? { ...msg, text: accumulatedText }
            : msg
        ));
      }

      setIsTyping(false);
    } catch (error) {
      console.error('Chat error:', error);
      
      // Show error message
      const errorMessage: Message = {
        id: Date.now() + 2,
        text: 'Sorry, I encountered an error. Please check if GROQ_API_KEY is configured and try again.',
        isUser: false,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
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
    <div style={{
      width: '100%',
      height: '100%',
      backgroundColor: 'var(--panel)',
      borderRadius: '12px',
      boxShadow: '0 8px 32px var(--shadow-lg)',
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden',
      border: '1px solid var(--border)'
    }}>
      {/* Header */}
      <div style={{
        padding: '16px',
        borderBottom: '1px solid var(--border)',
        backgroundColor: 'var(--bg-secondary)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{ fontSize: '20px' }}>🤖</div>
          <span style={{ fontWeight: '600', color: 'var(--ink)' }}>AI Assistant</span>
          </div>
        <button 
          onClick={onClose}
          style={{
            background: 'none',
            border: 'none',
            fontSize: '16px',
            cursor: 'pointer',
            padding: '4px',
            color: 'var(--muted)',
            borderRadius: '4px'
          }}
          onMouseEnter={(e) => (e.target as HTMLElement).style.backgroundColor = 'var(--panel-hover)'}
          onMouseLeave={(e) => (e.target as HTMLElement).style.backgroundColor = 'transparent'}
        >
            ✕
          </button>
      </div>

      {/* Messages */}
      <div style={{
        flex: 1,
        padding: '16px',
        overflowY: 'auto',
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
        backgroundColor: 'var(--bg)'
      }}>
        {messages.map((message) => (
          <div key={message.id} style={{
            display: 'flex',
            justifyContent: message.isUser ? 'flex-end' : 'flex-start'
          }}>
            <div style={{
              maxWidth: '80%',
              padding: '12px 16px',
              borderRadius: '12px',
              backgroundColor: message.isUser ? 'var(--blue)' : 'var(--panel)',
              color: message.isUser ? 'white' : 'var(--ink)',
              whiteSpace: 'pre-wrap',
              lineHeight: '1.5',
              border: message.isUser ? 'none' : '1px solid var(--border)'
            }}>
              {message.text}
            </div>
          </div>
        ))}
        
        {isTyping && (
          <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
            <div style={{
              padding: '12px 16px',
              borderRadius: '12px',
              backgroundColor: 'var(--panel)',
              color: 'var(--ink)',
              border: '1px solid var(--border)'
            }}>
              <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
                <span>Thinking</span>
                <div style={{ display: 'flex', gap: '2px' }}>
                  <div style={{ 
                    width: '4px', 
                    height: '4px', 
                    backgroundColor: 'var(--blue)', 
                    borderRadius: '50%',
                    animation: 'bounce 1.4s infinite ease-in-out'
                  }}></div>
                  <div style={{ 
                    width: '4px', 
                    height: '4px', 
                    backgroundColor: 'var(--blue)', 
                    borderRadius: '50%',
                    animation: 'bounce 1.4s infinite ease-in-out',
                    animationDelay: '0.16s'
                  }}></div>
                  <div style={{ 
                    width: '4px', 
                    height: '4px', 
                    backgroundColor: 'var(--blue)', 
                    borderRadius: '50%',
                    animation: 'bounce 1.4s infinite ease-in-out',
                    animationDelay: '0.32s'
                  }}></div>
                </div>
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div style={{
        padding: '16px',
        borderTop: '1px solid var(--border)',
        display: 'flex',
        gap: '8px',
        backgroundColor: 'var(--bg-secondary)'
      }}>
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Ask about web features, baseline status, browser compatibility..."
          style={{
            flex: 1,
            padding: '12px',
            border: '1px solid var(--border)',
            borderRadius: '8px',
            outline: 'none',
            fontSize: '14px',
            backgroundColor: 'var(--panel)',
            color: 'var(--ink)',
            // @ts-expect-error - CSS pseudo-selector
            '::placeholder': {
              color: 'var(--muted)'
            }
          }}
        />
        <button 
          onClick={handleSendMessage}
          disabled={!inputText.trim()}
          style={{
            padding: '12px 16px',
            backgroundColor: inputText.trim() ? 'var(--blue)' : 'var(--muted)',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: inputText.trim() ? 'pointer' : 'not-allowed',
            fontSize: '14px',
            fontWeight: '500'
          }}
        >
          Send
        </button>
      </div>

      <style jsx>{`
        @keyframes bounce {
          0%, 80%, 100% {
            transform: scale(0);
          }
          40% {
            transform: scale(1);
          }
        }
      `}</style>
    </div>
  );
}
