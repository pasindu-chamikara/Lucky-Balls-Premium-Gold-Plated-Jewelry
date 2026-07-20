"use client";

import { useState } from "react";
import Image from "next/image";
import { ArrowRight, Minus, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

type ProductCardProps = {
  id?: string;
  name: string;
  price: string;
  description: string;
  badge?: string;
  image: string;
  onShopClick?: (quantity: number) => void;
  onImageClick?: () => void;
  isOutOfStock?: boolean;
  priority?: boolean;
};

export function ProductCard({ id, name, price, description, badge, image, isOutOfStock, priority, onShopClick, onImageClick }: ProductCardProps) {
  const [quantity, setQuantity] = useState(1);

  const handleDecrease = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (quantity > 1) {
      setQuantity(quantity - 1);
    }
  };

  const handleIncrease = (e: React.MouseEvent) => {
    e.stopPropagation();
    setQuantity(quantity + 1);
  };

  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-none border border-[var(--border)] bg-[var(--surface)] shadow-md transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:border-[var(--accent)]">
      {id ? (
        <Link href={`/product/${id}`} className="relative block aspect-[4/3] w-full overflow-hidden bg-[var(--surface-2)]/30">
          <Image src={image} alt={name} fill priority={priority} quality={90} sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw" className={`object-cover transition-transform duration-700 group-hover:scale-105 ${isOutOfStock ? "grayscale opacity-70" : ""}`} />
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          {badge && !isOutOfStock && (
            <span className="absolute left-4 top-4 z-20 rounded-none bg-white/90 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-[var(--foreground)] shadow-sm backdrop-blur">
              {badge}
            </span>
          )}
          {isOutOfStock && (
            <span className="absolute left-4 top-4 z-20 rounded-none bg-white/90 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-zinc-500 shadow-sm backdrop-blur">
              Out of Stock
            </span>
          )}
        </Link>
      ) : (
        <div
          className="relative aspect-[4/3] w-full overflow-hidden bg-[var(--surface-2)]/30 cursor-pointer"
          onClick={onImageClick}
        >
          <Image src={image} alt={name} fill priority={priority} quality={90} sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw" className={`object-cover transition-transform duration-700 group-hover:scale-105 ${isOutOfStock ? "grayscale opacity-70" : ""}`} />
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          {badge && !isOutOfStock && (
            <span className="absolute left-4 top-4 z-20 rounded-none bg-white/90 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-[var(--foreground)] shadow-sm backdrop-blur">
              {badge}
            </span>
          )}
          {isOutOfStock && (
            <span className="absolute left-4 top-4 z-20 rounded-none bg-white/90 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-zinc-500 shadow-sm backdrop-blur">
              Out of Stock
            </span>
          )}
        </div>
      )}
      <div className="relative z-20 flex flex-1 flex-col p-3 sm:p-5">
        <div className="flex flex-col gap-1 mb-3 sm:mb-4">
          {id ? (
            <Link href={`/product/${id}`} className="transition-colors">
              <h3 className={`text-sm sm:text-lg font-serif italic font-semibold leading-tight transition-colors line-clamp-2 ${isOutOfStock ? "text-zinc-400" : "text-[var(--foreground)] group-hover:text-[var(--accent-deep)]"}`}>{name}</h3>
            </Link>
          ) : (
            <h3 className={`text-sm sm:text-lg font-serif italic font-semibold leading-tight transition-colors line-clamp-2 ${isOutOfStock ? "text-zinc-400" : "text-[var(--foreground)] group-hover:text-[var(--accent-deep)]"}`}>{name}</h3>
          )}
          <p className={`text-xs sm:text-sm font-bold tracking-wide mt-1 ${isOutOfStock ? "text-zinc-400" : "text-[var(--accent-deep)]"}`}>{price}</p>
        </div>

        <div className="mt-auto space-y-3 sm:space-y-4 pt-2">
          {!isOutOfStock && (
            <div className="flex items-center justify-between rounded-none border border-[var(--border)] bg-[var(--surface-2)]/40 px-2 sm:px-3 py-1.5 sm:py-2">
              <span className="px-2 text-[9px] sm:text-[10px] font-bold uppercase tracking-widest text-zinc-500 hidden sm:inline">Quantity</span>
              <span className="px-1 text-[9px] font-bold uppercase tracking-widest text-zinc-500 sm:hidden">Qty</span>
              <div className="flex items-center gap-1 sm:gap-2">
                <button
                  onClick={handleDecrease}
                  className="flex h-6 w-6 sm:h-7 sm:w-7 items-center justify-center rounded-none bg-white/60 text-[var(--foreground)] transition-colors hover:bg-white hover:text-[var(--accent-deep)] disabled:opacity-50"
                  disabled={quantity <= 1}
                >
                  <Minus size={12} className="sm:hidden" />
                  <Minus size={14} className="hidden sm:block" />
                </button>
                <span className="flex min-w-5 sm:min-w-6 items-center justify-center text-xs sm:text-sm font-bold text-[var(--foreground)]">{quantity}</span>
                <button
                  onClick={handleIncrease}
                  className="flex h-6 w-6 sm:h-7 sm:w-7 items-center justify-center rounded-none bg-white/60 text-[var(--foreground)] transition-colors hover:bg-white hover:text-[var(--accent-deep)]"
                >
                  <Plus size={12} className="sm:hidden" />
                  <Plus size={14} className="hidden sm:block" />
                </button>
              </div>
            </div>
          )}

          <Button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              if (!isOutOfStock) onShopClick?.(quantity);
            }}
            disabled={isOutOfStock}
            className={`h-10 sm:h-12 w-full rounded-none text-[10px] sm:text-xs font-bold tracking-widest transition-all uppercase ${isOutOfStock ? "cursor-not-allowed border-none bg-zinc-200 text-zinc-500" : "bg-[#E5C98F] text-zinc-900 hover:bg-[#BD9142] shadow-sm"}`}
          >
            {isOutOfStock ? "Out of Stock" : "Add to cart"}
          </Button>
        </div>
      </div>
    </article>
  );
}
