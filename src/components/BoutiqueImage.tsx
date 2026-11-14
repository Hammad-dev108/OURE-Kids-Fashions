import { useEffect, useRef, useState } from 'react';
import type { Product } from '../types/store';
import { GarmentFallbackSvg } from './GarmentFallbackSvg';

interface BoutiqueImageProps {
  product: Product;
  eager?: boolean;
  compactFallback?: boolean;
  className?: string;
  onClick?: () => void;
}

export function BoutiqueImage({
  product,
  eager = false,
  compactFallback = false,
  className = '',
  onClick,
}: BoutiqueImageProps) {
  const imgRef = useRef<HTMLImageElement | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [errored, setErrored] = useState(false);

  useEffect(() => {
    setErrored(false);
    if (imgRef.current && imgRef.current.complete && imgRef.current.naturalWidth > 0) {
      setLoaded(true);
    } else {
      setLoaded(false);
    }
  }, [product.imageUrl]);

  if (errored) {
    return (
      <div
        onClick={onClick}
        className={`h-full w-full ${onClick ? 'cursor-pointer' : ''}`}
      >
        <GarmentFallbackSvg
          garmentType={product.garmentModelType}
          palette={product.palette}
          name={product.name}
          fabricBadge={product.fabricBadge}
          compact={compactFallback}
        />
      </div>
    );
  }

  return (
    <div
      onClick={onClick}
      className={`relative h-full w-full overflow-hidden bg-[#F5EFE6] ${
        onClick ? 'cursor-pointer' : ''
      }`}
    >
      {/* Smooth skeleton shimmer while decoding */}
      {!loaded && (
        <div
          aria-hidden="true"
          className="oura-shimmer absolute inset-0"
        />
      )}

      <img
        ref={imgRef}
        src={product.imageUrl}
        alt={product.name}
        loading={eager ? 'eager' : 'lazy'}
        decoding="async"
        fetchPriority={eager ? 'high' : 'auto'}
        referrerPolicy="no-referrer"
        onLoad={() => setLoaded(true)}
        onError={() => setErrored(true)}
        className={`h-full w-full object-cover transition-opacity duration-200 ${
          loaded ? 'opacity-100' : 'opacity-0'
        } ${className}`}
      />
    </div>
  );
}
