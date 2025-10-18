import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import PublicHeader from '../../components/ui/PublicHeader';
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

    return (
      <div 
        className={`relative bg-white rounded-xl p-8 transition-all duration-300 hover:shadow-xl border-2 ${
          plan?.popular 
            ? 'border-primary shadow-lg scale-105' 
            : isSelected 
              ? 'border-primary shadow-lg' 
              : 'border-gray-200 hover:border-gray-300'
        }`}
        style={{ borderRadius: plan?.borderRadius }}
      >
        {plan?.popular && (
          <div 
            className="absolute -top-3 left-1/2 transform -translate-x-1/2 px-4 py-1 text-sm font-medium text-white rounded-full"
            style={{ backgroundColor: plan?.accentColor }}
          >
            Most Popular
          </div>
        )}

        {billingPeriod === 'annual' && (
          <div className="absolute -top-2 -right-2 bg-green-500 text-white text-xs px-2 py-1 rounded-full font-medium">
            Save 20%
          </div>
        )}

        <div className="text-center mb-6">
          <h3 className="text-2xl font-bold text-foreground mb-2">
            {plan?.name}
          </h3>
          <div className="flex items-baseline justify-center mb-4">
            <span className="text-4xl font-bold text-foreground">
              {displayPrice}
            </span>
            <span className="text-muted-foreground ml-1">
              {plan?.period}
            </span>
          </div>
          {billingPeriod === 'annual' && (
            <div className="text-sm text-muted-foreground mb-2">
              Billed annually • {plan?.monthlyPrice} per month
            </div>
          )}
          <p className="text-muted-foreground">
            {plan?.description}
          </p>
        </div>

        <div className="space-y-4 mb-8">
          {plan?.features?.map?.((feature, index) => (
            <div key={index} className="flex items-start">
              <Icon 
                name="Check" 
                size={20} 
                className="text-green-500 mr-3 mt-0.5 flex-shrink-0" 
              />
              <span className="text-gray-700">{feature}</span>
            </div>
          ))}
        </div>

        <Button
          fullWidth
          variant={plan?.popular ? 'default' : 'outline'}
          size="lg"
          onClick={() => handlePlanSelect(plan?.id)}
          className={`font-semibold ${
            plan?.popular 
              ? 'bg-primary hover:bg-primary/90' :'hover:bg-gray-50'
          }`}
          style={{
            backgroundColor: plan?.popular ? plan?.accentColor : undefined,
            borderColor: !plan?.popular ? plan?.accentColor : undefined,
            color: !plan?.popular ? plan?.accentColor : undefined
          }}
        >
          {plan?.buttonText}
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
      <div className="overflow-x-auto bg-white rounded-xl shadow-sm border border-gray-200">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Features</th>
              <th className="px-6 py-4 text-center text-sm font-semibold text-gray-900">Starter</th>
              <th className="px-6 py-4 text-center text-sm font-semibold text-gray-900">Pro</th>
              <th className="px-6 py-4 text-center text-sm font-semibold text-gray-900">Elite</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {features?.map?.((feature, index) => (
              <tr key={index} className="hover:bg-gray-50">
                <td className="px-6 py-4 text-sm font-medium text-gray-900">
                  {feature?.name}
                </td>
                <td className="px-6 py-4 text-sm text-center text-gray-700">
                  {feature?.starter}
                </td>
                <td className="px-6 py-4 text-sm text-center text-gray-700">
                  {feature?.pro}
                </td>
                <td className="px-6 py-4 text-sm text-center text-gray-700">
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
          <div key={index} className="bg-white rounded-lg border border-gray-200">
            <button
              className="w-full px-6 py-4 text-left flex justify-between items-center hover:bg-gray-50"
              onClick={() => setOpenIndex(openIndex === index ? null : index)}
            >
              <span className="font-medium text-gray-900">{faq?.question}</span>
              <Icon 
                name={openIndex === index ? 'ChevronUp' : 'ChevronDown'} 
                size={20} 
                className="text-gray-500" 
              />
            </button>
            {openIndex === index && (
              <div className="px-6 pb-4 text-gray-700">
                {faq?.answer}
              </div>
            )}
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5">
      <PublicHeader />
      
      <main className="pt-24 pb-16">
        {/* Hero Section */}
        <section className="text-center mb-16">
          <div className="max-w-4xl mx-auto px-4 lg:px-6">
            <h1 className="text-4xl lg:text-5xl font-bold text-foreground mb-6">
              Choose Your <span className="text-primary">AI Learning</span> Journey
            </h1>
            <p className="text-xl text-muted-foreground mb-8 max-w-3xl mx-auto">
              Select the perfect membership tier to unlock access to our comprehensive AI education platform. 
              From beginner-friendly resources to advanced personalized support.
            </p>
            
            {/* Billing Period Toggle */}
            <div className="flex items-center justify-center mb-12">
              <span className={`mr-3 ${billingPeriod === 'monthly' ? 'text-foreground font-medium' : 'text-muted-foreground'}`}>
                Monthly
              </span>
              <button
                onClick={() => setBillingPeriod(billingPeriod === 'monthly' ? 'annual' : 'monthly')}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  billingPeriod === 'annual' ? 'bg-primary' : 'bg-gray-200'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    billingPeriod === 'annual' ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
              <span className={`ml-3 ${billingPeriod === 'annual' ? 'text-foreground font-medium' : 'text-muted-foreground'}`}>
                Annual
              </span>
              {billingPeriod === 'annual' && (
                <span className="ml-2 px-2 py-1 bg-green-100 text-green-800 text-sm rounded-full">
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
              {pricingPlans?.map?.((plan) => (
                <PricingCard 
                  key={plan?.id} 
                  plan={plan} 
                  isSelected={selectedTier === plan?.id}
                />
              ))}
            </div>
          </div>
        </section>

        {/* Comparison Table */}
        <section className="mb-16">
          <div className="max-w-6xl mx-auto px-4 lg:px-6">
            <h2 className="text-3xl font-bold text-center text-foreground mb-8">
              Compare Plans
            </h2>
            <ComparisonTable />
          </div>
        </section>

        {/* FAQ Section */}
        <section className="mb-16">
          <div className="max-w-4xl mx-auto px-4 lg:px-6">
            <h2 className="text-3xl font-bold text-center text-foreground mb-8">
              Frequently Asked Questions
            </h2>
            <FAQ />
          </div>
        </section>

        {/* Footer Note */}
        <section className="text-center">
          <div className="max-w-4xl mx-auto px-4 lg:px-6">
            <div className="bg-white rounded-xl p-8 border border-gray-200">
              <Icon name="Info" size={48} className="text-primary mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-foreground mb-4">
                Ready to Get Started?
              </h3>
              <p className="text-muted-foreground mb-6">
                Choose a plan to unlock access. Once you select your tier, you'll be redirected to register 
                and upload your payment proof for admin verification.
              </p>
              {!user && (
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button
                    asChild
                    variant="outline"
                    size="lg"
                  >
                    <Link to="/signin">
                      Already have an account? Sign In
                    </Link>
                  </Button>
                  <Button
                    asChild
                    size="lg"
                  >
                    <Link to="/signup">
                      Create New Account
                    </Link>
                  </Button>
                </div>
              )}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default PricingPlansPage;