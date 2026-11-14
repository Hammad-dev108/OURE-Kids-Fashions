import { Receipt, X } from 'lucide-react';
import { formatPrice } from '../data/products';
import { useStore } from '../context/StoreContext';

export function OrdersModal() {
  const { orders, ordersOpen, setOrdersOpen, currency } = useStore();

  if (!ordersOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 bg-black/50 overflow-y-auto overscroll-contain flex items-start sm:items-center justify-center p-2 sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="orders-modal-title"
    >
      <div className="relative flex w-full max-w-2xl flex-col my-auto rounded-2xl border border-[#E8DFD1] bg-[#FFFFFF] shadow-2xl">
        <div className="sticky top-0 z-10 flex items-center justify-between rounded-t-2xl border-b border-[#E8DFD1] bg-[#FAF6F0] px-4 py-3.5 sm:px-6 sm:py-4">
          <div className="flex items-center gap-2.5">
            <Receipt className="h-5 w-5 text-[#C8963E]" />
            <h2
              id="orders-modal-title"
              className="font-display text-2xl font-semibold text-[#2C221E]"
            >
              Guest Order Receipts
            </h2>
          </div>
          <button
            type="button"
            onClick={() => setOrdersOpen(false)}
            aria-label="Close order receipts"
            className="flex h-9 w-9 items-center justify-center rounded-lg text-[#6E5D54] hover:bg-[#F5EFE6] hover:text-[#2C221E]"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-6">
          {orders.length === 0 ? (
            <div className="py-10 text-center">
              <p className="font-display text-xl text-[#2C221E]">
                No completed orders yet
              </p>
              <p className="mt-1 text-xs text-[#6E5D54]">
                Orders placed in this browser will appear here with full itemized receipts.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {orders.map((order) => (
                <div
                  key={order.orderNumber}
                  className="rounded-xl border border-[#E8DFD1] bg-[#FAF6F0] p-4 text-xs"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#E8DFD1] pb-2.5">
                    <div>
                      <span className="font-semibold text-[#C8963E]">
                        Order #{order.orderNumber}
                      </span>
                      <span className="mx-2 text-[#6E5D54]/60">·</span>
                      <span className="text-[#6E5D54]">{order.createdAt}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span
                        className={`rounded-md border px-2 py-0.5 text-[11px] font-semibold ${
                          order.status === 'Delivered'
                            ? 'border-[#2C221E] bg-[#2C221E] text-[#FAF6F0]'
                            : order.status === 'Shipped'
                            ? 'border-[#C8963E] bg-[#C8963E] text-[#FFFFFF]'
                            : order.status === 'Cancelled'
                            ? 'border-[#E8DFD1] bg-[#FFFFFF] text-[#6E5D54] line-through'
                            : 'border-[#C8963E] bg-[#F4E4D8] text-[#2C221E]'
                        }`}
                      >
                        {order.status}
                      </span>
                      <span className="rounded-md bg-[#F4E4D8] px-2 py-0.5 text-[11px] font-medium text-[#2C221E]">
                        {order.paymentMethod === 'cod'
                          ? 'Cash on Delivery'
                          : 'Card Paid'}
                      </span>
                    </div>
                  </div>

                  <div className="mt-2.5 space-y-1">
                    {order.items.map((item) => (
                      <div
                        key={`${item.productId}-${item.size}`}
                        className="flex justify-between text-[#2C221E]"
                      >
                        <span>
                          {item.quantity}x {item.name} ({item.size})
                        </span>
                        <span className="tabular-nums text-[#6E5D54]">
                          {formatPrice(item.unitPricePkr * item.quantity, currency)}
                        </span>
                      </div>
                    ))}
                  </div>

                  <div className="mt-3 flex items-center justify-between border-t border-[#E8DFD1] pt-2.5 text-sm font-semibold text-[#2C221E]">
                    <span className="text-xs font-normal text-[#6E5D54]">
                      Ship to: {order.delivery.city}
                    </span>
                    <span className="tabular-nums text-[#C8963E]">
                      {formatPrice(order.totalPkr, currency)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
          <div className="h-24 sm:h-8 shrink-0" aria-hidden="true" />
        </div>
      </div>
    </div>
  );
}
