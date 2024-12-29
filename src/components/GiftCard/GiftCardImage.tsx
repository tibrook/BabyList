import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { Gift as GiftIcon } from 'lucide-react';
import { type Gift } from '@/lib/types';
import { useInView } from 'react-intersection-observer';
import { ReservationOverlay } from './ReservationOverlay';

interface PriorityOption {
  id: 'MUST_HAVE' | 'REALLY_WANT' | 'NORMAL';
  label: string;
}

interface GiftCardImageProps {
  gift: Gift;
  priorityOption: PriorityOption | null;
}

export const GiftCardImage = ({ gift, priorityOption }: GiftCardImageProps) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [imageSource, setImageSource] = useState<string | null>(null);
  const { ref, inView } = useInView({
    triggerOnce: true,
    threshold: 0.1
  });

  useEffect(() => {
    const loadImage = async () => {
      try {
        console.log('Loading image for gift:', gift.id);
        
        setImageError(false);
        setImageLoaded(false);
        setImageSource(null);

        if (gift.imageData) {
          console.log('Using direct imageData for gift:', gift.id);
          const dataUrl = `data:${gift.imageType || 'image/webp'};base64,${gift.imageData}`;
          setImageSource(dataUrl);
          return;
        }

        console.log('Fetching image from API for gift:', gift.id);
        const response = await fetch(`/api/gifts/${gift.id}/image`);
        
        if (!response.ok) {
          console.log('API returned error status:', response.status);
          throw new Error(`Failed to load image: ${response.status}`);
        }
        
        const data = await response.json();
        
        if (!data.imageData) {
          console.log('No image data in API response');
          throw new Error('No image data received');
        }

        const dataUrl = `data:${data.imageType || 'image/webp'};base64,${data.imageData}`;
        setImageSource(dataUrl);
      } catch (error) {
        console.error('Error loading image for gift', gift.id, ':', error);
        setImageError(true);
      }
    };

    if (inView && !imageSource && !imageError) {
      loadImage();
    }
  }, [inView, gift.id, gift.imageData, gift.imageType, imageError, imageSource]);

  const getPriorityClass = (priorityId: string) => {
    switch (priorityId) {
      case 'MUST_HAVE':
        return 'bg-rose-600 text-white';
      case 'REALLY_WANT':
        return 'bg-violet-600 text-white';
      case 'NORMAL':
        return 'bg-blue-600 text-white';
      default:
        return 'bg-emerald-600 text-white';
    }
  };

  return (
    <div ref={ref} className="relative w-full h-[65%] bg-gray-50">
      <AnimatePresence>
        {!imageLoaded && !imageError && inView && (
          <motion.div
            className="absolute inset-0 flex items-center justify-center bg-gray-50"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="w-8 h-8 border-4 border-amber-200 border-t-amber-600 rounded-full animate-spin" />
          </motion.div>
        )}
      </AnimatePresence>

      {imageSource && !imageError ? (
        <Image 
          src={imageSource}
          alt={gift.title}
          fill
          className={`object-cover transition-opacity duration-300 ${
            imageLoaded ? 'opacity-100' : 'opacity-0'
          }`}
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          onLoadingComplete={() => setImageLoaded(true)}
          onError={() => {
            setImageError(true);
            console.error(`Error loading image for gift: ${gift.title}`);
          }}
          priority={false}
        />
      ) : (
        <div className="w-full h-full bg-gradient-to-br from-gray-50 to-amber-50 flex items-center justify-center">
          <GiftIcon className="w-16 h-16 text-amber-300" />
        </div>
      )}

      {priorityOption && (
        <motion.div 
          className="absolute top-4 left-4 z-10"
          whileHover={{ scale: 1.05 }}
        >
          <span className={`
            px-3 py-1.5 rounded-xl text-sm font-medium 
            shadow-lg backdrop-blur-sm transition-colors
            ${getPriorityClass(priorityOption.id)}
          `}>
            {priorityOption.label}
          </span>
        </motion.div>
      )}

      {gift.reservation && (
        <ReservationOverlay reservation={gift.reservation} />
      )}
    </div>
  );
};