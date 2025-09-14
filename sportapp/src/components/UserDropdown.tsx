import React, { useState, useRef, useEffect } from 'react';
import { User, Settings, ShoppingBag, Heart, LogOut, CreditCard, MapPin } from 'lucide-react';
import { Button } from './ui/button';
import { useAuth } from '../contexts/AuthContext';

interface UserDropdownProps {
  className?: string;
}

const UserDropdown: React.FC<UserDropdownProps> = ({ className = '' }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const { user, isAuthenticated, logout, openAuthModal } = useAuth();

  const handleMouseEnter = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setIsOpen(true);
  };

  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => {
      setIsOpen(false);
    }, 150);
  };

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const menuItems = [
    { icon: ShoppingBag, label: 'My Orders', href: '/orders' },
    { icon: Heart, label: 'Wishlist', href: '/wishlist' },
    { icon: CreditCard, label: 'Payment Methods', href: '/payment' },
    { icon: MapPin, label: 'Addresses', href: '/addresses' },
    { icon: Settings, label: 'Account Settings', href: '/settings' },
  ];

  if (!isAuthenticated || !user) {
    return (
      <Button 
        onClick={() => openAuthModal('login')}
        className="bg-orange-500 hover:bg-orange-600 text-white"
      >
        Sign In
      </Button>
    );
  }

  const displayName = `${user.firstName} ${user.lastName}`;

  return (
    <div
      className={`relative ${className}`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      ref={dropdownRef}
    >
      {/* User Avatar/Trigger */}
      <button className="flex items-center space-x-2 text-gray-300 hover:text-white p-2 rounded-md transition-colors">
        <div className="w-8 h-8 bg-gray-700 rounded-full flex items-center justify-center">
          {user.avatar ? (
            <img src={user.avatar} alt={displayName} className="w-8 h-8 rounded-full" />
          ) : (
            <User className="h-4 w-4" />
          )}
        </div>
        <span className="hidden md:block text-sm font-medium">
          {user.firstName}
        </span>
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute top-full right-0 mt-2 w-64 bg-gray-900 border border-gray-700 rounded-lg shadow-xl z-50 animate-fade-in">
          {/* User Info Header */}
          <div className="px-4 py-3 border-b border-gray-700">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gray-700 rounded-full flex items-center justify-center">
                {user.avatar ? (
                  <img src={user.avatar} alt={displayName} className="w-10 h-10 rounded-full" />
                ) : (
                  <User className="h-5 w-5 text-gray-300" />
                )}
              </div>
              <div>
                <div className="text-sm font-medium text-white">{displayName}</div>
                <div className="text-xs text-gray-400">{user.email}</div>
              </div>
            </div>
          </div>

          {/* Menu Items */}
          <div className="py-2">
            {menuItems.map((item, index) => (
              <a
                key={index}
                href={item.href}
                className="flex items-center space-x-3 px-4 py-2 text-sm text-gray-300 hover:text-white hover:bg-gray-800 transition-colors"
              >
                <item.icon className="h-4 w-4" />
                <span>{item.label}</span>
              </a>
            ))}
          </div>

          {/* Logout */}
          <div className="border-t border-gray-700 py-2">
            <button 
              onClick={logout}
              className="flex items-center space-x-3 w-full px-4 py-2 text-sm text-gray-300 hover:text-white hover:bg-gray-800 transition-colors"
            >
              <LogOut className="h-4 w-4" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserDropdown;
