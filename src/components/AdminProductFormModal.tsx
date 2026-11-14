import { useEffect, useState } from 'react';
import { Image as ImageIcon, Upload, X } from 'lucide-react';
import {
  ALL_GARMENT_SIZES,
  PKR_PER_USD,
  SAMPLE_IMAGE_PRESETS,
} from '../data/products';
import type {
  AgeBracket,
  GarmentModelType,
  Product,
  ProductCategory,
  StockStatus,
} from '../types/store';

interface AdminProductFormModalProps {
  open: boolean;
  editingProduct: Product | null;
  onClose: () => void;
  onSave: (product: Product) => void;
}

const CATEGORIES: Exclude<ProductCategory, 'All'>[] = [
  'Baby Boys',
  'Baby Girls',
  'Unisex Rompers',
  'Festive Sets',
];

function deriveAgeBracketsFromSizes(
  sizes: string[]
): Exclude<AgeBracket, 'All'>[] {
  const brackets = new Set<Exclude<AgeBracket, 'All'>>();
  if (sizes.includes('0–3M') || sizes.includes('3–6M')) brackets.add('0–6M');
  if (sizes.includes('6–12M')) brackets.add('6–12M');
  if (sizes.includes('12–24M')) brackets.add('12–24M');
  if (sizes.includes('2–3Y') || sizes.includes('3–4Y')) brackets.add('2–4Y');
  if (sizes.includes('5–7Y')) brackets.add('5–7Y');
  if (sizes.includes('8–10Y')) brackets.add('8–10Y');
  return Array.from(brackets);
}

function slugify(input: string): string {
  return (
    input
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '') || 'oura-garment'
  );
}

function compressUploadedImage(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Failed to read image file.'));
    reader.onload = () => {
      const result = typeof reader.result === 'string' ? reader.result : '';
      if (!result) {
        reject(new Error('Empty image data.'));
        return;
      }
      const img = new Image();
      img.onerror = () => resolve(result);
      img.onload = () => {
        const maxDim = 640;
        const scale = Math.min(1, maxDim / Math.max(img.width, img.height));
        const width = Math.max(1, Math.round(img.width * scale));
        const height = Math.max(1, Math.round(img.height * scale));
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(result);
          return;
        }
        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL('image/jpeg', 0.82));
      };
      img.src = result;
    };
    reader.readAsDataURL(file);
  });
}

export function AdminProductFormModal({
  open,
  editingProduct,
  onClose,
  onSave,
}: AdminProductFormModalProps) {
  const [name, setName] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [category, setCategory] =
    useState<Exclude<ProductCategory, 'All'>>('Unisex Rompers');
  const [selectedSizes, setSelectedSizes] = useState<string[]>([
    '0–3M',
    '3–6M',
    '6–12M',
  ]);
  const [pricePkr, setPricePkr] = useState('6800');
  const [stockStatus, setStockStatus] = useState<StockStatus>('in-stock');
  const [fabricBadge, setFabricBadge] = useState('100% Organic Cotton');
  const [careNote, setCareNote] = useState('Cold gentle wash · Lay flat to dry');
  const [hypoallergenicNote, setHypoallergenicNote] = useState(
    'Hypoallergenic · GOTS Certified'
  );
  const [imageUrl, setImageUrl] = useState(SAMPLE_IMAGE_PRESETS[0].url);
  const [garmentModelType, setGarmentModelType] =
    useState<GarmentModelType>('romper');
  const [description, setDescription] = useState('');
  const [isNewArrival, setIsNewArrival] = useState(true);
  const [isGiftSet, setIsGiftSet] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (!open) return;
    if (editingProduct) {
      setName(editingProduct.name);
      setSubtitle(editingProduct.subtitle);
      setCategory(editingProduct.category);
      setSelectedSizes([...editingProduct.availableSizes]);
      setPricePkr(String(editingProduct.pricePkr));
      setStockStatus(editingProduct.stockStatus);
      setFabricBadge(editingProduct.fabricBadge);
      setCareNote(editingProduct.careNote);
      setHypoallergenicNote(editingProduct.hypoallergenicNote);
      setImageUrl(editingProduct.imageUrl);
      setGarmentModelType(editingProduct.garmentModelType);
      setDescription(editingProduct.description);
      setIsNewArrival(Boolean(editingProduct.isNewArrival));
      setIsGiftSet(Boolean(editingProduct.isGiftSet));
    } else {
      setName('');
      setSubtitle('');
      setCategory('Unisex Rompers');
      setSelectedSizes(['0–3M', '3–6M', '6–12M']);
      setPricePkr('6800');
      setStockStatus('in-stock');
      setFabricBadge('100% Organic Cotton');
      setCareNote('Cold gentle wash · Lay flat to dry');
      setHypoallergenicNote('Hypoallergenic · GOTS Certified');
      setImageUrl(SAMPLE_IMAGE_PRESETS[0].url);
      setGarmentModelType('romper');
      setDescription('');
      setIsNewArrival(true);
      setIsGiftSet(false);
    }
    setErrorMsg('');
  }, [open, editingProduct]);

  if (!open) return null;

  const toggleSize = (sz: string) => {
    setSelectedSizes((prev) =>
      prev.includes(sz) ? prev.filter((item) => item !== sz) : [...prev, sz]
    );
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const dataUrl = await compressUploadedImage(file);
      setImageUrl(dataUrl);
      setErrorMsg('');
    } catch {
      setErrorMsg('Could not process uploaded image. Try a JPG/PNG under 5MB.');
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const numericPrice = Number(pricePkr);
    if (!name.trim()) {
      setErrorMsg('Please enter a product name.');
      return;
    }
    if (!Number.isFinite(numericPrice) || numericPrice <= 0) {
      setErrorMsg('Please enter a valid price in PKR.');
      return;
    }
    if (selectedSizes.length === 0) {
      setErrorMsg('Select at least one age size.');
      return;
    }
    if (!imageUrl.trim()) {
      setErrorMsg('Provide an image URL, upload a photo, or choose a studio preset.');
      return;
    }

    const orderedSizes = ALL_GARMENT_SIZES.filter((s) =>
      selectedSizes.includes(s)
    );
    const derivedBrackets = deriveAgeBracketsFromSizes(orderedSizes);

    const payload: Product = {
      id: editingProduct ? editingProduct.id : `oura-custom-${Date.now()}`,
      slug: editingProduct ? editingProduct.slug : slugify(name),
      name: name.trim(),
      subtitle: subtitle.trim() || `${fabricBadge.trim()} boutique garment`,
      category,
      ageBrackets:
        derivedBrackets.length > 0 ? derivedBrackets : ['0–6M'],
      availableSizes: orderedSizes.length > 0 ? [...orderedSizes] : selectedSizes,
      pricePkr: Math.round(numericPrice),
      stockStatus,
      fabricBadge: fabricBadge.trim() || '100% Organic Cotton',
      hypoallergenicNote:
        hypoallergenicNote.trim() || 'Hypoallergenic · Gentle Weave',
      careNote: careNote.trim() || 'Cold gentle wash · Lay flat to dry',
      description:
        description.trim() ||
        'Crafted by OURA Atelier in breathable organic textiles tailored for sensitive baby and kids skin.',
      garmentModelType,
      palette: editingProduct?.palette ?? {
        primary: '#EDE4D3',
        secondary: '#F5EFE6',
        accent: '#C8963E',
        hardware: '#C8963E',
      },
      imageUrl: imageUrl.trim(),
      isNewArrival,
      isGiftSet,
    };

    onSave(payload);
    onClose();
  };

  const parsedPrice = Number(pricePkr);
  const usdEstimate =
    Number.isFinite(parsedPrice) && parsedPrice > 0
      ? `$${(parsedPrice / PKR_PER_USD).toFixed(2)}`
      : '$0.00';

  return (
    <div
      className="fixed inset-0 z-[60] bg-black/50 overflow-y-auto overscroll-contain flex items-start sm:items-center justify-center p-2 sm:p-5"
      role="dialog"
      aria-modal="true"
      aria-labelledby="product-form-title"
    >
      <div className="relative flex w-full max-w-3xl flex-col my-auto rounded-2xl border border-[#E8DFD1] bg-[#FFFFFF] shadow-2xl">
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between rounded-t-2xl border-b border-[#E8DFD1] bg-[#FAF6F0] px-4 py-3.5 sm:px-6 sm:py-4">
          <div>
            <h3
              id="product-form-title"
              className="font-display text-2xl font-semibold text-[#2C221E]"
            >
              {editingProduct ? 'Edit Boutique Garment' : 'Add New Product'}
            </h3>
            <p className="text-xs text-[#6E5D54]">
              Changes save to browser storage and update the storefront immediately.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close product editor"
            className="flex h-9 w-9 items-center justify-center rounded-lg text-[#6E5D54] hover:bg-[#F5EFE6] hover:text-[#2C221E]"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-5">
          {errorMsg && (
            <div className="rounded-lg border border-[#C8963E] bg-[#F4E4D8] px-4 py-2.5 text-xs font-medium text-[#2C221E]">
              {errorMsg}
            </div>
          )}

          {/* Core Info */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-xs font-medium text-[#6E5D54]">
                Product Name *
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ivory Silk Smocked Romper"
                className="w-full min-w-0 rounded-lg border border-[#E8DFD1] bg-[#FAF6F0] px-3.5 py-2.5 text-base sm:text-sm text-[#2C221E] placeholder:text-[#6E5D54]/55 focus:border-[#C8963E] focus:outline-none"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium text-[#6E5D54]">
                Subtitle / Short Tagline
              </label>
              <input
                type="text"
                value={subtitle}
                onChange={(e) => setSubtitle(e.target.value)}
                placeholder="Organic batiste two-piece with pearl buttons"
                className="w-full min-w-0 rounded-lg border border-[#E8DFD1] bg-[#FAF6F0] px-3.5 py-2.5 text-base sm:text-sm text-[#2C221E] placeholder:text-[#6E5D54]/55 focus:border-[#C8963E] focus:outline-none"
              />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <label className="mb-1.5 block text-xs font-medium text-[#6E5D54]">
                Category *
              </label>
              <select
                value={category}
                onChange={(e) =>
                  setCategory(e.target.value as Exclude<ProductCategory, 'All'>)
                }
                className="w-full min-w-0 rounded-lg border border-[#E8DFD1] bg-[#FAF6F0] px-3.5 py-2.5 text-base sm:text-sm text-[#2C221E] focus:border-[#C8963E] focus:outline-none"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-medium text-[#6E5D54]">
                Price (PKR) * <span className="text-[#C8963E]">({usdEstimate})</span>
              </label>
              <input
                type="number"
                min={100}
                step={50}
                required
                value={pricePkr}
                onChange={(e) => setPricePkr(e.target.value)}
                className="tabular-nums w-full min-w-0 rounded-lg border border-[#E8DFD1] bg-[#FAF6F0] px-3.5 py-2.5 text-base sm:text-sm text-[#2C221E] focus:border-[#C8963E] focus:outline-none"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-medium text-[#6E5D54]">
                Stock Status
              </label>
              <select
                value={stockStatus}
                onChange={(e) => setStockStatus(e.target.value as StockStatus)}
                className="w-full min-w-0 rounded-lg border border-[#E8DFD1] bg-[#FAF6F0] px-3.5 py-2.5 text-base sm:text-sm text-[#2C221E] focus:border-[#C8963E] focus:outline-none"
              >
                <option value="in-stock">In Stock</option>
                <option value="low-stock">Low Stock</option>
                <option value="sold-out">Sold Out</option>
              </select>
            </div>
          </div>

          {/* Age Sizes Checkboxes */}
          <div>
            <div className="mb-2 flex items-center justify-between">
              <label className="text-xs font-medium text-[#6E5D54]">
                Available Age Sizes (0–10Y) *
              </label>
              <button
                type="button"
                onClick={() =>
                  setSelectedSizes(
                    selectedSizes.length === ALL_GARMENT_SIZES.length
                      ? ['0–3M', '3–6M']
                      : [...ALL_GARMENT_SIZES]
                  )
                }
                className="text-xs font-medium text-[#C8963E] hover:underline"
              >
                {selectedSizes.length === ALL_GARMENT_SIZES.length
                  ? 'Select Baby Only'
                  : 'Select All 0–10Y'}
              </button>
            </div>
            <div className="grid grid-cols-4 gap-2 sm:grid-cols-8">
              {ALL_GARMENT_SIZES.map((sz) => {
                const checked = selectedSizes.includes(sz);
                return (
                  <label
                    key={sz}
                    className={`flex cursor-pointer items-center justify-center gap-1.5 rounded-lg border px-2 py-2 text-xs font-medium transition-colors ${
                      checked
                        ? 'border-[#C8963E] bg-[#F4E4D8] text-[#2C221E]'
                        : 'border-[#E8DFD1] bg-[#FAF6F0] text-[#6E5D54] hover:border-[#C8963E]'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => toggleSize(sz)}
                      className="sr-only"
                    />
                    <span>{sz}</span>
                  </label>
                );
              })}
            </div>
          </div>

          {/* Fabric & Care Details */}
          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <label className="mb-1.5 block text-xs font-medium text-[#6E5D54]">
                Fabric Composition
              </label>
              <input
                type="text"
                value={fabricBadge}
                onChange={(e) => setFabricBadge(e.target.value)}
                placeholder="100% Organic Cotton"
                className="w-full min-w-0 rounded-lg border border-[#E8DFD1] bg-[#FAF6F0] px-3 py-2 text-base sm:text-xs text-[#2C221E] focus:border-[#C8963E] focus:outline-none"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium text-[#6E5D54]">
                Skin Safety Note
              </label>
              <input
                type="text"
                value={hypoallergenicNote}
                onChange={(e) => setHypoallergenicNote(e.target.value)}
                placeholder="Hypoallergenic · GOTS Certified"
                className="w-full min-w-0 rounded-lg border border-[#E8DFD1] bg-[#FAF6F0] px-3 py-2 text-base sm:text-xs text-[#2C221E] focus:border-[#C8963E] focus:outline-none"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium text-[#6E5D54]">
                Garment Care
              </label>
              <input
                type="text"
                value={careNote}
                onChange={(e) => setCareNote(e.target.value)}
                placeholder="Cold gentle wash · Lay flat"
                className="w-full min-w-0 rounded-lg border border-[#E8DFD1] bg-[#FAF6F0] px-3 py-2 text-base sm:text-xs text-[#2C221E] focus:border-[#C8963E] focus:outline-none"
              />
            </div>
          </div>

          {/* Image URL + Upload + Studio Presets */}
          <div className="rounded-xl border border-[#E8DFD1] bg-[#FAF6F0] p-4 space-y-3">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
              {/* Live Thumbnail Preview */}
              <div className="h-28 w-36 shrink-0 overflow-hidden rounded-xl border border-[#E8DFD1] bg-[#F5EFE6] flex items-center justify-center">
                {imageUrl ? (
                  <img
                    src={imageUrl}
                    alt="Garment preview"
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <ImageIcon className="h-6 w-6 text-[#6E5D54]/50" />
                )}
              </div>

              <div className="flex-1 space-y-2.5 min-w-0">
                <label className="block text-xs font-medium text-[#6E5D54]">
                  Product Image URL or Upload
                </label>
                <div className="flex flex-wrap gap-2">
                  <input
                    type="text"
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    placeholder="https://... or choose studio preset below"
                    className="min-w-0 flex-1 rounded-lg border border-[#E8DFD1] bg-[#FFFFFF] px-3 py-2 text-base sm:text-xs text-[#2C221E] placeholder:text-[#6E5D54]/55 focus:border-[#C8963E] focus:outline-none"
                  />
                  <label className="inline-flex cursor-pointer items-center gap-1.5 whitespace-nowrap rounded-lg border border-[#C8963E] bg-[#F4E4D8] px-3 py-2 text-xs font-semibold text-[#2C221E] transition-colors hover:bg-[#C8963E] hover:text-[#FFFFFF]">
                    <Upload className="h-3.5 w-3.5" />
                    <span>{uploading ? 'Processing...' : 'Upload Photo'}</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileUpload}
                      className="sr-only"
                    />
                  </label>
                </div>
                <p className="text-[11px] text-[#6E5D54]">
                  Pick a boutique studio preset below or upload your own photo (auto-optimized for browser storage).
                </p>
              </div>
            </div>

            {/* Sample Studio Presets */}
            <div>
              <span className="mb-2 block text-[11px] font-medium text-[#6E5D54]">
                Quick Studio Image Presets:
              </span>
              <div className="grid grid-cols-4 gap-2 sm:grid-cols-6">
                {SAMPLE_IMAGE_PRESETS.map((preset) => {
                  const selected = imageUrl === preset.url;
                  return (
                    <button
                      key={preset.id}
                      type="button"
                      onClick={() => {
                        setImageUrl(preset.url);
                        setGarmentModelType(preset.garmentModelType);
                      }}
                      className={`group overflow-hidden rounded-lg border text-left transition-all ${
                        selected
                          ? 'border-[#C8963E] ring-2 ring-[#C8963E]/40'
                          : 'border-[#E8DFD1] hover:border-[#C8963E]'
                      }`}
                      title={preset.label}
                    >
                      <div className="aspect-[4/3] w-full bg-[#F5EFE6]">
                        <img
                          src={preset.url}
                          alt={preset.label}
                          className="h-full w-full object-cover"
                        />
                      </div>
                      <span className="block truncate bg-[#FFFFFF] px-1.5 py-1 text-[10px] font-medium text-[#2C221E]">
                        {preset.label}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="mb-1.5 block text-xs font-medium text-[#6E5D54]">
              Garment Description
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe fabric feel, embroidery details, lining, and occasion..."
              className="w-full min-w-0 rounded-lg border border-[#E8DFD1] bg-[#FAF6F0] px-3.5 py-2.5 text-base sm:text-sm text-[#2C221E] placeholder:text-[#6E5D54]/55 focus:border-[#C8963E] focus:outline-none"
            />
          </div>

          {/* Collection Flags */}
          <div className="flex flex-wrap items-center gap-5">
            <label className="flex cursor-pointer items-center gap-2 text-xs font-medium text-[#2C221E]">
              <input
                type="checkbox"
                checked={isNewArrival}
                onChange={(e) => setIsNewArrival(e.target.checked)}
                className="h-4 w-4 accent-[#C8963E]"
              />
              <span>Feature in New Arrivals</span>
            </label>
            <label className="flex cursor-pointer items-center gap-2 text-xs font-medium text-[#2C221E]">
              <input
                type="checkbox"
                checked={isGiftSet}
                onChange={(e) => setIsGiftSet(e.target.checked)}
                className="h-4 w-4 accent-[#C8963E]"
              />
              <span>Include in Gift Sets</span>
            </label>
          </div>

          {/* Footer Buttons */}
          <div className="flex items-center justify-end gap-3 border-t border-[#E8DFD1] pt-4">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-[#E8DFD1] bg-[#FFFFFF] px-5 py-2.5 text-xs font-medium text-[#6E5D54] hover:border-[#C8963E] hover:text-[#2C221E]"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="rounded-lg bg-[#C8963E] px-6 py-2.5 text-xs font-semibold text-[#FFFFFF] transition-colors hover:bg-[#E0AF50] hover:text-[#2C221E]"
            >
              {editingProduct ? 'Save Changes' : 'Publish Garment'}
            </button>
          </div>
          <div className="h-24 sm:h-8 shrink-0" aria-hidden="true" />
        </form>
      </div>
    </div>
  );
}
