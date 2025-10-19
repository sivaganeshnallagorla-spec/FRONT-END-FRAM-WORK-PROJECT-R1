import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

interface Stats {
  totalUsers: number;
  totalFarmers: number;
  totalBuyers: number;
  totalProducts: number;
  totalOrders: number;
  totalRevenue: number;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats>({
    totalUsers: 0,
    totalFarmers: 0,
    totalBuyers: 0,
    totalProducts: 0,
    totalOrders: 0,
    totalRevenue: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const [usersRes, farmersRes, buyersRes, productsRes, ordersRes] = await Promise.all([
        supabase.from('user_profiles').select('*', { count: 'exact', head: true }),
        supabase.from('user_profiles').select('*', { count: 'exact', head: true }).eq('role', 'farmer'),
        supabase.from('user_profiles').select('*', { count: 'exact', head: true }).eq('role', 'buyer'),
        supabase.from('products').select('*', { count: 'exact', head: true }),
        supabase.from('orders').select('total_amount'),
      ]);

      const totalRevenue = ordersRes.data?.reduce((sum, order) => sum + Number(order.total_amount), 0) || 0;

      setStats({
        totalUsers: usersRes.count || 0,
        totalFarmers: farmersRes.count || 0,
        totalBuyers: buyersRes.count || 0,
        totalProducts: productsRes.count || 0,
        totalOrders: ordersRes.data?.length || 0,
        totalRevenue,
      });
    } catch (error) {
      console.error('Error loading stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <p>Loading dashboard...</p>;

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <StatCard title="Total Users" value={stats.totalUsers} icon="👥" color="blue" />
        <StatCard title="Total Farmers" value={stats.totalFarmers} icon="🌾" color="green" />
        <StatCard title="Total Buyers" value={stats.totalBuyers} icon="🛒" color="purple" />
        <StatCard title="Total Products" value={stats.totalProducts} icon="📦" color="orange" />
        <StatCard title="Total Orders" value={stats.totalOrders} icon="📋" color="red" />
        <StatCard
          title="Total Revenue"
          value={`₹${stats.totalRevenue.toLocaleString('en-IN')}`}
          icon="💰"
          color="yellow"
        />
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Platform Analytics</h2>
        <p className="text-gray-600">
          The platform is connecting {stats.totalFarmers} farmers with {stats.totalBuyers} buyers,
          facilitating rural entrepreneurship through {stats.totalProducts} value-added products.
        </p>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Impact Measurement</h2>
        <div className="space-y-3">
          <ImpactMetric
            label="Farmer Engagement Rate"
            value={stats.totalFarmers > 0 ? ((stats.totalProducts / stats.totalFarmers).toFixed(1)) : '0'}
            unit="products/farmer"
          />
          <ImpactMetric
            label="Average Order Value"
            value={stats.totalOrders > 0 ? `₹${(stats.totalRevenue / stats.totalOrders).toFixed(0)}` : '₹0'}
            unit=""
          />
          <ImpactMetric
            label="Platform Growth"
            value={`${stats.totalUsers}`}
            unit="registered users"
          />
        </div>
      </div>
    </div>
  );
}

interface StatCardProps {
  title: string;
  value: number | string;
  icon: string;
  color: string;
}

function StatCard({ title, value, icon, color }: StatCardProps) {
  const colorClasses: Record<string, string> = {
    blue: 'bg-blue-100 text-blue-800',
    green: 'bg-green-100 text-green-800',
    purple: 'bg-purple-100 text-purple-800',
    orange: 'bg-orange-100 text-orange-800',
    red: 'bg-red-100 text-red-800',
    yellow: 'bg-yellow-100 text-yellow-800',
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-600 mb-1">{title}</p>
          <p className="text-2xl font-bold text-gray-800">{value}</p>
        </div>
        <div className={`w-12 h-12 rounded-full flex items-center justify-center text-2xl ${colorClasses[color]}`}>
          {icon}
        </div>
      </div>
    </div>
  );
}

function ImpactMetric({ label, value, unit }: { label: string; value: string; unit: string }) {
  return (
    <div className="flex justify-between items-center py-2 border-b border-gray-100 last:border-0">
      <span className="text-gray-700">{label}</span>
      <span className="font-semibold text-gray-900">
        {value} {unit && <span className="text-sm text-gray-600">{unit}</span>}
      </span>
    </div>
  );
}
