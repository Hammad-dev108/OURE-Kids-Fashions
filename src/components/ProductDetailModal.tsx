import { useEffect, useState } from 'react';
import {
  Check,
  Heart,
  MessageCircle,
  Minus,
  Plus,
  Ruler,
  ShoppingBag,
  X,
} from 'lucide-react';
import { formatPrice } from '../data/products';
import { buildProductWhatsAppUrl } from '../config/storeConfig';
import { useStore } from '../context/StoreContext';
import type { Product } from '../types/store';
import { BoutiqueImage } from './BoutiqueImage';
import { SizeGuideModal } from './SizeGuideModal';

interface ProductDetailModalProps {
  product: Product | null;
  initialSize?: string;
  onClose: () => void;
}

export function ProductDetailModal({
  product,
  initialSize,
  onClose,
}: ProductDetailModalProps) {
  const { currency, addToCart, isWishlisted, toggleWishlist, setCartOpen } =
    useStore();

  const [selectedSize, setSelectedSize] = useState<string>('');
  const [quantity, setQuantity] = useState(1);
  const [sizeGuideOpen, setSizeGuideOpen] = useState(false);
  const [addedFeedback, setAddedFeedback] = useState(false);

  useEffect(() => {
    if (!product) return;
    setSelectedSize(
      initialSize && product.availableSizes.includes(initialSize)
        ? initialSize
        : product.availableSizes[0]
    );
    setQuantity(1);
    setAddedFeedback(false);
  }, [product, initialSize]);

  if (!product) return null;

  const wishlisted = isWishlisted(product.id);
  const isSoldOut = product.stockStatus === 'sold-out';

  const handleAddToCart = () => {
    if (isSoldOut) return;
    addToCart(product.id, selectedSize, quantity);
    setAddedFeedback(true);
    window.setTimeout(() => {
      setAddedFeedback(false);
      onClose();
      setCartOpen(true);
    }, 500);
  };

  return (
    <>
      <div
        className="fixed inset-0 z-50 bg-black/50 overflow-y-auto overscroll-contain flex items-start sm:items-center justify-center p-2 sm:p-4"
        role="dialog"
        aria-modal="true"
        aria-labelledby="pdp-title"
      >
        <div className="relative w-full max-w-2xl my-auto rounded-2xl bg-[#FAF6F0] p-4 sm:p-6 border border-[#E8DFD1] shadow-2xl">
          {/* Card Header with Close Button */}
          <div className="flex items-center justify-between border-b border-[#E8DFD1] pb-3 mb-4">
            <div className="flex items-center gap-2 text-xs text-[#C8963E] font-medium">
              <span>{product.category}</span>
              <span aria-hidden="true" className="text-[#6E5D54]">·</span>
              <span className="text-[#6E5D54]">{product.ageBrackets.join(', ')}</span>
            </div>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close product quick-view"
              className="flex h-9 w-9 items-center justify-center rounded-lg border border-[#E8DFD1] bg-[#FFFFFF] text-[#6E5D54] transition-colors hover:border-[#C8963E] hover:text-[#2C221E]"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Product Photo */}
          <div className="aspect-[4/3] w-full overflow-hidden rounded-xl border border-[#E8DFD1] bg-[#F5EFE6] mb-5">
            <BoutiqueImage product={product} eager />
          </div>

          {/* Product Details */}
          <div className="space-y-4">
            <div>
              <h2
                id="pdp-title"
                className="font-display text-2xl sm:text-3xl font-semibold leading-tight text-[#2C221E]"
              >
                {product.name}
              </h2>
              <p className="mt-1 text-sm text-[#6E5D54]">{product.subtitle}</p>

              <p className="tabular-nums mt-3 text-2xl font-semibold text-[#C8963E]">
                {formatPrice(product.pricePkr, currency)}
              </p>

              <p className="mt-3 text-sm leading-relaxed text-[#6E5D54]">
                {product.description}
              </p>
            </div>

            {/* Fabric & Care Specs */}
            <div className="space-y-2 border-y border-[#E8DFD1] py-3 text-xs">
              <div className="flex justify-between gap-4">
                <span className="text-[#6E5D54]">Composition</span>
                <span className="font-medium text-[#2C221E] text-right">
                  {product.fabricBadge}
                </span>
              </div>
              <div className="flex justify-between gap-4">
                <span className="text-[#6E5D54]">Skin Safety</span>
                <span className="font-medium text-[#2C221E] text-right">
                  {product.hypoallergenicNote}
                </span>
              </div>
              <div className="flex justify-between gap-4">
                <span className="text-[#6E5D54]">Garment Care</span>
                <span className="font-medium text-[#2C221E] text-right">
                  {product.careNote}
                </span>
              </div>
            </div>

            {/* Size Selector + Interactive Size Guide */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-[#2C221E]">
                  Select Age Size *
                </span>
                <button
                  type="button"
                  onClick={() => setSizeGuideOpen(true)}
                  className="flex items-center gap-1.5 text-xs font-medium text-[#C8963E] underline-offset-4 hover:text-[#2C221E] hover:underline"
                >
                  <Ruler className="h-3.5 w-3.5" />
                  <span>Size Guide (0–10Y)</span>
                </button>
              </div>

              <div className="flex flex-wrap gap-2">
                {product.availableSizes.map((size) => {
                  const active = selectedSize === size;
                  return (
                    <button
                      key={size}
                      type="button"
                      onClick={() => setSelectedSize(size)}
                      className={`min-w-[60px] rounded-lg border px-3 py-2 text-xs font-semibold transition-colors ${
                        active
                          ? 'border-[#C8963E] bg-[#F4E4D8] text-[#2C221E]'
                          : 'border-[#E8DFD1] bg-[#FFFFFF] text-[#6E5D54] hover:border-[#C8963E] hover:text-[#2C221E]'
                      }`}
                    >
                      {size}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="pt-4 border-t border-[#E8DFD1] flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <div className="flex items-center justify-center rounded-lg border border-[#E8DFD1] bg-[#FFFFFF] shrink-0">
                <button
                  type="button"
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  aria-label="Decrease quantity"
                  className="flex h-11 w-10 items-center justify-center text-[#6E5D54] hover:text-[#2C221E]"
                >
                  <Minus className="h-3.5 w-3.5" />
                </button>
                <span className="tabular-nums w-8 text-center text-sm font-semibold text-[#2C221E]">
                  {quantity}
                </span>
                <button
                  type="button"
                  onClick={() => setQuantity((q) => q + 1)}
                  aria-label="Increase quantity"
                  className="flex h-11 w-10 items-center justify-center text-[#6E5D54] hover:text-[#2C221E]"
                >
                  <Plus className="h-3.5 w-3.5" />
                </button>
              </div>

              <button
                type="button"
                disabled={isSoldOut}
                onClick={handleAddToCart}
                className={`flex h-11 flex-1 items-center justify-center gap-2 rounded-lg px-5 text-sm font-semibold transition-colors shadow-md ${
                  isSoldOut
                    ? 'cursor-not-allowed border border-[#E8DFD1] bg-[#FFFFFF] text-[#6E5D54]'
                    : addedFeedback
                    ? 'bg-[#E0AF50] text-[#2C221E]'
                    : 'bg-[#C8963E] text-[#FFFFFF] hover:bg-[#E0AF50] hover:text-[#2C221E]'
                }`}
              >
                {isSoldOut ? (
                  <span>Currently Sold Out</span>
                ) : addedFeedback ? (
                  <>
                    <Check className="h-4 w-4" />
                    <span>Added to Bag</span>
                  </>
                ) : (
                  <>
                    <ShoppingBag className="h-4 w-4" />
                    <span>Add to Bag</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={() => toggleWishlist(product.id)}
                aria-label={wishlisted ? 'Remove from wishlist' : 'Save to wishlist'}
                className={`flex h-11 w-11 items-center justify-center rounded-lg border transition-colors shrink-0 ${
                  wishlisted
                    ? 'border-[#C8963E] bg-[#F4E4D8] text-[#C8963E]'
                    : 'border-[#E8DFD1] bg-[#FFFFFF] text-[#6E5D54] hover:border-[#C8963E] hover:text-[#2C221E]'
                }`}
              >
                <Heart className="h-4.5 w-4.5" fill={wishlisted ? 'currentColor' : 'none'} />
              </button>
            </div>

            <a
              href={buildProductWhatsAppUrl({
                productName: product.name,
                size: selectedSize,
                pricePkr: product.pricePkr,
                currency,
              })}
              target="_blank"
              rel="noopener noreferrer"
              className="flex h-11 w-full items-center justify-center gap-2 rounded-lg border border-[#C8963E] bg-[#FFFFFF] px-5 text-sm font-semibold text-[#2C221E] transition-colors hover:bg-[#F4E4D8]"
            >
              <MessageCircle className="h-4 w-4 text-[#C8963E]" />
              <span>Ask / Order via WhatsApp</span>
            </a>

            <div className="h-24 sm:h-8 shrink-0" aria-hidden="true" />
          </div>
        </div>
      </div>

      <SizeGuideModal
        open={sizeGuideOpen}
        onClose={() => setSizeGuideOpen(false)}
        highlightedSize={selectedSize}
        onPickSize={(sz) => {
          if (product.availableSizes.includes(sz)) {
            setSelectedSize(sz);
          }
        }}
      />
    </>
  );
}
