"use client";

import Image from "next/image";
import { useMemo } from "react";
import { cn } from "@/lib/utils";
import { getImageUrl } from "@/lib/utils";

interface ProductImageProps {
  src?: string | null;
  alt: string;
  className?: string;
  imgClassName?: string;
  fill?: boolean;
  sizes?: string;
  priority?: boolean;
  width?: number;
  height?: number;
}

/**
 * ProductImage renders a product image from the API.
 * - Uses backend URL only (if provided)
 * - Works with either fill or fixed dimensions
 */
export function ProductImage({
  src,
  alt,
  className,
  imgClassName,
  fill = true,
  sizes,
  priority,
  width,
  height,
}: ProductImageProps) {
  const imageUrl = useMemo(() => {
    return src ? getImageUrl(src) : null;
  }, [src]);

  // Don't render anything if no image URL is available
  if (!imageUrl) {
    return null;
  }

  return (
    <div className={cn("relative overflow-hidden", className)}>
      <Image
        src={imageUrl}
        alt={alt}
        className={cn("object-cover", imgClassName)}
        {...(fill
          ? { fill: true, sizes: sizes || "(max-width: 1024px) 100vw, 33vw" }
          : { width: width || 400, height: height || 400 })}
        priority={priority}
      />
    </div>
  );
}
