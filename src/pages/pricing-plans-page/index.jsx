import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import PublicHeader from '../../components/ui/PublicHeader';
import Footer from '../../components/ui/Footer';
import Button from '../../components/ui/Button';
import Icon from '../../components/AppIcon';

const PricingPlansPage = () => {
  const [billingPeriod, setBillingPeriod] = useState('monthly');
  const [selectedTier, setSelectedTier] = useState(null);
  const { user } = useAuth();
  const navigate = useNavigate();

  const calculateAnnualPrice = (monthlyPrice) => {
    // 20% discount for annual payment
    const monthly = parseInt(monthlyPrice?.replace(/[₦,]/g, ''));
    const annual = monthly * 12 * 0.8; // 20% discount
    return `₦${annual?.toLocaleString()}`;
  };

  const pricingPlans = [
    {
      id: 'starter',
      name: 'Starter Member',
      monthlyPrice: '₦10,000',
      period: billingPeriod === 'monthly' ? '/month' : '/year',
      description: 'Perfect for those just getting started with AI learning.',
      features: [
        'Access to limited lesson materials',
        '1 live class session per month',
        'Occasional free resources and AI tips'
      ],
      buttonText: 'Join Starter Plan',
      accentColor: '#F5A623',
      borderRadius: '12px',
      popular: false
    },
    {
      id: 'pro',
      name: 'Pro Member',
      monthlyPrice: '₦15,000',
      period: billingPeriod === 'monthly' ? '/month' : '/year',
      description: 'Best for learners seeking full lesson access and guided growth.',
      features: [
        'Access to 4 live lessons monthly',
        'Full access to all video lessons',
        'Downloadable PDF lesson materials',
        'Access to 2 levels of prompts (Basic + Advanced)',
        'Priority feedback and responses in WhatsApp group'
      ],
      buttonText: 'Join Pro Plan',
      accentColor: '#4CAF50',
      borderRadius: '12px',
      popular: true
    },
    {
      id: 'elite',
      name: 'Elite Member',
      monthlyPrice: '₦25,000',
      period: billingPeriod === 'monthly' ? '/month' : '/year',
      description: 'For serious learners who want advanced access and personalized support.',
      features: [
        'Everything in Pro tier',
        'Access to 3 levels of prompts (Basic, Advanced, Elite)',
        '1-on-1 private call or class session every month',
        'Exclusive premium resources'
      ],
      buttonText: 'Join Elite Plan',
      accentColor: '#2196F3',
      borderRadius: '12px',
      popular: false
    }
  ];

  const handlePlanSelect = (tier) => {
    setSelectedTier(tier);
    redirectToSignupWithTier(tier);
  };

  const redirectToSignupWithTier = (tier) => {
    const params = new URLSearchParams({ tier });
    navigate(`/signup?${params?.toString()}`);
  };

  const PricingCard = ({ plan, isSelected }) => {
    const displayPrice = billingPeriod === 'annual' 
      ? calculateAnnualPrice(plan?.monthlyPrice)
      : plan?.monthlyPrice;

    const gradientColors = 
      plan?.id === 'starter' ? 'from-amber-500 to-orange-600' :
      plan?.id === 'pro' ? 'from-orange-500 to-green-600' :
      'from-orange-500 to-orange-600';

    return (
      <div 
        className={`relative bg-white rounded-2xl p-8 transition-all duration-300 hover:shadow-2xl hover:-translate-y-2 border-2 ${
          plan?.popular 
            ? 'border-emerald-400 shadow-xl scale-105 ring-4 ring-emerald-100' 
            : isSelected 
              ? 'border-blue-400 shadow-xl' 
              : 'border-gray-200 hover:border-orange-300'
        }`}
      >
        {plan?.popular && (
          <div className={`absolute -top-4 left-1/2 transform -translate-x-1/2 px-6 py-2 text-sm font-bold text-white rounded-full shadow-lg bg-gradient-to-r ${gradientColors} animate-pulse-slow`}>
            ⭐ Most Popular
          </div>
        )}

        {billingPeriod === 'annual' && (
          <div className="absolute -top-3 -right-3 bg-gradient-to-r from-orange-500 to-green-600 text-white text-xs px-3 py-2 rounded-full font-bold shadow-lg border-2 border-white">
            Save 20%
          </div>
        )}

        <div className="text-center mb-8">
          <div className={`w-16 h-16 bg-gradient-to-br ${gradientColors} rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg`}>
            <Icon 
              name={plan?.id === 'starter' ? 'Zap' : plan?.id === 'pro' ? 'Award' : 'Crown'} 
              size={32} 
              className="text-white" 
            />
          </div>
          <h3 className="text-2xl font-extrabold text-gray-900 mb-4">
            {plan?.name}
          </h3>
          <div className="flex items-baseline justify-center mb-4">
            <span className={`text-5xl font-extrabold bg-gradient-to-r ${gradientColors} bg-clip-text text-transparent`}>
              {displayPrice}
            </span>
            <span className="text-gray-600 ml-2 font-medium">
              {plan?.period}
            </span>
          </div>
          {billingPeriod === 'annual' && (
            <div className="text-sm text-gray-600 mb-4 font-medium">
              Billed annually • {plan?.monthlyPrice} per month
            </div>
          )}
          <p className="text-gray-600 leading-relaxed">
            {plan?.description}
          </p>
        </div>

        <div className="space-y-4 mb-8">
          {plan?.features?.map?.((feature, index) => (
            <div key={index} className="flex items-start group">
              <div className={`w-6 h-6 bg-gradient-to-br ${gradientColors} rounded-lg flex items-center justify-center mr-3 mt-0.5 flex-shrink-0 group-hover:scale-110 transition-transform`}>
                <Icon 
                  name="Check" 
                  size={14} 
                  className="text-white font-bold" 
                />
              </div>
              <span className="text-gray-700 leading-relaxed">{feature}</span>
            </div>
          ))}
        </div>

        <Button
          fullWidth
          size="lg"
          onClick={() => handlePlanSelect(plan?.id)}
          className={`font-bold text-lg shadow-lg hover:shadow-xl transition-all hover:scale-105 ${
            plan?.popular 
              ? 'bg-gradient-to-r from-orange-500 to-green-600 hover:from-orange-600 hover:to-green-700 text-white border-0'
              : `bg-gradient-to-r ${gradientColors} hover:opacity-90 text-white border-0`
          }`}
        >
          {plan?.buttonText} →
        </Button>
      </div>
    );
  };

  const ComparisonTable = () => {
    const features = [
      { name: 'Live class sessions', starter: '1/month', pro: '4/month', elite: '4/month + 1-on-1' },
      { name: 'Video lessons access', starter: 'Limited', pro: 'Full access', elite: 'Full access' },
      { name: 'PDF materials', starter: 'Basic', pro: 'Full download', elite: 'Premium + exclusive' },
      { name: 'Prompt levels', starter: 'None', pro: 'Basic + Advanced', elite: 'All 3 levels' },
      { name: 'WhatsApp support', starter: 'General', pro: 'Priority', elite: 'Priority + 1-on-1' },
      { name: 'Monthly cost', starter: '₦10,000', pro: '₦15,000', elite: '₦25,000' }
    ];

    return (
      <div className="overflow-x-auto bg-white rounded-2xl shadow-xl border-2 border-gray-200">
        <table className="w-full">
          <thead>
            <tr className="bg-gradient-to-r from-orange-600 via-orange-600 to-pink-600">
              <th className="px-6 py-5 text-left text-sm font-extrabold text-white">Features</th>
              <th className="px-6 py-5 text-center text-sm font-extrabold text-white">
                <div className="flex flex-col items-center">
                  <Icon name="Zap" size={20} className="mb-1" />
                  Starter
                </div>
              </th>
              <th className="px-6 py-5 text-center text-sm font-extrabold text-white">
                <div className="flex flex-col items-center">
                  <Icon name="Award" size={20} className="mb-1" />
                  Pro
                </div>
              </th>
              <th className="px-6 py-5 text-center text-sm font-extrabold text-white">
                <div className="flex flex-col items-center">
                  <Icon name="Crown" size={20} className="mb-1" />
                  Elite
                </div>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y-2 divide-gray-200">
            {features?.map?.((feature, index) => (
              <tr key={index} className="hover:bg-blue-50 transition-colors">
                <td className="px-6 py-4 text-sm font-bold text-gray-900">
                  {feature?.name}
                </td>
                <td className="px-6 py-4 text-sm text-center text-gray-700 font-medium">
                  {feature?.starter}
                </td>
                <td className="px-6 py-4 text-sm text-center font-bold bg-emerald-50 text-emerald-700">
                  {feature?.pro}
                </td>
                <td className="px-6 py-4 text-sm text-center text-gray-700 font-medium">
                  {feature?.elite}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  const FAQ = () => {
    const [openIndex, setOpenIndex] = useState(null);

    const faqs = [
      {
        question: 'Can I change my plan later?',
        answer: 'Yes, you can upgrade or downgrade your plan at any time. Contact our admin team for assistance with plan changes.'
      },
      {
        question: 'What happens if I miss a live session?',
        answer: 'All live sessions are recorded and made available to members for later viewing. Pro and Elite members get priority access to recordings.'
      },
      {
        question: 'How do I access the WhatsApp group?',
        answer: 'After successful payment verification, you\'ll receive an invitation link to join the appropriate WhatsApp group for your membership tier.'
      },
      {
        question: 'Is there a free trial available?',
        answer: 'We offer occasional free resources and tips. For full access to our premium content, membership is required.'
      },
      {
        question: 'What payment methods do you accept?',
        answer: 'We accept bank transfers to our Nigerian bank accounts. Upload your payment proof after selecting a plan for verification.'
      }
    ];

    return (
      <div className="space-y-4">
        {faqs?.map?.((faq, index) => (
          <div key={index} className="bg-white rounded-2xl border-2 border-gray-200 hover:border-blue-400 hover:shadow-lg transition-all">
            <button
              className="w-full px-6 py-5 text-left flex justify-between items-center hover:bg-blue-50 rounded-2xl transition-colors group"
              onClick={() => setOpenIndex(openIndex === index ? null : index)}
            >
              <span className="font-bold text-gray-900 group-hover:text-orange-600 transition-colors">{faq?.question}</span>
              <div className={`w-8 h-8 bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform ${openIndex === index ? 'rotate-180' : ''}`}>
                <Icon 
                  name="ChevronDown" 
                  size={20} 
                  className="text-white" 
                />
              </div>
            </button>
            {openIndex === index && (
              <div className="px-6 pb-5 text-gray-700 leading-relaxed animate-slideDown">
                {faq?.answer}
              </div>
            )}
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50">
      <PublicHeader />
      
      <main className="pt-24 pb-16">
        {/* Hero Section - Enhanced */}
        <section className="text-center mb-16 animate-fadeIn">
          <div className="max-w-4xl mx-auto px-4 lg:px-6">
            <span className="inline-block px-4 py-2 bg-gradient-to-r from-orange-100 to-orange-100 rounded-full text-sm font-bold text-orange-600 mb-4">
              Pricing Plans
            </span>
            <h1 className="text-4xl lg:text-5xl font-extrabold mb-6">
              Choose Your <span className="bg-gradient-to-r from-orange-600 via-orange-600 to-pink-600 bg-clip-text text-transparent">AI Learning</span> Journey
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto leading-relaxed">
              Select the perfect membership tier to unlock access to our <span className="font-bold text-gray-900">comprehensive AI education platform</span>. 
              From beginner-friendly resources to advanced personalized support.
            </p>
            
            {/* Billing Period Toggle - Enhanced */}
            <div className="flex items-center justify-center mb-12 bg-white rounded-2xl p-2 inline-flex border-2 border-gray-200 shadow-lg">
              <span className={`mr-3 px-4 py-2 rounded-xl transition-all ${billingPeriod === 'monthly' ? 'bg-gradient-to-r from-orange-500 to-orange-600 text-white font-bold' : 'text-gray-600'}`}>
                Monthly
              </span>
              <button
                onClick={() => setBillingPeriod(billingPeriod === 'monthly' ? 'annual' : 'monthly')}
                className={`relative inline-flex h-8 w-14 items-center rounded-full transition-all shadow-inner ${
                  billingPeriod === 'annual' ? 'bg-gradient-to-r from-orange-500 to-green-600' : 'bg-gray-300'
                }`}
              >
                <span
                  className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform shadow-lg ${
                    billingPeriod === 'annual' ? 'translate-x-7' : 'translate-x-1'
                  }`}
                />
              </button>
              <span className={`ml-3 px-4 py-2 rounded-xl transition-all ${billingPeriod === 'annual' ? 'bg-gradient-to-r from-orange-500 to-green-600 text-white font-bold' : 'text-gray-600'}`}>
                Annual
              </span>
              {billingPeriod === 'annual' && (
                <span className="ml-3 px-3 py-1 bg-gradient-to-r from-emerald-100 to-green-100 text-emerald-700 text-sm rounded-full font-bold border-2 border-emerald-300 animate-pulse-slow">
                  Save 20%
                </span>
              )}
            </div>
          </div>
        </section>

        {/* Pricing Cards */}
        <section className="mb-16">
          <div className="max-w-7xl mx-auto px-4 lg:px-6">
            <div className="grid md:grid-cols-3 gap-8 lg:gap-6">
              {pricingPlans?.map?.((plan, index) => (
                <div key={plan?.id} className="animate-slideUp" style={{ animationDelay: `${0.1 * index}s` }}>
                  <PricingCard 
                    plan={plan} 
                    isSelected={selectedTier === plan?.id}
                  />
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Comparison Table */}
        <section className="mb-16 animate-slideUp" style={{ animationDelay: '0.3s' }}>
          <div className="max-w-6xl mx-auto px-4 lg:px-6">
            <div className="text-center mb-10">
              <span className="inline-block px-4 py-2 bg-gradient-to-r from-orange-100 to-pink-100 rounded-full text-sm font-bold text-orange-600 mb-4">
                Detailed Comparison
              </span>
              <h2 className="text-3xl font-extrabold bg-gradient-to-r from-gray-900 via-purple-900 to-pink-900 bg-clip-text text-transparent">
                Compare Plans
              </h2>
            </div>
            <ComparisonTable />
          </div>
        </section>

        {/* FAQ Section */}
        <section className="mb-16 animate-slideUp" style={{ animationDelay: '0.4s' }}>
          <div className="max-w-4xl mx-auto px-4 lg:px-6">
            <div className="text-center mb-10">
              <span className="inline-block px-4 py-2 bg-gradient-to-r from-orange-100 to-orange-100 rounded-full text-sm font-bold text-orange-600 mb-4">
                FAQ
              </span>
              <h2 className="text-3xl font-extrabold bg-gradient-to-r from-gray-900 via-blue-900 to-cyan-900 bg-clip-text text-transparent">
                Frequently Asked Questions
              </h2>
            </div>
            <FAQ />
          </div>
        </section>

        {/* Footer Note - Enhanced */}
        <section className="text-center animate-slideUp" style={{ animationDelay: '0.5s' }}>
          <div className="max-w-4xl mx-auto px-4 lg:px-6">
            <div className="relative overflow-hidden bg-white rounded-3xl p-10 border-2 border-gray-200 shadow-2xl">
              <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-orange-100 to-orange-100 rounded-full blur-3xl opacity-50"></div>
              
              <div className="relative">
                <div className="w-20 h-20 bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
                  <Icon name="Info" size={40} className="text-white" />
                </div>
                <h3 className="text-2xl font-extrabold text-gray-900 mb-4">
                  Ready to Get Started?
                </h3>
                <p className="text-gray-600 mb-8 leading-relaxed max-w-2xl mx-auto">
                  Choose a plan to unlock access. Once you select your tier, you'll be redirected to <span className="font-bold text-orange-600">register 
                  and upload your payment proof</span> for admin verification.
                </p>
                {!user && (
                  <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Button
                      asChild
                      size="lg"
                      className="border-2 border-orange-500 hover:bg-blue-50 font-bold text-orange-600"
                    >
                      <Link to="/signin">
                        Already have an account? Sign In →
                      </Link>
                    </Button>
                    <Button
                      asChild
                      size="lg"
                      className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-purple-700 text-white font-bold shadow-lg hover:shadow-xl border-0"
                    >
                      <Link to="/signup">
                        Create New Account →
                      </Link>
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>
      </main>
      
      <Footer />
    </div>
  );
};

export default PricingPlansPage;
