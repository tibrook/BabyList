'use client'

import React, { useState, useEffect } from 'react';
import { GiftForm } from '@/components/GiftForm';
import { AdminGiftList } from '@/components/AdminGiftList';
import { Gift } from '@/lib/types';

interface GiftStats {
  total: number;
  reserved: number;
  available: number;
  totalValue: number;
  reservedValue: number;
}

export default function AdminPage() {
  const [selectedGift, setSelectedGift] = useState<Gift | null>(null);
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [stats, setStats] = useState<GiftStats>({
    total: 0,
    reserved: 0,
    available: 0,
    totalValue: 0,
    reservedValue: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch('/api/gifts');
        if (!response.ok) throw new Error('Failed to fetch gifts');
        const gifts: Gift[] = await response.json();
        
        const stats = gifts.reduce((acc, gift) => {
          acc.total++;
          
          if (gift.reservation) {
            acc.reserved++;
          } else {
            acc.available++;
          }

          if (gift.price) {
            acc.totalValue += gift.price;
            if (gift.reservation) {
              acc.reservedValue += gift.price;
            }
          }
          
          return acc;
        }, {
          total: 0,
          reserved: 0,
          available: 0,
          totalValue: 0,
          reservedValue: 0
        });

        setStats(stats);
      } catch (error) {
        console.error('Error fetching stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [isFormVisible]); 

  const handleEdit = (gift: Gift) => {
    setSelectedGift(gift);
    setIsFormVisible(true);
  };

  const handleAdd = () => {
    setSelectedGift(null);
    setIsFormVisible(true);
  };

  const handleSubmit = async (giftData: Partial<Gift>) => {
    const isEditing = !!selectedGift;
    const url = isEditing ? `/api/gifts/${selectedGift.id}` : '/api/gifts';
    const method = isEditing ? 'PUT' : 'POST';

    const response = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(giftData),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Error saving gift');
    }

    setIsFormVisible(false);
    setSelectedGift(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-rose-50/50 to-white">
      {/* En-tête fixe */}
      <header className="sticky top-0 z-10 bg-white border-b shadow-sm">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <h1 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
            <span className="text-rose-600 text-2xl">⚙️</span>
            Administration
          </h1>
          {!isFormVisible && (
            <button
              onClick={handleAdd}
              className="px-4 py-2 bg-rose-600 text-white rounded-lg hover:bg-rose-700 transition-colors flex items-center gap-2"
            >
              <span>+</span>
              Ajouter un cadeau
            </button>
          )}
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6">
        {isFormVisible ? (
          <div className="bg-white rounded-xl shadow-sm border max-w-4xl mx-auto">
            <div className="px-6 py-4 border-b flex justify-between items-center">
              <h2 className="text-lg font-medium text-gray-800 flex items-center gap-2">
                {selectedGift ? (
                  <>
                    <span className="text-blue-500">✏️</span>
                    Modifier le cadeau
                  </>
                ) : (
                  <>
                    <span className="text-green-500">+</span>
                    Ajouter un cadeau
                  </>
                )}
              </h2>
              <button
                onClick={() => setIsFormVisible(false)}
                className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-500 hover:text-gray-700 transition-colors"
              >
                ✕
              </button>
            </div>
            
            <div className="p-6">
              <GiftForm
                initialData={selectedGift || undefined}
                onSubmit={handleSubmit}
              />
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Widgets de statistiques */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Total des cadeaux */}
              <div className="bg-white rounded-xl shadow-sm border p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm font-medium text-gray-500">Total des cadeaux</div>
                    <div className="text-2xl font-semibold text-gray-900 mt-1">
                      {loading ? '...' : stats.total}
                    </div>
                  </div>
                  <div className="h-12 w-12 rounded-full bg-rose-50 flex items-center justify-center text-rose-600">
                    🎁
                  </div>
                </div>
                <div className="mt-4 text-sm text-gray-600">
                  Valeur totale: {loading ? '...' : `${stats.totalValue.toLocaleString('fr-FR')} €`}
                </div>
              </div>

              {/* Cadeaux réservés */}
              <div className="bg-white rounded-xl shadow-sm border p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm font-medium text-gray-500">Cadeaux réservés</div>
                    <div className="text-2xl font-semibold text-green-600 mt-1">
                      {loading ? '...' : stats.reserved}
                    </div>
                  </div>
                  <div className="h-12 w-12 rounded-full bg-green-50 flex items-center justify-center text-green-600">
                    ✓
                  </div>
                </div>
                <div className="mt-4 text-sm text-gray-600">
                  Valeur réservée: {loading ? '...' : `${stats.reservedValue.toLocaleString('fr-FR')} €`}
                </div>
              </div>

              {/* Cadeaux disponibles */}
              <div className="bg-white rounded-xl shadow-sm border p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm font-medium text-gray-500">Cadeaux disponibles</div>
                    <div className="text-2xl font-semibold text-blue-600 mt-1">
                      {loading ? '...' : stats.available}
                    </div>
                  </div>
                  <div className="h-12 w-12 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
                    🛍️
                  </div>
                </div>
                <div className="mt-4 text-sm text-gray-600">
                  Valeur disponible: {loading ? '...' : `${(stats.totalValue - stats.reservedValue).toLocaleString('fr-FR')} €`}
                </div>
              </div>
            </div>

            {/* Liste des cadeaux */}
            <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
              <div className="px-6 py-4 border-b">
                <h2 className="text-lg font-medium text-gray-800">Liste des cadeaux</h2>
              </div>
              <AdminGiftList onEdit={handleEdit} />
            </div>
          </div>
        )}
      </main>
    </div>
  );
}