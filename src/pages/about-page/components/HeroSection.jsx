import React from 'react';
import Icon from '../../../components/AppIcon';
import Image from '../../../components/AppImage';
import Button from '../../../components/ui/Button';
import { Link } from 'react-router-dom';

const HeroSection = () => {
  return (
    <section className="relative bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50 py-20 lg:py-32 overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute top-20 left-10 w-72 h-72 bg-gradient-to-br from-orange-400/20 to-orange-400/20 rounded-full blur-3xl animate-pulse-slow"></div>
      <div className="absolute bottom-20 right-10 w-96 h-96 bg-gradient-to-br from-purple-400/20 to-pink-400/20 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: '1s' }}></div>
      
      <div className="relative max-w-7xl mx-auto px-4 lg:px-6">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Content - Enhanced */}
          <div className="space-y-8 animate-fadeIn">
            <div className="space-y-6">
              <div className="inline-flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-orange-100 to-orange-100 rounded-full border border-orange-200 shadow-sm">
                <Icon name="Sparkles" size={16} className="text-orange-600" />
                <span className="text-sm font-bold text-blue-900">Empowering Professionals Worldwide</span>
              </div>
              
              <h1 className="text-5xl lg:text-6xl font-extrabold text-gray-900 leading-tight">
                About{' '}
                <span className="bg-gradient-to-r from-orange-600 via-orange-600 to-pink-600 bg-clip-text text-transparent">
                  Basic Intelligence
                </span>
              </h1>
              
              <p className="text-xl lg:text-2xl text-gray-700 leading-relaxed font-medium">
                We're breaking down the barriers to AI, making it a{' '}
                <span className="font-bold text-gray-900">practical and powerful tool</span>{' '}
                for professionals and entrepreneurs everywhere.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <Link to="/join-membership-page">
                <button className="group px-8 py-4 bg-gradient-to-r from-orange-600 to-orange-600 text-white font-bold rounded-xl shadow-lg hover:shadow-glow-md hover:scale-105 transition-all duration-300 overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-r from-orange-600 to-pink-600 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  <div className="relative flex items-center justify-center space-x-2">
                    <Icon name="UserPlus" size={20} />
                    <span>Join Our Community</span>
                  </div>
                </button>
              </Link>
              
              <button className="group px-8 py-4 bg-white/80 backdrop-blur-sm text-gray-900 font-bold rounded-xl border-2 border-gray-300 hover:border-orange-500 hover:shadow-lg hover:scale-105 transition-all duration-300">
                <div className="flex items-center justify-center space-x-2">
                  <Icon name="MessageCircle" size={20} className="text-orange-600 group-hover:scale-110 transition-transform" />
                  <span>Contact Us</span>
                </div>
              </button>
            </div>

            {/* Quick Stats - Enhanced */}
            <div className="grid grid-cols-3 gap-6 pt-8 border-t-2 border-gray-200">
              <div className="text-center group animate-slideUp" style={{ animationDelay: '0.2s' }}>
                <div className="text-3xl font-extrabold bg-gradient-to-r from-orange-600 to-cyan-600 bg-clip-text text-transparent mb-1">
                  500+
                </div>
                <div className="text-sm font-medium text-gray-600">Active Members</div>
              </div>
              <div className="text-center group animate-slideUp" style={{ animationDelay: '0.3s' }}>
                <div className="text-3xl font-extrabold bg-gradient-to-r from-orange-600 to-pink-600 bg-clip-text text-transparent mb-1">
                  50+
                </div>
                <div className="text-sm font-medium text-gray-600">AI Courses</div>
              </div>
              <div className="text-center group animate-slideUp" style={{ animationDelay: '0.4s' }}>
                <div className="text-3xl font-extrabold bg-gradient-to-r from-emerald-600 to-green-600 bg-clip-text text-transparent mb-1">
                  95%
                </div>
                <div className="text-sm font-medium text-gray-600">Success Rate</div>
              </div>
            </div>
          </div>

          {/* Image - Enhanced */}
          <div className="relative animate-slideUp" style={{ animationDelay: '0.1s' }}>
            <div className="relative overflow-hidden rounded-3xl shadow-2xl border-4 border-white">
              <Image
                src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
                alt="Professionals learning AI technology worldwide"
                className="w-full h-96 lg:h-[500px] object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-blue-900/30 via-purple-900/10 to-transparent"></div>
            </div>
            
            {/* Floating Card - Enhanced */}
            <div className="absolute -bottom-6 -left-6 bg-white rounded-2xl p-5 shadow-2xl border-2 border-gray-200 animate-float">
              <div className="flex items-center space-x-4">
                <div className="w-14 h-14 bg-gradient-to-br from-emerald-500 to-green-600 rounded-2xl flex items-center justify-center shadow-lg">
                  <Icon name="TrendingUp" size={24} color="white" />
                </div>
                <div>
                  <div className="text-sm font-bold text-gray-900">Career Growth</div>
                  <div className="text-xs font-medium text-gray-600">AI-Powered Success</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;

