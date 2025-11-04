import React, { useState } from 'react';
import { motion } from 'framer-motion';

export default function SocialProof() {
  const [hoveredLogo, setHoveredLogo] = useState(null);

  const logos = [
    { name: 'ChatGPT', initials: 'GPT' },
    { name: 'Google Gemini', initials: 'Gemini' },
    { name: 'Google Studio', initials: 'Studio' },
    { name: 'Midjourney', initials: 'MJ' },
  ];

  return (
    <motion.section
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      transition={{ duration: 0.8 }}
      viewport={{ once: true }}
      className="py-16 px-4 sm:px-6 lg:px-8 bg-slate-900 text-white"
    >
      <div className="max-w-6xl mx-auto">
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center text-lg sm:text-xl font-semibold mb-12"
        >
          Master the Tools You Already Know and Love
        </motion.p>

        <div className="flex flex-wrap justify-center items-center gap-8 sm:gap-12">
          {logos.map((logo, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0.6 }}
              whileInView={{ opacity: 1 }}
              onHoverStart={() => setHoveredLogo(index)}
              onHoverEnd={() => setHoveredLogo(null)}
              whileHover={{ scale: 1.1 }}
              transition={{ duration: 0.3 }}
              viewport={{ once: true }}
              className="cursor-pointer"
            >
              <div className={`px-6 py-4 rounded-lg border-2 transition-all ${
                hoveredLogo === index
                  ? 'border-blue-400 bg-blue-500/20'
                  : 'border-slate-600 bg-slate-800'
              }`}>
                <span className="font-bold text-lg">{logo.initials}</span>
              </div>
              <p className="text-sm text-center mt-2 text-slate-300">{logo.name}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.section>
  );
}
