import { useState, useEffect, useRef } from 'react';
import { MessageSquare, Send, X, ChevronRight } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { api } from '@/lib/api';

type ChatRow = { from: 'user' | 'bot'; text: string };

const PREDEFINED_QUESTIONS = [
  "How to track my order?",
  "Return and Refund policy?",
  "Check latest collection",
  "Contact customer support"
];

const getBotReply = (question: string) => {
  const q = question.toLowerCase();
  if (q.includes('track') || q.includes('order status')) {
    return 'You can track your order in the "My Orders" section of your Account. We also send tracking links via email once the order is shipped.';
  }
  if (q.includes('return') || q.includes('refund') || q.includes('policy')) {
    return 'We offer a 5-day return/refund window for all unused items. You can initiate a return directly from your Account page under order details.';
  }
  if (q.includes('collection') || q.includes('latest') || q.includes('new')) {
    return 'Our latest collection features premium ethnic wear and trendy western outfits. Check them out on our home page or click "Collection" in the menu!';
  }
  if (q.includes('contact') || q.includes('support') || q.includes('help')) {
    return 'You can reach us via WhatsApp (green icon), or visit our Customer Care page to raise a formal ticket. Our team responds within 24 hours.';
  }
  if (q.includes('hi') || q.includes('hello')) {
    return 'Hello! Welcome to Devanshi Collection. How can I assist you today? You can ask about orders, returns, or our products.';
  }
  return 'I am not sure I understand. Could you please rephrase? You can also contact our support team directly for complex queries.';
};

const ChatbotWidget = () => {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<ChatRow[]>([
    { from: 'bot', text: 'Hi! I am your Devanshi Assistant. How can I help you today?' },
  ]);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, open]);

  const handleAction = async (text: string) => {
    const answer = getBotReply(text);
    setMessages((prev) => [...prev, { from: 'user', text }, { from: 'bot', text: answer }]);
    
    await api.post('/chatbot', {
      user_id: user?.id || null,
      question: text,
      answer,
      page_url: window.location.href,
      user_agent: navigator.userAgent,
    });
  };

  const sendMessage = () => {
    const question = input.trim();
    if (!question) return;
    handleAction(question);
    setInput('');
  };

  return (
    <div className="fixed bottom-20 right-4 z-[60]">
      {open && (
        <div className="mb-3 w-[320px] rounded-2xl border border-border bg-background shadow-2xl overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-300">
          <div className="bg-primary p-4 text-primary-foreground">
            <div className="flex items-center justify-between mb-1">
              <p className="font-display font-bold">Devanshi Chat</p>
              <button onClick={() => setOpen(false)} className="rounded-full p-1 hover:bg-white/20 transition-colors">
                <X className="h-4 w-4" />
              </button>
            </div>
            <p className="text-[10px] opacity-80 uppercase tracking-widest font-body">Online Support</p>
          </div>

          <div ref={scrollRef} className="h-80 overflow-y-auto p-4 space-y-3 bg-secondary/10">
            {messages.map((m, idx) => (
              <div key={idx} className={`flex ${m.from === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] text-xs font-body px-3 py-2.5 rounded-2xl shadow-sm ${
                  m.from === 'user' 
                    ? 'bg-primary text-primary-foreground rounded-tr-none' 
                    : 'bg-background border border-border rounded-tl-none'
                }`}>
                  {m.text}
                </div>
              </div>
            ))}
            
            {/* Predefined Questions */}
            {messages.length === 1 && (
              <div className="pt-2 space-y-2">
                <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider">Suggested Questions</p>
                {PREDEFINED_QUESTIONS.map((q, i) => (
                  <button
                    key={i}
                    onClick={() => handleAction(q)}
                    className="w-full text-left px-3 py-2 bg-background border border-border rounded-xl text-xs font-body hover:border-primary hover:text-primary transition-all flex items-center justify-between group"
                  >
                    {q}
                    <ChevronRight className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="p-3 bg-background border-t border-border flex items-center gap-2">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  sendMessage();
                }
              }}
              className="flex-1 px-4 py-2 text-sm border border-input rounded-full bg-secondary/30 focus:outline-none focus:ring-2 focus:ring-primary/20"
              placeholder="Type a message..."
            />
            <button onClick={sendMessage} className="h-9 w-9 flex items-center justify-center rounded-full bg-primary text-primary-foreground hover:bg-primary/90 transition-all active:scale-90 shadow-lg shadow-primary/20">
              <Send className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
      <button
        onClick={() => setOpen((p) => !p)}
        className={`flex h-14 w-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-xl hover:bg-primary/90 transition-all active:scale-95 ${open ? 'rotate-90' : ''}`}
        aria-label="Open chatbot"
      >
        <MessageSquare className="h-6 w-6" />
      </button>
    </div>
  );
};

export default ChatbotWidget;
