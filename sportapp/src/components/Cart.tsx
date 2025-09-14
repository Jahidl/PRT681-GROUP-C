import React from 'react';
import { X, Plus, Minus, ShoppingBag, Trash2 } from 'lucide-react';
import { Button } from './ui/button';
import { useCart } from '../contexts/CartContext';

interface CartProps {
  onProductClick?: (productId: string) => void;
}

const Cart: React.FC<CartProps> = ({ onProductClick }) => {
  const { 
    items, 
    isOpen, 
    totalItems, 
    totalPrice, 
    removeItem, 
    updateQuantity, 
    clearCart, 
    closeCart 
  } = useCart();

  if (!isOpen) return null;

  const handleProductClick = (productId: string) => {
    closeCart();
    onProductClick?.(productId);
  };

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
        onClick={closeCart}
      />
      
      {/* Cart Drawer */}
      <div className="fixed right-0 top-0 h-full w-full max-w-md bg-gray-900 border-l border-gray-800 z-50 transform transition-transform duration-300 ease-in-out">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-800">
          <div className="flex items-center space-x-2">
            <ShoppingBag className="h-5 w-5 text-orange-500" />
            <h2 className="text-lg font-semibold text-white">
              Shopping Cart ({totalItems})
            </h2>
          </div>
          <Button
            size="icon"
            variant="ghost"
            onClick={closeCart}
            className="text-gray-400 hover:text-white"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Cart Content */}
        <div className="flex flex-col h-full">
          {items.length === 0 ? (
            /* Empty Cart */
            <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
              <ShoppingBag className="h-16 w-16 text-gray-600 mb-4" />
              <h3 className="text-lg font-medium text-white mb-2">Your cart is empty</h3>
              <p className="text-gray-400 mb-6">Add some products to get started</p>
              <Button 
                onClick={closeCart}
                className="bg-orange-500 hover:bg-orange-600 text-white"
              >
                Continue Shopping
              </Button>
            </div>
          ) : (
            <>
              {/* Cart Items */}
              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                {items.map((item) => (
                  <div key={item.id} className="bg-gray-800 rounded-lg p-4 border border-gray-700">
                    <div className="flex space-x-4">
                      {/* Product Image */}
                      <div 
                        className="w-16 h-16 bg-gray-700 rounded-lg overflow-hidden flex-shrink-0 cursor-pointer"
                        onClick={() => handleProductClick(item.product.id)}
                      >
                        <img
                          src={item.product.images[0]}
                          alt={item.product.name}
                          className="w-full h-full object-cover hover:scale-105 transition-transform"
                          onError={(e) => {
                            e.currentTarget.src = `data:image/svg+xml;base64,${btoa(`
                              <svg width="64" height="64" xmlns="http://www.w3.org/2000/svg">
                                <rect width="64" height="64" fill="#374151"/>
                                <text x="32" y="32" text-anchor="middle" fill="#9CA3AF" font-size="8" font-family="Arial">
                                  ${item.product.name.slice(0, 10)}
                                </text>
                              </svg>
                            `)}`;
                          }}
                        />
                      </div>

                      {/* Product Details */}
                      <div className="flex-1 min-w-0">
                        <h4 
                          className="font-medium text-white text-sm line-clamp-2 cursor-pointer hover:text-orange-400 transition-colors"
                          onClick={() => handleProductClick(item.product.id)}
                        >
                          {item.product.name}
                        </h4>
                        <p className="text-xs text-gray-400 mt-1">{item.product.brand}</p>
                        
                        {/* Selected Options */}
                        {(item.selectedSize || item.selectedColor) && (
                          <div className="flex space-x-2 mt-2">
                            {item.selectedSize && (
                              <span className="text-xs bg-gray-700 text-gray-300 px-2 py-1 rounded">
                                Size: {item.selectedSize}
                              </span>
                            )}
                            {item.selectedColor && (
                              <span className="text-xs bg-gray-700 text-gray-300 px-2 py-1 rounded">
                                Color: {item.selectedColor}
                              </span>
                            )}
                          </div>
                        )}

                        {/* Price and Quantity Controls */}
                        <div className="flex items-center justify-between mt-3">
                          <div className="flex items-center space-x-2">
                            <Button
                              size="icon"
                              variant="outline"
                              onClick={() => updateQuantity(item.id, item.quantity - 1)}
                              className="h-8 w-8 border-gray-600 text-gray-300 hover:text-white hover:bg-gray-700"
                            >
                              <Minus className="h-3 w-3" />
                            </Button>
                            <span className="text-white font-medium min-w-[2rem] text-center">
                              {item.quantity}
                            </span>
                            <Button
                              size="icon"
                              variant="outline"
                              onClick={() => updateQuantity(item.id, item.quantity + 1)}
                              className="h-8 w-8 border-gray-600 text-gray-300 hover:text-white hover:bg-gray-700"
                            >
                              <Plus className="h-3 w-3" />
                            </Button>
                          </div>
                          
                          <div className="flex items-center space-x-2">
                            <span className="text-orange-500 font-semibold">
                              ${(item.product.price * item.quantity).toFixed(2)}
                            </span>
                            <Button
                              size="icon"
                              variant="ghost"
                              onClick={() => removeItem(item.id)}
                              className="h-8 w-8 text-red-400 hover:text-red-300 hover:bg-red-500/10"
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Cart Footer */}
              <div className="border-t border-gray-800 p-6 space-y-4">
                {/* Total */}
                <div className="flex items-center justify-between text-lg font-semibold">
                  <span className="text-white">Total:</span>
                  <span className="text-orange-500">${totalPrice.toFixed(2)}</span>
                </div>

                {/* Action Buttons */}
                <div className="space-y-3">
                  <Button 
                    className="w-full bg-orange-500 hover:bg-orange-600 text-white py-3 text-lg font-semibold"
                    onClick={() => {
                      // TODO: Implement checkout functionality
                      console.log('Proceeding to checkout with items:', items);
                      alert('Checkout functionality will be implemented in the next phase!');
                    }}
                  >
                    Checkout (${totalPrice.toFixed(2)})
                  </Button>
                  
                  <div className="flex space-x-3">
                    <Button 
                      variant="outline"
                      onClick={closeCart}
                      className="flex-1 border-gray-600 text-gray-300 hover:text-white hover:bg-gray-800"
                    >
                      Continue Shopping
                    </Button>
                    <Button 
                      variant="outline"
                      onClick={() => {
                        if (confirm('Are you sure you want to clear your cart?')) {
                          clearCart();
                        }
                      }}
                      className="flex-1 border-red-600 text-red-400 hover:text-red-300 hover:bg-red-500/10"
                    >
                      Clear Cart
                    </Button>
                  </div>
                </div>

                {/* Free Shipping Notice */}
                <div className="text-center text-sm text-gray-400 pt-2 border-t border-gray-800">
                  🚚 Free shipping on orders over $50
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
};

export default Cart;
