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
      color: "blue",
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
      color: "purple",
      tags: ["Global Network", "Peer Support", "Collaboration"],
    }
  ];

  return (
    <section className="py-24 lg:py-32 bg-gradient-to-b from-white to-gray-50">
      <div className="max-w-7xl mx-auto px-4 lg:px-6">
        {/* Section Header with Animation */}
        <div className="text-center max-w-3xl mx-auto mb-20">
          <div className="inline-block px-4 py-2 bg-gradient-to-r from-blue-100 to-purple-100 rounded-full mb-6">
            <span className="text-sm font-semibold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Why Choose Us
            </span>
          </div>
          <h2 className="text-4xl md:text-5xl font-extrabold mb-6">
            <span className="bg-gradient-to-r from-gray-900 via-blue-900 to-purple-900 bg-clip-text text-transparent">
              Why Choose Basic Intelligence?
            </span>
          </h2>
          <p className="text-lg md:text-xl text-gray-600 leading-relaxed">
            We're built for busy professionals, creators, and entrepreneurs who need{' '}
            <span className="font-semibold text-gray-900">results, not just knowledge</span>. Here's what sets us apart:
          </p>
        </div>

        {/* Features Grid with New Component */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-10">
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
        {/* Features Grid with New Component */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-10">
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
        <div className="mt-20 bg-gradient-to-br from-blue-600 to-purple-600 rounded-3xl p-12 text-white relative overflow-hidden">
          {/* Decorative Elements */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32"></div>
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full -ml-24 -mb-24"></div>
          
          <div className="relative z-10 text-center max-w-3xl mx-auto">
            <h3 className="text-3xl md:text-4xl font-bold mb-6">
              Ready to Transform Your Career with AI?
            </h3>
            <p className="text-lg md:text-xl text-white/90 mb-8">
              Join our community of forward-thinking professionals and entrepreneurs who are leveraging AI to create new opportunities and grow their careers.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <a href="/join-membership-page">
                <button className="px-8 py-4 bg-white text-blue-600 font-semibold rounded-xl hover:shadow-2xl hover:scale-105 transition-all duration-300">
                  <span className="flex items-center space-x-2">
                    <span>Get Started Now</span>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </span>
                </button>
              </a>
              <a href="/about-page">
                <button className="px-8 py-4 bg-white/10 backdrop-blur-sm text-white font-semibold rounded-xl border-2 border-white/30 hover:bg-white/20 hover:scale-105 transition-all duration-300">
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
