import React, { useState } from 'react';
import { Button } from '../ui/button';
import { productService } from '../../services/productService';
import type { Category, Subcategory } from '../../types/product';

interface CreateCategoryProps {
  onCancel?: () => void;
  onCreated?: (categoryId: string) => void;
}

const emptyCategory: Partial<Category> = {
  subcategories: []
};

const CreateCategory: React.FC<CreateCategoryProps> = ({ onCancel, onCreated }) => {
  const [form, setForm] = useState<Partial<Category>>({ ...emptyCategory });
  const [subcategoryInput, setSubcategoryInput] = useState({ name: '', description: '' });
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const updateForm = (patch: Partial<Category>) => {
    setForm(prev => ({ ...prev, ...patch }));
  };

  const addSubcategory = () => {
    if (!subcategoryInput.name.trim()) return;
    
    const newSubcategory: Subcategory = {
      id: subcategoryInput.name.toLowerCase().replace(/\s+/g, '-'),
      name: subcategoryInput.name.trim(),
      description: subcategoryInput.description.trim()
    };

    const subcategories = [...(form.subcategories || []), newSubcategory];
    updateForm({ subcategories });
    setSubcategoryInput({ name: '', description: '' });
  };

  const removeSubcategory = (index: number) => {
    const subcategories = [...(form.subcategories || [])];
    subcategories.splice(index, 1);
    updateForm({ subcategories });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setIsSubmitting(true);

    try {
      if (!form.name?.trim()) {
        throw new Error('Category name is required');
      }

      if (!form.id?.trim()) {
        throw new Error('Category ID is required');
      }

      const payload: Category = {
        id: String(form.id).trim(),
        name: String(form.name).trim(),
        description: String(form.description || ''),
        image: String(form.image || ''),
        subcategories: form.subcategories || []
      };

      const created = productService.addCategory(payload);
      setSuccess(`Category '${created.name}' created successfully.`);
      onCreated?.(created.id);
      setForm({ ...emptyCategory });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create category');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="py-20 bg-gray-950">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 md:p-10">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl md:text-3xl font-bold text-white">
              Create <span className="text-orange-500">Category</span>
            </h2>
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
              <Button 
                onClick={(e) => handleSubmit(e as React.FormEvent)} 
                disabled={isSubmitting} 
                className="bg-orange-500 hover:bg-orange-600 text-white"
              >
                {isSubmitting ? 'Saving...' : 'Save Category'}
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

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Category ID *
                </label>
                <input
                  value={String(form.id || '')}
                  onChange={e => updateForm({ id: e.target.value })}
                  placeholder="e.g., fitness-equipment"
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Category Name *
                </label>
                <input
                  value={String(form.name || '')}
                  onChange={e => updateForm({ name: e.target.value })}
                  placeholder="e.g., Fitness Equipment"
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Description
              </label>
              <textarea
                value={String(form.description || '')}
                onChange={e => updateForm({ description: e.target.value })}
                rows={3}
                placeholder="Describe this category..."
                className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Category Image URL
              </label>
              <input
                value={String(form.image || '')}
                onChange={e => updateForm({ image: e.target.value })}
                placeholder="e.g., /categories/fitness-category.jpg"
                className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              />
            </div>

            {/* Subcategories */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-4">
                Subcategories
              </label>
              
              <div className="bg-gray-800 border border-gray-700 rounded-lg p-4 mb-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <input
                      value={subcategoryInput.name}
                      onChange={e => setSubcategoryInput(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="Subcategory name"
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <input
                      value={subcategoryInput.description}
                      onChange={e => setSubcategoryInput(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="Subcategory description"
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    />
                  </div>
                </div>
                <Button 
                  type="button" 
                  onClick={addSubcategory}
                  variant="outline"
                  className="border-gray-600 text-gray-300 hover:text-white hover:bg-gray-700"
                >
                  Add Subcategory
                </Button>
              </div>

              {/* Subcategories List */}
              {form.subcategories && form.subcategories.length > 0 && (
                <div className="space-y-2">
                  {form.subcategories.map((subcategory, index) => (
                    <div 
                      key={index} 
                      className="flex items-center justify-between bg-gray-800 border border-gray-700 rounded-lg p-3"
                    >
                      <div>
                        <div className="text-sm font-medium text-white">{subcategory.name}</div>
                        {subcategory.description && (
                          <div className="text-xs text-gray-400">{subcategory.description}</div>
                        )}
                      </div>
                      <Button
                        type="button"
                        size="sm"
                        variant="ghost"
                        onClick={() => removeSubcategory(index)}
                        className="text-red-400 hover:text-red-300"
                      >
                        Remove
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="flex justify-end">
              <Button 
                type="submit" 
                disabled={isSubmitting} 
                className="bg-orange-500 hover:bg-orange-600 text-white"
              >
                {isSubmitting ? 'Creating...' : 'Create Category'}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </section>
  );
};

export default CreateCategory;
