import React, { useEffect, useRef } from 'react';
import { ProductCard } from './ProductCard';
import { useStore } from '../context/StoreContext';
import { 
  Sparkles, 
  Flame,
  SearchX, 
  Plus, 
  Search,
  X,
  PackageOpen,
  FolderPlus
} from 'lucide-react';

interface ProductFeedProps {
  scrollContainerRef?: React.RefObject<HTMLDivElement>;
}

export const ProductFeed: React.FC<ProductFeedProps> = () => {
  const { 
    products, 
    categories, 
    activeCategory, 
    searchQuery, 
    setSearchQuery,
    setIsAddProductOpen,
    setIsCategoryManagerOpen
  } = useStore();

  const containerRef = useRef<HTMLDivElement>(null);
  const sectionRefs = useRef<Record<string, HTMLDivElement | null>>({});

  // Filter products by in-stock status and search query (Hide out of stock items from customer view)
  const inStockProducts = products.filter(p => {
    if (p.variants && p.variants.length > 0) {
      return p.variants.some(v => (v.stock || 0) > 0);
    }
    return (p.stock || 0) > 0;
  });

  const filteredProducts = inStockProducts.filter(p => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase().trim();
    return (
      p.name.toLowerCase().includes(query) ||
      (p.nameBn && p.nameBn.toLowerCase().includes(query)) ||
      p.description.toLowerCase().includes(query) ||
      (p.tags && p.tags.some(t => t.toLowerCase().includes(query)))
    );
  });

  // Pinned products: Popular & Special Offers (always at the very top)
  const popularProducts = inStockProducts.filter(p => p.isPopular);
  const specialProducts = inStockProducts.filter(p => p.isSpecial);

  // Smooth scroll to section when category is clicked
  useEffect(() => {
    if (activeCategory === 'all') {
      if (containerRef.current) {
        containerRef.current.scrollTo({ top: 0, behavior: 'smooth' });
      }
    } else {
      const targetElement = sectionRefs.current[activeCategory];
      if (targetElement) {
        targetElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  }, [activeCategory]);

  const activeCategoriesToRender = categories.filter(cat => cat.id !== 'all');

  return (
    <div
      ref={containerRef}
      id="product-feed-scroll-container"
      className="flex-1 h-[calc(100dvh-4rem)] sm:h-[calc(100dvh-4.5rem)] overflow-y-auto px-3 sm:px-5 py-2.5 space-y-3.5 pb-[calc(10rem+env(safe-area-inset-bottom,0px))] scroll-smooth"
    >
      {/* Top Search Bar & Header Area */}
      <div className="sticky top-0 z-20 bg-slate-50/95 backdrop-blur-md pt-1 pb-2.5 border-b border-slate-200/80 -mx-3 px-3 sm:-mx-5 sm:px-5 space-y-2">
        {/* Main Instant Search Input */}
        <div className="relative w-full shadow-2xs rounded-2xl">
          <Search className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-amber-600 shrink-0 pointer-events-none" />
          <input
            id="product-feed-search-input"
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="পণ্য বা মসলার নাম লিখে খুঁজুন... (যেমন: হলুদ, এলাচ, সরিষার তেল, ঘি)"
            className="w-full pl-11 pr-11 py-2.5 sm:py-3 bg-white text-slate-900 text-sm sm:text-base font-medium rounded-2xl border border-slate-200 focus:border-amber-500 focus:ring-2 focus:ring-amber-200/60 focus:outline-hidden transition-all placeholder:text-slate-400"
          />
          {searchQuery ? (
            <button
              id="clear-feed-search-btn"
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1.5 text-slate-400 hover:text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
              title="সার্চ মুছে ফেলুন"
            >
              <X className="w-4 h-4" />
            </button>
          ) : (
            <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-lg hidden sm:inline">
              {products.length}টি পণ্য
            </span>
          )}
        </div>
      </div>

      {/* Empty State when NO products exist in store */}
      {!searchQuery && products.length === 0 && (
        <div className="py-14 sm:py-20 text-center flex flex-col items-center justify-center bg-white border border-dashed border-amber-300/80 rounded-3xl p-6 shadow-2xs">
          <div className="w-16 h-16 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mb-3">
            <PackageOpen className="w-8 h-8 stroke-[1.5]" />
          </div>
          <h3 className="text-lg font-extrabold text-slate-900 mb-1">দোকানের ক্যাটালগ সম্পূর্ণ প্রস্তুত ও ফাঁকা</h3>
          <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto mb-5 leading-relaxed">
            পূর্বের সকল ডেমো পণ্য মুছে ফেলা হয়েছে। এখন আপনার পছন্দমতো ক্যাটাগরি তৈরি করুন এবং নতুন পণ্য যুক্ত করে আপনার নিজস্ব ক্যাটালগ শুরু করুন।
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <button
              id="empty-state-add-product-btn"
              onClick={() => setIsAddProductOpen(true)}
              className="px-5 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white text-xs sm:text-sm font-bold rounded-xl shadow-md flex items-center gap-1.5 cursor-pointer transition-all active:scale-95"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              <span>+ নতুন পণ্য যুক্ত করুন</span>
            </button>
            <button
              id="empty-state-manage-category-btn"
              onClick={() => setIsCategoryManagerOpen(true)}
              className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs sm:text-sm font-bold rounded-xl flex items-center gap-1.5 cursor-pointer transition-all active:scale-95"
            >
              <FolderPlus className="w-4 h-4 text-amber-600" />
              <span>ক্যাটাগরি ম্যানেজ করুন</span>
            </button>
          </div>
        </div>
      )}

      {/* Search results mode */}
      {searchQuery ? (
        <div>
          <div className="flex items-center justify-between mb-3 border-b border-slate-200 pb-2">
            <h2 className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-amber-500" />
              খোঁজা হচ্ছে: &ldquo;{searchQuery}&rdquo;
            </h2>
            <span className="text-xs text-slate-500 font-medium">
              {filteredProducts.length}টি আইটেম পাওয়া গেছে
            </span>
          </div>

          {filteredProducts.length === 0 ? (
            <div className="py-16 text-center flex flex-col items-center justify-center">
              <div className="w-14 h-14 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mb-3">
                <SearchX className="w-7 h-7" />
              </div>
              <h3 className="text-base font-bold text-slate-800">কোনো আইটেম পাওয়া যায়নি</h3>
              <p className="text-xs text-slate-500 max-w-xs mt-1">
                &ldquo;{searchQuery}&rdquo; দিয়ে কিছু মেলেনি। অন্য শব্দ লিখে খুঁজুন অথবা নতুন প্রোডাক্ট যোগ করুন।
              </p>
              <div className="flex gap-2 mt-4">
                <button
                  onClick={() => setSearchQuery('')}
                  className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition-colors cursor-pointer"
                >
                  সার্চ ক্লিয়ার করুন
                </button>
                <button
                  onClick={() => setIsAddProductOpen(true)}
                  className="px-3.5 py-1.5 bg-amber-500 hover:bg-amber-600 text-white text-xs font-semibold rounded-xl flex items-center gap-1 transition-colors cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  নতুন পণ্য যোগ করুন
                </button>
              </div>
            </div>
          ) : (
            <div className="flex flex-col gap-2.5 w-full">
              {filteredProducts.map((product, idx) => (
                <ProductCard 
                  key={product.id} 
                  product={product} 
                  serialNumber={idx + 1}
                />
              ))}
            </div>
          )}
        </div>
      ) : (
        /* Continuous Categorized Scroll Feed with PINNED Top Sections */
        products.length > 0 && (
          <div className="space-y-6">
            {/* 1. PINNED: জনপ্রিয় পণ্য 🔥 (Popular Products ALWAYS AT THE VERY TOP) */}
            {popularProducts.length > 0 && (
              <section
                id="section-popular"
                ref={(el) => {
                  sectionRefs.current['popular'] = el;
                }}
                className="scroll-mt-14"
              >
                {/* Popular Header */}
                <div className="flex bg-gradient-to-r from-amber-50 to-orange-50/80 py-2.5 px-3.5 sm:px-4 rounded-2xl border border-amber-200/90 items-center justify-between mb-3 shadow-2xs">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 text-white flex items-center justify-center shadow-xs">
                      <Flame className="w-5 h-5 fill-white" />
                    </div>
                    <div>
                      <h2 className="text-base sm:text-lg font-black text-amber-950 leading-tight flex items-center gap-1.5">
                        <span>জনপ্রিয় পণ্য</span>
                        <span>🔥</span>
                      </h2>
                      <span className="text-[11px] text-amber-800 font-medium">
                        ক্রেতাদের সর্বাধিক পছন্দের ও হট বিক্রিত পণ্য
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-xs font-black text-amber-950 bg-white border border-amber-300/80 px-2.5 py-1 rounded-xl shadow-2xs">
                      {popularProducts.length}টি পণ্য
                    </span>
                  </div>
                </div>

                {/* Popular Products List */}
                <div className="flex flex-col gap-3 w-full">
                  {popularProducts.map((product, idx) => (
                    <ProductCard 
                      key={`pop-${product.id}`} 
                      product={product} 
                      serialNumber={idx + 1}
                    />
                  ))}
                </div>
              </section>
            )}

            {/* 2. PINNED: স্পেশাল অফার ✨ (Special Offers ALWAYS AT THE VERY TOP) */}
            {specialProducts.length > 0 && (
              <section
                id="section-special"
                ref={(el) => {
                  sectionRefs.current['special'] = el;
                }}
                className="scroll-mt-14"
              >
                {/* Special Offers Header */}
                <div className="flex bg-gradient-to-r from-orange-50 to-amber-50/80 py-2.5 px-3.5 sm:px-4 rounded-2xl border border-orange-200/90 items-center justify-between mb-3 shadow-2xs">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-orange-500 to-amber-500 text-white flex items-center justify-center shadow-xs">
                      <Sparkles className="w-5 h-5 fill-white" />
                    </div>
                    <div>
                      <h2 className="text-base sm:text-lg font-black text-orange-950 leading-tight flex items-center gap-1.5">
                        <span>স্পেশাল অফার</span>
                        <span>✨</span>
                      </h2>
                      <span className="text-[11px] text-orange-800 font-medium">
                        সীমিত সময়ের বিশেষ মূল্যছাড় ও আকর্ষনীয় অফার
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-xs font-black text-orange-950 bg-white border border-orange-300/80 px-2.5 py-1 rounded-xl shadow-2xs">
                      {specialProducts.length}টি অফার
                    </span>
                  </div>
                </div>

                {/* Special Offer Products List */}
                <div className="flex flex-col gap-3 w-full">
                  {specialProducts.map((product, idx) => (
                    <ProductCard 
                      key={`spec-${product.id}`} 
                      product={product} 
                      serialNumber={idx + 1}
                    />
                  ))}
                </div>
              </section>
            )}

            {/* 3. Regular Categorized Sections */}
            {(() => {
              let globalSerialCounter = 0;

              return activeCategoriesToRender.map((category) => {
                const categoryItems = products.filter(p => p.category === category.id);
                if (categoryItems.length === 0) return null;

                const categoryStartSerial = globalSerialCounter + 1;
                const categoryEndSerial = globalSerialCounter + categoryItems.length;

                return (
                  <section
                    key={category.id}
                    id={`section-${category.id}`}
                    ref={(el) => {
                      sectionRefs.current[category.id] = el;
                    }}
                    className="scroll-mt-14"
                  >
                    {/* Category Header with Serial Numbers Indicator */}
                    <div className="flex bg-white/90 backdrop-blur-xs py-2.5 px-3.5 sm:px-4 rounded-2xl border border-slate-200/80 items-center justify-between mb-3 shadow-2xs">
                      <div className="flex items-center gap-2.5">
                        <span className="w-3 h-6 bg-gradient-to-b from-amber-500 to-orange-600 rounded-full shrink-0" />
                        <div>
                          <h2 className="text-base sm:text-lg font-black text-slate-900 leading-tight">
                            {category.nameBn || category.name}
                          </h2>
                          {category.nameBn && (
                            <span className="text-xs text-slate-400 font-medium hidden sm:inline">
                              {category.name}
                            </span>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-black text-amber-900 bg-amber-50 border border-amber-200/80 px-2.5 py-0.5 rounded-lg shadow-2xs">
                          #{categoryStartSerial} - #{categoryEndSerial}
                        </span>
                        <span className="text-xs font-bold text-slate-700 bg-slate-100 px-2.5 py-0.5 rounded-lg">
                          {categoryItems.length}টি
                        </span>
                      </div>
                    </div>

                    {/* Product Layout: Single Column Sequential Rows */}
                    <div className="flex flex-col gap-3 w-full">
                      {categoryItems.map((product) => {
                        globalSerialCounter += 1;
                        const itemSerial = globalSerialCounter;
                        return (
                          <ProductCard 
                            key={product.id} 
                            product={product} 
                            serialNumber={itemSerial}
                          />
                        );
                      })}
                    </div>
                  </section>
                );
              });
            })()}
          </div>
        )
      )}

      {/* End of Catalog Footer */}
      {products.length > 0 && (
        <div className="pt-8 pb-12 text-center text-slate-400 text-xs flex flex-col items-center gap-1.5 border-t border-slate-200/80 mt-8">
          <div className="w-8 h-8 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
            ✓
          </div>
          <span className="font-semibold text-slate-600">সকল পণ্যের তালিকা সমাপ্ত</span>
          <span className="text-[11px] text-slate-400">১০০% খাঁটি ও বিশ্বস্ত সেবায় আমরা প্রতিশ্রুতিবদ্ধ</span>
        </div>
      )}
    </div>
  );
};
