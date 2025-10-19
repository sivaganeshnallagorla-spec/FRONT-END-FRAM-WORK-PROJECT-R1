import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useLanguage } from '../contexts/LanguageContext';

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  unit: string;
  stock_quantity: number;
  images: any;
  is_organic: boolean;
  is_traditional: boolean;
  farmer: {
    full_name: string;
    state: string;
  };
  category: {
    name_en: string;
    name_hi: string;
  };
}

export default function Products() {
  const { t, language } = useLanguage();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterOrganic, setFilterOrganic] = useState(false);
  const [filterTraditional, setFilterTraditional] = useState(false);

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      let query = supabase
        .from('products')
        .select(`
          id,
          name,
          description,
          price,
          unit,
          stock_quantity,
          images,
          is_organic,
          is_traditional,
          farmer:farmer_id (full_name, state),
          category:category_id (name_en, name_hi)
        `)
        .eq('is_active', true)
        .gt('stock_quantity', 0);

      const { data, error } = await query;

      if (error) throw error;
      setProducts(data as any || []);
    } catch (error) {
      console.error('Error loading products:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesOrganic = !filterOrganic || product.is_organic;
    const matchesTraditional = !filterTraditional || product.is_traditional;

    return matchesSearch && matchesOrganic && matchesTraditional;
  });

  if (loading) return <div className="p-8 text-center">{t('loading')}</div>;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-gray-800 mb-8">{t('products.title')}</h1>

      <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="md:col-span-2">
            <input
              type="text"
              placeholder={t('search')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="organic"
              checked={filterOrganic}
              onChange={(e) => setFilterOrganic(e.target.checked)}
              className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
            />
            <label htmlFor="organic" className="ml-2 text-sm text-gray-700">
              {t('products.organic')}
            </label>
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="traditional"
              checked={filterTraditional}
              onChange={(e) => setFilterTraditional(e.target.checked)}
              className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
            />
            <label htmlFor="traditional" className="ml-2 text-sm text-gray-700">
              {t('products.traditional')}
            </label>
          </div>
        </div>
      </div>

      {filteredProducts.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-600 text-lg">No products found matching your criteria.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredProducts.map(product => (
            <ProductCard key={product.id} product={product} language={language} />
          ))}
        </div>
      )}
    </div>
  );
}

function ProductCard({ product, language }: { product: Product; language: string }) {
  const categoryName = language === 'hi' && product.category
    ? (product.category as any).name_hi
    : product.category
    ? (product.category as any).name_en
    : 'Product';

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
      <div className="h-48 bg-gradient-to-br from-green-100 to-green-200 flex items-center justify-center">
        <span className="text-6xl">🌾</span>
      </div>

      <div className="p-4">
        <div className="flex items-start justify-between mb-2">
          <h3 className="text-lg font-semibold text-gray-800 flex-1">{product.name}</h3>
          <div className="flex gap-1 ml-2">
            {product.is_organic && (
              <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">
                Organic
              </span>
            )}
            {product.is_traditional && (
              <span className="text-xs bg-orange-100 text-orange-700 px-2 py-1 rounded">
                Traditional
              </span>
            )}
          </div>
        </div>

        <p className="text-xs text-gray-600 mb-2">{categoryName}</p>
        <p className="text-sm text-gray-700 mb-3 line-clamp-2">{product.description}</p>

        <div className="flex justify-between items-center mb-3">
          <div>
            <p className="text-2xl font-bold text-green-600">
              ₹{Number(product.price).toLocaleString('en-IN')}
            </p>
            <p className="text-xs text-gray-600">per {product.unit}</p>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-600">Stock: {product.stock_quantity}</p>
          </div>
        </div>

        <div className="border-t pt-3">
          <p className="text-xs text-gray-600">
            From: {(product.farmer as any)?.full_name || 'Farmer'}
          </p>
          <p className="text-xs text-gray-500">
            {(product.farmer as any)?.state || 'India'}
          </p>
        </div>

        <button className="w-full mt-3 bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition-colors text-sm font-medium">
          Add to Cart
        </button>
      </div>
    </div>
  );
}
