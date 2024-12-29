import React from 'react';
import { Plus } from 'lucide-react';

interface AdminHeaderProps {
  showAddButton: boolean;
  onAdd: () => void;
}

export const AdminHeader = ({ showAddButton, onAdd }: AdminHeaderProps) => (
  <header className="sticky top-0 z-10 bg-white border-b shadow-sm">
    <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
      <h1 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
        <span className="text-rose-600 text-2xl">⚙️</span>
        <span>Administration</span>
      </h1>
      
      {showAddButton && (
        <button
          onClick={onAdd}
          className="px-4 py-2 bg-rose-600 text-white rounded-lg hover:bg-rose-700 transition-colors flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Ajouter un cadeau
        </button>
      )}
    </div>
  </header>
);