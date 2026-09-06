import React, { useState } from 'react';
import { 
  X, 
  Plus, 
  Trash2, 
  FolderPlus, 
  Layers, 
  Sparkles, 
  Flame, 
  Check, 
  Edit3,
  ArrowUp,
  ArrowDown
} from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { Category } from '../types';

const PRESET_ICONS = [
  { id: 'Sparkles', label: 'Sparkles ✨', icon: '✨' },
  { id: 'Flame', label: 'Flame 🔥', icon: '🔥' },
  { id: 'Crown', label: 'Crown 👑', icon: '👑' },
  { id: 'Droplets', label: 'Droplets 🫒', icon: '🫒' },
  { id: 'Wheat', label: 'Grain 🌾', icon: '🌾' },
  { id: 'ShoppingBag', label: 'Bag 🛍️', icon: '🛍️' },
  { id: 'Package', label: 'Package 📦', icon: '📦' },
  { id: 'Gift', label: 'Gift 🎁', icon: '🎁' },
  { id: 'Layers', label: 'Layers 📑', icon: '📑' },
];

export const CategoryManagerModal: React.FC = () => {
  const { 
    isCategoryManagerOpen, 
    setIsCategoryManagerOpen, 
    categories, 
    addCategory, 
    updateCategory, 
    deleteCategory,
    products 
  } = useStore();

  const [isAddingNew, setIsAddingNew] = useState(false);
  const [newCatName, setNewCatName] = useState('');
  const [newCatNameBn, setNewCatNameBn] = useState('');
  const [selectedIcon, setSelectedIcon] = useState('Sparkles');

  // Editing state
  const [editingCatId, setEditingCatId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editNameBn, setEditNameBn] = useState('');
  const [editIcon, setEditIcon] = useState('Sparkles');

  if (!isCategoryManagerOpen) return null;

  const handleCreateCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName.trim()) return;

    addCategory({
      name: newCatName.trim(),
      nameBn: newCatNameBn.trim() || undefined,
      icon: selectedIcon,
    });

    setNewCatName('');
    setNewCatNameBn('');
    setIsAddingNew(false);
  };

  const handleStartEdit = (cat: Category) => {
    setEditingCatId(cat.id);
    setEditName(cat.name);
    setEditNameBn(cat.nameBn || '');
    setEditIcon(cat.icon || 'Sparkles');
  };

  const handleSaveEdit = (catId: string) => {
    if (!editName.trim()) return;
    updateCategory(catId, {
      name: editName.trim(),
      nameBn: editNameBn.trim() || undefined,
      icon: editIcon,
    });
    setEditingCatId(null);
  };

  const handleDeleteCategory = (catId: string, catName: string) => {
    const count = products.filter(p => p.category === catId).length;
    let confirmMsg = `আপনি কি "${catName}" ক্যাটাগরি মুছে ফেলতে চান?`;
    if (count > 0) {
      confirmMsg += `\nসতর্কতা: এই ক্যাটাগরিতে ${count}টি পণ্য রয়েছে।`;
    }
    if (window.confirm(confirmMsg)) {
      deleteCategory(catId);
    }
  };

  const handleMoveOrder = (idx: number, direction: 'up' | 'down') => {
    const list = [...categories];
    const targetIdx = direction === 'up' ? idx - 1 : idx + 1;
    if (targetIdx < 0 || targetIdx >= list.length) return;

    const current = list[idx];
    const target = list[targetIdx];

    const currentOrder = current.order || idx + 1;
    const targetOrder = target.order || targetIdx + 1;

    updateCategory(current.id, { order: targetOrder });
    updateCategory(target.id, { order: currentOrder });
  };

  const regularCategories = categories.filter(c => c.id !== 'all');

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-900/60 backdrop-blur-xs">
      <div 
        id="category-manager-modal"
        className="bg-white rounded-t-3xl sm:rounded-3xl max-w-lg w-full max-h-[calc(100dvh-1rem)] sm:max-h-[90vh] flex flex-col overflow-hidden shadow-2xl border border-slate-200 animate-scale-in"
      >
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50 pt-safe sm:pt-4 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-500 text-white flex items-center justify-center shadow-xs">
              <FolderPlus className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">Category Management</h2>
              <p className="text-xs text-slate-500">আপনার পছন্দমতো ক্যাটাগরি তৈরি, এডিট ও মুছুন</p>
            </div>
          </div>

          <button
            id="close-category-manager-btn"
            onClick={() => setIsCategoryManagerOpen(false)}
            className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-5 flex-1 overflow-y-auto space-y-4">
          {/* Add Category Trigger / Form */}
          {!isAddingNew ? (
            <button
              id="open-add-category-form-btn"
              type="button"
              onClick={() => setIsAddingNew(true)}
              className="w-full py-3 px-4 bg-gradient-to-r from-amber-50 to-orange-50 hover:from-amber-100 hover:to-orange-100 text-amber-900 rounded-2xl border-2 border-dashed border-amber-300 font-bold text-sm flex items-center justify-center gap-2 transition-all cursor-pointer shadow-2xs"
            >
              <Plus className="w-4 h-4 text-amber-700" />
              <span>+ নতুন ক্যাটাগরি তৈরি করুন</span>
            </button>
          ) : (
            <form onSubmit={handleCreateCategory} className="p-4 bg-amber-50/70 border border-amber-200 rounded-2xl space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-amber-900 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                  নতুন ক্যাটাগরি তথ্য
                </span>
                <button
                  type="button"
                  onClick={() => setIsAddingNew(false)}
                  className="text-xs text-slate-500 hover:text-slate-800 font-semibold"
                >
                  বাতিল
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    ক্যাটাগরির নাম (English) *
                  </label>
                  <input
                    type="text"
                    required
                    value={newCatName}
                    onChange={(e) => setNewCatName(e.target.value)}
                    placeholder="e.g. Pure Honey, Bakery, Combos"
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold focus:border-amber-500 focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    ক্যাটাগরির নাম (বাংলায়)
                  </label>
                  <input
                    type="text"
                    value={newCatNameBn}
                    onChange={(e) => setNewCatNameBn(e.target.value)}
                    placeholder="যেমন: খাঁটি মধু ও ঘি 🍯"
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold focus:border-amber-500 focus:outline-hidden"
                  />
                </div>
              </div>

              {/* Icon selector */}
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  আইকন সিলেক্ট করুন
                </label>
                <div className="flex items-center gap-1.5 flex-wrap">
                  {PRESET_ICONS.map(item => (
                    <button
                      type="button"
                      key={item.id}
                      onClick={() => setSelectedIcon(item.id)}
                      className={`px-2.5 py-1.5 rounded-xl text-xs font-semibold border flex items-center gap-1 transition-all ${
                        selectedIcon === item.id
                          ? 'bg-amber-500 text-white border-amber-600 shadow-xs'
                          : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      <span>{item.icon}</span>
                      <span>{item.label.split(' ')[0]}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-1 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddingNew(false)}
                  className="px-3 py-1.5 text-xs font-semibold text-slate-600 bg-white border border-slate-200 rounded-xl hover:bg-slate-50"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs font-bold text-white bg-amber-600 hover:bg-amber-700 rounded-xl shadow-xs transition-colors"
                >
                  যোগ করুন
                </button>
              </div>
            </form>
          )}

          {/* Existing Categories List */}
          <div className="space-y-2">
            <h3 className="text-xs font-bold text-slate-700 flex items-center justify-between">
              <span>বিদ্যমান ক্যাটাগরি সমূহ ({regularCategories.length}টি)</span>
              <span className="text-[10px] text-slate-500 font-normal">ক্রম ও নাম পরিবর্তন বা মুছতে পারবেন</span>
            </h3>

            {regularCategories.map((cat, idx) => {
              const count = products.filter(p => p.category === cat.id).length;
              const isEditing = editingCatId === cat.id;

              if (isEditing) {
                return (
                  <div key={cat.id} className="p-3 bg-slate-50 border-2 border-amber-400 rounded-2xl space-y-2.5">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <input
                        type="text"
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        placeholder="English Name"
                        className="px-2.5 py-1.5 bg-white border border-slate-300 rounded-xl text-xs font-semibold"
                      />
                      <input
                        type="text"
                        value={editNameBn}
                        onChange={(e) => setEditNameBn(e.target.value)}
                        placeholder="বাংলা নাম"
                        className="px-2.5 py-1.5 bg-white border border-slate-300 rounded-xl text-xs font-semibold"
                      />
                    </div>
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        type="button"
                        onClick={() => setEditingCatId(null)}
                        className="px-2.5 py-1 text-xs text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-100"
                      >
                        বাতিল
                      </button>
                      <button
                        type="button"
                        onClick={() => handleSaveEdit(cat.id)}
                        className="px-3 py-1 text-xs font-bold text-white bg-amber-600 hover:bg-amber-700 rounded-lg shadow-xs"
                      >
                        সংরক্ষণ করুন
                      </button>
                    </div>
                  </div>
                );
              }

              return (
                <div 
                  key={cat.id} 
                  className="flex items-center justify-between p-3 bg-white hover:bg-slate-50 border border-slate-200 rounded-2xl transition-colors shadow-2xs group"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-8 h-8 rounded-xl bg-amber-100/70 text-amber-800 flex items-center justify-center font-bold text-sm shrink-0">
                      {PRESET_ICONS.find(i => i.id === cat.icon)?.icon || '📑'}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-xs sm:text-sm font-bold text-slate-900 truncate">
                          {cat.nameBn || cat.name}
                        </span>
                        {cat.nameBn && (
                          <span className="text-[11px] text-slate-400 font-normal truncate hidden sm:inline">
                            ({cat.name})
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] text-slate-500">
                        {count}টি পণ্য তালিকাভুক্ত
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    {/* Move up / down */}
                    <button
                      type="button"
                      disabled={idx === 0}
                      onClick={() => handleMoveOrder(idx + 1, 'up')}
                      className="p-1.5 text-slate-400 hover:text-slate-700 disabled:opacity-30 rounded-lg hover:bg-slate-100"
                      title="উপরে নিন"
                    >
                      <ArrowUp className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      disabled={idx === regularCategories.length - 1}
                      onClick={() => handleMoveOrder(idx + 1, 'down')}
                      className="p-1.5 text-slate-400 hover:text-slate-700 disabled:opacity-30 rounded-lg hover:bg-slate-100"
                      title="নিচে নিন"
                    >
                      <ArrowDown className="w-3.5 h-3.5" />
                    </button>

                    {/* Edit */}
                    <button
                      type="button"
                      onClick={() => handleStartEdit(cat)}
                      className="p-1.5 text-slate-500 hover:text-amber-700 hover:bg-amber-50 rounded-lg transition-colors"
                      title="এডিট করুন"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>

                    {/* Delete */}
                    <button
                      type="button"
                      onClick={() => handleDeleteCategory(cat.id, cat.nameBn || cat.name)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                      title="ক্যাটাগরি মুছুন"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-slate-200 bg-slate-50 flex items-center justify-between pb-safe sm:pb-3">
          <span className="text-xs text-slate-500">
            পরিবর্তনসমূহ রিয়েল-টাইমে ক্লাউডে সংরক্ষিত হবে
          </span>
          <button
            type="button"
            onClick={() => setIsCategoryManagerOpen(false)}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-bold transition-colors"
          >
            সম্পন্ন
          </button>
        </div>
      </div>
    </div>
  );
};
