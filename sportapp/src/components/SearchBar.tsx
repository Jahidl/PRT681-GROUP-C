import React, { useState, useRef, useEffect } from 'react';
import { Search, X } from 'lucide-react';
import { productService } from '../services/productService';
import type { Product } from '../types/product';

interface SearchBarProps {
  placeholder?: string;
  className?: string;
}

const SearchBar: React.FC<SearchBarProps> = ({ 
  placeholder = "Search sports equipment...", 
  className = "" 
}) => {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [suggestions, setSuggestions] = useState<Product[]>([]);
  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);

    if (value.trim().length > 0) {
      // Get product suggestions from service
      const productSuggestions = productService.getSearchSuggestions(value, 6);
      setSuggestions(productSuggestions);
      setIsOpen(true);
    } else {
      setSuggestions([]);
      setIsOpen(false);
    }
  };

  const handleSuggestionClick = (suggestion: Product) => {
    setQuery(suggestion.name);
    setIsOpen(false);
    // In a real app, you would navigate to the product or perform search
    console.log('Selected:', suggestion);
  };

  const clearSearch = () => {
    setQuery('');
    setSuggestions([]);
    setIsOpen(false);
    inputRef.current?.focus();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      setIsOpen(false);
      // In a real app, you would perform the search
      console.log('Search for:', query);
    }
  };

  return (
    <div className={`relative ${className}`} ref={searchRef}>
      <form onSubmit={handleSubmit}>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={handleInputChange}
            placeholder={placeholder}
            className="block w-full pl-10 pr-10 py-2 border border-gray-700 rounded-md leading-5 bg-gray-900 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 sm:text-sm transition-all"
          />
          {query && (
            <button
              type="button"
              onClick={clearSearch}
              title="Clear search"
              aria-label="Clear search"
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-white transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      </form>

      {/* Search Suggestions */}
      {isOpen && suggestions.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-gray-900 border border-gray-700 rounded-lg shadow-xl z-50 animate-fade-in">
          <div className="py-2">
            {suggestions.map((suggestion) => (
              <button
                key={suggestion.id}
                onClick={() => handleSuggestionClick(suggestion)}
                className="w-full text-left px-4 py-3 hover:bg-gray-800 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm font-medium text-white">
                      {suggestion.name}
                    </div>
                    <div className="text-xs text-gray-400">
                      in {suggestion.category}
                    </div>
                  </div>
                  <div className="text-sm font-medium text-orange-500">
                    ${suggestion.price.toFixed(2)}
                  </div>
                </div>
              </button>
            ))}
          </div>
          
          {/* Search All Results */}
          <div className="border-t border-gray-700 px-4 py-2">
            <button
              onClick={handleSubmit}
              className="text-sm text-orange-500 hover:text-orange-400 transition-colors"
            >
              Search for "{query}" in all products
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default SearchBar;
