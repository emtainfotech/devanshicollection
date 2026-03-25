import { useState } from 'react';
import { X } from 'lucide-react';

const WHATSAPP_NUMBER = '919999999999';
const WHATSAPP_TEXT = 'Hi Devanshi Collection, I need help with my order.';

const WhatsAppLogo = ({ className = 'h-6 w-6' }: { className?: string }) => (
  <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
    <path
      fill="currentColor"
      d="M20.52 3.48A11.82 11.82 0 0 0 12.1 0C5.56 0 .23 5.33.23 11.87c0 2.1.55 4.15 1.6 5.96L0 24l6.36-1.67a11.82 11.82 0 0 0 5.74 1.46h.01c6.53 0 11.86-5.33 11.87-11.87a11.8 11.8 0 0 0-3.46-8.44Zm-8.41 18.3h-.01a9.83 9.83 0 0 1-5-1.37l-.36-.22-3.78.99 1.01-3.69-.24-.38a9.84 9.84 0 0 1-1.52-5.25C2.21 6.42 6.65 2 12.1 2a9.8 9.8 0 0 1 6.95 2.88 9.77 9.77 0 0 1 2.87 6.96c0 5.44-4.43 9.88-9.81 9.94Zm5.42-7.41c-.3-.15-1.77-.87-2.05-.97-.27-.1-.47-.15-.66.15-.19.3-.76.96-.93 1.16-.17.2-.34.22-.63.08-.3-.15-1.26-.46-2.39-1.46-.88-.79-1.47-1.76-1.65-2.06-.17-.3-.02-.46.13-.61.14-.14.3-.34.45-.5.15-.17.2-.29.3-.49.1-.2.05-.37-.02-.52-.07-.15-.66-1.58-.9-2.16-.24-.58-.48-.5-.66-.5h-.56c-.2 0-.52.07-.79.37-.27.3-1.04 1.01-1.04 2.46 0 1.45 1.07 2.85 1.22 3.05.15.2 2.09 3.19 5.07 4.47.71.31 1.27.49 1.7.63.71.23 1.36.2 1.87.12.57-.08 1.77-.72 2.02-1.42.25-.7.25-1.3.17-1.42-.07-.12-.27-.2-.57-.35Z"
    />
  </svg>
);

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
        <WhatsAppLogo className="h-6 w-6" />
      </button>
    </div>
  );
};

export default WhatsAppChat;
