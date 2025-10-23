import React from 'react';
import Icon from '../../../components/AppIcon';


const MethodologySection = () => {
  const methodologySteps = [
    {
      step: "01",
      title: "Practical Foundation",
      description: "Start with real-world AI applications relevant to Nigerian businesses and professional contexts.",
      icon: "Foundation",
      features: ["Industry case studies", "Local business examples", "Hands-on projects"]
    },
    {
      step: "02", 
      title: "Interactive Learning",
      description: "Engage through live sessions, community discussions, and peer-to-peer knowledge sharing.",
      icon: "Users",
      features: ["Live workshops", "Community forums", "Peer mentoring"]
    },
    {
      step: "03",
      title: "Applied Practice",
      description: "Implement AI solutions in your current role or business with guided support and feedback.",
      icon: "Cog",
      features: ["Project guidance", "Expert feedback", "Implementation support"]
    },
    {
      step: "04",
      title: "Continuous Growth",
      description: "Access ongoing resources, updates, and advanced training as AI technology evolves.",
      icon: "TrendingUp",
      features: ["Regular updates", "Advanced courses", "Career support"]
    }
  ];

  const learningPrinciples = [
    {
      icon: "Brain",
      title: "Learn by Doing",
      description: "Every concept is reinforced through practical exercises and real-world applications."
    },
    {
      icon: "Users",
      title: "Community-Driven",
      description: "Learn alongside peers, share experiences, and build lasting professional networks."
    },
    {
      icon: "Target",
      title: "Goal-Oriented",
      description: "Each course is designed with specific career and business outcomes in mind."
    },
    {
      icon: "Zap",
      title: "Stay Current",
      description: "Content is regularly updated to reflect the latest AI trends and technologies."
    }
  ];

  return (
    <section className="py-20 lg:py-32 bg-gradient-to-br from-gray-50 via-purple-50 to-blue-50">
      <div className="max-w-7xl mx-auto px-4 lg:px-6">
        {/* Section Header - Enhanced */}
        <div className="text-center mb-16 animate-fadeIn">
          <div className="inline-block px-4 py-2 bg-gradient-to-r from-purple-100 to-pink-100 rounded-full mb-6">
            <span className="text-sm font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              How We Teach
            </span>
          </div>
          <h2 className="text-4xl lg:text-5xl font-extrabold mb-6">
            <span className="bg-gradient-to-r from-gray-900 via-purple-900 to-pink-900 bg-clip-text text-transparent">
              Our Learning Methodology
            </span>
          </h2>
          <p className="text-lg lg:text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            We've developed a{' '}
            <span className="font-bold text-gray-900">proven approach</span>{' '}
            that combines theoretical knowledge with practical application, ensuring our members can immediately apply what they learn.
          </p>
        </div>

        {/* Methodology Steps - Enhanced */}
        <div className="grid lg:grid-cols-2 gap-8 mb-20">
          {methodologySteps?.map((step, index) => (
            <div 
              key={index} 
              className="group bg-white border-2 border-gray-200 rounded-2xl p-8 hover:shadow-card-hover hover:border-purple-400 hover:-translate-y-1 transition-all duration-300 animate-slideUp"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="flex items-start space-x-6">
                <div className="flex flex-col items-center">
                  <div className={`w-16 h-16 bg-gradient-to-br ${
                    index === 0 ? 'from-blue-500 to-cyan-600' :
                    index === 1 ? 'from-purple-500 to-pink-600' :
                    index === 2 ? 'from-emerald-500 to-green-600' :
                    'from-amber-500 to-orange-600'
                  } rounded-2xl flex items-center justify-center mb-4 shadow-lg group-hover:scale-110 group-hover:rotate-3 transition-all duration-300`}>
                    <Icon name={step?.icon} size={24} color="white" />
                  </div>
                  <span className="text-3xl font-extrabold text-gray-200 group-hover:text-purple-200 transition-colors">
                    {step?.step}
                  </span>
                </div>
                
                <div className="flex-1">
                  <h3 className="text-2xl font-bold text-gray-900 mb-3 group-hover:text-purple-600 transition-colors">
                    {step?.title}
                  </h3>
                  <p className="text-gray-600 mb-5 leading-relaxed">
                    {step?.description}
                  </p>
                  
                  <div className="space-y-3">
                    {step?.features?.map((feature, featureIndex) => (
                      <div key={featureIndex} className="flex items-center space-x-3">
                        <div className="w-5 h-5 bg-gradient-to-br from-emerald-500 to-green-600 rounded-lg flex items-center justify-center flex-shrink-0">
                          <Icon name="Check" size={14} className="text-white" />
                        </div>
                        <span className="text-sm font-medium text-gray-700">{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Learning Principles - Enhanced */}
        <div className="relative overflow-hidden rounded-3xl mb-20 animate-slideUp" style={{ animationDelay: '0.4s' }}>
          <div className="absolute inset-0 bg-white shadow-2xl"></div>
          <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-transparent to-purple-50 opacity-50"></div>
          
          <div className="relative p-8 lg:p-16">
            <div className="text-center mb-12">
              <h3 className="text-3xl lg:text-4xl font-extrabold text-gray-900 mb-4">
                Our Learning Principles
              </h3>
              <p className="text-gray-600 max-w-2xl mx-auto leading-relaxed">
                These core principles guide every aspect of our educational approach and community building.
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {learningPrinciples?.map((principle, index) => (
                <div key={index} className="text-center group">
                  <div className={`w-20 h-20 bg-gradient-to-br ${
                    index === 0 ? 'from-blue-500 to-cyan-600' :
                    index === 1 ? 'from-purple-500 to-pink-600' :
                    index === 2 ? 'from-emerald-500 to-green-600' :
                    'from-amber-500 to-orange-600'
                  } rounded-2xl flex items-center justify-center mx-auto mb-5 shadow-lg group-hover:scale-110 group-hover:rotate-6 transition-all duration-300`}>
                    <Icon name={principle?.icon} size={32} className="text-white" />
                  </div>
                  <h4 className="font-bold text-gray-900 mb-3 text-lg">
                    {principle?.title}
                  </h4>
                  <p className="text-sm text-gray-600 leading-relaxed">
                    {principle?.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Success Metrics - Enhanced */}
        <div className="relative overflow-hidden rounded-3xl animate-slideUp" style={{ animationDelay: '0.5s' }}>
          <div className="absolute inset-0 bg-gradient-to-r from-emerald-600 via-green-600 to-teal-600"></div>
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
          
          <div className="relative p-8 lg:p-16">
            <div className="text-center mb-12">
              <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center mx-auto mb-6 border border-white/30">
                <Icon name="Award" size={32} className="text-white" />
              </div>
              <h3 className="text-3xl font-extrabold text-white mb-4">
                Proven Results
              </h3>
              <p className="text-white/90 text-lg max-w-xl mx-auto">
                Our methodology delivers measurable outcomes for our community members.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              <div className="text-center bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/30 hover:scale-105 transition-transform">
                <div className="text-5xl font-extrabold text-white mb-2">95%</div>
                <div className="text-sm font-medium text-white/90">Course Completion Rate</div>
              </div>
              <div className="text-center bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/30 hover:scale-105 transition-transform">
                <div className="text-5xl font-extrabold text-white mb-2">80%</div>
                <div className="text-sm font-medium text-white/90">Career Advancement</div>
              </div>
              <div className="text-center bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/30 hover:scale-105 transition-transform">
                <div className="text-5xl font-extrabold text-white mb-2">4.9/5</div>
                <div className="text-sm font-medium text-white/90">Member Satisfaction</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default MethodologySection;