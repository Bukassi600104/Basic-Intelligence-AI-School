import React from 'react';
import { Link } from 'react-router-dom';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const AlternativeActions = () => {
  const handleWhatsAppSupport = () => {
    const message = encodeURIComponent(
      "Hello! I need help with my Basic Intelligence Community School membership payment."
    );
    const whatsappUrl = `https://wa.me/2349062284074?text=${message}`;
    window.open(whatsappUrl, '_blank');
  };

  return (
    <div className="bg-card border border-border rounded-lg p-6">
      <h3 className="text-lg font-semibold text-foreground mb-4 text-center">
        Need Help or Already a Member?
      </h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Existing Member Login */}
        <div className="p-4 bg-muted/30 rounded-lg text-center">
          <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-3">
            <Icon name="LogIn" size={24} className="text-primary" />
          </div>
          <h4 className="text-sm font-semibold text-foreground mb-2">
            Already a Member?
          </h4>
          <p className="text-xs text-muted-foreground mb-4">
            If you've already paid and received your Member ID, login to access your dashboard
          </p>
          <Link to="/signin">
            <Button variant="outline" size="sm" className="w-full">
              <Icon name="ArrowRight" size={14} className="mr-2" />
              Login to Dashboard
            </Button>
          </Link>
        </div>

        {/* Support Contact */}
        <div className="p-4 bg-muted/30 rounded-lg text-center">
          <div className="w-12 h-12 bg-success/10 rounded-lg flex items-center justify-center mx-auto mb-3">
            <Icon name="MessageCircle" size={24} className="text-success" />
          </div>
          <h4 className="text-sm font-semibold text-foreground mb-2">
            Need Support?
          </h4>
          <p className="text-xs text-muted-foreground mb-4">
            Have questions about payment or need assistance? Contact us directly
          </p>
          <Button 
            variant="outline" 
            size="sm" 
            className="w-full"
            onClick={handleWhatsAppSupport}
          >
            <Icon name="Phone" size={14} className="mr-2" />
            WhatsApp Support
          </Button>
        </div>
      </div>

      {/* Additional Information */}
      <div className="mt-6 pt-4 border-t border-border">
        <div className="flex items-start space-x-3">
          <Icon name="Info" size={16} className="text-muted-foreground flex-shrink-0 mt-0.5" />
          <div className="text-xs text-muted-foreground">
            <p className="mb-2">
              <strong>Payment Verification Process:</strong> After submitting your payment details, our team will verify your transfer within 24-48 hours. You'll receive a WhatsApp message with your unique Member ID once verified.
            </p>
            <p>
              <strong>Member ID Format:</strong> Your Member ID will follow the pattern BI0001, BI0002, etc., and will be required for future logins along with your email address.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AlternativeActions;
