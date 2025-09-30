import React, { useState } from 'react';
import { 
  Package, 
  Users, 
  ShoppingCart, 
  TrendingUp, 
  Plus, 
  Filter,
  Menu,
  X
} from 'lucide-react';
import { Button } from '../ui/button';
import { productService } from '../../services/productService';
import CreateProduct from './CreateProduct';
import CreateCategory from './CreateCategory';
import CsvUpload from './CsvUpload';
import CategoryManagement from '../CategoryManagement';
import ProductManagement from '../ProductManagement';

type AdminView = 'dashboard' | 'products' | 'categories' | 'users' | 'orders' | 'create-product' | 'create-category' | 'csv-upload';

const AdminDashboard: React.FC = () => {
  const [currentView, setCurrentView] = useState<AdminView>('dashboard');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

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

  const renderSidebar = () => (
    <div className={`${sidebarCollapsed ? 'w-16' : 'w-64'} bg-gray-900 border-r border-gray-800 min-h-screen transition-all duration-300`}>
      <div className={`${sidebarCollapsed ? 'p-4' : 'p-6'}`}>
        <div className="flex items-center justify-between mb-8">
          {!sidebarCollapsed && (
            <h2 className="text-xl font-bold text-white">
              Admin <span className="text-orange-500">Dashboard</span>
            </h2>
          )}
          <button
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className="text-gray-400 hover:text-white transition-colors p-1 rounded hover:bg-gray-800"
            title={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {sidebarCollapsed ? <Menu className="h-5 w-5" /> : <X className="h-5 w-5" />}
          </button>
        </div>
        
        <nav className="space-y-2">
          <button
            onClick={() => setCurrentView('dashboard')}
            className={`w-full flex items-center ${sidebarCollapsed ? 'justify-center px-2' : 'space-x-3 px-4'} py-3 rounded-lg text-left transition-colors ${
              currentView === 'dashboard' 
                ? 'bg-orange-500 text-white' 
                : 'text-gray-300 hover:text-white hover:bg-gray-800'
            }`}
            title={sidebarCollapsed ? 'Dashboard' : ''}
          >
            <TrendingUp className="h-5 w-5" />
            {!sidebarCollapsed && <span>Dashboard</span>}
          </button>
          
          <button
            onClick={() => setCurrentView('products')}
            className={`w-full flex items-center ${sidebarCollapsed ? 'justify-center px-2' : 'space-x-3 px-4'} py-3 rounded-lg text-left transition-colors ${
              currentView === 'products' 
                ? 'bg-orange-500 text-white' 
                : 'text-gray-300 hover:text-white hover:bg-gray-800'
            }`}
            title={sidebarCollapsed ? 'Products' : ''}
          >
            <Package className="h-5 w-5" />
            {!sidebarCollapsed && <span>Products</span>}
          </button>
          
          <button
            onClick={() => setCurrentView('categories')}
            className={`w-full flex items-center ${sidebarCollapsed ? 'justify-center px-2' : 'space-x-3 px-4'} py-3 rounded-lg text-left transition-colors ${
              currentView === 'categories' 
                ? 'bg-orange-500 text-white' 
                : 'text-gray-300 hover:text-white hover:bg-gray-800'
            }`}
            title={sidebarCollapsed ? 'Categories' : ''}
          >
            <Filter className="h-5 w-5" />
            {!sidebarCollapsed && <span>Categories</span>}
          </button>
          
          <button
            onClick={() => setCurrentView('users')}
            className={`w-full flex items-center ${sidebarCollapsed ? 'justify-center px-2' : 'space-x-3 px-4'} py-3 rounded-lg text-left transition-colors ${
              currentView === 'users' 
                ? 'bg-orange-500 text-white' 
                : 'text-gray-300 hover:text-white hover:bg-gray-800'
            }`}
            title={sidebarCollapsed ? 'Users' : ''}
          >
            <Users className="h-5 w-5" />
            {!sidebarCollapsed && <span>Users</span>}
          </button>
          
          <button
            onClick={() => setCurrentView('orders')}
            className={`w-full flex items-center ${sidebarCollapsed ? 'justify-center px-2' : 'space-x-3 px-4'} py-3 rounded-lg text-left transition-colors ${
              currentView === 'orders' 
                ? 'bg-orange-500 text-white' 
                : 'text-gray-300 hover:text-white hover:bg-gray-800'
            }`}
            title={sidebarCollapsed ? 'Orders' : ''}
          >
            <ShoppingCart className="h-5 w-5" />
            {!sidebarCollapsed && <span>Orders</span>}
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
              onClick={() => setCurrentView('csv-upload')}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white justify-start"
            >
              <Package className="h-4 w-4 mr-2" />
              Upload Products CSV
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

  const renderProductsView = () => <ProductManagement />;

  const renderCategoriesView = () => <CategoryManagement />;

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
      case 'csv-upload':
        return (
          <CsvUpload 
            onCancel={() => setCurrentView('products')}
            onUploaded={() => setCurrentView('products')}
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
