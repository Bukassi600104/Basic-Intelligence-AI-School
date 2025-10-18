import React from 'react';
import { Link } from 'react-router-dom';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

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
    <section className="py-16 lg:py-24 bg-background">
      <div className="max-w-7xl mx-auto px-4 lg:px-6">
        {/* Main CTA */}
        <div className="bg-gradient-to-br from-primary via-primary to-secondary rounded-3xl p-8 lg:p-16 text-center text-white mb-16">
          <div className="max-w-4xl mx-auto">
            <Icon name="Rocket" size={64} className="mx-auto mb-8 opacity-80" />
            
            <h2 className="text-3xl lg:text-5xl font-bold mb-6">
              Ready to Transform Your Career with AI?
            </h2>
            
            <p className="text-xl lg:text-2xl opacity-90 mb-8 leading-relaxed">
              Join 500+ Nigerian professionals who are already using AI to advance their careers and grow their businesses.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <Link to="/join-membership-page">
                <Button 
                  variant="outline" 
                  size="lg" 
                  className="bg-white text-primary hover:bg-white/90 border-white"
                  iconName="UserPlus" 
                  iconPosition="left"
                >
                  Join our Community
                </Button>
              </Link>
              
              <Button 
                variant="ghost" 
                size="lg" 
                className="text-white border-white/30 hover:bg-white/10"
                iconName="MessageCircle" 
                iconPosition="left"
              >
                Ask Questions on WhatsApp
              </Button>
            </div>

            {/* Benefits Grid */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 text-left">
              {benefits?.map((benefit, index) => (
                <div key={index} className="flex items-center space-x-3 bg-white/10 rounded-lg p-4">
                  <Icon name="Check" size={20} className="text-white flex-shrink-0" />
                  <span className="text-sm">{benefit}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="grid lg:grid-cols-2 gap-16 items-start">
          <div>
            <h3 className="text-2xl lg:text-3xl font-bold text-foreground mb-6">
              Frequently Asked Questions
            </h3>
            <div className="space-y-6">
              {faqs?.map((faq, index) => (
                <div key={index} className="bg-card border border-border rounded-lg p-6">
                  <h4 className="font-semibold text-foreground mb-3 flex items-center">
                    <Icon name="HelpCircle" size={20} className="text-primary mr-3" />
                    {faq?.question}
                  </h4>
                  <p className="text-muted-foreground leading-relaxed pl-8">
                    {faq?.answer}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-8">
            {/* Contact Card */}
            <div className="bg-muted/30 rounded-2xl p-8">
              <h4 className="text-xl font-bold text-foreground mb-4">
                Still Have Questions?
              </h4>
              <p className="text-muted-foreground mb-6">
                Our team is here to help you discover how AI can help you create, earn, and innovate in your field.
              </p>
              
              <div className="space-y-4">
                <Button 
                  variant="outline" 
                  fullWidth 
                  className="justify-start"
                  iconName="MessageCircle" 
                  iconPosition="left"
                >
                  WhatsApp: +2349062284074
                </Button>
                
                <Button 
                  variant="outline" 
                  fullWidth 
                  className="justify-start"
                  iconName="Mail" 
                  iconPosition="left"
                >
                  hello@basicintelligence.com
                </Button>
              </div>
            </div>

            {/* Guarantee Card */}
            <div className="bg-success/5 border border-success/20 rounded-2xl p-8">
              <div className="flex items-center space-x-3 mb-4">
                <Icon name="Shield" size={24} className="text-success" />
                <h4 className="text-xl font-bold text-foreground">
                  Our Commitment
                </h4>
              </div>
              <p className="text-muted-foreground leading-relaxed">
                We're so confident in our program that we offer ongoing support until you achieve your AI learning goals. 
                Your success is our success.
              </p>
            </div>

            {/* Urgency Card */}
            <div className="bg-warning/5 border border-warning/20 rounded-2xl p-8">
              <div className="flex items-center space-x-3 mb-4">
                <Icon name="Clock" size={24} className="text-warning" />
                <h4 className="text-xl font-bold text-foreground">
                  Don't Wait
                </h4>
              </div>
              <p className="text-muted-foreground leading-relaxed">
                AI is transforming industries rapidly. The professionals who start learning today will have a significant advantage tomorrow. 
                Join us now and stay ahead of the curve.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CallToActionSection;
