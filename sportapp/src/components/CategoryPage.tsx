import React, { useState, useMemo } from 'react';
import { ChevronRight, Filter, X } from 'lucide-react';
import { Button } from './ui/button';
import ProductGrid from './ProductGrid';
import { productService } from '../services/productService';

interface CategoryPageProps {
  categoryId: string;
  onHomeClick?: () => void;
  onProductClick?: (productId: string) => void;
}

interface FilterState {
  priceRange: [number, number];
  brands: string[];
  subcategories: string[];
  inStock: boolean | null;
  tags: string[];
}

const CategoryPage: React.FC<CategoryPageProps> = ({ categoryId, onHomeClick, onProductClick }) => {
  const category = productService.getCategoryById(categoryId);
  const allProducts = productService.getProductsByCategory(categoryId);
  
  const [filters, setFilters] = useState<FilterState>({
    priceRange: [0, 1000],
    brands: [],
    subcategories: [],
    inStock: null,
    tags: []
  });
  
  const [showFilters, setShowFilters] = useState(false);

  // Get unique values for filters
  const filterOptions = useMemo(() => {
    const brands = [...new Set(allProducts.map(p => p.brand))].sort();
    const subcategories = category?.subcategories || [];
    const tags = [...new Set(allProducts.flatMap(p => p.tags))].sort();
    const priceRange: [number, number] = [
      Math.min(...allProducts.map(p => p.price)),
      Math.max(...allProducts.map(p => p.price))
    ];
    
    return { brands, subcategories, tags, priceRange };
  }, [allProducts, category]);

  // Filter products based on current filters
  const filteredProducts = useMemo(() => {
    return allProducts.filter(product => {
      // Price range filter
      if (product.price < filters.priceRange[0] || product.price > filters.priceRange[1]) {
        return false;
      }
      
      // Brand filter
      if (filters.brands.length > 0 && !filters.brands.includes(product.brand)) {
        return false;
      }
      
      // Subcategory filter
      if (filters.subcategories.length > 0 && !filters.subcategories.includes(product.subcategory)) {
        return false;
      }
      
      // Stock filter
      if (filters.inStock !== null && product.inStock !== filters.inStock) {
        return false;
      }
      
      // Tags filter
      if (filters.tags.length > 0 && !filters.tags.some(tag => product.tags.includes(tag))) {
        return false;
      }
      
      return true;
    });
  }, [allProducts, filters]);

  const clearFilters = () => {
    setFilters({
      priceRange: filterOptions.priceRange,
      brands: [],
      subcategories: [],
      inStock: null,
      tags: []
    });
  };

  const hasActiveFilters = 
    filters.brands.length > 0 ||
    filters.subcategories.length > 0 ||
    filters.inStock !== null ||
    filters.tags.length > 0 ||
    filters.priceRange[0] !== filterOptions.priceRange[0] ||
    filters.priceRange[1] !== filterOptions.priceRange[1];

  if (!category) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Category Not Found</h1>
          <p className="text-gray-400">The requested category could not be found.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Category Header */}
      <div className="bg-gray-950 border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* Breadcrumb */}
          <nav className="flex items-center space-x-2 text-sm text-gray-400 mb-6">
            <button 
              onClick={onHomeClick}
              className="hover:text-white transition-colors cursor-pointer"
            >
              Home
            </button>
            <ChevronRight className="h-4 w-4" />
            <span className="text-orange-500">{category.name}</span>
          </nav>

          {/* Category Info */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            <div>
              <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
                {category.name}
              </h1>
              <p className="text-xl text-gray-300 mb-6">
                {category.description}
              </p>
              
              {/* Subcategories */}
              <div className="flex flex-wrap gap-2">
                {category.subcategories.map((sub) => (
                  <button
                    key={sub.id}
                    onClick={() => {
                      const newSubcategories = filters.subcategories.includes(sub.id)
                        ? filters.subcategories.filter(s => s !== sub.id)
                        : [...filters.subcategories, sub.id];
                      setFilters(prev => ({ ...prev, subcategories: newSubcategories }));
                    }}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                      filters.subcategories.includes(sub.id)
                        ? 'bg-orange-500 text-white'
                        : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                    }`}
                  >
                    {sub.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Category Image */}
            <div className="relative h-64 lg:h-80 rounded-xl overflow-hidden">
              <img
                src={category.image}
                alt={category.name}
                className="w-full h-full object-cover"
                onError={(e) => {
                  const gradients = {
                    'fitness': 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)',
                    'team-sports': 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
                    'outdoor': 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                    'racquet': 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
                    'water-sports': 'linear-gradient(135deg, #06b6d4 0%, #0891b2 100%)',
                  };
                  e.currentTarget.style.display = 'none';
                  e.currentTarget.parentElement!.style.background = 
                    gradients[categoryId as keyof typeof gradients] || gradients.fitness;
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
              <div className="absolute bottom-4 left-4">
                <div className="bg-black/60 backdrop-blur-sm text-white px-3 py-1 rounded-full">
                  {allProducts.length} Products
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Filters Sidebar */}
          <div className={`lg:w-80 ${showFilters ? 'block' : 'hidden lg:block'}`}>
            <div className="bg-gray-900 rounded-xl border border-gray-800 p-6 sticky top-24">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-white">Filters</h3>
                <div className="flex items-center space-x-2">
                  {hasActiveFilters && (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={clearFilters}
                      className="text-orange-500 hover:text-orange-400"
                    >
                      Clear All
                    </Button>
                  )}
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setShowFilters(false)}
                    className="lg:hidden text-gray-400 hover:text-white"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="space-y-6">
                {/* Price Range */}
                <div>
                  <h4 className="font-medium text-white mb-3">Price Range</h4>
                  <div className="space-y-2">
                    <input
                      type="range"
                      min={filterOptions.priceRange[0]}
                      max={filterOptions.priceRange[1]}
                      value={filters.priceRange[1]}
                      onChange={(e) => setFilters(prev => ({
                        ...prev,
                        priceRange: [prev.priceRange[0], parseInt(e.target.value)]
                      }))}
                      aria-label="Maximum price filter"
                      className="w-full accent-orange-500"
                    />
                    <div className="flex justify-between text-sm text-gray-400">
                      <span>${filters.priceRange[0]}</span>
                      <span>${filters.priceRange[1]}</span>
                    </div>
                  </div>
                </div>

                {/* Brands */}
                <div>
                  <h4 className="font-medium text-white mb-3">Brands</h4>
                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {filterOptions.brands.map((brand) => (
                      <label key={brand} className="flex items-center space-x-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={filters.brands.includes(brand)}
                          onChange={(e) => {
                            const newBrands = e.target.checked
                              ? [...filters.brands, brand]
                              : filters.brands.filter(b => b !== brand);
                            setFilters(prev => ({ ...prev, brands: newBrands }));
                          }}
                          className="rounded border-gray-600 text-orange-500 focus:ring-orange-500"
                        />
                        <span className="text-sm text-gray-300">{brand}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Stock Status */}
                <div>
                  <h4 className="font-medium text-white mb-3">Availability</h4>
                  <div className="space-y-2">
                    <label className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="radio"
                        name="stock"
                        checked={filters.inStock === null}
                        onChange={() => setFilters(prev => ({ ...prev, inStock: null }))}
                        className="text-orange-500 focus:ring-orange-500"
                      />
                      <span className="text-sm text-gray-300">All Products</span>
                    </label>
                    <label className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="radio"
                        name="stock"
                        checked={filters.inStock === true}
                        onChange={() => setFilters(prev => ({ ...prev, inStock: true }))}
                        className="text-orange-500 focus:ring-orange-500"
                      />
                      <span className="text-sm text-gray-300">In Stock</span>
                    </label>
                    <label className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="radio"
                        name="stock"
                        checked={filters.inStock === false}
                        onChange={() => setFilters(prev => ({ ...prev, inStock: false }))}
                        className="text-orange-500 focus:ring-orange-500"
                      />
                      <span className="text-sm text-gray-300">Out of Stock</span>
                    </label>
                  </div>
                </div>

                {/* Tags */}
                {filterOptions.tags.length > 0 && (
                  <div>
                    <h4 className="font-medium text-white mb-3">Tags</h4>
                    <div className="flex flex-wrap gap-2">
                      {filterOptions.tags.map((tag) => (
                        <button
                          key={tag}
                          onClick={() => {
                            const newTags = filters.tags.includes(tag)
                              ? filters.tags.filter(t => t !== tag)
                              : [...filters.tags, tag];
                            setFilters(prev => ({ ...prev, tags: newTags }));
                          }}
                          className={`px-3 py-1 rounded-full text-xs font-medium transition-colors capitalize ${
                            filters.tags.includes(tag)
                              ? 'bg-orange-500 text-white'
                              : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                          }`}
                        >
                          {tag.replace('-', ' ')}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Products */}
          <div className="flex-1">
            {/* Mobile Filter Toggle */}
            <div className="lg:hidden mb-6">
              <Button
                onClick={() => setShowFilters(true)}
                className="bg-gray-800 hover:bg-gray-700 text-white"
              >
                <Filter className="h-4 w-4 mr-2" />
                Show Filters
                {hasActiveFilters && (
                  <span className="ml-2 bg-orange-500 text-white text-xs px-2 py-1 rounded-full">
                    Active
                  </span>
                )}
              </Button>
            </div>

            <ProductGrid
              products={filteredProducts}
              title={`${category.name} (${filteredProducts.length})`}
              showFilters={false}
              showSorting={true}
              onProductClick={onProductClick}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default CategoryPage;
