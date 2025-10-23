import React from 'react';
import Icon from '../../../components/AppIcon';

const MembershipBenefits = () => {
  const benefits = [
    {
      icon: 'BookOpen',
      title: 'Comprehensive AI Courses',
      description: 'Access to structured learning paths covering AI fundamentals, practical applications, and advanced techniques',
      highlight: 'For all skill levels'
    },
    {
      icon: 'Users',
      title: 'Active Learning Community',
      description: 'Connect with professionals, creators, and entrepreneurs to share experiences and grow together',
      highlight: '500+ active members'
    },
    {
      icon: 'Video', 
      title: 'Live Interactive Sessions',
      description: 'Weekly live workshops, Q&A sessions, and real-time problem solving with experts',
      highlight: 'Every week'
    },
    {
      icon: 'Award',
      title: 'Career Advancement Support',
      description: 'Resume optimization, interview preparation, and job placement assistance',
      highlight: 'Proven results'
    },
    {
      icon: 'Download',
      title: 'Resource Library',
      description: 'Downloadable templates, cheat sheets, project files, and reference materials',
      highlight: 'Lifetime access'
    },
    {
      icon: 'Briefcase',
      title: 'Practical Projects',
      description: 'Hands-on projects using real-world data to build your portfolio',
      highlight: 'Portfolio ready'
    }
  ];

  return (
    <div className="mb-8">
      <div className="text-center mb-10 animate-slideUp">
        <span className="inline-block px-4 py-2 bg-gradient-to-r from-purple-100 to-pink-100 rounded-full text-sm font-bold text-purple-600 mb-4">
          Member Benefits
        </span>
        <h2 className="text-2xl lg:text-4xl font-extrabold mb-4">
          <span className="bg-gradient-to-r from-gray-900 via-purple-900 to-pink-900 bg-clip-text text-transparent">
            What You Get as a Member
          </span>
        </h2>
        <p className="text-gray-600 max-w-2xl mx-auto leading-relaxed">
          Join our thriving community and unlock access to <span className="font-bold text-gray-900">comprehensive AI education</span> designed for Nigerian professionals.
        </p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {benefits?.map?.((benefit, index) => (
          <div key={index} className="group bg-white border-2 border-gray-200 rounded-2xl p-6 hover:border-blue-400 hover:shadow-xl transition-all hover:-translate-y-1 animate-slideUp" style={{ animationDelay: `${0.1 * index}s` }}>
            <div className="flex items-start space-x-4">
              <div className={`w-14 h-14 bg-gradient-to-br ${
                index % 6 === 0 ? 'from-blue-500 to-cyan-600' :
                index % 6 === 1 ? 'from-purple-500 to-pink-600' :
                index % 6 === 2 ? 'from-emerald-500 to-green-600' :
                index % 6 === 3 ? 'from-amber-500 to-orange-600' :
                index % 6 === 4 ? 'from-pink-500 to-rose-600' :
                'from-cyan-500 to-blue-600'
              } rounded-2xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 group-hover:rotate-3 transition-all`}>
                <Icon name={benefit?.icon} size={24} className="text-white" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                  {benefit?.title}
                </h3>
                <p className="text-sm text-gray-600 mb-3 leading-relaxed">
                  {benefit?.description}
                </p>
                <span className="inline-flex items-center px-3 py-1 rounded-lg text-xs font-bold bg-gradient-to-r from-blue-50 to-purple-50 text-blue-600 border border-blue-200">
                  <Icon name="Star" size={12} className="mr-1" />
                  {benefit?.highlight}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Community Statistics - Enhanced */}
      <div className="mt-10 relative overflow-hidden rounded-3xl animate-slideUp" style={{ animationDelay: '0.6s' }}>
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600"></div>
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
        
        <div className="relative p-8 lg:p-12">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center mx-auto mb-4 border border-white/30">
              <Icon name="Users" size={32} className="text-white" />
            </div>
            <h3 className="text-2xl font-extrabold text-white mb-2">
              Join a Thriving Community
            </h3>
            <p className="text-white/90 text-lg">
              See what our members have achieved
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/30 hover:scale-105 transition-transform">
              <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-white/30">
                <Icon name="TrendingUp" size={28} className="text-white" />
              </div>
              <div className="text-4xl font-extrabold text-white mb-1">500+</div>
              <div className="text-sm font-medium text-white/90">Active Members</div>
            </div>

            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/30 hover:scale-105 transition-transform">
              <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-white/30">
                <Icon name="Target" size={28} className="text-white" />
              </div>
              <div className="text-4xl font-extrabold text-white mb-1">85%</div>
              <div className="text-sm font-medium text-white/90">Career Advancement Rate</div>
            </div>

            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/30 hover:scale-105 transition-transform">
              <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-white/30">
                <Icon name="Clock" size={28} className="text-white" />
              </div>
              <div className="text-4xl font-extrabold text-white mb-1">3</div>
              <div className="text-sm font-medium text-white/90">Months Average Learning Time</div>
            </div>
          </div>
        </div>
      </div>

      {/* Call to Action - Enhanced */}
      <div className="mt-8 relative overflow-hidden rounded-2xl bg-white border-2 border-emerald-200 p-8 text-center hover:border-emerald-400 hover:shadow-xl transition-all animate-slideUp" style={{ animationDelay: '0.7s' }}>
        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-emerald-100 to-green-100 rounded-full blur-3xl opacity-50"></div>
        
        <div className="relative">
          <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-green-600 rounded-2xl flex items-center justify-center mx-auto mb-4 animate-pulse-slow">
            <Icon name="Zap" size={32} className="text-white" />
          </div>
          <h4 className="text-xl font-bold text-gray-900 mb-2">
            Ready to Transform Your Career?
          </h4>
          <p className="text-gray-600 leading-relaxed max-w-xl mx-auto">
            Join <span className="font-bold text-emerald-600">thousands of Nigerian professionals</span> who are already using AI to advance their careers and grow their businesses.
          </p>
        </div>
      </div>
    </div>
  );
};

export default MembershipBenefits;
