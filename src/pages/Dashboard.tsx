import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import AdminDashboard from '../components/AdminDashboard';
import FarmerDashboard from '../components/FarmerDashboard';
import BuyerDashboard from '../components/BuyerDashboard';

export default function Dashboard() {
  const { profile } = useAuth();
  const { t } = useLanguage();

  if (!profile) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-gray-600">{t('loading')}</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-gray-800 mb-2">
        {t('welcome')}, {profile.full_name}
      </h1>
      <p className="text-gray-600 mb-8">{t(`role.${profile.role}`)}</p>

      {profile.role === 'admin' && <AdminDashboard />}
      {profile.role === 'farmer' && <FarmerDashboard />}
      {profile.role === 'buyer' && <BuyerDashboard />}
    </div>
  );
}
