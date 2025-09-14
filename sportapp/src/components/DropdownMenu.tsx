import { useState, useRef, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';

interface DropdownItem {
  label: string;
  href: string;
  description?: string;
}

interface DropdownMenuProps {
  trigger: string;
  items: DropdownItem[];
  className?: string;
}

const DropdownMenu: React.FC<DropdownMenuProps> = ({ trigger, items, className = '' }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

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

  return (
    <div
      className={`relative ${className}`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      ref={dropdownRef}
    >
      {/* Trigger */}
      <button className="flex items-center space-x-1 text-gray-300 hover:text-white px-3 py-2 text-sm font-medium transition-colors">
        <span>{trigger}</span>
        <ChevronDown 
          className={`h-4 w-4 transition-transform duration-200 ${
            isOpen ? 'rotate-180' : ''
          }`} 
        />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute top-full left-0 mt-1 w-80 bg-gray-900 border border-gray-700 rounded-lg shadow-xl z-50 animate-fade-in">
          <div className="py-2">
            {items.map((item, index) => (
              <a
                key={index}
                href={item.href}
                className="block px-4 py-3 text-sm text-gray-300 hover:text-white hover:bg-gray-800 transition-colors"
              >
                <div className="font-medium">{item.label}</div>
                {item.description && (
                  <div className="text-xs text-gray-500 mt-1">{item.description}</div>
                )}
              </a>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default DropdownMenu;
