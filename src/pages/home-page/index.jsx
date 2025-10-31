import React from 'react';
import { Helmet } from 'react-helmet';
import PublicHeader from '../../components/ui/PublicHeader';
import Footer from '../../components/ui/Footer';
import HeroSection from './components/HeroSection';
import FeaturesGrid from './components/FeaturesGrid';
import ReviewCarousel from '../../components/ui/ReviewCarousel';
import CourseHighlights from './components/CourseHighlights';
import ContactSection from './components/ContactSection';

const HomePage = () => {
  return (
    <>
      <Helmet>
        <title>Basic Intelligence</title>
        <meta 
          name="description" 
          content="Master AI skills with Basic Intelligence. Join our growing AI education community. Practical courses, expert instructors, and lifetime access." 
        />
        <meta name="keywords" content="AI education, artificial intelligence courses, machine learning training, AI certification, Basic Intelligence" />
        <meta property="og:title" content="Basic Intelligence - Master AI Skills" />
        <meta property="og:description" content="Join our AI education platform. Learn practical AI skills with expert instructors and community support." />
        <meta property="og:type" content="website" />
        <link rel="canonical" href="/home-page" />
      </Helmet>
      <div className="min-h-screen bg-background">
        <PublicHeader />
        
        <main className="pt-16">
          {/* Hero Section - Orange gradient */}
          <HeroSection />
          
          {/* Decorative Divider */}
          <div className="relative h-24 bg-gradient-to-b from-orange-50 to-white">
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-1 h-12 bg-gradient-to-b from-orange-400/50 to-transparent"></div>
            </div>
          </div>
          
          {/* Features Section - White to gray gradient */}
          <FeaturesGrid />
          
          {/* Decorative Divider with Icon */}
          <div className="relative h-32 bg-gradient-to-b from-gray-50 via-orange-50 to-indigo-50">
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="flex flex-col items-center space-y-4">
                <div className="w-16 h-0.5 bg-gradient-to-r from-transparent via-orange-400 to-transparent"></div>
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center shadow-lg">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                  </svg>
                </div>
                <div className="w-16 h-0.5 bg-gradient-to-r from-transparent via-orange-400 to-transparent"></div>
              </div>
            </div>
          </div>
          
          {/* Reviews Section - Indigo gradient */}
          <div className="py-24 lg:py-32 bg-gradient-to-br from-indigo-50 via-purple-50 to-indigo-100">
            <div className="max-w-7xl mx-auto px-6 lg:px-8">
              {/* Section Header */}
              <div className="text-center max-w-3xl mx-auto mb-16">
                <div className="inline-block px-4 py-2 bg-gradient-to-r from-indigo-100 to-purple-100 rounded-full mb-4">
                  <span className="text-sm font-semibold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                    Student Success Stories
                  </span>
                </div>
                <h2 className="text-3xl md:text-4xl lg:text-5xl font-extrabold mb-6">
                  <span className="bg-gradient-to-r from-indigo-900 via-purple-900 to-indigo-800 bg-clip-text text-transparent">
                    Hear From Our Community
                  </span>
                </h2>
                <p className="text-base md:text-lg text-gray-700 leading-relaxed">
                  Join hundreds of professionals who have transformed their careers with AI skills
                </p>
              </div>
              
              <ReviewCarousel />
            </div>
          </div>
          
          {/* Wave Divider */}
          <div className="relative h-24 bg-gradient-to-b from-indigo-100 to-emerald-50">
            <svg className="absolute bottom-0 w-full" viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M0 0L60 10C120 20 240 40 360 46.7C480 53 600 47 720 43.3C840 40 960 40 1080 46.7C1200 53 1320 67 1380 73.3L1440 80V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0V0Z" fill="url(#paint0_linear)" fillOpacity="0.3"/>
              <defs>
                <linearGradient id="paint0_linear" x1="720" y1="0" x2="720" y2="120" gradientUnits="userSpaceOnUse">
                  <stop stopColor="#10b981"/>
                  <stop offset="1" stopColor="#059669"/>
                </linearGradient>
              </defs>
            </svg>
          </div>
          
          {/* Course Highlights Section - Emerald gradient */}
          <div className="bg-gradient-to-br from-emerald-50 via-teal-50 to-emerald-100">
            <CourseHighlights />
          </div>
          
          {/* Diagonal Divider */}
          <div className="relative h-32 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-100 to-orange-50">
              <svg className="absolute inset-0 w-full h-full" preserveAspectRatio="none" viewBox="0 0 100 100">
                <polygon points="0,0 100,0 100,100" fill="url(#grad1)" />
                <defs>
                  <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" style={{ stopColor: '#d1fae5', stopOpacity: 1 }} />
                    <stop offset="100%" style={{ stopColor: '#fed7aa', stopOpacity: 1 }} />
                  </linearGradient>
                </defs>
              </svg>
            </div>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-24 h-0.5 bg-gradient-to-r from-emerald-400 via-orange-400 to-emerald-400"></div>
            </div>
          </div>
          
          {/* Contact Section - Orange to gray gradient */}
          <div className="bg-gradient-to-b from-orange-50 to-gray-100">
            <ContactSection />
          </div>
        </main>

        <Footer />
      </div>
    </>
  );
};

export default HomePage;
