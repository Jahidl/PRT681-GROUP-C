import React, { useState } from 'react';
import { Star, ShoppingCart, Heart, Eye, Filter, Grid, List } from 'lucide-react';
import { Button } from './ui/button';
import type { Product } from '../types/product';

interface ProductGridProps {
  products: Product[];
  title?: string;
  showFilters?: boolean;
  showSorting?: boolean;
  onProductClick?: (productId: string) => void;
}

const ProductCard: React.FC<{ product: Product; viewMode: 'grid' | 'list'; onProductClick?: (productId: string) => void }> = ({ product, viewMode, onProductClick }) => {
  const discountPercentage = product.originalPrice 
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;

  if (viewMode === 'list') {
    return (
      <div 
        className="group flex bg-gray-900 rounded-xl border border-gray-800 overflow-hidden hover:border-orange-500/50 transition-all duration-300 hover:shadow-xl hover:shadow-orange-500/10 cursor-pointer"
        onClick={() => onProductClick?.(product.id)}
      >
        {/* Product Image */}
        <div className="relative w-48 h-48 flex-shrink-0 overflow-hidden bg-gray-800">
          <img
            src={product.images[0]}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            onError={(e) => {
              e.currentTarget.src = `data:image/svg+xml;base64,${btoa(`
                <svg width="200" height="200" xmlns="http://www.w3.org/2000/svg">
                  <rect width="200" height="200" fill="#374151"/>
                  <text x="100" y="100" text-anchor="middle" fill="#9CA3AF" font-size="12" font-family="Arial">
                    ${product.name}
                  </text>
                </svg>
              `)}`;
            }}
          />
          
          {/* Badges */}
          <div className="absolute top-3 left-3 flex flex-col gap-2">
            {product.tags.includes('bestseller') && (
              <span className="bg-orange-500 text-white text-xs font-bold px-2 py-1 rounded">
                BESTSELLER
              </span>
            )}
            {product.tags.includes('new-arrival') && (
              <span className="bg-green-500 text-white text-xs font-bold px-2 py-1 rounded">
                NEW
              </span>
            )}
            {discountPercentage > 0 && (
              <span className="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded">
                -{discountPercentage}%
              </span>
            )}
          </div>
        </div>

        {/* Product Info */}
        <div className="flex-1 p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-gray-400 font-medium">{product.brand}</span>
              <span className="text-xs text-gray-400 capitalize">{product.category.replace('-', ' ')}</span>
            </div>
            
            <h3 className="font-semibold text-white text-lg mb-3 group-hover:text-orange-400 transition-colors">
              {product.name}
            </h3>
            
            <p className="text-gray-400 text-sm mb-4 line-clamp-2">
              {product.description}
            </p>

            <div className="flex items-center space-x-2 mb-4">
              <div className="flex items-center">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`h-4 w-4 ${
                      i < Math.floor(product.rating)
                        ? 'text-orange-500 fill-current'
                        : 'text-gray-600'
                    }`}
                  />
                ))}
              </div>
              <span className="text-sm text-gray-400">
                {product.rating} ({product.reviewCount} reviews)
              </span>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="text-2xl font-bold text-orange-500">
                ${product.price.toFixed(2)}
              </span>
              {product.originalPrice && (
                <span className="text-lg text-gray-500 line-through">
                  ${product.originalPrice.toFixed(2)}
                </span>
              )}
            </div>
            
            <div className="flex items-center space-x-2">
              <Button size="icon" variant="outline" className="border-gray-600 text-gray-300 hover:text-white hover:bg-gray-800">
                <Heart className="h-4 w-4" />
              </Button>
              <Button size="icon" variant="outline" className="border-gray-600 text-gray-300 hover:text-white hover:bg-gray-800">
                <Eye className="h-4 w-4" />
              </Button>
              <Button 
                className="bg-orange-500 hover:bg-orange-600 text-white"
                disabled={!product.inStock}
              >
                <ShoppingCart className="h-4 w-4 mr-2" />
                {product.inStock ? 'Add to Cart' : 'Out of Stock'}
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Grid view (default)
  return (
    <div 
      className="group relative bg-gray-900 rounded-xl border border-gray-800 overflow-hidden hover:border-orange-500/50 transition-all duration-300 hover:shadow-xl hover:shadow-orange-500/10 cursor-pointer"
      onClick={() => onProductClick?.(product.id)}
    >
      {/* Product Image */}
      <div className="relative aspect-square overflow-hidden bg-gray-800">
        <img
          src={product.images[0]}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          onError={(e) => {
            e.currentTarget.src = `data:image/svg+xml;base64,${btoa(`
              <svg width="400" height="400" xmlns="http://www.w3.org/2000/svg">
                <rect width="400" height="400" fill="#374151"/>
                <text x="200" y="200" text-anchor="middle" fill="#9CA3AF" font-size="16" font-family="Arial">
                  ${product.name}
                </text>
              </svg>
            `)}`;
          }}
        />
        
        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-2">
          {product.tags.includes('bestseller') && (
            <span className="bg-orange-500 text-white text-xs font-bold px-2 py-1 rounded">
              BESTSELLER
            </span>
          )}
          {product.tags.includes('new-arrival') && (
            <span className="bg-green-500 text-white text-xs font-bold px-2 py-1 rounded">
              NEW
            </span>
          )}
          {discountPercentage > 0 && (
            <span className="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded">
              -{discountPercentage}%
            </span>
          )}
        </div>

        {/* Quick Actions */}
        <div className="absolute top-3 right-3 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <Button size="icon" variant="secondary" className="bg-white/90 hover:bg-white text-gray-900">
            <Heart className="h-4 w-4" />
          </Button>
          <Button size="icon" variant="secondary" className="bg-white/90 hover:bg-white text-gray-900">
            <Eye className="h-4 w-4" />
          </Button>
        </div>

        {/* Stock Status */}
        {!product.inStock && (
          <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
            <span className="bg-red-500 text-white px-4 py-2 rounded-lg font-semibold">
              Out of Stock
            </span>
          </div>
        )}
      </div>

      {/* Product Info */}
      <div className="p-4 space-y-3">
        {/* Brand & Category */}
        <div className="flex items-center justify-between text-xs text-gray-400">
          <span className="font-medium">{product.brand}</span>
          <span className="capitalize">{product.category.replace('-', ' ')}</span>
        </div>

        {/* Product Name */}
        <h3 className="font-semibold text-white text-sm leading-tight line-clamp-2 group-hover:text-orange-400 transition-colors">
          {product.name}
        </h3>

        {/* Rating */}
        <div className="flex items-center space-x-2">
          <div className="flex items-center">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className={`h-3 w-3 ${
                  i < Math.floor(product.rating)
                    ? 'text-orange-500 fill-current'
                    : 'text-gray-600'
                }`}
              />
            ))}
          </div>
          <span className="text-xs text-gray-400">
            {product.rating} ({product.reviewCount})
          </span>
        </div>

        {/* Price */}
        <div className="flex items-center space-x-2">
          <span className="text-lg font-bold text-orange-500">
            ${product.price.toFixed(2)}
          </span>
          {product.originalPrice && (
            <span className="text-sm text-gray-500 line-through">
              ${product.originalPrice.toFixed(2)}
            </span>
          )}
        </div>

        {/* Add to Cart Button */}
        <Button 
          className="w-full bg-orange-500 hover:bg-orange-600 text-white group/btn"
          disabled={!product.inStock}
        >
          <ShoppingCart className="h-4 w-4 mr-2 group-hover/btn:scale-110 transition-transform" />
          {product.inStock ? 'Add to Cart' : 'Out of Stock'}
        </Button>
      </div>
    </div>
  );
};

const ProductGrid: React.FC<ProductGridProps> = ({ 
  products, 
  title = "Products",
  showFilters = true,
  showSorting = true,
  onProductClick
}) => {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState('name');
  const [filterOpen, setFilterOpen] = useState(false);

  const sortedProducts = [...products].sort((a, b) => {
    switch (sortBy) {
      case 'price-low':
        return a.price - b.price;
      case 'price-high':
        return b.price - a.price;
      case 'rating':
        return b.rating - a.rating;
      case 'newest':
        return b.tags.includes('new-arrival') ? 1 : -1;
      default:
        return a.name.localeCompare(b.name);
    }
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white">{title}</h2>
          <p className="text-gray-400 mt-1">{products.length} products found</p>
        </div>

        {/* Controls */}
        <div className="flex items-center space-x-4">
          {/* View Mode Toggle */}
          <div className="flex items-center bg-gray-800 rounded-lg p-1">
            <Button
              size="sm"
              variant={viewMode === 'grid' ? 'default' : 'ghost'}
              onClick={() => setViewMode('grid')}
              className={viewMode === 'grid' ? 'bg-orange-500 hover:bg-orange-600' : 'text-gray-400 hover:text-white'}
            >
              <Grid className="h-4 w-4" />
            </Button>
            <Button
              size="sm"
              variant={viewMode === 'list' ? 'default' : 'ghost'}
              onClick={() => setViewMode('list')}
              className={viewMode === 'list' ? 'bg-orange-500 hover:bg-orange-600' : 'text-gray-400 hover:text-white'}
            >
              <List className="h-4 w-4" />
            </Button>
          </div>

          {/* Sort Dropdown */}
          {showSorting && (
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              aria-label="Sort products"
              className="bg-gray-800 border border-gray-700 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
            >
              <option value="name">Sort by Name</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
              <option value="rating">Highest Rated</option>
              <option value="newest">Newest First</option>
            </select>
          )}

          {/* Filter Button */}
          {showFilters && (
            <Button
              variant="outline"
              onClick={() => setFilterOpen(!filterOpen)}
              className="border-gray-600 text-gray-300 hover:text-white hover:bg-gray-800"
            >
              <Filter className="h-4 w-4 mr-2" />
              Filters
            </Button>
          )}
        </div>
      </div>

      {/* Products Grid/List */}
      <div className={
        viewMode === 'grid' 
          ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
          : "space-y-6"
      }>
        {sortedProducts.map((product) => (
          <ProductCard key={product.id} product={product} viewMode={viewMode} onProductClick={onProductClick} />
        ))}
      </div>

      {/* Empty State */}
      {products.length === 0 && (
        <div className="text-center py-16">
          <div className="text-gray-400 text-lg mb-4">No products found</div>
          <p className="text-gray-500">Try adjusting your search or filter criteria</p>
        </div>
      )}
    </div>
  );
};

export default ProductGrid;
