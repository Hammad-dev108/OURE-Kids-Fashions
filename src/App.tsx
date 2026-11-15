import { useMemo, useRef, useState } from 'react';
import {
  ArrowDown,
  Gift,
  Heart,
  Leaf,
  Ruler,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';
import {
  AGE_BRACKETS,
  PRODUCT_CATEGORIES,
} from './data/products';
import { StoreProvider, useStore } from './context/StoreContext';
import { Navbar, type NavPreset } from './components/Navbar';
import { HeroBoutique3D } from './components/HeroBoutique3D';
import { ProductCard } from './components/ProductCard';
import { ProductDetailModal } from './components/ProductDetailModal';
import { SizeGuideModal } from './components/SizeGuideModal';
import { CartDrawer } from './components/CartDrawer';
import { CheckoutModal } from './components/CheckoutModal';
import { OrdersModal } from './components/OrdersModal';
import { AdminLoginModal } from './components/AdminLoginModal';
import { AdminDashboardModal } from './components/AdminDashboardModal';
import type { AgeBracket, Product, ProductCategory } from './types/store';

function BoutiqueStorefront() {
  const {
    currency,
    setCurrency,
    products,
    wishlist,
    setOrdersOpen,
    orders,
  } = useStore();

  const [selectedAge, setSelectedAge] = useState<AgeBracket>('All');
  const [selectedCategory, setSelectedCategory] = useState<ProductCategory>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [wishlistOnly, setWishlistOnly] = useState(false);
  const [collectionTag, setCollectionTag] = useState<'all' | 'new' | 'gift'>('all');

  const [quickViewState, setQuickViewState] = useState<{
    product: Product | null;
    initialSize?: string;
  }>({ product: null });
  const [sizeGuideOpen, setSizeGuideOpen] = useState(false);

  const collectionRef = useRef<HTMLElement | null>(null);

  const scrollToCollection = () => {
    collectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const handleNavPreset = (preset: NavPreset) => {
    setWishlistOnly(false);
    setSearchQuery('');
    if (preset === 'new-arrivals') {
      setCollectionTag('new');
      setSelectedAge('All');
      setSelectedCategory('All');
    } else if (preset === 'gift-sets') {
      setCollectionTag('gift');
      setSelectedAge('All');
      setSelectedCategory('All');
    } else if (preset === 'baby-0-24m') {
      setCollectionTag('all');
      setSelectedAge('0–6M');
      setSelectedCategory('All');
    } else if (preset === 'toddlers-2-5y') {
      setCollectionTag('all');
      setSelectedAge('2–4Y');
      setSelectedCategory('All');
    } else if (preset === 'kids-6-10y') {
      setCollectionTag('all');
      setSelectedAge('8–10Y');
      setSelectedCategory('All');
    }
    scrollToCollection();
  };

  const resetFilters = () => {
    setSelectedAge('All');
    setSelectedCategory('All');
    setSearchQuery('');
    setWishlistOnly(false);
    setCollectionTag('all');
  };

  const filteredProducts = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return products.filter((product) => {
      if (wishlistOnly && !wishlist.includes(product.id)) return false;
      if (collectionTag === 'new' && !product.isNewArrival) return false;
      if (collectionTag === 'gift' && !product.isGiftSet) return false;
      if (
        selectedCategory !== 'All' &&
        product.category !== selectedCategory
      ) {
        return false;
      }
      if (
        selectedAge !== 'All' &&
        !product.ageBrackets.includes(selectedAge)
      ) {
        return false;
      }
      if (q) {
        const hay = `${product.name} ${product.subtitle} ${product.category} ${product.fabricBadge} ${product.description}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [
    products,
    wishlistOnly,
    wishlist,
    collectionTag,
    selectedCategory,
    selectedAge,
    searchQuery,
  ]);

  return (
    <div id="top" className="min-h-screen w-full overflow-x-hidden bg-[#FAF6F0] text-[#2C221E]">
      <Navbar
        searchQuery={searchQuery}
        onSearchChange={(val) => {
          setSearchQuery(val);
          if (val.trim()) scrollToCollection();
        }}
        wishlistOnly={wishlistOnly}
        onToggleWishlistOnly={() => {
          setWishlistOnly((prev) => !prev);
          scrollToCollection();
        }}
        onSelectNavPreset={handleNavPreset}
      />

      <main className="w-full overflow-x-hidden">
        {/* 1. Split Hero Banner + Interactive Three.js 3D Boutique Carousel */}
        <section className="mx-auto max-w-7xl px-3.5 pt-6 pb-12 sm:px-6 sm:pt-8 sm:pb-14 lg:px-8 lg:pt-12 lg:pb-20">
          <div className="grid items-stretch gap-6 sm:gap-8 lg:grid-cols-12 lg:gap-10">
            {/* Left Editorial Column */}
            <div className="flex min-w-0 flex-col justify-center lg:col-span-5">
              <p className="inline-flex w-fit items-center rounded-lg border border-[#E8DFD1] bg-[#F4E4D8] px-3 py-1 text-xs font-medium tracking-wide text-[#2C221E]">
                OURA Atelier · Ages 0 to 10 Years
              </p>

              <h1
                style={{ textWrap: 'balance' }}
                className="mt-3.5 sm:mt-4 font-display text-3xl font-semibold leading-[1.1] tracking-tight text-[#2C221E] sm:text-5xl xl:text-[3.5rem]"
              >
                Softest Luxury for Little Ones — 0 to 10 Years
              </h1>

              <p className="mt-4 sm:mt-5 max-w-lg text-sm sm:text-base leading-relaxed text-[#6E5D54]">
                Heirloom baby rompers, breathable 100% organic cotton essentials, and hand-embroidered festive sets crafted to caress sensitive skin from newborn days through childhood milestones.
              </p>

              <div className="mt-6 sm:mt-7 flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={scrollToCollection}
                  className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg bg-[#C8963E] px-5 sm:px-6 py-3 text-sm font-semibold text-[#FFFFFF] transition-colors hover:bg-[#E0AF50] hover:text-[#2C221E]"
                >
                  <span>Explore Collection</span>
                  <ArrowDown className="h-4 w-4" />
                </button>

                <button
                  type="button"
                  onClick={() => setSizeGuideOpen(true)}
                  className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg border border-[#E8DFD1] bg-[#FFFFFF] px-4 sm:px-5 py-3 text-sm font-medium text-[#2C221E] transition-colors hover:border-[#C8963E] hover:bg-[#F4E4D8]/60"
                >
                  <Ruler className="h-4 w-4 text-[#C8963E]" />
                  <span>0–10Y Size Guide</span>
                </button>
              </div>

              <div className="mt-6 sm:mt-8 flex flex-wrap items-center gap-x-4 gap-y-2 border-t border-[#E8DFD1] pt-4 sm:pt-5 text-xs text-[#6E5D54]">
                <span>100% Organic Cotton</span>
                <span aria-hidden="true">·</span>
                <span>Hypoallergenic Dyes</span>
                <span aria-hidden="true">·</span>
                <span>Code BABY10 for 10% Off</span>
              </div>
            </div>

            {/* Right Interactive Three.js 3D Carousel */}
            <div className="h-[280px] min-w-0 sm:h-[420px] lg:col-span-7 lg:h-[540px]">
              <HeroBoutique3D onSelectShowcase={scrollToCollection} />
            </div>
          </div>
        </section>

        {/* 2. Smart Age & Category Filter Grid + Curated Product Catalog */}
        <section
          ref={collectionRef}
          id="collection"
          className="border-t border-[#E8DFD1] bg-[#FAF6F0] py-12 sm:py-14 lg:py-20"
        >
          <div className="mx-auto max-w-7xl px-3.5 sm:px-6 lg:px-8">
            {/* Section Title & Currency Switcher */}
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div className="min-w-0">
                <h2 className="font-display text-2xl sm:text-4xl font-semibold text-[#2C221E]">
                  Curated Boutique Collection
                </h2>
                <p className="mt-1.5 text-xs sm:text-sm text-[#6E5D54]">
                  Select an age bracket or silhouette · Tap any garment to view details &amp; sizes
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2.5 sm:gap-3">
                {wishlistOnly && (
                  <button
                    type="button"
                    onClick={() => setWishlistOnly(false)}
                    className="flex items-center gap-1.5 rounded-lg border border-[#C8963E] bg-[#F4E4D8] px-3 py-1.5 text-xs font-medium text-[#2C221E]"
                  >
                    <Heart className="h-3.5 w-3.5 text-[#C8963E]" fill="currentColor" />
                    <span>Saved Wishlist ({wishlist.length}) · Clear</span>
                  </button>
                )}

                {/* PKR / USD Currency Toggle */}
                <div
                  role="group"
                  aria-label="Currency selector"
                  className="flex items-center rounded-lg border border-[#E8DFD1] bg-[#FFFFFF] p-1 text-xs"
                >
                  <button
                    type="button"
                    onClick={() => setCurrency('PKR')}
                    className={`whitespace-nowrap rounded-md px-3 py-1.5 font-semibold transition-colors ${
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
                    className={`whitespace-nowrap rounded-md px-3 py-1.5 font-semibold transition-colors ${
                      currency === 'USD'
                        ? 'bg-[#C8963E] text-[#FFFFFF]'
                        : 'text-[#6E5D54] hover:text-[#2C221E]'
                    }`}
                  >
                    USD
                  </button>
                </div>
              </div>
            </div>

            {/* Smart Filter Toolbar: Age Pills + Category Tabs */}
            <div className="mt-6 sm:mt-7 space-y-3.5 sm:space-y-4 rounded-2xl border border-[#E8DFD1] bg-[#FFFFFF] p-3.5 sm:p-5 overflow-hidden">
              {/* Age Bracket Pills */}
              <div className="flex items-center gap-2 min-w-0">
                <span className="shrink-0 mr-1 text-xs font-medium text-[#6E5D54]">
                  Age:
                </span>
                <div className="overflow-x-auto no-scrollbar flex items-center gap-2 flex-nowrap pb-1 min-w-0 flex-1">
                  {AGE_BRACKETS.map((age) => {
                    const active = selectedAge === age;
                    return (
                      <button
                        key={age}
                        type="button"
                        onClick={() => setSelectedAge(age)}
                        className={`min-h-[36px] whitespace-nowrap rounded-lg px-3.5 py-1.5 text-xs font-medium transition-colors shrink-0 ${
                          active
                            ? 'bg-[#C8963E] font-semibold text-[#FFFFFF]'
                            : 'bg-[#FAF6F0] text-[#6E5D54] hover:bg-[#F4E4D8] hover:text-[#2C221E]'
                        }`}
                      >
                        {age === 'All' ? 'All Ages (0–10Y)' : age}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Category Tabs & Quick Preset */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-t border-[#E8DFD1] pt-3.5 min-w-0">
                <div className="overflow-x-auto no-scrollbar flex items-center gap-1.5 flex-nowrap pb-1 min-w-0 flex-1">
                  {PRODUCT_CATEGORIES.map((cat) => {
                    const active = selectedCategory === cat;
                    return (
                      <button
                        key={cat}
                        type="button"
                        onClick={() => {
                          setSelectedCategory(cat);
                          setCollectionTag('all');
                        }}
                        className={`min-h-[36px] whitespace-nowrap rounded-lg px-3.5 py-1.5 text-xs font-medium transition-colors shrink-0 ${
                          active && collectionTag === 'all'
                            ? 'border border-[#C8963E] bg-[#F4E4D8] text-[#2C221E] font-semibold'
                            : 'text-[#6E5D54] hover:bg-[#FAF6F0] hover:text-[#2C221E]'
                        }`}
                      >
                        {cat}
                      </button>
                    );
                  })}
                </div>

                <div className="flex shrink-0 items-center gap-3 text-xs text-[#6E5D54]">
                  {collectionTag !== 'all' && (
                    <button
                      type="button"
                      onClick={() => setCollectionTag('all')}
                      className="font-medium text-[#C8963E] underline-offset-4 hover:underline"
                    >
                      {collectionTag === 'new' ? 'Showing New Arrivals' : 'Showing Gift Sets'} · Show All
                    </button>
                  )}
                  <span className="tabular-nums">
                    {filteredProducts.length}{' '}
                    {filteredProducts.length === 1 ? 'piece' : 'pieces'}
                  </span>
                </div>
              </div>
            </div>

            {/* Product Catalog Grid: 2 cols Mobile, 3 cols Tablet, 4 cols Laptop */}
            {filteredProducts.length === 0 ? (
              <div className="mt-10 rounded-2xl border border-[#E8DFD1] bg-[#FFFFFF] px-6 py-14 text-center">
                <p className="font-display text-2xl text-[#2C221E]">
                  No garments match these filters
                </p>
                <p className="mt-2 text-sm text-[#6E5D54]">
                  Try clearing your search or switching back to all age groups (0–10Y).
                </p>
                <button
                  type="button"
                  onClick={resetFilters}
                  className="mt-5 rounded-lg bg-[#C8963E] px-5 py-2.5 text-xs font-semibold text-[#FFFFFF] transition-colors hover:bg-[#E0AF50] hover:text-[#2C221E]"
                >
                  Reset All Filters
                </button>
              </div>
            ) : (
              <div className="mt-6 sm:mt-8 grid grid-cols-2 gap-2.5 sm:gap-5 md:grid-cols-3 lg:grid-cols-4 lg:gap-6">
                {filteredProducts.map((product, index) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    eager={index < 6}
                    onQuickView={(prod, size) =>
                      setQuickViewState({ product: prod, initialSize: size })
                    }
                  />
                ))}
              </div>
            )}
          </div>
        </section>

        {/* 3. Craftsmanship & Organic Promise Strip */}
        <section className="border-t border-[#E8DFD1] bg-[#F5EFE6] py-12 sm:py-14">
          <div className="mx-auto max-w-7xl px-3.5 sm:px-6 lg:px-8">
            <div className="grid gap-4 sm:gap-6 sm:grid-cols-2 lg:grid-cols-4">
              <div className="rounded-xl border border-[#E8DFD1] bg-[#FFFFFF] p-5">
                <Leaf className="h-5 w-5 text-[#C8963E]" />
                <h3 className="mt-3 font-display text-xl font-semibold text-[#2C221E]">
                  100% Organic Cotton
                </h3>
                <p className="mt-1.5 text-xs leading-relaxed text-[#6E5D54]">
                  Long-staple combed organic yarns and double-gauze muslin woven for gentle airflow.
                </p>
              </div>

              <div className="rounded-xl border border-[#E8DFD1] bg-[#FFFFFF] p-5">
                <ShieldCheck className="h-5 w-5 text-[#C8963E]" />
                <h3 className="mt-3 font-display text-xl font-semibold text-[#2C221E]">
                  Hypoallergenic Finish
                </h3>
                <p className="mt-1.5 text-xs leading-relaxed text-[#6E5D54]">
                  Nickel-free brass snaps, zero-scratch inner seams, and non-toxic OEKO-TEX dyes.
                </p>
              </div>

              <div className="rounded-xl border border-[#E8DFD1] bg-[#FFFFFF] p-5">
                <Sparkles className="h-5 w-5 text-[#C8963E]" />
                <h3 className="mt-3 font-display text-xl font-semibold text-[#2C221E]">
                  Artisanal Festive Craft
                </h3>
                <p className="mt-1.5 text-xs leading-relaxed text-[#6E5D54]">
                  Hand-smocked bodices, champagne tulle tiers, and cotton-lined festive zardozi embroidery.
                </p>
              </div>

              <div className="rounded-xl border border-[#E8DFD1] bg-[#FFFFFF] p-5">
                <Gift className="h-5 w-5 text-[#C8963E]" />
                <h3 className="mt-3 font-display text-xl font-semibold text-[#2C221E]">
                  Keepsake Presentation
                </h3>
                <p className="mt-1.5 text-xs leading-relaxed text-[#6E5D54]">
                  Optional gold-ribbon boutique gift boxes with Cash on Delivery and Card checkout.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* 4. Minimal Luxury Footer */}
      <footer className="border-t border-[#E8DFD1] bg-[#FAF6F0] py-10">
        <div className="mx-auto flex max-w-7xl flex-col items-start justify-between gap-6 px-3.5 sm:flex-row sm:items-center sm:px-6 lg:px-8">
          <div>
            <span className="font-display text-2xl font-semibold text-[#2C221E]">
              OURA Fashion Kid&apos;s
            </span>
            <p className="mt-1 text-xs text-[#6E5D54]">
              Ages 0–10 Years · Promo Code <span className="font-semibold text-[#C8963E]">BABY10</span> for 10% off
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-5 text-xs text-[#6E5D54]">
            <button
              type="button"
              onClick={() => setSizeGuideOpen(true)}
              className="hover:text-[#2C221E]"
            >
              0–10Y Size Guide
            </button>
            <button
              type="button"
              onClick={() => setOrdersOpen(true)}
              className="hover:text-[#2C221E]"
            >
              Track Order ({orders.length})
            </button>
            <button
              type="button"
              onClick={() => setCurrency(currency === 'PKR' ? 'USD' : 'PKR')}
              className="hover:text-[#C8963E]"
            >
              Currency: {currency}
            </button>
          </div>
        </div>
      </footer>

      {/* Interactive Modals & Drawers */}
      <ProductDetailModal
        product={quickViewState.product}
        initialSize={quickViewState.initialSize}
        onClose={() => setQuickViewState({ product: null })}
      />
      <SizeGuideModal
        open={sizeGuideOpen}
        onClose={() => setSizeGuideOpen(false)}
      />
      <CartDrawer />
      <CheckoutModal />
      <OrdersModal />
      <AdminLoginModal />
      <AdminDashboardModal />
    </div>
  );
}

export default function App() {
  return (
    <StoreProvider>
      <BoutiqueStorefront />
    </StoreProvider>
  );
}