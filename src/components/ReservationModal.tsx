import React, { useState,useEffect } from 'react';
import { Gift } from '@/lib/types';
import { motion } from 'framer-motion';

interface ReservationModalProps {
  gift: Gift;
  onClose: () => void;
  onReserve: (data: ReservationData) => Promise<void>;
}

interface ReservationData {
  firstName: string;
  lastName: string;
  message?: string;
  isAnonymous: boolean;
}

export const ReservationModal = ({ gift, onClose, onReserve }: ReservationModalProps) => {
  const [formData, setFormData] = useState<ReservationData>({
    firstName: '',
    lastName: '',
    message: '',
    isAnonymous: false
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => {
        onClose();
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [success, onClose]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await onReserve(formData);
      setSuccess(true);
    } catch {
      setError('Une erreur est survenue lors de la réservation');
    } finally {
      setLoading(false);
    }
  };


  return (
    <div className="fixed inset-x-0 bottom-0 sm:inset-0 z-50 flex items-end sm:items-center justify-center sm:p-4">
      <div className="absolute inset-0 bg-black/20 backdrop-blur-sm" onClick={onClose} />
      <motion.div
        initial={{ opacity: 0, y: 100 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 100 }}
        transition={{ type: "spring", duration: 0.5 }}
        className="relative w-full sm:max-w-lg bg-white sm:rounded-2xl shadow-xl overflow-hidden"
      >
        {success  ? (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="p-8 flex flex-col items-center text-center"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", duration: 0.5, delay: 0.1 }}
              className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4"
            >
              <svg className="w-8 h-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </motion.div>
            <h3 className="text-xl font-medium text-gray-900 mb-2">
              Réservation confirmée !
            </h3>
            <p className="text-gray-600">
              Merci d&apos;avoir réservé ce cadeau pour notre petit marsu.
            </p>
          </motion.div>
        ) : (
          <>
            <div className="relative h-24">
              <div className="absolute inset-0 rounded-t-2xl overflow-hidden">
                {gift.imageUrl ? (
                  <>
                    <img 
                      src={gift.imageUrl} 
                      alt={gift.title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-b from-black/40 to-black/60" />
                  </>
                ) : (
                  <div className="w-full h-full bg-gradient-to-b from-blue-500 to-blue-600" />
                )}
                
                <button
                  onClick={onClose}
                  className="absolute top-2 right-2 w-8 h-8 flex items-center justify-center rounded-full bg-black/20 hover:bg-black/40 transition-colors"
                >
                  <span className="sr-only">Fermer</span>
                  <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>

                <div className="absolute bottom-3 left-4 text-white">
                  <h3 className="text-lg font-medium leading-tight">{gift.title}</h3>
                  {gift.price && (
                    <p className="text-sm text-white/90">{gift.price.toLocaleString('fr-FR')} €</p>
                  )}
                </div>
              </div>
            </div>

            <div className="overflow-y-auto max-h-[calc(90vh-6rem)]">
              <form onSubmit={handleSubmit} className="p-6 space-y-6">
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">
                        Prénom
                      </label>
                      <input
                        required
                        type="text"
                        value={formData.firstName}
                        onChange={e => setFormData(prev => ({ ...prev, firstName: e.target.value }))}
                        className="w-full px-3.5 py-2 rounded-xl bg-gray-50 border border-gray-200 focus:ring-2 focus:ring-blue-100 focus:border-blue-300 transition-colors"
                        placeholder="Bobby"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">
                        Nom
                      </label>
                      <input
                        required
                        type="text"
                        value={formData.lastName}
                        onChange={e => setFormData(prev => ({ ...prev, lastName: e.target.value }))}
                        className="w-full px-3.5 py-2 rounded-xl bg-gray-50 border border-gray-200 focus:ring-2 focus:ring-blue-100 focus:border-blue-300 transition-colors"
                        placeholder="Guillouet"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Message <span className="text-gray-400 text-xs">(optionnel)</span>
                    </label>
                    <textarea
                      value={formData.message}
                      onChange={e => setFormData(prev => ({ ...prev, message: e.target.value }))}
                      rows={3}
                      className="w-full px-3.5 py-2 rounded-xl bg-gray-50 border border-gray-200 focus:ring-2 focus:ring-blue-100 focus:border-blue-300 transition-colors resize-none"
                      placeholder="Un petit message pour nous..."
                    />
                  </div>

                  <label className="relative flex items-start gap-3 py-2 cursor-pointer group">
                    <div className="relative flex items-center justify-center">
                      <input
                        type="checkbox"
                        checked={formData.isAnonymous}
                        onChange={e => setFormData(prev => ({ ...prev, isAnonymous: e.target.checked }))}
                        className="peer sr-only"
                      />
                      <div className="w-5 h-5 border-2 border-gray-300 rounded transition-colors peer-checked:border-blue-500 peer-checked:bg-blue-500 group-hover:border-blue-400">
                        <svg 
                          className="w-full h-full text-white scale-0 peer-checked:scale-100 transition-transform" 
                          fill="none" 
                          viewBox="0 0 24 24" 
                          stroke="currentColor"
                          strokeWidth={3}
                        >
                          <path 
                            strokeLinecap="round" 
                            strokeLinejoin="round" 
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                      </div>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-sm font-medium text-gray-700">
                        Rester anonyme
                      </span>
                      <span className="text-xs text-gray-500">
                        Votre nom ne sera pas affiché publiquement
                      </span>
                    </div>
                  </label>
                </div>

                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-3 rounded-xl bg-red-50 text-red-600 text-sm"
                  >
                    {error}
                  </motion.div>
                )}

                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={onClose}
                    className="flex-1 px-4 py-2.5 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 font-medium transition-colors"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 px-4 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? 'Réservation...' : 'Réserver'}
                  </button>
                </div>
              </form>
            </div>
          </>
        )}
      </motion.div>
    </div>
  );
};

export default ReservationModal;