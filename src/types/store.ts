export type Currency = 'PKR' | 'USD';

export type AgeBracket =
  | 'All'
  | '0–6M'
  | '6–12M'
  | '12–24M'
  | '2–4Y'
  | '5–7Y'
  | '8–10Y';

export type ProductCategory =
  | 'All'
  | 'Baby Boys'
  | 'Baby Girls'
  | 'Unisex Rompers'
  | 'Festive Sets';

export type GarmentModelType =
  | 'romper'
  | 'frock'
  | 'kurta'
  | 'cardigan-set'
  | 'overalls'
  | 'party-suit';

export type LightingPreset = 'nursery' | 'studio' | 'evening';

export interface GarmentPalette {
  primary: string;
  secondary: string;
  accent: string;
  hardware: string;
}

export type StockStatus = 'in-stock' | 'low-stock' | 'sold-out';

export type OrderStatus =
  | 'Pending'
  | 'Confirmed'
  | 'Shipped'
  | 'Delivered'
  | 'Cancelled';

export interface PromoCodeRule {
  code: string;
  discountPercent: number;
  enabled: boolean;
  description?: string;
}

export interface Product {
  id: string;
  slug: string;
  name: string;
  subtitle: string;
  category: Exclude<ProductCategory, 'All'>;
  ageBrackets: Exclude<AgeBracket, 'All'>[];
  availableSizes: string[];
  pricePkr: number;
  stockStatus: StockStatus;
  fabricBadge: string;
  hypoallergenicNote: string;
  careNote: string;
  description: string;
  garmentModelType: GarmentModelType;
  palette: GarmentPalette;
  imageUrl: string;
  isNewArrival?: boolean;
  isGiftSet?: boolean;
}

export interface CartItem {
  productId: string;
  size: string;
  quantity: number;
}

export interface DeliveryDetails {
  fullName: string;
  phone: string;
  email: string;
  address: string;
  city: string;
  postalCode: string;
  notes: string;
}

export type PaymentMethod = 'cod' | 'card';

export interface OrderReceipt {
  orderNumber: string;
  createdAt: string;
  status: OrderStatus;
  items: Array<{
    productId: string;
    name: string;
    size: string;
    quantity: number;
    unitPricePkr: number;
  }>;
  currency: Currency;
  subtotalPkr: number;
  discountPkr: number;
  giftWrapPkr: number;
  shippingPkr: number;
  totalPkr: number;
  promoCode: string | null;
  giftWrap: boolean;
  paymentMethod: PaymentMethod;
  delivery: DeliveryDetails;
  estimatedDelivery: string;
}

export interface SizeMeasurement {
  size: string;
  ageGroup: string;
  heightCm: string;
  heightIn: string;
  chestCm: string;
  chestIn: string;
  fitNote: string;
}
