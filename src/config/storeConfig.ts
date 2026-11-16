import type { Currency, OrderReceipt } from '../types/store';
import { formatPrice } from '../data/products';

export const STORE_WHATSAPP_NUMBER = '923118133212';
export const STORE_WHATSAPP_DISPLAY = '+92 311 8133212';

export const WHATSAPP_DEFAULT_INQUIRY =
  "Assalam-o-Alaikum OURA Fashion Kid's! I would like to inquire about an outfit.";

export function buildWhatsAppUrl(message: string): string {
  return `https://wa.me/${STORE_WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
}

export function buildProductWhatsAppUrl(params: {
  productName: string;
  size: string;
  pricePkr: number;
  currency: Currency;
}): string {
  const formattedPrice = formatPrice(params.pricePkr, params.currency);
  const message = `Assalam-o-Alaikum OURA Fashion Kid's! I would like to ask / order:\n• Garment: ${params.productName}\n• Selected Size: ${params.size}\n• Price: ${formattedPrice}`;
  return buildWhatsAppUrl(message);
}

export function buildOrderWhatsAppUrl(receipt: OrderReceipt): string {
  const itemLines = receipt.items
    .map(
      (item) =>
        `• ${item.quantity}x ${item.name} (Size ${item.size}) — ${formatPrice(
          item.unitPricePkr * item.quantity,
          receipt.currency
        )}`
    )
    .join('\n');

  const totalFormatted = formatPrice(receipt.totalPkr, receipt.currency);
  const paymentLabel =
    receipt.paymentMethod === 'cod' ? 'Cash on Delivery (COD)' : 'Card Payment';

  const message = `Assalam-o-Alaikum OURA Fashion Kid's! Please confirm my order:\n\nOrder #: ${receipt.orderNumber}\nItems:\n${itemLines}\n\nTotal Amount: ${totalFormatted} (${paymentLabel})\nCustomer: ${receipt.delivery.fullName} (${receipt.delivery.phone})\nDelivery Address: ${receipt.delivery.address}, ${receipt.delivery.city}`;
  return buildWhatsAppUrl(message);
}
