import React, { useState } from 'react';
import { 
  ClipboardList, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  Printer, 
  ChefHat, 
  Package, 
  RotateCcw, 
  MapPin, 
  QrCode, 
  Settings, 
  Search, 
  Phone, 
  X,
  Sparkles
} from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { Order, OrderStatus } from '../types';
import { 
  formatOrderDateTime, 
  getOrderDuration, 
  getRelativeElapsed 
} from '../utils/dateFormatter';

export const OrderManager: React.FC = () => {
  const { orders, updateOrderStatus, settings, setIsSettingsOpen } = useStore();
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'completed' | 'cancelled'>('active');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const filteredOrders = orders.filter(order => {
    // Status Filter
    if (statusFilter === 'active') {
      if (!(order.status === 'pending' || order.status === 'preparing' || order.status === 'ready')) {
        return false;
      }
    } else if (statusFilter === 'completed') {
      if (order.status !== 'completed') return false;
    } else if (statusFilter === 'cancelled') {
      if (order.status !== 'cancelled') return false;
    }

    // Search Query Filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      const matchNumber = order.orderNumber?.toLowerCase().includes(q);
      const matchName = order.customerName?.toLowerCase().includes(q);
      const matchPhone = order.customerPhone?.toLowerCase().includes(q);
      const matchTrx = order.transactionId?.toLowerCase().includes(q);
      return matchNumber || matchName || matchPhone || matchTrx;
    }

    return true;
  });

  const getStatusBadge = (status: OrderStatus) => {
    switch (status) {
      case 'pending':
        return (
          <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 flex items-center gap-1 shadow-xs border border-amber-200">
            <Clock className="w-3 h-3 text-amber-700 animate-pulse" />
            <span>নতুন অর্ডার (Pending)</span>
          </span>
        );
      case 'preparing':
        return (
          <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-800 flex items-center gap-1 shadow-xs border border-blue-200">
            <ChefHat className="w-3 h-3 text-blue-700" />
            <span>তৈরি হচ্ছে (Preparing)</span>
          </span>
        );
      case 'ready':
        return (
          <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 flex items-center gap-1 shadow-xs border border-emerald-200">
            <Package className="w-3 h-3 text-emerald-700" />
            <span>রেডি (Ready)</span>
          </span>
        );
      case 'completed':
        return (
          <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-800 flex items-center gap-1 border border-slate-300">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            <span>সম্পন্ন (Completed)</span>
          </span>
        );
      case 'cancelled':
        return (
          <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-rose-100 text-rose-800 flex items-center gap-1 border border-rose-200">
            <AlertCircle className="w-3 h-3 text-rose-700" />
            <span>বাতিল (Cancelled)</span>
          </span>
        );
    }
  };

  const handlePrintOrder = (order: Order) => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      window.print();
      return;
    }

    const itemsHtml = order.items.map(item => `
      <tr>
        <td style="padding: 6px 0; border-bottom: 1px dashed #ddd;">${item.name} ${item.unit ? `(${item.unit})` : ''}</td>
        <td style="padding: 6px 0; border-bottom: 1px dashed #ddd; text-align: center;">${item.quantity}</td>
        <td style="padding: 6px 0; border-bottom: 1px dashed #ddd; text-align: right;">${settings.currencySymbol}${item.price * item.quantity}</td>
      </tr>
    `).join('');

    const completedHtml = order.completedAt ? `
      <p style="margin: 4px 0; color: #047857;"><strong>সম্পন্ন হওয়ার সময়:</strong> ${formatOrderDateTime(order.completedAt)}</p>
      <p style="margin: 4px 0; color: #047857;"><strong>মোট সময় লেগেছে:</strong> ${getOrderDuration(order.createdAt, order.completedAt)}</p>
    ` : '';

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Order Receipt #${order.orderNumber}</title>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; padding: 20px; max-width: 380px; margin: 0 auto; font-size: 13px; color: #1e293b; }
          .center { text-align: center; }
          .bold { font-weight: bold; }
          .divider { border-top: 1px dashed #94a3b8; margin: 12px 0; }
          table { width: 100%; border-collapse: collapse; }
        </style>
      </head>
      <body>
        <div class="center">
          <h2 style="margin: 0 0 4px 0;">${settings.storeName}</h2>
          <p style="margin: 0; font-size: 11px; color: #64748b;">${settings.tagline}</p>
          <p style="margin: 2px 0; font-size: 11px;">মোবাইল: ${settings.phone}</p>
          <div class="divider"></div>
          <h3 style="margin: 4px 0;">টোকেন নম্বর: #${order.orderNumber}</h3>
          <p style="margin: 0; font-size: 11px; color: #64748b;">স্ট্যাটাস: ${order.status.toUpperCase()}</p>
        </div>

        <div class="divider"></div>

        <p style="margin: 4px 0;"><strong>অর্ডার করার সময়:</strong> ${formatOrderDateTime(order.createdAt)}</p>
        ${completedHtml}
        <p style="margin: 4px 0;"><strong>গ্রাহক:</strong> ${order.customerName}</p>
        <p style="margin: 4px 0;"><strong>মোবাইল:</strong> ${order.customerPhone}</p>
        <p style="margin: 4px 0;"><strong>ডেলিভারি ধরন:</strong> ${order.orderType === 'dine_in' ? `Dine-In (${order.tableNumber})` : order.orderType === 'takeaway' ? 'শপ পিকআপ' : `হোম ডেলিভারি (${order.deliveryAddress || ''})`}</p>
        <p style="margin: 4px 0;"><strong>পেমেন্ট মাধ্যম:</strong> ${order.paymentMethod} ${order.transactionId ? `(TrxID: ${order.transactionId})` : ''}</p>

        <div class="divider"></div>

        <table>
          <thead>
            <tr style="border-bottom: 1px solid #000; text-align: left;">
              <th style="padding: 4px 0;">আইটেম</th>
              <th style="padding: 4px 0; text-align: center;">পরিমাণ</th>
              <th style="padding: 4px 0; text-align: right;">মূল্য</th>
            </tr>
          </thead>
          <tbody>
            ${itemsHtml}
          </tbody>
        </table>

        <div class="divider"></div>

        <div style="text-align: right;">
          <p style="margin: 2px 0;">সাবটোটাল: ${settings.currencySymbol}${order.subtotal}</p>
          ${order.deliveryFee ? `<p style="margin: 2px 0;">ডেলিভারি চার্জ: ${settings.currencySymbol}${order.deliveryFee}</p>` : ''}
          <h3 style="margin: 6px 0 0 0;">সর্বমোট: ${settings.currencySymbol}${order.total}</h3>
        </div>

        <div class="divider"></div>
        <p class="center" style="font-size: 11px; color: #64748b; margin-top: 15px;">আমাদের সেবা গ্রহণ করার জন্য ধন্যবাদ!</p>
      </body>
      </html>
    `);

    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
    }, 250);
  };

  return (
    <div id="order-manager-view" className="max-w-7xl mx-auto px-3 sm:px-6 py-4 space-y-5 pb-[calc(6rem+env(safe-area-inset-bottom,0px))] animate-fade-in">
      {/* Top Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 sm:p-5 rounded-3xl border border-slate-200/90 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-600 to-teal-700 text-white flex items-center justify-center shadow-md shadow-emerald-600/20 shrink-0">
            <ClipboardList className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg sm:text-xl font-black text-slate-900">
                অর্ডারসমূহ ও কিচেন কন্ট্রোল রুম
              </h1>
              <span className="hidden md:inline-flex items-center gap-1 text-[11px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 font-bold">
                <Sparkles className="w-3 h-3 text-emerald-600" />
                লাইভ ট্র্যাকিং
              </span>
            </div>
            <p className="text-xs text-slate-500">
              অর্ডার দেওয়ার সময় ও সম্পন্ন হওয়ার সময় স্বয়ংক্রিয়ভাবে সংরক্ষিত ও প্রদর্শিত হচ্ছে
            </p>
          </div>
        </div>

        {/* Action Controls & Settings */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            id="order-open-settings-btn"
            onClick={() => setIsSettingsOpen(true)}
            className="px-3 py-2 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200/90 text-xs font-bold rounded-2xl shadow-xs flex items-center gap-1.5 active:scale-95 transition-all"
            title="ফেভিকন আপলোড ও দোকান সেটিংস"
          >
            <Settings className="w-3.5 h-3.5 text-amber-600" />
            <span>ফেভিকন ও সেটিংস</span>
          </button>
        </div>
      </div>

      {/* Filter Switcher & Search Bar */}
      <div className="bg-white p-3 sm:p-4 rounded-3xl border border-slate-200/90 shadow-xs flex flex-col md:flex-row items-center justify-between gap-3">
        {/* Status Pills */}
        <div className="flex bg-slate-100 p-1 rounded-2xl border border-slate-200 text-xs font-semibold overflow-x-auto max-w-full w-full md:w-auto">
          <button
            id="order-filter-active-btn"
            onClick={() => setStatusFilter('active')}
            className={`px-3 py-1.5 rounded-xl whitespace-nowrap transition-all flex items-center gap-1.5 ${
              statusFilter === 'active' ? 'bg-white text-slate-900 shadow-xs font-bold' : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            <span>চলমান (Active)</span>
            <span className="w-5 h-5 rounded-full bg-amber-500 text-white text-[10px] flex items-center justify-center font-bold">
              {orders.filter(o => o.status === 'pending' || o.status === 'preparing' || o.status === 'ready').length}
            </span>
          </button>

          <button
            id="order-filter-completed-btn"
            onClick={() => setStatusFilter('completed')}
            className={`px-3 py-1.5 rounded-xl whitespace-nowrap transition-all flex items-center gap-1.5 ${
              statusFilter === 'completed' ? 'bg-white text-slate-900 shadow-xs font-bold' : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            <span>সম্পন্ন (Completed)</span>
            <span className="w-5 h-5 rounded-full bg-emerald-600 text-white text-[10px] flex items-center justify-center font-bold">
              {orders.filter(o => o.status === 'completed').length}
            </span>
          </button>

          <button
            id="order-filter-cancelled-btn"
            onClick={() => setStatusFilter('cancelled')}
            className={`px-3 py-1.5 rounded-xl whitespace-nowrap transition-all flex items-center gap-1.5 ${
              statusFilter === 'cancelled' ? 'bg-white text-slate-900 shadow-xs font-bold' : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            <span>বাতিল (Cancelled)</span>
            <span className="w-5 h-5 rounded-full bg-rose-500 text-white text-[10px] flex items-center justify-center font-bold">
              {orders.filter(o => o.status === 'cancelled').length}
            </span>
          </button>

          <button
            id="order-filter-all-btn"
            onClick={() => setStatusFilter('all')}
            className={`px-3 py-1.5 rounded-xl whitespace-nowrap transition-all flex items-center gap-1.5 ${
              statusFilter === 'all' ? 'bg-white text-slate-900 shadow-xs font-bold' : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            <span>সবগুলো (All)</span>
            <span className="w-5 h-5 rounded-full bg-slate-400 text-white text-[10px] flex items-center justify-center font-bold">
              {orders.length}
            </span>
          </button>
        </div>

        {/* Quick Search */}
        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            id="order-search-input"
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="টোকেন, নাম বা মোবাইল সার্চ..."
            className="w-full pl-9 pr-8 py-2 bg-slate-50 border border-slate-200 rounded-2xl text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all font-medium"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5 rounded-full"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Orders Grid */}
      {filteredOrders.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 flex flex-col items-center justify-center">
          <div className="w-16 h-16 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mb-3">
            <ClipboardList className="w-8 h-8" />
          </div>
          <h3 className="text-base font-bold text-slate-800">
            {searchQuery ? 'কোনো অর্ডার পাওয়া যায়নি' : 'এই তালিকায় কোনো অর্ডার নেই'}
          </h3>
          <p className="text-xs text-slate-500 max-w-sm mt-1">
            {searchQuery 
              ? 'আপনার সার্চ ফিল্টারের সাথে মিলে এমন কোনো অর্ডার নেই।' 
              : 'গ্রাহক বা অ্যাডমিন অর্ডার প্লেস করলে তা সাথে সাথে এখানে সময়সহ দৃশ্যমান হবে।'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredOrders.map((order) => {
            const hasCompleted = order.status === 'completed' || Boolean(order.completedAt);

            return (
              <div
                key={order.id}
                id={`order-card-${order.id}`}
                className="bg-white rounded-3xl border border-slate-200/90 shadow-xs p-4 sm:p-5 flex flex-col justify-between hover:shadow-md transition-all space-y-3 relative overflow-hidden"
              >
                <div>
                  {/* Order Top Header */}
                  <div className="flex items-start justify-between border-b border-slate-100 pb-3 gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-sm font-black text-slate-900 bg-slate-100 px-2 py-0.5 rounded-lg border border-slate-200">
                          #{order.orderNumber}
                        </span>
                      </div>
                      <h4 className="text-xs font-bold text-slate-800 mt-1.5">
                        {order.customerName}
                      </h4>
                      {order.customerPhone && (
                        <a 
                          href={`tel:${order.customerPhone}`}
                          className="text-[11px] text-amber-700 hover:text-amber-800 font-mono font-medium flex items-center gap-1 mt-0.5"
                          title="Call customer"
                        >
                          <Phone className="w-3 h-3" />
                          <span>{order.customerPhone}</span>
                        </a>
                      )}
                    </div>

                    <div className="flex flex-col items-end gap-1.5">
                      {getStatusBadge(order.status)}
                      <button
                        onClick={() => handlePrintOrder(order)}
                        className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors"
                        title="রশিদ প্রিন্ট করুন"
                      >
                        <Printer className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Order Timestamps (অর্ডার করার সময় & অর্ডার সম্পন্ন হওয়ার সময়) */}
                  <div className="bg-slate-50/90 border border-slate-200/90 rounded-2xl p-3 space-y-2 text-xs mt-3">
                    {/* 1. Placed At Time */}
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-1.5 text-slate-700 font-semibold shrink-0">
                        <Clock className="w-3.5 h-3.5 text-amber-600" />
                        <span>অর্ডার করার সময়:</span>
                      </div>
                      <div className="text-right">
                        <div className="font-bold font-mono text-slate-900 text-[11px]">
                          {formatOrderDateTime(order.createdAt)}
                        </div>
                        <div className="text-[10px] text-amber-800 font-medium">
                          {getRelativeElapsed(order.createdAt)}
                        </div>
                      </div>
                    </div>

                    {/* 2. Completed At Time */}
                    {hasCompleted ? (
                      <div className="pt-2 border-t border-slate-200/70 flex items-start justify-between gap-2 bg-emerald-50/70 -mx-3 -mb-3 p-2.5 rounded-b-2xl">
                        <div className="flex items-center gap-1.5 text-emerald-800 font-bold shrink-0">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                          <span>অর্ডার সম্পন্ন সময়:</span>
                        </div>
                        <div className="text-right">
                          <div className="font-bold font-mono text-emerald-950 text-[11px]">
                            {formatOrderDateTime(order.completedAt || order.createdAt)}
                          </div>
                          {order.completedAt && (
                            <div className="text-[10px] text-emerald-800 font-bold bg-white px-2 py-0.5 rounded-md border border-emerald-300 inline-block mt-0.5 shadow-xs">
                              সময় লেগেছে: {getOrderDuration(order.createdAt, order.completedAt)}
                            </div>
                          )}
                        </div>
                      </div>
                    ) : order.status === 'cancelled' ? (
                      <div className="pt-1.5 border-t border-slate-200/70 flex items-center justify-between text-[11px] text-rose-700 font-medium">
                        <span className="flex items-center gap-1">
                          <AlertCircle className="w-3.5 h-3.5 text-rose-600" />
                          অর্ডার বাতিল করা হয়েছে
                        </span>
                        <span className="text-[10px] text-rose-600">স্টক ফেরত দেওয়া হয়েছে</span>
                      </div>
                    ) : (
                      <div className="pt-1.5 border-t border-slate-200/70 flex items-center justify-between text-[11px] text-blue-700 font-medium">
                        <span className="flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                          প্রসেসিং চলছে
                        </span>
                        <span className="text-slate-500 text-[10px]">
                          চলমান সময়: {getRelativeElapsed(order.createdAt)}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Order Type and Delivery / Table info */}
                  <div className="py-2 flex items-center gap-2 text-xs text-slate-600 bg-slate-50 px-3 rounded-xl mt-2.5 border border-slate-200/50">
                    {order.orderType === 'dine_in' ? (
                      <>
                        <QrCode className="w-4 h-4 text-amber-600 shrink-0" />
                        <span className="font-bold text-slate-800">Dine-In • {order.tableNumber || 'Table'}</span>
                      </>
                    ) : order.orderType === 'takeaway' ? (
                      <>
                        <Package className="w-4 h-4 text-amber-600 shrink-0" />
                        <span className="font-bold text-slate-800">Takeaway (শপ পিকআপ)</span>
                      </>
                    ) : (
                      <>
                        <MapPin className="w-4 h-4 text-amber-600 shrink-0" />
                        <span className="truncate font-bold text-slate-800">
                          ডেলিভারি ঠিকানা: {order.deliveryAddress || 'Address specified'}
                        </span>
                      </>
                    )}
                  </div>

                  {/* Ordered Items */}
                  <div className="space-y-1.5 my-3">
                    {order.items.map((item, idx) => (
                      <div key={idx} className="flex justify-between text-xs text-slate-800">
                        <div className="flex items-center gap-1.5 min-w-0">
                          <span className="font-black text-amber-700 shrink-0">{item.quantity}×</span>
                          <span className="font-medium truncate">{item.name}</span>
                          {item.unit && (
                            <span className="text-[10px] text-amber-800 bg-amber-50 border border-amber-200 px-1 py-0.2 rounded font-semibold shrink-0">
                              {item.unit}
                            </span>
                          )}
                        </div>
                        <span className="font-semibold text-slate-700 shrink-0 ml-2">
                          {settings.currencySymbol}{item.price * item.quantity}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Cooking notes */}
                  {order.notes && (
                    <div className="p-2 bg-amber-50 rounded-xl text-[11px] text-amber-800 border border-amber-200/60 mb-2">
                      <span className="font-bold">নোট: </span>{order.notes}
                    </div>
                  )}

                  {/* Total & Payment */}
                  <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-100">
                    <div className="text-slate-600">
                      <span>পেমেন্ট: </span>
                      <span className="font-bold text-slate-900">
                        {order.paymentMethod === 'bkash' ? 'bKash' : 
                         order.paymentMethod === 'bangla_qr' ? 'Bangla QR' : 
                         order.paymentMethod === 'cash' ? 'Cash on Delivery' : order.paymentMethod}
                      </span>
                      {order.transactionId && (
                        <span className="ml-1.5 text-[10px] font-mono font-bold text-pink-700 bg-pink-50 border border-pink-200 px-1.5 py-0.2 rounded">
                          TrxID: {order.transactionId}
                        </span>
                      )}
                    </div>
                    <div className="text-sm font-black text-amber-700">
                      Total: {settings.currencySymbol}{order.total}
                    </div>
                  </div>
                </div>

                {/* Workflow Status Action Buttons */}
                <div className="pt-2 border-t border-slate-100 space-y-2">
                  {order.status === 'pending' && (
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={() => updateOrderStatus(order.id, 'preparing')}
                        className="py-2 px-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1 shadow-xs transition-colors active:scale-95"
                      >
                        <ChefHat className="w-3.5 h-3.5" />
                        <span>অর্ডার গ্রহণ (Accept)</span>
                      </button>

                      <button
                        onClick={() => {
                          if (confirm(`Cancel Order #${order.orderNumber}? (Stock will be automatically refunded to inventory)`)) {
                            updateOrderStatus(order.id, 'cancelled');
                          }
                        }}
                        className="py-2 px-3 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-xl text-xs font-bold flex items-center justify-center gap-1 transition-colors active:scale-95"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        <span>বাতিল ও রিফান্ড</span>
                      </button>
                    </div>
                  )}

                  {order.status === 'preparing' && (
                    <button
                      onClick={() => updateOrderStatus(order.id, 'ready')}
                      className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1 shadow-xs transition-colors active:scale-95"
                    >
                      <Package className="w-3.5 h-3.5" />
                      <span>ডেলিভারির জন্য রেডি করুন</span>
                    </button>
                  )}

                  {order.status === 'ready' && (
                    <button
                      onClick={() => updateOrderStatus(order.id, 'completed')}
                      className="w-full py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1 shadow-xs transition-colors active:scale-95"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                      <span>অর্ডার সম্পন্ন করুন (Complete Order)</span>
                    </button>
                  )}

                  {order.status === 'completed' && (
                    <div className="flex items-center justify-between py-1.5 px-3 text-xs text-emerald-800 font-bold bg-emerald-50 rounded-xl border border-emerald-200">
                      <span className="flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        <span>অর্ডার সফলভাবে সম্পন্ন</span>
                      </span>
                      <button
                        onClick={() => handlePrintOrder(order)}
                        className="text-[11px] text-emerald-700 hover:underline flex items-center gap-1"
                      >
                        <Printer className="w-3 h-3" />
                        <span>রশিদ প্রিন্ট</span>
                      </button>
                    </div>
                  )}

                  {order.status === 'cancelled' && (
                    <div className="text-center py-1.5 text-xs text-rose-700 font-bold bg-rose-50 rounded-xl border border-rose-200">
                      ✗ অর্ডার বাতিল করা হয়েছে • ইনভেন্টরি স্টক রিফান্ড হয়েছে
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
