import React, { useState } from 'react';
import { Facebook, Twitter, Instagram, Youtube, Mail, Phone, MapPin } from 'lucide-react';
import { Button } from './ui/button';

const Footer = () => {
  const [email, setEmail] = useState('');
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isValidEmail, setIsValidEmail] = useState(true);

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email.trim()) {
      setIsValidEmail(false);
      return;
    }

    if (!validateEmail(email)) {
      setIsValidEmail(false);
      return;
    }

    setIsValidEmail(true);
    setIsSubscribed(true);
    
    // In a real app, you would send this to your backend
    console.log('Newsletter subscription:', email);
    
    // Reset after 3 seconds
    setTimeout(() => {
      setIsSubscribed(false);
      setEmail('');
    }, 3000);
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
    if (!isValidEmail) {
      setIsValidEmail(true);
    }
  };
  return (
    <footer className="bg-black border-t border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="space-y-4">
            <div className="flex items-center">
              <h2 className="text-2xl font-bold text-white">
                Sport<span className="text-orange-500">Store</span>
              </h2>
            </div>
            <p className="text-gray-400 text-sm leading-relaxed">
              Your premier destination for high-quality sports equipment, apparel, and accessories. 
              Empowering athletes of all levels to achieve their best performance.
            </p>
            <div className="flex space-x-4">
              <Button variant="ghost" size="icon" className="text-gray-400 hover:text-orange-500">
                <Facebook className="h-5 w-5" />
              </Button>
              <Button variant="ghost" size="icon" className="text-gray-400 hover:text-orange-500">
                <Twitter className="h-5 w-5" />
              </Button>
              <Button variant="ghost" size="icon" className="text-gray-400 hover:text-orange-500">
                <Instagram className="h-5 w-5" />
              </Button>
              <Button variant="ghost" size="icon" className="text-gray-400 hover:text-orange-500">
                <Youtube className="h-5 w-5" />
              </Button>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <a href="#" className="text-gray-400 hover:text-white text-sm transition-colors">
                  Home
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-400 hover:text-white text-sm transition-colors">
                  All Products
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-400 hover:text-white text-sm transition-colors">
                  New Arrivals
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-400 hover:text-white text-sm transition-colors">
                  Sale Items
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-400 hover:text-white text-sm transition-colors">
                  Gift Cards
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-400 hover:text-white text-sm transition-colors">
                  Size Guide
                </a>
              </li>
            </ul>
          </div>

          {/* Categories */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white">Categories</h3>
            <ul className="space-y-2">
              <li>
                <a href="#" className="text-gray-400 hover:text-white text-sm transition-colors">
                  Fitness Equipment
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-400 hover:text-white text-sm transition-colors">
                  Team Sports
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-400 hover:text-white text-sm transition-colors">
                  Outdoor Sports
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-400 hover:text-white text-sm transition-colors">
                  Athletic Apparel
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-400 hover:text-white text-sm transition-colors">
                  Sports Accessories
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-400 hover:text-white text-sm transition-colors">
                  Footwear
                </a>
              </li>
            </ul>
          </div>

          {/* Contact & Newsletter */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white">Contact Us</h3>
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <Phone className="h-4 w-4 text-gray-400" />
                <span className="text-gray-400 text-sm">1-800-SPORT-01</span>
              </div>
              <div className="flex items-center space-x-3">
                <Mail className="h-4 w-4 text-gray-400" />
                <span className="text-gray-400 text-sm">support@sportapp.com</span>
              </div>
              <div className="flex items-start space-x-3">
                <MapPin className="h-4 w-4 text-gray-400 mt-0.5" />
                <span className="text-gray-400 text-sm">
                  123 Sports Avenue<br />
                  Athletic City, AC 12345
                </span>
              </div>
            </div>

            {/* Newsletter Signup */}
            <div className="pt-4">
              <h4 className="text-sm font-semibold text-white mb-2">Stay Updated</h4>
              <form onSubmit={handleNewsletterSubmit} className="space-y-2">
                <div className="flex space-x-2">
                  <input
                    type="email"
                    value={email}
                    onChange={handleEmailChange}
                    placeholder="Enter your email"
                    className={`flex-1 px-3 py-2 bg-gray-900 border rounded-md text-white placeholder-gray-400 text-sm focus:outline-none focus:ring-2 transition-colors ${
                      !isValidEmail 
                        ? 'border-red-500 focus:ring-red-500 focus:border-red-500' 
                        : 'border-gray-700 focus:ring-orange-500 focus:border-orange-500'
                    }`}
                  />
                  <Button 
                    type="submit"
                    className={`px-4 py-2 text-sm transition-all ${
                      isSubscribed 
                        ? 'bg-green-600 hover:bg-green-700' 
                        : 'bg-orange-500 hover:bg-orange-600'
                    } text-white`}
                  >
                    {isSubscribed ? '✓ Subscribed!' : 'Subscribe'}
                  </Button>
                </div>
                {!isValidEmail && (
                  <p className="text-xs text-red-400">
                    Please enter a valid email address.
                  </p>
                )}
                {isSubscribed ? (
                  <p className="text-xs text-green-400">
                    Thank you for subscribing! You'll receive our latest updates.
                  </p>
                ) : (
                  <p className="text-xs text-gray-500">
                    Get the latest deals and product updates.
                  </p>
                )}
              </form>
            </div>
          </div>
        </div>

        {/* Customer Service Links */}
        <div className="mt-8 pt-8 border-t border-gray-800">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div>
              <h4 className="text-sm font-semibold text-white mb-2">Customer Service</h4>
              <ul className="space-y-1">
                <li>
                  <a href="#" className="text-gray-400 hover:text-white text-xs transition-colors">
                    Help Center
                  </a>
                </li>
                <li>
                  <a href="#" className="text-gray-400 hover:text-white text-xs transition-colors">
                    Track Your Order
                  </a>
                </li>
                <li>
                  <a href="#" className="text-gray-400 hover:text-white text-xs transition-colors">
                    Returns & Exchanges
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-white mb-2">Company</h4>
              <ul className="space-y-1">
                <li>
                  <a href="#" className="text-gray-400 hover:text-white text-xs transition-colors">
                    About Us
                  </a>
                </li>
                <li>
                  <a href="#" className="text-gray-400 hover:text-white text-xs transition-colors">
                    Careers
                  </a>
                </li>
                <li>
                  <a href="#" className="text-gray-400 hover:text-white text-xs transition-colors">
                    Press
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-white mb-2">Legal</h4>
              <ul className="space-y-1">
                <li>
                  <a href="#" className="text-gray-400 hover:text-white text-xs transition-colors">
                    Privacy Policy
                  </a>
                </li>
                <li>
                  <a href="#" className="text-gray-400 hover:text-white text-xs transition-colors">
                    Terms of Service
                  </a>
                </li>
                <li>
                  <a href="#" className="text-gray-400 hover:text-white text-xs transition-colors">
                    Cookie Policy
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-white mb-2">Connect</h4>
              <ul className="space-y-1">
                <li>
                  <a href="#" className="text-gray-400 hover:text-white text-xs transition-colors">
                    Store Locator
                  </a>
                </li>
                <li>
                  <a href="#" className="text-gray-400 hover:text-white text-xs transition-colors">
                    Affiliate Program
                  </a>
                </li>
                <li>
                  <a href="#" className="text-gray-400 hover:text-white text-xs transition-colors">
                    Wholesale
                  </a>
                </li>
              </ul>
            </div>
          </div>

          {/* Copyright */}
          <div className="flex flex-col md:flex-row justify-between items-center pt-4 border-t border-gray-800">
            <p className="text-gray-400 text-xs">
              © 2024 sportapp. All rights reserved.
            </p>
            <div className="flex items-center space-x-4 mt-2 md:mt-0">
              <span className="text-gray-400 text-xs">We accept:</span>
              <div className="flex space-x-2">
                <div className="bg-gray-800 px-2 py-1 rounded text-xs text-gray-300">VISA</div>
                <div className="bg-gray-800 px-2 py-1 rounded text-xs text-gray-300">MC</div>
                <div className="bg-gray-800 px-2 py-1 rounded text-xs text-gray-300">AMEX</div>
                <div className="bg-gray-800 px-2 py-1 rounded text-xs text-gray-300">PayPal</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
