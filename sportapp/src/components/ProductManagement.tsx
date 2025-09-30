import React, { useState, useMemo, useEffect } from 'react';
import { 
  Package, 
  Plus, 
  Search, 
  Filter, 
  Edit, 
  Trash2, 
  Eye,
  Star,
  DollarSign
} from 'lucide-react';
import { Button } from './ui/button';
import { CategoryService } from '../services/categoryService';
import { productService } from '../services/productService';
import CreateProduct from './admin/CreateProduct';
import type { Product, Category as ProductCategory } from '../types/product';
import type { Category } from '../types/category';

type ProductManagementView = 'list' | 'create' | 'edit';

const ProductManagement: React.FC = () => {
  const [currentView, setCurrentView] = useState<ProductManagementView>('list');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);

  const products = productService.getAllProducts();

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
        const convertedCategories: Category[] = localCategories.map((cat: ProductCategory) => ({
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

  // Filter products based on search and category
  const filteredProducts = useMemo(() => {
    let filtered = products;

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter((product: Product) => 
        product.name.toLowerCase().includes(query) ||
        product.brand.toLowerCase().includes(query) ||
        product.category.toLowerCase().includes(query) ||
        product.description.toLowerCase().includes(query)
      );
    }

    if (selectedCategory) {
      filtered = filtered.filter((product: Product) => product.category === selectedCategory);
    }

    return filtered;
  }, [products, searchQuery, selectedCategory]);

  const handleDeleteProduct = (productId: string) => {
    if (deleteConfirm === productId) {
      productService.deleteProduct(productId);
      setDeleteConfirm(null);
      // Force re-render by updating state
      setSearchQuery(prev => prev + ' ');
      setSearchQuery(prev => prev.trim());
    } else {
      setDeleteConfirm(productId);
    }
  };

  const handleEditProduct = (product: Product) => {
    setEditingProduct(product);
    setCurrentView('edit');
  };

  const renderProductList = () => (
    <div className="p-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Product Management</h1>
          <p className="text-gray-400">Manage your product catalog</p>
        </div>
        <Button 
          onClick={() => setCurrentView('create')}
          className="bg-orange-500 hover:bg-orange-600 text-white"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Product
        </Button>
      </div>

      {/* Search and Filter Bar */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 mb-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            />
          </div>
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              title="Filter products by category"
              className="pl-10 pr-8 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent appearance-none min-w-[200px]"
            >
              <option value="">All Categories</option>
              {categories.map(category => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Products Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Total Products</p>
              <p className="text-2xl font-bold text-white">{products.length}</p>
            </div>
            <Package className="h-8 w-8 text-orange-500" />
          </div>
        </div>
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">In Stock</p>
              <p className="text-2xl font-bold text-white">
                {products.filter((p: Product) => p.inStock).length}
              </p>
            </div>
            <Eye className="h-8 w-8 text-green-500" />
          </div>
        </div>
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Filtered Results</p>
              <p className="text-2xl font-bold text-white">{filteredProducts.length}</p>
            </div>
            <Filter className="h-8 w-8 text-blue-500" />
          </div>
        </div>
      </div>

      {/* Products Table */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-800 border-b border-gray-700">
              <tr>
                <th className="text-left py-4 px-6 text-gray-300 font-medium">Product</th>
                <th className="text-left py-4 px-6 text-gray-300 font-medium">Category</th>
                <th className="text-left py-4 px-6 text-gray-300 font-medium">Price</th>
                <th className="text-left py-4 px-6 text-gray-300 font-medium">Stock</th>
                <th className="text-left py-4 px-6 text-gray-300 font-medium">Rating</th>
                <th className="text-left py-4 px-6 text-gray-300 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-gray-400">
                    {searchQuery || selectedCategory ? 'No products match your filters' : 'No products found'}
                  </td>
                </tr>
              ) : (
                filteredProducts.map((product: Product) => (
                  <tr key={product.id} className="border-b border-gray-800 hover:bg-gray-800/50">
                    <td className="py-4 px-6">
                      <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 bg-gray-700 rounded-lg flex items-center justify-center overflow-hidden">
                          {product.images && product.images.length > 0 ? (
                            <img 
                              src={product.images[0]} 
                              alt={product.name}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                target.style.display = 'none';
                                target.nextElementSibling?.classList.remove('hidden');
                              }}
                            />
                          ) : null}
                          <Package className="h-6 w-6 text-gray-400" />
                        </div>
                        <div>
                          <p className="text-white font-medium">{product.name}</p>
                          <p className="text-gray-400 text-sm">{product.brand}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-700 text-gray-300">
                        {categories.find(c => c.id === product.category)?.name || product.category}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center space-x-1">
                        <DollarSign className="h-4 w-4 text-green-500" />
                        <span className="text-white font-medium">{product.price.toFixed(2)}</span>
                        {product.originalPrice && product.originalPrice > product.price && (
                          <span className="text-gray-400 text-sm line-through ml-2">
                            ${product.originalPrice.toFixed(2)}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center space-x-2">
                        <div className={`w-2 h-2 rounded-full ${product.inStock ? 'bg-green-500' : 'bg-red-500'}`}></div>
                        <span className={`text-sm ${product.inStock ? 'text-green-400' : 'text-red-400'}`}>
                          {product.inStock ? `${product.stockCount || 0} in stock` : 'Out of stock'}
                        </span>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center space-x-1">
                        <Star className="h-4 w-4 text-yellow-500 fill-current" />
                        <span className="text-white">{product.rating.toFixed(1)}</span>
                        <span className="text-gray-400 text-sm">({product.reviewCount})</span>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center space-x-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleEditProduct(product)}
                          className="border-gray-600 text-gray-300 hover:text-white hover:bg-gray-700"
                        >
                          <Edit className="h-3 w-3" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDeleteProduct(product.id)}
                          className={`border-gray-600 hover:bg-gray-700 ${
                            deleteConfirm === product.id 
                              ? 'text-red-400 border-red-500 hover:bg-red-500/10' 
                              : 'text-gray-300 hover:text-white'
                          }`}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                        {deleteConfirm === product.id && (
                          <span className="text-xs text-red-400 ml-2">Click again to confirm</span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const renderCreateProduct = () => (
    <CreateProduct 
      onCancel={() => setCurrentView('list')}
      onCreated={() => setCurrentView('list')}
    />
  );

  const renderEditProduct = () => {
    if (!editingProduct) return null;
    
    // For now, we'll use the same CreateProduct component for editing
    // In a real app, you'd want a separate EditProduct component or modify CreateProduct to handle editing
    return (
      <div className="p-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-white mb-2">
            Edit Product: <span className="text-orange-500">{editingProduct.name}</span>
          </h1>
          <p className="text-gray-400">Modify product details</p>
        </div>
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
          <p className="text-gray-300 mb-4">
            Edit functionality will be implemented here. For now, you can delete and recreate the product.
          </p>
          <div className="flex gap-4">
            <Button 
              onClick={() => setCurrentView('list')}
              variant="outline"
              className="border-gray-600 text-gray-300 hover:text-white hover:bg-gray-800"
            >
              Back to List
            </Button>
            <Button 
              onClick={() => setCurrentView('create')}
              className="bg-orange-500 hover:bg-orange-600 text-white"
            >
              Create New Instead
            </Button>
          </div>
        </div>
      </div>
    );
  };

  switch (currentView) {
    case 'create':
      return renderCreateProduct();
    case 'edit':
      return renderEditProduct();
    default:
      return renderProductList();
  }
};

export default ProductManagement;
