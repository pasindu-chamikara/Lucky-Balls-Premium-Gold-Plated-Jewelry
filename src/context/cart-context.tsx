"use client";

import React, { createContext, useContext, useEffect, useState } from "react";

export type CartItem = {
  id: string; // Unique ID for cart (can be product.id + choices hash)
  productId: string;
  name: string;
  price: number;
  image?: string;
  choices?: Record<string, string>;
  quantity: number;
};

type CartContextType = {
  cart: CartItem[];
  addToCart: (product: any, choices?: Record<string, string>, quantity?: number) => void;
  removeFromCart: (cartItemId: string) => void;
  clearCart: () => void;
  totalItems: number;
  totalPrice: number;
};

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isMounted, setIsMounted] = useState(false);

  // Load from local storage on mount
  useEffect(() => {
    setIsMounted(true);
    const savedCart = localStorage.getItem("lucky-balls-cart");
    if (savedCart) {
      try {
        setCart(JSON.parse(savedCart));
      } catch (e) {
        console.error("Failed to parse cart from local storage");
      }
    }
  }, []);

  // Save to local storage whenever cart changes
  useEffect(() => {
    if (isMounted) {
      localStorage.setItem("lucky-balls-cart", JSON.stringify(cart));
    }
  }, [cart, isMounted]);

  const addToCart = (product: any, choices?: Record<string, string>, quantity: number = 1) => {
    setCart((prev) => {
      // Create a unique ID based on product ID and choices
      const choicesString = choices ? JSON.stringify(choices) : "";
      const cartItemId = `${product.id}-${choicesString}`;

      const existingItem = prev.find((item) => item.id === cartItemId);

      if (existingItem) {
        return prev.map((item) =>
          item.id === cartItemId
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }

      const newItem: CartItem = {
        id: cartItemId,
        productId: product.id,
        name: product.name,
        price: product.price,
        image: product.image,
        choices,
        quantity: quantity,
      };

      return [...prev, newItem];
    });
  };

  const removeFromCart = (cartItemId: string) => {
    setCart((prev) => prev.filter((item) => item.id !== cartItemId));
  };

  const clearCart = () => {
    setCart([]);
  };

  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        removeFromCart,
        clearCart,
        totalItems,
        totalPrice,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}
