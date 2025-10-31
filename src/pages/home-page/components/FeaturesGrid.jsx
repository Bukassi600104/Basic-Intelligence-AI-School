import React from 'react';
import FeatureCard from '../../../components/ui/FeatureCard';

const FeaturesGrid = () => {
  const features = [
    {
      id: 1,
      icon: "Target",
      title: "Focus on Application",
      description: "Learn by doing. Our curriculum is centered on real-world projects and case studies, so you build a practical skill set from day one.",
      color: "emerald",
      tags: ["Hands-on", "Real Projects", "Portfolio Ready"],
    },
    {
      id: 2,
      icon: "Eye",
      title: "Clarity Above All",
      description: "We cut through the jargon. Our lessons are designed to be clear, accessible, and immediately useful, regardless of your technical background.",
      color: "orange",
      tags: ["Beginner Friendly", "No Jargon", "Practical"],
    },
    {
      id: 3,
      icon: "Video",
      title: "Live Expert Access",
      description: "Get your questions answered in real-time. Our live sessions with industry experts ensure you're never learning alone.",
      color: "amber",
      tags: ["Live Sessions", "Expert Q&A", "Real-time"],
    },
    {
      id: 4,
      icon: "Globe",
      title: "A Global Community",
      description: "Connect with a network of ambitious peers from around the world, sharing insights and opportunities.",
      color: "orange",
      tags: ["Global Network", "Peer Support", "Collaboration"],
    }
  ];

  return (
    <section className="py-20 lg:py-32 bg-gradient-to-b from-white to-gray-50">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        {/* Section Header with Animation - Orange Theme */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-block px-5 py-2.5 bg-gradient-to-r from-orange-100 to-orange-200 rounded-full mb-6">
            <span className="text-sm font-bold bg-gradient-to-r from-orange-600 to-orange-500 bg-clip-text text-transparent">
              Why Choose Us
            </span>
          </div>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-extrabold mb-6">
            <span className="bg-gradient-to-r from-gray-900 via-orange-900 to-orange-800 bg-clip-text text-transparent">
              Why Choose Basic Intelligence?
            </span>
          </h2>
          <p className="text-base md:text-lg text-gray-600 leading-relaxed">
            We're built for busy professionals, creators, and entrepreneurs who need{' '}
            <span className="font-semibold text-gray-900">results, not just knowledge</span>. Here's what sets us apart:
          </p>
        </div>

        {/* Features Grid with New Component */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-10 mb-20">
          {features?.map((feature, index) => (
            <div
              key={feature?.id}
              className="animate-slideUp"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <FeatureCard
                title={feature.title}
                description={feature.description}
                icon={feature.icon}
                tags={feature.tags}
                color={feature.color}
                variant="default"
              />
            </div>
          ))}
        </div>

        {/* Additional Value Props */}
        <div className="mt-12 bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 rounded-3xl p-12 lg:p-16 text-white relative overflow-hidden shadow-2xl">
          {/* Decorative Elements */}
          <div className="absolute top-0 right-0 w-80 h-80 bg-white/10 rounded-full -mr-40 -mt-40"></div>
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/10 rounded-full -ml-32 -mb-32"></div>
          
          <div className="relative z-10 text-center max-w-3xl mx-auto">
            <h3 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-8">
              Ready to Transform Your Career with AI?
            </h3>
            <p className="text-lg md:text-xl lg:text-2xl text-white/90 mb-10 leading-relaxed">
              Join our community of forward-thinking professionals and entrepreneurs who are leveraging AI to create new opportunities and grow their careers.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
              <a href="/join-membership-page">
                <button className="px-10 py-5 bg-white text-blue-600 text-base font-bold rounded-xl hover:shadow-2xl hover:scale-105 transition-all duration-300">
                  <span className="flex items-center space-x-2">
                    <span>Get Started Now</span>
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </span>
                </button>
              </a>
              <a href="/about-page">
                <button className="px-10 py-5 bg-white/10 backdrop-blur-sm text-white text-base font-bold rounded-xl border-2 border-white/30 hover:bg-white/20 hover:scale-105 transition-all duration-300">
                  Explore Courses
                </button>
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FeaturesGrid;
