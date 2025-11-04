import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Menu, X } from 'lucide-react';

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <motion.nav
      className={`fixed top-0 w-full z-50 transition-all duration-300 ${
        isScrolled ? 'bg-white/70 backdrop-blur-md shadow-md' : 'bg-transparent'
      }`}
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex-shrink-0">
            <div className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-emerald-600 bg-clip-text text-transparent">
              Basic AI
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <Link to="/courses" className="text-slate-700 hover:text-blue-600 transition">
              Courses
            </Link>
            <Link to="#" className="text-slate-700 hover:text-blue-600 transition">
              Prompt Library
            </Link>
            <Link to="#pricing" className="text-slate-700 hover:text-blue-600 transition">
              Pricing
            </Link>
            <Link to="#" className="text-slate-700 hover:text-blue-600 transition">
              Community
            </Link>
          </div>

          {/* Right side buttons */}
          <div className="hidden md:flex items-center space-x-4">
            <Link to="/auth/signin" className="text-slate-700 hover:text-blue-600 transition">
              Login
            </Link>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.98 }}
              className="px-6 py-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition"
            >
              <Link to="/auth/signup">Join Now</Link>
            </motion.button>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-2 text-slate-700"
            >
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </motion.button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation Menu */}
      <motion.div
        initial={{ opacity: 0, height: 0 }}
        animate={{
          opacity: isMenuOpen ? 1 : 0,
          height: isMenuOpen ? 'auto' : 0,
        }}
        transition={{ duration: 0.3 }}
        className="md:hidden overflow-hidden bg-white/95 backdrop-blur-md"
      >
        <div className="px-4 pt-2 pb-4 space-y-2">
          <Link
            to="/courses"
            className="block px-4 py-2 text-slate-700 hover:bg-blue-50 rounded transition"
            onClick={() => setIsMenuOpen(false)}
          >
            Courses
          </Link>
          <Link
            to="#"
            className="block px-4 py-2 text-slate-700 hover:bg-blue-50 rounded transition"
            onClick={() => setIsMenuOpen(false)}
          >
            Prompt Library
          </Link>
          <Link
            to="#pricing"
            className="block px-4 py-2 text-slate-700 hover:bg-blue-50 rounded transition"
            onClick={() => setIsMenuOpen(false)}
          >
            Pricing
          </Link>
          <Link
            to="#"
            className="block px-4 py-2 text-slate-700 hover:bg-blue-50 rounded transition"
            onClick={() => setIsMenuOpen(false)}
          >
            Community
          </Link>
          <Link
            to="/auth/signin"
            className="block px-4 py-2 text-slate-700 hover:bg-blue-50 rounded transition"
            onClick={() => setIsMenuOpen(false)}
          >
            Login
          </Link>
          <Link
            to="/auth/signup"
            className="block px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition text-center"
            onClick={() => setIsMenuOpen(false)}
          >
            Join Now
          </Link>
        </div>
      </motion.div>
    </motion.nav>
  );
}
