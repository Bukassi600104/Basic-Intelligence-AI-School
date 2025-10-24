import React from 'react';
import { Link } from 'react-router-dom';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import WhatsAppButton from '../../../components/ui/WhatsAppButton';

const CallToActionSection = () => {
  const benefits = [
    "Lifetime access to all AI courses",
    "Active community of 500+ professionals", 
    "Live workshops and Q&A sessions",
    "Practical projects and case studies",
    "Career advancement support",
    "Regular content updates"
  ];

  const faqs = [
    {
      question: "What makes Basic Intelligence different?",
      answer: "We focus specifically on practical AI applications for Nigerian professionals, with locally relevant case studies and affordable pricing."
    },
    {
      question: "Do I need technical background?",
      answer: "No! Our courses are designed for professionals from all backgrounds. We start with basics and build up to advanced concepts."
    },
    {
      question: "How long does it take to see results?",
      answer: "Most members start implementing AI tools within their first month. Career advancement typically happens within 6-12 months."
    }
  ];

  return (
    <section className="py-16 lg:py-24 bg-gradient-to-br from-gray-50 via-blue-50 to-orange-50">
      <div className="max-w-7xl mx-auto px-4 lg:px-6">
        {/* Main CTA - Enhanced */}
        <div className="relative overflow-hidden rounded-3xl mb-16 animate-slideUp">
          <div className="absolute inset-0 bg-gradient-to-br from-orange-600 via-orange-600 to-pink-600"></div>
          <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl animate-pulse-slow"></div>
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-white/10 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: '1s' }}></div>
          
          <div className="relative p-8 lg:p-16 text-center text-white">
            <div className="max-w-4xl mx-auto">
              <div className="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center mx-auto mb-8 border border-white/30 animate-float">
                <Icon name="Rocket" size={40} className="text-white" />
              </div>
              
              <h2 className="text-3xl lg:text-5xl font-extrabold mb-6 leading-tight">
                Ready to Transform Your Career with AI?
              </h2>
              
              <p className="text-xl lg:text-2xl text-white/90 mb-8 leading-relaxed max-w-3xl mx-auto">
                Join <span className="font-bold text-white">500+ Nigerian professionals</span> who are already using AI to advance their careers and grow their businesses.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
                <Link to="/join-membership-page">
                  <Button 
                    variant="outline" 
                    size="lg" 
                    className="bg-white text-orange-600 hover:bg-white/90 border-white font-bold shadow-xl hover:shadow-2xl transition-all hover:scale-105"
                    iconName="UserPlus" 
                    iconPosition="left"
                  >
                    Join our Community
                  </Button>
                </Link>
                
                <Button 
                  variant="ghost" 
                  size="lg" 
                  className="text-white border-2 border-white/50 hover:bg-white/20 backdrop-blur-sm font-bold hover:border-white transition-all hover:scale-105"
                  iconName="MessageCircle" 
                  iconPosition="left"
                >
                  Ask Questions on WhatsApp
                </Button>
              </div>

              {/* Benefits Grid - Enhanced */}
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 text-left">
                {benefits?.map((benefit, index) => (
                  <div key={index} className="flex items-center space-x-3 bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20 hover:bg-white/20 transition-all hover:scale-105 animate-slideUp" style={{ animationDelay: `${0.1 * index}s` }}>
                    <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Icon name="Check" size={18} className="text-white" />
                    </div>
                    <span className="text-sm font-medium">{benefit}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* FAQ Section - Enhanced */}
        <div className="grid lg:grid-cols-2 gap-12 items-start">
          <div className="animate-slideUp" style={{ animationDelay: '0.1s' }}>
            <div className="mb-8">
              <span className="inline-block px-4 py-2 bg-gradient-to-r from-orange-100 to-pink-100 rounded-full text-sm font-bold text-orange-600 mb-4">
                FAQ
              </span>
              <h3 className="text-2xl lg:text-3xl font-extrabold bg-gradient-to-r from-gray-900 via-purple-900 to-pink-900 bg-clip-text text-transparent mb-4">
                Frequently Asked Questions
              </h3>
            </div>
            <div className="space-y-6">
              {faqs?.map((faq, index) => (
                <div key={index} className="bg-white border-2 border-gray-200 rounded-2xl p-6 hover:border-purple-400 hover:shadow-xl transition-all hover:-translate-y-1 group">
                  <h4 className="font-bold text-gray-900 mb-3 flex items-center group-hover:text-orange-600 transition-colors">
                    <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg flex items-center justify-center mr-3 group-hover:scale-110 group-hover:rotate-3 transition-all">
                      <Icon name="HelpCircle" size={20} className="text-white" />
                    </div>
                    {faq?.question}
                  </h4>
                  <p className="text-gray-600 leading-relaxed pl-13">
                    {faq?.answer}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-6">
            {/* Contact Card - Enhanced */}
            <div className="relative overflow-hidden rounded-2xl bg-white border-2 border-gray-200 p-8 hover:border-blue-400 hover:shadow-xl transition-all animate-slideUp" style={{ animationDelay: '0.2s' }}>
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-100 to-cyan-100 rounded-full blur-3xl opacity-50"></div>
              
              <div className="relative">
                <div className="w-14 h-14 bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl flex items-center justify-center mb-4">
                  <Icon name="MessageCircle" size={28} className="text-white" />
                </div>
                <h4 className="text-xl font-bold text-gray-900 mb-3">
                  Still Have Questions?
                </h4>
                <p className="text-gray-600 mb-6 leading-relaxed">
                  Our team is here to help you discover how AI can help you create, earn, and innovate in your field.
                </p>
                
                <div className="space-y-3">
                  <div className="w-full">
                    <WhatsAppButton 
                      variant="icon" 
                      className="w-full bg-green-500 hover:bg-green-600 text-white font-medium" 
                    />
                  </div>
                  
                  <Button 
                    variant="outline" 
                    fullWidth 
                    className="justify-start border-2 hover:border-orange-500 hover:bg-orange-50 font-medium"
                    iconName="Mail" 
                    iconPosition="left"
                  >
                    hello@basicintelligence.com
                  </Button>
                </div>
              </div>
            </div>

            {/* Guarantee Card - Enhanced */}
            <div className="relative overflow-hidden rounded-2xl bg-white border-2 border-emerald-200 p-8 hover:border-emerald-400 hover:shadow-xl transition-all animate-slideUp" style={{ animationDelay: '0.3s' }}>
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-emerald-100 to-green-100 rounded-full blur-3xl opacity-50"></div>
              
              <div className="relative">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-14 h-14 bg-gradient-to-br from-orange-500 to-green-600 rounded-2xl flex items-center justify-center">
                    <Icon name="Shield" size={28} className="text-white" />
                  </div>
                  <h4 className="text-xl font-bold text-gray-900">
                    Our Commitment
                  </h4>
                </div>
                <p className="text-gray-600 leading-relaxed">
                  We're so confident in our program that we offer <span className="font-bold text-orange-600">ongoing support</span> until you achieve your AI learning goals. 
                  Your success is our success.
                </p>
              </div>
            </div>

            {/* Urgency Card - Enhanced */}
            <div className="relative overflow-hidden rounded-2xl bg-white border-2 border-amber-200 p-8 hover:border-amber-400 hover:shadow-xl transition-all animate-slideUp" style={{ animationDelay: '0.4s' }}>
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-amber-100 to-orange-100 rounded-full blur-3xl opacity-50"></div>
              
              <div className="relative">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-14 h-14 bg-gradient-to-br from-amber-500 to-orange-600 rounded-2xl flex items-center justify-center animate-pulse-slow">
                    <Icon name="Clock" size={28} className="text-white" />
                  </div>
                  <h4 className="text-xl font-bold text-gray-900">
                    Don't Wait
                  </h4>
                </div>
                <p className="text-gray-600 leading-relaxed">
                  AI is transforming industries rapidly. The professionals who <span className="font-bold text-amber-600">start learning today</span> will have a significant advantage tomorrow. 
                  Join us now and stay ahead of the curve.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CallToActionSection;

