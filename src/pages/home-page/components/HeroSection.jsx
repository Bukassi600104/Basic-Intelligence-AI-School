import React from 'react';
import { Link } from 'react-router-dom';
import Icon from '../../../components/AppIcon';
import { Button } from '@/components/ui/button.tsx';

const HeroSection = () => {
  return (
    <section className="relative bg-gradient-to-br from-orange-50 via-gray-50 to-orange-50 py-20 lg:py-32 overflow-hidden">
      {/* Animated Background Gradients - Orange Theme */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-0 left-0 w-64 h-64 bg-gradient-to-br from-orange-400/30 to-orange-500/30 rounded-full blur-3xl animate-pulse-slow"></div>
        <div className="absolute bottom-0 right-0 w-64 h-64 bg-gradient-to-br from-orange-500/30 to-orange-600/30 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: '1s' }}></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-br from-orange-300/20 to-orange-400/20 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: '2s' }}></div>
      </div>

      {/* Floating Decorative Elements - Orange Theme */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-12 left-10 w-12 h-12 border-2 border-orange-400/20 rounded-xl rotate-12 animate-float"></div>
        <div className="absolute top-24 right-20 w-10 h-10 border-2 border-orange-500/20 rounded-full animate-float" style={{ animationDelay: '0.5s' }}></div>
        <div className="absolute bottom-20 left-1/4 w-8 h-8 border-2 border-orange-400/20 rounded-lg -rotate-6 animate-float" style={{ animationDelay: '1s' }}></div>
        <div className="absolute bottom-12 right-1/3 w-10 h-10 border-2 border-orange-500/20 rounded-full animate-float" style={{ animationDelay: '1.5s' }}></div>
      </div>

      <div className="relative max-w-7xl mx-auto px-6 lg:px-8">
        <div className="text-center max-w-4xl mx-auto">
          {/* Animated Badge - Orange Theme */}
          <div className="inline-flex items-center space-x-2 px-5 py-2.5 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-full text-sm font-semibold mb-8 shadow-lg animate-scaleIn hover:shadow-xl hover:scale-105 transition-all duration-300">
            <Icon name="Sparkles" size={16} className="animate-pulse" />
            <span>AI Education Platform</span>
            <div className="w-2 h-2 bg-white rounded-full animate-ping"></div>
          </div>

          {/* Main Heading with Gradient Text - Orange Theme */}
          <h1 className="text-4xl md:text-5xl lg:text-7xl font-extrabold mb-8 leading-tight animate-fadeIn">
            <span className="bg-gradient-to-r from-orange-600 via-orange-500 to-orange-600 bg-clip-text text-transparent">
              Learn AI.
            </span>
            <br />
            <span className="text-gray-900">
              Get Real Results.
            </span>
          </h1>

          {/* Subheading with enhanced styling */}
          <p className="text-base md:text-lg lg:text-xl text-gray-700 mb-6 max-w-3xl mx-auto leading-relaxed animate-slideUp" style={{ animationDelay: '0.2s' }}>
            Welcome to{' '}
            <span className="font-bold text-gray-900">Basic Intelligence</span>, the simplest way to learn how AI can grow your business or career. We'll show you exactly how to use it to create new things, open up revenue streams, and innovate in your field.
          </p>
          <p className="text-base md:text-lg lg:text-xl font-semibold text-gray-800 mb-10 animate-slideUp" style={{ animationDelay: '0.3s' }}>
            No jargon, just practical skills for the real world.
          </p>

          {/* Key Benefits with Icons - Orange Theme */}
          <div className="flex flex-wrap justify-center items-center gap-4 mb-10 animate-slideUp" style={{ animationDelay: '0.4s' }}>
            {[
              { icon: 'CheckCircle', text: 'Practical AI Projects', color: 'text-emerald-600' },
              { icon: 'Users', text: 'Expert Instructors', color: 'text-orange-600' },
              { icon: 'MessageCircle', text: 'Community Support', color: 'text-orange-600' },
              { icon: 'Zap', text: 'Prompt Library', color: 'text-amber-600' },
            ].map((benefit, index) => (
              <div
                key={index}
                className="flex items-center space-x-2 px-5 py-3 bg-white/90 backdrop-blur-sm rounded-xl shadow-md hover:shadow-lg hover:scale-105 transition-all duration-300"
              >
                <Icon name={benefit.icon} size={18} className={benefit.color} />
                <span className="text-sm font-medium text-gray-700">{benefit.text}</span>
              </div>
            ))}
          </div>

          {/* CTA Buttons with Orange Theme */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12 animate-slideUp" style={{ animationDelay: '0.5s' }}>
            <Link to="/join-membership-page" className="w-full sm:w-auto">
              <Button 
                size="lg"
                className="w-full sm:w-auto bg-gradient-to-r from-orange-600 to-orange-500 hover:from-orange-500 hover:to-orange-600 text-white shadow-lg hover:shadow-xl hover:shadow-orange-500/50"
              >
                <span>Join Now</span>
                <Icon name="ArrowRight" size={20} className="ml-2" />
              </Button>
            </Link>
            
            <Link to="/about-page" className="w-full sm:w-auto">
              <Button 
                size="lg"
                variant="outline"
                className="w-full sm:w-auto bg-white/90 backdrop-blur-sm border-2 hover:border-orange-500"
              >
                <Icon name="Info" size={20} className="mr-2" />
                <span>Learn More</span>
              </Button>
            </Link>
          </div>

          {/* Trust Indicators with Orange Theme */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-6 animate-slideUp" style={{ animationDelay: '0.6s' }}>
            {[
              { icon: 'Users', text: '500+ Active Members', color: 'from-orange-500 to-orange-600' },
              { icon: 'Star', text: '4.9/5 Rating', color: 'from-amber-500 to-orange-500' },
              { icon: 'Video', text: 'Live Lessons', color: 'from-orange-500 to-orange-600' },
            ].map((indicator, index) => (
              <div
                key={index}
                className="flex items-center space-x-3 px-5 py-3 bg-white/90 backdrop-blur-sm rounded-xl shadow-md hover:shadow-lg hover:scale-105 transition-all duration-300"
              >
                <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${indicator.color} flex items-center justify-center shadow-sm`}>
                  <Icon name={indicator.icon} size={20} className="text-white" />
                </div>
                <span className="text-sm font-bold text-gray-800">{indicator.text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
