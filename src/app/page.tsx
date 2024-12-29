'use client'
import React, { useState, useEffect } from 'react';
import { GiftList } from '@/components/GiftList';
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion';

const pageVariants = {
  initial: { opacity: 0 },
  animate: {
    opacity: 1,
    transition: {
      duration: 0.8,
      staggerChildren: 0.2
    }
  }
};

const titleVariants = {
  initial: { opacity: 0, y: -20 },
  animate: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.8,
      ease: "easeOut",
      type: "spring",
      stiffness: 100
    }
  }
};

const imageVariants = {
  initial: { opacity: 0, scale: 0.8 },
  animate: { 
    opacity: 1, 
    scale: 1,
    transition: {
      duration: 0.8,
      ease: "easeOut"
    }
  },
  exit: {
    opacity: 0,
    scale: 0.8,
    transition: {
      duration: 0.5,
      ease: "easeInOut"
    }
  }
};

const FloatingIllustration = ({ imageSrc, className = "", ...props }) => (
  <motion.div
    className={`absolute pointer-events-none ${className}`}
    variants={imageVariants}
    initial="initial"
    animate="animate"
    exit="exit"
    {...props}
  >
    <motion.img
      src={imageSrc}
      alt="Illustration"
      className="w-28 h-28 md:w-40 md:h-40 rounded-2xl shadow-lg object-cover"
      animate={{
        y: [0, -10, 0],
        rotate: [-3, 3, -3],
      }}
      transition={{
        y: {
          duration: 3,
          repeat: Infinity,
          ease: "easeInOut"
        },
        rotate: {
          duration: 4,
          repeat: Infinity,
          ease: "easeInOut"
        }
      }}
    />
  </motion.div>
);

const Home = () => {
  const [selectedPriority, setSelectedPriority] = useState('');
  const [showImages, setShowImages] = useState(true);
  const [headerMoved, setHeaderMoved] = useState(false);
  const { scrollYProgress } = useScroll();
  
  const headerOpacity = useTransform(scrollYProgress, [0, 0.2], [1, 0]);
  const headerScale = useTransform(scrollYProgress, [0, 0.2], [1, 0.95]);
  const backgroundY = useTransform(scrollYProgress, [0, 1], ['0%', '20%']);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowImages(false);
    }, 4000); 

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!showImages) {
      const timer = setTimeout(() => {
        setHeaderMoved(true);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [showImages]);

  return (
    <motion.div 
      initial="initial"
      animate="animate"
      variants={pageVariants}
      className="min-h-screen relative"
    >
      <motion.div 
        className="fixed inset-0 -z-10"
        style={{ y: backgroundY }}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-yellow-50 via-white to-amber-50" />
      </motion.div>

      <motion.header 
        className="relative overflow-hidden"
        animate={{
          paddingTop: headerMoved ? "1rem" : "2rem",
          marginTop: "0rem"
        }}
        transition={{
          duration: 0.6,
          ease: "easeInOut"
        }}
        style={{ opacity: headerOpacity, scale: headerScale }}
      >
        {/* Images flottantes avec AnimatePresence */}
        <AnimatePresence>
          {showImages && (
            <>
              <FloatingIllustration 
                imageSrc="/images/babyBreton.png"
                className="left-4 top-8 md:left-8"
              />
              <FloatingIllustration 
                imageSrc="/images/marsu.jpg"
                className="right-4 top-8 md:right-8"
              />
            </>
          )}
        </AnimatePresence>

        <div className="relative max-w-2xl mx-auto text-center space-y-4 px-4">
          <motion.div
            variants={titleVariants}
            className="relative inline-block"
          >
            <div className="absolute -inset-x-8 -inset-y-4">
              <div className="w-full h-full rotate-180 opacity-50">
                <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
                  <path
                    fill="#FCD34D"
                    d="M42.7,-62.9C50.9,-52.8,50.1,-34.4,51.7,-19.2C53.4,-4,57.4,8,54.4,18.7C51.4,29.4,41.4,38.8,30.2,44.2C19,49.7,6.6,51.2,-7.4,51.1C-21.4,50.9,-42.8,49,-54.7,38.9C-66.6,28.8,-69,10.5,-65.6,-5.8C-62.2,-22.1,-53,-36.4,-41.1,-46.4C-29.3,-56.4,-14.6,-62,-0.2,-61.8C14.3,-61.5,28.6,-55.4,42.7,-62.9Z"
                    transform="translate(100 100)"
                  />
                </svg>
              </div>
            </div>
            
            <h1 className="relative text-4xl md:text-5xl font-light text-gray-900 mb-6">
              Notre Petit{' '}
              <span className="relative inline-block font-normal text-amber-600">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: "100%" }}
                  transition={{ duration: 0.8, delay: 0.5 }}
                  className="absolute bottom-0 left-0 h-3 bg-amber-100 rounded -z-10"
                />
                <span className="relative">
                  Marsupilami{' '}
                  <motion.span
                    animate={{
                      rotate: [0, -10, 10, -10, 0],
                    }}
                    transition={{
                      duration: 1.5,
                      repeat: Infinity,
                      repeatDelay: 3,
                    }}
                    className="inline-block origin-bottom"
                  >
                    🦁
                  </motion.span>
                </span>
              </span>
            </h1>
          </motion.div>

          <motion.div
            variants={titleVariants}
            className="text-gray-600 text-lg max-w-xl mx-auto leading-relaxed space-y-4"
          >
            <p className="text-amber-800 font-medium">
              N&apos;hésitez pas à chercher des alternatives d&apos;occasion, ou à vous inspirer de ces suggestions pour trouver des équivalents. Le plus important pour nous est que le cadeau vienne du cœur ! 💛
            </p>
          </motion.div>
        </div>
      </motion.header>

      <main className="relative max-w-7xl mx-auto px-4 pb-12">
        <GiftList
          selectedPriority={selectedPriority}
          onPriorityChange={setSelectedPriority}
        />
      </main>
    </motion.div>
  );
};

export default Home;