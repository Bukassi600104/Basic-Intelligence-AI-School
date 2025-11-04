import React from 'react';
import { motion } from 'framer-motion';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import Hero from '@/components/home/Hero';
import SocialProof from '@/components/home/SocialProof';
import ProblemSolution from '@/components/home/ProblemSolution';
import HowItWorks from '@/components/home/HowItWorks';
import PromptLibrarySpotlight from '@/components/home/PromptLibrarySpotlight';
import Testimonials from '@/components/home/Testimonials';
import PricingSection from '@/components/home/PricingSection';
import ClosingCTA from '@/components/home/ClosingCTA';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Navbar */}
      <Navbar />

      {/* Hero Section */}
      <Hero />

      {/* Social Proof */}
      <SocialProof />

      {/* Problem & Solution */}
      <ProblemSolution />

      {/* How It Works */}
      <HowItWorks />

      {/* Prompt Library Spotlight */}
      <PromptLibrarySpotlight />

      {/* Testimonials */}
      <Testimonials />

      {/* Pricing */}
      <PricingSection />

      {/* Closing CTA */}
      <ClosingCTA />

      {/* Footer */}
      <Footer />
    </div>
  );
}
