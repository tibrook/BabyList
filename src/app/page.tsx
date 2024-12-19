'use client'

import { GiftList } from '@/components/GiftList';
import { PRIORITY_OPTIONS } from '@/lib/constants';
import { motion } from 'framer-motion';
import React, { useState } from 'react';

const textVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: {
      duration: 0.6,
      ease: "easeOut"
    }
  }
};

const titleVariants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      duration: 0.8,
      ease: "easeOut"
    }
  }
};

const waveVariants = {
  animate: {
    rotate: [0, -10, 10, -10, 0],
    transition: {
      duration: 1.5,
      repeat: Infinity,
      repeatDelay: 3
    }
  }
};

const highlightVariants = {
  hidden: { width: "0%" },
  visible: { 
    width: "100%",
    transition: {
      duration: 0.8,
      ease: "easeOut",
      delay: 0.3
    }
  }
};

export default function Home() {
  const [selectedPriority, setSelectedPriority] = useState('');

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-sky-50">
      <header className="relative py-12 px-4">
        <div className="relative max-w-2xl mx-auto text-center space-y-6">
          <motion.h1 
            className="text-3xl md:text-4xl font-light text-gray-900"
            initial="hidden"
            animate="visible"
            variants={titleVariants}
          >
            Notre Petit{' '}
            <motion.div 
              className="relative inline-block"
              initial="hidden"
              animate="visible"
            >
              <span className="relative z-10 font-normal text-blue-600">
                Matelot{' '}
                <motion.span
                  className="inline-block origin-bottom"
                  variants={waveVariants}
                  animate="animate"
                >
                  👋
                </motion.span>
              </span>
              <motion.div 
                className="absolute bottom-0 left-0 h-3 bg-blue-100/50 rounded"
                variants={highlightVariants}
              />
            </motion.div>
          </motion.h1>
          
          <motion.p 
            className="text-gray-600 max-w-xl mx-auto"
            initial="hidden"
            animate="visible"
            variants={textVariants}
          >
            Nous sommes ravis de partager avec vous l'arrivée de notre petit mousse.{' '}
            <br className="hidden sm:inline" />
            Voici quelques suggestions pour préparer son embarquement.
          </motion.p>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 pb-8 space-y-6">
        <GiftList 
          selectedPriority={selectedPriority}
          onPriorityChange={setSelectedPriority}
        />
      </main>
    </div>
  );
}