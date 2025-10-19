import { Link } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';

export default function Home() {
  const { t } = useLanguage();
  const { profile } = useAuth();

  return (
    <div className="min-h-screen">
      <section className="bg-gradient-to-r from-green-600 to-green-500 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-5xl font-bold mb-6">{t('app.name')}</h1>
          <p className="text-2xl mb-8">{t('app.tagline')}</p>
          <p className="text-xl max-w-3xl mx-auto mb-10">
            Connect directly with farmers producing value-added agricultural products.
            Support rural entrepreneurship and get fresh, authentic products delivered to your door.
          </p>
          {!profile && (
            <div className="space-x-4">
              <Link
                to="/signup"
                className="bg-white text-green-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors inline-block"
              >
                Get Started
              </Link>
              <Link
                to="/products"
                className="bg-green-700 text-white px-8 py-3 rounded-lg font-semibold hover:bg-green-800 transition-colors inline-block"
              >
                Browse Products
              </Link>
            </div>
          )}
        </div>
      </section>

      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center text-gray-800 mb-12">
            How FarmConnect Works
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center p-6">
              <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">🌾</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">For Farmers</h3>
              <p className="text-gray-600">
                List your value-added products, manage inventory, and reach customers across India.
                Access educational resources to grow your business.
              </p>
            </div>

            <div className="text-center p-6">
              <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">🛒</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">For Buyers</h3>
              <p className="text-gray-600">
                Discover authentic agricultural products directly from farmers.
                Filter by organic, traditional methods, and support local communities.
              </p>
            </div>

            <div className="text-center p-6">
              <div className="bg-yellow-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">📊</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Track Impact</h3>
              <p className="text-gray-600">
                Monitor sales trends, customer engagement, and measure the economic impact
                on rural entrepreneurship.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center text-gray-800 mb-12">
            Product Categories
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {[
              { name: 'Processed Foods', icon: '🍯' },
              { name: 'Dairy Products', icon: '🧀' },
              { name: 'Beverages', icon: '🍵' },
              { name: 'Grains & Flours', icon: '🌾' },
              { name: 'Handmade Crafts', icon: '🧺' },
              { name: 'Organic Produce', icon: '🥬' },
            ].map((category) => (
              <div
                key={category.name}
                className="bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow text-center"
              >
                <div className="text-4xl mb-2">{category.icon}</div>
                <div className="text-sm font-medium text-gray-800">{category.name}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 bg-green-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-6">Join the FarmConnect Community</h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            Whether you're a farmer looking to expand your market or a buyer seeking authentic products,
            FarmConnect is your platform for rural entrepreneurship.
          </p>
          {!profile && (
            <Link
              to="/signup"
              className="bg-white text-green-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors inline-block"
            >
              Sign Up Now
            </Link>
          )}
        </div>
      </section>
    </div>
  );
}
