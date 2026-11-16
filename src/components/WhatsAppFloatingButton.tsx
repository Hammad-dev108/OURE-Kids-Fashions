import { MessageCircle } from 'lucide-react';
import {
  WHATSAPP_DEFAULT_INQUIRY,
  buildWhatsAppUrl,
} from '../config/storeConfig';

export function WhatsAppFloatingButton() {
  const href = buildWhatsAppUrl(WHATSAPP_DEFAULT_INQUIRY);

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Inquire on WhatsApp"
      className="fixed right-4 bottom-[max(1rem,env(safe-area-inset-bottom))] sm:right-6 sm:bottom-6 z-40 inline-flex items-center gap-2.5 rounded-2xl border border-[#C8963E] bg-[#2C221E] px-3.5 py-3 text-xs font-semibold text-[#FAF6F0] shadow-lg transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#C8963E] hover:text-[#FFFFFF] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C8963E]"
    >
      <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-[#C8963E] text-[#FFFFFF]">
        <MessageCircle className="h-4 w-4" />
      </span>
      <span className="hidden sm:inline tracking-wide">Chat on WhatsApp</span>
    </a>
  );
}
