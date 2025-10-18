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
      description: "Our curriculum is crafted and reviewed by industry practitioners, ensuring you learn relevant, up-to-date skills—not just abstract theory."
    },
    {
      icon: "Target",
      title: "Focus on Practical Outcomes",
      description: "You won't just learn; you'll build. Finish our courses with portfolio-ready projects that demonstrate your new abilities to clients and employers."
    },
    {
      icon: "Globe",
      title: "A Global Community Network",
      description: "Join our exclusive member group to connect with ambitious professionals, creators, and entrepreneurs from around the world."
    },
    {
      icon: "Headphones",
      title: "Dedicated Support",
      description: "Get direct access to our team for questions and guidance via our community channels and email. We're here to help you succeed."
    }
  ];

  return (
    <section className="py-20 lg:py-24 bg-gradient-to-br from-muted/50 to-background">
      <div className="max-w-7xl mx-auto px-4 lg:px-6">
        {/* Contact Methods - Simplified */}
        <div className="mb-20">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Get in Touch
            </h2>
            <p className="text-lg text-muted-foreground">
              Have questions about our AI courses? We're here to help you start your learning journey.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-6 max-w-md mx-auto">
            {/* WhatsApp Button */}
            <Button 
              variant="default" 
              size="lg"
              iconName="MessageCircle"
              iconPosition="left"
              className="w-full sm:w-auto bg-green-600 hover:bg-green-700 border-green-600"
              onClick={handleWhatsAppClick}
            >
              Chat on WhatsApp
            </Button>

            {/* Contact Form Button */}
            <Link to="/contact" className="w-full sm:w-auto">
              <Button 
                variant="outline" 
                size="lg"
                iconName="Mail"
                iconPosition="left"
                className="w-full"
              >
                Contact Form
              </Button>
            </Link>
          </div>

        </div>

        {/* Trust Signals */}
        <div className="bg-card border border-border rounded-2xl p-8 lg:p-12">
          <div className="text-center mb-12">
            <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-4">
              The Basic Intelligence Difference
            </h2>
            <p className="text-muted-foreground">
              We're committed to providing a practical, high-impact AI learning experience. Your success is our mission.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {trustSignals?.map((signal, index) => (
              <div key={index} className="text-center">
                <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <Icon 
                    name={signal?.icon} 
                    size={24} 
                    className="text-primary"
                  />
                </div>
                
                <h3 className="font-semibold text-foreground mb-2">
                  {signal?.title}
                </h3>
                
                <p className="text-sm text-muted-foreground">
                  {signal?.description}
                </p>
              </div>
            ))}
          </div>

          {/* Final CTA */}
          <div className="text-center mt-12 pt-8 border-t border-border">
            <h3 className="text-xl font-semibold text-foreground mb-4">
              Ready to Start Your AI Journey?
            </h3>
            <p className="text-muted-foreground mb-6">
              Join our community of AI learners and professionals today
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link to="/join-membership-page">
                <Button 
                  variant="default" 
                  size="lg"
                  iconName="Rocket"
                  iconPosition="left"
                  className="w-full sm:w-auto"
                >
                  Join Now
                </Button>
              </Link>
              <Link to="/about-page">
                <Button 
                  variant="ghost" 
                  size="lg"
                  iconName="ArrowRight"
                  iconPosition="right"
                  className="w-full sm:w-auto"
                >
                  Learn About Us
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ContactSection;
