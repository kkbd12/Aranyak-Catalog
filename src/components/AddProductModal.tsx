import React, { useState, useEffect, useCallback } from 'react';
import { 
  X, 
  Plus, 
  Image as ImageIcon, 
  Upload,
  DollarSign, 
  Package, 
  Tag, 
  RotateCcw,
  FolderPlus
} from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { ProductVariant } from '../types';
import { ProductVariantEditor } from './ProductVariantEditor';
import { optimizeProductImage } from '../utils/imageOptimizer';

export const AddProductModal: React.FC = () => {
  const { 
    isAddProductOpen, 
    setIsAddProductOpen, 
    categories, 
    addCategory, 
    addProduct,
    setIsCategoryManagerOpen
  } = useStore();

  const [name, setName] = useState('');
  const [nameBn, setNameBn] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState<number | ''>('');
  const [costPrice, setCostPrice] = useState<number | ''>('');
  const [category, setCategory] = useState(categories.find(c => c.id !== 'all')?.id || 'ground_spices');
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newCategoryNameBn, setNewCategoryNameBn] = useState('');
  const [isCreatingNewCat, setIsCreatingNewCat] = useState(false);
  const [image, setImage] = useState('');
  const [customImageUrl, setCustomImageUrl] = useState('');
  const [isProcessingImage, setIsProcessingImage] = useState(false);
  const [stock, setStock] = useState<number | ''>('');
  const [lowStockThreshold, setLowStockThreshold] = useState<number | ''>(5);
  const [sku, setSku] = useState('');
  const [unit, setUnit] = useState('1 kg Pack');
  const [isCustomUnit, setIsCustomUnit] = useState(false);
  const [customUnitInput, setCustomUnitInput] = useState('');
  const [tagsInput, setTagsInput] = useState('');
  const [isPopular, setIsPopular] = useState(false);
  const [isSpecial, setIsSpecial] = useState(false);

  // Multi-weight / Variants State
  const [hasVariants, setHasVariants] = useState(false);
  const [variants, setVariants] = useState<ProductVariant[]>([]);

  // Clear / reset all form fields to a pristine blank state
  const resetForm = useCallback(() => {
    setName('');
    setNameBn('');
    setDescription('');
    setPrice('');
    setCostPrice('');
    setCategory(categories.find(c => c.id !== 'all')?.id || 'ground_spices');
    setNewCategoryName('');
    setNewCategoryNameBn('');
    setIsCreatingNewCat(false);
    setImage('');
    setCustomImageUrl('');
    setStock('');
    setLowStockThreshold(5);
    setSku('');
    setUnit('1 kg Pack');
    setIsCustomUnit(false);
    setCustomUnitInput('');
    setTagsInput('');
    setIsPopular(false);
    setIsSpecial(false);
    setHasVariants(false);
    setVariants([]);
  }, [categories]);

  // Whenever modal opens, guarantee all previous inputs are completely cleared
  useEffect(() => {
    if (isAddProductOpen) {
      resetForm();
    }
  }, [isAddProductOpen, resetForm]);

  const handleClose = () => {
    resetForm();
    setIsAddProductOpen(false);
  };

  if (!isAddProductOpen) return null;

  // Handle local image file upload & optimize
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsProcessingImage(true);
      const optimizedUrl = await optimizeProductImage(file);
      setImage(optimizedUrl);
      setCustomImageUrl('');
    } catch (err) {
      console.warn('Image optimization fallback:', err);
      const reader = new FileReader();
      reader.onload = (event) => {
        const dataUrl = event.target?.result as string;
        setImage(dataUrl);
        setCustomImageUrl('');
      };
      reader.readAsDataURL(file);
    } finally {
      setIsProcessingImage(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // If variants are enabled, ensure at least one variant is configured
    if (hasVariants) {
      if (variants.length === 0) {
        alert('অনুগ্রহ করে অন্তত একটি ওজন/সাইজের ভ্যারিয়েন্ট যোগ করুন।');
        return;
      }
    } else {
      if (!name || price === '' || stock === '') return;
    }

    let finalCategory = category;

    // If adding a new custom category
    if (isCreatingNewCat && newCategoryName.trim()) {
      const created = addCategory({
        name: newCategoryName.trim(),
        nameBn: newCategoryNameBn.trim() || undefined,
        icon: 'Sparkles',
      });
      finalCategory = created.id;
    }

    const finalImage = customImageUrl.trim() || image || '/favicon.png';
    const finalSku = sku.trim() || `ITEM-${Math.floor(1000 + Math.random() * 9000)}`;
    const parsedTags = tagsInput
      .split(',')
      .map(t => t.trim())
      .filter(Boolean);

    const finalUnit = isCustomUnit 
      ? (customUnitInput.trim() || 'Pack') 
      : (unit.trim() || 'Pack');

    const totalVariantStock = variants.reduce((sum, v) => sum + (Number(v.stock) || 0), 0);
    const minVariantPrice = variants.length > 0 ? Math.min(...variants.map(v => Number(v.price) || 0)) : 0;

    const finalPrice = hasVariants && variants.length > 0 
      ? (price !== '' ? Number(price) : minVariantPrice) 
      : Number(price);

    const finalStock = hasVariants && variants.length > 0 
      ? (stock !== '' ? Number(stock) : totalVariantStock) 
      : Number(stock);

    const finalCostPrice = costPrice !== '' 
      ? Number(costPrice) 
      : (hasVariants && variants[0]?.costPrice !== undefined ? variants[0].costPrice : undefined);

    addProduct({
      name: name.trim(),
      nameBn: nameBn.trim() || undefined,
      description: description.trim() || 'উন্নতমানের ১০০% খাঁটি ও নির্ভেজাল পণ্য।',
      price: finalPrice,
      costPrice: finalCostPrice,
      category: finalCategory,
      image: finalImage,
      stock: finalStock,
      lowStockThreshold: Number(lowStockThreshold) || 5,
      sku: finalSku,
      unit: finalUnit,
      variants: hasVariants && variants.length > 0 ? variants : undefined,
      tags: parsedTags,
      isPopular,
      isSpecial,
    });

    resetForm();
    setIsAddProductOpen(false);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-900/60 backdrop-blur-xs">
      <div 
        id="add-product-modal-container"
        className="bg-white rounded-t-3xl sm:rounded-3xl max-w-xl w-full max-h-[calc(100dvh-1rem)] sm:max-h-[92vh] flex flex-col overflow-hidden shadow-2xl border border-slate-200 animate-scale-in"
      >
        {/* Modal Header */}
        <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50 pt-safe sm:pt-4 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-600 to-orange-600 text-white flex items-center justify-center shadow-xs">
              <Plus className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">Add New Product / Item</h2>
              <p className="text-xs text-slate-500">নতুন পণ্য ও ক্যাটালগ আইটেম যুক্ত করুন</p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={resetForm}
              className="text-xs font-semibold text-slate-600 hover:text-amber-800 hover:bg-amber-50 border border-slate-200 px-2.5 py-1.5 rounded-xl transition-colors flex items-center gap-1 cursor-pointer"
              title="ইনপুট ফর্ম ফাঁকা করুন"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>রিসেট</span>
            </button>
            <button
              id="close-add-product-btn"
              onClick={handleClose}
              className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-5 space-y-4 flex-1 overflow-y-auto pb-[calc(2.5rem+env(safe-area-inset-bottom,0px))]">
          {/* Product Names */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Product Name (English) *
              </label>
              <input
                id="new-product-name"
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Pure Honey 500g"
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:bg-white focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                পণ্যের নাম (বাংলায়)
              </label>
              <input
                id="new-product-name-bn"
                type="text"
                value={nameBn}
                onChange={(e) => setNameBn(e.target.value)}
                placeholder="যেমন: সুন্দরবনের প্রাকৃতিক মধু ৫০০ গ্রাম"
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:bg-white focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
              />
            </div>
          </div>

          {/* Category Selector with Quick Add */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-bold text-slate-700">Category (ক্যাটাগরি) *</label>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsCreatingNewCat(!isCreatingNewCat)}
                  className="text-[11px] font-bold text-amber-600 hover:text-amber-700"
                >
                  {isCreatingNewCat ? '← তালিকা থেকে বেছে নিন' : '+ নতুন ক্যাটাগরি লিখুন'}
                </button>
                <span className="text-slate-300">|</span>
                <button
                  type="button"
                  onClick={() => setIsCategoryManagerOpen(true)}
                  className="text-[11px] font-semibold text-slate-600 hover:text-amber-800 flex items-center gap-1"
                >
                  <FolderPlus className="w-3 h-3" />
                  <span>ক্যাটাগরি ম্যানেজ</span>
                </button>
              </div>
            </div>

            {isCreatingNewCat ? (
              <div className="p-3 bg-amber-50/70 border border-amber-300 rounded-xl space-y-2">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <input
                    id="new-category-input"
                    type="text"
                    value={newCategoryName}
                    onChange={(e) => setNewCategoryName(e.target.value)}
                    placeholder="ক্যাটাগরি নাম (English) e.g. Honey"
                    className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-semibold focus:border-amber-500"
                    required
                  />
                  <input
                    type="text"
                    value={newCategoryNameBn}
                    onChange={(e) => setNewCategoryNameBn(e.target.value)}
                    placeholder="ক্যাটাগরি নাম (বাংলায়) যেমন: খাঁটি মধু ও ঘি 🍯"
                    className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-semibold focus:border-amber-500"
                  />
                </div>
              </div>
            ) : (
              <select
                id="new-product-category-select"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:bg-white focus:border-amber-500 font-semibold"
              >
                {categories
                  .filter(c => c.id !== 'all')
                  .map(cat => (
                    <option key={cat.id} value={cat.id}>
                      {cat.nameBn || cat.name} ({cat.name})
                    </option>
                  ))}
              </select>
            )}
          </div>

          {/* Multi-weight / Size Variants Configuration */}
          <ProductVariantEditor
            enabled={hasVariants}
            onToggleEnabled={(enabled) => {
              setHasVariants(enabled);
              if (enabled && variants.length === 0) {
                setVariants([
                  { id: `v-1-${Date.now()}`, unit: '২৫০ গ্রাম', price: price ? Math.round(Number(price) * 0.5) : 100, stock: 20, sku: `${sku || 'ITEM'}-250G` },
                  { id: `v-2-${Date.now()}`, unit: '৫০০ গ্রাম', price: price ? Number(price) : 190, stock: 25, sku: `${sku || 'ITEM'}-500G` },
                  { id: `v-3-${Date.now()}`, unit: '১ কেজি', price: price ? Math.round(Number(price) * 1.9) : 360, stock: 15, sku: `${sku || 'ITEM'}-1KG` },
                ]);
              }
            }}
            variants={variants}
            onChange={(newVariants) => {
              setVariants(newVariants);
              if (newVariants.length > 0) {
                const totalStock = newVariants.reduce((sum, v) => sum + (Number(v.stock) || 0), 0);
                setStock(totalStock);
                setPrice(newVariants[0].price);
              }
            }}
            currencySymbol="৳"
          />

          {/* Single Price & Stock Fields (Only active if multi-weight is off) */}
          {!hasVariants && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 bg-slate-50 p-3 rounded-2xl border border-slate-200/80">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1 flex items-center gap-1">
                  <DollarSign className="w-3 h-3 text-emerald-600" />
                  বিক্রয় মূল্য (৳) *
                </label>
                <input
                  id="new-product-price"
                  type="number"
                  min="0"
                  required
                  value={price}
                  onChange={(e) => setPrice(e.target.value === '' ? '' : Number(e.target.value))}
                  placeholder="250"
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm font-bold focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  ক্রয় মূল্য (৳)
                </label>
                <input
                  id="new-product-cost-price"
                  type="number"
                  min="0"
                  value={costPrice}
                  onChange={(e) => setCostPrice(e.target.value === '' ? '' : Number(e.target.value))}
                  placeholder="180"
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm font-bold focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1 flex items-center gap-1">
                  <Package className="w-3 h-3 text-blue-600" />
                  মজুদ স্টক *
                </label>
                <input
                  id="new-product-stock"
                  type="number"
                  min="0"
                  required
                  value={stock}
                  onChange={(e) => setStock(e.target.value === '' ? '' : Number(e.target.value))}
                  placeholder="30"
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm font-bold focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  লো স্টক এলার্ট
                </label>
                <input
                  id="new-product-low-stock"
                  type="number"
                  min="1"
                  value={lowStockThreshold}
                  onChange={(e) => setLowStockThreshold(e.target.value === '' ? '' : Number(e.target.value))}
                  placeholder="5"
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm font-bold focus:border-amber-500"
                />
              </div>
            </div>
          )}

          {/* Unit & SKU */}
          <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200/80 space-y-2">
            <div className="flex items-center justify-between">
              <label className="block text-[11px] font-bold text-slate-700">
                Unit / পরিমাপ ও সাইজ
              </label>

              <button
                type="button"
                onClick={() => {
                  setIsCustomUnit(!isCustomUnit);
                  if (!isCustomUnit && !customUnitInput) {
                    setCustomUnitInput(unit);
                  }
                }}
                className="text-[11px] font-bold text-amber-700 hover:text-amber-800 bg-white hover:bg-amber-100 px-2 py-0.5 rounded-lg border border-amber-300 transition-colors cursor-pointer"
              >
                {isCustomUnit ? '← ড্রপডাউন সিলেক্ট' : '✍️ কাস্টম পরিমাপ'}
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <div>
                {isCustomUnit ? (
                  <input
                    id="custom-unit-input"
                    type="text"
                    value={customUnitInput}
                    onChange={(e) => setCustomUnitInput(e.target.value)}
                    placeholder="যেমন: ৫০০ গ্রাম বয়াম, ১ লিটার, ১২ পিস"
                    className="w-full px-3 py-2 bg-white border border-amber-400 rounded-xl text-xs sm:text-sm focus:ring-1 focus:ring-amber-500 font-semibold"
                    autoFocus
                  />
                ) : (
                  <select
                    id="new-product-unit"
                    value={unit}
                    onChange={(e) => {
                      if (e.target.value === 'CUSTOM_OPTION') {
                        setIsCustomUnit(true);
                      } else {
                        setUnit(e.target.value);
                      }
                    }}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm focus:bg-white focus:border-amber-500 font-semibold"
                  >
                    <option value="100g Pack">100g Pack (১০০ গ্রাম প্যাকেট)</option>
                    <option value="200g Pack">200g Pack (২০০ গ্রাম প্যাকেট)</option>
                    <option value="250g Pack">250g Pack (২৫০ গ্রাম প্যাকেট)</option>
                    <option value="500g Pack">500g Pack (৫০০ গ্রাম প্যাকেট)</option>
                    <option value="1 kg Pack">1 kg Pack (১ কেজি প্যাকেট)</option>
                    <option value="2 kg Pack">2 kg Pack (২ কেজি)</option>
                    <option value="5 kg Bag">5 kg Bag (৫ কেজি)</option>
                    <option value="250ml Bottle">250ml Bottle (২৫০ মিলি বোতল)</option>
                    <option value="500ml Bottle">500ml Bottle (৫০০ মিলি বোতল)</option>
                    <option value="1 Liter Bottle">1 Liter Bottle (১ লিটার বোতল)</option>
                    <option value="5 Liter Can">5 Liter Can (৫ লিটার ক্যান)</option>
                    <option value="500g Jar">500g Jar (৫০০ গ্রাম জার)</option>
                    <option value="1 kg Jar">1 kg Jar (১ কেজি জার)</option>
                    <option value="Pcs">Pcs (পিস)</option>
                    <option value="CUSTOM_OPTION">✨ Customize / কাস্টম পরিমাপ...</option>
                  </select>
                )}
              </div>

              <div>
                <input
                  id="new-product-sku"
                  type="text"
                  value={sku}
                  onChange={(e) => setSku(e.target.value)}
                  placeholder="SKU / বারকোড কোড (ঐচ্ছিক)"
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm focus:border-amber-500"
                />
              </div>
            </div>
          </div>

          {/* Product Image Section: Upload from Device or Paste Link */}
          <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200/80">
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <ImageIcon className="w-4 h-4 text-amber-600" />
                <span>Product Image / পণ্যের ছবি</span>
              </label>
              {(image || customImageUrl) && (
                <button
                  type="button"
                  onClick={() => {
                    setImage('');
                    setCustomImageUrl('');
                  }}
                  className="text-[11px] font-bold text-rose-600 hover:text-rose-800"
                >
                  ছবি বাতিল করুন
                </button>
              )}
            </div>

            <div className="flex flex-col sm:flex-row gap-3 items-start">
              {/* Image Preview / File Dropzone */}
              <label className="relative w-28 h-28 sm:w-32 sm:h-32 rounded-2xl border-2 border-dashed border-slate-300 hover:border-amber-500 bg-white flex flex-col items-center justify-center overflow-hidden shrink-0 transition-colors group cursor-pointer shadow-2xs">
                {image ? (
                  <>
                    <img src={image} alt="Preview" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-[10px] font-bold text-center px-1">
                      ছবি পরিবর্তন করুন
                    </div>
                  </>
                ) : (
                  <div className="p-2 text-center flex flex-col items-center justify-center text-slate-400">
                    <Upload className="w-6 h-6 mb-1 text-slate-400 group-hover:text-amber-600 transition-colors" />
                    <span className="text-[11px] font-bold text-slate-700">ছবি আপলোড</span>
                    <span className="text-[9px] text-slate-400">ডিভাইস থেকে বাছুন</span>
                  </div>
                )}
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
              </label>

              {/* URL or Direct link option */}
              <div className="flex-1 space-y-2 w-full">
                <p className="text-xs text-slate-500">
                  আপনার মোবাইল বা কম্পিউটার থেকে সরাসরি ছবি আপলোড করুন, অথবা নিচের বক্সে যেকোনো ছবির অনলাইন লিঙ্ক পেস্ট করুন:
                </p>
                <div className="relative">
                  <ImageIcon className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    id="custom-image-url-input"
                    type="url"
                    value={customImageUrl}
                    onChange={(e) => {
                      setCustomImageUrl(e.target.value);
                      if (e.target.value) {
                        setImage(e.target.value);
                      }
                    }}
                    placeholder="https://... ছবির লিঙ্ক পেস্ট করুন"
                    className="w-full pl-9 pr-3 py-2 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm focus:border-amber-500"
                  />
                </div>
                {isProcessingImage && (
                  <span className="text-xs text-amber-600 font-medium">ছবি প্রসেস হচ্ছে...</span>
                )}
              </div>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Description / পণ্যের বিবরণ
            </label>
            <textarea
              id="new-product-description"
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="পণ্যের গুণাগুণ, খাঁটি হওয়ার নিশ্চয়তা ও প্যাকিং বিস্তারিত..."
              className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:bg-white focus:border-amber-500"
            />
          </div>

          {/* Special Badges: Popular & Special Offer */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
            <label 
              htmlFor="add-product-is-popular"
              className={`flex items-center gap-3 p-3 rounded-2xl border cursor-pointer transition-all select-none ${
                isPopular 
                  ? 'bg-amber-500/10 border-amber-500/40 text-amber-900 shadow-xs' 
                  : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
              }`}
            >
              <input
                id="add-product-is-popular"
                type="checkbox"
                checked={isPopular}
                onChange={(e) => setIsPopular(e.target.checked)}
                className="w-4 h-4 text-amber-600 rounded-md focus:ring-amber-500 border-slate-300"
              />
              <div>
                <span className="text-xs font-bold block">জনপ্রিয় পণ্য 🔥 (Popular Product)</span>
                <span className="text-[10px] text-slate-500">হোমপেজের একদম শীর্ষে &ldquo;জনপ্রিয় পণ্য&rdquo; তালিকায় থাকবে</span>
              </div>
            </label>

            <label 
              htmlFor="add-product-is-special"
              className={`flex items-center gap-3 p-3 rounded-2xl border cursor-pointer transition-all select-none ${
                isSpecial 
                  ? 'bg-amber-500/10 border-amber-500/40 text-amber-900 shadow-xs' 
                  : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
              }`}
            >
              <input
                id="add-product-is-special"
                type="checkbox"
                checked={isSpecial}
                onChange={(e) => setIsSpecial(e.target.checked)}
                className="w-4 h-4 text-amber-600 rounded-md focus:ring-amber-500 border-slate-300"
              />
              <div>
                <span className="text-xs font-bold block">স্পেশাল অফার ✨ (Special Offer)</span>
                <span className="text-[10px] text-slate-500">হোমপেজের শীর্ষে &ldquo;স্পেশাল অফার&rdquo; তালিকায় দেখাবে</span>
              </div>
            </label>
          </div>

          {/* Tags */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1">
              <Tag className="w-3.5 h-3.5 text-slate-400" />
              ট্যাগ / কিওয়ার্ডস (কমা দিয়ে লিখুন)
            </label>
            <input
              id="new-product-tags"
              type="text"
              value={tagsInput}
              onChange={(e) => setTagsInput(e.target.value)}
              placeholder="খাঁটি, অর্গানিক, কাঠের ঘানি, স্পেশাল"
              className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:bg-white focus:border-amber-500"
            />
          </div>

          {/* Modal Action Buttons */}
          <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2.5">
            <button
              id="cancel-add-product-btn"
              type="button"
              onClick={handleClose}
              className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs sm:text-sm font-semibold rounded-xl transition-colors cursor-pointer"
            >
              বাতিল
            </button>
            <button
              id="submit-add-product-btn"
              type="submit"
              className="px-6 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white text-xs sm:text-sm font-bold rounded-xl shadow-md transition-all cursor-pointer flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              <span>পণ্য সংরক্ষণ করুন</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
