import React from 'react';
import Icon from '../../../components/AppIcon';

const MissionSection = () => {
  const missionPoints = [
    {
      icon: "Target",
      title: "Our Mission",
      description: `To democratize artificial intelligence education for professionals and entrepreneurs everywhere. We provide practical, hands-on skills that drive career advancement and business growth in the global digital economy.`,
      gradient: "from-orange-500 to-orange-600"
    },
    {
      icon: "Eye",
      title: "Our Vision", 
      description: `To become the world's most trusted platform for applied AI education, empowering a global community of innovators to shape the future of their industries.`,
      gradient: "from-orange-500 to-pink-600"
    },
    {
      icon: "Heart",
      title: "Our Values",
      description: `Practical Application: We focus on skills you can use today, not just abstract theory. Student Success: Your growth is our ultimate metric. Community-First: We foster a global network for collaboration and support. Excellence & Clarity: We make complex topics simple and actionable. Continuous Innovation: We stay on the cutting edge of AI.`,
      gradient: "from-orange-500 to-green-600"
    }
  ];

  return (
    <section className="py-20 lg:py-32 bg-white">
      <div className="max-w-7xl mx-auto px-4 lg:px-6">
        <div className="text-center mb-16 animate-fadeIn">
          <div className="inline-block px-4 py-2 bg-gradient-to-r from-blue-100 to-purple-100 rounded-full mb-6">
            <span className="text-sm font-bold bg-gradient-to-r from-orange-600 to-orange-600 bg-clip-text text-transparent">
              Our Foundation
            </span>
          </div>
          <h2 className="text-4xl lg:text-5xl font-extrabold mb-6">
            <span className="bg-gradient-to-r from-gray-900 via-blue-900 to-purple-900 bg-clip-text text-transparent">
              Our Purpose & Direction
            </span>
          </h2>
          <p className="text-lg lg:text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Basic Intelligence was founded on a simple premise: the power of AI should be{' '}
            <span className="font-bold text-gray-900">accessible to everyone</span>{' '}
            who wants to build, create, and innovate.
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8 mb-20">
          {missionPoints?.map((point, index) => (
            <div 
              key={index} 
              className="group bg-white border-2 border-gray-200 rounded-2xl p-8 text-center hover:shadow-card-hover hover:border-blue-400 hover:-translate-y-2 transition-all duration-300 animate-slideUp"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className={`w-20 h-20 bg-gradient-to-br ${point.gradient} rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg group-hover:scale-110 group-hover:rotate-3 transition-all duration-300`}>
                <Icon name={point?.icon} size={36} className="text-white" />
              </div>
              
              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                {point?.title}
              </h3>
              
              <p className="text-gray-600 leading-relaxed">
                {point?.description}
              </p>
            </div>
          ))}
        </div>

        {/* Impact Statement - Enhanced */}
        <div className="relative overflow-hidden rounded-3xl animate-slideUp" style={{ animationDelay: '0.3s' }}>
          {/* Gradient Background */}
          <div className="absolute inset-0 bg-gradient-to-r from-orange-600 via-orange-600 to-pink-600"></div>
          
          {/* Decorative Elements */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full blur-2xl"></div>
          
          <div className="relative p-8 lg:p-16 text-center">
            <div className="max-w-4xl mx-auto">
              <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center mx-auto mb-6 border border-white/30">
                <Icon name="Quote" size={32} className="text-white" />
              </div>
              <blockquote className="text-2xl lg:text-3xl font-bold text-white mb-8 leading-relaxed">
                "We believe that artificial intelligence is not just the future—it's the present. Our role is to ensure professionals everywhere have access to the tools and knowledge needed to{' '}
                <span className="border-b-4 border-white/50">thrive in this technological revolution</span>."
              </blockquote>
              <div className="flex items-center justify-center space-x-4">
                <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center shadow-xl border border-white/30">
                  <Icon name="User" size={28} color="white" />
                </div>
                <div className="text-left">
                  <div className="font-bold text-white text-lg">Founder & CEO</div>
                  <div className="text-sm text-white/80 font-medium">Basic Intelligence</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default MissionSection;

