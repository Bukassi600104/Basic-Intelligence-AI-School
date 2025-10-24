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
    <div className="bg-white border-2 border-gray-200 rounded-2xl p-8 hover:shadow-xl transition-all animate-slideUp" style={{ animationDelay: '0.1s' }}>
      <h3 className="text-xl font-bold text-gray-900 mb-6 text-center">
        Need Help or Already a Member?
      </h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Existing Member Login - Enhanced */}
        <div className="relative overflow-hidden p-6 bg-gradient-to-br from-orange-50 to-orange-50 rounded-2xl text-center group hover:shadow-lg transition-all border-2 border-orange-200 hover:border-orange-400">
          <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-orange-200 to-orange-200 rounded-full blur-2xl opacity-50"></div>
          
          <div className="relative">
            <div className="w-14 h-14 bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 group-hover:rotate-3 transition-all">
              <Icon name="LogIn" size={28} className="text-white" />
            </div>
            <h4 className="text-lg font-bold text-gray-900 mb-2">
              Already a Member?
            </h4>
            <p className="text-sm text-gray-600 mb-4 leading-relaxed">
              If you've already paid and received your <span className="font-bold text-blue-600">Member ID</span>, login to access your dashboard
            </p>
            <Link to="/signin">
              <Button variant="outline" size="sm" className="w-full border-2 border-orange-500 hover:bg-orange-50 font-bold">
                <Icon name="ArrowRight" size={16} className="mr-2" />
                Login to Dashboard
              </Button>
            </Link>
          </div>
        </div>

        {/* Support Contact - Enhanced */}
        <div className="relative overflow-hidden p-6 bg-gradient-to-br from-emerald-50 to-green-50 rounded-2xl text-center group hover:shadow-lg transition-all border-2 border-emerald-200 hover:border-emerald-400">
          <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-emerald-200 to-green-200 rounded-full blur-2xl opacity-50"></div>
          
          <div className="relative">
            <div className="w-14 h-14 bg-gradient-to-br from-emerald-500 to-green-600 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 group-hover:rotate-3 transition-all">
              <Icon name="MessageCircle" size={28} className="text-white" />
            </div>
            <h4 className="text-lg font-bold text-gray-900 mb-2">
              Need Support?
            </h4>
            <p className="text-sm text-gray-600 mb-4 leading-relaxed">
              Have questions about payment or need assistance? Contact us <span className="font-bold text-emerald-600">directly</span>
            </p>
            <Button 
              variant="outline" 
              size="sm" 
              className="w-full border-2 border-emerald-500 hover:bg-emerald-50 font-bold"
              onClick={handleWhatsAppSupport}
            >
              <Icon name="Phone" size={16} className="mr-2" />
              WhatsApp Support
            </Button>
          </div>
        </div>
      </div>

      {/* Additional Information - Enhanced */}
      <div className="mt-6 pt-6 border-t-2 border-gray-200">
        <div className="flex items-start space-x-4">
          <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl flex items-center justify-center flex-shrink-0">
            <Icon name="Info" size={24} className="text-white" />
          </div>
          <div className="text-sm text-gray-600 flex-1">
            <p className="mb-3 leading-relaxed">
              <strong className="text-gray-900">Payment Verification Process:</strong> After submitting your payment details, our team will verify your transfer within <span className="font-bold text-purple-600">24-48 hours</span>. You'll receive a WhatsApp message with your unique Member ID once verified.
            </p>
            <p className="leading-relaxed">
              <strong className="text-gray-900">Member ID Format:</strong> Your Member ID will follow the pattern <span className="font-mono font-bold text-blue-600">BI0001, BI0002</span>, etc., and will be required for future logins along with your email address.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AlternativeActions;

