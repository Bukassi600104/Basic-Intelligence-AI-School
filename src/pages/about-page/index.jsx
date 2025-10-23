import React from 'react';
import { Helmet } from 'react-helmet';
import PublicHeader from '../../components/ui/PublicHeader';
import WhatsAppButton from '../../components/ui/WhatsAppButton';
import HeroSection from './components/HeroSection';
import MissionSection from './components/MissionSection';
import MethodologySection from './components/MethodologySection';
import CallToActionSection from './components/CallToActionSection';

const AboutPage = () => {
  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>About Us - Basic Intelligence Community School</title>
        <meta name="description" content="Learn about Basic Intelligence's mission to democratize AI education for professionals everywhere. Discover our methodology and approach dedicated to your success." />
        <meta name="keywords" content="AI education, artificial intelligence training, global professionals, Basic Intelligence, AI courses" />
        <meta property="og:title" content="About Basic Intelligence - AI Education for Professionals Worldwide" />
        <meta property="og:description" content="Transforming careers through practical AI education. Join our global community of professionals learning cutting-edge artificial intelligence skills." />
        <meta property="og:type" content="website" />
        <link rel="canonical" href="/about-page" />
      </Helmet>
      <PublicHeader />
      <main className="pt-16">
        <HeroSection />
        <MissionSection />
        <MethodologySection />
        <CallToActionSection />
      </main>
      {/* Footer - Enhanced */}
      <footer className="relative overflow-hidden bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 border-t border-white/10">
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl"></div>
        
        <div className="relative max-w-7xl mx-auto px-4 lg:px-6 py-12">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            {/* Brand */}
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                  <span className="text-white font-bold">BI</span>
                </div>
                <span className="font-bold text-white text-lg">Basic Intelligence</span>
              </div>
              <p className="text-sm text-gray-300 leading-relaxed">
                Empowering professionals worldwide with practical AI education for career advancement and business growth.
              </p>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="font-bold text-white mb-4 flex items-center">
                <div className="w-1 h-5 bg-gradient-to-b from-blue-500 to-purple-600 rounded-full mr-2"></div>
                Quick Links
              </h4>
              <div className="space-y-2">
                <a href="/home-page" className="block text-sm text-gray-300 hover:text-white hover:translate-x-1 transition-all duration-200">
                  → Home
                </a>
                <a href="/about-page" className="block text-sm text-gray-300 hover:text-white hover:translate-x-1 transition-all duration-200">
                  → About Us
                </a>
                <a href="/join-membership-page" className="block text-sm text-gray-300 hover:text-white hover:translate-x-1 transition-all duration-200">
                  → Join Membership
                </a>
              </div>
            </div>

            {/* Contact */}
            <div>
              <h4 className="font-bold text-white mb-4 flex items-center">
                <div className="w-1 h-5 bg-gradient-to-b from-blue-500 to-purple-600 rounded-full mr-2"></div>
                Contact
              </h4>
              <div className="space-y-3">
                <p className="text-sm text-gray-300 hover:text-white transition-colors">
                  📧 hello@basicintelligence.com
                </p>
                <div className="flex items-center">
                  <span className="mr-2">💬</span>
                  <WhatsAppButton variant="inline" className="text-sm text-gray-300 hover:text-green-300" />
                </div>
                <p className="text-sm text-gray-300 hover:text-white transition-colors">
                  📍 Lagos, Nigeria
                </p>
              </div>
            </div>

            {/* Social */}
            <div>
              <h4 className="font-bold text-white mb-4 flex items-center">
                <div className="w-1 h-5 bg-gradient-to-b from-blue-500 to-purple-600 rounded-full mr-2"></div>
                Follow Us
              </h4>
              <div className="flex space-x-3">
                <button className="w-10 h-10 bg-white/10 hover:bg-gradient-to-br hover:from-blue-500 hover:to-purple-600 backdrop-blur-sm rounded-xl flex items-center justify-center transition-all duration-300 hover:scale-110 border border-white/20">
                  <span className="text-sm font-bold text-white">f</span>
                </button>
                <button className="w-10 h-10 bg-white/10 hover:bg-gradient-to-br hover:from-blue-500 hover:to-purple-600 backdrop-blur-sm rounded-xl flex items-center justify-center transition-all duration-300 hover:scale-110 border border-white/20">
                  <span className="text-sm font-bold text-white">t</span>
                </button>
                <button className="w-10 h-10 bg-white/10 hover:bg-gradient-to-br hover:from-blue-500 hover:to-purple-600 backdrop-blur-sm rounded-xl flex items-center justify-center transition-all duration-300 hover:scale-110 border border-white/20">
                  <span className="text-sm font-bold text-white">in</span>
                </button>
              </div>
            </div>
          </div>

          <div className="border-t border-white/10 pt-8 text-center">
            <p className="text-sm text-gray-300">
              © {new Date()?.getFullYear()} <span className="font-bold text-white">Basic Intelligence Community School</span>. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default AboutPage;
