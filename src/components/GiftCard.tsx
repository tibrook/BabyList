// GiftCard.tsx
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { Gift } from '@/lib/types';
import { PRIORITY_OPTIONS } from '@/lib/constants';
import { ReservationModal } from '@/components/ReservationModal';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { GiftCardImage } from './GiftCard/GiftCardImage';
import { ActionButtons } from './GiftCard/ActionButtons';
import { GiftCardContent } from './GiftCard/GiftCardContent';
import { GiftCardBack } from './GiftCard/GiftCardBack';

interface GiftCardProps {
  gift: Gift;
  onReserve: (giftId: string, data: ReservationData) => Promise<void>;
}

interface ReservationData {
  firstName: string;
  lastName: string;
  isAnonymous: boolean;
}

interface SavedReservation {
  giftId: string;
  firstName: string;
  lastName: string;
  timestamp: number;
}

const cardVariants = {
  hover: {
    y: -8,
    transition: {
      duration: 0.3,
      ease: "easeOut"
    }
  }
};

export const GiftCard = ({ gift, onReserve }: GiftCardProps) => {
  const [isFlipped, setIsFlipped] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [userCanCancel, setUserCanCancel] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const prefersReducedMotion = useReducedMotion();
  const queryClient = useQueryClient();
  
  const priorityOption = PRIORITY_OPTIONS.find(p => p.id === gift.priority);

  const cancelMutation = useMutation({
    mutationFn: async (giftId: string) => {
      const response = await fetch(`/api/reservations?giftId=${giftId}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to cancel reservation');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['gifts'] });
      setIsFlipped(false);
    }
  });

  useEffect(() => {
    const checkUserReservation = () => {
      const savedReservations = localStorage.getItem('giftReservations');
      if (savedReservations) {
        const reservations: SavedReservation[] = JSON.parse(savedReservations);
        setUserCanCancel(reservations.some(r => r.giftId === gift.id));
      }
    };
    checkUserReservation();
  }, [gift.id]);

  const handleReservation = async (data: ReservationData) => {
    try {
      await onReserve(gift.id, data);
      const reservations = JSON.parse(localStorage.getItem('giftReservations') || '[]');
      reservations.push({
        giftId: gift.id,
        firstName: data.firstName,
        lastName: data.lastName,
        timestamp: Date.now()
      });
      localStorage.setItem('giftReservations', JSON.stringify(reservations));
      setUserCanCancel(true);
    } catch (error) {
      console.error('Reservation error:', error);
      throw error;
    }
  };

  const handleCancelReservation = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await cancelMutation.mutateAsync(gift.id);
      const reservations = JSON.parse(localStorage.getItem('giftReservations') || '[]');
      localStorage.setItem(
        'giftReservations',
        JSON.stringify(reservations.filter((r: SavedReservation) => r.giftId !== gift.id))
      );
      setUserCanCancel(false);
    } catch (error) {
      console.error('Error canceling reservation:', error);
    }
  };

  const handleShare = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (navigator.share) {
      try {
        await navigator.share({
          title: gift.title,
          text: `Découvre ce cadeau pour le petit marsupilami : ${gift.title}`,
          url: window.location.href
        });
      } catch (err) {
        console.error('Erreur lors du partage:', err);
      }
    }
  };

  return (
    <motion.div 
      className="h-[400px] perspective group"
      variants={!prefersReducedMotion ? cardVariants : undefined}
      whileHover="hover"
    >
      <motion.div
        initial={false}
        animate={{ rotateY: isFlipped ? 180 : 0 }}
        transition={{ duration: prefersReducedMotion ? 0 : 0.6, ease: [0.23, 1, 0.32, 1] }}
        className="relative w-full h-full preserve-3d cursor-pointer"
        onClick={() => setIsFlipped(!isFlipped)}
      >
        {/* Front face */}
        <div className="absolute w-full h-full backface-hidden">
          <motion.div className="relative w-full h-full bg-white rounded-2xl shadow-sm overflow-hidden ring-1 ring-black/5 transition-shadow duration-300 hover:shadow-xl group">
            <GiftCardImage gift={gift} priorityOption={priorityOption} />
            <ActionButtons 
              isLiked={isLiked}
              onShare={handleShare}
              onToggleLike={(e) => {
                e.stopPropagation();
                setIsLiked(!isLiked);
              }}
            />
            <GiftCardContent 
              gift={gift}
              onFlip={() => setIsFlipped(true)}
            />
          </motion.div>
        </div>

        {/* Back face */}
        <GiftCardBack
          gift={gift}
          isFlipped={isFlipped}
          onClose={() => setIsFlipped(false)}
          userCanCancel={userCanCancel}
          onCancelReservation={handleCancelReservation}
          onShowModal={(e) => {
            e.stopPropagation();
            setShowModal(true);
          }}
        />
      </motion.div>

      <AnimatePresence>
        {showModal && (
          <ReservationModal
            gift={gift}
            onClose={() => setShowModal(false)}
            onReserve={handleReservation}
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
};