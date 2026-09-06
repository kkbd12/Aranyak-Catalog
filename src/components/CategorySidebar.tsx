import React from 'react';
import { 
  Sparkles, 
  Flame, 
  Crown, 
  Droplets, 
  Wheat, 
  ShoppingBag, 
  Package, 
  Gift, 
  Layers,
  FolderPlus
} from 'lucide-react';
import { useStore } from '../context/StoreContext';

const ICON_MAP: Record<string, React.ReactNode> = {
  Sparkles: <Sparkles className="w-4 h-4" />,
  Flame: <Flame className="w-4 h-4" />,
  Crown: <Crown className="w-4 h-4" />,
  Droplets: <Droplets className="w-4 h-4" />,
  Wheat: <Wheat className="w-4 h-4" />,
  ShoppingBag: <ShoppingBag className="w-4 h-4" />,
  Package: <Package className="w-4 h-4" />,
  Gift: <Gift className="w-4 h-4" />,
  Layers: <Layers className="w-4 h-4" />,
};

interface CategorySidebarProps {
  onCategorySelect?: (categoryId: string) => void;
}

export const CategorySidebar: React.FC<CategorySidebarProps> = ({ onCategorySelect }) => {
  const { 
    categories, 
    activeCategory, 
    setActiveCategory, 
    products, 
    cart,
    setIsCategoryManagerOpen,
    isAdminAuthenticated
  } = useStore();

  const handleSelect = (catId: string) => {
    setActiveCategory(catId);
    if (onCategorySelect) {
      onCategorySelect(catId);
    }
  };

  const popularCount = products.filter(p => p.isPopular).length;
  const specialCount = products.filter(p => p.isSpecial).length;

  return (
    <aside 
      id="category-sidebar"
      className="hidden lg:block w-44 lg:w-52 shrink-0 bg-slate-100/90 border-r border-slate-200/90 h-[calc(100vh-6.5rem)] sticky top-24 overflow-y-auto overflow-x-hidden py-2 scrollbar-thin select-none"
    >
      <div className="flex flex-col gap-1 px-2">
        {/* All Products Tab */}
        <button
          id="category-tab-all"
          onClick={() => handleSelect('all')}
          className={`group relative flex items-center text-left w-full p-2.5 rounded-xl transition-all ${
            activeCategory === 'all'
              ? 'bg-white text-amber-900 font-bold shadow-xs border-r-4 border-amber-600'
              : 'text-slate-700 hover:bg-slate-200/70 hover:text-slate-900 font-medium'
          }`}
        >
          <div className={`p-1.5 rounded-lg mr-2 shrink-0 transition-colors ${
            activeCategory === 'all' ? 'bg-amber-100 text-amber-700' : 'bg-slate-200/60 text-slate-500'
          }`}>
            <Layers className="w-4 h-4" />
          </div>
          <div className="min-w-0 flex-1">
            <span className="text-xs block leading-tight font-bold">সব পণ্য</span>
            <span className="text-[10px] text-slate-400 font-normal">All Items</span>
          </div>
          <span className="text-[10px] font-bold text-slate-400 ml-auto">
            {products.length}
          </span>
        </button>

        {/* Pinned: Popular Products Shortcut */}
        {popularCount > 0 && (
          <button
            id="category-tab-popular"
            onClick={() => handleSelect('popular')}
            className={`group relative flex items-center text-left w-full p-2.5 rounded-xl transition-all ${
              activeCategory === 'popular'
                ? 'bg-amber-500/15 text-amber-950 font-bold shadow-xs border-r-4 border-amber-600'
                : 'text-amber-900 hover:bg-amber-100/60 font-medium'
            }`}
          >
            <div className="p-1.5 rounded-lg mr-2 shrink-0 bg-amber-100 text-amber-700">
              <Flame className="w-4 h-4 fill-amber-500" />
            </div>
            <div className="min-w-0 flex-1">
              <span className="text-xs block leading-tight font-bold flex items-center gap-1">
                <span>জনপ্রিয় পণ্য</span>
                <span>🔥</span>
              </span>
              <span className="text-[10px] text-amber-700/80 font-normal">Featured</span>
            </div>
            <span className="text-[10px] font-bold text-amber-700 ml-auto bg-amber-100 px-1.5 py-0.5 rounded-md">
              {popularCount}
            </span>
          </button>
        )}

        {/* Pinned: Special Offers Shortcut */}
        {specialCount > 0 && (
          <button
            id="category-tab-special"
            onClick={() => handleSelect('special')}
            className={`group relative flex items-center text-left w-full p-2.5 rounded-xl transition-all ${
              activeCategory === 'special'
                ? 'bg-orange-500/15 text-orange-950 font-bold shadow-xs border-r-4 border-orange-600'
                : 'text-orange-900 hover:bg-orange-100/60 font-medium'
            }`}
          >
            <div className="p-1.5 rounded-lg mr-2 shrink-0 bg-orange-100 text-orange-700">
              <Sparkles className="w-4 h-4 fill-orange-500" />
            </div>
            <div className="min-w-0 flex-1">
              <span className="text-xs block leading-tight font-bold flex items-center gap-1">
                <span>স্পেশাল অফার</span>
                <span>✨</span>
              </span>
              <span className="text-[10px] text-orange-700/80 font-normal">Special Deals</span>
            </div>
            <span className="text-[10px] font-bold text-orange-700 ml-auto bg-orange-100 px-1.5 py-0.5 rounded-md">
              {specialCount}
            </span>
          </button>
        )}

        {/* Divider */}
        <div className="my-1 border-t border-slate-200/80" />

        {/* Regular Categories */}
        {categories
          .filter(cat => cat.id !== 'all')
          .map((category) => {
            const isActive = activeCategory === category.id;
            const categoryProducts = products.filter(p => p.category === category.id);
            const totalCount = categoryProducts.length;

            const cartCountForCategory = cart
              .filter(item => item.product.category === category.id)
              .reduce((sum, item) => sum + item.quantity, 0);

            return (
              <button
                key={category.id}
                id={`category-tab-${category.id}`}
                onClick={() => handleSelect(category.id)}
                className={`group relative flex items-center text-left w-full p-2 sm:p-2.5 rounded-xl transition-all ${
                  isActive
                    ? 'bg-white text-amber-900 font-bold shadow-xs border-r-4 border-amber-600'
                    : 'text-slate-700 hover:bg-slate-200/70 hover:text-slate-900 font-medium'
                }`}
              >
                {/* Category Icon */}
                <div className={`p-1.5 rounded-lg mr-2 shrink-0 transition-colors ${
                  isActive ? 'bg-amber-100 text-amber-700' : 'bg-slate-200/60 text-slate-500 group-hover:text-slate-700'
                }`}>
                  {ICON_MAP[category.icon] || <Layers className="w-4 h-4" />}
                </div>

                {/* Category Titles */}
                <div className="min-w-0 flex-1">
                  <span className="text-xs block leading-tight truncate">
                    {category.nameBn || category.name}
                  </span>
                  {category.nameBn && (
                    <span className="text-[10px] text-slate-400 font-normal block truncate mt-0.5">
                      {category.name}
                    </span>
                  )}
                </div>

                {/* Count badge */}
                {cartCountForCategory > 0 ? (
                  <span className="ml-auto w-4 h-4 rounded-full bg-amber-600 text-white text-[9px] font-black flex items-center justify-center shadow-xs animate-scale-in">
                    {cartCountForCategory}
                  </span>
                ) : (
                  <span className="text-[10px] text-slate-400 ml-auto">
                    {totalCount}
                  </span>
                )}
              </button>
            );
          })}

        {/* Manage Categories Button (always visible or for admin) */}
        <div className="pt-3 mt-auto">
          <button
            id="sidebar-manage-categories-btn"
            type="button"
            onClick={() => setIsCategoryManagerOpen(true)}
            className="w-full p-2 bg-amber-50 hover:bg-amber-100 text-amber-900 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 border border-amber-200/80 transition-colors cursor-pointer"
            title="ক্যাটাগরি তৈরি, এডিট ও মুছুন"
          >
            <FolderPlus className="w-3.5 h-3.5 text-amber-700" />
            <span>ক্যাটাগরি ম্যানেজ</span>
          </button>
        </div>
      </div>
    </aside>
  );
};
