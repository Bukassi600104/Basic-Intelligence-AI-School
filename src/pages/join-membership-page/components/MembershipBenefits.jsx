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
      <div className="text-center mb-8">
        <h2 className="text-2xl lg:text-3xl font-bold text-foreground mb-4">
          What You Get as a Member
        </h2>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Join our thriving community and unlock access to comprehensive AI education designed for Nigerian professionals.
        </p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {benefits?.map?.((benefit, index) => (
          <div key={index} className="group bg-card border border-border rounded-xl p-6 hover:shadow-lg transition-all duration-300 hover:border-primary/30">
            <div className="flex items-start space-x-4">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:bg-primary/20 transition-colors duration-300">
                <Icon name={benefit?.icon} size={24} className="text-primary" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  {benefit?.title}
                </h3>
                <p className="text-sm text-muted-foreground mb-3 leading-relaxed">
                  {benefit?.description}
                </p>
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary">
                  <Icon name="Star" size={12} className="mr-1" />
                  {benefit?.highlight}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Community Statistics */}
      <div className="mt-8 bg-gradient-to-br from-primary/5 via-background to-secondary/5 rounded-2xl p-8">
        <div className="text-center mb-6">
          <h3 className="text-xl font-bold text-foreground mb-2">
            Join a Thriving Community
          </h3>
          <p className="text-muted-foreground">
            See what our members have achieved
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 text-center">
          <div className="bg-card/50 rounded-xl p-6 border border-border/50">
            <div className="w-12 h-12 bg-success/10 rounded-lg flex items-center justify-center mx-auto mb-4">
              <Icon name="TrendingUp" size={24} className="text-success" />
            </div>
            <div className="text-2xl font-bold text-foreground mb-1">500+</div>
            <div className="text-sm text-muted-foreground">Active Members</div>
          </div>

          <div className="bg-card/50 rounded-xl p-6 border border-border/50">
            <div className="w-12 h-12 bg-warning/10 rounded-lg flex items-center justify-center mx-auto mb-4">
              <Icon name="Target" size={24} className="text-warning" />
            </div>
            <div className="text-2xl font-bold text-foreground mb-1">85%</div>
            <div className="text-sm text-muted-foreground">Career Advancement Rate</div>
          </div>

          <div className="bg-card/50 rounded-xl p-6 border border-border/50">
            <div className="w-12 h-12 bg-info/10 rounded-lg flex items-center justify-center mx-auto mb-4">
              <Icon name="Clock" size={24} className="text-info" />
            </div>
            <div className="text-2xl font-bold text-foreground mb-1">3</div>
            <div className="text-sm text-muted-foreground">Months Average Learning Time</div>
          </div>
        </div>
      </div>

      {/* Call to Action */}
      <div className="mt-8 text-center p-6 bg-primary/5 border border-primary/20 rounded-xl">
        <Icon name="Zap" size={32} className="text-primary mx-auto mb-4" />
        <h4 className="text-lg font-semibold text-foreground mb-2">
          Ready to Transform Your Career?
        </h4>
        <p className="text-sm text-muted-foreground">
          Join thousands of Nigerian professionals who are already using AI to advance their careers and grow their businesses.
        </p>
      </div>
    </div>
  );
};

export default MembershipBenefits;
