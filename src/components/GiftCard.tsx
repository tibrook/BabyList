'use client'

import React, { useState, useEffect } from 'react';
import { Gift } from '@/lib/types';
import { motion } from 'framer-motion';
import { PRIORITY_OPTIONS } from '@/lib/constants';
import { ReservationModal } from '@/components/ReservationModal';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import Image from 'next/image';

interface GiftCardProps {
  gift: Gift;
  onReserve: (giftId: string, data: Omit<ReservationData, 'giftId'>) => Promise<void>;
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

export const GiftCard = ({ gift, onReserve }: GiftCardProps) => {
  const [isFlipped, setIsFlipped] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [userCanCancel, setUserCanCancel] = useState(false);
  const queryClient = useQueryClient();
  
  const priorityOption = PRIORITY_OPTIONS.find(p => p.id === gift.priority);
  console.log('priorityOption:', priorityOption);
  console.log('gift.priority:', gift.priority);
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
    onMutate: async (giftId) => {
      await queryClient.cancelQueries({ queryKey: ['gifts'] });
  
      const previousGifts = queryClient.getQueryData(['gifts']);
  
      await new Promise(resolve => {
        setIsFlipped(false);
        setTimeout(resolve, 600); 
      });
  
      queryClient.setQueryData(['gifts'], (old: Gift[]) =>
        old.map(g => g.id === giftId ? { ...g, reservation: null } : g)
      );
  
      return { previousGifts };
    },
    onError: (err, giftId, context) => {
      queryClient.setQueryData(['gifts'], context?.previousGifts);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['gifts'] });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['gifts'] });
      setIsFlipped(false);
    }
  });

  const handleReservation = async (data: ReservationData) => {
    try {
      // await reserveMutation.mutateAsync({ giftId: gift.id, data });
      await onReserve(gift.id, data);

      const savedReservations = localStorage.getItem('giftReservations') || '[]';
      const reservations = JSON.parse(savedReservations);
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
  useEffect(() => {
    const checkUserReservation = () => {
      const savedReservations = localStorage.getItem('giftReservations');
      if (savedReservations) {
        const reservations: SavedReservation[] = JSON.parse(savedReservations);
        const hasReserved = reservations.some(r => r.giftId === gift.id);
        setUserCanCancel(hasReserved);
      }
    };

    checkUserReservation();
  }, [gift.id]);

 

  const handleModalClose = () => {
    if (!showModal) return;
    setShowModal(false);
    setTimeout(() => {
      setIsFlipped(true);
    }, 300);
  };
  const handleCancelReservation = async () => {
    try {
      await cancelMutation.mutateAsync(gift.id);
      
      const savedReservations = localStorage.getItem('giftReservations');
      if (savedReservations) {
        const reservations = JSON.parse(savedReservations);
        const updatedReservations = reservations.filter((r: SavedReservation) => r.giftId !== gift.id);
        localStorage.setItem('giftReservations', JSON.stringify(updatedReservations));
      }
      
      setUserCanCancel(false);
    } catch (error) {
      console.error('Error canceling reservation:', error);
    }
  };

  const reservationInfo = gift.reservation && !gift.reservation.isAnonymous
    ? `Réservé par ${gift.reservation.firstName}`
    : "Déjà réservé";

  return (
    <div className="h-[360px] perspective">
      <motion.div
        initial={false}
        animate={{ rotateY: isFlipped ? 180 : 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="relative w-full h-full [transform-style:preserve-3d]"
        onClick={() => setIsFlipped(!isFlipped)}
        >
        {/* Face avant */}
        <div className="absolute w-full h-full [backface-visibility:hidden]">
          <div className="relative w-full h-full bg-white rounded-xl shadow-sm hover:shadow-md transition-duration-300 border border-blue-100 overflow-hidden">
            {/* Zone de l'image (70% de la hauteur) */}
            <div className="relative w-full h-[70%] rounded-t-xl overflow-hidden">
            {priorityOption && (
              <div className="absolute top-3 left-3 z-10">
                <span 
                  className={`
                    text-xs font-medium px-2.5 py-1 rounded-md 
                    drop-shadow-lg backdrop-blur-sm
                    ${priorityOption.id === 'MUST_HAVE' ? 'bg-rose-600 text-white' :
                      priorityOption.id === 'REALLY_WANT' ? 'bg-violet-600 text-white' :
                      priorityOption.id === 'NORMAL' ? 'bg-blue-600 text-white' :
                      'bg-emerald-600 text-white'}
                  `}
                >
                  {priorityOption.label}
                </span>
              </div>
            )}
              
              {gift.imageUrl ? (
                <Image 
                  src={gift.imageUrl}
                  alt={gift.title}
                  fill
                  className="object-cover rounded-t-xl"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-blue-50 to-sky-50 flex items-center justify-center rounded-t-xl">
                  <span className="text-4xl">🎁</span>
                </div>
              )}

              {gift.reservation && (
                <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center">
                  <div className="text-center px-4">
                    <span className="block text-white font-medium">{reservationInfo}</span>
                  </div>
                </div>
              )}
            </div>

            {/* Zone du titre et prix */}
            <div className="absolute bottom-0 w-full h-[30%] p-4 flex flex-col justify-center">
              <div className="flex justify-between items-start gap-2">
                <h3 className="font-medium text-gray-800 line-clamp-2 flex-1">
                  {gift.title}
                </h3>
                {gift.price !== undefined && gift.price !== null && (
                  <span className="text-blue-600 font-medium whitespace-nowrap">
                    {gift.price.toLocaleString('fr-FR')}€
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Face arrière */}
        <div 
          className="absolute w-full h-full backface-hidden rounded-xl bg-white p-6 shadow-md border border-blue-100 rotate-y-180 overflow-hidden"
          style={{ transform: 'rotateY(180deg)' }}
        >
          <div className="flex flex-col h-full">
            <h3 className="font-medium text-xl text-gray-800 mb-4">{gift.title}</h3>
            
            {priorityOption && (
              <span className={` ${priorityOption.id === 'MUST_HAVE' ? 'bg-rose-600 text-white' :
          priorityOption.id === 'REALLY_WANT' ? 'bg-violet-600 text-white' :
          priorityOption.id === 'NORMAL' ? 'bg-blue-600 text-white' :
          'bg-emerald-600 text-white'} text-xs font-medium px-2.5 py-1 rounded-md inline-flex self-start mb-4`}>
                {priorityOption.label}
              </span>
            )}
            
            {gift.description && (
              <div className="flex-1 overflow-y-auto mb-4 pr-2 scrollbar-thin scrollbar-thumb-gray-200 scrollbar-track-transparent">
                <p className="text-gray-600 text-sm whitespace-pre-line">
                  {gift.description}
                </p>
              </div>
            )}
            
            <div className="space-y-2 mt-auto">
              {gift.productUrl && (
                <a 
                  href={gift.productUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  className="block w-full text-center text-sm text-gray-600 py-2 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors"
                >
                  Voir le produit →
                </a>
              )}
              
              {gift.reservation ? (
                <div className="text-center">
                  <p className="text-gray-500 text-sm mb-2">
                    {reservationInfo}
                  </p>
                  {userCanCancel ? (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleCancelReservation();
                      }}
                      className="w-full text-sm text-red-600 py-2 rounded-lg bg-red-50 hover:bg-red-100 transition-colors"
                    >
                      Annuler ma réservation
                    </button>
                  ) : (
                    <p className="text-sm text-gray-500">
                      Contacter Alexandre pour annuler
                    </p>
                  )}
                </div>
              ) : (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowModal(true);
                  }}
                  className="w-full text-sm text-white py-2 rounded-lg bg-blue-600 hover:bg-blue-700 transition-colors"
                >
                  Réserver
                </button>
              )}
            </div>
          </div>
        </div>
      </motion.div>

      {showModal && (
        <ReservationModal
          gift={gift}
          onClose={handleModalClose}
          onReserve={handleReservation}
        />
      )}
    </div>
  );
};