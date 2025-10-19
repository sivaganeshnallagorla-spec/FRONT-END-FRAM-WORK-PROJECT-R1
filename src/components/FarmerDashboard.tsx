import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { Link } from 'react-router-dom';

interface Product {
  id: string;
  name: string;
  price: number;
  stock_quantity: number;
  low_stock_threshold: number;
  is_active: boolean;
}

interface Order {
  id: string;
  status: string;
  total_amount: number;
  created_at: string;
}

export default function FarmerDashboard() {
  const { user } = useAuth();
  const { t } = useLanguage();
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadData();
    }
  }, [user]);

  const loadData = async () => {
    try {
      const [productsRes, ordersRes] = await Promise.all([
        supabase
          .from('products')
          .select('id, name, price, stock_quantity, low_stock_threshold, is_active')
          .eq('farmer_id', user!.id)
          .order('created_at', { ascending: false }),
        supabase
          .from('orders')
          .select('id, status, total_amount, created_at')
          .eq('farmer_id', user!.id)
          .order('created_at', { ascending: false })
          .limit(5),
      ]);

      if (productsRes.data) setProducts(productsRes.data);
      if (ordersRes.data) setOrders(ordersRes.data);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <p>{t('loading')}</p>;

  const lowStockProducts = products.filter(p => p.stock_quantity <= p.low_stock_threshold);
  const activeProducts = products.filter(p => p.is_active).length;
  const totalRevenue = orders.reduce((sum, order) => sum + Number(order.total_amount), 0);

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Active Products</p>
              <p className="text-2xl font-bold text-gray-800">{activeProducts}</p>
            </div>
            <div className="w-12 h-12 rounded-full bg-green-100 text-green-800 flex items-center justify-center text-2xl">
              📦
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Total Orders</p>
              <p className="text-2xl font-bold text-gray-800">{orders.length}</p>
            </div>
            <div className="w-12 h-12 rounded-full bg-blue-100 text-blue-800 flex items-center justify-center text-2xl">
              📋
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Total Revenue</p>
              <p className="text-2xl font-bold text-gray-800">₹{totalRevenue.toLocaleString('en-IN')}</p>
            </div>
            <div className="w-12 h-12 rounded-full bg-yellow-100 text-yellow-800 flex items-center justify-center text-2xl">
              💰
            </div>
          </div>
        </div>
      </div>

      {lowStockProducts.length > 0 && (
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
          <h3 className="text-orange-800 font-semibold mb-2">Low Stock Alert</h3>
          <p className="text-orange-700 text-sm mb-2">
            The following products are running low on stock:
          </p>
          <ul className="list-disc list-inside text-orange-700 text-sm">
            {lowStockProducts.map(product => (
              <li key={product.id}>
                {product.name} - {product.stock_quantity} units remaining
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-800">Your Products</h2>
          <Link
            to="/products/new"
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors text-sm"
          >
            {t('products.add')}
          </Link>
        </div>

        {products.length === 0 ? (
          <p className="text-gray-600">No products yet. Start by adding your first product!</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead>
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Product</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Price</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Stock</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {products.slice(0, 5).map(product => (
                  <tr key={product.id}>
                    <td className="px-4 py-3 text-sm text-gray-900">{product.name}</td>
                    <td className="px-4 py-3 text-sm text-gray-900">₹{product.price}</td>
                    <td className="px-4 py-3 text-sm text-gray-900">{product.stock_quantity}</td>
                    <td className="px-4 py-3 text-sm">
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        product.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                      }`}>
                        {product.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Recent Orders</h2>
        {orders.length === 0 ? (
          <p className="text-gray-600">No orders yet.</p>
        ) : (
          <div className="space-y-3">
            {orders.map(order => (
              <div key={order.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="text-sm font-medium text-gray-900">Order #{order.id.slice(0, 8)}</p>
                  <p className="text-xs text-gray-600">{new Date(order.created_at).toLocaleDateString()}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-gray-900">₹{Number(order.total_amount).toLocaleString('en-IN')}</p>
                  <span className="text-xs px-2 py-1 rounded-full bg-blue-100 text-blue-800">
                    {order.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
