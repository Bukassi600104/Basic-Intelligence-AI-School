import React from 'react';
import { Link } from 'react-router-dom';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const ContactSection = () => {
  const handleWhatsAppClick = () => {
    window.open('https://wa.me/2349062284074', '_blank');
  };

  const trustSignals = [
    {
      icon: "CheckCircle",
      title: "Expert-Vetted Content",
      description: "Our curriculum is crafted and reviewed by industry practitioners, ensuring you learn relevant, up-to-date skills—not just abstract theory.",
      gradient: "from-emerald-500 to-green-600"
    },
    {
      icon: "Target",
      title: "Focus on Practical Outcomes",
      description: "You won't just learn; you'll build. Finish our courses with portfolio-ready projects that demonstrate your new abilities to clients and employers.",
      gradient: "from-blue-500 to-cyan-600"
    },
    {
      icon: "Globe",
      title: "A Global Community Network",
      description: "Join our exclusive member group to connect with ambitious professionals, creators, and entrepreneurs from around the world.",
      gradient: "from-purple-500 to-pink-600"
    },
    {
      icon: "Headphones",
      title: "Dedicated Support",
      description: "Get direct access to our team for questions and guidance via our community channels and email. We're here to help you succeed.",
      gradient: "from-amber-500 to-orange-600"
    }
  ];

  return (
    <section className="relative py-20 lg:py-32 overflow-hidden">
      {/* Background with Gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50"></div>
      
      {/* Animated Background Circles */}
      <div className="absolute top-20 left-10 w-72 h-72 bg-gradient-to-br from-blue-400/20 to-cyan-400/20 rounded-full blur-3xl animate-pulse-slow"></div>
      <div className="absolute bottom-20 right-10 w-96 h-96 bg-gradient-to-br from-purple-400/20 to-pink-400/20 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: '1s' }}></div>
      
      <div className="relative max-w-7xl mx-auto px-4 lg:px-6">
        {/* Contact Methods - Enhanced Design */}
        <div className="mb-24">
          <div className="text-center max-w-3xl mx-auto mb-12 animate-fadeIn">
            <div className="inline-block px-4 py-2 bg-gradient-to-r from-blue-100 to-purple-100 rounded-full mb-6">
              <span className="text-sm font-semibold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                We're Here to Help
              </span>
            </div>
            <h2 className="text-4xl md:text-5xl font-extrabold mb-6">
              <span className="bg-gradient-to-r from-gray-900 via-blue-900 to-purple-900 bg-clip-text text-transparent">
                Get in Touch
              </span>
            </h2>
            <p className="text-lg md:text-xl text-gray-600 leading-relaxed">
              Have questions about our AI courses? We're here to help you{' '}
              <span className="font-semibold text-gray-900">start your learning journey</span>
            </p>
          </div>

          {/* Action Buttons - Enhanced */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-6 max-w-2xl mx-auto animate-slideUp" style={{ animationDelay: '0.2s' }}>
            {/* WhatsApp Button */}
            <button
              onClick={handleWhatsAppClick}
              className="group relative w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold rounded-xl shadow-lg hover:shadow-glow-md hover:scale-105 transition-all duration-300 overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-green-600 to-emerald-700 opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <div className="relative flex items-center justify-center space-x-2">
                <Icon name="MessageCircle" size={20} className="group-hover:rotate-12 transition-transform" />
                <span>Chat on WhatsApp</span>
              </div>
            </button>

            {/* Contact Form Button */}
            <Link to="/contact" className="w-full sm:w-auto">
              <button className="group relative w-full px-8 py-4 bg-white/80 backdrop-blur-sm text-gray-900 font-bold rounded-xl border-2 border-gray-300 hover:border-blue-500 hover:shadow-lg hover:scale-105 transition-all duration-300">
                <div className="flex items-center justify-center space-x-2">
                  <Icon name="Mail" size={20} className="text-blue-600 group-hover:scale-110 transition-transform" />
                  <span>Contact Form</span>
                </div>
              </button>
            </Link>
          </div>

        </div>

        {/* Trust Signals - Enhanced Design */}
        <div className="relative">
          {/* Card Background */}
          <div className="absolute inset-0 bg-white rounded-3xl shadow-2xl"></div>
          <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-transparent to-purple-50 rounded-3xl opacity-50"></div>
          
          <div className="relative p-8 lg:p-16">
            <div className="text-center mb-16 animate-fadeIn">
              <div className="inline-block px-4 py-2 bg-gradient-to-r from-emerald-100 to-cyan-100 rounded-full mb-6">
                <span className="text-sm font-semibold bg-gradient-to-r from-emerald-600 to-cyan-600 bg-clip-text text-transparent">
                  Why Choose Us
                </span>
              </div>
              <h2 className="text-3xl md:text-4xl font-extrabold mb-4">
                <span className="bg-gradient-to-r from-gray-900 via-emerald-900 to-cyan-900 bg-clip-text text-transparent">
                  The Basic Intelligence Difference
                </span>
              </h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed">
                We're committed to providing a{' '}
                <span className="font-semibold text-gray-900">practical, high-impact</span>{' '}
                AI learning experience. Your success is our mission.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
              {trustSignals?.map((signal, index) => (
                <div 
                  key={index} 
                  className="group text-center animate-slideUp"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div className={`w-16 h-16 bg-gradient-to-br ${signal.gradient} rounded-2xl flex items-center justify-center mx-auto mb-5 shadow-lg group-hover:scale-110 group-hover:rotate-3 transition-all duration-300`}>
                    <Icon 
                      name={signal?.icon} 
                      size={28} 
                      className="text-white"
                    />
                  </div>
                  
                  <h3 className="font-bold text-gray-900 mb-3 text-lg">
                    {signal?.title}
                  </h3>
                  
                  <p className="text-sm text-gray-600 leading-relaxed">
                    {signal?.description}
                  </p>
                </div>
              ))}
            </div>

            {/* Final CTA - Enhanced */}
            <div className="relative overflow-hidden rounded-2xl">
              {/* Gradient Background */}
              <div className="absolute inset-0 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600"></div>
              
              {/* Decorative Elements */}
              <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
              <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full blur-2xl"></div>
              
              <div className="relative text-center px-8 py-12 lg:py-16">
                <div className="inline-block px-3 py-1.5 bg-white/20 backdrop-blur-sm rounded-full mb-4">
                  <span className="text-xs font-bold text-white uppercase tracking-wider">
                    🚀 Join the AI Revolution
                  </span>
                </div>
                
                <h3 className="text-2xl md:text-3xl font-extrabold text-white mb-4">
                  Ready to Start Your AI Journey?
                </h3>
                
                <p className="text-lg text-white/90 mb-8 max-w-xl mx-auto">
                  Join our community of AI learners and professionals today
                </p>
                
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                  <Link to="/join-membership-page">
                    <button className="group relative px-8 py-4 bg-white text-blue-600 font-bold rounded-xl shadow-2xl hover:shadow-glow-lg hover:scale-105 transition-all duration-300 overflow-hidden">
                      <div className="absolute inset-0 bg-gradient-to-r from-blue-50 to-purple-50 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                      <div className="relative flex items-center space-x-2">
                        <Icon name="Rocket" size={20} className="group-hover:rotate-12 transition-transform" />
                        <span>Join Now</span>
                      </div>
                    </button>
                  </Link>
                  
                  <Link to="/about-page">
                    <button className="group px-8 py-4 bg-white/10 backdrop-blur-sm text-white font-bold rounded-xl border-2 border-white/30 hover:bg-white/20 hover:border-white/50 hover:scale-105 transition-all duration-300">
                      <div className="flex items-center space-x-2">
                        <span>Learn About Us</span>
                        <Icon name="ArrowRight" size={20} className="group-hover:translate-x-1 transition-transform" />
                      </div>
                    </button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ContactSection;
