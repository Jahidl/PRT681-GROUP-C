import { useState, useEffect } from 'react';
import { ShoppingCart, Menu, X } from 'lucide-react';
import { Button } from './ui/button';
import DropdownMenu from './DropdownMenu';
import SearchBar from './SearchBar';
import UserDropdown from './UserDropdown';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';

interface NavbarProps {
  onHomeClick?: () => void;
  onAllProductsClick?: () => void;
  onCategoryClick?: (categoryId: string) => void;
}

const Navbar: React.FC<NavbarProps> = ({ 
  onHomeClick
}) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const { totalItems, toggleCart } = useCart();
  const { openAuthModal } = useAuth();

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  // Handle scroll effect for navbar
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 0);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Equipment dropdown items
  const equipmentItems = [
    { label: 'Fitness Equipment', href: '/equipment/fitness', description: 'Treadmills, weights, and more' },
    { label: 'Team Sports', href: '/equipment/team-sports', description: 'Basketball, soccer, volleyball' },
    { label: 'Outdoor Sports', href: '/equipment/outdoor', description: 'Camping, hiking, cycling gear' },
    { label: 'Water Sports', href: '/equipment/water', description: 'Swimming, surfing, diving' },
    { label: 'Winter Sports', href: '/equipment/winter', description: 'Skiing, snowboarding, ice skating' },
    { label: 'Racquet Sports', href: '/equipment/racquet', description: 'Tennis, badminton, squash' },
  ];

  // Apparel dropdown items
  const apparelItems = [
    { label: 'Athletic Wear', href: '/apparel/athletic', description: 'Performance clothing for all sports' },
    { label: 'Running Gear', href: '/apparel/running', description: 'Shirts, shorts, and accessories' },
    { label: 'Gym Wear', href: '/apparel/gym', description: 'Workout clothes and activewear' },
    { label: 'Team Jerseys', href: '/apparel/jerseys', description: 'Official team merchandise' },
    { label: 'Outdoor Clothing', href: '/apparel/outdoor', description: 'Weather-resistant gear' },
  ];

  return (
    <nav className={`bg-black border-b border-gray-800 sticky top-0 z-50 transition-all duration-200 ${
      isScrolled ? 'shadow-lg backdrop-blur-sm bg-black/95' : ''
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex-shrink-0">
            <button onClick={onHomeClick} className="flex items-center">
              <h1 className="text-2xl font-bold text-white hover:text-gray-200 transition-colors">
                Sport<span className="text-orange-500">Store</span>
              </h1>
            </button>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-4">
              <button
                onClick={onHomeClick}
                className="text-gray-300 hover:text-white px-3 py-2 text-sm font-medium transition-colors"
              >
                Home
              </button>
              <DropdownMenu trigger="Equipment" items={equipmentItems} />
              <DropdownMenu trigger="Apparel" items={apparelItems} />
              <a
                href="#"
                className="text-gray-300 hover:text-white px-3 py-2 text-sm font-medium transition-colors"
              >
                Accessories
              </a>
              <a
                href="#"
                className="text-gray-300 hover:text-white px-3 py-2 text-sm font-medium transition-colors"
              >
                Brands
              </a>
              <a
                href="#"
                className="text-gray-300 hover:text-white px-3 py-2 text-sm font-medium transition-colors"
              >
                Sale
              </a>
            </div>
          </div>

          {/* Search Bar */}
          <SearchBar className="hidden md:flex flex-1 max-w-md mx-8" />

          {/* Right side icons */}
          <div className="hidden md:flex items-center space-x-4">
            <UserDropdown />
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={toggleCart}
              className="text-gray-300 hover:text-white relative"
            >
              <ShoppingCart className="h-5 w-5" />
              {totalItems > 0 && (
                <span className="absolute -top-1 -right-1 bg-orange-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {totalItems}
                </span>
              )}
            </Button>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleMobileMenu}
              className="text-gray-300 hover:text-white"
            >
              {isMobileMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden animate-fade-in">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-gray-900 border-t border-gray-800">
            {/* Mobile Search */}
            <div className="px-3 py-2">
              <SearchBar placeholder="Search..." />
            </div>

            {/* Mobile Navigation Links */}
            <button
              onClick={onHomeClick}
              className="text-gray-300 hover:text-white block px-3 py-2 text-base font-medium w-full text-left"
            >
              Home
            </button>
            <a
              href="#"
              className="text-gray-300 hover:text-white block px-3 py-2 text-base font-medium"
            >
              Equipment
            </a>
            <a
              href="#"
              className="text-gray-300 hover:text-white block px-3 py-2 text-base font-medium"
            >
              Apparel
            </a>
            <a
              href="#"
              className="text-gray-300 hover:text-white block px-3 py-2 text-base font-medium"
            >
              Accessories
            </a>
            <a
              href="#"
              className="text-gray-300 hover:text-white block px-3 py-2 text-base font-medium"
            >
              Brands
            </a>
            <a
              href="#"
              className="text-gray-300 hover:text-white block px-3 py-2 text-base font-medium"
            >
              Sale
            </a>

            {/* Mobile Action Buttons */}
            <div className="px-3 py-4 space-y-2">
              <Button 
                onClick={() => openAuthModal('login')}
                className="w-full bg-orange-500 hover:bg-orange-600 text-white"
              >
                Sign In
              </Button>
              <Button 
                variant="outline" 
                onClick={toggleCart}
                className="w-full border-gray-600 text-gray-300 hover:text-white hover:bg-gray-800"
              >
                <ShoppingCart className="h-4 w-4 mr-2" />
                Cart ({totalItems})
              </Button>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
