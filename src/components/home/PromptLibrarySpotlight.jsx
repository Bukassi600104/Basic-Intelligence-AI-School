import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, BookOpen, Tag } from 'lucide-react';

export default function PromptLibrarySpotlight() {
  const features = [
    { icon: Tag, text: 'Sorted by Industry' },
    { icon: BookOpen, text: 'Sorted by Task' },
    { icon: CheckCircle, text: 'Save to Your Dashboard' },
  ];

  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
      <div className="max-w-6xl mx-auto">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          {/* Left: Text Content */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl font-bold text-slate-900 mb-4">
              Never Write a Bad Prompt Again
            </h2>
            <p className="text-xl text-slate-600 mb-8">
              Unlock the Basic AI Prompt Library, your private vault of thousands of expert-crafted prompts ready to use.
            </p>

            <div className="space-y-4">
              {features.map((feature, index) => {
                const Icon = feature.icon;
                return (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    viewport={{ once: true }}
                    className="flex items-center gap-4"
                  >
                    <Icon className="w-6 h-6 text-blue-600 flex-shrink-0" />
                    <span className="text-lg text-slate-700">{feature.text}</span>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>

          {/* Right: Visual Mockup */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            whileHover={{ scale: 1.02 }}
            className="bg-gradient-to-br from-slate-100 to-slate-200 rounded-lg p-8 shadow-lg"
          >
            <div className="bg-white rounded p-6 space-y-4">
              <div className="h-8 bg-slate-200 rounded w-3/4"></div>
              <div className="space-y-3">
                <div className="h-4 bg-slate-100 rounded"></div>
                <div className="h-4 bg-slate-100 rounded"></div>
                <div className="h-4 bg-slate-100 rounded w-5/6"></div>
              </div>
              <div className="pt-4 border-t border-slate-200">
                <div className="flex gap-2">
                  <div className="h-3 bg-blue-300 rounded flex-1"></div>
                  <div className="h-3 bg-emerald-300 rounded flex-1"></div>
                  <div className="h-3 bg-purple-300 rounded flex-1"></div>
                </div>
              </div>
            </div>
            <p className="text-center text-slate-500 text-sm mt-4">
              Access thousands of organized prompts
            </p>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
