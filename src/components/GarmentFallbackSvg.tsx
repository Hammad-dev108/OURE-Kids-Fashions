import type { GarmentModelType, GarmentPalette } from '../types/store';

interface GarmentFallbackSvgProps {
  garmentType: GarmentModelType;
  palette: GarmentPalette;
  name: string;
  fabricBadge: string;
  compact?: boolean;
}

export function GarmentFallbackSvg({
  garmentType,
  palette,
  name,
  fabricBadge,
  compact = false,
}: GarmentFallbackSvgProps) {
  return (
    <div className="relative flex h-full w-full flex-col items-center justify-center overflow-hidden bg-gradient-to-b from-[#FAF6F0] via-[#F5EFE6] to-[#EDE4D6] p-4 text-center">
      {/* Subtle warm studio spotlight glow */}
      <div
        className="pointer-events-none absolute inset-0 opacity-70"
        style={{
          background:
            'radial-gradient(circle at 50% 35%, rgba(200, 150, 62, 0.16), transparent 65%)',
        }}
      />

      <svg
        viewBox="0 0 160 130"
        className={compact ? 'relative h-12 w-12' : 'relative h-28 w-36'}
        fill="none"
        aria-hidden="true"
      >
        {/* Boutique Gold Hanger */}
        <path
          d="M80 12c0-4 5-6 8-3 2 2 1 5-3 7l-5 3M50 34l30-14 30 14"
          stroke={palette.hardware}
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {garmentType === 'romper' && (
          <g>
            <path
              d="M54 34 L36 48 L43 59 L56 50 L56 96 L74 96 L80 82 L86 96 L104 96 L104 50 L117 59 L124 48 L106 34 C98 39 62 39 54 34 Z"
              fill={palette.primary}
              stroke={palette.secondary}
              strokeWidth="1.8"
              strokeLinejoin="round"
            />
            <path
              d="M66 37 L92 66"
              stroke={palette.accent}
              strokeWidth="2"
              strokeLinecap="round"
            />
            <circle cx="72" cy="44" r="2.2" fill={palette.hardware} />
            <circle cx="80" cy="53" r="2.2" fill={palette.hardware} />
            <circle cx="88" cy="62" r="2.2" fill={palette.hardware} />
          </g>
        )}

        {garmentType === 'frock' && (
          <g>
            <path
              d="M58 34 L44 45 L51 54 L60 48 L58 62 L102 62 L100 48 L109 54 L116 45 L102 34 C94 40 66 40 58 34 Z"
              fill={palette.primary}
              stroke={palette.secondary}
              strokeWidth="1.6"
            />
            <path
              d="M58 62 L36 108 C58 115 102 115 124 108 L102 62 Z"
              fill={palette.primary}
              fillOpacity="0.88"
              stroke={palette.secondary}
              strokeWidth="1.6"
            />
            <path
              d="M58 62 H102"
              stroke={palette.accent}
              strokeWidth="4.5"
              strokeLinecap="round"
            />
            <circle cx="80" cy="62" r="3.5" fill={palette.hardware} />
          </g>
        )}

        {garmentType === 'kurta' && (
          <g>
            <path
              d="M55 34 L34 52 L42 63 L56 54 L56 104 H104 V54 L118 63 L126 52 L105 34 C96 38 64 38 55 34 Z"
              fill={palette.primary}
              stroke={palette.secondary}
              strokeWidth="1.8"
            />
            <rect
              x="75"
              y="36"
              width="10"
              height="26"
              rx="2"
              fill={palette.accent}
              fillOpacity="0.45"
              stroke={palette.hardware}
              strokeWidth="1.2"
            />
            <circle cx="80" cy="43" r="1.8" fill={palette.hardware} />
            <circle cx="80" cy="50" r="1.8" fill={palette.hardware} />
            <circle cx="80" cy="57" r="1.8" fill={palette.hardware} />
          </g>
        )}

        {garmentType === 'cardigan-set' && (
          <g>
            <path
              d="M54 34 L35 50 L43 61 L56 52 L56 88 H104 V52 L117 61 L125 50 L106 34 C96 39 64 39 54 34 Z"
              fill={palette.primary}
              stroke={palette.secondary}
              strokeWidth="1.8"
            />
            <line
              x1="80"
              y1="38"
              x2="80"
              y2="88"
              stroke={palette.secondary}
              strokeWidth="2.4"
            />
            <circle cx="80" cy="47" r="2" fill={palette.hardware} />
            <circle cx="80" cy="58" r="2" fill={palette.hardware} />
            <circle cx="80" cy="69" r="2" fill={palette.hardware} />
            <circle cx="80" cy="80" r="2" fill={palette.hardware} />
            <path
              d="M61 90 H99 L103 114 H84 L80 99 L76 114 H57 Z"
              fill={palette.secondary}
              stroke={palette.accent}
              strokeWidth="1.4"
            />
          </g>
        )}

        {garmentType === 'overalls' && (
          <g>
            <path
              d="M54 35 L38 48 L44 58 L56 50 V68 H104 V50 L116 58 L122 48 L106 35 Z"
              fill={palette.secondary}
            />
            <path
              d="M62 35 V50 H98 V35 H103 V72 L106 112 H85 L80 86 L75 112 H54 L57 72 V35 Z"
              fill={palette.primary}
              stroke={palette.accent}
              strokeWidth="1.6"
            />
            <rect
              x="70"
              y="56"
              width="20"
              height="14"
              rx="2"
              stroke={palette.accent}
              strokeWidth="1.4"
            />
            <circle cx="64" cy="49" r="2.4" fill={palette.hardware} />
            <circle cx="96" cy="49" r="2.4" fill={palette.hardware} />
          </g>
        )}

        {garmentType === 'party-suit' && (
          <g>
            <path
              d="M54 34 L35 50 L43 61 L56 52 L56 90 H104 V52 L117 61 L125 50 L106 34 L80 56 Z"
              fill={palette.primary}
              stroke={palette.accent}
              strokeWidth="1.5"
            />
            <polygon points="66,35 94,35 80,58" fill={palette.secondary} />
            <path
              d="M73 41 L87 47 M87 41 L73 47"
              stroke={palette.hardware}
              strokeWidth="3"
              strokeLinecap="round"
            />
            <path
              d="M60 92 H100 L102 115 H84 L80 99 L76 115 H58 Z"
              fill={palette.primary}
              stroke={palette.accent}
              strokeWidth="1.2"
            />
          </g>
        )}
      </svg>

      {!compact && (
        <div className="relative mt-2">
          <p className="font-display text-base font-semibold text-[#2C221E]">
            {name}
          </p>
          <p className="mt-0.5 text-[11px] text-[#6E5D54]">{fabricBadge}</p>
        </div>
      )}
    </div>
  );
}
