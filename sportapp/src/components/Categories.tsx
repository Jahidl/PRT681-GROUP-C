import React from 'react';
import { ArrowRight } from 'lucide-react';
import { Button } from './ui/button';
import { productService } from '../services/productService';

interface CategoriesProps {
  onCategoryClick: (categoryId: string) => void;
  onViewAllClick: () => void;
}

const Categories: React.FC<CategoriesProps> = ({ onCategoryClick, onViewAllClick }) => {
  const categories = productService.getCategories();

  return (
    <section className="py-20 bg-gray-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Shop by <span className="text-orange-500">Category</span>
          </h2>
          <p className="text-xl text-gray-400 max-w-3xl mx-auto leading-relaxed">
            Find exactly what you need with our comprehensive range of sports categories, 
            from professional equipment to everyday fitness gear.
          </p>
        </div>

        {/* Categories Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {categories.map((category, index) => (
            <div
              key={category.id}
              onClick={() => onCategoryClick(category.id)}
              className={`group relative overflow-hidden rounded-2xl bg-gray-900 border border-gray-800 hover:border-orange-500/50 transition-all duration-500 hover:shadow-xl hover:shadow-orange-500/10 cursor-pointer ${
                index === 0 ? 'md:col-span-2 lg:col-span-1' : ''
              }`}
            >
              {/* Background Image */}
              <div className="relative h-80 overflow-hidden">
                <img
                  src={category.image}
                  alt={category.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                  onError={(e) => {
                    // Fallback gradient based on category
                    const gradients = {
                      'fitness': 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)',
                      'team-sports': 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
                      'outdoor': 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                      'racquet': 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
                      'water-sports': 'linear-gradient(135deg, #06b6d4 0%, #0891b2 100%)',
                    };
                    e.currentTarget.style.display = 'none';
                    e.currentTarget.parentElement!.style.background = 
                      gradients[category.id as keyof typeof gradients] || gradients.fitness;
                  }}
                />
                
                {/* Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
                
                {/* Category Content */}
                <div className="absolute inset-0 flex flex-col justify-end p-8">
                  <div className="transform translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
                    <h3 className="text-2xl md:text-3xl font-bold text-white mb-3 group-hover:text-orange-400 transition-colors">
                      {category.name}
                    </h3>
                    <p className="text-gray-300 text-sm md:text-base mb-6 opacity-90 group-hover:opacity-100 transition-opacity">
                      {category.description}
                    </p>
                    
                    {/* Subcategories */}
                    <div className="flex flex-wrap gap-2 mb-6 opacity-0 group-hover:opacity-100 transition-opacity duration-300 delay-100">
                      {category.subcategories.slice(0, 3).map((sub) => (
                        <span
                          key={sub.id}
                          className="bg-white/20 backdrop-blur-sm text-white text-xs px-3 py-1 rounded-full border border-white/30"
                        >
                          {sub.name}
                        </span>
                      ))}
                      {category.subcategories.length > 3 && (
                        <span className="bg-orange-500/20 backdrop-blur-sm text-orange-400 text-xs px-3 py-1 rounded-full border border-orange-500/30">
                          +{category.subcategories.length - 3} more
                        </span>
                      )}
                    </div>

                    {/* CTA Button */}
                    <Button 
                      className="bg-orange-500 hover:bg-orange-600 text-white group/btn opacity-0 group-hover:opacity-100 transition-opacity duration-300 delay-200"
                    >
                      Explore {category.name}
                      <ArrowRight className="ml-2 h-4 w-4 group-hover/btn:translate-x-1 transition-transform" />
                    </Button>
                  </div>
                </div>

                {/* Product Count Badge */}
                <div className="absolute top-4 right-4">
                  <div className="bg-black/60 backdrop-blur-sm text-white text-sm px-3 py-1 rounded-full border border-white/20">
                    {productService.getProductsByCategory(category.id).length} Products
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="text-center mt-16">
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-8 md:p-12">
            <h3 className="text-2xl md:text-3xl font-bold text-white mb-4">
              Can't Find What You're Looking For?
            </h3>
            <p className="text-gray-400 mb-8 max-w-2xl mx-auto">
              Our expert team is here to help you find the perfect equipment for your sport. 
              Get personalized recommendations based on your needs and skill level.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                size="lg"
                className="bg-orange-500 hover:bg-orange-600 text-white px-8 py-4"
              >
                Get Expert Advice
              </Button>
              <Button 
                size="lg"
                variant="outline"
                onClick={onViewAllClick}
                className="border-gray-600 text-gray-300 hover:bg-gray-800 px-8 py-4"
              >
                Browse All Products
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Categories;
