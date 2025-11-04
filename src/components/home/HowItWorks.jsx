import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';

export default function HowItWorks() {
  const steps = [
    {
      level: 'BASIC',
      description: 'Learn the fundamentals of prompt engineering and AI basics.',
      color: 'from-blue-500 to-blue-600',
    },
    {
      level: 'INTERMEDIATE',
      description: 'Master advanced prompting techniques and real-world applications.',
      color: 'from-emerald-500 to-emerald-600',
    },
    {
      level: 'ADVANCED',
      description: 'Unlock specialized AI tools and complex workflow automation.',
      color: 'from-purple-500 to-purple-600',
    },
    {
      level: 'PRO',
      description: 'Become an AI expert and teach others in the community.',
      color: 'from-orange-500 to-orange-600',
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
    hidden: { opacity: 0, scale: 0.8 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: { duration: 0.6 },
    },
  };

  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 bg-slate-50">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl font-bold text-slate-900 mb-4">
            Your Learning Journey
          </h2>
          <p className="text-lg text-slate-600">
            Progress through 4 levels of mastery, from beginner to pro
          </p>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid md:grid-cols-4 gap-6 mb-12"
        >
          {steps.map((step, index) => (
            <motion.div
              key={index}
              variants={itemVariants}
              whileHover={{ y: -8 }}
              className={`relative p-8 rounded-lg bg-gradient-to-br ${step.color} text-white shadow-lg hover:shadow-xl transition`}
            >
              <div className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/20 flex items-center justify-center font-bold text-lg">
                {index + 1}
              </div>
              <h3 className="text-2xl font-bold mb-4 mt-4">{step.level}</h3>
              <p className="text-white/90">{step.description}</p>
            </motion.div>
          ))}
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center"
        >
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.98 }}
            className="px-8 py-4 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition shadow-lg flex items-center gap-2 mx-auto"
          >
            <Link to="/courses" className="flex items-center gap-2">
              Explore the Full Curriculum
              <ArrowRight size={20} />
            </Link>
          </motion.button>
        </motion.div>
      </div>
    </section>
  );
}
