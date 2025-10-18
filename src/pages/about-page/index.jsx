import React from 'react';
import { Helmet } from 'react-helmet';
import PublicHeader from '../../components/ui/PublicHeader';
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
      {/* Footer */}
      <footer className="bg-card border-t border-border py-12">
        <div className="max-w-7xl mx-auto px-4 lg:px-6">
          <div className="grid md:grid-cols-4 gap-8">
            {/* Brand */}
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">BI</span>
                </div>
                <span className="font-bold text-foreground">Basic Intelligence</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Empowering professionals worldwide with practical AI education for career advancement and business growth.
              </p>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="font-semibold text-foreground mb-4">Quick Links</h4>
              <div className="space-y-2">
                <a href="/home-page" className="block text-sm text-muted-foreground hover:text-foreground transition-colors duration-200">
                  Home
                </a>
                <a href="/about-page" className="block text-sm text-muted-foreground hover:text-foreground transition-colors duration-200">
                  About Us
                </a>
                <a href="/join-membership-page" className="block text-sm text-muted-foreground hover:text-foreground transition-colors duration-200">
                  Join Membership
                </a>
              </div>
            </div>

            {/* Contact */}
            <div>
              <h4 className="font-semibold text-foreground mb-4">Contact</h4>
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">
                  hello@basicintelligence.com
                </p>
                <p className="text-sm text-muted-foreground">
                  WhatsApp: +2349062284074
                </p>
                <p className="text-sm text-muted-foreground">
                  Lagos, Nigeria
                </p>
              </div>
            </div>

            {/* Social */}
            <div>
              <h4 className="font-semibold text-foreground mb-4">Follow Us</h4>
              <div className="flex space-x-3">
                <button className="w-8 h-8 bg-muted hover:bg-primary hover:text-white rounded-full flex items-center justify-center transition-colors duration-200">
                  <span className="text-xs font-bold">f</span>
                </button>
                <button className="w-8 h-8 bg-muted hover:bg-primary hover:text-white rounded-full flex items-center justify-center transition-colors duration-200">
                  <span className="text-xs font-bold">t</span>
                </button>
                <button className="w-8 h-8 bg-muted hover:bg-primary hover:text-white rounded-full flex items-center justify-center transition-colors duration-200">
                  <span className="text-xs font-bold">in</span>
                </button>
              </div>
            </div>
          </div>

          <div className="border-t border-border mt-8 pt-8 text-center">
            <p className="text-sm text-muted-foreground">
              © {new Date()?.getFullYear()} Basic Intelligence Community School. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default AboutPage;
