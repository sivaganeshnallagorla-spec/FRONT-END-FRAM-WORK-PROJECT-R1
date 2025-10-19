import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { Link } from 'react-router-dom';

interface Order {
  id: string;
  status: string;
  total_amount: number;
  created_at: string;
  farmer: {
    full_name: string;
  };
}

export default function BuyerDashboard() {
  const { user } = useAuth();
  const { t } = useLanguage();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadOrders();
    }
  }, [user]);

  const loadOrders = async () => {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select(`
          id,
          status,
          total_amount,
          created_at,
          farmer:farmer_id (full_name)
        `)
        .eq('buyer_id', user!.id)
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) throw error;
      setOrders(data as any || []);
    } catch (error) {
      console.error('Error loading orders:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <p>{t('loading')}</p>;

  const totalSpent = orders.reduce((sum, order) => sum + Number(order.total_amount), 0);
  const pendingOrders = orders.filter(o => o.status === 'pending' || o.status === 'confirmed').length;

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Total Orders</p>
              <p className="text-2xl font-bold text-gray-800">{orders.length}</p>
            </div>
            <div className="w-12 h-12 rounded-full bg-blue-100 text-blue-800 flex items-center justify-center text-2xl">
              📦
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Pending Orders</p>
              <p className="text-2xl font-bold text-gray-800">{pendingOrders}</p>
            </div>
            <div className="w-12 h-12 rounded-full bg-orange-100 text-orange-800 flex items-center justify-center text-2xl">
              ⏳
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Total Spent</p>
              <p className="text-2xl font-bold text-gray-800">₹{totalSpent.toLocaleString('en-IN')}</p>
            </div>
            <div className="w-12 h-12 rounded-full bg-green-100 text-green-800 flex items-center justify-center text-2xl">
              💰
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Link
          to="/products"
          className="bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg shadow-lg p-8 hover:from-green-600 hover:to-green-700 transition-all"
        >
          <h3 className="text-2xl font-bold mb-2">Explore Products</h3>
          <p className="text-green-100">Browse value-added products from farmers across India</p>
        </Link>

        <Link
          to="/resources"
          className="bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg shadow-lg p-8 hover:from-blue-600 hover:to-blue-700 transition-all"
        >
          <h3 className="text-2xl font-bold mb-2">Success Stories</h3>
          <p className="text-blue-100">Read about farmer entrepreneurs and their journeys</p>
        </Link>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Your Orders</h2>
        {orders.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-600 mb-4">You haven't placed any orders yet.</p>
            <Link
              to="/products"
              className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors inline-block"
            >
              Start Shopping
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {orders.map(order => (
              <div key={order.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <p className="text-sm font-medium text-gray-900">Order #{order.id.slice(0, 8)}</p>
                    <p className="text-xs text-gray-600">
                      From: {(order.farmer as any)?.full_name || 'Farmer'}
                    </p>
                    <p className="text-xs text-gray-600">
                      {new Date(order.created_at).toLocaleDateString('en-IN', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-semibold text-gray-900">
                      ₹{Number(order.total_amount).toLocaleString('en-IN')}
                    </p>
                    <StatusBadge status={order.status} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="bg-green-50 border border-green-200 rounded-lg p-6">
        <h3 className="text-green-800 font-semibold mb-2">Support Local Communities</h3>
        <p className="text-green-700 text-sm">
          Every purchase you make directly supports farmer entrepreneurs and their families,
          contributing to rural economic development across India.
        </p>
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const statusColors: Record<string, string> = {
    pending: 'bg-yellow-100 text-yellow-800',
    confirmed: 'bg-blue-100 text-blue-800',
    shipped: 'bg-purple-100 text-purple-800',
    delivered: 'bg-green-100 text-green-800',
    cancelled: 'bg-red-100 text-red-800',
  };

  return (
    <span className={`text-xs px-2 py-1 rounded-full ${statusColors[status] || 'bg-gray-100 text-gray-800'}`}>
      {status}
    </span>
  );
}
