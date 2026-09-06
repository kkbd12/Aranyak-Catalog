import { Category, Product, StoreSettings } from '../types';

export const INITIAL_SETTINGS: StoreSettings = {
  storeName: 'Aranayak',
  tagline: '১০০% খাঁটি গুঁড়া ও গোটা মসলা, প্রাকৃতিক তেল এবং প্রিমিয়াম পণ্য',
  currency: 'BDT',
  currencySymbol: '৳',
  taxRate: 0, // No VAT for raw agro goods
  deliveryFee: 50,
  minOrderAmount: 200,
  tableOrderingEnabled: false,
  soundEffects: true,
  phone: '+880 1711-889900',
  whatsappNumber: '+880 1711-889900',
  address: 'দোকান নং ১২-১৫, চকবাজার ও কাওরান বাজার, ঢাকা',
  bkashNumber: '01711889900',
  banglaQrNumber: '01711889900',
  banglaQrMerchantName: 'Aranayak',
  logoUrl: '/favicon.png',
  faviconUrl: '/favicon.png',
};

export const INITIAL_CATEGORIES: Category[] = [
  { id: 'all', name: 'All Items', nameBn: 'সব আইটেম', icon: 'Sparkles', order: 0 },
  { id: 'ground_spices', name: 'Ground Spices', nameBn: 'খাঁটি গুঁড়া মসলা 🌶️', icon: 'Flame', order: 1 },
  { id: 'whole_spices', name: 'Whole Spices', nameBn: 'গোটা মসলা ও সুগন্ধি 🌿', icon: 'Crown', order: 2 },
  { id: 'oils_ghee', name: 'Oil & Ghee', nameBn: 'তেল ও গাওয়া ঘি 🫒', icon: 'Droplets', order: 3 },
  { id: 'rice_dal', name: 'Rice, Dal & Flour', nameBn: 'চাল, ডাল ও আটা-ময়দা 🌾', icon: 'Wheat', order: 4 },
  { id: 'groceries', name: 'Daily Groceries', nameBn: 'নিত্য মুদি বাজার 🛒', icon: 'ShoppingBag', order: 5 },
  { id: 'dryfruits', name: 'Nuts & Dry Fruits', nameBn: 'বাদাম ও ড্রাই ফ্রুটস 🥜', icon: 'Package', order: 6 },
  { id: 'combos', name: 'Super Combos', nameBn: 'ফ্যামিলি বাজার কম্বো 🎁', icon: 'Gift', order: 7 },
];

export const INITIAL_PRODUCTS: Product[] = [];

export const INITIAL_PRESET_IMAGES: { label: string; url: string }[] = [];
