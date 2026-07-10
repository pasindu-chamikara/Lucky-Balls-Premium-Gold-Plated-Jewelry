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
    <article className="flex flex-col h-full overflow-hidden rounded-2xl sm:rounded-3xl border border-zinc-200 bg-white/60 shadow-lg shadow-pink-500/5 backdrop-blur-sm transition-all duration-300 hover:-translate-y-2 hover:shadow-[0_10px_30px_rgba(219,39,119,0.2)] hover:border-pink-500/40 group">
      {id ? (
        <Link href={`/product/${id}`} className="relative h-40 sm:h-56 w-full bg-white/30 flex items-center justify-center overflow-hidden cursor-pointer block">
          <Image src={image} alt={name} fill priority={priority} sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw" className={`object-cover group-hover:scale-105 transition-transform duration-700 ${isOutOfStock ? "grayscale" : ""}`} />
          {badge && !isOutOfStock && (
            <span className="absolute left-4 top-4 z-20 rounded-full bg-rose-500 text-white px-3 py-1 text-xs font-semibold shadow-md">
              {badge}
            </span>
          )}
          {isOutOfStock && (
            <span className="absolute left-4 top-4 z-20 rounded-full bg-zinc-800 text-white px-3 py-1 text-xs font-semibold shadow-md">
              Out of Stock
            </span>
          )}
        </Link>
      ) : (
        <div
          className="relative h-40 sm:h-56 w-full bg-white/30 flex items-center justify-center overflow-hidden cursor-pointer"
          onClick={onImageClick}
        >
          <Image src={image} alt={name} fill priority={priority} sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw" className={`object-cover group-hover:scale-105 transition-transform duration-700 ${isOutOfStock ? "grayscale" : ""}`} />
          {badge && !isOutOfStock && (
            <span className="absolute left-4 top-4 z-20 rounded-full bg-rose-500 text-white px-3 py-1 text-xs font-semibold shadow-md">
              {badge}
            </span>
          )}
          {isOutOfStock && (
            <span className="absolute left-4 top-4 z-20 rounded-full bg-zinc-800 text-white px-3 py-1 text-xs font-semibold shadow-md">
              Out of Stock
            </span>
          )}
        </div>
      )}
      <div className="flex flex-col flex-1 p-3 sm:p-6 relative z-20">
        <div className="mb-2 sm:mb-4">
          {id ? (
            <Link href={`/product/${id}`} className="hover:underline hover:decoration-rose-500 hover:underline-offset-4">
              <h3 className={`text-base sm:text-xl font-semibold transition-colors line-clamp-2 ${isOutOfStock ? "text-zinc-500" : "text-zinc-900 group-hover:text-rose-600"}`}>{name}</h3>
            </Link>
          ) : (
            <h3 className={`text-base sm:text-xl font-semibold transition-colors line-clamp-2 ${isOutOfStock ? "text-zinc-500" : "text-zinc-900 group-hover:text-rose-600"}`}>{name}</h3>
          )}
        </div>
        <div className="mt-auto space-y-3 sm:space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-4">
            <p className={`text-base sm:text-xl font-bold leading-none ${isOutOfStock ? "text-zinc-400" : "text-rose-600"}`}>{price}</p>

            {!isOutOfStock && (
              <div className="flex items-center border border-zinc-200 rounded-lg bg-white h-9 shrink-0 shadow-sm">
                <button
                  onClick={handleDecrease}
                  className="px-2 sm:px-3 h-full text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900 transition-colors disabled:opacity-50 rounded-l-lg flex items-center justify-center"
                  disabled={quantity <= 1}
                >
                  <Minus size={14} />
                </button>
                <span className="w-6 sm:w-8 text-center text-xs sm:text-sm font-medium text-zinc-900">{quantity}</span>
                <button
                  onClick={handleIncrease}
                  className="px-2 sm:px-3 h-full text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900 transition-colors rounded-r-lg flex items-center justify-center"
                >
                  <Plus size={14} />
                </button>
              </div>
            )}
          </div>

          <Button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              if (!isOutOfStock) onShopClick?.(quantity);
            }}
            disabled={isOutOfStock}
            variant={isOutOfStock ? "ghost" : "rose"}
            size="sm"
            className={`w-full gap-1 sm:gap-2 transition-all h-9 sm:h-11 text-xs sm:text-sm font-bold shadow-sm ${isOutOfStock ? "bg-zinc-100 text-zinc-400 cursor-not-allowed" : "hover:shadow-md"}`}
          >
            {isOutOfStock ? "Out of Stock" : "Add to cart"}
            {!isOutOfStock && <ArrowRight size={16} className="sm:w-[18px] sm:h-[18px]" />}
          </Button>
        </div>
      </div>
    </article>
  );
}
