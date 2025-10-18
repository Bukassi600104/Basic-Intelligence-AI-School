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
    <section className="py-16 lg:py-24 bg-muted/30">
      <div className="max-w-7xl mx-auto px-4 lg:px-6">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-4">
            Our Learning Methodology
          </h2>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
            We've developed a proven approach that combines theoretical knowledge with practical application, ensuring our members can immediately apply what they learn.
          </p>
        </div>

        {/* Methodology Steps */}
        <div className="grid lg:grid-cols-2 gap-8 mb-20">
          {methodologySteps?.map((step, index) => (
            <div key={index} className="bg-card border border-border rounded-xl p-8 hover:shadow-lg transition-shadow duration-300">
              <div className="flex items-start space-x-4">
                <div className="flex flex-col items-center">
                  <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center mb-4">
                    <Icon name={step?.icon} size={20} color="white" />
                  </div>
                  <span className="text-2xl font-bold text-primary/30">
                    {step?.step}
                  </span>
                </div>
                
                <div className="flex-1">
                  <h3 className="text-xl font-semibold text-foreground mb-3">
                    {step?.title}
                  </h3>
                  <p className="text-muted-foreground mb-4 leading-relaxed">
                    {step?.description}
                  </p>
                  
                  <div className="space-y-2">
                    {step?.features?.map((feature, featureIndex) => (
                      <div key={featureIndex} className="flex items-center space-x-2">
                        <Icon name="Check" size={16} className="text-success" />
                        <span className="text-sm text-muted-foreground">{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Learning Principles */}
        <div className="bg-card border border-border rounded-2xl p-8 lg:p-12">
          <div className="text-center mb-12">
            <h3 className="text-2xl lg:text-3xl font-bold text-foreground mb-4">
              Our Learning Principles
            </h3>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              These core principles guide every aspect of our educational approach and community building.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {learningPrinciples?.map((principle, index) => (
              <div key={index} className="text-center">
                <div className="w-16 h-16 bg-secondary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Icon name={principle?.icon} size={28} className="text-secondary" />
                </div>
                <h4 className="font-semibold text-foreground mb-2">
                  {principle?.title}
                </h4>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {principle?.description}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Success Metrics */}
        <div className="mt-16 bg-gradient-to-r from-primary/5 to-secondary/5 rounded-2xl p-8 lg:p-12">
          <div className="text-center mb-8">
            <h3 className="text-2xl font-bold text-foreground mb-4">
              Proven Results
            </h3>
            <p className="text-muted-foreground">
              Our methodology delivers measurable outcomes for our community members.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="text-3xl font-bold text-primary mb-2">95%</div>
              <div className="text-sm text-muted-foreground">Course Completion Rate</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-primary mb-2">80%</div>
              <div className="text-sm text-muted-foreground">Career Advancement</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-primary mb-2">4.9/5</div>
              <div className="text-sm text-muted-foreground">Member Satisfaction</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default MethodologySection;