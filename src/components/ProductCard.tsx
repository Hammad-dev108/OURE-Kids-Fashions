import { useEffect, useState } from 'react';
import { Check, Heart, ShoppingBag } from 'lucide-react';
import { formatPrice } from '../data/products';
import { useStore } from '../context/StoreContext';
import type { Product } from '../types/store';
import { BoutiqueImage } from './BoutiqueImage';

interface ProductCardProps {
  product: Product;
  eager?: boolean;
  onQuickView: (product: Product, initialSize: string) => void;
}

export function ProductCard({
  product,
  eager = false,
  onQuickView,
}: ProductCardProps) {
  const { currency, addToCart, isWishlisted, toggleWishlist } = useStore();
  const [selectedSize, setSelectedSize] = useState(
    product.availableSizes[0] ?? '0–3M'
  );
  const [justAdded, setJustAdded] = useState(false);

  useEffect(() => {
    if (!product.availableSizes.includes(selectedSize)) {
      setSelectedSize(product.availableSizes[0] ?? '0–3M');
    }
  }, [product.availableSizes, selectedSize]);

  const wishlisted = isWishlisted(product.id);
  const isSoldOut = product.stockStatus === 'sold-out';
  const isLowStock = product.stockStatus === 'low-stock';

  const handleAdd = () => {
    if (isSoldOut) return;
    addToCart(product.id, selectedSize, 1);
    setJustAdded(true);
    window.setTimeout(() => setJustAdded(false), 1400);
  };

  // Mobile par max 2 sizes + "+more" dikhayein taake line wrap na ho
  const visibleSizes = product.availableSizes.slice(0, 2);
  const extraSizesCount = product.availableSizes.length - visibleSizes.length;

  return (
    <article className="group flex min-w-0 w-full flex-col overflow-hidden rounded-xl border border-[#E8DFD1] bg-[#FFFFFF] shadow-xs transition-all duration-200 hover:-translate-y-0.5 hover:border-[#C8963E] hover:shadow-md">
      {/* Studio Image Stage */}
      <div className="relative aspect-square sm:aspect-[4/3] w-full overflow-hidden bg-[#F5EFE6]">
        <BoutiqueImage
          product={product}
          eager={eager}
          onClick={() => onQuickView(product, selectedSize)}
          className={`transition-transform duration-500 group-hover:scale-[1.03] ${
            isSoldOut ? 'opacity-75 grayscale-[20%]' : ''
          }`}
        />

        {/* Stock Badge */}
        {(isSoldOut || isLowStock) && (
          <div className="absolute top-2 left-2">
            <span
              className={`rounded-md px-1.5 py-0.5 text-[10px] font-semibold shadow-xs ${
                isSoldOut
                  ? 'bg-[#2C221E] text-[#FAF6F0]'
                  : 'border border-[#C8963E] bg-[#F4E4D8] text-[#2C221E]'
              }`}
            >
              {isSoldOut ? 'Sold Out' : 'Low Stock'}
            </span>
          </div>
        )}

        {/* Top-Right Wishlist Icon */}
        <div className="absolute top-2 right-2">
          <button
            type="button"
            onClick={() => toggleWishlist(product.id)}
            aria-label={
              wishlisted
                ? `Remove ${product.name} from wishlist`
                : `Save ${product.name} to wishlist`
            }
            className={`flex h-7 w-7 sm:h-8 sm:w-8 items-center justify-center rounded-lg border transition-colors ${
              wishlisted
                ? 'border-[#C8963E] bg-[#F4E4D8] text-[#C8963E]'
                : 'border-[#E8DFD1] bg-[#FFFFFF]/90 text-[#6E5D54] hover:border-[#C8963E] hover:text-[#C8963E]'
            }`}
          >
            <Heart
              className="h-3.5 w-3.5 sm:h-4 sm:w-4"
              fill={wishlisted ? 'currentColor' : 'none'}
            />
          </button>
        </div>
      </div>

      {/* Product Details & Purchase Controls */}
      <div className="flex min-w-0 flex-1 flex-col justify-between p-2.5 sm:p-5">
        <div className="min-w-0">
          {/* Top Category Badge Only */}
          <div className="truncate text-[11px] sm:text-xs font-medium text-[#C8963E]">
            {product.category}
          </div>

          <button
            type="button"
            onClick={() => onQuickView(product, selectedSize)}
            className="mt-0.5 sm:mt-1 block w-full min-w-0 text-left"
          >
            <h3 className="font-display line-clamp-2 min-h-[2.25rem] sm:min-h-[2.75rem] text-sm sm:text-lg font-semibold leading-snug text-[#2C221E] transition-colors group-hover:text-[#C8963E]">
              {product.name}
            </h3>
          </button>

          <p className="mt-0.5 truncate text-[11px] sm:text-xs text-[#6E5D54]">
            {product.subtitle}
          </p>
        </div>

        <div className="mt-2.5 sm:mt-3.5 pt-2 sm:pt-3 border-t border-[#E8DFD1] min-w-0">
          {/* Compact Single-Row Age Size Selector */}
          <div className="flex items-center gap-1 overflow-hidden">
            {visibleSizes.map((size) => {
              const active = selectedSize === size;
              return (
                <button
                  key={size}
                  type="button"
                  onClick={() => setSelectedSize(size)}
                  className={`min-h-[26px] whitespace-nowrap rounded px-1.5 sm:px-2 py-0.5 sm:py-1 text-[10px] sm:text-[11px] font-medium transition-colors ${
                    active
                      ? 'bg-[#F4E4D8] text-[#2C221E] ring-1 ring-[#C8963E]'
                      : 'bg-[#FAF6F0] text-[#6E5D54] hover:bg-[#F4E4D8]/60 hover:text-[#2C221E]'
                  }`}
                >
                  {size}
                </button>
              );
            })}
            {extraSizesCount > 0 && (
              <button
                type="button"
                onClick={() => onQuickView(product, selectedSize)}
                className="whitespace-nowrap text-[10px] font-medium text-[#6E5D54] hover:text-[#C8963E] px-1"
              >
                +{extraSizesCount}
              </button>
            )}
          </div>

          {/* Responsive Price & Full-Width Mobile Button */}
          <div className="mt-2.5 sm:mt-3.5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 min-w-0">
            <span className="truncate tabular-nums text-sm sm:text-lg font-semibold text-[#2C221E]">
              {formatPrice(product.pricePkr, currency)}
            </span>

            <button
              type="button"
              disabled={isSoldOut}
              onClick={handleAdd}
              className={`min-h-[36px] sm:min-h-[40px] flex w-full sm:w-auto items-center justify-center gap-1.5 whitespace-nowrap rounded-lg px-2.5 sm:px-3 py-2 text-xs font-semibold transition-colors ${
                isSoldOut
                  ? 'cursor-not-allowed border border-[#E8DFD1] bg-[#FAF6F0] text-[#6E5D54]'
                  : justAdded
                  ? 'bg-[#E0AF50] text-[#2C221E]'
                  : 'bg-[#C8963E] text-[#FFFFFF] hover:bg-[#E0AF50] hover:text-[#2C221E]'
              }`}
            >
              {isSoldOut ? (
                <span>Sold Out</span>
              ) : justAdded ? (
                <>
                  <Check className="h-3.5 w-3.5 shrink-0" />
                  <span>Added</span>
                </>
              ) : (
                <>
                  <ShoppingBag className="h-3.5 w-3.5 shrink-0" />
                  <span>Add to Bag</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </article>
  );
}