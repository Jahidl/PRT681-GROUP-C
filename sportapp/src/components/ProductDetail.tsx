import React, { useState } from 'react';
import { 
  Star, 
  ShoppingCart, 
  Heart, 
  Share2, 
  ChevronLeft, 
  ChevronRight, 
  Plus, 
  Minus,
  Truck,
  Shield,
  RotateCcw,
  Award
} from 'lucide-react';
import { Button } from './ui/button';
import { productService } from '../services/productService';
import { useCart } from '../contexts/CartContext';

interface ProductDetailProps {
  productId: string;
  onHomeClick?: () => void;
  onCategoryClick?: (categoryId: string) => void;
  onProductClick?: (productId: string) => void;
}

const ProductDetail: React.FC<ProductDetailProps> = ({ 
  productId, 
  onHomeClick, 
  onCategoryClick, 
  onProductClick 
}) => {
  const product = productService.getProductById(productId);
  const relatedProducts = productService.getRelatedProducts(productId, 4);
  const { addItem, openCart } = useCart();
  
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [selectedSize, setSelectedSize] = useState(product?.sizes?.[0] || '');
  const [selectedColor, setSelectedColor] = useState(product?.colors?.[0] || '');
  const [activeTab, setActiveTab] = useState<'description' | 'specifications' | 'reviews'>('description');

  if (!product) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Product Not Found</h1>
          <p className="text-gray-400">The requested product could not be found.</p>
        </div>
      </div>
    );
  }

  const discountPercentage = product.originalPrice 
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;

  const nextImage = () => {
    setSelectedImageIndex((prev) => 
      prev === product.images.length - 1 ? 0 : prev + 1
    );
  };

  const prevImage = () => {
    setSelectedImageIndex((prev) => 
      prev === 0 ? product.images.length - 1 : prev - 1
    );
  };

  const handleQuantityChange = (change: number) => {
    setQuantity(prev => Math.max(1, Math.min(prev + change, product.stockCount)));
  };

  const handleAddToCart = () => {
    if (!product) return;
    
    addItem(product, quantity, selectedSize, selectedColor);
    openCart();
  };

  return (
    <div className="min-h-screen bg-black text-white pt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        <nav className="flex items-center space-x-2 text-sm text-gray-400 mb-8">
          <button 
            onClick={onHomeClick}
            className="hover:text-white transition-colors cursor-pointer"
          >
            Home
          </button>
          <ChevronRight className="h-4 w-4" />
          <button 
            onClick={() => onCategoryClick?.(product.category)}
            className="capitalize hover:text-white transition-colors cursor-pointer"
          >
            {product.category.replace('-', ' ')}
          </button>
          <ChevronRight className="h-4 w-4" />
          <span className="text-orange-500">{product.name}</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
          {/* Product Images */}
          <div className="space-y-4">
            {/* Main Image */}
            <div className="relative aspect-square bg-gray-900 rounded-xl overflow-hidden">
              <img
                src={product.images[selectedImageIndex]}
                alt={product.name}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.currentTarget.src = `data:image/svg+xml;base64,${btoa(`
                    <svg width="600" height="600" xmlns="http://www.w3.org/2000/svg">
                      <rect width="600" height="600" fill="#374151"/>
                      <text x="300" y="300" text-anchor="middle" fill="#9CA3AF" font-size="24" font-family="Arial">
                        ${product.name}
                      </text>
                    </svg>
                  `)}`;
                }}
              />
              
              {/* Navigation Arrows */}
              {product.images.length > 1 && (
                <>
                  <button
                    onClick={prevImage}
                    aria-label="Previous image"
                    className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black/60 hover:bg-black/80 text-white p-2 rounded-full transition-colors"
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </button>
                  <button
                    onClick={nextImage}
                    aria-label="Next image"
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black/60 hover:bg-black/80 text-white p-2 rounded-full transition-colors"
                  >
                    <ChevronRight className="h-5 w-5" />
                  </button>
                </>
              )}

              {/* Badges */}
              <div className="absolute top-4 left-4 flex flex-col gap-2">
                {product.tags.includes('bestseller') && (
                  <span className="bg-orange-500 text-white text-sm font-bold px-3 py-1 rounded">
                    BESTSELLER
                  </span>
                )}
                {product.tags.includes('new-arrival') && (
                  <span className="bg-green-500 text-white text-sm font-bold px-3 py-1 rounded">
                    NEW
                  </span>
                )}
                {discountPercentage > 0 && (
                  <span className="bg-red-500 text-white text-sm font-bold px-3 py-1 rounded">
                    -{discountPercentage}% OFF
                  </span>
                )}
              </div>
            </div>

            {/* Thumbnail Images */}
            {product.images.length > 1 && (
              <div className="flex space-x-2 overflow-x-auto">
                {product.images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImageIndex(index)}
                    className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-colors ${
                      selectedImageIndex === index 
                        ? 'border-orange-500' 
                        : 'border-gray-700 hover:border-gray-600'
                    }`}
                  >
                    <img
                      src={image}
                      alt={`${product.name} ${index + 1}`}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.currentTarget.src = `data:image/svg+xml;base64,${btoa(`
                          <svg width="80" height="80" xmlns="http://www.w3.org/2000/svg">
                            <rect width="80" height="80" fill="#374151"/>
                            <text x="40" y="40" text-anchor="middle" fill="#9CA3AF" font-size="10" font-family="Arial">
                              ${index + 1}
                            </text>
                          </svg>
                        `)}`;
                      }}
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            {/* Brand and Category */}
            <div className="flex items-center justify-between">
              <span className="text-orange-500 font-medium">{product.brand}</span>
              <div className="flex items-center space-x-2">
                <Button size="icon" variant="outline" className="border-gray-600 text-gray-300 hover:text-white">
                  <Heart className="h-4 w-4" />
                </Button>
                <Button size="icon" variant="outline" className="border-gray-600 text-gray-300 hover:text-white">
                  <Share2 className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Product Name */}
            <h1 className="text-3xl md:text-4xl font-bold text-white leading-tight">
              {product.name}
            </h1>

            {/* Rating and Reviews */}
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-1">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`h-5 w-5 ${
                      i < Math.floor(product.rating)
                        ? 'text-orange-500 fill-current'
                        : 'text-gray-600'
                    }`}
                  />
                ))}
              </div>
              <span className="text-lg font-medium text-white">{product.rating}</span>
              <span className="text-gray-400">({product.reviewCount} reviews)</span>
            </div>

            {/* Price */}
            <div className="flex items-center space-x-4">
              <span className="text-4xl font-bold text-orange-500">
                ${product.price.toFixed(2)}
              </span>
              {product.originalPrice && (
                <span className="text-2xl text-gray-500 line-through">
                  ${product.originalPrice.toFixed(2)}
                </span>
              )}
              {discountPercentage > 0 && (
                <span className="bg-red-500 text-white px-3 py-1 rounded-full text-sm font-bold">
                  Save {discountPercentage}%
                </span>
              )}
            </div>

            {/* Stock Status */}
            <div className="flex items-center space-x-2">
              {product.inStock ? (
                <>
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span className="text-green-400 font-medium">In Stock ({product.stockCount} available)</span>
                </>
              ) : (
                <>
                  <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                  <span className="text-red-400 font-medium">Out of Stock</span>
                </>
              )}
            </div>

            {/* Product Description */}
            <p className="text-gray-300 text-lg leading-relaxed">
              {product.description}
            </p>

            {/* Size Selection */}
            {product.sizes && product.sizes.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold text-white mb-3">Size</h3>
                <div className="flex flex-wrap gap-2">
                  {product.sizes.map((size) => (
                    <button
                      key={size}
                      onClick={() => setSelectedSize(size)}
                      className={`px-4 py-2 border rounded-lg font-medium transition-colors ${
                        selectedSize === size
                          ? 'border-orange-500 bg-orange-500 text-white'
                          : 'border-gray-600 text-gray-300 hover:border-gray-500'
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Color Selection */}
            {product.colors && product.colors.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold text-white mb-3">Color</h3>
                <div className="flex flex-wrap gap-2">
                  {product.colors.map((color) => (
                    <button
                      key={color}
                      onClick={() => setSelectedColor(color)}
                      className={`px-4 py-2 border rounded-lg font-medium transition-colors ${
                        selectedColor === color
                          ? 'border-orange-500 bg-orange-500 text-white'
                          : 'border-gray-600 text-gray-300 hover:border-gray-500'
                      }`}
                    >
                      {color}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Quantity and Add to Cart */}
            <div className="flex items-center space-x-4">
              <div className="flex items-center border border-gray-600 rounded-lg">
                <button
                  onClick={() => handleQuantityChange(-1)}
                  disabled={quantity <= 1}
                  aria-label="Decrease quantity"
                  className="p-3 hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Minus className="h-4 w-4" />
                </button>
                <span className="px-4 py-3 font-medium">{quantity}</span>
                <button
                  onClick={() => handleQuantityChange(1)}
                  disabled={quantity >= product.stockCount}
                  aria-label="Increase quantity"
                  className="p-3 hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>
              
              <Button
                onClick={handleAddToCart}
                disabled={!product.inStock}
                className="flex-1 bg-orange-500 hover:bg-orange-600 text-white py-3 text-lg font-semibold"
              >
                <ShoppingCart className="h-5 w-5 mr-2" />
                Add to Cart
              </Button>
            </div>

            {/* Features */}
            <div className="grid grid-cols-2 gap-4 pt-6 border-t border-gray-800">
              <div className="flex items-center space-x-3">
                <Truck className="h-5 w-5 text-orange-500" />
                <span className="text-sm text-gray-300">Free Shipping</span>
              </div>
              <div className="flex items-center space-x-3">
                <Shield className="h-5 w-5 text-orange-500" />
                <span className="text-sm text-gray-300">2 Year Warranty</span>
              </div>
              <div className="flex items-center space-x-3">
                <RotateCcw className="h-5 w-5 text-orange-500" />
                <span className="text-sm text-gray-300">30-Day Returns</span>
              </div>
              <div className="flex items-center space-x-3">
                <Award className="h-5 w-5 text-orange-500" />
                <span className="text-sm text-gray-300">Quality Guaranteed</span>
              </div>
            </div>
          </div>
        </div>

        {/* Product Details Tabs */}
        <div className="mb-16">
          <div className="border-b border-gray-800 mb-8">
            <nav className="flex space-x-8">
              {[
                { id: 'description', label: 'Description' },
                { id: 'specifications', label: 'Specifications' },
                { id: 'reviews', label: 'Reviews' }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as 'description' | 'specifications' | 'reviews')}
                  className={`py-4 px-2 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === tab.id
                      ? 'border-orange-500 text-orange-500'
                      : 'border-transparent text-gray-400 hover:text-white'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>

          <div className="max-w-4xl">
            {activeTab === 'description' && (
              <div className="space-y-6">
                <h3 className="text-2xl font-bold text-white">Product Description</h3>
                <p className="text-gray-300 leading-relaxed text-lg">
                  {product.description}
                </p>
                <div>
                  <h4 className="text-lg font-semibold text-white mb-4">Key Features</h4>
                  <ul className="space-y-2">
                    {product.features.map((feature, index) => (
                      <li key={index} className="flex items-start space-x-3">
                        <div className="w-2 h-2 bg-orange-500 rounded-full mt-2 flex-shrink-0"></div>
                        <span className="text-gray-300">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}

            {activeTab === 'specifications' && (
              <div className="space-y-6">
                <h3 className="text-2xl font-bold text-white">Specifications</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {Object.entries(product.specifications).map(([key, value]) => (
                    <div key={key} className="flex justify-between py-3 border-b border-gray-800">
                      <span className="font-medium text-gray-400 capitalize">
                        {key.replace(/([A-Z])/g, ' $1').trim()}
                      </span>
                      <span className="text-white">{value}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'reviews' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-2xl font-bold text-white">Customer Reviews</h3>
                  <Button variant="outline" className="border-orange-500 text-orange-500 hover:bg-orange-500 hover:text-white">
                    Write a Review
                  </Button>
                </div>
                
                <div className="bg-gray-900 rounded-xl p-6">
                  <div className="flex items-center space-x-4 mb-4">
                    <div className="text-4xl font-bold text-white">{product.rating}</div>
                    <div>
                      <div className="flex items-center space-x-1 mb-1">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`h-5 w-5 ${
                              i < Math.floor(product.rating)
                                ? 'text-orange-500 fill-current'
                                : 'text-gray-600'
                            }`}
                          />
                        ))}
                      </div>
                      <div className="text-gray-400">Based on {product.reviewCount} reviews</div>
                    </div>
                  </div>
                </div>

                <div className="text-center py-12 text-gray-400">
                  <p>Customer reviews will be displayed here.</p>
                  <p className="text-sm mt-2">This feature will be implemented in the backend integration.</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <div>
            <h3 className="text-2xl font-bold text-white mb-8">Related Products</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {relatedProducts.map((relatedProduct) => (
                <div 
                  key={relatedProduct.id} 
                  onClick={() => onProductClick?.(relatedProduct.id)}
                  className="bg-gray-900 rounded-xl border border-gray-800 overflow-hidden hover:border-orange-500/50 transition-colors group cursor-pointer"
                >
                  <div className="aspect-square bg-gray-800 overflow-hidden">
                    <img
                      src={relatedProduct.images[0]}
                      alt={relatedProduct.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      onError={(e) => {
                        e.currentTarget.src = `data:image/svg+xml;base64,${btoa(`
                          <svg width="300" height="300" xmlns="http://www.w3.org/2000/svg">
                            <rect width="300" height="300" fill="#374151"/>
                            <text x="150" y="150" text-anchor="middle" fill="#9CA3AF" font-size="12" font-family="Arial">
                              ${relatedProduct.name}
                            </text>
                          </svg>
                        `)}`;
                      }}
                    />
                  </div>
                  <div className="p-4">
                    <h4 className="font-semibold text-white text-sm mb-2 line-clamp-2">
                      {relatedProduct.name}
                    </h4>
                    <div className="flex items-center justify-between">
                      <span className="text-orange-500 font-bold">
                        ${relatedProduct.price.toFixed(2)}
                      </span>
                      <div className="flex items-center space-x-1">
                        <Star className="h-3 w-3 text-orange-500 fill-current" />
                        <span className="text-xs text-gray-400">{relatedProduct.rating}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductDetail;
