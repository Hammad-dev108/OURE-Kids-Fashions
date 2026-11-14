import { useRef, useState } from 'react';
import { Heart, Menu, Search, ShoppingBag, X } from 'lucide-react';
import { useStore } from '../context/StoreContext';

export type NavPreset =
  | 'new-arrivals'
  | 'baby-0-24m'
  | 'toddlers-2-5y'
  | 'kids-6-10y'
  | 'gift-sets';

interface NavbarProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  wishlistOnly: boolean;
  onToggleWishlistOnly: () => void;
  onSelectNavPreset: (preset: NavPreset) => void;
}

const NAV_LINKS: Array<{ label: string; preset: NavPreset }> = [
  { label: 'New Arrivals', preset: 'new-arrivals' },
  { label: '0–24M Baby', preset: 'baby-0-24m' },
  { label: '2–5Y Toddlers', preset: 'toddlers-2-5y' },
  { label: '6–10Y Kids', preset: 'kids-6-10y' },
  { label: 'Gift Sets', preset: 'gift-sets' },
];

export function Navbar({
  searchQuery,
  onSearchChange,
  wishlistOnly,
  onToggleWishlistOnly,
  onSelectNavPreset,
}: NavbarProps) {
  const {
    totalCartCount,
    wishlist,
    setCartOpen,
    openAdminEntry,
  } = useStore();
  const [searchOpen, setSearchOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const logoTapsRef = useRef<number[]>([]);

  const handleLogoTap = (e: React.MouseEvent<HTMLAnchorElement>) => {
    const now = Date.now();
    const recent = logoTapsRef.current.filter((t) => now - t <= 2500);
    recent.push(now);
    logoTapsRef.current = recent;

    if (recent.length >= 5) {
      e.preventDefault();
      logoTapsRef.current = [];
      openAdminEntry();
    }
  };

  const handleLinkClick = (preset: NavPreset) => {
    onSelectNavPreset(preset);
    setMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 border-b border-[#E8DFD1] bg-[#FAF6F0]/95">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-2 sm:gap-4 px-3 sm:px-6 lg:px-8">
        {/* Zone 1: Brand Wordmark */}
        <a
          href="#top"
          onClick={handleLogoTap}
          className="font-display text-base sm:text-xl lg:text-2xl font-semibold tracking-wide text-[#2C221E] whitespace-nowrap shrink-0 transition-colors hover:text-[#C8963E] select-none"
        >
          OURA Fashion Kid&apos;s
        </a>

        {/* Zone 2: Single-line Navigation Links */}
        <nav
          aria-label="Primary Age Categories"
          className="hidden lg:flex items-center gap-5 text-sm font-medium text-[#6E5D54]"
        >
          {NAV_LINKS.map((item) => (
            <button
              key={item.preset}
              type="button"
              onClick={() => handleLinkClick(item.preset)}
              className="whitespace-nowrap shrink-0 border-b border-transparent py-1 transition-colors hover:border-[#C8963E] hover:text-[#2C221E] focus-visible:outline-none focus-visible:text-[#C8963E]"
            >
              {item.label}
            </button>
          ))}
        </nav>

        {/* Zone 3: Search, Wishlist, Admin & Cart Actions */}
        <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
          {searchOpen ? (
            <div className="flex items-center rounded-lg border border-[#E8DFD1] bg-[#FFFFFF] px-2.5 py-1 shadow-xs">
              <Search className="mr-2 h-4 w-4 text-[#6E5D54] shrink-0" />
              <input
                type="search"
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder="Search outfits..."
                aria-label="Search baby and kids clothing"
                autoFocus
                className="w-28 bg-transparent text-xs text-[#2C221E] placeholder:text-[#6E5D54]/70 focus:outline-none sm:w-44"
              />
              <button
                type="button"
                onClick={() => {
                  onSearchChange('');
                  setSearchOpen(false);
                }}
                aria-label="Close search"
                className="ml-1 text-[#6E5D54] hover:text-[#2C221E]"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setSearchOpen(true)}
              aria-label="Open search"
              className="flex h-10 w-10 items-center justify-center rounded-lg text-[#6E5D54] transition-colors hover:bg-[#F4E4D8]/60 hover:text-[#2C221E]"
            >
              <Search className="h-4.5 w-4.5" />
            </button>
          )}

          <button
            type="button"
            onClick={onToggleWishlistOnly}
            aria-label={wishlistOnly ? 'Show all products' : 'Filter saved wishlist'}
            aria-pressed={wishlistOnly}
            className={`relative flex h-10 w-10 items-center justify-center rounded-lg transition-colors ${
              wishlistOnly
                ? 'bg-[#F4E4D8] text-[#C8963E] ring-1 ring-[#C8963E]/45'
                : 'text-[#6E5D54] hover:bg-[#F4E4D8]/60 hover:text-[#2C221E]'
            }`}
          >
            <Heart
              className="h-4.5 w-4.5"
              fill={wishlistOnly ? 'currentColor' : 'none'}
            />
            {wishlist.length > 0 && (
              <span className="tabular-nums absolute top-1.5 right-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-[#C8963E] px-1 text-[10px] font-bold text-[#FFFFFF]">
                {wishlist.length}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => setCartOpen(true)}
            aria-label="Open shopping bag"
            className="flex h-10 items-center gap-2 rounded-lg border border-[#C8963E] bg-[#C8963E] px-3 text-xs font-semibold text-[#FFFFFF] whitespace-nowrap shrink-0 transition-colors hover:border-[#E0AF50] hover:bg-[#E0AF50] hover:text-[#2C221E]"
          >
            <ShoppingBag className="h-4 w-4" />
            <span className="hidden sm:inline">Bag</span>
            <span className="tabular-nums rounded bg-[#2C221E] px-1.5 py-0.5 text-[11px] font-bold text-[#FAF6F0]">
              {totalCartCount}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setMobileMenuOpen((prev) => !prev)}
            aria-label="Toggle navigation menu"
            className="flex h-10 w-10 items-center justify-center rounded-lg text-[#6E5D54] hover:bg-[#F4E4D8]/60 hover:text-[#2C221E] lg:hidden"
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Links */}
      {mobileMenuOpen && (
        <div className="border-t border-[#E8DFD1] bg-[#FFFFFF] px-4 py-3 lg:hidden">
          <nav className="flex flex-col gap-1">
            {NAV_LINKS.map((item) => (
              <button
                key={item.preset}
                type="button"
                onClick={() => handleLinkClick(item.preset)}
                className="flex items-center justify-between rounded-lg px-3 py-2.5 text-left text-sm font-medium text-[#2C221E] hover:bg-[#F4E4D8]/60"
              >
                <span>{item.label}</span>
              </button>
            ))}
          </nav>
        </div>
      )}
    </header>
  );
}
