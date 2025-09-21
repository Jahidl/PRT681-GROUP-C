import './App.css'
import { useState } from 'react'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import BackToTop from './components/BackToTop'
import Hero from './components/Hero'
import FeaturedProducts from './components/FeaturedProducts'
import Categories from './components/Categories'
import CategoryPage from './components/CategoryPage'
import ProductGrid from './components/ProductGrid'
import ProductDetail from './components/ProductDetail'
import Cart from './components/Cart'
import AuthModal from './components/AuthModal'
import AdminDashboard from './components/admin/AdminDashboard'
import CategoryManagement from './components/CategoryManagement'
import { CartProvider } from './contexts/CartContext'
import { AuthProvider } from './contexts/AuthContext'
import { productService } from './services/productService'

type Page = 'home' | 'category' | 'all-products' | 'product-detail' | 'admin' | 'category-management'

function AppContent() {
  const [currentPage, setCurrentPage] = useState<Page>('home')
  const [selectedCategory, setSelectedCategory] = useState<string>('')
  const [selectedProductId, setSelectedProductId] = useState<string>('')

  const renderPage = () => {
    switch (currentPage) {
      case 'admin':
        return <AdminDashboard />
      case 'category-management':
        return <CategoryManagement />
      case 'category':
        return (
          <CategoryPage 
            categoryId={selectedCategory}
            onHomeClick={() => setCurrentPage('home')}
            onProductClick={(productId) => {
              setSelectedProductId(productId);
              setCurrentPage('product-detail');
            }}
          />
        )
      case 'all-products':
        return (
          <div className="min-h-screen bg-black text-white pt-20">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
              <ProductGrid 
                products={productService.getAllProducts()} 
                title="All Products"
                showFilters={true}
                showSorting={true}
                onProductClick={(productId) => {
                  setSelectedProductId(productId);
                  setCurrentPage('product-detail');
                }}
              />
            </div>
          </div>
        )
      case 'product-detail':
        return (
          <ProductDetail 
            productId={selectedProductId}
            onHomeClick={() => setCurrentPage('home')}
            onCategoryClick={(categoryId) => {
              setSelectedCategory(categoryId);
              setCurrentPage('category');
            }}
            onProductClick={(productId) => {
              setSelectedProductId(productId);
              setCurrentPage('product-detail');
            }}
          />
        )
      default:
        return (
          <>
            <Hero />
            <FeaturedProducts 
              onProductClick={(productId) => {
                setSelectedProductId(productId);
                setCurrentPage('product-detail');
              }}
              onViewAllClick={() => setCurrentPage('all-products')}
            />
            <Categories 
              onCategoryClick={(categoryId) => {
                setSelectedCategory(categoryId);
                setCurrentPage('category');
              }}
              onViewAllClick={() => setCurrentPage('all-products')}
            />
          </>
        )
    }
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <Navbar 
        onHomeClick={() => setCurrentPage('home')}
        onAllProductsClick={() => setCurrentPage('all-products')}
        onCategoryClick={(categoryId) => {
          setSelectedCategory(categoryId);
          setCurrentPage('category');
        }}
        onAdminClick={() => setCurrentPage('admin')}
      />
    
      {/* Navigation Demo - Temporary for testing */}
      {currentPage === 'home' && (
        <div className="fixed top-20 right-4 z-50 bg-gray-900 border border-gray-700 rounded-lg p-4 space-y-2">
          <h3 className="text-sm font-semibold text-orange-500 mb-2">Demo Navigation</h3>
          <button
            onClick={() => setCurrentPage('all-products')}
            className="block w-full text-left text-xs text-gray-300 hover:text-white px-2 py-1 rounded hover:bg-gray-800"
          >
            View All Products
          </button>
          <button
            onClick={() => {
              setSelectedCategory('fitness')
              setCurrentPage('category')
            }}
            className="block w-full text-left text-xs text-gray-300 hover:text-white px-2 py-1 rounded hover:bg-gray-800"
          >
            Fitness Category
          </button>
          <button
            onClick={() => {
              setSelectedCategory('team-sports')
              setCurrentPage('category')
            }}
            className="block w-full text-left text-xs text-gray-300 hover:text-white px-2 py-1 rounded hover:bg-gray-800"
          >
            Team Sports Category
          </button>
          <button
            onClick={() => {
              setSelectedProductId('basketball-pro-1')
              setCurrentPage('product-detail')
            }}
            className="block w-full text-left text-xs text-gray-300 hover:text-white px-2 py-1 rounded hover:bg-gray-800"
          >
            Product Detail (Basketball)
          </button>
          <button
            onClick={() => setCurrentPage('admin')}
            className="block w-full text-left text-xs text-gray-300 hover:text-white px-2 py-1 rounded hover:bg-gray-800"
          >
            Admin Dashboard
          </button>
          <button
            onClick={() => setCurrentPage('category-management')}
            className="block w-full text-left text-xs text-gray-300 hover:text-white px-2 py-1 rounded hover:bg-gray-800"
          >
            Category Management
          </button>
        </div>
      )}

      {/* Back to Home button for other pages */}
      {currentPage !== 'home' && (
        <div className="fixed top-20 right-4 z-50">
          <button
            onClick={() => setCurrentPage('home')}
            className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg text-sm font-medium"
          >
            ← Back to Home
          </button>
        </div>
      )}
      
      {/* Page Content */}
      <main className={currentPage === 'admin' || currentPage === 'category-management' ? 'pt-16' : ''}>
        {renderPage()}
      </main>
      
      {/* Cart Component */}
      <Cart 
        onProductClick={(productId) => {
          setSelectedProductId(productId);
          setCurrentPage('product-detail');
        }}
      />
      
      {/* Authentication Modal */}
      <AuthModal />
      
      {currentPage !== 'admin' && currentPage !== 'category-management' && <Footer />}
      {currentPage !== 'admin' && currentPage !== 'category-management' && <BackToTop />}
    </div>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <AppContent />
      </CartProvider>
    </AuthProvider>
  )
}
