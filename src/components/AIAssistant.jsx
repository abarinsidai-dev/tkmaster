import { useState } from 'react';
import { Sparkles, Send, X, Bot } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import './AIAssistant.css';

export default function AIAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [prompt, setPrompt] = useState('');
  const [messages, setMessages] = useState([
    { role: 'ai', content: "Hi! I'm your AI concierge. Tell me what kind of vibe you're looking for, who you're going with, or what you like, and I'll find the perfect event for you!" }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSend = async (e) => {
    e.preventDefault();
    if (!prompt.trim() || isLoading) return;

    const userMessage = prompt;
    setPrompt('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setIsLoading(true);

    try {
      const API_BASE = import.meta.env.VITE_API_URL || '';
      const response = await fetch(`${API_BASE}/api/recommend`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: userMessage })
      });

      if (!response.ok) throw new Error('AI recommendation failed');

      const data = await response.json();
      
      setMessages(prev => [
        ...prev, 
        { 
          role: 'ai', 
          content: data.reason,
          event: data.event 
        }
      ]);
    } catch (error) {
      setMessages(prev => [...prev, { role: 'ai', content: "Sorry, I'm having trouble connecting to my brain right now. Please try again later!" }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Floating Action Button */}
      {!isOpen && (
        <button className="ai-fab animate-fade-in" onClick={() => setIsOpen(true)}>
          <Sparkles size={24} />
          <span>Ask AI</span>
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div className="ai-chat-window animate-fade-in">
          <div className="ai-chat-header">
            <div className="ai-header-title">
              <Bot size={20} className="text-accent" />
              <span>AI Concierge</span>
            </div>
            <button className="close-btn" onClick={() => setIsOpen(false)}><X size={18} /></button>
          </div>

          <div className="ai-chat-messages">
            {messages.map((msg, idx) => (
              <div key={idx} className={`message-bubble ${msg.role}`}>
                {msg.role === 'ai' && <Bot size={16} className="message-icon" />}
                <div className="message-content">
                  <p>{msg.content}</p>
                  
                  {msg.event && (
                    <div className="ai-event-card" onClick={() => { setIsOpen(false); navigate(`/event/${msg.event.id}`); }}>
                      <img src={msg.event.image} alt={msg.event.title} />
                      <div className="ai-event-info">
                        <strong>{msg.event.title}</strong>
                        <span>{msg.event.date}</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="message-bubble ai">
                <Bot size={16} className="message-icon" />
                <div className="typing-indicator">
                  <span></span><span></span><span></span>
                </div>
              </div>
            )}
          </div>

          <form className="ai-chat-input-area" onSubmit={handleSend}>
            <input 
              type="text" 
              placeholder="E.g., I want to take my kids to something magical..."
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              disabled={isLoading}
            />
            <button type="submit" disabled={!prompt.trim() || isLoading}>
              <Send size={18} />
            </button>
          </form>
        </div>
      )}
    </>
  );
}
