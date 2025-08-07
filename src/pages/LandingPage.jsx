import React from 'react';
import { motion } from 'framer-motion';

export default function LandingPage() {
  return (
    <div className="bg-stone-50">
      <section className="min-h-[60vh] md:min-h-[80vh] flex items-center bg-gradient-to-br from-orange-50 to-amber-100 p-6">
        <div className="container mx-auto text-center">
          <motion.h1
            initial={{ opacity: 0, y: -40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-5xl md:text-7xl font-bold text-stone-800 mb-4 leading-tight"
          >
            Your Path to Inner Balance Begins Here.
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.5 }}
            className="text-lg md:text-xl text-stone-600 max-w-3xl mx-auto mb-10"
          >
            Rise Up integrates timeless wisdom with modern tools to help you find clarity, strength, and peace.
          </motion.p>
          <motion.a
            href="/login"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, delay: 1 }}
          >
            <button className="bg-amber-600 text-white font-bold py-4 px-12 rounded-full hover:bg-amber-700 transition-transform duration-300 transform hover:scale-105 shadow-xl text-lg">
              Start Your Journey
            </button>
          </motion.a>
        </div>
      </section>
      <section id="about-us" className="py-20 bg-stone-100">
        <div className="container mx-auto px-6 flex flex-col md:flex-row items-center gap-12">
          <motion.div
            className="md:w-1/2"
            initial={{ opacity: 0, x: -60 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <img src="https://placehold.co/600x400/FFF7ED/6D4C41?text=Inner+Peace" alt="A serene landscape representing inner peace" className="rounded-2xl shadow-2xl w-full" />
          </motion.div>
          <motion.div
            className="md:w-1/2 text-center md:text-left"
            initial={{ opacity: 0, x: 60 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.3 }}
          >
            <h2 className="text-4xl font-bold text-stone-800 mb-4">Our Philosophy</h2>
            <p className="text-stone-600 text-lg mb-6 leading-relaxed">
              Modern Western culture promotes a life of constant seeking—chasing fleeting pleasures and external validation. This path of endless consumption drains your vital energy, leading to anxiety and burnout. We believe there is a better way.
              <br /><br />
              <span className="font-bold text-amber-700">Rise Up</span> is founded on the timeless Indian tradition of <span className="font-bold">Brahmacharya</span>: the mastery and conservation of energy. By turning inward and cultivating self-discipline, you can leave the path of distraction and build a foundation of unshakable inner peace and strength. This is the true path to lasting well-being.
            </p>
          </motion.div>
        </div>
      </section>
      <footer className="bg-stone-800 text-white py-10">
        <div className="container mx-auto text-center text-stone-400">
          <p>&copy; 2025 Rise Up. Find your strength within.</p>
        </div>
      </footer>
    </div>
  );
}