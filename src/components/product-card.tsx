"use client";

import { useState } from "react";
import Image from "next/image";
import { ArrowRight, Minus, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

type ProductCardProps = {
  name: string;
  price: string;
  description: string;
  badge?: string;
  image: string;
  onShopClick?: (quantity: number) => void;
  onImageClick?: () => void;
  isOutOfStock?: boolean;
};

export function ProductCard({ name, price, description, badge, image, isOutOfStock, onShopClick, onImageClick }: ProductCardProps) {
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
    <article className="overflow-hidden rounded-3xl border border-zinc-200 bg-white/60 shadow-[0_0_15px_rgba(0,0,0,0.5)] backdrop-blur-sm transition-all duration-300 hover:-translate-y-2 hover:shadow-[0_10px_30px_rgba(219,39,119,0.3)] hover:border-pink-500/40 group">
      <div
        className="relative h-56 w-full bg-zinc-50 flex items-center justify-center overflow-hidden cursor-pointer"
        onClick={onImageClick}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-pink-900/20 z-10 pointer-events-none"></div>
        <Image src={image} alt={name} fill sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw" className={`object-cover opacity-80 group-hover:scale-110 transition-transform duration-700 ${isOutOfStock ? "grayscale" : ""}`} />
        {badge && !isOutOfStock && (
          <span className="absolute left-4 top-4 z-20 rounded-full bg-pink-600 text-white px-3 py-1 text-xs font-semibold shadow-[0_0_10px_rgba(219,39,119,0.6)]">
            {badge}
          </span>
        )}
        {isOutOfStock && (
          <span className="absolute left-4 top-4 z-20 rounded-full bg-zinc-800 text-white px-3 py-1 text-xs font-semibold shadow-[0_0_10px_rgba(0,0,0,0.6)]">
            Out of Stock
          </span>
        )}
      </div>
      <div className="space-y-4 p-6 relative z-20">
        <div className="space-y-2">
          <h3 className={`text-xl font-bold transition-colors ${isOutOfStock ? "text-zinc-500" : "text-zinc-900 group-hover:text-pink-600"}`}>{name}</h3>
          <p className="text-sm leading-6 text-zinc-500">{description}</p>
        </div>
        <div className="flex flex-col gap-3">
          <p className={`text-lg font-bold ${isOutOfStock ? "text-zinc-400" : "text-pink-600"}`}>{price}</p>
          <div className="flex items-center gap-2 w-full">
            {!isOutOfStock && (
              <div className="flex items-center border border-zinc-200 rounded-lg bg-white h-9 shrink-0">
                <button
                  onClick={handleDecrease}
                  className="px-2 h-full text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900 transition-colors disabled:opacity-50 rounded-l-lg"
                  disabled={quantity <= 1}
                >
                  <Minus size={14} />
                </button>
                <span className="w-6 text-center text-sm font-medium text-zinc-900">{quantity}</span>
                <button
                  onClick={handleIncrease}
                  className="px-2 h-full text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900 transition-colors rounded-r-lg"
                >
                  <Plus size={14} />
                </button>
              </div>
            )}
            <Button
              onClick={(e) => {
                e.stopPropagation();
                if (!isOutOfStock) onShopClick?.(quantity);
              }}
              disabled={isOutOfStock}
              variant="secondary"
              size="sm"
              className={`gap-2 border transition-all flex-1 h-9 ${isOutOfStock ? "bg-zinc-200 text-zinc-500 border-zinc-200 cursor-not-allowed opacity-70 hover:bg-zinc-200 hover:text-zinc-500" : "bg-pink-950 text-pink-600 hover:bg-pink-600 hover:text-white border-pink-500/30"}`}
            >
              {isOutOfStock ? "Out of Stock" : "Add to cart"}
              {!isOutOfStock && <ArrowRight size={16} />}
            </Button>
          </div>
        </div>
      </div>
    </article>
  );
}
