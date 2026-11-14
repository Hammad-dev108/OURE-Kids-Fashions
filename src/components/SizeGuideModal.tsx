import { useState } from 'react';
import { Ruler, X } from 'lucide-react';
import { SIZE_CHART_0_TO_10 } from '../data/products';

interface SizeGuideModalProps {
  open: boolean;
  onClose: () => void;
  highlightedSize?: string;
  onPickSize?: (size: string) => void;
}

export function SizeGuideModal({
  open,
  onClose,
  highlightedSize,
  onPickSize,
}: SizeGuideModalProps) {
  const [unit, setUnit] = useState<'cm' | 'in'>('cm');

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[60] bg-black/50 overflow-y-auto overscroll-contain flex items-start sm:items-center justify-center p-2 sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="size-guide-title"
    >
      <div className="relative flex w-full max-w-3xl flex-col my-auto rounded-2xl border border-[#E8DFD1] bg-[#FFFFFF] shadow-2xl">
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between rounded-t-2xl border-b border-[#E8DFD1] bg-[#FAF6F0] px-4 py-3.5 sm:px-6 sm:py-4">
          <div className="flex items-center gap-3">
            <Ruler className="h-5 w-5 text-[#C8963E]" />
            <div>
              <h2
                id="size-guide-title"
                className="font-display text-2xl font-semibold text-[#2C221E]"
              >
                OURA Fit &amp; Size Guide (0–10 Years)
              </h2>
              <p className="text-xs text-[#6E5D54]">
                Body measurements for comfortable, breathable organic drape
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center rounded-lg border border-[#E8DFD1] bg-[#FFFFFF] p-0.5 text-xs">
              <button
                type="button"
                onClick={() => setUnit('cm')}
                className={`rounded-md px-2.5 py-1 font-medium transition-colors ${
                  unit === 'cm'
                    ? 'bg-[#C8963E] text-[#FFFFFF]'
                    : 'text-[#6E5D54] hover:text-[#2C221E]'
                }`}
              >
                cm
              </button>
              <button
                type="button"
                onClick={() => setUnit('in')}
                className={`rounded-md px-2.5 py-1 font-medium transition-colors ${
                  unit === 'in'
                    ? 'bg-[#C8963E] text-[#FFFFFF]'
                    : 'text-[#6E5D54] hover:text-[#2C221E]'
                }`}
              >
                inches
              </button>
            </div>

            <button
              type="button"
              onClick={onClose}
              aria-label="Close size guide"
              className="flex h-9 w-9 items-center justify-center rounded-lg text-[#6E5D54] hover:bg-[#F4E4D8] hover:text-[#2C221E]"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="p-6">
          <div className="overflow-x-auto rounded-xl border border-[#E8DFD1]">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-[#E8DFD1] bg-[#FAF6F0] text-xs text-[#6E5D54]">
                <tr>
                  <th className="px-4 py-3 font-medium">Size</th>
                  <th className="px-4 py-3 font-medium">Age</th>
                  <th className="px-4 py-3 font-medium">Height ({unit})</th>
                  <th className="px-4 py-3 font-medium">Chest ({unit})</th>
                  <th className="px-4 py-3 font-medium">Tailoring Note</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E8DFD1]">
                {SIZE_CHART_0_TO_10.map((row) => {
                  const isHighlighted = highlightedSize === row.size;
                  return (
                    <tr
                      key={row.size}
                      onClick={() => {
                        if (onPickSize) {
                          onPickSize(row.size);
                          onClose();
                        }
                      }}
                      className={`transition-colors ${
                        onPickSize ? 'cursor-pointer' : ''
                      } ${
                        isHighlighted
                          ? 'bg-[#F4E4D8] text-[#2C221E]'
                          : 'hover:bg-[#FAF6F0]'
                      }`}
                    >
                      <td className="tabular-nums whitespace-nowrap px-4 py-3 font-semibold text-[#C8963E]">
                        {row.size}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-[#2C221E]">
                        {row.ageGroup}
                      </td>
                      <td className="tabular-nums whitespace-nowrap px-4 py-3 text-[#2C221E]">
                        {unit === 'cm' ? row.heightCm : row.heightIn}
                      </td>
                      <td className="tabular-nums whitespace-nowrap px-4 py-3 text-[#2C221E]">
                        {unit === 'cm' ? row.chestCm : row.chestIn}
                      </td>
                      <td className="px-4 py-3 text-xs text-[#6E5D54]">
                        {row.fitNote}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <p className="mt-4 text-xs leading-relaxed text-[#6E5D54]">
            Between sizes? For 100% organic cotton essentials, our fabrics are pre-washed for minimal shrinkage. Choose one size up if your child prefers extra room for seasonal layering.
          </p>
          <div className="h-24 sm:h-8 shrink-0" aria-hidden="true" />
        </div>
      </div>
    </div>
  );
}
