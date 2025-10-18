import React from 'react';
import Icon from '../../../components/AppIcon';


const StorySection = () => {
  const milestones = [
    {
      year: "2023",
      title: "Foundation",
      description: "Basic Intelligence was established with a vision to democratize AI education in Nigeria.",
      icon: "Rocket"
    },
    {
      year: "2024",
      title: "Community Growth",
      description: "Reached 500+ active members across various industries and professional backgrounds.",
      icon: "Users"
    },
    {
      year: "2024",
      title: "Course Expansion", 
      description: "Launched comprehensive AI curriculum covering machine learning, automation, and business applications.",
      icon: "BookOpen"
    },
    {
      year: "2025",
      title: "Future Vision",
      description: "Expanding to serve 10,000+ professionals with advanced AI certification programs.",
      icon: "Trophy"
    }
  ];

  return (
    <section className="py-16 lg:py-24 bg-background">
      <div className="max-w-7xl mx-auto px-4 lg:px-6">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Story Content */}
          <div className="space-y-8">
            <div className="space-y-4">
              <h2 className="text-3xl lg:text-4xl font-bold text-foreground">
                Our Story
              </h2>
              <p className="text-lg text-muted-foreground leading-relaxed">
                Basic Intelligence emerged from a simple observation: while artificial intelligence was transforming industries globally, Nigerian professionals lacked accessible, practical AI education tailored to their needs.
              </p>
            </div>

            <div className="space-y-6">
              <div className="flex items-start space-x-4">
                <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                  <Icon name="Lightbulb" size={16} className="text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground mb-2">The Challenge</h3>
                  <p className="text-muted-foreground">
                    Most AI courses were either too theoretical or designed for international markets, leaving Nigerian professionals without practical, locally-relevant training.
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="w-8 h-8 bg-secondary/10 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                  <Icon name="Target" size={16} className="text-secondary" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground mb-2">Our Solution</h3>
                  <p className="text-muted-foreground">
                    We created a community-driven platform offering practical AI education with real-world applications, affordable pricing, and ongoing support.
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="w-8 h-8 bg-success/10 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                  <Icon name="TrendingUp" size={16} className="text-success" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground mb-2">The Impact</h3>
                  <p className="text-muted-foreground">
                    Today, our members are implementing AI solutions in their businesses, advancing their careers, and contributing to Nigeria's digital transformation.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Timeline */}
          <div className="space-y-8">
            <h3 className="text-2xl font-bold text-foreground text-center lg:text-left">
              Our Journey
            </h3>
            
            <div className="space-y-6">
              {milestones?.map((milestone, index) => (
                <div key={index} className="flex items-start space-x-4">
                  <div className="flex flex-col items-center">
                    <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center">
                      <Icon name={milestone?.icon} size={20} color="white" />
                    </div>
                    {index < milestones?.length - 1 && (
                      <div className="w-0.5 h-16 bg-border mt-4"></div>
                    )}
                  </div>
                  
                  <div className="flex-1 pb-8">
                    <div className="flex items-center space-x-3 mb-2">
                      <span className="text-sm font-bold text-primary bg-primary/10 px-2 py-1 rounded">
                        {milestone?.year}
                      </span>
                      <h4 className="font-semibold text-foreground">
                        {milestone?.title}
                      </h4>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {milestone?.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default StorySection;