import { useState } from 'react';
import { MessageCircle, X } from 'lucide-react';

const WHATSAPP_NUMBER = '919999999999';
const WHATSAPP_TEXT = 'Hi Devanshi Collection, I need help with my order.';

const WhatsAppChat = () => {
  const [open, setOpen] = useState(false);

  const whatsappUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(WHATSAPP_TEXT)}`;

  return (
    <div className="fixed bottom-4 right-4 z-[60]">
      {open && (
        <div className="mb-3 w-[290px] rounded-xl border border-border bg-background p-4 shadow-xl animate-fade-in">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="font-body text-sm font-semibold text-foreground">Need help shopping?</p>
              <p className="mt-1 text-xs font-body text-muted-foreground">
                Chat with us on WhatsApp for quick support.
              </p>
            </div>
            <button
              onClick={() => setOpen(false)}
              className="rounded-full p-1 hover:bg-accent"
              aria-label="Close WhatsApp popup"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noreferrer"
            className="mt-3 inline-flex w-full items-center justify-center rounded-md bg-[#25D366] px-3 py-2.5 text-sm font-body font-medium text-white hover:bg-[#1ebe5a] transition-colors"
          >
            Start WhatsApp Chat
          </a>
        </div>
      )}

      <button
        onClick={() => setOpen((prev) => !prev)}
        className="flex h-12 w-12 items-center justify-center rounded-full bg-[#25D366] text-white shadow-lg hover:bg-[#1ebe5a] transition-colors"
        aria-label="Open WhatsApp chat"
      >
        <MessageCircle className="h-6 w-6" />
      </button>
    </div>
  );
};

export default WhatsAppChat;
