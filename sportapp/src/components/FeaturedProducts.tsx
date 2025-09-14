import React from 'react';
import { Star, ShoppingCart, Heart, Eye } from 'lucide-react';
import { Button } from './ui/button';
import { productService } from '../services/productService';
import type { Product } from '../types/product';

interface ProductCardProps {
  product: Product;
  onProductClick: (productId: string) => void;
}

const ProductCard: React.FC<ProductCardProps> = ({ product, onProductClick }) => {
  const discountPercentage = product.originalPrice 
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;

  return (
    <div 
      className="group relative bg-gray-900 rounded-xl border border-gray-800 overflow-hidden hover:border-orange-500/50 transition-all duration-300 hover:shadow-xl hover:shadow-orange-500/10 cursor-pointer"
      onClick={() => onProductClick(product.id)}
    >
      {/* Product Image */}
      <div className="relative aspect-square overflow-hidden bg-gray-800">
        <img
          src={product.images[0]}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          onError={(e) => {
            // Fallback to a placeholder
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

interface FeaturedProductsProps {
  onProductClick: (productId: string) => void;
  onViewAllClick: () => void;
}

const FeaturedProducts: React.FC<FeaturedProductsProps> = ({ onProductClick, onViewAllClick }) => {
  const featuredProducts = productService.getFeaturedProducts();

  return (
    <section className="py-20 bg-black">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center space-x-2 bg-orange-500/20 border border-orange-500/30 rounded-full px-4 py-2 mb-6">
            <Star className="h-4 w-4 text-orange-500 fill-current" />
            <span className="text-orange-400 text-sm font-medium">
              Featured Products
            </span>
          </div>
          
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Gear That <span className="text-orange-500">Champions</span> Choose
          </h2>
          
          <p className="text-xl text-gray-400 max-w-3xl mx-auto leading-relaxed">
            Discover our handpicked selection of premium sports equipment, 
            trusted by professional athletes and fitness enthusiasts worldwide.
          </p>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {featuredProducts.map((product) => (
            <ProductCard key={product.id} product={product} onProductClick={onProductClick} />
          ))}
        </div>

        {/* View All Button */}
        <div className="text-center">
          <Button 
            size="lg" 
            variant="outline"
            onClick={onViewAllClick}
            className="border-orange-500 text-orange-500 hover:bg-orange-500 hover:text-white px-8 py-4 text-lg font-semibold"
          >
            View All Products
          </Button>
        </div>
      </div>
    </section>
  );
};

export default FeaturedProducts;
