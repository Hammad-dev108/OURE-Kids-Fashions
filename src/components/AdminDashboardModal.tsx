import { useMemo, useState } from 'react';
import {
  AlertTriangle,
  ArrowLeft,
  Banknote,
  Edit3,
  Gift,
  LogOut,
  Package,
  Plus,
  Search,
  ShoppingBag,
  Tag,
  Trash2,
  TrendingUp,
} from 'lucide-react';
import { PRODUCT_CATEGORIES, formatPrice } from '../data/products';
import { useStore } from '../context/StoreContext';
import type {
  OrderStatus,
  Product,
  ProductCategory,
  StockStatus,
} from '../types/store';
import { AdminProductFormModal } from './AdminProductFormModal';

type AdminTab = 'products' | 'orders' | 'promos';

const ORDER_STATUSES: OrderStatus[] = [
  'Pending',
  'Confirmed',
  'Shipped',
  'Delivered',
  'Cancelled',
];

function getStatusBadgeClasses(status: OrderStatus): string {
  switch (status) {
    case 'Pending':
      return 'border-[#E0AF50] bg-[#F4E4D8] text-[#2C221E]';
    case 'Confirmed':
      return 'border-[#C8963E] bg-[#C8963E]/15 text-[#2C221E]';
    case 'Shipped':
      return 'border-[#C8963E] bg-[#C8963E] text-[#FFFFFF]';
    case 'Delivered':
      return 'border-[#2C221E] bg-[#2C221E] text-[#FAF6F0]';
    case 'Cancelled':
      return 'border-[#E8DFD1] bg-[#FAF6F0] text-[#6E5D54] line-through';
  }
}

export function AdminDashboardModal() {
  const {
    adminDashboardOpen,
    closeAdminDashboard,
    logoutAdmin,
    currency,
    setCurrency,
    products,
    addProduct,
    updateProduct,
    deleteProduct,
    setProductStockStatus,
    orders,
    updateOrderStatus,
    promoRules,
    togglePromoRule,
    addPromoRule,
    deletePromoRule,
  } = useStore();

  const [activeTab, setActiveTab] = useState<AdminTab>('products');
  const [productSearch, setProductSearch] = useState('');
  const [productCatFilter, setProductCatFilter] =
    useState<ProductCategory>('All');
  const [stockFilter, setStockFilter] = useState<'all' | 'low-or-out'>('all');
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const [formModalOpen, setFormModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  const [orderSearch, setOrderSearch] = useState('');
  const [orderStatusFilter, setOrderStatusFilter] = useState<
    OrderStatus | 'All'
  >('All');

  const [newPromoCode, setNewPromoCode] = useState('');
  const [newPromoPercent, setNewPromoPercent] = useState('15');
  const [newPromoDesc, setNewPromoDesc] = useState('');
  const [promoMsg, setPromoMsg] = useState<{
    ok: boolean;
    text: string;
  } | null>(null);

  const kpis = useMemo(() => {
    const activeOrders = orders.filter((o) => o.status !== 'Cancelled');
    const totalRevenuePkr = activeOrders.reduce(
      (sum, o) => sum + o.totalPkr,
      0
    );
    const activeProductsCount = products.filter(
      (p) => p.stockStatus !== 'sold-out'
    ).length;
    const lowStockCount = products.filter(
      (p) => p.stockStatus === 'low-stock'
    ).length;
    const soldOutCount = products.filter(
      (p) => p.stockStatus === 'sold-out'
    ).length;

    return {
      totalRevenuePkr,
      totalOrders: orders.length,
      pendingOrders: orders.filter((o) => o.status === 'Pending').length,
      activeProductsCount,
      lowOrOutCount: lowStockCount + soldOutCount,
      lowStockCount,
      soldOutCount,
    };
  }, [orders, products]);

  const filteredProducts = useMemo(() => {
    const q = productSearch.trim().toLowerCase();
    return products.filter((p) => {
      if (productCatFilter !== 'All' && p.category !== productCatFilter) {
        return false;
      }
      if (
        stockFilter === 'low-or-out' &&
        p.stockStatus === 'in-stock'
      ) {
        return false;
      }
      if (q) {
        const hay = `${p.name} ${p.subtitle} ${p.category} ${p.fabricBadge}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [products, productSearch, productCatFilter, stockFilter]);

  const filteredOrders = useMemo(() => {
    const q = orderSearch.trim().toLowerCase();
    return orders.filter((o) => {
      if (orderStatusFilter !== 'All' && o.status !== orderStatusFilter) {
        return false;
      }
      if (q) {
        const itemNames = o.items.map((i) => i.name).join(' ');
        const hay = `${o.orderNumber} ${o.delivery.fullName} ${o.delivery.city} ${o.delivery.phone} ${itemNames}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [orders, orderSearch, orderStatusFilter]);

  if (!adminDashboardOpen) return null;

  const handleSaveProduct = (product: Product) => {
    if (editingProduct) {
      updateProduct(editingProduct.id, product);
    } else {
      addProduct(product);
    }
  };

  const handleToggleStock = (product: Product) => {
    const next: StockStatus =
      product.stockStatus === 'sold-out' ? 'in-stock' : 'sold-out';
    setProductStockStatus(product.id, next);
  };

  const handleCreatePromo = (e: React.FormEvent) => {
    e.preventDefault();
    const res = addPromoRule({
      code: newPromoCode,
      discountPercent: Number(newPromoPercent),
      enabled: true,
      description: newPromoDesc,
    });
    setPromoMsg({ ok: res.ok, text: res.message });
    if (res.ok) {
      setNewPromoCode('');
      setNewPromoDesc('');
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto overscroll-contain bg-[#FAF6F0] text-[#2C221E]"
      role="dialog"
      aria-modal="true"
      aria-label="OURA Fashion Kid's Admin Dashboard"
    >
      {/* Top Sticky Admin Header */}
      <header className="sticky top-0 z-20 border-b border-[#E8DFD1] bg-[#FFFFFF]">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-4 py-3.5 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={closeAdminDashboard}
              className="inline-flex items-center gap-1.5 rounded-lg border border-[#E8DFD1] bg-[#FAF6F0] px-3 py-1.5 text-xs font-medium text-[#6E5D54] transition-colors hover:border-[#C8963E] hover:text-[#2C221E]"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              <span>Storefront</span>
            </button>
            <div>
              <h1 className="font-display text-xl font-semibold text-[#2C221E] sm:text-2xl">
                OURA Atelier Admin
              </h1>
              <p className="hidden text-[11px] text-[#6E5D54] sm:block">
                Catalog, Orders &amp; Boutique Promotions · Live Browser Persistence
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            {/* Currency Switcher */}
            <div
              role="group"
              aria-label="Admin currency selector"
              className="flex items-center rounded-lg border border-[#E8DFD1] bg-[#FAF6F0] p-0.5 text-xs"
            >
              <button
                type="button"
                onClick={() => setCurrency('PKR')}
                className={`rounded-md px-2.5 py-1 font-semibold transition-colors ${
                  currency === 'PKR'
                    ? 'bg-[#C8963E] text-[#FFFFFF]'
                    : 'text-[#6E5D54] hover:text-[#2C221E]'
                }`}
              >
                PKR
              </button>
              <button
                type="button"
                onClick={() => setCurrency('USD')}
                className={`rounded-md px-2.5 py-1 font-semibold transition-colors ${
                  currency === 'USD'
                    ? 'bg-[#C8963E] text-[#FFFFFF]'
                    : 'text-[#6E5D54] hover:text-[#2C221E]'
                }`}
              >
                USD
              </button>
            </div>

            <button
              type="button"
              onClick={logoutAdmin}
              className="inline-flex items-center gap-1.5 rounded-lg border border-[#E8DFD1] bg-[#FAF6F0] px-3.5 py-2 text-xs font-semibold text-[#2C221E] transition-colors hover:border-[#C8963E] hover:bg-[#F4E4D8]"
            >
              <LogOut className="h-3.5 w-3.5 text-[#C8963E]" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Scrollable Dashboard Content */}
      <div className="mx-auto max-w-7xl space-y-7 px-4 py-7 sm:px-6 lg:px-8">
          {/* 1. KPI Summary Cards */}
          <section aria-label="Store Key Performance Indicators">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <div className="rounded-2xl border border-[#E8DFD1] bg-[#FFFFFF] p-5 shadow-xs">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-[#6E5D54]">
                    Total Revenue ({currency})
                  </span>
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#F4E4D8] text-[#C8963E]">
                    <Banknote className="h-4 w-4" />
                  </div>
                </div>
                <p className="tabular-nums mt-3 font-display text-3xl font-semibold text-[#2C221E]">
                  {formatPrice(kpis.totalRevenuePkr, currency)}
                </p>
                <p className="mt-1 text-[11px] text-[#6E5D54]">
                  Excludes cancelled orders · Live total
                </p>
              </div>

              <div className="rounded-2xl border border-[#E8DFD1] bg-[#FFFFFF] p-5 shadow-xs">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-[#6E5D54]">
                    Total Orders
                  </span>
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#F4E4D8] text-[#C8963E]">
                    <TrendingUp className="h-4 w-4" />
                  </div>
                </div>
                <p className="tabular-nums mt-3 font-display text-3xl font-semibold text-[#2C221E]">
                  {kpis.totalOrders}
                </p>
                <p className="mt-1 text-[11px] text-[#6E5D54]">
                  <span className="font-semibold text-[#C8963E]">
                    {kpis.pendingOrders} pending
                  </span>{' '}
                  awaiting confirmation
                </p>
              </div>

              <div className="rounded-2xl border border-[#E8DFD1] bg-[#FFFFFF] p-5 shadow-xs">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-[#6E5D54]">
                    Active Products
                  </span>
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#F4E4D8] text-[#C8963E]">
                    <ShoppingBag className="h-4 w-4" />
                  </div>
                </div>
                <p className="tabular-nums mt-3 font-display text-3xl font-semibold text-[#2C221E]">
                  {kpis.activeProductsCount}
                  <span className="ml-1.5 text-sm font-normal text-[#6E5D54]">
                    / {products.length}
                  </span>
                </p>
                <p className="mt-1 text-[11px] text-[#6E5D54]">
                  Available for purchase on storefront
                </p>
              </div>

              <button
                type="button"
                onClick={() => {
                  setActiveTab('products');
                  setStockFilter((prev) =>
                    prev === 'low-or-out' ? 'all' : 'low-or-out'
                  );
                }}
                className="rounded-2xl border border-[#E8DFD1] bg-[#FFFFFF] p-5 text-left shadow-xs transition-colors hover:border-[#C8963E]"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-[#6E5D54]">
                    Low / Out-of-Stock Items
                  </span>
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#F4E4D8] text-[#C8963E]">
                    <AlertTriangle className="h-4 w-4" />
                  </div>
                </div>
                <p className="tabular-nums mt-3 font-display text-3xl font-semibold text-[#2C221E]">
                  {kpis.lowOrOutCount}
                </p>
                <p className="mt-1 text-[11px] text-[#6E5D54]">
                  {kpis.lowStockCount} low stock · {kpis.soldOutCount} sold out
                </p>
              </button>
            </div>
          </section>

          {/* 2. Section Tabs */}
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#E8DFD1] pb-3">
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => setActiveTab('products')}
                className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-xs font-semibold transition-colors ${
                  activeTab === 'products'
                    ? 'bg-[#C8963E] text-[#FFFFFF]'
                    : 'border border-[#E8DFD1] bg-[#FFFFFF] text-[#6E5D54] hover:border-[#C8963E] hover:text-[#2C221E]'
                }`}
              >
                <Package className="h-4 w-4" />
                <span>Product Catalog ({products.length})</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('orders')}
                className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-xs font-semibold transition-colors ${
                  activeTab === 'orders'
                    ? 'bg-[#C8963E] text-[#FFFFFF]'
                    : 'border border-[#E8DFD1] bg-[#FFFFFF] text-[#6E5D54] hover:border-[#C8963E] hover:text-[#2C221E]'
                }`}
              >
                <ShoppingBag className="h-4 w-4" />
                <span>Orders ({orders.length})</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('promos')}
                className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-xs font-semibold transition-colors ${
                  activeTab === 'promos'
                    ? 'bg-[#C8963E] text-[#FFFFFF]'
                    : 'border border-[#E8DFD1] bg-[#FFFFFF] text-[#6E5D54] hover:border-[#C8963E] hover:text-[#2C221E]'
                }`}
              >
                <Tag className="h-4 w-4" />
                <span>Promo Codes ({promoRules.length})</span>
              </button>
            </div>

            {activeTab === 'products' && (
              <button
                type="button"
                onClick={() => {
                  setEditingProduct(null);
                  setFormModalOpen(true);
                }}
                className="inline-flex items-center gap-1.5 rounded-lg bg-[#C8963E] px-4 py-2 text-xs font-semibold text-[#FFFFFF] transition-colors hover:bg-[#E0AF50] hover:text-[#2C221E]"
              >
                <Plus className="h-4 w-4" />
                <span>Add New Product</span>
              </button>
            )}
          </div>

          {/* 3. Tab Panel: Product Management */}
          {activeTab === 'products' && (
            <section className="space-y-4">
              {/* Toolbar */}
              <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-[#E8DFD1] bg-[#FFFFFF] p-4">
                <div className="relative min-w-[220px] flex-1 max-w-md">
                  <Search className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-[#6E5D54]" />
                  <input
                    type="search"
                    value={productSearch}
                    onChange={(e) => setProductSearch(e.target.value)}
                    placeholder="Search garments by name, fabric, or category..."
                    className="w-full rounded-lg border border-[#E8DFD1] bg-[#FAF6F0] py-2 pr-3 pl-9 text-xs text-[#2C221E] placeholder:text-[#6E5D54]/60 focus:border-[#C8963E] focus:outline-none"
                  />
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <select
                    value={productCatFilter}
                    onChange={(e) =>
                      setProductCatFilter(e.target.value as ProductCategory)
                    }
                    aria-label="Filter products by category"
                    className="rounded-lg border border-[#E8DFD1] bg-[#FAF6F0] px-3 py-2 text-xs font-medium text-[#2C221E] focus:border-[#C8963E] focus:outline-none"
                  >
                    {PRODUCT_CATEGORIES.map((c) => (
                      <option key={c} value={c}>
                        {c === 'All' ? 'All Categories' : c}
                      </option>
                    ))}
                  </select>

                  <button
                    type="button"
                    onClick={() =>
                      setStockFilter((prev) =>
                        prev === 'all' ? 'low-or-out' : 'all'
                      )
                    }
                    className={`rounded-lg border px-3 py-2 text-xs font-medium transition-colors ${
                      stockFilter === 'low-or-out'
                        ? 'border-[#C8963E] bg-[#F4E4D8] text-[#2C221E]'
                        : 'border-[#E8DFD1] bg-[#FAF6F0] text-[#6E5D54] hover:border-[#C8963E]'
                    }`}
                  >
                    {stockFilter === 'low-or-out'
                      ? 'Showing Low / Sold Out'
                      : 'Filter: Low / Sold Out'}
                  </button>
                </div>
              </div>

              {/* Product Table */}
              <div className="overflow-hidden rounded-2xl border border-[#E8DFD1] bg-[#FFFFFF]">
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[780px] text-left text-xs">
                    <thead className="border-b border-[#E8DFD1] bg-[#FAF6F0] text-[#6E5D54]">
                      <tr>
                        <th className="px-4 py-3.5 font-semibold">Garment</th>
                        <th className="px-4 py-3.5 font-semibold">Category</th>
                        <th className="px-4 py-3.5 font-semibold">Age Brackets</th>
                        <th className="px-4 py-3.5 font-semibold">Price</th>
                        <th className="px-4 py-3.5 font-semibold">Stock Status</th>
                        <th className="px-4 py-3.5 font-semibold text-right">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#E8DFD1]">
                      {filteredProducts.length === 0 ? (
                        <tr>
                          <td
                            colSpan={6}
                            className="px-6 py-12 text-center text-sm text-[#6E5D54]"
                          >
                            No garments match your current search or filter.
                          </td>
                        </tr>
                      ) : (
                        filteredProducts.map((product) => {
                          const isSoldOut = product.stockStatus === 'sold-out';
                          const isLowStock =
                            product.stockStatus === 'low-stock';

                          return (
                            <tr
                              key={product.id}
                              className="transition-colors hover:bg-[#FAF6F0]/70"
                            >
                              <td className="px-4 py-3.5">
                                <div className="flex items-center gap-3">
                                  <div className="h-12 w-14 shrink-0 overflow-hidden rounded-lg border border-[#E8DFD1] bg-[#F5EFE6]">
                                    <img
                                      src={product.imageUrl}
                                      alt={product.name}
                                      className="h-full w-full object-cover"
                                    />
                                  </div>
                                  <div className="min-w-0">
                                    <p className="font-display text-base font-semibold text-[#2C221E]">
                                      {product.name}
                                    </p>
                                    <p className="truncate text-[11px] text-[#6E5D54] max-w-[230px]">
                                      {product.fabricBadge}
                                    </p>
                                  </div>
                                </div>
                              </td>

                              <td className="px-4 py-3.5">
                                <span className="inline-block rounded-md bg-[#F4E4D8] px-2.5 py-1 text-[11px] font-medium text-[#2C221E]">
                                  {product.category}
                                </span>
                              </td>

                              <td className="px-4 py-3.5 text-[#6E5D54]">
                                <p className="font-medium text-[#2C221E]">
                                  {product.ageBrackets.join(', ')}
                                </p>
                                <p className="text-[11px]">
                                  {product.availableSizes.length} sizes
                                </p>
                              </td>

                              <td className="tabular-nums px-4 py-3.5 font-semibold text-[#2C221E]">
                                {formatPrice(product.pricePkr, 'PKR')}
                                {currency === 'USD' && (
                                  <span className="block text-[11px] font-normal text-[#C8963E]">
                                    {formatPrice(product.pricePkr, 'USD')}
                                  </span>
                                )}
                              </td>

                              <td className="px-4 py-3.5">
                                <div className="flex items-center gap-2">
                                  <button
                                    type="button"
                                    onClick={() => handleToggleStock(product)}
                                    title="Click to toggle In Stock / Sold Out"
                                    className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-[11px] font-semibold transition-colors ${
                                      isSoldOut
                                        ? 'border-[#2C221E] bg-[#2C221E] text-[#FAF6F0]'
                                        : isLowStock
                                        ? 'border-[#C8963E] bg-[#F4E4D8] text-[#2C221E]'
                                        : 'border-[#C8963E]/60 bg-[#FAF6F0] text-[#2C221E] hover:border-[#C8963E]'
                                    }`}
                                  >
                                    <span
                                      className={`h-1.5 w-1.5 rounded-full ${
                                        isSoldOut
                                          ? 'bg-[#FAF6F0]'
                                          : isLowStock
                                          ? 'bg-[#E0AF50]'
                                          : 'bg-[#C8963E]'
                                      }`}
                                    />
                                    <span>
                                      {isSoldOut
                                        ? 'Sold Out'
                                        : isLowStock
                                        ? 'Low Stock'
                                        : 'In Stock'}
                                    </span>
                                  </button>
                                </div>
                              </td>

                              <td className="px-4 py-3.5 text-right">
                                {confirmDeleteId === product.id ? (
                                  <div className="inline-flex items-center gap-1.5">
                                    <button
                                      type="button"
                                      onClick={() => {
                                        deleteProduct(product.id);
                                        setConfirmDeleteId(null);
                                      }}
                                      className="rounded-md bg-[#2C221E] px-2.5 py-1 text-[11px] font-semibold text-[#FAF6F0] hover:bg-[#C8963E]"
                                    >
                                      Confirm Delete
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => setConfirmDeleteId(null)}
                                      className="rounded-md border border-[#E8DFD1] px-2 py-1 text-[11px] text-[#6E5D54]"
                                    >
                                      Cancel
                                    </button>
                                  </div>
                                ) : (
                                  <div className="inline-flex items-center gap-1.5">
                                    <button
                                      type="button"
                                      onClick={() => {
                                        setEditingProduct(product);
                                        setFormModalOpen(true);
                                      }}
                                      aria-label={`Edit ${product.name}`}
                                      className="inline-flex items-center gap-1 rounded-lg border border-[#E8DFD1] bg-[#FAF6F0] px-2.5 py-1.5 text-[11px] font-medium text-[#2C221E] transition-colors hover:border-[#C8963E] hover:bg-[#F4E4D8]"
                                    >
                                      <Edit3 className="h-3.5 w-3.5 text-[#C8963E]" />
                                      <span>Edit</span>
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() =>
                                        setConfirmDeleteId(product.id)
                                      }
                                      aria-label={`Delete ${product.name}`}
                                      className="inline-flex items-center justify-center rounded-lg border border-[#E8DFD1] bg-[#FAF6F0] p-1.5 text-[#6E5D54] transition-colors hover:border-[#2C221E] hover:text-[#2C221E]"
                                    >
                                      <Trash2 className="h-3.5 w-3.5" />
                                    </button>
                                  </div>
                                )}
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </section>
          )}

          {/* 4. Tab Panel: Order Management */}
          {activeTab === 'orders' && (
            <section className="space-y-4">
              {/* Filter Bar */}
              <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-[#E8DFD1] bg-[#FFFFFF] p-4">
                <div className="relative min-w-[220px] flex-1 max-w-md">
                  <Search className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-[#6E5D54]" />
                  <input
                    type="search"
                    value={orderSearch}
                    onChange={(e) => setOrderSearch(e.target.value)}
                    placeholder="Search Order ID, customer name, or city..."
                    className="w-full rounded-lg border border-[#E8DFD1] bg-[#FAF6F0] py-2 pr-3 pl-9 text-xs text-[#2C221E] placeholder:text-[#6E5D54]/60 focus:border-[#C8963E] focus:outline-none"
                  />
                </div>

                <div className="flex flex-wrap items-center gap-1.5">
                  {(['All', ...ORDER_STATUSES] as const).map((statusOpt) => {
                    const active = orderStatusFilter === statusOpt;
                    return (
                      <button
                        key={statusOpt}
                        type="button"
                        onClick={() => setOrderStatusFilter(statusOpt)}
                        className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                          active
                            ? 'bg-[#C8963E] font-semibold text-[#FFFFFF]'
                            : 'bg-[#FAF6F0] text-[#6E5D54] hover:bg-[#F4E4D8] hover:text-[#2C221E]'
                        }`}
                      >
                        {statusOpt}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Orders List */}
              {filteredOrders.length === 0 ? (
                <div className="rounded-2xl border border-[#E8DFD1] bg-[#FFFFFF] p-12 text-center text-sm text-[#6E5D54]">
                  No orders match this status or search filter.
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredOrders.map((order) => (
                    <div
                      key={order.orderNumber}
                      className="rounded-2xl border border-[#E8DFD1] bg-[#FFFFFF] p-5 shadow-xs"
                    >
                      <div className="flex flex-wrap items-start justify-between gap-4 border-b border-[#E8DFD1] pb-4">
                        <div>
                          <div className="flex flex-wrap items-center gap-2.5">
                            <span className="font-display text-lg font-semibold text-[#2C221E]">
                              Order #{order.orderNumber}
                            </span>
                            <span
                              className={`rounded-md border px-2.5 py-0.5 text-[11px] font-semibold ${getStatusBadgeClasses(
                                order.status
                              )}`}
                            >
                              {order.status}
                            </span>
                            <span className="rounded-md bg-[#F4E4D8] px-2.5 py-0.5 text-[11px] font-medium text-[#2C221E]">
                              {order.paymentMethod === 'cod'
                                ? 'Cash on Delivery (COD)'
                                : 'Card Payment'}
                            </span>
                            {order.giftWrap && (
                              <span className="inline-flex items-center gap-1 rounded-md border border-[#C8963E]/40 bg-[#FAF6F0] px-2 py-0.5 text-[11px] font-medium text-[#C8963E]">
                                <Gift className="h-3 w-3" />
                                <span>Gift Wrapped</span>
                              </span>
                            )}
                          </div>
                          <p className="mt-1 text-xs text-[#6E5D54]">
                            Placed {order.createdAt} · {order.delivery.fullName} ({order.delivery.phone})
                          </p>
                        </div>

                        {/* Interactive Status Selector */}
                        <div className="flex items-center gap-2">
                          <label
                            htmlFor={`status-${order.orderNumber}`}
                            className="text-xs font-medium text-[#6E5D54]"
                          >
                            Update Status:
                          </label>
                          <select
                            id={`status-${order.orderNumber}`}
                            value={order.status}
                            onChange={(e) =>
                              updateOrderStatus(
                                order.orderNumber,
                                e.target.value as OrderStatus
                              )
                            }
                            className="rounded-lg border border-[#C8963E]/60 bg-[#FAF6F0] px-3 py-1.5 text-xs font-semibold text-[#2C221E] focus:border-[#C8963E] focus:outline-none"
                          >
                            {ORDER_STATUSES.map((st) => (
                              <option key={st} value={st}>
                                {st}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>

                      <div className="mt-4 grid gap-4 md:grid-cols-12">
                        <div className="space-y-1.5 md:col-span-5 text-xs">
                          <p className="font-semibold text-[#2C221E]">
                            Delivery Destination
                          </p>
                          <p className="text-[#6E5D54]">
                            {order.delivery.address},{' '}
                            <span className="font-medium text-[#2C221E]">
                              {order.delivery.city}
                            </span>
                            {order.delivery.postalCode
                              ? ` (${order.delivery.postalCode})`
                              : ''}
                          </p>
                          {order.delivery.notes && (
                            <p className="rounded-lg bg-[#FAF6F0] px-2.5 py-1.5 text-[11px] text-[#6E5D54]">
                              Note: {order.delivery.notes}
                            </p>
                          )}
                        </div>

                        <div className="space-y-1.5 md:col-span-5 text-xs">
                          <p className="font-semibold text-[#2C221E]">
                            Ordered Garments
                          </p>
                          <ul className="space-y-1">
                            {order.items.map((item) => (
                              <li
                                key={`${order.orderNumber}-${item.productId}-${item.size}`}
                                className="flex justify-between gap-2 text-[#6E5D54]"
                              >
                                <span className="text-[#2C221E]">
                                  {item.quantity}x {item.name}{' '}
                                  <span className="text-[#6E5D54]">
                                    ({item.size})
                                  </span>
                                </span>
                                <span className="tabular-nums shrink-0">
                                  {formatPrice(
                                    item.unitPricePkr * item.quantity,
                                    currency
                                  )}
                                </span>
                              </li>
                            ))}
                          </ul>
                        </div>

                        <div className="flex flex-col justify-between rounded-xl border border-[#E8DFD1] bg-[#FAF6F0] p-3.5 text-xs md:col-span-2">
                          <span className="text-[#6E5D54]">Order Total</span>
                          <div>
                            <p className="tabular-nums text-base font-semibold text-[#C8963E]">
                              {formatPrice(order.totalPkr, currency)}
                            </p>
                            {order.promoCode && (
                              <p className="mt-0.5 text-[11px] text-[#6E5D54]">
                                Promo: {order.promoCode}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>
          )}

          {/* 5. Tab Panel: Promo Code Manager */}
          {activeTab === 'promos' && (
            <section className="grid gap-6 lg:grid-cols-12">
              <div className="space-y-3 lg:col-span-7">
                <h2 className="font-display text-2xl font-semibold text-[#2C221E]">
                  Active &amp; Scheduled Promo Codes
                </h2>
                {promoRules.map((rule) => (
                  <div
                    key={rule.code}
                    className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-[#E8DFD1] bg-[#FFFFFF] p-4"
                  >
                    <div>
                      <div className="flex items-center gap-2.5">
                        <span className="rounded-md bg-[#F4E4D8] px-2.5 py-1 text-xs font-bold tracking-wide text-[#2C221E]">
                          {rule.code}
                        </span>
                        <span className="tabular-nums text-sm font-semibold text-[#C8963E]">
                          {rule.discountPercent}% Off
                        </span>
                      </div>
                      {rule.description && (
                        <p className="mt-1 text-xs text-[#6E5D54]">
                          {rule.description}
                        </p>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => togglePromoRule(rule.code)}
                        className={`rounded-lg border px-3.5 py-1.5 text-xs font-semibold transition-colors ${
                          rule.enabled
                            ? 'border-[#C8963E] bg-[#C8963E] text-[#FFFFFF] hover:bg-[#E0AF50] hover:text-[#2C221E]'
                            : 'border-[#E8DFD1] bg-[#FAF6F0] text-[#6E5D54] hover:border-[#C8963E]'
                        }`}
                      >
                        {rule.enabled ? 'Enabled' : 'Paused'}
                      </button>

                      {rule.code !== 'BABY10' && (
                        <button
                          type="button"
                          onClick={() => deletePromoRule(rule.code)}
                          aria-label={`Delete promo code ${rule.code}`}
                          className="rounded-lg border border-[#E8DFD1] bg-[#FAF6F0] p-1.5 text-[#6E5D54] hover:border-[#2C221E] hover:text-[#2C221E]"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              <div className="lg:col-span-5">
                <form
                  onSubmit={handleCreatePromo}
                  className="rounded-2xl border border-[#E8DFD1] bg-[#FFFFFF] p-5 space-y-4"
                >
                  <h3 className="font-display text-xl font-semibold text-[#2C221E]">
                    Create Custom Discount Code
                  </h3>

                  {promoMsg && (
                    <div className="rounded-lg border border-[#C8963E] bg-[#F4E4D8] px-3 py-2 text-xs font-medium text-[#2C221E]">
                      {promoMsg.text}
                    </div>
                  )}

                  <div>
                    <label className="mb-1.5 block text-xs font-medium text-[#6E5D54]">
                      Promo Code *
                    </label>
                    <input
                      type="text"
                      required
                      value={newPromoCode}
                      onChange={(e) =>
                        setNewPromoCode(e.target.value.toUpperCase())
                      }
                      placeholder="EID20"
                      className="w-full rounded-lg border border-[#E8DFD1] bg-[#FAF6F0] px-3.5 py-2 text-sm uppercase text-[#2C221E] placeholder:text-[#6E5D54]/55 focus:border-[#C8963E] focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="mb-1.5 block text-xs font-medium text-[#6E5D54]">
                      Discount Percentage (1% – 75%) *
                    </label>
                    <input
                      type="number"
                      min={1}
                      max={75}
                      required
                      value={newPromoPercent}
                      onChange={(e) => setNewPromoPercent(e.target.value)}
                      className="tabular-nums w-full rounded-lg border border-[#E8DFD1] bg-[#FAF6F0] px-3.5 py-2 text-sm text-[#2C221E] focus:border-[#C8963E] focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="mb-1.5 block text-xs font-medium text-[#6E5D54]">
                      Campaign Note (Optional)
                    </label>
                    <input
                      type="text"
                      value={newPromoDesc}
                      onChange={(e) => setNewPromoDesc(e.target.value)}
                      placeholder="Festive Collection Launch Offer"
                      className="w-full rounded-lg border border-[#E8DFD1] bg-[#FAF6F0] px-3.5 py-2 text-sm text-[#2C221E] placeholder:text-[#6E5D54]/55 focus:border-[#C8963E] focus:outline-none"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full rounded-lg bg-[#C8963E] py-2.5 text-xs font-semibold text-[#FFFFFF] transition-colors hover:bg-[#E0AF50] hover:text-[#2C221E]"
                  >
                    Create &amp; Enable Promo Code
                  </button>
                </form>
              </div>
            </section>
          )}
        <div className="h-24 sm:h-8 shrink-0" aria-hidden="true" />
      </div>

      {/* Add / Edit Product Modal */}
      <AdminProductFormModal
        open={formModalOpen}
        editingProduct={editingProduct}
        onClose={() => {
          setFormModalOpen(false);
          setEditingProduct(null);
        }}
        onSave={handleSaveProduct}
      />
    </div>
  );
}
