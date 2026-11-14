import { useState } from 'react';
import {
  ArrowRight,
  Gift,
  Minus,
  Plus,
  ShoppingBag,
  Tag,
  Trash2,
  X,
} from 'lucide-react';
import {
  FREE_DELIVERY_THRESHOLD_PKR,
  GIFT_WRAP_FEE_PKR,
  formatPrice,
} from '../data/products';
import { useStore } from '../context/StoreContext';
import { BoutiqueImage } from './BoutiqueImage';

export function CartDrawer() {
  const {
    cart,
    cartOpen,
    setCartOpen,
    setCheckoutOpen,
    currency,
    getProductById,
    updateQuantity,
    removeFromCart,
    giftWrap,
    setGiftWrap,
    promoCode,
    promoRules,
    applyPromoCode,
    removePromoCode,
    subtotalPkr,
    discountPkr,
    giftWrapPkr,
    shippingPkr,
    totalPkr,
  } = useStore();

  const [codeInput, setCodeInput] = useState('');
  const [promoFeedback, setPromoFeedback] = useState<{
    ok: boolean;
    message: string;
  } | null>(null);

  if (!cartOpen) return null;

  const afterDiscount = Math.max(0, subtotalPkr - discountPkr);
  const remainingForFreeShipping = Math.max(
    0,
    FREE_DELIVERY_THRESHOLD_PKR - afterDiscount
  );
  const shippingProgress = Math.min(
    100,
    (afterDiscount / FREE_DELIVERY_THRESHOLD_PKR) * 100
  );

  const handleApplyPromo = (e: React.FormEvent) => {
    e.preventDefault();
    const res = applyPromoCode(codeInput);
    setPromoFeedback(res);
    if (res.ok) setCodeInput('');
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/50 flex justify-end items-start overflow-y-auto overscroll-contain"
      role="dialog"
      aria-modal="true"
      aria-label="Shopping Bag"
    >
      <div className="w-full max-w-md h-fit min-h-full bg-[#FAF6F0] flex flex-col border-l border-[#E8DFD1] shadow-2xl relative">
        {/* Sticky Header */}
        <div className="sticky top-0 z-20 bg-[#FAF6F0] border-b border-[#E8DFD1] px-4 py-3 sm:px-6 sm:py-4 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <ShoppingBag className="h-5 w-5 text-[#C8963E]" />
            <h2 className="font-display text-xl sm:text-2xl font-semibold text-[#2C221E]">
              Shopping Bag
            </h2>
          </div>
          <button
            type="button"
            onClick={() => setCartOpen(false)}
            aria-label="Close shopping bag"
            className="flex h-9 w-9 items-center justify-center rounded-lg text-[#6E5D54] hover:bg-[#F5EFE6] hover:text-[#2C221E]"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Single Scrollable Body Container (scrolls via outer overlay) */}
        <div className="flex-1 px-4 py-3 sm:px-6 sm:py-4 space-y-3.5">
          {cart.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center py-16 text-center">
              <ShoppingBag className="mb-3 h-10 w-10 text-[#C8963E]/60" />
              <p className="font-display text-xl text-[#2C221E]">
                Your bag is currently empty
              </p>
              <p className="mt-1.5 max-w-xs text-xs text-[#6E5D54]">
                Explore our 0–10Y organic cotton essentials and tailored festive couture.
              </p>
              <button
                type="button"
                onClick={() => setCartOpen(false)}
                className="mt-5 rounded-lg bg-[#C8963E] px-5 py-2.5 text-xs font-semibold text-[#FFFFFF] transition-colors hover:bg-[#E0AF50] hover:text-[#2C221E]"
              >
                Explore Collection
              </button>
            </div>
          ) : (
            <>
              {/* Free Delivery Progress */}
              <div className="border border-[#E8DFD1] rounded-xl bg-[#F5EFE6] px-3.5 py-2.5">
                <div className="flex items-center justify-between text-xs text-[#6E5D54]">
                  {remainingForFreeShipping === 0 ? (
                    <span className="font-medium text-[#2C221E]">
                      Complimentary boutique delivery unlocked
                    </span>
                  ) : (
                    <span>
                      Add{' '}
                      <strong className="tabular-nums text-[#C8963E]">
                        {formatPrice(remainingForFreeShipping, currency)}
                      </strong>{' '}
                      more for complimentary delivery
                    </span>
                  )}
                </div>
                <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-[#E8DFD1]">
                  <div
                    className="h-full rounded-full bg-[#C8963E] transition-all duration-300"
                    style={{ width: `${shippingProgress}%` }}
                  />
                </div>
              </div>

              {/* Cart Items */}
              <ul className="divide-y divide-[#E8DFD1]">
                {cart.map((item) => {
                  const product = getProductById(item.productId);
                  if (!product) return null;
                  return (
                    <li
                      key={`${item.productId}-${item.size}`}
                      className="flex gap-3.5 py-3.5"
                    >
                      <div className="h-18 w-18 shrink-0 overflow-hidden rounded-lg border border-[#E8DFD1] bg-[#F5EFE6]">
                        <BoutiqueImage
                          product={product}
                          eager
                          compactFallback
                        />
                      </div>
                      <div className="flex flex-1 flex-col justify-between min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0">
                            <h3 className="truncate font-display text-base font-semibold text-[#2C221E]">
                              {product.name}
                            </h3>
                            <p className="text-xs text-[#6E5D54]">
                              Size {item.size} · {product.category}
                            </p>
                          </div>
                          <button
                            type="button"
                            onClick={() => removeFromCart(item.productId, item.size)}
                            aria-label={`Remove ${product.name}`}
                            className="text-[#6E5D54] hover:text-[#C8963E]"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>

                        <div className="mt-2.5 flex items-center justify-between">
                          <div className="flex items-center rounded-md border border-[#E8DFD1] bg-[#FFFFFF]">
                            <button
                              type="button"
                              onClick={() =>
                                updateQuantity(item.productId, item.size, -1)
                              }
                              aria-label="Decrease quantity"
                              className="flex h-7 w-7 items-center justify-center text-[#6E5D54] hover:text-[#2C221E]"
                            >
                              <Minus className="h-3 w-3" />
                            </button>
                            <span className="tabular-nums w-6 text-center text-xs font-semibold text-[#2C221E]">
                              {item.quantity}
                            </span>
                            <button
                              type="button"
                              onClick={() =>
                                updateQuantity(item.productId, item.size, 1)
                              }
                              aria-label="Increase quantity"
                              className="flex h-7 w-7 items-center justify-center text-[#6E5D54] hover:text-[#2C221E]"
                            >
                              <Plus className="h-3 w-3" />
                            </button>
                          </div>

                          <span className="tabular-nums text-sm font-semibold text-[#2C221E]">
                            {formatPrice(product.pricePkr * item.quantity, currency)}
                          </span>
                        </div>
                      </div>
                    </li>
                  );
                })}
              </ul>

              {/* Gift Wrap Option */}
              <label className="flex cursor-pointer items-center justify-between gap-3 rounded-xl border border-[#E8DFD1] bg-[#FFFFFF] px-3.5 py-2.5">
                <div className="flex items-center gap-2.5">
                  <input
                    type="checkbox"
                    checked={giftWrap}
                    onChange={(e) => setGiftWrap(e.target.checked)}
                    className="h-4 w-4 accent-[#C8963E]"
                  />
                  <Gift className="h-4 w-4 text-[#C8963E] shrink-0" />
                  <div>
                    <span className="block text-xs font-medium text-[#2C221E]">
                      Luxury Gold-Ribbon Gift Wrap
                    </span>
                    <span className="block text-[11px] text-[#6E5D54]">
                      Keepsake box &amp; card
                    </span>
                  </div>
                </div>
                <span className="tabular-nums text-xs font-semibold text-[#C8963E] shrink-0">
                  +{formatPrice(GIFT_WRAP_FEE_PKR, currency)}
                </span>
              </label>

              {/* Promo Code Input */}
              <div>
                {promoCode ? (
                  <div className="flex items-center justify-between rounded-lg border border-[#C8963E] bg-[#F4E4D8] px-3 py-2 text-xs">
                    <div className="flex items-center gap-2 text-[#2C221E]">
                      <Tag className="h-3.5 w-3.5 text-[#C8963E]" />
                      <span className="font-semibold">{promoCode}</span>
                      <span className="text-[#6E5D54]">
                        (
                        {promoRules.find((r) => r.code === promoCode)
                          ?.discountPercent ?? 10}
                        % off)
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        removePromoCode();
                        setPromoFeedback(null);
                      }}
                      className="text-xs font-medium text-[#6E5D54] hover:text-[#2C221E]"
                    >
                      Remove
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleApplyPromo} className="flex gap-2">
                    <input
                      type="text"
                      value={codeInput}
                      onChange={(e) => setCodeInput(e.target.value)}
                      placeholder="Promo code (e.g. BABY10)"
                      aria-label="Promo code"
                      className="flex-1 rounded-lg border border-[#E8DFD1] bg-[#FFFFFF] px-3 py-2 text-base sm:text-xs text-[#2C221E] placeholder:text-[#6E5D54]/60 focus:border-[#C8963E] focus:outline-none"
                    />
                    <button
                      type="submit"
                      className="whitespace-nowrap rounded-lg border border-[#C8963E] bg-[#F4E4D8] px-3.5 py-2 text-xs font-semibold text-[#2C221E] transition-colors hover:bg-[#C8963E] hover:text-[#FFFFFF]"
                    >
                      Apply
                    </button>
                  </form>
                )}

                {promoFeedback && !promoCode && (
                  <p
                    className={`mt-1 text-[11px] ${
                      promoFeedback.ok ? 'text-[#2C221E]' : 'text-[#C8963E]'
                    }`}
                  >
                    {promoFeedback.message}
                  </p>
                )}
              </div>

              {/* Price Breakdown */}
              <div className="space-y-1.5 border border-[#E8DFD1] bg-[#FFFFFF] p-3.5 rounded-xl text-xs">
                <div className="flex justify-between text-[#6E5D54]">
                  <span>Subtotal</span>
                  <span className="tabular-nums text-[#2C221E]">
                    {formatPrice(subtotalPkr, currency)}
                  </span>
                </div>
                {discountPkr > 0 && (
                  <div className="flex justify-between text-[#C8963E] font-medium">
                    <span>Discount ({promoCode})</span>
                    <span className="tabular-nums">
                      -{formatPrice(discountPkr, currency)}
                    </span>
                  </div>
                )}
                {giftWrapPkr > 0 && (
                  <div className="flex justify-between text-[#6E5D54]">
                    <span>Gift Wrap</span>
                    <span className="tabular-nums text-[#2C221E]">
                      {formatPrice(giftWrapPkr, currency)}
                    </span>
                  </div>
                )}
                <div className="flex justify-between text-[#6E5D54]">
                  <span>Delivery</span>
                  <span className="tabular-nums text-[#2C221E]">
                    {shippingPkr === 0
                      ? 'Complimentary'
                      : formatPrice(shippingPkr, currency)}
                  </span>
                </div>
                <div className="flex justify-between border-t border-[#E8DFD1] pt-2 text-sm font-semibold text-[#2C221E]">
                  <span>Total</span>
                  <span className="tabular-nums text-[#C8963E]">
                    {formatPrice(totalPkr, currency)}
                  </span>
                </div>
              </div>

              {/* Proceed to Checkout Button directly below Total row */}
              <button
                type="button"
                onClick={() => {
                  setCartOpen(false);
                  setCheckoutOpen(true);
                }}
                className="min-h-[50px] flex w-full items-center justify-center gap-2 rounded-xl bg-[#C8963E] py-3.5 text-sm font-semibold text-[#FFFFFF] shadow-md transition-colors hover:bg-[#E0AF50] hover:text-[#2C221E]"
              >
                <span>Proceed to Checkout</span>
                <ArrowRight className="h-4 w-4" />
              </button>
              <div className="h-24 sm:h-8 shrink-0" aria-hidden="true" />
            </>
          )}
        </div>
      </div>
    </div>
  );
}
