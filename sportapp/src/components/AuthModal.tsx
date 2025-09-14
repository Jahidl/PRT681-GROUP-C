import React, { useState, useEffect } from 'react';
import { X, Eye, EyeOff, Mail, Lock, User, Phone, Loader2 } from 'lucide-react';
import { Button } from './ui/button';
import { useAuth } from '../contexts/AuthContext';
import type { RegisterData } from '../contexts/AuthContext';

const AuthModal: React.FC = () => {
  const { 
    showAuthModal, 
    authMode, 
    isLoading, 
    error, 
    login, 
    register, 
    forgotPassword, 
    hideAuthModal, 
    clearError,
    openAuthModal
  } = useAuth();

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
    phone: '',
    acceptTerms: false,
    newsletter: false,
    rememberMe: false
  });

  // Reset form when modal opens/closes or mode changes
  useEffect(() => {
    if (showAuthModal) {
      setFormData({
        email: '',
        password: '',
        confirmPassword: '',
        firstName: '',
        lastName: '',
        phone: '',
        acceptTerms: false,
        newsletter: false,
        rememberMe: false
      });
      setShowPassword(false);
      setShowConfirmPassword(false);
      clearError();
    }
  }, [showAuthModal, authMode]); // Removed clearError from dependencies to prevent infinite loop

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();

    try {
      if (authMode === 'login') {
        await login(formData.email, formData.password);
      } else if (authMode === 'register') {
        // Validation
        if (formData.password !== formData.confirmPassword) {
          throw new Error('Passwords do not match');
        }
        if (!formData.acceptTerms) {
          throw new Error('You must accept the terms and conditions');
        }

        const registerData: RegisterData = {
          email: formData.email,
          password: formData.password,
          firstName: formData.firstName,
          lastName: formData.lastName,
          phone: formData.phone || undefined,
          acceptTerms: formData.acceptTerms,
          newsletter: formData.newsletter
        };

        await register(registerData);
      } else if (authMode === 'forgot-password') {
        await forgotPassword(formData.email);
        // Show success message or redirect
        alert('Password reset email sent! Check your inbox.');
        hideAuthModal();
      }
    } catch (error) {
      // Error is handled by the auth context
      console.error('Auth error:', error);
    }
  };

  if (!showAuthModal) return null;

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
        onClick={hideAuthModal}
      />
      
      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="bg-gray-900 border border-gray-800 rounded-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-800">
            <h2 className="text-xl font-semibold text-white">
              {authMode === 'login' && 'Sign In'}
              {authMode === 'register' && 'Create Account'}
              {authMode === 'forgot-password' && 'Reset Password'}
            </h2>
            <Button
              size="icon"
              variant="ghost"
              onClick={hideAuthModal}
              className="text-gray-400 hover:text-white"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>

          {/* Content */}
          <div className="p-6">
            {/* Demo Credentials Notice */}
            {authMode === 'login' && (
              <div className="mb-6 p-4 bg-orange-500/10 border border-orange-500/20 rounded-lg">
                <h3 className="text-sm font-medium text-orange-400 mb-2">Demo Credentials</h3>
                <p className="text-xs text-gray-300 mb-2">Use these credentials to test the login:</p>
                <div className="text-xs text-gray-400 space-y-1">
                  <div><strong>Email:</strong> demo@sportapp.com</div>
                  <div><strong>Password:</strong> demo123</div>
                </div>
              </div>
            )}

            {/* Error Message */}
            {error && (
              <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
                <p className="text-sm text-red-400">{error}</p>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Register Fields */}
              {authMode === 'register' && (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="firstName" className="block text-sm font-medium text-gray-300 mb-2">
                        First Name *
                      </label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <input
                          type="text"
                          id="firstName"
                          name="firstName"
                          value={formData.firstName}
                          onChange={handleInputChange}
                          required
                          className="w-full pl-10 pr-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                          placeholder="John"
                        />
                      </div>
                    </div>
                    <div>
                      <label htmlFor="lastName" className="block text-sm font-medium text-gray-300 mb-2">
                        Last Name *
                      </label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <input
                          type="text"
                          id="lastName"
                          name="lastName"
                          value={formData.lastName}
                          onChange={handleInputChange}
                          required
                          className="w-full pl-10 pr-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                          placeholder="Doe"
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <label htmlFor="phone" className="block text-sm font-medium text-gray-300 mb-2">
                      Phone Number
                    </label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <input
                        type="tel"
                        id="phone"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        className="w-full pl-10 pr-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                        placeholder="+1 (555) 123-4567"
                      />
                    </div>
                  </div>
                </>
              )}

              {/* Email Field */}
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
                  Email Address *
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    className="w-full pl-10 pr-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    placeholder="john@example.com"
                  />
                </div>
              </div>

              {/* Password Fields */}
              {authMode !== 'forgot-password' && (
                <>
                  <div>
                    <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-2">
                      Password *
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        id="password"
                        name="password"
                        value={formData.password}
                        onChange={handleInputChange}
                        required
                        className="w-full pl-10 pr-12 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                        placeholder="••••••••"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>

                  {authMode === 'register' && (
                    <div>
                      <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-300 mb-2">
                        Confirm Password *
                      </label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <input
                          type={showConfirmPassword ? 'text' : 'password'}
                          id="confirmPassword"
                          name="confirmPassword"
                          value={formData.confirmPassword}
                          onChange={handleInputChange}
                          required
                          className="w-full pl-10 pr-12 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                          placeholder="••••••••"
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
                        >
                          {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                    </div>
                  )}
                </>
              )}

              {/* Checkboxes */}
              {authMode === 'login' && (
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="rememberMe"
                    name="rememberMe"
                    checked={formData.rememberMe}
                    onChange={handleInputChange}
                    className="h-4 w-4 text-orange-500 focus:ring-orange-500 border-gray-600 rounded bg-gray-800"
                  />
                  <label htmlFor="rememberMe" className="ml-2 text-sm text-gray-300">
                    Remember me
                  </label>
                </div>
              )}

              {authMode === 'register' && (
                <div className="space-y-3">
                  <div className="flex items-start">
                    <input
                      type="checkbox"
                      id="acceptTerms"
                      name="acceptTerms"
                      checked={formData.acceptTerms}
                      onChange={handleInputChange}
                      required
                      className="h-4 w-4 text-orange-500 focus:ring-orange-500 border-gray-600 rounded bg-gray-800 mt-0.5"
                    />
                    <label htmlFor="acceptTerms" className="ml-2 text-sm text-gray-300">
                      I agree to the{' '}
                      <a href="#" className="text-orange-500 hover:text-orange-400">
                        Terms of Service
                      </a>{' '}
                      and{' '}
                      <a href="#" className="text-orange-500 hover:text-orange-400">
                        Privacy Policy
                      </a>
                    </label>
                  </div>
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="newsletter"
                      name="newsletter"
                      checked={formData.newsletter}
                      onChange={handleInputChange}
                      className="h-4 w-4 text-orange-500 focus:ring-orange-500 border-gray-600 rounded bg-gray-800"
                    />
                    <label htmlFor="newsletter" className="ml-2 text-sm text-gray-300">
                      Subscribe to our newsletter for deals and updates
                    </label>
                  </div>
                </div>
              )}

              {/* Submit Button */}
              <Button
                type="submit"
                disabled={isLoading}
                className="w-full bg-orange-500 hover:bg-orange-600 text-white py-3 text-lg font-semibold"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    {authMode === 'login' && 'Signing In...'}
                    {authMode === 'register' && 'Creating Account...'}
                    {authMode === 'forgot-password' && 'Sending Email...'}
                  </>
                ) : (
                  <>
                    {authMode === 'login' && 'Sign In'}
                    {authMode === 'register' && 'Create Account'}
                    {authMode === 'forgot-password' && 'Send Reset Email'}
                  </>
                )}
              </Button>
            </form>

            {/* Footer Links */}
            <div className="mt-6 text-center space-y-2">
              {authMode === 'login' && (
                <>
                  <button
                    onClick={() => openAuthModal('forgot-password')}
                    className="text-sm text-orange-500 hover:text-orange-400"
                  >
                    Forgot your password?
                  </button>
                  <div className="text-sm text-gray-400">
                    Don't have an account?{' '}
                    <button
                      onClick={() => openAuthModal('register')}
                      className="text-orange-500 hover:text-orange-400"
                    >
                      Sign up
                    </button>
                  </div>
                </>
              )}

              {authMode === 'register' && (
                <div className="text-sm text-gray-400">
                  Already have an account?{' '}
                  <button
                    onClick={() => openAuthModal('login')}
                    className="text-orange-500 hover:text-orange-400"
                  >
                    Sign in
                  </button>
                </div>
              )}

              {authMode === 'forgot-password' && (
                <div className="text-sm text-gray-400">
                  Remember your password?{' '}
                  <button
                    onClick={() => openAuthModal('login')}
                    className="text-orange-500 hover:text-orange-400"
                  >
                    Sign in
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default AuthModal;
