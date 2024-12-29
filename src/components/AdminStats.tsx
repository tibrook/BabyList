// components/AdminStats.tsx
import React from 'react';

interface StatsWidgetProps {
  icon: string;
  label: string;
  value: number | string;
  subValue: string;
  color: string;
}

const StatsWidget = ({ icon, label, value, subValue, color }: StatsWidgetProps) => (
  <div className="bg-white rounded-xl shadow-sm border p-6">
    <div className="flex items-center justify-between">
      <div>
        <div className="text-sm font-medium text-gray-500">{label}</div>
        <div className={`text-2xl font-semibold ${color} mt-1`}>
          {value}
        </div>
      </div>
      <div className={`h-12 w-12 rounded-full ${color.replace('text', 'bg').replace('600', '50')} flex items-center justify-center ${color}`}>
        {icon}
      </div>
    </div>
    <div className="mt-4 text-sm text-gray-600">
      {subValue}
    </div>
  </div>
);

interface AdminStatsProps {
  loading: boolean;
  stats: {
    total: number;
    reserved: number;
    available: number;
    totalValue: number;
    reservedValue: number;
  };
}

export const AdminStats = ({ loading, stats }: AdminStatsProps) => {
  const formatCurrency = (value: number) => 
    `${value.toLocaleString('fr-FR')} €`;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <StatsWidget
        icon="🎁"
        label="Total des cadeaux"
        value={loading ? '...' : stats.total}
        subValue={`Valeur totale: ${loading ? '...' : formatCurrency(stats.totalValue)}`}
        color="text-gray-900"
      />
      
      <StatsWidget
        icon="✓"
        label="Cadeaux réservés"
        value={loading ? '...' : stats.reserved}
        subValue={`Valeur réservée: ${loading ? '...' : formatCurrency(stats.reservedValue)}`}
        color="text-green-600"
      />
      
      <StatsWidget
        icon="🛍️"
        label="Cadeaux disponibles"
        value={loading ? '...' : stats.available}
        subValue={`Valeur disponible: ${loading ? '...' : formatCurrency(stats.totalValue - stats.reservedValue)}`}
        color="text-blue-600"
      />
    </div>
  );
};