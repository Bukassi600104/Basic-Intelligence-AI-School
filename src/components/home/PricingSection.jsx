import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CheckCircle, Zap } from 'lucide-react';

export default function PricingSection() {
  const tiers = [
    {
      name: 'MONTHLY',
      price: '₦5,000',
      period: '/month',
      isPopular: false,
      features: [
        'Access to ALL 4 Course Levels',
        'FULL Prompt Library Access',
        'Live Weekly Practicals',
        'Private Community',
      ],
    },
    {
      name: 'ANNUAL',
      price: '₦50,000',
      period: '/year',
      isPopular: true,
      features: [
        'Access to ALL 4 Course Levels',
        'FULL Prompt Library Access',
        'Live Weekly Practicals',
        'Private Community',
      ],
      savings: 'Save ₦10,000+',
    },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20, scale: 0.95 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: { duration: 0.6 },
    },
  };

  return (
    <section id="pricing" className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl font-bold text-slate-900 mb-4">
            Become a Member. Get Instant Access.
          </h2>
          <p className="text-lg text-slate-600">
            Choose the plan that works best for you
          </p>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto"
        >
          {tiers.map((tier, index) => (
            <motion.div
              key={index}
              variants={itemVariants}
              whileHover={{ y: -12 }}
              className={`relative p-10 rounded-lg transition ${
                tier.isPopular
                  ? 'border-2 border-blue-600 bg-gradient-to-br from-blue-50 to-white shadow-xl'
                  : 'border-2 border-slate-200 bg-white'
              }`}
            >
              {/* Best Value Badge */}
              {tier.isPopular && (
                <motion.div
                  initial={{ y: -10, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  className="absolute -top-4 left-1/2 transform -translate-x-1/2"
                >
                  <div className="bg-blue-600 text-white px-4 py-2 rounded-full text-sm font-bold flex items-center gap-2">
                    <Zap size={16} />
                    BEST VALUE
                  </div>
                </motion.div>
              )}

              <h3 className="text-2xl font-bold text-slate-900 mb-2">
                {tier.name}
              </h3>

              {tier.savings && (
                <p className="text-sm text-emerald-600 font-semibold mb-4">
                  {tier.savings}
                </p>
              )}

              <div className="mb-6">
                <span className="text-5xl font-bold text-slate-900">
                  {tier.price}
                </span>
                <span className="text-slate-600 ml-2">{tier.period}</span>
              </div>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.98 }}
                className={`w-full py-3 rounded-lg font-semibold transition mb-6 ${
                  tier.isPopular
                    ? 'bg-blue-600 text-white hover:bg-blue-700'
                    : 'border-2 border-blue-600 text-blue-600 hover:bg-blue-50'
                }`}
              >
                <Link to="/auth/signup">Join Now</Link>
              </motion.button>

              <p className="text-sm text-slate-600 text-center mb-6 font-semibold">
                30-Day Money-Back Guarantee
              </p>

              <div className="space-y-4">
                {tier.features.map((feature, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, x: -10 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    viewport={{ once: true }}
                    className="flex items-center gap-3"
                  >
                    <CheckCircle className="w-5 h-5 text-emerald-600 flex-shrink-0" />
                    <span className="text-slate-700">{feature}</span>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
