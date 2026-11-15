import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import {
  DEFAULT_PROMO_RULES,
  DEMO_ORDERS,
  FREE_DELIVERY_THRESHOLD_PKR,
  GIFT_WRAP_FEE_PKR,
  PRODUCTS,
  STANDARD_DELIVERY_FEE_PKR,
} from '../data/products';
import {
  isSupabaseConfigured,
  orderToSupabaseRow,
  productToSupabaseRow,
  supabase,
  supabaseRowToOrder,
  supabaseRowToProduct,
} from '../lib/supabase';
import type {
  CartItem,
  Currency,
  OrderReceipt,
  OrderStatus,
  Product,
  PromoCodeRule,
  StockStatus,
} from '../types/store';

interface PersistedState {
  currency: Currency;
  cart: CartItem[];
  wishlist: string[];
  giftWrap: boolean;
  promoCode: string | null;
  orders: OrderReceipt[];
  products: Product[];
  promoRules: PromoCodeRule[];
  initializedV2: boolean;
}

const STORAGE_KEY = 'oura_fashion_kids_store_v1';
const ADMIN_SESSION_KEY = 'oura_admin_authenticated_v1';

const DEFAULT_PERSISTED: PersistedState = {
  currency: 'PKR',
  cart: [{ productId: 'oura-romper-01', size: '3–6M', quantity: 1 }],
  wishlist: ['oura-frock-04'],
  giftWrap: false,
  promoCode: null,
  orders: DEMO_ORDERS,
  products: PRODUCTS,
  promoRules: DEFAULT_PROMO_RULES,
  initializedV2: true,
};

function normalizeProduct(p: Product): Product {
  return {
    ...p,
    stockStatus:
      p.stockStatus === 'low-stock' || p.stockStatus === 'sold-out'
        ? p.stockStatus
        : 'in-stock',
  };
}

function normalizeOrder(o: OrderReceipt): OrderReceipt {
  const validStatuses: OrderStatus[] = [
    'Pending',
    'Confirmed',
    'Shipped',
    'Delivered',
    'Cancelled',
  ];
  return {
    ...o,
    status: validStatuses.includes(o.status) ? o.status : 'Pending',
  };
}

function loadInitialState(): PersistedState {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_PERSISTED;
    const parsed = JSON.parse(raw) as Partial<PersistedState>;

    const hasInitializedV2 = Boolean(parsed.initializedV2);
    const loadedOrders = Array.isArray(parsed.orders)
      ? parsed.orders.map(normalizeOrder)
      : [];

    const mergedOrders =
      !hasInitializedV2 && loadedOrders.length === 0
        ? DEMO_ORDERS
        : !hasInitializedV2
        ? [...loadedOrders, ...DEMO_ORDERS]
        : loadedOrders;

    const loadedProducts =
      Array.isArray(parsed.products) && hasInitializedV2
        ? parsed.products.map(normalizeProduct)
        : PRODUCTS;

    const loadedPromoRules =
      Array.isArray(parsed.promoRules) && parsed.promoRules.length > 0
        ? parsed.promoRules
        : DEFAULT_PROMO_RULES;

    return {
      currency: parsed.currency === 'USD' ? 'USD' : 'PKR',
      cart: Array.isArray(parsed.cart) ? parsed.cart : DEFAULT_PERSISTED.cart,
      wishlist: Array.isArray(parsed.wishlist) ? parsed.wishlist : [],
      giftWrap: Boolean(parsed.giftWrap),
      promoCode: typeof parsed.promoCode === 'string' ? parsed.promoCode : null,
      orders: mergedOrders,
      products: loadedProducts,
      promoRules: loadedPromoRules,
      initializedV2: true,
    };
  } catch {
    return DEFAULT_PERSISTED;
  }
}

function loadAdminSession(): boolean {
  if (isSupabaseConfigured) return false;
  try {
    return window.sessionStorage.getItem(ADMIN_SESSION_KEY) === 'true';
  } catch {
    return false;
  }
}

export interface AdminAuthCredentials {
  email?: string;
  password: string;
}

interface StoreContextValue {
  supabaseEnabled: boolean;
  productsLoading: boolean;
  dbSyncError: string | null;
  currency: Currency;
  setCurrency: (c: Currency) => void;
  products: Product[];
  addProduct: (product: Product) => Promise<void>;
  updateProduct: (productId: string, updated: Product) => Promise<void>;
  deleteProduct: (productId: string) => Promise<void>;
  setProductStockStatus: (productId: string, status: StockStatus) => Promise<void>;
  refreshRemoteData: () => Promise<void>;
  cart: CartItem[];
  wishlist: string[];
  giftWrap: boolean;
  setGiftWrap: (val: boolean) => void;
  promoCode: string | null;
  promoRules: PromoCodeRule[];
  togglePromoRule: (code: string) => void;
  addPromoRule: (rule: PromoCodeRule) => { ok: boolean; message: string };
  deletePromoRule: (code: string) => void;
  applyPromoCode: (code: string) => { ok: boolean; message: string };
  removePromoCode: () => void;
  addToCart: (productId: string, size: string, quantity?: number) => void;
  updateQuantity: (productId: string, size: string, delta: number) => void;
  removeFromCart: (productId: string, size: string) => void;
  clearCart: () => void;
  toggleWishlist: (productId: string) => void;
  isWishlisted: (productId: string) => boolean;
  totalCartCount: number;
  subtotalPkr: number;
  discountPkr: number;
  giftWrapPkr: number;
  shippingPkr: number;
  totalPkr: number;
  orders: OrderReceipt[];
  recordOrder: (receipt: OrderReceipt) => Promise<{ ok: boolean; error?: string }>;
  updateOrderStatus: (orderNumber: string, status: OrderStatus) => Promise<void>;
  trackOrderByNumber: (orderNumber: string) => Promise<OrderReceipt | null>;
  cartOpen: boolean;
  setCartOpen: (open: boolean) => void;
  checkoutOpen: boolean;
  setCheckoutOpen: (open: boolean) => void;
  ordersOpen: boolean;
  setOrdersOpen: (open: boolean) => void;
  getProductById: (id: string) => Product | undefined;
  adminAuthenticated: boolean;
  adminEmail: string | null;
  adminLoginOpen: boolean;
  adminDashboardOpen: boolean;
  openAdminEntry: () => void;
  closeAdminLogin: () => void;
  closeAdminDashboard: () => void;
  authenticateAdmin: (
    credentials: AdminAuthCredentials
  ) => Promise<{ ok: boolean; error?: string }>;
  logoutAdmin: () => Promise<void>;
}

const StoreContext = createContext<StoreContextValue | null>(null);

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<PersistedState>(loadInitialState);
  const [productsLoading, setProductsLoading] = useState<boolean>(isSupabaseConfigured);
  const [dbSyncError, setDbSyncError] = useState<string | null>(null);
  const [cartOpen, setCartOpen] = useState(false);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [ordersOpen, setOrdersOpen] = useState(false);

  const [adminAuthenticated, setAdminAuthenticated] = useState<boolean>(
    loadAdminSession
  );
  const [adminEmail, setAdminEmail] = useState<string | null>(null);
  const [adminLoginOpen, setAdminLoginOpen] = useState(false);
  const [adminDashboardOpen, setAdminDashboardOpen] = useState(false);

  // Persist shopper preferences & fallback cache to localStorage
  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      // Ignore storage quota errors gracefully
    }
  }, [state]);

  const fetchRemoteProducts = useCallback(async () => {
    if (!isSupabaseConfigured || !supabase) {
      setProductsLoading(false);
      return;
    }

    setProductsLoading(true);
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('id', { ascending: true });

      if (error) {
        setDbSyncError(`Products sync fallback active (${error.message})`);
        setProductsLoading(false);
        return;
      }

      if (data && data.length > 0) {
        const mapped = data.map((row) =>
          normalizeProduct(supabaseRowToProduct(row as Record<string, unknown>))
        );
        setState((prev) => ({ ...prev, products: mapped }));
        setDbSyncError(null);
      } else {
        // Attempt auto-seed when products table is empty; display PRODUCTS either way
        const seedRows = PRODUCTS.map(productToSupabaseRow);
        const { error: seedErr } = await supabase
          .from('products')
          .upsert(seedRows, { onConflict: 'id' });

        if (!seedErr) {
          setState((prev) => ({ ...prev, products: PRODUCTS }));
          setDbSyncError(null);
        } else {
          // If RLS prevents anonymous insert, display default catalog cleanly
          setState((prev) => ({
            ...prev,
            products: prev.products.length > 0 ? prev.products : PRODUCTS,
          }));
        }
      }
    } catch {
      setDbSyncError('Unable to reach Supabase right now. Showing local catalog.');
    } finally {
      setProductsLoading(false);
    }
  }, []);

  const fetchRemoteOrders = useCallback(async () => {
    if (!isSupabaseConfigured || !supabase) return;
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false });

      if (!error && data) {
        const mapped = data.map((row) =>
          normalizeOrder(supabaseRowToOrder(row as Record<string, unknown>))
        );
        setState((prev) => ({
          ...prev,
          orders: mapped.length > 0 ? mapped : prev.orders,
        }));
      }
    } catch {
      // Keep local orders fallback silently
    }
  }, []);

  const refreshRemoteData = useCallback(async () => {
    await Promise.all([fetchRemoteProducts(), fetchRemoteOrders()]);
  }, [fetchRemoteProducts, fetchRemoteOrders]);

  // Initial Supabase hydration + Auth state listener
  useEffect(() => {
    if (!isSupabaseConfigured || !supabase) {
      setProductsLoading(false);
      return;
    }

    void refreshRemoteData();

    void supabase.auth.getSession().then(({ data }) => {
      if (data.session?.user) {
        setAdminAuthenticated(true);
        setAdminEmail(data.session.user.email ?? null);
      }
    });

    const { data: authListener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        if (session?.user) {
          setAdminAuthenticated(true);
          setAdminEmail(session.user.email ?? null);
        } else {
          setAdminAuthenticated(false);
          setAdminEmail(null);
        }
      }
    );

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [refreshRemoteData]);

  const getProductById = (id: string) =>
    state.products.find((p) => p.id === id);

  const setCurrency = (currency: Currency) => {
    setState((prev) => ({ ...prev, currency }));
  };

  const setGiftWrap = (giftWrap: boolean) => {
    setState((prev) => ({ ...prev, giftWrap }));
  };

  const addProduct = async (product: Product) => {
    const normalized = normalizeProduct(product);
    setState((prev) => ({
      ...prev,
      products: [normalized, ...prev.products],
    }));

    if (isSupabaseConfigured && supabase) {
      const { error } = await supabase
        .from('products')
        .insert(productToSupabaseRow(normalized));
      if (error) {
        setDbSyncError(`Product saved locally, DB sync failed: ${error.message}`);
      } else {
        setDbSyncError(null);
      }
    }
  };

  const updateProduct = async (productId: string, updated: Product) => {
    const normalized = normalizeProduct(updated);
    setState((prev) => ({
      ...prev,
      products: prev.products.map((p) => (p.id === productId ? normalized : p)),
    }));

    if (isSupabaseConfigured && supabase) {
      const { error } = await supabase
        .from('products')
        .update(productToSupabaseRow(normalized))
        .eq('id', productId);
      if (error) {
        setDbSyncError(`Product updated locally, DB sync failed: ${error.message}`);
      } else {
        setDbSyncError(null);
      }
    }
  };

  const deleteProduct = async (productId: string) => {
    setState((prev) => ({
      ...prev,
      products: prev.products.filter((p) => p.id !== productId),
      cart: prev.cart.filter((c) => c.productId !== productId),
      wishlist: prev.wishlist.filter((id) => id !== productId),
    }));

    if (isSupabaseConfigured && supabase) {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', productId);
      if (error) {
        setDbSyncError(`Product removed locally, DB sync failed: ${error.message}`);
      } else {
        setDbSyncError(null);
      }
    }
  };

  const setProductStockStatus = async (productId: string, status: StockStatus) => {
    setState((prev) => ({
      ...prev,
      products: prev.products.map((p) =>
        p.id === productId ? { ...p, stockStatus: status } : p
      ),
    }));

    if (isSupabaseConfigured && supabase) {
      const { error } = await supabase
        .from('products')
        .update({ stock_status: status })
        .eq('id', productId);
      if (error) {
        setDbSyncError(`Stock updated locally, DB sync failed: ${error.message}`);
      } else {
        setDbSyncError(null);
      }
    }
  };

  const togglePromoRule = (code: string) => {
    setState((prev) => {
      const nextRules = prev.promoRules.map((rule) =>
        rule.code === code ? { ...rule, enabled: !rule.enabled } : rule
      );
      const updated = nextRules.find((r) => r.code === code);
      const shouldClearActive =
        prev.promoCode === code && updated && !updated.enabled;
      return {
        ...prev,
        promoRules: nextRules,
        promoCode: shouldClearActive ? null : prev.promoCode,
      };
    });
  };

  const addPromoRule = (
    rule: PromoCodeRule
  ): { ok: boolean; message: string } => {
    const cleanCode = rule.code.trim().toUpperCase().replace(/\s+/g, '');
    if (!cleanCode || cleanCode.length < 3) {
      return { ok: false, message: 'Code must be at least 3 characters.' };
    }
    if (
      !Number.isFinite(rule.discountPercent) ||
      rule.discountPercent < 1 ||
      rule.discountPercent > 75
    ) {
      return { ok: false, message: 'Discount must be between 1% and 75%.' };
    }
    const exists = state.promoRules.some((r) => r.code === cleanCode);
    if (exists) {
      return { ok: false, message: `Promo code ${cleanCode} already exists.` };
    }
    setState((prev) => ({
      ...prev,
      promoRules: [
        {
          code: cleanCode,
          discountPercent: Math.round(rule.discountPercent),
          enabled: rule.enabled,
          description:
            rule.description?.trim() ||
            `${Math.round(rule.discountPercent)}% Boutique Offer`,
        },
        ...prev.promoRules,
      ],
    }));
    return { ok: true, message: `Promo code ${cleanCode} created.` };
  };

  const deletePromoRule = (code: string) => {
    setState((prev) => ({
      ...prev,
      promoRules: prev.promoRules.filter((r) => r.code !== code),
      promoCode: prev.promoCode === code ? null : prev.promoCode,
    }));
  };

  const applyPromoCode = (rawCode: string): { ok: boolean; message: string } => {
    const normalized = rawCode.trim().toUpperCase();
    if (!normalized) {
      return { ok: false, message: 'Enter a promo code to apply.' };
    }
    const matched = state.promoRules.find((r) => r.code === normalized);
    if (!matched) {
      const enabledHint = state.promoRules.find((r) => r.enabled);
      return {
        ok: false,
        message: enabledHint
          ? `Invalid code. Try ${enabledHint.code} for ${enabledHint.discountPercent}% off.`
          : 'Invalid or unavailable promo code.',
      };
    }
    if (!matched.enabled) {
      return {
        ok: false,
        message: `Promo code ${matched.code} is currently paused.`,
      };
    }
    setState((prev) => ({ ...prev, promoCode: matched.code }));
    return {
      ok: true,
      message: `${matched.code} applied — ${matched.discountPercent}% boutique discount active.`,
    };
  };

  const removePromoCode = () => {
    setState((prev) => ({ ...prev, promoCode: null }));
  };

  const addToCart = (productId: string, size: string, quantity = 1) => {
    const product = state.products.find((p) => p.id === productId);
    if (!product || product.stockStatus === 'sold-out') return;

    setState((prev) => {
      const existing = prev.cart.find(
        (item) => item.productId === productId && item.size === size
      );
      if (existing) {
        return {
          ...prev,
          cart: prev.cart.map((item) =>
            item.productId === productId && item.size === size
              ? { ...item, quantity: item.quantity + quantity }
              : item
          ),
        };
      }
      return {
        ...prev,
        cart: [...prev.cart, { productId, size, quantity }],
      };
    });
  };

  const updateQuantity = (productId: string, size: string, delta: number) => {
    setState((prev) => ({
      ...prev,
      cart: prev.cart
        .map((item) =>
          item.productId === productId && item.size === size
            ? { ...item, quantity: item.quantity + delta }
            : item
        )
        .filter((item) => item.quantity > 0),
    }));
  };

  const removeFromCart = (productId: string, size: string) => {
    setState((prev) => ({
      ...prev,
      cart: prev.cart.filter(
        (item) => !(item.productId === productId && item.size === size)
      ),
    }));
  };

  const clearCart = () => {
    setState((prev) => ({
      ...prev,
      cart: [],
      giftWrap: false,
      promoCode: null,
    }));
  };

  const toggleWishlist = (productId: string) => {
    setState((prev) => {
      const exists = prev.wishlist.includes(productId);
      return {
        ...prev,
        wishlist: exists
          ? prev.wishlist.filter((id) => id !== productId)
          : [...prev.wishlist, productId],
      };
    });
  };

  const isWishlisted = (productId: string) => state.wishlist.includes(productId);

  const recordOrder = async (
    receipt: OrderReceipt
  ): Promise<{ ok: boolean; error?: string }> => {
    const normalized = normalizeOrder(receipt);
    setState((prev) => ({
      ...prev,
      orders: [normalized, ...prev.orders],
      cart: [],
      giftWrap: false,
      promoCode: null,
    }));

    if (isSupabaseConfigured && supabase) {
      const { error } = await supabase
        .from('orders')
        .insert(orderToSupabaseRow(normalized));
      if (error) {
        return { ok: false, error: error.message };
      }
    }
    return { ok: true };
  };

  const updateOrderStatus = async (orderNumber: string, status: OrderStatus) => {
    setState((prev) => ({
      ...prev,
      orders: prev.orders.map((order) =>
        order.orderNumber === orderNumber ? { ...order, status } : order
      ),
    }));

    if (isSupabaseConfigured && supabase) {
      const { error } = await supabase
        .from('orders')
        .update({ status })
        .eq('order_number', orderNumber);
      if (error) {
        setDbSyncError(`Order status updated locally, DB sync failed: ${error.message}`);
      } else {
        setDbSyncError(null);
      }
    }
  };

  const trackOrderByNumber = async (
    orderNumber: string
  ): Promise<OrderReceipt | null> => {
    const normalized = orderNumber.trim().toUpperCase();
    if (!normalized) return null;

    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase
          .from('orders')
          .select('*')
          .ilike('order_number', normalized)
          .maybeSingle();

        if (!error && data) {
          return normalizeOrder(
            supabaseRowToOrder(data as Record<string, unknown>)
          );
        }
      } catch {
        // Fall through to local order lookup
      }
    }

    const localMatch = state.orders.find(
      (o) => o.orderNumber.toUpperCase() === normalized
    );
    return localMatch ?? null;
  };

  const openAdminEntry = () => {
    if (adminAuthenticated) {
      setAdminDashboardOpen(true);
    } else {
      setAdminLoginOpen(true);
    }
  };

  const closeAdminLogin = () => {
    setAdminLoginOpen(false);
  };

  const closeAdminDashboard = () => {
    setAdminDashboardOpen(false);
  };

  const authenticateAdmin = async ({
    email,
    password,
  }: AdminAuthCredentials): Promise<{ ok: boolean; error?: string }> => {
    if (isSupabaseConfigured && supabase) {
      const cleanEmail = email?.trim() ?? '';
      if (!cleanEmail || !password) {
        return {
          ok: false,
          error: 'Please enter your admin email and password.',
        };
      }
      const { data, error } = await supabase.auth.signInWithPassword({
        email: cleanEmail,
        password,
      });
      if (error || !data.session) {
        return {
          ok: false,
          error: error?.message || 'Invalid admin email or password.',
        };
      }
      setAdminAuthenticated(true);
      setAdminEmail(data.user?.email ?? cleanEmail);
      setAdminLoginOpen(false);
      setAdminDashboardOpen(true);
      void refreshRemoteData();
      return { ok: true };
    }

    // Fallback PIN / Password access when Supabase env vars are not configured
    const trimmed = password.trim();
    if (trimmed === '1234' || trimmed === 'ouraadmin') {
      setAdminAuthenticated(true);
      try {
        window.sessionStorage.setItem(ADMIN_SESSION_KEY, 'true');
      } catch {
        // Ignore session storage errors
      }
      setAdminLoginOpen(false);
      setAdminDashboardOpen(true);
      return { ok: true };
    }
    return {
      ok: false,
      error: 'Incorrect PIN or password. Please try again.',
    };
  };

  const logoutAdmin = async () => {
    if (isSupabaseConfigured && supabase) {
      await supabase.auth.signOut();
    }
    setAdminAuthenticated(false);
    setAdminEmail(null);
    setAdminDashboardOpen(false);
    try {
      window.sessionStorage.removeItem(ADMIN_SESSION_KEY);
    } catch {
      // Ignore session storage errors
    }
  };

  const totals = useMemo(() => {
    let totalCartCount = 0;
    let subtotalPkr = 0;

    for (const item of state.cart) {
      const product = state.products.find((p) => p.id === item.productId);
      if (product) {
        totalCartCount += item.quantity;
        subtotalPkr += product.pricePkr * item.quantity;
      }
    }

    const activeRule = state.promoCode
      ? state.promoRules.find(
          (r) => r.code === state.promoCode && r.enabled
        )
      : undefined;

    const discountPkr = activeRule
      ? Math.round(subtotalPkr * (activeRule.discountPercent / 100))
      : 0;
    const giftWrapPkr =
      state.cart.length > 0 && state.giftWrap ? GIFT_WRAP_FEE_PKR : 0;
    const afterDiscount = Math.max(0, subtotalPkr - discountPkr);
    const shippingPkr =
      state.cart.length === 0 || afterDiscount >= FREE_DELIVERY_THRESHOLD_PKR
        ? 0
        : STANDARD_DELIVERY_FEE_PKR;
    const totalPkr = afterDiscount + giftWrapPkr + shippingPkr;

    return {
      totalCartCount,
      subtotalPkr,
      discountPkr,
      giftWrapPkr,
      shippingPkr,
      totalPkr,
    };
  }, [state.cart, state.giftWrap, state.promoCode, state.products, state.promoRules]);

  return (
    <StoreContext.Provider
      value={{
        supabaseEnabled: isSupabaseConfigured,
        productsLoading,
        dbSyncError,
        currency: state.currency,
        setCurrency,
        products: state.products,
        addProduct,
        updateProduct,
        deleteProduct,
        setProductStockStatus,
        refreshRemoteData,
        cart: state.cart,
        wishlist: state.wishlist,
        giftWrap: state.giftWrap,
        setGiftWrap,
        promoCode: state.promoCode,
        promoRules: state.promoRules,
        togglePromoRule,
        addPromoRule,
        deletePromoRule,
        applyPromoCode,
        removePromoCode,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        toggleWishlist,
        isWishlisted,
        orders: state.orders,
        recordOrder,
        updateOrderStatus,
        trackOrderByNumber,
        cartOpen,
        setCartOpen,
        checkoutOpen,
        setCheckoutOpen,
        ordersOpen,
        setOrdersOpen,
        getProductById,
        adminAuthenticated,
        adminEmail,
        adminLoginOpen,
        adminDashboardOpen,
        openAdminEntry,
        closeAdminLogin,
        closeAdminDashboard,
        authenticateAdmin,
        logoutAdmin,
        ...totals,
      }}
    >
      {children}
    </StoreContext.Provider>
  );
}

export function useStore(): StoreContextValue {
  const ctx = useContext(StoreContext);
  if (!ctx) {
    throw new Error('useStore must be used inside StoreProvider');
  }
  return ctx;
}
