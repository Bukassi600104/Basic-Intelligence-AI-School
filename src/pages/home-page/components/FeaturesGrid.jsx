import React from 'react';
import Icon from '../../../components/AppIcon';

const FeaturesGrid = () => {
  const features = [
    {
      id: 1,
      icon: "Target",
      title: "Focus on Application",
      description: "Learn by doing. Our curriculum is centered on real-world projects and case studies, so you build a practical skill set from day one.",
      color: "from-emerald-50 to-green-100",
      textColor: "text-emerald-900",
      iconColor: "text-emerald-600",
      borderColor: "border-emerald-200",
      shadowColor: "hover:shadow-emerald-100"
    },
    {
      id: 2,
      icon: "Eye",
      title: "Clarity Above All",
      description: "We cut through the jargon. Our lessons are designed to be clear, accessible, and immediately useful, regardless of your technical background.",
      color: "from-blue-50 to-cyan-100",
      textColor: "text-blue-900",
      iconColor: "text-blue-600",
      borderColor: "border-blue-200",
      shadowColor: "hover:shadow-blue-100"
    },
    {
      id: 3,
      icon: "Video",
      title: "Live Expert Access",
      description: "Get your questions answered in real-time. Our live sessions with industry experts ensure you're never learning alone.",
      color: "from-orange-50 to-amber-100",
      textColor: "text-orange-900",
      iconColor: "text-orange-600",
      borderColor: "border-orange-200",
      shadowColor: "hover:shadow-orange-100"
    },
    {
      id: 4,
      icon: "Globe",
      title: "A Global Community",
      description: "Connect with a network of ambitious peers from around the world, sharing insights and opportunities.",
      color: "from-purple-50 to-violet-100",
      textColor: "text-purple-900",
      iconColor: "text-purple-600",
      borderColor: "border-purple-200",
      shadowColor: "hover:shadow-purple-100"
    }
  ];

  return (
    <section className="py-20 lg:py-24 bg-background">
      <div className="max-w-7xl mx-auto px-4 lg:px-6">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Why Choose Basic Intelligence?
          </h2>
          <p className="text-lg text-muted-foreground">
            We're built for busy professionals, creators, and entrepreneurs who need results, not just knowledge. Here's what sets us apart:
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {features?.map((feature) => (
            <div 
              key={feature?.id}
              className={`
                group relative rounded-2xl p-8 border-2 transition-all duration-500 
                bg-gradient-to-br ${feature.color} ${feature.borderColor}
                hover:scale-105 hover:shadow-2xl ${feature.shadowColor}
                transform-gpu
              `}
            >
              {/* Background Pattern */}
              <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              
              {/* Icon */}
              <div className="relative z-10 mb-6">
                <div className={`w-16 h-16 bg-white/80 backdrop-blur-sm rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-all duration-300 shadow-lg`}>
                  <Icon 
                    name={feature?.icon} 
                    size={32} 
                    className={`${feature.iconColor} group-hover:scale-110 transition-transform duration-300`} 
                  />
                </div>
              </div>

              {/* Content */}
              <div className="relative z-10">
                <h3 className={`text-xl font-bold mb-4 ${feature.textColor}`}>
                  {feature?.title}
                </h3>
                
                <p className={`leading-relaxed ${feature.textColor} opacity-90`}>
                  {feature?.description}
                </p>
              </div>

              {/* Hover Effect Border */}
              <div className="absolute inset-0 rounded-2xl border-2 border-transparent group-hover:border-white/30 transition-all duration-500 pointer-events-none"></div>
            </div>
          ))}
        </div>

        {/* Bottom Spacing - No CTA */}
        <div className="mt-16"></div>
      </div>
    </section>
  );
};

export default FeaturesGrid;
