import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import type {
  Currency,
  DeliveryDetails,
  OrderReceipt,
  OrderStatus,
  PaymentMethod,
  Product,
  ProductCategory,
  StockStatus,
} from '../types/store';

const rawUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const rawAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

const trimmedUrl = rawUrl?.trim() ?? '';
const trimmedAnonKey = rawAnonKey?.trim() ?? '';

export const isSupabaseConfigured: boolean = Boolean(
  trimmedUrl &&
    trimmedAnonKey &&
    trimmedUrl.startsWith('http') &&
    !trimmedUrl.includes('your-project-id') &&
    !trimmedAnonKey.includes('your-supabase-anon-key')
);

export const supabase: SupabaseClient | null = isSupabaseConfigured
  ? createClient(trimmedUrl, trimmedAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
      },
    })
  : null;

export interface SupabaseProductRow {
  id: string;
  slug: string;
  name: string;
  subtitle: string;
  category: string;
  age_brackets: string[];
  available_sizes: string[];
  price_pkr: number;
  stock_status: string;
  fabric_badge: string;
  hypoallergenic_note: string;
  care_note: string;
  description: string;
  garment_model_type: string;
  palette: {
    primary: string;
    secondary: string;
    accent: string;
    hardware: string;
  };
  image_url: string;
  is_new_arrival?: boolean;
  is_gift_set?: boolean;
}

export interface SupabaseOrderRow {
  order_number: string;
  created_at?: string;
  status: string;
  items: OrderReceipt['items'];
  currency: string;
  subtotal_pkr: number;
  discount_pkr: number;
  gift_wrap_pkr: number;
  shipping_pkr: number;
  total_pkr: number;
  promo_code: string | null;
  gift_wrap: boolean;
  payment_method: string;
  delivery: DeliveryDetails;
  estimated_delivery: string;
}

const VALID_CATEGORIES: Exclude<ProductCategory, 'All'>[] = [
  'Baby Boys',
  'Baby Girls',
  'Unisex Rompers',
  'Festive Sets',
];

const VALID_STOCK_STATUSES: StockStatus[] = ['in-stock', 'low-stock', 'sold-out'];

const VALID_ORDER_STATUSES: OrderStatus[] = [
  'Pending',
  'Confirmed',
  'Shipped',
  'Delivered',
  'Cancelled',
];

export function productToSupabaseRow(product: Product): SupabaseProductRow {
  return {
    id: product.id,
    slug: product.slug,
    name: product.name,
    subtitle: product.subtitle,
    category: product.category,
    age_brackets: product.ageBrackets,
    available_sizes: product.availableSizes,
    price_pkr: Math.round(product.pricePkr),
    stock_status: product.stockStatus,
    fabric_badge: product.fabricBadge,
    hypoallergenic_note: product.hypoallergenicNote,
    care_note: product.careNote,
    description: product.description,
    garment_model_type: product.garmentModelType,
    palette: product.palette,
    image_url: product.imageUrl,
    is_new_arrival: Boolean(product.isNewArrival),
    is_gift_set: Boolean(product.isGiftSet),
  };
}

export function supabaseRowToProduct(row: Record<string, unknown>): Product {
  const categoryRaw = String(row.category ?? 'Unisex Rompers');
  const category = VALID_CATEGORIES.includes(
    categoryRaw as Exclude<ProductCategory, 'All'>
  )
    ? (categoryRaw as Exclude<ProductCategory, 'All'>)
    : 'Unisex Rompers';

  const stockRaw = String(row.stock_status ?? row.stockStatus ?? 'in-stock');
  const stockStatus = VALID_STOCK_STATUSES.includes(stockRaw as StockStatus)
    ? (stockRaw as StockStatus)
    : 'in-stock';

  const paletteRaw = (row.palette ?? {}) as Partial<Product['palette']>;

  return {
    id: String(row.id),
    slug: String(row.slug ?? row.id),
    name: String(row.name ?? 'OURA Garment'),
    subtitle: String(row.subtitle ?? ''),
    category,
    ageBrackets: Array.isArray(row.age_brackets)
      ? (row.age_brackets as Product['ageBrackets'])
      : Array.isArray(row.ageBrackets)
      ? (row.ageBrackets as Product['ageBrackets'])
      : ['0–6M'],
    availableSizes: Array.isArray(row.available_sizes)
      ? (row.available_sizes as string[])
      : Array.isArray(row.availableSizes)
      ? (row.availableSizes as string[])
      : ['0–3M'],
    pricePkr: Number(row.price_pkr ?? row.pricePkr ?? 0),
    stockStatus,
    fabricBadge: String(row.fabric_badge ?? row.fabricBadge ?? '100% Organic Cotton'),
    hypoallergenicNote: String(
      row.hypoallergenic_note ?? row.hypoallergenicNote ?? 'Hypoallergenic'
    ),
    careNote: String(row.care_note ?? row.careNote ?? 'Cold gentle wash'),
    description: String(row.description ?? ''),
    garmentModelType: String(
      row.garment_model_type ?? row.garmentModelType ?? 'romper'
    ) as Product['garmentModelType'],
    palette: {
      primary: String(paletteRaw.primary ?? '#EDE4D3'),
      secondary: String(paletteRaw.secondary ?? '#F5EFE6'),
      accent: String(paletteRaw.accent ?? '#C8963E'),
      hardware: String(paletteRaw.hardware ?? '#C8963E'),
    },
    imageUrl: String(row.image_url ?? row.imageUrl ?? ''),
    isNewArrival: Boolean(row.is_new_arrival ?? row.isNewArrival ?? false),
    isGiftSet: Boolean(row.is_gift_set ?? row.isGiftSet ?? false),
  };
}

export function orderToSupabaseRow(order: OrderReceipt): SupabaseOrderRow {
  return {
    order_number: order.orderNumber,
    status: order.status,
    items: order.items,
    currency: order.currency,
    subtotal_pkr: Math.round(order.subtotalPkr),
    discount_pkr: Math.round(order.discountPkr),
    gift_wrap_pkr: Math.round(order.giftWrapPkr),
    shipping_pkr: Math.round(order.shippingPkr),
    total_pkr: Math.round(order.totalPkr),
    promo_code: order.promoCode,
    gift_wrap: order.giftWrap,
    payment_method: order.paymentMethod,
    delivery: order.delivery,
    estimated_delivery: order.estimatedDelivery,
  };
}

export function supabaseRowToOrder(row: Record<string, unknown>): OrderReceipt {
  const statusRaw = String(row.status ?? 'Pending');
  const status = VALID_ORDER_STATUSES.includes(statusRaw as OrderStatus)
    ? (statusRaw as OrderStatus)
    : 'Pending';

  const currencyRaw = String(row.currency ?? 'PKR');
  const currency: Currency = currencyRaw === 'USD' ? 'USD' : 'PKR';

  const paymentRaw = String(row.payment_method ?? row.paymentMethod ?? 'cod');
  const paymentMethod: PaymentMethod = paymentRaw === 'card' ? 'card' : 'cod';

  const rawDate = row.created_at ?? row.createdAt;
  let formattedDate = new Date().toLocaleDateString('en-PK', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
  if (typeof rawDate === 'string' && rawDate) {
    const parsed = new Date(rawDate);
    formattedDate = Number.isNaN(parsed.getTime())
      ? rawDate
      : parsed.toLocaleDateString('en-PK', {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
        });
  }

  const deliveryRaw = (row.delivery ?? {}) as Partial<DeliveryDetails>;

  return {
    orderNumber: String(row.order_number ?? row.orderNumber ?? ''),
    createdAt: formattedDate,
    status,
    items: Array.isArray(row.items)
      ? (row.items as OrderReceipt['items'])
      : [],
    currency,
    subtotalPkr: Number(row.subtotal_pkr ?? row.subtotalPkr ?? 0),
    discountPkr: Number(row.discount_pkr ?? row.discountPkr ?? 0),
    giftWrapPkr: Number(row.gift_wrap_pkr ?? row.giftWrapPkr ?? 0),
    shippingPkr: Number(row.shipping_pkr ?? row.shippingPkr ?? 0),
    totalPkr: Number(row.total_pkr ?? row.totalPkr ?? 0),
    promoCode:
      typeof row.promo_code === 'string'
        ? row.promo_code
        : typeof row.promoCode === 'string'
        ? row.promoCode
        : null,
    giftWrap: Boolean(row.gift_wrap ?? row.giftWrap ?? false),
    paymentMethod,
    delivery: {
      fullName: String(deliveryRaw.fullName ?? ''),
      phone: String(deliveryRaw.phone ?? ''),
      email: String(deliveryRaw.email ?? ''),
      address: String(deliveryRaw.address ?? ''),
      city: String(deliveryRaw.city ?? ''),
      postalCode: String(deliveryRaw.postalCode ?? ''),
      notes: String(deliveryRaw.notes ?? ''),
    },
    estimatedDelivery: String(
      row.estimated_delivery ?? row.estimatedDelivery ?? '2–4 Business Days'
    ),
  };
}
