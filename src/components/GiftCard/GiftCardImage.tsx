import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { Gift as GiftIcon } from 'lucide-react';
import { type Gift } from '@/lib/types';
import { useInView } from 'react-intersection-observer';
import { ReservationOverlay } from './ReservationOverlay';
interface GiftCardImageProps {
  gift: Gift;
  priorityOption: any;
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
    if (inView && !imageSource && !imageError) {
      const loadImage = async () => {
        try {
          if (gift.imageUrl?.includes('cloudinary')) {
            setImageSource(gift.imageUrl);
            return;
          }

          const response = await fetch(`/api/gifts/${gift.id}/image`);
          if (!response.ok) throw new Error('Failed to load image');
          
          const data = await response.json();
          setImageSource(`data:${data.imageType || 'image/jpeg'};base64,${data.imageData}`);
        } catch (error) {
          console.error('Error loading image:', error);
          setImageError(true);
        }
      };

      loadImage();
    }
  }, [inView, gift.id, imageSource, gift.imageUrl]);

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
            ${priorityOption.id === 'MUST_HAVE' ? 'bg-rose-600 text-white' :
              priorityOption.id === 'REALLY_WANT' ? 'bg-violet-600 text-white' :
              priorityOption.id === 'NORMAL' ? 'bg-blue-600 text-white' :
              'bg-emerald-600 text-white'}
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