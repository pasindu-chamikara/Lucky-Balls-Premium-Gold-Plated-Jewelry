"use client";

import Image from "next/image";
import Link from "next/link";
import { Heart, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";

type ProductCardProps = {
  id?: string;
  name: string;
  price: string | number;
  description?: string;
  badge?: string;
  image: string;
  onShopClick?: (quantity: number) => void;
  onImageClick?: () => void;
  isOutOfStock?: boolean;
  priority?: boolean;
};

export function ProductCard({ id, name, price, description, badge, image, isOutOfStock, priority, onShopClick, onImageClick }: ProductCardProps) {
  
  const formattedPrice = typeof price === 'number' 
    ? `LKR ${Math.round(price).toLocaleString('en-US')}` 
    : price.toString();

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isOutOfStock) onShopClick?.(1);
  };

  const imageContent = (
    <div className="relative aspect-square mb-4 bg-white overflow-hidden border border-[#1F1F1F]/5 w-full">
      <button className="absolute top-4 right-4 z-10 text-[#1F1F1F]/30 hover:text-[#D6A77A] transition-colors" onClick={(e) => e.preventDefault()}>
        <Heart size={16} strokeWidth={1.5} />
      </button>
      <button className="absolute top-4 left-4 z-10 text-[#1F1F1F]/30 hover:text-[#1F1F1F] transition-colors" onClick={(e) => {
        e.preventDefault();
        if (onImageClick) onImageClick();
      }}>
        <Eye size={16} strokeWidth={1.5} />
      </button>
      
      {badge && !isOutOfStock && (
        <span className="absolute bottom-4 left-4 z-20 bg-[#1F1F1F] text-white px-3 py-1 text-[9px] uppercase tracking-widest">
          {badge}
        </span>
      )}
      {isOutOfStock && (
        <span className="absolute bottom-4 left-4 z-20 bg-[#EDE5DF] text-[#1F1F1F] px-3 py-1 text-[9px] uppercase tracking-widest">
          Out of Stock
        </span>
      )}
      
      <Image 
        src={image || "/images/gift-basket.svg"} 
        alt={name} 
        fill 
        priority={priority}
        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw" 
        className={`object-contain transition-transform duration-700 group-hover:scale-105 p-8 ${isOutOfStock ? "grayscale opacity-70" : ""}`} 
      />
    </div>
  );

  return (
    <div className="group relative flex flex-col">
      {id ? (
        <Link href={`/product/${id}`}>
          {imageContent}
        </Link>
      ) : (
        <div className="cursor-pointer" onClick={onImageClick}>
          {imageContent}
        </div>
      )}

      <div className="flex flex-col text-left px-1">
        {id ? (
          <Link href={`/product/${id}`}>
            <h3 className="text-sm font-medium text-[#1F1F1F] mb-1 group-hover:text-[#D6A77A] transition-colors line-clamp-1">{name}</h3>
          </Link>
        ) : (
          <h3 className="text-sm font-medium text-[#1F1F1F] mb-1 group-hover:text-[#D6A77A] transition-colors line-clamp-1">{name}</h3>
        )}
        <p className="text-[10px] text-[#1F1F1F]/50 mb-2">By Lucky Balls</p>
        <p className="text-[#1F1F1F] font-medium text-xs mb-4">{formattedPrice}</p>
        
        <Button 
          onClick={handleAddToCart}
          disabled={isOutOfStock}
          className="w-full rounded-none bg-transparent border border-[#1F1F1F] text-[#1F1F1F] hover:bg-[#D6A77A] hover:border-[#D6A77A] hover:text-white transition-all uppercase tracking-widest text-[10px] h-10"
        >
          {isOutOfStock ? "Out of Stock" : "Add to Cart"}
        </Button>
      </div>
    </div>
  );
}
