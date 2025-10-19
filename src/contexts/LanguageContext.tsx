import { createContext, useContext, useState, ReactNode } from 'react';

type Language = 'en' | 'hi';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const translations: Record<Language, Record<string, string>> = {
  en: {
    'app.name': 'FarmConnect',
    'app.tagline': 'Empowering Indian Farmers',
    'nav.home': 'Home',
    'nav.products': 'Products',
    'nav.resources': 'Resources',
    'nav.dashboard': 'Dashboard',
    'nav.messages': 'Messages',
    'auth.signin': 'Sign In',
    'auth.signup': 'Sign Up',
    'auth.signout': 'Sign Out',
    'auth.email': 'Email',
    'auth.password': 'Password',
    'auth.fullname': 'Full Name',
    'auth.phone': 'Phone Number',
    'auth.role': 'I am a',
    'auth.role.farmer': 'Farmer',
    'auth.role.buyer': 'Buyer',
    'auth.state': 'State',
    'auth.district': 'District',
    'role.admin': 'Admin',
    'role.farmer': 'Farmer',
    'role.buyer': 'Buyer',
    'welcome': 'Welcome',
    'loading': 'Loading...',
    'save': 'Save',
    'cancel': 'Cancel',
    'delete': 'Delete',
    'edit': 'Edit',
    'view': 'View',
    'search': 'Search',
    'filter': 'Filter',
    'products.title': 'Products',
    'products.add': 'Add Product',
    'products.name': 'Product Name',
    'products.price': 'Price',
    'products.stock': 'Stock',
    'products.organic': 'Organic',
    'products.traditional': 'Traditional',
    'orders.title': 'Orders',
    'orders.status': 'Status',
    'orders.total': 'Total',
    'resources.title': 'Educational Resources',
    'dashboard.welcome': 'Welcome to your dashboard',
  },
  hi: {
    'app.name': 'फार्मकनेक्ट',
    'app.tagline': 'भारतीय किसानों को सशक्त बनाना',
    'nav.home': 'होम',
    'nav.products': 'उत्पाद',
    'nav.resources': 'संसाधन',
    'nav.dashboard': 'डैशबोर्ड',
    'nav.messages': 'संदेश',
    'auth.signin': 'साइन इन करें',
    'auth.signup': 'साइन अप करें',
    'auth.signout': 'साइन आउट करें',
    'auth.email': 'ईमेल',
    'auth.password': 'पासवर्ड',
    'auth.fullname': 'पूरा नाम',
    'auth.phone': 'फोन नंबर',
    'auth.role': 'मैं हूँ',
    'auth.role.farmer': 'किसान',
    'auth.role.buyer': 'खरीदार',
    'auth.state': 'राज्य',
    'auth.district': 'जिला',
    'role.admin': 'व्यवस्थापक',
    'role.farmer': 'किसान',
    'role.buyer': 'खरीदार',
    'welcome': 'स्वागत है',
    'loading': 'लोड हो रहा है...',
    'save': 'सहेजें',
    'cancel': 'रद्द करें',
    'delete': 'हटाएं',
    'edit': 'संपादित करें',
    'view': 'देखें',
    'search': 'खोजें',
    'filter': 'फ़िल्टर',
    'products.title': 'उत्पाद',
    'products.add': 'उत्पाद जोड़ें',
    'products.name': 'उत्पाद का नाम',
    'products.price': 'कीमत',
    'products.stock': 'स्टॉक',
    'products.organic': 'जैविक',
    'products.traditional': 'पारंपरिक',
    'orders.title': 'आदेश',
    'orders.status': 'स्थिति',
    'orders.total': 'कुल',
    'resources.title': 'शैक्षिक संसाधन',
    'dashboard.welcome': 'अपने डैशबोर्ड में आपका स्वागत है',
  },
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Language>('en');

  const t = (key: string): string => {
    return translations[language][key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
