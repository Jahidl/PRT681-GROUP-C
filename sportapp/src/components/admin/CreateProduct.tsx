import React, { useMemo, useState, useEffect } from 'react';
import { Button } from '../ui/button';
import { productService } from '../../services/productService';
import { CategoryService } from '../../services/categoryService';
import type { Product } from '../../types/product';
import type { Category } from '../../types/category';

interface CreateProductProps {
  onCancel?: () => void;
  onCreated?: (productId: string) => void;
}

const emptyProduct: Partial<Product> = {
  images: [],
  features: [],
  specifications: {},
  tags: []
};

const CreateProduct: React.FC<CreateProductProps> = ({ onCancel, onCreated }) => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [form, setForm] = useState<Partial<Product>>({ ...emptyProduct });
  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const [featureInput, setFeatureInput] = useState('');
  const [tagInput, setTagInput] = useState('');
  const [specKey, setSpecKey] = useState('');
  const [specValue, setSpecValue] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Load categories from API
  useEffect(() => {
    const loadCategories = async () => {
      try {
        const data = await CategoryService.getCategories();
        setCategories(data);
      } catch (error) {
        console.error('Error loading categories:', error);
        // Fallback to local categories if API fails - convert ProductCategory to Category
        const localCategories = productService.getCategories();
        const convertedCategories: Category[] = localCategories.map(cat => ({
          id: cat.id,
          name: cat.name,
          description: cat.description,
          image: cat.image,
          isActive: true, // Default to active
          sortOrder: 0, // Default sort order
        }));
        setCategories(convertedCategories);
      }
    };

    loadCategories();
  }, []);

  const subcategories = useMemo(() => {
    return form.category ? productService.getSubcategories(form.category) : [];
  }, [form.category]);

  const updateForm = (patch: Partial<Product>) => {
    setForm(prev => ({ ...prev, ...patch }));
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      const newFiles = Array.from(files);
      setSelectedImages(prev => [...prev, ...newFiles]);
      
      // Convert files to URLs for preview and form data
      const imageUrls = newFiles.map(file => URL.createObjectURL(file));
      updateForm({ images: [...(form.images || []), ...imageUrls] });
    }
  };

  const removeImage = (index: number) => {
    const updatedImages = [...(form.images || [])];
    const updatedFiles = [...selectedImages];
    
    // Revoke the object URL to free memory
    if (updatedImages[index]?.startsWith('blob:')) {
      URL.revokeObjectURL(updatedImages[index]);
    }
    
    updatedImages.splice(index, 1);
    updatedFiles.splice(index, 1);
    
    updateForm({ images: updatedImages });
    setSelectedImages(updatedFiles);
  };

  const pushToList = (kind: 'features' | 'tags') => {
    if (kind === 'features' && featureInput.trim()) {
      updateForm({ features: [...(form.features || []), featureInput.trim()] });
      setFeatureInput('');
    }
    if (kind === 'tags' && tagInput.trim()) {
      updateForm({ tags: [...(form.tags || []), tagInput.trim()] });
      setTagInput('');
    }
  };

  const removeFromList = (kind: 'images' | 'features' | 'tags', index: number) => {
    const list = [...(form[kind] as string[] || [])];
    list.splice(index, 1);
    updateForm({ [kind]: list } as any);
  };

  const addSpecification = () => {
    if (!specKey.trim()) return;
    const specs = { ...(form.specifications || {}) };
    specs[specKey.trim()] = specValue.trim();
    updateForm({ specifications: specs });
    setSpecKey('');
    setSpecValue('');
  };

  const removeSpecification = (key: string) => {
    const specs = { ...(form.specifications || {}) };
    delete specs[key];
    updateForm({ specifications: specs });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setIsSubmitting(true);
    try {
      const payload: Product = {
        id: String(form.id || '').trim(),
        name: String(form.name || '').trim(),
        description: String(form.description || ''),
        price: Number(form.price ?? 0),
        originalPrice: form.originalPrice !== undefined ? Number(form.originalPrice) : undefined,
        category: String(form.category || ''),
        subcategory: String(form.subcategory || ''),
        brand: String(form.brand || ''),
        rating: Number(form.rating ?? 0),
        reviewCount: Number(form.reviewCount ?? 0),
        inStock: Boolean(form.inStock ?? true),
        stockCount: Number(form.stockCount ?? 0),
        images: form.images || [],
        features: form.features || [],
        specifications: form.specifications || {},
        tags: form.tags || [],
        sizes: form.sizes,
        colors: form.colors,
      };

      const created = productService.addProduct(payload);
      setSuccess(`Product '${created.name}' created.`);
      onCreated?.(created.id);
      
      // Reset form and clear images
      setForm({ ...emptyProduct });
      setSelectedImages([]);
      
      // Revoke all object URLs to free memory
      (form.images || []).forEach(img => {
        if (img.startsWith('blob:')) {
          URL.revokeObjectURL(img);
        }
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create product');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="py-20 bg-gray-950">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 md:p-10">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl md:text-3xl font-bold text-white">Create <span className="text-orange-500">Product</span></h2>
            <div className="flex items-center gap-3">
              {onCancel && (
                <Button
                  variant="outline"
                  onClick={onCancel}
                  className="border-gray-600 text-gray-300 hover:text-white hover:bg-gray-800"
                >
                  Cancel
                </Button>
              )}
              <Button onClick={handleSubmit as any} disabled={isSubmitting} className="bg-orange-500 hover:bg-orange-600 text-white">
                {isSubmitting ? 'Saving...' : 'Save Product'}
              </Button>
            </div>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
              <p className="text-sm text-red-400">{error}</p>
            </div>
          )}
          {success && (
            <div className="mb-4 p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
              <p className="text-sm text-green-400">{success}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
              <div className="md:col-span-4">
                <label className="block text-sm font-medium text-gray-300 mb-2">Product ID *</label>
                <input
                  value={String(form.id || '')}
                  onChange={e => updateForm({ id: e.target.value })}
                  placeholder="Unique ID (e.g., basketball-pro-2)"
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                />
              </div>
              <div className="md:col-span-8">
                <label className="block text-sm font-medium text-gray-300 mb-2">Name *</label>
                <input
                  value={String(form.name || '')}
                  onChange={e => updateForm({ name: e.target.value })}
                  placeholder="Product name"
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                />
              </div>

              <div className="md:col-span-12">
                <label className="block text-sm font-medium text-gray-300 mb-2">Description</label>
                <textarea
                  value={String(form.description || '')}
                  onChange={e => updateForm({ description: e.target.value })}
                  rows={4}
                  placeholder="Describe the product"
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                />
              </div>

              <div className="md:col-span-4">
                <label className="block text-sm font-medium text-gray-300 mb-2">Price *</label>
                <input
                  type="number"
                  step="0.01"
                  value={String(form.price ?? '')}
                  onChange={e => updateForm({ price: Number(e.target.value) })}
                  placeholder="0.00"
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                />
              </div>
              <div className="md:col-span-4">
                <label className="block text-sm font-medium text-gray-300 mb-2">Original Price</label>
                <input
                  type="number"
                  step="0.01"
                  value={String(form.originalPrice ?? '')}
                  onChange={e => updateForm({ originalPrice: Number(e.target.value) })}
                  placeholder="0.00"
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                />
              </div>
              <div className="md:col-span-4">
                <label className="block text-sm font-medium text-gray-300 mb-2">Brand</label>
                <input
                  value={String(form.brand || '')}
                  onChange={e => updateForm({ brand: e.target.value })}
                  placeholder="Brand"
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                />
              </div>

              <div className="md:col-span-6">
                <label className="block text-sm font-medium text-gray-300 mb-2">Category *</label>
                <select
                  value={String(form.category || '')}
                  onChange={e => updateForm({ category: e.target.value, subcategory: '' })}
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                >
                  <option value="">Select category</option>
                  {categories.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>
              <div className="md:col-span-6">
                <label className="block text-sm font-medium text-gray-300 mb-2">Subcategory</label>
                <select
                  value={String(form.subcategory || '')}
                  onChange={e => updateForm({ subcategory: e.target.value })}
                  disabled={!form.category}
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent disabled:opacity-50"
                >
                  <option value="">Select subcategory</option>
                  {subcategories.map(s => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>
              </div>

              <div className="md:col-span-4">
                <label className="block text-sm font-medium text-gray-300 mb-2">In Stock</label>
                <select
                  value={String(form.inStock ?? true)}
                  onChange={e => updateForm({ inStock: e.target.value === 'true' })}
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                >
                  <option value="true">Yes</option>
                  <option value="false">No</option>
                </select>
              </div>
              <div className="md:col-span-4">
                <label className="block text-sm font-medium text-gray-300 mb-2">Stock Count</label>
                <input
                  type="number"
                  value={String(form.stockCount ?? 0)}
                  onChange={e => updateForm({ stockCount: Number(e.target.value) })}
                  placeholder="0"
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                />
              </div>

              {/* Images */}
              <div className="md:col-span-12">
                <label className="block text-sm font-medium text-gray-300 mb-2">Product Images</label>
                <div className="space-y-4">
                  <div className="flex items-center justify-center w-full">
                    <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-600 border-dashed rounded-lg cursor-pointer bg-gray-800 hover:bg-gray-700 hover:border-gray-500 transition-colors">
                      <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        <svg className="w-8 h-8 mb-4 text-gray-400" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 16">
                          <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2"/>
                        </svg>
                        <p className="mb-2 text-sm text-gray-400">
                          <span className="font-semibold">Click to upload</span> or drag and drop
                        </p>
                        <p className="text-xs text-gray-500">PNG, JPG, JPEG, WebP (MAX. 10MB each)</p>
                      </div>
                      <input
                        type="file"
                        multiple
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                      />
                    </label>
                  </div>
                  
                  {/* Image Previews */}
                  {(form.images || []).length > 0 && (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {(form.images || []).map((img, i) => (
                        <div key={i} className="relative group">
                          <div className="aspect-square bg-gray-800 border border-gray-700 rounded-lg overflow-hidden">
                            <img 
                              src={img} 
                              alt={`Product image ${i + 1}`}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjMzc0MTUxIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzlDQTNBRiIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkltYWdlPC90ZXh0Pjwvc3ZnPg==';
                              }}
                            />
                          </div>
                          <button
                            type="button"
                            onClick={() => removeImage(i)}
                            className="absolute -top-2 -right-2 bg-red-500 hover:bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            ×
                          </button>
                          <p className="text-xs text-gray-400 mt-1 truncate">Image {i + 1}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Features */}
              <div className="md:col-span-12">
                <label className="block text-sm font-medium text-gray-300 mb-2">Features</label>
                <div className="flex gap-3">
                  <input
                    value={featureInput}
                    onChange={e => setFeatureInput(e.target.value)}
                    placeholder="e.g., Lightweight construction"
                    className="flex-1 px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  />
                  <Button type="button" variant="outline" onClick={() => pushToList('features')} className="border-gray-600 text-gray-300 hover:text-white hover:bg-gray-800">Add</Button>
                </div>
                <div className="mt-2 flex flex-wrap gap-2">
                  {(form.features || []).map((f, i) => (
                    <div key={i} className="text-xs text-gray-300 bg-gray-800 border border-gray-700 rounded px-2 py-1 flex items-center gap-2">
                      <span>{f}</span>
                      <button type="button" onClick={() => removeFromList('features', i)} className="text-red-400 hover:text-red-300">Remove</button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Specifications */}
              <div className="md:col-span-12">
                <label className="block text-sm font-medium text-gray-300 mb-2">Specifications</label>
                <div className="flex gap-3">
                  <input
                    value={specKey}
                    onChange={e => setSpecKey(e.target.value)}
                    placeholder="Key (e.g., weight)"
                    className="w-1/3 px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  />
                  <input
                    value={specValue}
                    onChange={e => setSpecValue(e.target.value)}
                    placeholder="Value (e.g., 10.6 oz)"
                    className="flex-1 px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  />
                  <Button type="button" variant="outline" onClick={addSpecification} className="border-gray-600 text-gray-300 hover:text-white hover:bg-gray-800">Add</Button>
                </div>
                <div className="mt-2 flex flex-wrap gap-2">
                  {Object.entries(form.specifications || {}).map(([k, v]) => (
                    <div key={k} className="text-xs text-gray-300 bg-gray-800 border border-gray-700 rounded px-2 py-1 flex items-center gap-2">
                      <span className="font-semibold">{k}:</span>
                      <span>{String(v)}</span>
                      <button type="button" onClick={() => removeSpecification(k)} className="text-red-400 hover:text-red-300">Remove</button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Tags */}
              <div className="md:col-span-12">
                <label className="block text-sm font-medium text-gray-300 mb-2">Tags</label>
                <div className="flex gap-3">
                  <input
                    value={tagInput}
                    onChange={e => setTagInput(e.target.value)}
                    placeholder="e.g., bestseller"
                    className="flex-1 px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  />
                  <Button type="button" variant="outline" onClick={() => pushToList('tags')} className="border-gray-600 text-gray-300 hover:text-white hover:bg-gray-800">Add</Button>
                </div>
                <div className="mt-2 flex flex-wrap gap-2">
                  {(form.tags || []).map((t, i) => (
                    <div key={i} className="text-xs text-gray-300 bg-gray-800 border border-gray-700 rounded px-2 py-1 flex items-center gap-2">
                      <span>{t}</span>
                      <button type="button" onClick={() => removeFromList('tags', i)} className="text-red-400 hover:text-red-300">Remove</button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Sizes and Colors */}
              <div className="md:col-span-6">
                <label className="block text-sm font-medium text-gray-300 mb-2">Sizes (comma separated)</label>
                <input
                  value={(form.sizes || []).join(', ')}
                  onChange={e => updateForm({ sizes: e.target.value.split(',').map(s => s.trim()).filter(Boolean) })}
                  placeholder="e.g., S, M, L, XL"
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                />
              </div>
              <div className="md:col-span-6">
                <label className="block text-sm font-medium text-gray-300 mb-2">Colors (comma separated)</label>
                <input
                  value={(form.colors || []).join(', ')}
                  onChange={e => updateForm({ colors: e.target.value.split(',').map(s => s.trim()).filter(Boolean) })}
                  placeholder="e.g., Black, Blue, Red"
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                />
              </div>
            </div>

            <div className="flex justify-end">
              <Button type="submit" disabled={isSubmitting} className="bg-orange-500 hover:bg-orange-600 text-white">
                {isSubmitting ? 'Saving...' : 'Create Product'}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </section>
  );
};

export default CreateProduct;
