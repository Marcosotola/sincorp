// components/ui/WhatsAppBadge.js
import Link from 'next/link';
import { MessageCircle } from 'lucide-react';

export default function WhatsAppBadge({ phoneNumber }) {
  const whatsappUrl = `https://wa.me/${phoneNumber}`;

  return (
    <Link
      href={whatsappUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-6 right-6 bg-green-600 text-white rounded-full w-16 h-16 flex items-center justify-center shadow-lg hover:bg-green-700 transition-colors z-50"
    >
      <MessageCircle size={32} />
    </Link>
  );
}