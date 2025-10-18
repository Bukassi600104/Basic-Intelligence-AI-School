import React from 'react';
import Icon from '../../../components/AppIcon';
import Image from '../../../components/AppImage';

const TrustSection = () => {
  const testimonials = [
    {
      name: "Adunni Olatunji",
      role: "Marketing Manager",
      company: "Fintech Startup",
      content: `Basic Intelligence transformed how I approach marketing automation. The practical AI tools I learned helped increase our campaign efficiency by 300%. The community support is exceptional.`,
      image: "https://images.pexels.com/photos/1181424/pexels-photo-1181424.jpeg?auto=compress&cs=tinysrgb&w=400",
      rating: 5
    },
    {
      name: "Tunde Bakare",
      role: "Business Owner",
      company: "E-commerce Platform",
      content: `As a business owner, I was skeptical about AI. But the courses here are so practical and relevant to Nigerian businesses. I've automated 60% of my customer service using what I learned.`,
      image: "https://images.pexels.com/photos/2379005/pexels-photo-2379005.jpeg?auto=compress&cs=tinysrgb&w=400",
      rating: 5
    },
    {
      name: "Chioma Nwankwo",
      role: "Data Analyst",
      company: "Banking Sector",
      content: `The machine learning courses gave me the confidence to propose AI solutions at work. I got promoted within 6 months of joining Basic Intelligence. The investment paid off immediately.`,
      image: "https://images.pexels.com/photos/1239288/pexels-photo-1239288.jpeg?auto=compress&cs=tinysrgb&w=400",
      rating: 5
    }
  ];

  const trustIndicators = [
    {
      icon: "Shield",
      title: "Verified Learning",
      description: "All courses are reviewed by industry experts and updated regularly to ensure relevance."
    },
    {
      icon: "Users",
      title: "Active Community",
      description: "Join 500+ professionals actively learning and implementing AI in their careers."
    },
    {
      icon: "Award",
      title: "Proven Results",
      description: "95% of our members report career advancement within 12 months of joining."
    },
    {
      icon: "Clock",
      title: "Lifetime Access",
      description: "One-time payment gives you lifetime access to all courses and community resources."
    }
  ];

  const successMetrics = [
    {
      number: "500+",
      label: "Active Members",
      description: "Professionals from various industries"
    },
    {
      number: "50+",
      label: "AI Courses",
      description: "Comprehensive curriculum coverage"
    },
    {
      number: "95%",
      label: "Success Rate",
      description: "Members achieving career goals"
    },
    {
      number: "One-time",
      label: "Membership Fee",
      description: "Lifetime access to everything"
    }
  ];

  return (
    <section className="py-16 lg:py-24 bg-muted/30">
      <div className="max-w-7xl mx-auto px-4 lg:px-6">
        {/* Trust Indicators */}
        <div className="mb-20">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-4">
              Why Professionals Trust Us
            </h2>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
              We've built our reputation on delivering practical AI education that creates real career and business impact.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {trustIndicators?.map((indicator, index) => (
              <div key={index} className="bg-card border border-border rounded-xl p-6 text-center hover:shadow-lg transition-shadow duration-300">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Icon name={indicator?.icon} size={24} className="text-primary" />
                </div>
                <h3 className="font-semibold text-foreground mb-2">
                  {indicator?.title}
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {indicator?.description}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Success Metrics */}
        <div className="mb-20">
          <div className="bg-gradient-to-r from-primary/5 to-secondary/5 rounded-2xl p-8 lg:p-12">
            <div className="text-center mb-12">
              <h3 className="text-2xl lg:text-3xl font-bold text-foreground mb-4">
                Our Impact in Numbers
              </h3>
              <p className="text-muted-foreground">
                These metrics reflect our commitment to delivering measurable value to our community.
              </p>
            </div>

            <div className="grid md:grid-cols-4 gap-8">
              {successMetrics?.map((metric, index) => (
                <div key={index} className="text-center">
                  <div className="text-3xl lg:text-4xl font-bold text-primary mb-2">
                    {metric?.number}
                  </div>
                  <div className="font-semibold text-foreground mb-1">
                    {metric?.label}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {metric?.description}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Testimonials */}
        <div>
          <div className="text-center mb-12">
            <h3 className="text-2xl lg:text-3xl font-bold text-foreground mb-4">
              What Our Members Say
            </h3>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Real stories from Nigerian professionals who have transformed their careers with AI skills.
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {testimonials?.map((testimonial, index) => (
              <div key={index} className="bg-card border border-border rounded-xl p-8 hover:shadow-lg transition-shadow duration-300">
                {/* Rating */}
                <div className="flex items-center space-x-1 mb-4">
                  {[...Array(testimonial?.rating)]?.map((_, starIndex) => (
                    <Icon key={starIndex} name="Star" size={16} className="text-warning fill-current" />
                  ))}
                </div>

                {/* Content */}
                <blockquote className="text-muted-foreground mb-6 leading-relaxed">
                  "{testimonial?.content}"
                </blockquote>

                {/* Author */}
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 overflow-hidden rounded-full">
                    <Image
                      src={testimonial?.image}
                      alt={testimonial?.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <div className="font-semibold text-foreground">
                      {testimonial?.name}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {testimonial?.role} • {testimonial?.company}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Trust Badge */}
        <div className="mt-16 bg-card border border-border rounded-2xl p-8 lg:p-12 text-center">
          <div className="flex items-center justify-center space-x-4 mb-6">
            <Icon name="Shield" size={32} className="text-success" />
            <Icon name="CheckCircle" size={32} className="text-success" />
            <Icon name="Award" size={32} className="text-success" />
          </div>
          <h3 className="text-xl font-bold text-foreground mb-4">
            Trusted by Nigerian Professionals
          </h3>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Join hundreds of professionals who have already transformed their careers with practical AI skills. 
            Your success is our mission, and we're committed to supporting you every step of the way.
          </p>
        </div>
      </div>
    </section>
  );
};

export default TrustSection;
