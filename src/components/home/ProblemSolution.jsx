import React from 'react';
import { motion } from 'framer-motion';
import { AlertCircle, HelpCircle, Zap, CheckCircle } from 'lucide-react';

export default function ProblemSolution() {
  const problems = [
    {
      icon: AlertCircle,
      title: 'Feeling Left Behind?',
      description: 'AI is moving too fast and you\'re worried about being left behind in your industry.',
    },
    {
      icon: HelpCircle,
      title: 'Don\'t Know Where to Start?',
      description: 'You want to use AI but unsure how to apply it effectively to your job and business.',
    },
    {
      icon: Zap,
      title: 'Wasting Time on Bad Prompts?',
      description: 'Getting generic, useless results because you don\'t know how to structure your requests.',
    },
  ];

  const solutions = [
    'A 4-Level Learning Path',
    'The Ultimate Prompt Library',
    'Live Practicals & Community',
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6 },
    },
  };

  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
      <div className="max-w-6xl mx-auto">
        {/* Problems Section */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="mb-16"
        >
          <motion.h2
            variants={itemVariants}
            className="text-3xl sm:text-4xl font-bold text-slate-900 mb-12 text-center"
          >
            The Challenge You're Facing
          </motion.h2>

          <div className="grid md:grid-cols-3 gap-8">
            {problems.map((problem, index) => {
              const Icon = problem.icon;
              return (
                <motion.div
                  key={index}
                  variants={itemVariants}
                  whileHover={{ y: -8 }}
                  className="p-8 border border-slate-200 rounded-lg hover:shadow-lg transition"
                >
                  <Icon className="w-12 h-12 text-blue-600 mb-4" />
                  <h3 className="text-xl font-semibold text-slate-900 mb-3">
                    {problem.title}
                  </h3>
                  <p className="text-slate-600">{problem.description}</p>
                </motion.div>
              );
            })}
          </div>
        </motion.div>

        {/* Solution Section */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="bg-gradient-to-r from-blue-50 to-emerald-50 p-12 rounded-lg"
        >
          <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-8 text-center">
            The 'Basic Intelligence' Path is Your All-in-One Solution
          </h2>

          <div className="space-y-4 max-w-2xl mx-auto">
            {solutions.map((solution, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="flex items-center gap-4"
              >
                <CheckCircle className="w-6 h-6 text-emerald-600 flex-shrink-0" />
                <span className="text-lg text-slate-700">{solution}</span>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
