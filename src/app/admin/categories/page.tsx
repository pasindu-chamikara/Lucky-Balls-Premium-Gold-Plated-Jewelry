"use client";

import { useState, useEffect } from "react";
import { AdminLayout } from "@/components/admin-layout";
import { Button } from "@/components/ui/button";
import { Plus, Trash2, Edit2, ChevronDown, ChevronUp } from "lucide-react";
import { collection, addDoc, getDocs, updateDoc, deleteDoc, doc } from "firebase/firestore";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { db, storage } from "@/firebase/config";

type Subcategory = {
  id: string;
  name: string;
  slug: string;
};

type Category = {
  id: string;
  name: string;
  slug: string;
  image?: string;
  subcategories: Subcategory[];
};

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  
  // Edit Category State
  const [editingCategoryId, setEditingCategoryId] = useState<string | null>(null);
  const [editingCategoryName, setEditingCategoryName] = useState("");
  const [editingCategoryImage, setEditingCategoryImage] = useState("");

  // Edit Subcategory State
  const [editingSubcatId, setEditingSubcatId] = useState<string | null>(null);
  const [editingSubcatName, setEditingSubcatName] = useState("");

  // New Category State
  const [newCatName, setNewCatName] = useState("");
  const [newCatImage, setNewCatImage] = useState("");
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  
  // New Subcategory State
  const [newSubcatName, setNewSubcatName] = useState("");
  const [addingSubcatTo, setAddingSubcatTo] = useState<string | null>(null);

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const querySnapshot = await getDocs(collection(db, "categories"));
      const cats: Category[] = [];
      querySnapshot.forEach((doc) => {
        cats.push({ id: doc.id, ...doc.data() } as Category);
      });
      setCategories(cats);
    } catch (error) {
      console.error("Error fetching categories:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploadingImage(true);
    try {
      const file = files[0];
      const fileRef = ref(storage, `categories/${Date.now()}-${file.name}`);
      const uploadTask = await uploadBytesResumable(fileRef, file);
      const downloadUrl = await getDownloadURL(uploadTask.ref);
      setNewCatImage(downloadUrl);
    } catch (error) {
      console.error("Error uploading image:", error);
      alert("Failed to upload image.");
    } finally {
      setIsUploadingImage(false);
    }
  };

  const handleEditImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploadingImage(true);
    try {
      const file = files[0];
      const fileRef = ref(storage, `categories/${Date.now()}-${file.name}`);
      const uploadTask = await uploadBytesResumable(fileRef, file);
      const downloadUrl = await getDownloadURL(uploadTask.ref);
      setEditingCategoryImage(downloadUrl);
    } catch (error) {
      console.error("Error uploading image:", error);
      alert("Failed to upload image.");
    } finally {
      setIsUploadingImage(false);
    }
  };

  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName.trim()) return;

    try {
      const slug = newCatName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
      const newCategory = {
        name: newCatName,
        slug,
        image: newCatImage,
        subcategories: []
      };
      
      const docRef = await addDoc(collection(db, "categories"), newCategory);
      setCategories([...categories, { id: docRef.id, ...newCategory }]);
      setNewCatName("");
      setNewCatImage("");
    } catch (error) {
      console.error("Error adding category:", error);
    }
  };

  const handleDeleteCategory = async (id: string) => {
    if (!confirm("Are you sure you want to delete this category?")) return;
    try {
      await deleteDoc(doc(db, "categories", id));
      setCategories(categories.filter(c => c.id !== id));
    } catch (error) {
      console.error("Error deleting category:", error);
    }
  };

  const handleEditCategory = async (id: string) => {
    if (!editingCategoryName.trim()) {
      setEditingCategoryId(null);
      return;
    }
    
    try {
      const slug = editingCategoryName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
      await updateDoc(doc(db, "categories", id), {
        name: editingCategoryName,
        slug,
        image: editingCategoryImage
      });
      
      setCategories(categories.map(c => 
        c.id === id ? { ...c, name: editingCategoryName, slug, image: editingCategoryImage } : c
      ));
      
      setEditingCategoryId(null);
    } catch (error) {
      console.error("Error editing category:", error);
    }
  };

  const handleAddSubcategory = async (categoryId: string) => {
    if (!newSubcatName.trim()) return;

    const category = categories.find(c => c.id === categoryId);
    if (!category) return;

    const slug = newSubcatName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
    const newSubcategory: Subcategory = {
      id: Math.random().toString(36).slice(2, 11),
      name: newSubcatName,
      slug
    };

    const updatedSubcategories = [...(category.subcategories || []), newSubcategory];

    try {
      await updateDoc(doc(db, "categories", categoryId), {
        subcategories: updatedSubcategories
      });
      
      setCategories(categories.map(c => 
        c.id === categoryId ? { ...c, subcategories: updatedSubcategories } : c
      ));
      
      setNewSubcatName("");
      setAddingSubcatTo(null);
    } catch (error) {
      console.error("Error adding subcategory:", error);
    }
  };

  const handleDeleteSubcategory = async (categoryId: string, subcatId: string) => {
    if (!confirm("Delete this subcategory?")) return;
    
    const category = categories.find(c => c.id === categoryId);
    if (!category) return;

    const updatedSubcategories = category.subcategories.filter(s => s.id !== subcatId);

    try {
      await updateDoc(doc(db, "categories", categoryId), {
        subcategories: updatedSubcategories
      });
      
      setCategories(categories.map(c => 
        c.id === categoryId ? { ...c, subcategories: updatedSubcategories } : c
      ));
    } catch (error) {
      console.error("Error deleting subcategory:", error);
    }
  };

  const handleEditSubcategory = async (categoryId: string, subcatId: string) => {
    if (!editingSubcatName.trim()) {
      setEditingSubcatId(null);
      return;
    }

    const category = categories.find(c => c.id === categoryId);
    if (!category) return;

    const slug = editingSubcatName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
    const updatedSubcategories = category.subcategories.map(s => 
      s.id === subcatId ? { ...s, name: editingSubcatName, slug } : s
    );

    try {
      await updateDoc(doc(db, "categories", categoryId), {
        subcategories: updatedSubcategories
      });
      
      setCategories(categories.map(c => 
        c.id === categoryId ? { ...c, subcategories: updatedSubcategories } : c
      ));
      
      setEditingSubcatId(null);
    } catch (error) {
      console.error("Error editing subcategory:", error);
    }
  };

  return (
    <AdminLayout title="Manage Categories">
      <div className="grid gap-8 lg:grid-cols-[1fr_2fr]">
        
        {/* Add New Category Form */}
        <div className="bg-white rounded-2xl border border-zinc-200/60 p-6 shadow-sm h-fit">
          <h2 className="text-lg font-semibold text-zinc-900 mb-4">Add Main Category</h2>
          <form onSubmit={handleAddCategory} className="space-y-4">
            <div>
              <label htmlFor="catName" className="block text-sm font-medium text-zinc-700 mb-1">
                Category Name
              </label>
              <input
                id="catName"
                type="text"
                value={newCatName}
                onChange={(e) => setNewCatName(e.target.value)}
                placeholder="e.g. Necklaces"
                className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm text-zinc-900 focus:border-pink-500 focus:outline-none focus:ring-1 focus:ring-pink-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-700 mb-1">Category Image (Optional)</label>
              <input type="file" accept="image/*" onChange={handleImageUpload} disabled={isUploadingImage} className="w-full max-w-full overflow-hidden text-sm text-zinc-600 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-pink-50 file:text-rose-600 hover:file:bg-pink-100" />
              {isUploadingImage && <p className="text-xs text-rose-600 mt-2">Uploading image...</p>}
              {newCatImage && <img src={newCatImage} alt="Preview" className="mt-2 h-16 w-16 object-cover rounded-lg border border-zinc-200" />}
            </div>
            <Button 
              type="submit" 
              className="w-full"
              disabled={!newCatName.trim()}
            >
              <Plus size={16} className="mr-2" />
              Create Category
            </Button>
          </form>
        </div>

        {/* Categories List */}
        <div className="bg-white rounded-2xl border border-zinc-200/60 shadow-sm overflow-hidden">
          <div className="border-b border-zinc-100 bg-zinc-50/50 px-6 py-5">
            <h2 className="text-lg font-semibold text-zinc-900">All Categories</h2>
          </div>
          
          {loading ? (
            <div className="p-10 flex justify-center">
              <div className="h-6 w-6 animate-spin rounded-full border-2 border-pink-500 border-t-transparent"></div>
            </div>
          ) : categories.length === 0 ? (
            <div className="p-10 text-center text-zinc-500">
              No categories found. Create one to get started.
            </div>
          ) : (
            <div className="divide-y divide-zinc-100">
              {categories.map((category) => (
                <div key={category.id} className="p-4 sm:p-6 transition-colors hover:bg-zinc-50/50">
                  <div className="flex flex-col sm:flex-row sm:items-center items-start justify-between gap-4 sm:gap-0">
                    {editingCategoryId === category.id ? (
                      <div className="flex flex-col gap-2 flex-1 mr-4">
                        <div className="flex items-center gap-4">
                          <div className="relative">
                            {editingCategoryImage ? (
                              <img src={editingCategoryImage} alt="Preview" className="h-12 w-12 rounded-lg object-cover border border-zinc-200" />
                            ) : (
                              <div className="h-12 w-12 rounded-lg bg-zinc-100 flex items-center justify-center text-zinc-400 border border-zinc-200 text-xs">No Img</div>
                            )}
                            <label className="absolute -bottom-2 -right-2 bg-white rounded-full p-1 shadow border border-zinc-200 cursor-pointer hover:bg-zinc-50 transition-colors">
                              <Edit2 size={10} className="text-zinc-600" />
                              <input type="file" accept="image/*" onChange={handleEditImageUpload} disabled={isUploadingImage} className="hidden" />
                            </label>
                          </div>
                          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 flex-1 w-full mt-2 sm:mt-0">
                            <input
                              type="text"
                              value={editingCategoryName}
                              onChange={(e) => setEditingCategoryName(e.target.value)}
                              className="flex-1 rounded-lg border border-zinc-300 px-3 py-1.5 text-sm text-zinc-900 focus:border-pink-500 focus:outline-none"
                              autoFocus
                            />
                            <Button size="sm" onClick={() => handleEditCategory(category.id)} disabled={isUploadingImage}>Save</Button>
                            <Button size="sm" variant="ghost" onClick={() => setEditingCategoryId(null)}>Cancel</Button>
                          </div>
                        </div>
                        {isUploadingImage && <span className="text-xs text-rose-600 ml-16">Uploading...</span>}
                      </div>
                    ) : (
                      <div className="flex items-center gap-4">
                        {category.image ? (
                           <img src={category.image} alt={category.name} className="h-12 w-12 rounded-lg object-cover border border-zinc-200" />
                        ) : (
                           <div className="h-12 w-12 rounded-lg bg-zinc-100 flex items-center justify-center text-zinc-400 border border-zinc-200 text-xs">No Img</div>
                        )}
                        <div>
                          <h3 className="font-semibold text-zinc-900 text-lg">{category.name}</h3>
                          <p className="text-sm text-zinc-400">/{category.slug}</p>
                        </div>
                      </div>
                    )}

                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setExpandedId(expandedId === category.id ? null : category.id)}
                        className="text-zinc-500"
                      >
                        {category.subcategories?.length || 0} Subcategories
                        {expandedId === category.id ? <ChevronUp size={16} className="ml-1" /> : <ChevronDown size={16} className="ml-1" />}
                      </Button>
                      
                      {editingCategoryId !== category.id && (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            setEditingCategoryId(category.id);
                            setEditingCategoryName(category.name);
                            setEditingCategoryImage(category.image || "");
                          }}
                          className="text-zinc-500 hover:text-rose-600 hover:bg-pink-50"
                        >
                          <Edit2 size={16} />
                        </Button>
                      )}

                      <Button variant="rose-ghost" size="sm" onClick={() => handleDeleteCategory(category.id)}>
                        <Trash2 size={18} />
                      </Button>
                    </div>
                  </div>

                  {/* Subcategories Area */}
                  {expandedId === category.id && (
                    <div className="mt-4 pl-4 border-l-2 border-pink-200 space-y-3">
                      {(category.subcategories || []).length > 0 ? (
                        <ul className="space-y-2">
                          {category.subcategories.map((sub) => (
                            <li key={sub.id} className="flex items-center justify-between bg-white border border-zinc-100 rounded-lg p-3 shadow-sm">
                              {editingSubcatId === sub.id ? (
                                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 flex-1 mr-4">
                                  <input
                                    type="text"
                                    value={editingSubcatName}
                                    onChange={(e) => setEditingSubcatName(e.target.value)}
                                    className="flex-1 rounded-lg border border-zinc-300 px-3 py-1 text-sm text-zinc-900 focus:border-pink-500 focus:outline-none"
                                    autoFocus
                                  />
                                  <Button size="sm" onClick={() => handleEditSubcategory(category.id, sub.id)} className="h-7 px-2 text-xs">Save</Button>
                                  <Button size="sm" variant="ghost" onClick={() => setEditingSubcatId(null)} className="h-7 px-2 text-xs">Cancel</Button>
                                </div>
                              ) : (
                                <div>
                                  <span className="font-medium text-zinc-800 text-sm">{sub.name}</span>
                                  <span className="text-xs text-zinc-400 ml-2">/{sub.slug}</span>
                                </div>
                              )}
                              
                              <div className="flex items-center gap-2">
                                {editingSubcatId !== sub.id && (
                                  <button 
                                    onClick={() => {
                                      setEditingSubcatId(sub.id);
                                      setEditingSubcatName(sub.name);
                                    }}
                                    className="text-zinc-400 hover:text-rose-600 transition-colors"
                                  >
                                    <Edit2 size={14} />
                                  </button>
                                )}
                                <Button variant="rose-ghost" size="sm" onClick={() => handleDeleteSubcategory(category.id, sub.id)} className="h-7 px-2">
                                  <Trash2 size={14} />
                                </Button>
                              </div>
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p className="text-sm text-zinc-500 italic">No subcategories added yet.</p>
                      )}

                      {/* Add Subcategory Controls */}
                      {addingSubcatTo === category.id ? (
                        <div className="flex flex-col sm:flex-row gap-2 mt-3 items-stretch sm:items-center">
                          <input
                            type="text"
                            value={newSubcatName}
                            onChange={(e) => setNewSubcatName(e.target.value)}
                            placeholder="Subcategory Name..."
                            className="flex-1 rounded-lg border border-zinc-300 px-3 py-1.5 text-sm text-zinc-900 focus:border-pink-500 focus:outline-none"
                            autoFocus
                          />
                          <Button size="sm" onClick={() => handleAddSubcategory(category.id)}>Save</Button>
                          <Button size="sm" variant="ghost" onClick={() => { setAddingSubcatTo(null); setNewSubcatName(""); }}>Cancel</Button>
                        </div>
                      ) : (
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => setAddingSubcatTo(category.id)}
                          className="mt-3 text-xs border-dashed text-zinc-500"
                        >
                          <Plus size={14} className="mr-1" /> Add Subcategory
                        </Button>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}
