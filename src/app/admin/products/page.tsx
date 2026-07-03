"use client";

import { useState, useEffect } from "react";
import { AdminLayout } from "@/components/admin-layout";
import { Button } from "@/components/ui/button";
import { Plus, Trash2, Edit2, Star, Image as ImageIcon, X } from "lucide-react";
import { collection, addDoc, getDocs, updateDoc, deleteDoc, doc, writeBatch, query, where } from "firebase/firestore";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { db, storage } from "@/firebase/config";

type Subcategory = { id: string; name: string; slug: string; };
type Category = { id: string; name: string; slug: string; subcategories: Subcategory[]; };

type CustomizationOption = {
  id: string;
  type: "text" | "select";
  label: string;
  choices: string[]; // only for 'select'
};

type Product = {
  id: string;
  categoryId: string;
  subcategoryId: string;
  name: string;
  price: number;
  description: string;
  isFeaturedThisWeek: boolean;
  isPinnedForHome: boolean;
  isCustomizable: boolean;
  customizationOptions: CustomizationOption[];
  image: string;
  images?: string[];
  targetGender: "mens" | "womens" | "both" | "";
  isOutOfStock?: boolean;
  stockQuantity?: number;
};

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  // New/Edit Product Form State
  const [isAdding, setIsAdding] = useState(false);
  const [editingProductId, setEditingProductId] = useState<string | null>(null);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [newProduct, setNewProduct] = useState<Partial<Product>>({
    name: "", price: "" as any, description: "", categoryId: "", subcategoryId: "", 
    isFeaturedThisWeek: false, isPinnedForHome: false, isCustomizable: false, customizationOptions: [], image: "", images: [], targetGender: "both", isOutOfStock: false, stockQuantity: 0
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const [catSnap, prodSnap] = await Promise.all([
        getDocs(collection(db, "categories")),
        getDocs(collection(db, "products"))
      ]);
      
      const cats = catSnap.docs.map(d => ({ id: d.id, ...d.data() } as Category));
      const prods = prodSnap.docs.map(d => ({ id: d.id, ...d.data() } as Product));
      
      setCategories(cats);
      setProducts(prods);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProduct.name || !newProduct.categoryId) return;

    // Validation for max 3 pinned items
    if (newProduct.isPinnedForHome) {
      const currentlyPinned = products.filter(p => p.isPinnedForHome && p.id !== editingProductId);
      if (currentlyPinned.length >= 3) {
        alert("You can only pin a maximum of 3 items for the homepage. Please unpin an item first.");
        return;
      }
    }

    const productToSave = { ...newProduct, price: Number(newProduct.price) || 0 };
    if (productToSave.stockQuantity !== undefined && productToSave.stockQuantity <= 0) {
      productToSave.isOutOfStock = true;
    }

    try {
      // If this product is marked featured, un-feature any currently featured products
      if (newProduct.isFeaturedThisWeek) {
        const batch = writeBatch(db);
        const featuredQuery = query(collection(db, "products"), where("isFeaturedThisWeek", "==", true));
        const featuredSnap = await getDocs(featuredQuery);
        featuredSnap.forEach((d) => {
          if (d.id !== editingProductId) {
            batch.update(d.ref, { isFeaturedThisWeek: false });
          }
        });
        await batch.commit();
      }

      if (editingProductId) {
        await updateDoc(doc(db, "products", editingProductId), productToSave);
        setProducts(products.map(p => {
          if (p.id === editingProductId) return { id: editingProductId, ...productToSave } as Product;
          if (productToSave.isFeaturedThisWeek) return { ...p, isFeaturedThisWeek: false };
          return p;
        }));
      } else {
        const docRef = await addDoc(collection(db, "products"), productToSave);
        setProducts([...products.map(p => productToSave.isFeaturedThisWeek ? {...p, isFeaturedThisWeek: false} : p), { id: docRef.id, ...productToSave } as Product]);
      }
      
      setIsAdding(false);
      setEditingProductId(null);
      setNewProduct({ name: "", price: "" as any, description: "", categoryId: "", subcategoryId: "", isFeaturedThisWeek: false, isPinnedForHome: false, isCustomizable: false, customizationOptions: [], image: "", images: [], targetGender: "both", isOutOfStock: false });
    } catch (error) {
      console.error("Error adding product:", error);
    }
  };

  const handleDelete = async (id: string) => {
    if(!confirm("Delete this product?")) return;
    try {
      await deleteDoc(doc(db, "products", id));
      setProducts(products.filter(p => p.id !== id));
    } catch (error) {
      console.error("Error deleting product:", error);
    }
  };

  const handleToggleFeatured = async (id: string, currentStatus: boolean) => {
    try {
      const newStatus = !currentStatus;
      
      if (newStatus) {
        const batch = writeBatch(db);
        const featuredQuery = query(collection(db, "products"), where("isFeaturedThisWeek", "==", true));
        const featuredSnap = await getDocs(featuredQuery);
        featuredSnap.forEach((d) => {
          if (d.id !== id) {
            batch.update(d.ref, { isFeaturedThisWeek: false });
          }
        });
        batch.update(doc(db, "products", id), { isFeaturedThisWeek: true });
        await batch.commit();
        
        setProducts(products.map(p => ({
          ...p,
          isFeaturedThisWeek: p.id === id ? true : false
        })));
      } else {
        await updateDoc(doc(db, "products", id), { isFeaturedThisWeek: false });
        setProducts(products.map(p => p.id === id ? { ...p, isFeaturedThisWeek: false } : p));
      }
    } catch (error) {
      console.error("Error toggling featured status:", error);
    }
  };

  const handleTogglePinned = async (id: string, currentStatus: boolean) => {
    try {
      const newStatus = !currentStatus;
      
      if (newStatus) {
        const currentlyPinned = products.filter(p => p.isPinnedForHome);
        if (currentlyPinned.length >= 3) {
          alert("You can only pin a maximum of 3 items for the homepage. Please unpin an item first.");
          return;
        }
      }
      
      await updateDoc(doc(db, "products", id), { isPinnedForHome: newStatus });
      setProducts(products.map(p => p.id === id ? { ...p, isPinnedForHome: newStatus } : p));
    } catch (error) {
      console.error("Error toggling pinned status:", error);
    }
  };

  const handleToggleOutOfStock = async (id: string, currentStatus: boolean) => {
    try {
      const newStatus = !currentStatus;
      await updateDoc(doc(db, "products", id), { isOutOfStock: newStatus });
      setProducts(products.map(p => p.id === id ? { ...p, isOutOfStock: newStatus } : p));
    } catch (error) {
      console.error("Error toggling out of stock status:", error);
    }
  };

  const addCustomOption = () => {
    setNewProduct(prev => ({
      ...prev,
      customizationOptions: [
        ...(prev.customizationOptions || []),
        { id: Math.random().toString(36).slice(2,9), type: "text", label: "", choices: [] }
      ]
    }));
  };

  const updateCustomOption = (index: number, updates: Partial<CustomizationOption>) => {
    setNewProduct(prev => {
      const opts = [...(prev.customizationOptions || [])];
      opts[index] = { ...opts[index], ...updates };
      return { ...prev, customizationOptions: opts };
    });
  };

  const removeCustomOption = (index: number) => {
    setNewProduct(prev => {
      const opts = [...(prev.customizationOptions || [])];
      opts.splice(index, 1);
      return { ...prev, customizationOptions: opts };
    });
  };

  const selectedCategory = categories.find(c => c.id === newProduct.categoryId);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploadingImage(true);
    try {
      const uploadPromises = Array.from(files).map(async (file) => {
        const fileRef = ref(storage, `products/${Date.now()}-${file.name}`);
        const uploadTask = await uploadBytesResumable(fileRef, file);
        return getDownloadURL(uploadTask.ref);
      });
      
      const downloadUrls = await Promise.all(uploadPromises);
      
      setNewProduct(prev => {
        const currentImages = prev.images || [];
        const newImages = [...currentImages, ...downloadUrls];
        return {
          ...prev,
          image: prev.image || downloadUrls[0],
          images: newImages
        };
      });
    } catch (error) {
      console.error("Error uploading image:", error);
      alert("Failed to upload image(s). Please check if Firebase Storage is enabled.");
    } finally {
      setIsUploadingImage(false);
    }
  };

  const removeImage = (indexToRemove: number) => {
    setNewProduct(prev => {
      const currentImages = prev.images || [];
      const newImages = currentImages.filter((_, idx) => idx !== indexToRemove);
      
      let newPrimary = prev.image;
      if (prev.image === currentImages[indexToRemove]) {
        newPrimary = newImages.length > 0 ? newImages[0] : "";
      }
      
      return {
        ...prev,
        image: newPrimary,
        images: newImages
      };
    });
  };

  return (
    <AdminLayout title="Manage Products">
      {isAdding ? (
        <div className="bg-white rounded-2xl border border-zinc-200/60 p-6 shadow-sm max-w-2xl">
          <h2 className="text-xl font-bold mb-6">{editingProductId ? "Edit Product" : "Add New Product"}</h2>
          <form onSubmit={handleAddProduct} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-zinc-700 mb-1">Name</label>
              <input required type="text" value={newProduct.name} onChange={e => setNewProduct({...newProduct, name: e.target.value})} className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm text-zinc-900 focus:border-pink-500 focus:outline-none" />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-zinc-700 mb-1">Product Images</label>
              <div className="flex flex-col gap-4">
                <div className="flex items-center gap-4">
                  <div className="flex-1">
                    <input type="file" multiple accept="image/*" onChange={handleImageUpload} disabled={isUploadingImage} className="w-full text-sm text-zinc-600 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-pink-50 file:text-pink-700 hover:file:bg-pink-100" />
                    {isUploadingImage && <p className="text-xs text-pink-600 mt-2 font-medium animate-pulse">Uploading image(s) securely...</p>}
                  </div>
                </div>

                {(newProduct.images && newProduct.images.length > 0) ? (
                  <div className="flex flex-wrap gap-4 mt-2">
                    {newProduct.images.map((img, idx) => (
                      <div key={idx} className={`relative h-24 w-24 rounded-lg overflow-hidden border-2 ${newProduct.image === img ? 'border-pink-500' : 'border-zinc-200'}`}>
                        <img src={img} alt={`Preview ${idx}`} className="w-full h-full object-cover" />
                        <button 
                          type="button" 
                          onClick={() => removeImage(idx)}
                          className="absolute top-1 right-1 bg-black/50 text-white rounded-full p-1 hover:bg-black/70 transition-colors"
                        >
                          <X size={12} />
                        </button>
                        {newProduct.image === img && (
                          <div className="absolute bottom-0 left-0 right-0 bg-pink-500 text-white text-[10px] text-center font-bold py-0.5">
                            PRIMARY
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="h-24 w-24 rounded-lg border-2 border-dashed border-zinc-300 flex items-center justify-center bg-zinc-50 text-zinc-400">
                    <ImageIcon size={24} />
                  </div>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-zinc-700 mb-1">Price (Rs.)</label>
              <input 
                required 
                type="number" 
                min="0" 
                step="0.01" 
                value={(newProduct.price as any) === "" ? "" : (newProduct.price === undefined || isNaN(newProduct.price as any) ? "" : newProduct.price)} 
                onChange={e => {
                  if (e.target.value === "") {
                    setNewProduct({...newProduct, price: "" as any});
                  } else {
                    const val = parseFloat(e.target.value);
                    setNewProduct({...newProduct, price: isNaN(val) ? 0 : val});
                  }
                }} 
                className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm text-zinc-900 focus:border-pink-500 focus:outline-none" 
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-zinc-700 mb-1">Stock Quantity</label>
              <input 
                type="number" 
                min="0"
                value={newProduct.stockQuantity ?? 0}
                onChange={e => {
                  const qty = parseInt(e.target.value) || 0;
                  setNewProduct({
                    ...newProduct, 
                    stockQuantity: qty,
                    isOutOfStock: qty <= 0 ? true : newProduct.isOutOfStock
                  });
                }}
                className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm text-zinc-900 focus:border-pink-500 focus:outline-none" 
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-zinc-700 mb-1">Category</label>
              <select required value={newProduct.categoryId} onChange={e => setNewProduct({...newProduct, categoryId: e.target.value, subcategoryId: ""})} className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm text-zinc-900 focus:border-pink-500 focus:outline-none">
                <option value="">Select a Category</option>
                {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>

            {selectedCategory && (
              <div>
                <label className="block text-sm font-medium text-zinc-700 mb-1">Subcategory</label>
                <select value={newProduct.subcategoryId} onChange={e => setNewProduct({...newProduct, subcategoryId: e.target.value})} className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm text-zinc-900 focus:border-pink-500 focus:outline-none">
                  <option value="">None / Select Subcategory</option>
                  {selectedCategory.subcategories?.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-zinc-700 mb-1">Target Audience</label>
              <select required value={newProduct.targetGender} onChange={e => setNewProduct({...newProduct, targetGender: e.target.value as any})} className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm text-zinc-900 focus:border-pink-500 focus:outline-none">
                <option value="both">Both (Unisex)</option>
                <option value="mens">Men&apos;s</option>
                <option value="womens">Women&apos;s</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-zinc-700 mb-1">Description</label>
              <textarea rows={3} value={newProduct.description} onChange={e => setNewProduct({...newProduct, description: e.target.value})} className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm text-zinc-900 focus:border-pink-500 focus:outline-none" />
            </div>

            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-2 p-3 bg-pink-50 border border-pink-100 rounded-lg">
                <input type="checkbox" id="featured" checked={newProduct.isFeaturedThisWeek} onChange={e => setNewProduct({...newProduct, isFeaturedThisWeek: e.target.checked})} className="rounded text-pink-600 focus:ring-pink-500" />
                <label htmlFor="featured" className="text-sm font-medium text-pink-900 flex items-center gap-2">
                  <Star size={16} className="text-pink-600" />
                  Make this the "Featured This Week" item on homepage
                </label>
              </div>

              <div className="flex items-center gap-2 p-3 bg-blue-50 border border-blue-100 rounded-lg">
                <input type="checkbox" id="pinned" checked={newProduct.isPinnedForHome} onChange={e => setNewProduct({...newProduct, isPinnedForHome: e.target.checked})} className="rounded text-blue-600 focus:ring-blue-500" />
                <label htmlFor="pinned" className="text-sm font-medium text-blue-900 flex items-center gap-2">
                  <Star size={16} className="text-blue-600" />
                  Pin this item to Homepage (Max 3)
                </label>
              </div>

              <div className="flex items-center gap-2 p-3 bg-zinc-100 border border-zinc-200 rounded-lg">
                <input type="checkbox" id="outofstock" checked={newProduct.isOutOfStock} onChange={e => setNewProduct({...newProduct, isOutOfStock: e.target.checked})} className="rounded text-zinc-600 focus:ring-zinc-500" />
                <label htmlFor="outofstock" className="text-sm font-medium text-zinc-900 flex items-center gap-2">
                  Mark as Out of Stock
                </label>
              </div>
            </div>



            <div className="flex gap-3 pt-4">
              <Button type="submit" className="bg-pink-600 hover:bg-pink-500">
                {editingProductId ? "Update Product" : "Save Product"}
              </Button>
              <Button type="button" variant="outline" onClick={() => {
                setIsAdding(false);
                setEditingProductId(null);
                setNewProduct({ name: "", price: "" as any, description: "", categoryId: "", subcategoryId: "", isFeaturedThisWeek: false, isPinnedForHome: false, isCustomizable: false, customizationOptions: [], image: "", images: [], targetGender: "both", isOutOfStock: false, stockQuantity: 0 });
              }}>Cancel</Button>
            </div>
          </form>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-zinc-200/60 shadow-sm overflow-hidden">
          <div className="border-b border-zinc-100 bg-zinc-50/50 px-6 py-5 flex justify-between items-center">
            <h2 className="text-lg font-semibold text-zinc-900">All Products</h2>
            <Button onClick={() => {
              setEditingProductId(null);
              setNewProduct({ name: "", price: "" as any, description: "", categoryId: "", subcategoryId: "", isFeaturedThisWeek: false, isPinnedForHome: false, isCustomizable: false, customizationOptions: [], image: "", images: [], targetGender: "both", isOutOfStock: false, stockQuantity: 0 });
              setIsAdding(true);
            }} className="bg-pink-600 hover:bg-pink-500 text-white"><Plus size={16} className="mr-2"/> Add Product</Button>
          </div>
          
          {loading ? (
            <div className="p-10 flex justify-center">
              <div className="h-6 w-6 animate-spin rounded-full border-2 border-pink-500 border-t-transparent"></div>
            </div>
          ) : products.length === 0 ? (
            <div className="p-10 text-center text-zinc-500">No products found.</div>
          ) : (
            <table className="w-full text-left text-sm text-zinc-600">
              <thead className="bg-zinc-50 text-zinc-500 border-b">
                <tr>
                  <th className="px-6 py-4 font-medium">Image</th>
                  <th className="px-6 py-4 font-medium">Name</th>
                  <th className="px-6 py-4 font-medium">Price</th>
                  <th className="px-6 py-4 font-medium">Category</th>
                  <th className="px-6 py-4 font-medium">Audience</th>
                  <th className="px-6 py-4 font-medium">Featured</th>
                  <th className="px-6 py-4 font-medium">Pinned</th>
                  <th className="px-6 py-4 font-medium">Stock/Qty</th>

                  <th className="px-6 py-4"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                {products.map(p => (
                  <tr key={p.id} className="hover:bg-zinc-50/50">
                    <td className="px-6 py-4">
                      {p.image ? (
                        <div className="h-10 w-10 rounded overflow-hidden border border-zinc-200 bg-white">
                          <img src={p.image} alt={p.name} className="w-full h-full object-cover" />
                        </div>
                      ) : (
                        <div className="h-10 w-10 rounded border border-dashed border-zinc-300 flex items-center justify-center bg-zinc-50 text-zinc-400">
                          <ImageIcon size={16} />
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 font-medium text-zinc-900">{p.name}</td>
                    <td className="px-6 py-4">Rs. {p.price.toFixed(2)}</td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="text-zinc-900">{categories.find(c => c.id === p.categoryId)?.name || "Unknown"}</span>
                        {p.subcategoryId && <span className="text-xs text-zinc-500">↳ {categories.find(c => c.id === p.categoryId)?.subcategories.find(s => s.id === p.subcategoryId)?.name}</span>}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="capitalize px-2 py-1 bg-zinc-100 text-zinc-600 rounded-md text-xs font-medium">
                        {p.targetGender || "both"}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <button 
                        onClick={() => handleToggleFeatured(p.id, p.isFeaturedThisWeek)}
                        className="p-1 rounded-md hover:bg-pink-50 transition-colors"
                        title={p.isFeaturedThisWeek ? "Remove from featured" : "Set as featured"}
                      >
                        {p.isFeaturedThisWeek ? <Star size={18} className="text-pink-500 fill-pink-500" /> : <Star size={18} className="text-zinc-300" />}
                      </button>
                    </td>
                    <td className="px-6 py-4">
                      <button 
                        onClick={() => handleTogglePinned(p.id, p.isPinnedForHome)}
                        className="p-1 rounded-md hover:bg-blue-50 transition-colors"
                        title={p.isPinnedForHome ? "Unpin from home" : "Pin to home"}
                      >
                        {p.isPinnedForHome ? <Star size={18} className="text-blue-500 fill-blue-500" /> : <Star size={18} className="text-zinc-300" />}
                      </button>
                    </td>
                    <td className="px-6 py-4 flex flex-col gap-2">
                      <span className="text-zinc-600 font-medium">Qty: {p.stockQuantity ?? 0}</span>
                      <button 
                        onClick={() => handleToggleOutOfStock(p.id, p.isOutOfStock || false)}
                        className={`px-2 py-1 rounded-md text-xs font-medium transition-colors w-fit ${p.isOutOfStock ? "bg-red-100 text-red-600 hover:bg-red-200" : "bg-green-100 text-green-600 hover:bg-green-200"}`}
                      >
                        {p.isOutOfStock ? "Out of Stock" : "In Stock"}
                      </button>
                    </td>

                    <td className="px-6 py-4 text-right">
                      <Button variant="ghost" size="icon" onClick={() => {
                        setEditingProductId(p.id);
                        setNewProduct({
                          name: p.name,
                          price: p.price,
                          description: p.description,
                          categoryId: p.categoryId,
                          subcategoryId: p.subcategoryId,
                          isFeaturedThisWeek: p.isFeaturedThisWeek,
                          isPinnedForHome: p.isPinnedForHome || false,
                          isCustomizable: p.isCustomizable,
                          customizationOptions: p.customizationOptions || [],
                          image: p.image || "",
                          images: p.images || (p.image ? [p.image] : []),
                          targetGender: p.targetGender || "both",
                          isOutOfStock: p.isOutOfStock || false,
                          stockQuantity: p.stockQuantity || 0
                        });
                        setIsAdding(true);
                      }} className="text-zinc-500 hover:text-pink-600 hover:bg-pink-50"><Edit2 size={16} /></Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDelete(p.id)} className="text-rose-500 hover:text-rose-700 hover:bg-rose-50"><Trash2 size={16} /></Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </AdminLayout>
  );
}
