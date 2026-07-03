import React, { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { X, Minus, Plus } from "lucide-react";
import Image from "next/image";
import { useCart } from "@/context/cart-context";

type CustomizationOption = {
  id: string;
  type: "text" | "select";
  label: string;
  choices?: string[];
};

type Product = {
  id: string;
  name: string;
  price: number;
  description: string;
  isCustomizable: boolean;
  customizationOptions?: any[];
  image?: string;
  images?: string[];
};

export function CustomizeModal({ product, onClose }: { product: Product, onClose: () => void }) {
  const { addToCart } = useCart();
  const [choices, setChoices] = useState<Record<string, string>>({});
  const [quantity, setQuantity] = useState(1);
  
  const allImages = useMemo(() => {
    const imgs = product.images ? [...product.images] : [];
    if (product.image && !imgs.includes(product.image)) {
      imgs.unshift(product.image);
    }
    return imgs;
  }, [product.image, product.images]);

  const [activeImage, setActiveImage] = useState<string>(
    product.image || (allImages.length > 0 ? allImages[0] : "/images/gift-basket.svg")
  );

  const handleAddToCart = () => {
    addToCart(product, Object.keys(choices).length > 0 ? choices : undefined, quantity);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
      <div className="absolute inset-0 bg-zinc-50/60 backdrop-blur-sm" onClick={onClose}></div>
      <div className="relative w-full max-w-lg bg-white border border-zinc-200 rounded-3xl overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between p-6 border-b border-zinc-200/60">
          <h2 className="text-xl font-bold text-zinc-900">Product Details</h2>
          <button onClick={onClose} className="text-zinc-500 hover:text-zinc-900 transition-colors">
            <X size={20} />
          </button>
        </div>
        
        <div className="p-6 overflow-y-auto max-h-[80vh]">
          <div className="relative w-full h-64 sm:h-80 rounded-2xl overflow-hidden bg-white border border-zinc-200 mb-4">
             <Image src={activeImage} alt={product.name} fill sizes="(max-width: 768px) 100vw, 50vw" className="object-contain opacity-90" />
          </div>
          
          {allImages.length > 1 && (
            <div className="flex gap-3 overflow-x-auto pb-4 mb-4 scrollbar-thin scrollbar-thumb-zinc-300">
              {allImages.map((img, idx) => (
                <button 
                  key={idx} 
                  onClick={() => setActiveImage(img)}
                  className={`relative h-20 w-20 shrink-0 rounded-xl overflow-hidden border-2 transition-all ${activeImage === img ? 'border-pink-500 shadow-md scale-105' : 'border-zinc-200 opacity-70 hover:opacity-100'}`}
                >
                  <Image src={img} alt={`${product.name} preview ${idx}`} fill sizes="80px" className="object-cover" />
                </button>
              ))}
            </div>
          )}
          
          <div className="mb-6">
            <h3 className="text-2xl font-bold text-zinc-900 mb-2">{product.name}</h3>
            <p className="text-xl text-pink-600 font-medium mb-4">Rs. {product.price.toFixed(2)}</p>
            <p className="text-zinc-700 leading-relaxed">{product.description}</p>
          </div>

          <div className="space-y-6">
            {product.customizationOptions?.map((opt: any) => (
              <div key={opt.id} className="space-y-2">
                <label className="block text-sm font-medium text-zinc-700">
                  {opt.label}
                </label>
                {opt.type === "text" ? (
                  <input 
                    type="text" 
                    placeholder="Enter details..."
                    onChange={(e) => setChoices(prev => ({ ...prev, [opt.id]: e.target.value }))}
                    className="w-full bg-white border border-zinc-200 rounded-xl px-4 py-3 text-zinc-900 focus:outline-none focus:border-pink-500 transition-colors"
                  />
                ) : (
                  <select
                    onChange={(e) => setChoices(prev => ({ ...prev, [opt.id]: e.target.value }))}
                    className="w-full bg-white border border-zinc-200 rounded-xl px-4 py-3 text-zinc-900 focus:outline-none focus:border-pink-500 transition-colors appearance-none"
                  >
                    <option value="">Select an option</option>
                    {opt.choices?.map((choice: string) => (
                      <option key={choice} value={choice}>{choice}</option>
                    ))}
                  </select>
                )}
              </div>
            ))}
            
            {(!product.customizationOptions || product.customizationOptions.length === 0) && (
              <p className="text-zinc-500 italic">No customization options available for this item.</p>
            )}
          </div>
        </div>

        <div className="p-6 border-t border-zinc-200/60 bg-white/50 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <span className="text-zinc-700 font-medium">Quantity</span>
            <div className="flex items-center border border-zinc-200 rounded-lg bg-white h-10">
              <button
                onClick={() => quantity > 1 && setQuantity(q => q - 1)}
                className="px-3 h-full text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900 transition-colors disabled:opacity-50 rounded-l-lg"
                disabled={quantity <= 1}
              >
                <Minus size={16} />
              </button>
              <span className="w-10 text-center font-medium text-zinc-900">{quantity}</span>
              <button
                onClick={() => setQuantity(q => q + 1)}
                className="px-3 h-full text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900 transition-colors rounded-r-lg"
              >
                <Plus size={16} />
              </button>
            </div>
          </div>
          <Button onClick={handleAddToCart} className="w-full py-6 rounded-xl bg-pink-600 text-white font-bold text-lg shadow-[0_0_20px_rgba(219,39,119,0.3)] hover:bg-pink-500 transition-all">
            Add to Cart - Rs. {(product.price * quantity).toFixed(2)}
          </Button>
        </div>
      </div>
    </div>
  );
}
