import React, { useState } from 'react';
import { 
  Package, 
  Users, 
  ShoppingCart, 
  TrendingUp, 
  Plus, 
  Search,
  Filter,
  MoreVertical,
  Edit,
  Trash2,
  Eye
} from 'lucide-react';
import { Button } from '../ui/button';
import { productService } from '../../services/productService';
import CreateProduct from './CreateProduct';
import CreateCategory from './CreateCategory';

type AdminView = 'dashboard' | 'products' | 'categories' | 'users' | 'orders' | 'create-product' | 'create-category';

const AdminDashboard: React.FC = () => {
  const [currentView, setCurrentView] = useState<AdminView>('dashboard');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');

  const products = productService.getAllProducts();
  const categories = productService.getCategories();

  // Mock data for dashboard stats
  const stats = {
    totalProducts: products.length,
    totalCategories: categories.length,
    totalUsers: 1247, // Mock data
    totalOrders: 856, // Mock data
    revenue: 45678.90, // Mock data
    pendingOrders: 23 // Mock data
  };

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         product.brand.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = !selectedCategory || product.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const renderSidebar = () => (
    <div className="w-64 bg-gray-900 border-r border-gray-800 min-h-screen">
      <div className="p-6">
        <h2 className="text-xl font-bold text-white mb-8">
          Admin <span className="text-orange-500">Dashboard</span>
        </h2>
        
        <nav className="space-y-2">
          <button
            onClick={() => setCurrentView('dashboard')}
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left transition-colors ${
              currentView === 'dashboard' 
                ? 'bg-orange-500 text-white' 
                : 'text-gray-300 hover:text-white hover:bg-gray-800'
            }`}
          >
            <TrendingUp className="h-5 w-5" />
            <span>Dashboard</span>
          </button>
          
          <button
            onClick={() => setCurrentView('products')}
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left transition-colors ${
              currentView === 'products' 
                ? 'bg-orange-500 text-white' 
                : 'text-gray-300 hover:text-white hover:bg-gray-800'
            }`}
          >
            <Package className="h-5 w-5" />
            <span>Products</span>
          </button>
          
          <button
            onClick={() => setCurrentView('categories')}
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left transition-colors ${
              currentView === 'categories' 
                ? 'bg-orange-500 text-white' 
                : 'text-gray-300 hover:text-white hover:bg-gray-800'
            }`}
          >
            <Filter className="h-5 w-5" />
            <span>Categories</span>
          </button>
          
          <button
            onClick={() => setCurrentView('users')}
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left transition-colors ${
              currentView === 'users' 
                ? 'bg-orange-500 text-white' 
                : 'text-gray-300 hover:text-white hover:bg-gray-800'
            }`}
          >
            <Users className="h-5 w-5" />
            <span>Users</span>
          </button>
          
          <button
            onClick={() => setCurrentView('orders')}
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left transition-colors ${
              currentView === 'orders' 
                ? 'bg-orange-500 text-white' 
                : 'text-gray-300 hover:text-white hover:bg-gray-800'
            }`}
          >
            <ShoppingCart className="h-5 w-5" />
            <span>Orders</span>
          </button>
        </nav>
      </div>
    </div>
  );

  const renderDashboardOverview = () => (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Dashboard Overview</h1>
        <p className="text-gray-400">Welcome to your admin dashboard</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Total Products</p>
              <p className="text-2xl font-bold text-white">{stats.totalProducts}</p>
            </div>
            <Package className="h-8 w-8 text-orange-500" />
          </div>
        </div>

        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Categories</p>
              <p className="text-2xl font-bold text-white">{stats.totalCategories}</p>
            </div>
            <Filter className="h-8 w-8 text-orange-500" />
          </div>
        </div>

        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Total Users</p>
              <p className="text-2xl font-bold text-white">{stats.totalUsers.toLocaleString()}</p>
            </div>
            <Users className="h-8 w-8 text-orange-500" />
          </div>
        </div>

        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Total Orders</p>
              <p className="text-2xl font-bold text-white">{stats.totalOrders}</p>
            </div>
            <ShoppingCart className="h-8 w-8 text-orange-500" />
          </div>
        </div>
      </div>

      {/* Revenue and Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Revenue Overview</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-400">Total Revenue</span>
              <span className="text-2xl font-bold text-green-500">${stats.revenue.toLocaleString()}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-400">Pending Orders</span>
              <span className="text-lg font-semibold text-orange-500">{stats.pendingOrders}</span>
            </div>
          </div>
        </div>

        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Quick Actions</h3>
          <div className="space-y-3">
            <Button 
              onClick={() => setCurrentView('create-product')}
              className="w-full bg-orange-500 hover:bg-orange-600 text-white justify-start"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add New Product
            </Button>
            <Button 
              onClick={() => setCurrentView('create-category')}
              variant="outline"
              className="w-full border-gray-600 text-gray-300 hover:text-white hover:bg-gray-800 justify-start"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add New Category
            </Button>
          </div>
        </div>
      </div>
    </div>
  );

  const renderProductsView = () => (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Products</h1>
          <p className="text-gray-400">Manage your product catalog</p>
        </div>
        <Button 
          onClick={() => setCurrentView('create-product')}
          className="bg-orange-500 hover:bg-orange-600 text-white"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Product
        </Button>
      </div>

      {/* Search and Filter */}
      <div className="flex gap-4 mb-6">
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
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          aria-label="Filter by category"
          className="px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
        >
          <option value="">All Categories</option>
          {categories.map(category => (
            <option key={category.id} value={category.id}>{category.name}</option>
          ))}
        </select>
      </div>

      {/* Products Table */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-800">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Product</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Category</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Price</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Stock</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {filteredProducts.map((product) => (
                <tr key={product.id} className="hover:bg-gray-800/50">
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <div className="h-10 w-10 bg-gray-700 rounded-lg mr-4 flex items-center justify-center">
                        <Package className="h-5 w-5 text-gray-400" />
                      </div>
                      <div>
                        <div className="text-sm font-medium text-white">{product.name}</div>
                        <div className="text-sm text-gray-400">{product.brand}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-300">
                    {categories.find(c => c.id === product.category)?.name || product.category}
                  </td>
                  <td className="px-6 py-4 text-sm text-white font-medium">
                    ${product.price.toFixed(2)}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-300">
                    {product.stockCount}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      product.inStock 
                        ? 'bg-green-500/20 text-green-400' 
                        : 'bg-red-500/20 text-red-400'
                    }`}>
                      {product.inStock ? 'In Stock' : 'Out of Stock'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-2">
                      <Button size="sm" variant="ghost" className="text-gray-400 hover:text-white">
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="ghost" className="text-gray-400 hover:text-white">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="ghost" className="text-red-400 hover:text-red-300">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const renderCategoriesView = () => (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Categories</h1>
          <p className="text-gray-400">Manage product categories</p>
        </div>
        <Button 
          onClick={() => setCurrentView('create-category')}
          className="bg-orange-500 hover:bg-orange-600 text-white"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Category
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {categories.map((category) => (
          <div key={category.id} className="bg-gray-900 border border-gray-800 rounded-xl p-6">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-lg font-semibold text-white">{category.name}</h3>
              <Button size="sm" variant="ghost" className="text-gray-400 hover:text-white">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </div>
            <p className="text-gray-400 text-sm mb-4">{category.description}</p>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-500">
                {productService.getProductsByCategory(category.id).length} products
              </span>
              <div className="flex space-x-2">
                <Button size="sm" variant="ghost" className="text-gray-400 hover:text-white">
                  <Edit className="h-4 w-4" />
                </Button>
                <Button size="sm" variant="ghost" className="text-red-400 hover:text-red-300">
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderPlaceholderView = (title: string, description: string) => (
    <div className="p-8 flex items-center justify-center min-h-[60vh]">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-white mb-2">{title}</h1>
        <p className="text-gray-400 mb-6">{description}</p>
        <p className="text-sm text-gray-500">This feature will be implemented soon.</p>
      </div>
    </div>
  );

  const renderContent = () => {
    switch (currentView) {
      case 'dashboard':
        return renderDashboardOverview();
      case 'products':
        return renderProductsView();
      case 'categories':
        return renderCategoriesView();
      case 'users':
        return renderPlaceholderView('Users Management', 'Manage user accounts and permissions');
      case 'orders':
        return renderPlaceholderView('Orders Management', 'View and manage customer orders');
      case 'create-product':
        return (
          <CreateProduct 
            onCancel={() => setCurrentView('products')}
            onCreated={() => setCurrentView('products')}
          />
        );
      case 'create-category':
        return (
          <CreateCategory 
            onCancel={() => setCurrentView('categories')}
            onCreated={() => setCurrentView('categories')}
          />
        );
      default:
        return renderDashboardOverview();
    }
  };

  return (
    <div className="min-h-screen bg-black text-white flex">
      {renderSidebar()}
      <div className="flex-1 overflow-auto">
        {renderContent()}
      </div>
    </div>
  );
};

export default AdminDashboard;
