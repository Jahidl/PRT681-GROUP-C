import { ArrowRight, Play, Star } from 'lucide-react';
import { Button } from './ui/button';

const Hero = () => {

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-black">
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <img
          src="/hero/athlete-hero.jpg"
          alt="Professional athlete in action"
          className="w-full h-full object-cover opacity-60"
          onError={(e) => {
            // Fallback gradient if image doesn't load
            e.currentTarget.style.display = 'none';
            e.currentTarget.parentElement!.style.background = 
              'linear-gradient(135deg, #1f2937 0%, #374151 50%, #4b5563 100%)';
          }}
        />
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/50 to-transparent"></div>
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left Column - Main Content */}
          <div className="text-left space-y-8">
            {/* Badge */}
            <div className="inline-flex items-center space-x-2 bg-orange-500/20 border border-orange-500/30 rounded-full px-4 py-2">
              <Star className="h-4 w-4 text-orange-500 fill-current" />
              <span className="text-orange-400 text-sm font-medium">
                #1 Sports Equipment Store
              </span>
            </div>

            {/* Main Headline */}
            <div className="space-y-4">
              <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-white leading-tight">
                Unleash Your
                <span className="block text-orange-500">
                  Athletic
                </span>
                <span className="block">
                  Potential
                </span>
              </h1>
              <p className="text-xl md:text-2xl text-gray-300 leading-relaxed max-w-2xl">
                Discover premium sports equipment, apparel, and accessories designed 
                to elevate your performance and push your limits.
              </p>
            </div>

            {/* Stats */}
            <div className="flex flex-wrap gap-8 py-4">
              <div className="text-center">
                <div className="text-3xl font-bold text-orange-500">50K+</div>
                <div className="text-sm text-gray-400">Happy Athletes</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-orange-500">1000+</div>
                <div className="text-sm text-gray-400">Premium Products</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-orange-500">4.9★</div>
                <div className="text-sm text-gray-400">Customer Rating</div>
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <Button 
                size="lg" 
                className="bg-orange-500 hover:bg-orange-600 text-white px-8 py-4 text-lg font-semibold group"
              >
                Shop Now
                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Button>
              <Button 
                variant="outline" 
                size="lg"
                className="border-gray-600 text-white hover:bg-gray-800 px-8 py-4 text-lg font-semibold group"
              >
                <Play className="mr-2 h-5 w-5" />
                Watch Story
              </Button>
            </div>

            {/* Trust Indicators */}
            <div className="pt-8 border-t border-gray-800">
              <p className="text-sm text-gray-400 mb-4">Trusted by professional athletes worldwide</p>
              <div className="flex items-center space-x-8 opacity-60">
                <div className="text-white font-bold text-lg">Nike</div>
                <div className="text-white font-bold text-lg">Adidas</div>
                <div className="text-white font-bold text-lg">Under Armour</div>
                <div className="text-white font-bold text-lg">Puma</div>
              </div>
            </div>
          </div>

          {/* Right Column - Feature Cards */}
          <div className="hidden lg:block space-y-6">
            {/* Feature Card 1 */}
            <div className="bg-gray-900/80 backdrop-blur-sm border border-gray-700 rounded-xl p-6 hover:border-orange-500/50 transition-colors">
              <div className="flex items-start space-x-4">
                <div className="bg-orange-500 rounded-lg p-3">
                  <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white mb-2">Lightning Fast Delivery</h3>
                  <p className="text-gray-400 text-sm">Get your gear delivered within 24-48 hours with our express shipping.</p>
                </div>
              </div>
            </div>

            {/* Feature Card 2 */}
            <div className="bg-gray-900/80 backdrop-blur-sm border border-gray-700 rounded-xl p-6 hover:border-orange-500/50 transition-colors">
              <div className="flex items-start space-x-4">
                <div className="bg-orange-500 rounded-lg p-3">
                  <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white mb-2">Quality Guaranteed</h3>
                  <p className="text-gray-400 text-sm">Every product is tested and verified by professional athletes.</p>
                </div>
              </div>
            </div>

            {/* Feature Card 3 */}
            <div className="bg-gray-900/80 backdrop-blur-sm border border-gray-700 rounded-xl p-6 hover:border-orange-500/50 transition-colors">
              <div className="flex items-start space-x-4">
                <div className="bg-orange-500 rounded-lg p-3">
                  <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white mb-2">Expert Support</h3>
                  <p className="text-gray-400 text-sm">Get personalized recommendations from our sports specialists.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-10">
        <div className="flex flex-col items-center space-y-2 animate-bounce">
          <span className="text-gray-400 text-sm">Scroll to explore</span>
          <div className="w-6 h-10 border-2 border-gray-400 rounded-full flex justify-center">
            <div className="w-1 h-3 bg-gray-400 rounded-full mt-2 animate-pulse"></div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
