import React from 'react';
import Icon from '../../../components/AppIcon';

const MissionSection = () => {
  const missionPoints = [
    {
      icon: "Target",
      title: "Our Mission",
      description: `To democratize artificial intelligence education for professionals and entrepreneurs everywhere. We provide practical, hands-on skills that drive career advancement and business growth in the global digital economy.`
    },
    {
      icon: "Eye",
      title: "Our Vision", 
      description: `To become the world's most trusted platform for applied AI education, empowering a global community of innovators to shape the future of their industries.`
    },
    {
      icon: "Heart",
      title: "Our Values",
      description: `Practical Application: We focus on skills you can use today, not just abstract theory. Student Success: Your growth is our ultimate metric. Community-First: We foster a global network for collaboration and support. Excellence & Clarity: We make complex topics simple and actionable. Continuous Innovation: We stay on the cutting edge of AI.`
    }
  ];

  return (
    <section className="py-16 lg:py-24 bg-muted/30">
      <div className="max-w-7xl mx-auto px-4 lg:px-6">
        <div className="text-center mb-16">
          <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-4">
            Our Purpose & Direction
          </h2>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
            Basic Intelligence was founded on a simple premise: the power of AI should be accessible to everyone who wants to build, create, and innovate.
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {missionPoints?.map((point, index) => (
            <div key={index} className="bg-card border border-border rounded-xl p-8 text-center hover:shadow-lg transition-shadow duration-300">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <Icon name={point?.icon} size={32} className="text-primary" />
              </div>
              
              <h3 className="text-xl font-semibold text-foreground mb-4">
                {point?.title}
              </h3>
              
              <p className="text-muted-foreground leading-relaxed">
                {point?.description}
              </p>
            </div>
          ))}
        </div>

        {/* Impact Statement */}
        <div className="mt-16 bg-primary/5 border border-primary/10 rounded-2xl p-8 lg:p-12 text-center">
          <div className="max-w-4xl mx-auto">
            <Icon name="Quote" size={48} className="text-primary/30 mx-auto mb-6" />
            <blockquote className="text-xl lg:text-2xl font-medium text-foreground mb-6 leading-relaxed">
              "We believe that artificial intelligence is not just the future—it's the present. Our role is to ensure professionals everywhere have access to the tools and knowledge needed to thrive in this technological revolution."
            </blockquote>
            <div className="flex items-center justify-center space-x-4">
              <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center">
                <Icon name="User" size={24} color="white" />
              </div>
              <div className="text-left">
                <div className="font-semibold text-foreground">Founder & CEO</div>
                <div className="text-sm text-muted-foreground">Basic Intelligence</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default MissionSection;
