import prodNewbornRomper from '../assets/images/prod_newborn_romper_1794639620444.jpg';
import prodVelvetSuit from '../assets/images/prod_velvet_suit_1794639619784.jpg';
import prodFestiveKurta from '../assets/images/prod_festive_kurta_1794639620630.jpg';
import prodTulleFrock from '../assets/images/prod_tulle_frock_1794639621253.jpg';
import prodKnitCardigan from '../assets/images/prod_knit_cardigan_1794639622958.jpg';
import prodDenimOveralls from '../assets/images/prod_denim_overalls_1794639622881.jpg';
import prodChristeningGown from '../assets/images/prod_christening_gown_1794639622390.jpg';
import prodEidWaistcoat from '../assets/images/prod_eid_waistcoat_1794639623029.jpg';
import prodSmockedDress from '../assets/images/prod_smocked_dress_1794639624637.jpg';
import prodCloudSleepsuit from '../assets/images/prod_cloud_sleepsuit_1794639624919.jpg';
import prodNehruVest from '../assets/images/prod_nehru_vest_1794639624049.jpg';
import prodMuslinKimono from '../assets/images/prod_muslin_kimono_1794639626113.jpg';

import type {
  AgeBracket,
  Currency,
  GarmentModelType,
  OrderReceipt,
  Product,
  ProductCategory,
  PromoCodeRule,
  SizeMeasurement,
} from '../types/store';

export const PKR_PER_USD = 278;
export const GIFT_WRAP_FEE_PKR = 450;
export const FREE_DELIVERY_THRESHOLD_PKR = 12000;
export const STANDARD_DELIVERY_FEE_PKR = 350;
export const PROMO_CODE_BABY10 = 'BABY10';
export const PROMO_DISCOUNT_RATE = 0.1;

export function formatPrice(amountPkr: number, currency: Currency): string {
  if (currency === 'USD') {
    const usd = amountPkr / PKR_PER_USD;
    return `$${usd.toFixed(2)}`;
  }
  return `PKR ${Math.round(amountPkr).toLocaleString('en-PK')}`;
}

export const AGE_BRACKETS: AgeBracket[] = [
  'All',
  '0–6M',
  '6–12M',
  '12–24M',
  '2–4Y',
  '5–7Y',
  '8–10Y',
];

export const PRODUCT_CATEGORIES: ProductCategory[] = [
  'All',
  'Baby Boys',
  'Baby Girls',
  'Unisex Rompers',
  'Festive Sets',
];

export const SIZE_CHART_0_TO_10: SizeMeasurement[] = [
  {
    size: '0–3M',
    ageGroup: '0 to 3 Months',
    heightCm: '56 – 62 cm',
    heightIn: '22 – 24.5 in',
    chestCm: '41 – 44 cm',
    chestIn: '16 – 17.3 in',
    fitNote: 'Gentle wrap cut with room for newborn diapers',
  },
  {
    size: '3–6M',
    ageGroup: '3 to 6 Months',
    heightCm: '62 – 68 cm',
    heightIn: '24.5 – 26.8 in',
    chestCm: '44 – 46 cm',
    chestIn: '17.3 – 18.1 in',
    fitNote: 'Soft ribbed stretch for rolling & tummy time',
  },
  {
    size: '6–12M',
    ageGroup: '6 to 12 Months',
    heightCm: '68 – 80 cm',
    heightIn: '26.8 – 31.5 in',
    chestCm: '46 – 49 cm',
    chestIn: '18.1 – 19.3 in',
    fitNote: 'Reinforced gusset snaps for early crawlers',
  },
  {
    size: '12–24M',
    ageGroup: '12 to 24 Months',
    heightCm: '80 – 92 cm',
    heightIn: '31.5 – 36.2 in',
    chestCm: '49 – 52 cm',
    chestIn: '19.3 – 20.5 in',
    fitNote: 'Balanced shoulder ease for first steps',
  },
  {
    size: '2–3Y',
    ageGroup: '2 to 3 Years',
    heightCm: '92 – 98 cm',
    heightIn: '36.2 – 38.6 in',
    chestCm: '52 – 54 cm',
    chestIn: '20.5 – 21.3 in',
    fitNote: 'Adjustable inner waistband on trousers & skirts',
  },
  {
    size: '3–4Y',
    ageGroup: '3 to 4 Years',
    heightCm: '98 – 104 cm',
    heightIn: '38.6 – 41 in',
    chestCm: '54 – 56 cm',
    chestIn: '21.3 – 22 in',
    fitNote: 'Relaxed boutique tailoring for active toddlers',
  },
  {
    size: '5–7Y',
    ageGroup: '5 to 7 Years',
    heightCm: '110 – 122 cm',
    heightIn: '43.3 – 48 in',
    chestCm: '58 – 63 cm',
    chestIn: '22.8 – 24.8 in',
    fitNote: 'True-to-age cut; size up for extra layering',
  },
  {
    size: '8–10Y',
    ageGroup: '8 to 10 Years',
    heightCm: '128 – 140 cm',
    heightIn: '50.4 – 55.1 in',
    chestCm: '65 – 71 cm',
    chestIn: '25.6 – 28 in',
    fitNote: 'Structured shoulder seam with breathable drape',
  },
];

export const ALL_GARMENT_SIZES = [
  '0–3M',
  '3–6M',
  '6–12M',
  '12–24M',
  '2–3Y',
  '3–4Y',
  '5–7Y',
  '8–10Y',
] as const;

export const DEFAULT_PROMO_RULES: PromoCodeRule[] = [
  {
    code: 'BABY10',
    discountPercent: 10,
    enabled: true,
    description: '10% Welcome Boutique Discount',
  },
  {
    code: 'OURAVIP15',
    discountPercent: 15,
    enabled: false,
    description: '15% Festive VIP Collection Offer',
  },
];

export const SAMPLE_IMAGE_PRESETS: Array<{
  id: string;
  label: string;
  url: string;
  garmentModelType: GarmentModelType;
}> = [
  { id: 'preset-romper', label: 'Newborn Romper', url: prodNewbornRomper, garmentModelType: 'romper' },
  { id: 'preset-frock', label: 'Tulle Princess Frock', url: prodTulleFrock, garmentModelType: 'frock' },
  { id: 'preset-kurta', label: 'Festive Kurta Set', url: prodFestiveKurta, garmentModelType: 'kurta' },
  { id: 'preset-velvet', label: 'Velvet Party Suit', url: prodVelvetSuit, garmentModelType: 'party-suit' },
  { id: 'preset-knit', label: 'Cable-Knit Set', url: prodKnitCardigan, garmentModelType: 'cardigan-set' },
  { id: 'preset-overalls', label: 'Chambray Overalls', url: prodDenimOveralls, garmentModelType: 'overalls' },
  { id: 'preset-gown', label: 'Heirloom Gown', url: prodChristeningGown, garmentModelType: 'frock' },
  { id: 'preset-waistcoat', label: 'Linen Eid Waistcoat', url: prodEidWaistcoat, garmentModelType: 'kurta' },
  { id: 'preset-smocked', label: 'Smocked Floral Dress', url: prodSmockedDress, garmentModelType: 'frock' },
  { id: 'preset-sleepsuit', label: 'Quilted Sleepsuit', url: prodCloudSleepsuit, garmentModelType: 'romper' },
  { id: 'preset-nehru', label: 'Jacquard Nehru Vest', url: prodNehruVest, garmentModelType: 'party-suit' },
  { id: 'preset-kimono', label: 'Muslin Kimono Box', url: prodMuslinKimono, garmentModelType: 'romper' },
];

export const DEMO_ORDERS: OrderReceipt[] = [
  {
    orderNumber: 'OURA-4821',
    createdAt: 'Nov 12, 2026',
    status: 'Shipped',
    items: [
      {
        productId: 'oura-frock-04',
        name: 'Blush Silk Tulle Princess Frock',
        size: '2–3Y',
        quantity: 1,
        unitPricePkr: 14500,
      },
      {
        productId: 'oura-romper-01',
        name: 'Organic Cotton Newborn Romper Set',
        size: '0–3M',
        quantity: 1,
        unitPricePkr: 5400,
      },
    ],
    currency: 'PKR',
    subtotalPkr: 19900,
    discountPkr: 1990,
    giftWrapPkr: 450,
    shippingPkr: 0,
    totalPkr: 18360,
    promoCode: 'BABY10',
    giftWrap: true,
    paymentMethod: 'card',
    delivery: {
      fullName: 'Zainab Tariq',
      phone: '+92 321 8459210',
      email: 'zainab.tariq@example.com',
      address: 'House 28-A, Street 6, DHA Phase 5',
      city: 'Lahore',
      postalCode: '54792',
      notes: 'Please include gold ribbon card: Welcome Baby Amal!',
    },
    estimatedDelivery: '1–2 Business Days',
  },
  {
    orderNumber: 'OURA-4795',
    createdAt: 'Nov 11, 2026',
    status: 'Confirmed',
    items: [
      {
        productId: 'oura-kurta-03',
        name: 'Embroidered Festive Kurta Pajama',
        size: '5–7Y',
        quantity: 2,
        unitPricePkr: 11900,
      },
    ],
    currency: 'PKR',
    subtotalPkr: 23800,
    discountPkr: 0,
    giftWrapPkr: 0,
    shippingPkr: 0,
    totalPkr: 23800,
    promoCode: null,
    giftWrap: false,
    paymentMethod: 'cod',
    delivery: {
      fullName: 'Hamza Siddiqui',
      phone: '+92 300 4128890',
      email: '',
      address: 'Plot 19-C, Khayaban-e-Ittehad, Clifton Block 4',
      city: 'Karachi',
      postalCode: '75600',
      notes: 'Call 15 mins before arrival.',
    },
    estimatedDelivery: '2–4 Business Days',
  },
  {
    orderNumber: 'OURA-4712',
    createdAt: 'Nov 08, 2026',
    status: 'Delivered',
    items: [
      {
        productId: 'oura-kimono-12',
        name: 'Organic Muslin Kimono Gift Box',
        size: '0–3M',
        quantity: 1,
        unitPricePkr: 9600,
      },
    ],
    currency: 'PKR',
    subtotalPkr: 9600,
    discountPkr: 0,
    giftWrapPkr: 450,
    shippingPkr: 350,
    totalPkr: 10400,
    promoCode: null,
    giftWrap: true,
    paymentMethod: 'cod',
    delivery: {
      fullName: 'Maham Farooq',
      phone: '+92 333 5190234',
      email: 'maham.f@example.com',
      address: 'House 7, Sector F-7/2, Margalla Road',
      city: 'Islamabad',
      postalCode: '44000',
      notes: '',
    },
    estimatedDelivery: 'Delivered Nov 10, 2026',
  },
];

export const PRODUCTS: Product[] = [
  {
    id: 'oura-romper-01',
    slug: 'organic-cotton-newborn-romper-set',
    name: 'Organic Cotton Newborn Romper Set',
    subtitle: 'Wrap kimono romper & knotted beanie',
    category: 'Unisex Rompers',
    ageBrackets: ['0–6M', '6–12M'],
    availableSizes: ['0–3M', '3–6M', '6–12M'],
    pricePkr: 5400,
    stockStatus: 'in-stock',
    fabricBadge: '100% Organic Cotton',
    hypoallergenicNote: 'Hypoallergenic · GOTS Certified',
    careNote: 'Cold gentle wash · Lay flat to dry',
    description:
      'Hand-finished in breathable combed organic rib cotton with smooth side-wrap olivewood buttons and a matching knotted newborn cap designed to protect delicate skin.',
    garmentModelType: 'romper',
    palette: {
      primary: '#EDE4D3',
      secondary: '#DFD2BC',
      accent: '#C9A86A',
      hardware: '#B4884E',
    },
    imageUrl: prodNewbornRomper,
    isNewArrival: true,
    isGiftSet: true,
  },
  {
    id: 'oura-suit-02',
    slug: 'velvet-baby-party-suit',
    name: 'Midnight Velvet Baby Party Suit',
    subtitle: '3-piece tailored blazer, shirt & bow tie',
    category: 'Baby Boys',
    ageBrackets: ['6–12M', '12–24M', '2–4Y', '5–7Y'],
    availableSizes: ['6–12M', '12–24M', '2–3Y', '3–4Y', '5–7Y'],
    pricePkr: 13800,
    stockStatus: 'in-stock',
    fabricBadge: 'Silk-Touch Cotton Velvet',
    hypoallergenicNote: 'Hypoallergenic · Breathable Voile Lining',
    careNote: 'Dry clean or steam gently',
    description:
      'Cut in plush midnight-navy cotton velvet with a soft ivory organic poplin shirt, brushed brass buttons, and an antique-gold velvet bow tie for evening celebrations.',
    garmentModelType: 'party-suit',
    palette: {
      primary: '#162238',
      secondary: '#F3EEE2',
      accent: '#D4AF37',
      hardware: '#E0C16B',
    },
    imageUrl: prodVelvetSuit,
    isNewArrival: true,
  },
  {
    id: 'oura-kurta-03',
    slug: 'embroidered-festive-kurta-pajama',
    name: 'Embroidered Festive Kurta Pajama',
    subtitle: 'Champagne silk-cotton with zardozi collar',
    category: 'Festive Sets',
    ageBrackets: ['12–24M', '2–4Y', '5–7Y', '8–10Y'],
    availableSizes: ['12–24M', '2–3Y', '3–4Y', '5–7Y', '8–10Y'],
    pricePkr: 11900,
    stockStatus: 'in-stock',
    fabricBadge: 'Hand-Loomed Silk Cotton',
    hypoallergenicNote: 'Hypoallergenic · Soft Cotton Inner Facing',
    careNote: 'Gentle hand wash cold · Low iron on reverse',
    description:
      'Luminous champagne raw silk-cotton tailored with delicate antique-gold botanical embroidery along the mandarin collar and cuffs, paired with relaxed tapered trousers.',
    garmentModelType: 'kurta',
    palette: {
      primary: '#E5D3B3',
      secondary: '#D9C39C',
      accent: '#C9A23F',
      hardware: '#D4AF37',
    },
    imageUrl: prodFestiveKurta,
    isNewArrival: true,
  },
  {
    id: 'oura-frock-04',
    slug: 'tulle-princess-frock',
    name: 'Blush Silk Tulle Princess Frock',
    subtitle: 'Layered airy tulle & champagne satin bow',
    category: 'Baby Girls',
    ageBrackets: ['6–12M', '12–24M', '2–4Y', '5–7Y', '8–10Y'],
    availableSizes: ['6–12M', '12–24M', '2–3Y', '3–4Y', '5–7Y', '8–10Y'],
    pricePkr: 14500,
    stockStatus: 'in-stock',
    fabricBadge: 'Mulberry Tulle & Organic Lining',
    hypoallergenicNote: 'Hypoallergenic · Zero-Scratch Seams',
    careNote: 'Hand wash cold · Hang to dry',
    description:
      'Feather-light dusty rose tulle skirt layered over 100% organic cotton batiste lining, cinched with a luminous champagne-gold satin ribbon bow.',
    garmentModelType: 'frock',
    palette: {
      primary: '#E2B8B2',
      secondary: '#F1D4CE',
      accent: '#D9B97A',
      hardware: '#D4AF37',
    },
    imageUrl: prodTulleFrock,
    isNewArrival: true,
  },
  {
    id: 'oura-knit-05',
    slug: 'knit-cardigan-and-jogger-set',
    name: 'Sage Cable-Knit Cardigan & Jogger Set',
    subtitle: 'Heirloom organic knit two-piece',
    category: 'Unisex Rompers',
    ageBrackets: ['0–6M', '6–12M', '12–24M', '2–4Y'],
    availableSizes: ['0–3M', '3–6M', '6–12M', '12–24M', '2–3Y', '3–4Y'],
    pricePkr: 7800,
    stockStatus: 'in-stock',
    fabricBadge: '100% Organic Cotton',
    hypoallergenicNote: 'Hypoallergenic · OEKO-TEX Dyes',
    careNote: 'Machine wash wool cycle · Dry flat',
    description:
      'Supple sage-cream cable-knit cardigan finished with smooth coconut-shell buttons and matching ribbed-ankle joggers crafted for effortless all-day movement.',
    garmentModelType: 'cardigan-set',
    palette: {
      primary: '#C7CEBE',
      secondary: '#E7E3D6',
      accent: '#9E8563',
      hardware: '#B79A6B',
    },
    imageUrl: prodKnitCardigan,
  },
  {
    id: 'oura-overalls-06',
    slug: 'soft-denim-overalls',
    name: 'Soft Chambray Denim Overalls',
    subtitle: 'Washed organic denim with ribbed tee',
    category: 'Baby Boys',
    ageBrackets: ['12–24M', '2–4Y', '5–7Y', '8–10Y'],
    availableSizes: ['12–24M', '2–3Y', '3–4Y', '5–7Y', '8–10Y'],
    pricePkr: 8400,
    stockStatus: 'in-stock',
    fabricBadge: '100% Organic Cotton',
    hypoallergenicNote: 'Hypoallergenic · Enzyme-Washed Softness',
    careNote: 'Machine wash cold inside out',
    description:
      'Feather-soft enzyme-washed indigo organic denim dungarees with brushed antique brass buckles and adjustable straps, layered over a breathable ivory ribbed tee.',
    garmentModelType: 'overalls',
    palette: {
      primary: '#3B587A',
      secondary: '#F3EFE5',
      accent: '#C9A24D',
      hardware: '#C5A059',
    },
    imageUrl: prodDenimOveralls,
  },
  {
    id: 'oura-gown-07',
    slug: 'cashmere-blend-christening-gown',
    name: 'Cashmere-Blend Heirloom Gown',
    subtitle: 'Scalloped ivory knit dress & bonnet',
    category: 'Baby Girls',
    ageBrackets: ['0–6M', '6–12M'],
    availableSizes: ['0–3M', '3–6M', '6–12M'],
    pricePkr: 15200,
    stockStatus: 'low-stock',
    fabricBadge: 'Organic Cotton & Cashmere',
    hypoallergenicNote: 'Hypoallergenic · Ultra-Fine Knit',
    careNote: 'Hand wash lukewarm · Dry flat on towel',
    description:
      'Crafted as a keepsake piece in luminous pearl ivory cashmere-cotton knit with tonal floral embroidery and a matching silk-ribbon bonnet.',
    garmentModelType: 'frock',
    palette: {
      primary: '#F3EFE4',
      secondary: '#E7DFCE',
      accent: '#D8BF82',
      hardware: '#D4AF37',
    },
    imageUrl: prodChristeningGown,
    isGiftSet: true,
  },
  {
    id: 'oura-waistcoat-08',
    slug: 'linen-eid-waistcoat-set',
    name: 'Sand Linen Eid Waistcoat Set',
    subtitle: 'Textured linen vest, kurta & trouser',
    category: 'Festive Sets',
    ageBrackets: ['2–4Y', '5–7Y', '8–10Y'],
    availableSizes: ['2–3Y', '3–4Y', '5–7Y', '8–10Y'],
    pricePkr: 12600,
    stockStatus: 'in-stock',
    fabricBadge: 'Belgian Linen & Organic Cotton',
    hypoallergenicNote: 'Hypoallergenic · Airy Weave',
    careNote: 'Gentle wash or steam · Medium iron',
    description:
      'Sun-warmed sand-gold linen waistcoat tailored with horn buttons and silk pocket square, layered over a crisp ivory mandarin-collar kurta.',
    garmentModelType: 'kurta',
    palette: {
      primary: '#C7A977',
      secondary: '#F5F0E6',
      accent: '#9E783D',
      hardware: '#D4AF37',
    },
    imageUrl: prodEidWaistcoat,
    isNewArrival: true,
  },
  {
    id: 'oura-smocked-09',
    slug: 'smocked-floral-chambray-dress',
    name: 'Smocked Floral Chambray Dress',
    subtitle: 'Hand-smocked bodice in powder blue',
    category: 'Baby Girls',
    ageBrackets: ['12–24M', '2–4Y', '5–7Y'],
    availableSizes: ['12–24M', '2–3Y', '3–4Y', '5–7Y'],
    pricePkr: 8900,
    stockStatus: 'in-stock',
    fabricBadge: '100% Organic Cotton',
    hypoallergenicNote: 'Hypoallergenic · Natural Indigo Dye',
    careNote: 'Gentle cold wash · Line dry in shade',
    description:
      'Artisanal hand-smocked bodice embroidered with tiny ivory and gold blossoms over soft powder-blue organic chambray with scalloped lace sleeves.',
    garmentModelType: 'frock',
    palette: {
      primary: '#8BAAC4',
      secondary: '#F1ECE1',
      accent: '#D4B675',
      hardware: '#C9A86A',
    },
    imageUrl: prodSmockedDress,
  },
  {
    id: 'oura-sleepsuit-10',
    slug: 'quilted-cloud-sleepsuit',
    name: 'Quilted Cloud Organic Sleepsuit',
    subtitle: 'Matelasse diamond knit footed sleeper',
    category: 'Unisex Rompers',
    ageBrackets: ['0–6M', '6–12M', '12–24M'],
    availableSizes: ['0–3M', '3–6M', '6–12M', '12–24M'],
    pricePkr: 4800,
    stockStatus: 'in-stock',
    fabricBadge: '100% Organic Cotton',
    hypoallergenicNote: 'Hypoallergenic · Nickel-Free Brass Snaps',
    careNote: 'Machine wash warm · Tumble dry low',
    description:
      'Cushioned matelasse organic cotton sleepsuit engineered for restful sleep with concealed fold-over mitts and full-length antique-brass snap access.',
    garmentModelType: 'romper',
    palette: {
      primary: '#F0E6D2',
      secondary: '#E3D5BA',
      accent: '#B59457',
      hardware: '#C6A35E',
    },
    imageUrl: prodCloudSleepsuit,
  },
  {
    id: 'oura-nehru-11',
    slug: 'jacquard-nehru-vest-set',
    name: 'Midnight Jacquard Nehru Vest Set',
    subtitle: 'Woven gold brocade vest & ivory kurta',
    category: 'Festive Sets',
    ageBrackets: ['2–4Y', '5–7Y', '8–10Y'],
    availableSizes: ['2–3Y', '3–4Y', '5–7Y', '8–10Y'],
    pricePkr: 13400,
    stockStatus: 'in-stock',
    fabricBadge: 'Woven Jacquard & Organic Cotton',
    hypoallergenicNote: 'Hypoallergenic · Satin Inner Lining',
    careNote: 'Dry clean recommended',
    description:
      'Architectural charcoal and champagne-gold woven paisley Nehru vest paired with an ivory organic cotton kurta and straight-cut pajama.',
    garmentModelType: 'party-suit',
    palette: {
      primary: '#2A303B',
      secondary: '#F2ECE0',
      accent: '#C9A964',
      hardware: '#D4AF37',
    },
    imageUrl: prodNehruVest,
  },
  {
    id: 'oura-kimono-12',
    slug: 'organic-muslin-kimono-gift-set',
    name: 'Organic Muslin Kimono Gift Box',
    subtitle: 'Keepsake newborn box with kimono & beanie',
    category: 'Unisex Rompers',
    ageBrackets: ['0–6M'],
    availableSizes: ['0–3M', '3–6M'],
    pricePkr: 9600,
    stockStatus: 'in-stock',
    fabricBadge: '100% Double-Gauze Organic Muslin',
    hypoallergenicNote: 'Hypoallergenic · Ready-to-Gift Box',
    careNote: 'Machine wash cold · Softens with every wash',
    description:
      'Presented in OURA’s signature matte midnight & gold keepsake box with a dusty-amber double-gauze kimono wrap, ivory bodysuit, and knotted cap.',
    garmentModelType: 'romper',
    palette: {
      primary: '#C48157',
      secondary: '#F3ECE0',
      accent: '#D4AF37',
      hardware: '#D4AF37',
    },
    imageUrl: prodMuslinKimono,
    isGiftSet: true,
    isNewArrival: true,
  },
];
