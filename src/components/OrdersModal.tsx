import { useEffect, useState } from 'react';
import {
  CheckCircle2,
  Clock,
  Package,
  PackageCheck,
  Receipt,
  Search,
  Truck,
  X,
  XCircle,
} from 'lucide-react';
import { formatPrice } from '../data/products';
import { useStore } from '../context/StoreContext';
import type { OrderReceipt, OrderStatus } from '../types/store';

const TRACKING_STEPS: Array<{
  status: Exclude<OrderStatus, 'Cancelled'>;
  label: string;
  caption: string;
  icon: React.ComponentType<{ className?: string }>;
}> = [
  {
    status: 'Pending',
    label: 'Pending',
    caption: 'Order received',
    icon: Clock,
  },
  {
    status: 'Confirmed',
    label: 'Confirmed',
    caption: 'Atelier packing',
    icon: Package,
  },
  {
    status: 'Shipped',
    label: 'Shipped',
    caption: 'With courier',
    icon: Truck,
  },
  {
    status: 'Delivered',
    label: 'Delivered',
    caption: 'Parcel arrived',
    icon: PackageCheck,
  },
];

function getStepIndex(status: OrderStatus): number {
  switch (status) {
    case 'Pending':
      return 0;
    case 'Confirmed':
      return 1;
    case 'Shipped':
      return 2;
    case 'Delivered':
      return 3;
    case 'Cancelled':
      return -1;
  }
}

export function OrdersModal() {
  const {
    orders,
    ordersOpen,
    setOrdersOpen,
    currency,
    trackOrderByNumber,
  } = useStore();

  const [orderQuery, setOrderQuery] = useState('');
  const [searching, setSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [trackedOrder, setTrackedOrder] = useState<OrderReceipt | null>(null);
  const [notFoundCode, setNotFoundCode] = useState('');

  useEffect(() => {
    if (!ordersOpen) return;
    if (!hasSearched && orders.length > 0 && !trackedOrder) {
      setTrackedOrder(orders[0]);
      setOrderQuery(orders[0].orderNumber);
    }
  }, [ordersOpen, hasSearched, orders, trackedOrder]);

  if (!ordersOpen) return null;

  const runLookup = async (rawId: string) => {
    const clean = rawId.trim().toUpperCase();
    if (!clean) return;
    setOrderQuery(clean);
    setSearching(true);
    setHasSearched(true);
    setNotFoundCode('');
    try {
      const found = await trackOrderByNumber(clean);
      setTrackedOrder(found);
      if (!found) {
        setNotFoundCode(clean);
      }
    } finally {
      setSearching(false);
    }
  };

  const handleTrackSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    void runLookup(orderQuery);
  };

  const currentStepIdx = trackedOrder ? getStepIndex(trackedOrder.status) : -1;

  return (
    <div
      className="fixed inset-0 z-50 bg-black/50 overflow-y-auto overscroll-contain flex items-start sm:items-center justify-center p-2 sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="orders-modal-title"
    >
      <div className="relative flex w-full max-w-2xl flex-col my-auto rounded-2xl border border-[#E8DFD1] bg-[#FFFFFF] shadow-2xl">
        {/* Sticky Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between rounded-t-2xl border-b border-[#E8DFD1] bg-[#FAF6F0] px-4 py-3.5 sm:px-6 sm:py-4">
          <div className="flex items-center gap-2.5 min-w-0">
            <Truck className="h-5 w-5 text-[#C8963E] shrink-0" />
            <div className="min-w-0">
              <h2
                id="orders-modal-title"
                className="font-display text-xl sm:text-2xl font-semibold text-[#2C221E] truncate"
              >
                Live Order Tracking &amp; Receipts
              </h2>
              <p className="text-[11px] text-[#6E5D54] truncate">
                Enter your Order ID to track dispatch status in real time
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setOrdersOpen(false)}
            aria-label="Close order tracking"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-[#6E5D54] hover:bg-[#F5EFE6] hover:text-[#2C221E]"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-4 sm:p-6 space-y-5">
          {/* Order ID Lookup Form */}
          <form onSubmit={handleTrackSubmit} className="space-y-2.5">
            <label
              htmlFor="track-order-input"
              className="block text-xs font-medium text-[#6E5D54]"
            >
              Order ID (e.g. OURA-4821)
            </label>
            <div className="flex flex-col sm:flex-row gap-2">
              <div className="relative flex-1 min-w-0">
                <Search className="pointer-events-none absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-[#6E5D54]" />
                <input
                  id="track-order-input"
                  type="text"
                  value={orderQuery}
                  onChange={(e) => setOrderQuery(e.target.value.toUpperCase())}
                  placeholder="Enter Order ID (e.g. OURA-4821)"
                  className="w-full min-w-0 rounded-lg border border-[#E8DFD1] bg-[#FAF6F0] py-2.5 pr-3.5 pl-10 text-base sm:text-sm uppercase text-[#2C221E] placeholder:normal-case placeholder:text-[#6E5D54]/55 focus:border-[#C8963E] focus:outline-none"
                />
              </div>
              <button
                type="submit"
                disabled={searching || !orderQuery.trim()}
                className="min-h-[42px] whitespace-nowrap rounded-lg bg-[#C8963E] px-5 py-2.5 text-xs font-semibold text-[#FFFFFF] transition-colors hover:bg-[#E0AF50] hover:text-[#2C221E] disabled:opacity-60"
              >
                {searching ? 'Checking...' : 'Track Order'}
              </button>
            </div>

            {orders.length > 0 && (
              <div className="flex flex-wrap items-center gap-1.5 pt-1 text-[11px]">
                <span className="text-[#6E5D54]">Recent:</span>
                {orders.slice(0, 4).map((o) => {
                  const isActive = trackedOrder?.orderNumber === o.orderNumber;
                  return (
                    <button
                      key={o.orderNumber}
                      type="button"
                      onClick={() => void runLookup(o.orderNumber)}
                      className={`rounded-md border px-2 py-0.5 font-medium transition-colors ${
                        isActive
                          ? 'border-[#C8963E] bg-[#F4E4D8] text-[#2C221E]'
                          : 'border-[#E8DFD1] bg-[#FAF6F0] text-[#6E5D54] hover:border-[#C8963E] hover:text-[#2C221E]'
                      }`}
                    >
                      #{o.orderNumber}
                    </button>
                  );
                })}
              </div>
            )}
          </form>

          {/* Not Found Notice */}
          {notFoundCode && !searching && (
            <div className="rounded-xl border border-[#C8963E] bg-[#F4E4D8] p-4 text-xs text-[#2C221E]">
              No order found matching <strong>#{notFoundCode}</strong>. Please double-check your Order ID from your confirmation receipt.
            </div>
          )}

          {/* Live Step-by-Step Progress Tracker & Itemized Receipt */}
          {trackedOrder && !searching && (
            <div className="rounded-2xl border border-[#E8DFD1] bg-[#FAF6F0] p-4 sm:p-5 space-y-5">
              {/* Order Summary Header */}
              <div className="flex flex-wrap items-start justify-between gap-2 border-b border-[#E8DFD1] pb-3.5">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-display text-xl font-semibold text-[#2C221E]">
                      Order #{trackedOrder.orderNumber}
                    </span>
                    <span
                      className={`rounded-md border px-2 py-0.5 text-[11px] font-semibold ${
                        trackedOrder.status === 'Delivered'
                          ? 'border-[#2C221E] bg-[#2C221E] text-[#FAF6F0]'
                          : trackedOrder.status === 'Shipped'
                          ? 'border-[#C8963E] bg-[#C8963E] text-[#FFFFFF]'
                          : trackedOrder.status === 'Cancelled'
                          ? 'border-[#E8DFD1] bg-[#FFFFFF] text-[#6E5D54]'
                          : 'border-[#C8963E] bg-[#F4E4D8] text-[#2C221E]'
                      }`}
                    >
                      {trackedOrder.status}
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-[#6E5D54]">
                    Placed {trackedOrder.createdAt} · Est. Delivery:{' '}
                    <strong className="text-[#2C221E]">
                      {trackedOrder.estimatedDelivery}
                    </strong>
                  </p>
                </div>

                <span className="rounded-md bg-[#F4E4D8] px-2.5 py-1 text-[11px] font-medium text-[#2C221E]">
                  {trackedOrder.paymentMethod === 'cod'
                    ? 'Cash on Delivery (COD)'
                    : 'Card Paid'}
                </span>
              </div>

              {/* Shipping Stepper */}
              {trackedOrder.status === 'Cancelled' ? (
                <div className="flex items-center gap-3 rounded-xl border border-[#E8DFD1] bg-[#FFFFFF] p-3.5 text-xs text-[#6E5D54]">
                  <XCircle className="h-5 w-5 text-[#6E5D54] shrink-0" />
                  <div>
                    <p className="font-semibold text-[#2C221E]">Order Cancelled</p>
                    <p className="mt-0.5">
                      This order has been cancelled and will not be dispatched.
                    </p>
                  </div>
                </div>
              ) : (
                <div aria-label="Shipping progress">
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                    {TRACKING_STEPS.map((step, idx) => {
                      const completed = currentStepIdx >= idx;
                      const isCurrent = currentStepIdx === idx;
                      const Icon = step.icon;
                      return (
                        <div
                          key={step.status}
                          className={`flex items-start gap-2.5 rounded-xl border p-3 transition-colors ${
                            isCurrent
                              ? 'border-[#C8963E] bg-[#F4E4D8]'
                              : completed
                              ? 'border-[#C8963E]/50 bg-[#FFFFFF]'
                              : 'border-[#E8DFD1] bg-[#FFFFFF]/60 opacity-65'
                          }`}
                        >
                          <div
                            className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full ${
                              completed
                                ? 'bg-[#C8963E] text-[#FFFFFF]'
                                : 'bg-[#E8DFD1] text-[#6E5D54]'
                            }`}
                          >
                            {completed && !isCurrent ? (
                              <CheckCircle2 className="h-4 w-4" />
                            ) : (
                              <Icon className="h-3.5 w-3.5" />
                            )}
                          </div>
                          <div className="min-w-0">
                            <p className="text-xs font-semibold text-[#2C221E]">
                              {step.label}
                            </p>
                            <p className="text-[11px] text-[#6E5D54] leading-tight">
                              {step.caption}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Delivery Destination */}
              <div className="rounded-xl border border-[#E8DFD1] bg-[#FFFFFF] p-3.5 text-xs space-y-1">
                <p className="font-semibold text-[#2C221E]">
                  Delivery Destination
                </p>
                <p className="text-[#6E5D54]">
                  {trackedOrder.delivery.fullName} · {trackedOrder.delivery.phone}
                </p>
                <p className="text-[#6E5D54]">
                  {trackedOrder.delivery.address},{' '}
                  <span className="font-medium text-[#2C221E]">
                    {trackedOrder.delivery.city}
                  </span>
                </p>
              </div>

              {/* Itemized Receipt */}
              <div className="rounded-xl border border-[#E8DFD1] bg-[#FFFFFF] p-3.5 text-xs space-y-2.5">
                <div className="flex items-center gap-1.5 font-semibold text-[#2C221E]">
                  <Receipt className="h-3.5 w-3.5 text-[#C8963E]" />
                  <span>Itemized Receipt</span>
                </div>

                <div className="space-y-1.5 border-b border-[#E8DFD1] pb-2.5">
                  {trackedOrder.items.map((item) => (
                    <div
                      key={`${item.productId}-${item.size}`}
                      className="flex justify-between gap-2 text-[#2C221E]"
                    >
                      <span>
                        {item.quantity}x {item.name}{' '}
                        <span className="text-[#6E5D54]">({item.size})</span>
                      </span>
                      <span className="shrink-0 tabular-nums text-[#6E5D54]">
                        {formatPrice(
                          item.unitPricePkr * item.quantity,
                          currency
                        )}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="space-y-1 text-[#6E5D54]">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span className="tabular-nums text-[#2C221E]">
                      {formatPrice(trackedOrder.subtotalPkr, currency)}
                    </span>
                  </div>
                  {trackedOrder.discountPkr > 0 && (
                    <div className="flex justify-between text-[#C8963E]">
                      <span>
                        Discount{' '}
                        {trackedOrder.promoCode ? `(${trackedOrder.promoCode})` : ''}
                      </span>
                      <span className="tabular-nums">
                        -{formatPrice(trackedOrder.discountPkr, currency)}
                      </span>
                    </div>
                  )}
                  {trackedOrder.giftWrapPkr > 0 && (
                    <div className="flex justify-between">
                      <span>Luxury Gift Wrap</span>
                      <span className="tabular-nums text-[#2C221E]">
                        {formatPrice(trackedOrder.giftWrapPkr, currency)}
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span>Delivery</span>
                    <span className="tabular-nums text-[#2C221E]">
                      {trackedOrder.shippingPkr === 0
                        ? 'Complimentary'
                        : formatPrice(trackedOrder.shippingPkr, currency)}
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between border-t border-[#E8DFD1] pt-2.5 text-sm font-semibold text-[#2C221E]">
                  <span>Total</span>
                  <span className="tabular-nums text-[#C8963E]">
                    {formatPrice(trackedOrder.totalPkr, currency)}
                  </span>
                </div>
              </div>
            </div>
          )}

          {!trackedOrder && !notFoundCode && !searching && orders.length === 0 && (
            <div className="py-8 text-center">
              <p className="font-display text-xl text-[#2C221E]">
                Track your boutique parcel
              </p>
              <p className="mt-1 text-xs text-[#6E5D54]">
                Enter your Order ID above to view live courier dispatch status and itemized receipt.
              </p>
            </div>
          )}

          <div className="h-24 sm:h-8 shrink-0" aria-hidden="true" />
        </div>
      </div>
    </div>
  );
}
