import { useState } from 'react';
import { MessageSquare, Send, X } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { api } from '@/lib/api';

type ChatRow = { from: 'user' | 'bot'; text: string };

const getBotReply = (question: string) => {
  const q = question.toLowerCase();
  if (q.includes('order') && (q.includes('track') || q.includes('status'))) {
    return 'You can track your order from Account > Orders after login. If you share your order ID, support can help faster.';
  }
  if (q.includes('return') || q.includes('exchange')) {
    return 'Returns and exchanges are available for eligible items in unused condition. Please check Shipping & Returns page for full details.';
  }
  if (q.includes('size')) {
    return 'Please check our Size Guide page in the footer. If you share your measurements, we can suggest the best size.';
  }
  if (q.includes('shipping') || q.includes('delivery')) {
    return 'Orders are usually processed in 1-2 business days. Delivery timeline depends on location and courier service.';
  }
  return 'Thanks for your message. Our team will help you shortly. You can also use WhatsApp support for faster response.';
};

const ChatbotWidget = () => {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<ChatRow[]>([
    { from: 'bot', text: 'Hi! How can I help you today?' },
  ]);

  const sendMessage = async () => {
    const question = input.trim();
    if (!question) return;
    const answer = getBotReply(question);
    setMessages((prev) => [...prev, { from: 'user', text: question }, { from: 'bot', text: answer }]);
    setInput('');

    await api.post('/chatbot', {
      user_id: user?.id || null,
      question,
      answer,
      page_url: window.location.href,
      user_agent: navigator.userAgent,
    });
  };

  return (
    <div className="fixed bottom-20 right-4 z-[60]">
      {open && (
        <div className="mb-3 w-[320px] rounded-xl border border-border bg-background shadow-xl">
          <div className="flex items-center justify-between border-b border-border px-3 py-2">
            <p className="font-body text-sm font-semibold">Chat Support</p>
            <button onClick={() => setOpen(false)} className="rounded-full p-1 hover:bg-accent" aria-label="Close chat">
              <X className="h-4 w-4" />
            </button>
          </div>
          <div className="max-h-72 overflow-y-auto p-3 space-y-2">
            {messages.map((m, idx) => (
              <div key={idx} className={`text-xs font-body px-3 py-2 rounded-lg ${m.from === 'user' ? 'bg-primary text-primary-foreground ml-6' : 'bg-secondary mr-6'}`}>
                {m.text}
              </div>
            ))}
          </div>
          <div className="border-t border-border p-2 flex items-center gap-2">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  sendMessage();
                }
              }}
              className="flex-1 px-3 py-2 text-sm border border-input rounded-md bg-background"
              placeholder="Ask anything..."
            />
            <button onClick={sendMessage} className="p-2 rounded-md bg-primary text-primary-foreground hover:bg-primary/90" aria-label="Send message">
              <Send className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
      <button
        onClick={() => setOpen((p) => !p)}
        className="flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg hover:bg-primary/90 transition-colors"
        aria-label="Open chatbot"
      >
        <MessageSquare className="h-5 w-5" />
      </button>
    </div>
  );
};

export default ChatbotWidget;
