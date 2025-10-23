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
          <HeroSection />
          <FeaturesGrid />
          <div className="py-16 lg:py-24">
            <div className="max-w-7xl mx-auto px-4 lg:px-6">
              <ReviewCarousel />
            </div>
          </div>
          <CourseHighlights />
          <ContactSection />
        </main>

        <Footer />
      </div>
    </>
  );
};

export default HomePage;
