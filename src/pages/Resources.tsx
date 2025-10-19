import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useLanguage } from '../contexts/LanguageContext';

interface Resource {
  id: string;
  title_en: string;
  title_hi: string;
  content_en: string;
  content_hi: string;
  category: string;
  view_count: number;
  created_at: string;
}

export default function Resources() {
  const { t, language } = useLanguage();
  const [resources, setResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [expandedResource, setExpandedResource] = useState<string | null>(null);

  useEffect(() => {
    loadResources();
  }, []);

  const loadResources = async () => {
    try {
      const { data, error } = await supabase
        .from('educational_resources')
        .select('*')
        .eq('is_published', true)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setResources(data || []);
    } catch (error) {
      console.error('Error loading resources:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleViewResource = async (resourceId: string) => {
    if (expandedResource === resourceId) {
      setExpandedResource(null);
      return;
    }

    setExpandedResource(resourceId);

    try {
      const resource = resources.find(r => r.id === resourceId);
      if (resource) {
        await supabase
          .from('educational_resources')
          .update({ view_count: resource.view_count + 1 })
          .eq('id', resourceId);

        setResources(resources.map(r =>
          r.id === resourceId ? { ...r, view_count: r.view_count + 1 } : r
        ));
      }
    } catch (error) {
      console.error('Error updating view count:', error);
    }
  };

  const categories = ['all', ...Array.from(new Set(resources.map(r => r.category)))];

  const filteredResources = selectedCategory === 'all'
    ? resources
    : resources.filter(r => r.category === selectedCategory);

  if (loading) return <div className="p-8 text-center">{t('loading')}</div>;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">{t('resources.title')}</h1>
        <p className="text-gray-600">
          Learn about value addition, marketing strategies, and entrepreneurship
        </p>
      </div>

      <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
        <h3 className="text-sm font-medium text-gray-700 mb-3">Categories</h3>
        <div className="flex flex-wrap gap-2">
          {categories.map(category => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                selectedCategory === category
                  ? 'bg-green-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {category === 'all' ? 'All' : category}
            </button>
          ))}
        </div>
      </div>

      {filteredResources.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-600 text-lg">No resources found in this category.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredResources.map(resource => (
            <ResourceCard
              key={resource.id}
              resource={resource}
              language={language}
              isExpanded={expandedResource === resource.id}
              onToggle={() => handleViewResource(resource.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

interface ResourceCardProps {
  resource: Resource;
  language: string;
  isExpanded: boolean;
  onToggle: () => void;
}

function ResourceCard({ resource, language, isExpanded, onToggle }: ResourceCardProps) {
  const title = language === 'hi' ? resource.title_hi : resource.title_en;
  const content = language === 'hi' ? resource.content_hi : resource.content_en;

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div className="p-6">
        <div className="flex justify-between items-start mb-4">
          <div className="flex-1">
            <h3 className="text-xl font-semibold text-gray-800 mb-2">{title}</h3>
            <div className="flex items-center gap-4 text-sm text-gray-600">
              <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full">
                {resource.category}
              </span>
              <span className="flex items-center gap-1">
                👁️ {resource.view_count} views
              </span>
              <span>
                {new Date(resource.created_at).toLocaleDateString('en-IN', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </span>
            </div>
          </div>
        </div>

        {isExpanded ? (
          <div className="prose max-w-none">
            <div className="text-gray-700 whitespace-pre-line">{content}</div>
            <button
              onClick={onToggle}
              className="mt-4 text-green-600 hover:text-green-700 font-medium text-sm"
            >
              Show Less
            </button>
          </div>
        ) : (
          <div>
            <p className="text-gray-700 line-clamp-2">{content}</p>
            <button
              onClick={onToggle}
              className="mt-2 text-green-600 hover:text-green-700 font-medium text-sm"
            >
              Read More →
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
