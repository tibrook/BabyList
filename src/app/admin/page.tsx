'use client'

import React, { useState } from 'react';
import { GiftForm } from '@/components/GiftForm';
import { AdminGiftList } from '@/components/AdminGiftList';
import { AdminStats } from '@/components/AdminStats';
import { AdminHeader } from '@/components/AdminHeader';
import { Gift } from '@/lib/types';
import { useQuery, useQueryClient } from '@tanstack/react-query';

const calculateStats = (gifts: Gift[]) => {
  return gifts.reduce((acc, gift) => {
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
};

export default function AdminPage() {
  const [selectedGift, setSelectedGift] = useState<Gift | null>(null);
  const [isFormVisible, setIsFormVisible] = useState(false);
  const queryClient = useQueryClient();

  const { data: gifts = [], isLoading } = useQuery({
    queryKey: ['admin-gifts'],
    queryFn: async () => {
      const response = await fetch('/api/gifts');
      if (!response.ok) throw new Error('Failed to fetch gifts');
      return response.json();
    }
  });

  const stats = calculateStats(gifts);

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
    queryClient.invalidateQueries({ queryKey: ['admin-gifts'] });
  };

  const handleDelete = async (giftId: string) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer ce cadeau ?')) {
      return;
    }

    try {
      const response = await fetch(`/api/gifts/${giftId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete gift');
      }

      queryClient.invalidateQueries({ queryKey: ['admin-gifts'] });
    } catch (error) {
      console.error('Delete error:', error);
      alert('Erreur lors de la suppression');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-rose-50/50 to-white">
      <AdminHeader 
        showAddButton={!isFormVisible} 
        onAdd={handleAdd} 
      />

      <main className="max-w-7xl mx-auto px-4 py-6">
        {isFormVisible ? (
          <div className="bg-white rounded-xl shadow-sm border max-w-4xl mx-auto">
            <div className="px-6 py-4 border-b flex justify-between items-center">
              <h2 className="text-lg font-medium text-gray-800 flex items-center gap-2">
                {selectedGift ? (
                  <>
                    <span className="text-blue-500">✏️</span>
                    {' '}Modifier le cadeau
                  </>
                ) : (
                  <>
                    <span className="text-green-500">+</span>
                    {' '}Ajouter un cadeau
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
            <AdminStats loading={isLoading} stats={stats} />

            <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
              <div className="px-6 py-4 border-b">
                <h2 className="text-lg font-medium text-gray-800">Liste des cadeaux</h2>
              </div>
              <AdminGiftList 
                onEdit={handleEdit}
                onDelete={handleDelete}
              />
            </div>
          </div>
        )}
      </main>
    </div>
  );
}