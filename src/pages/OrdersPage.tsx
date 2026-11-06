/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { OrderItem, PaymentMethod } from '../types';
import { Icon3D } from '../components/icons3d/Icon3D';

export const OrdersPage: React.FC = () => {
  const {
    state,
    deleteOrder,
    deleteOrderItem,
    addOrderItemToOrder,
    toggleOrderFinished,
    registerItemSale,
    updateOrderItem,
    returnOrderItem,
    settleOrderItem,
    getOrderProfitImpact,
    createNewOrder,
    customers,
    addCustomer,
    liquidity,
    setCurrentPage,
  } = useApp();

  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(
    state.orders.length > 0 ? state.orders[0].id : null
  );

  // Collapsible inline create order form
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [formOrderCode, setFormOrderCode] = useState('');
  const [formNotes, setFormNotes] = useState('');
  const [formItems, setFormItems] = useState([
    { name: '', quantity: 1, costPrice: 0 },
  ]);

  // Quick sale modal for a specific item
  const [sellingItemInfo, setSellingItemInfo] = useState<{
    orderId: string;
    item: OrderItem;
  } | null>(null);
  const [salePrice, setSalePrice] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('نقدية (كاش)');
  const [paymentType, setPaymentType] = useState<'cash' | 'credit' | 'partial'>('cash');
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>('');
  const [partialPaidInput, setPartialPaidInput] = useState<string>('');
  const [showInlineNewCustomer, setShowInlineNewCustomer] = useState(false);
  const [inlineCustName, setInlineCustName] = useState('');
  const [inlineCustPhone, setInlineCustPhone] = useState('');

  // Edit item modal state
  const [editingItemInfo, setEditingItemInfo] = useState<{
    orderId: string;
    item: OrderItem;
  } | null>(null);
  const [editItemName, setEditItemName] = useState('');
  const [editItemCost, setEditItemCost] = useState('');
  const [editItemSoldPrice, setEditItemSoldPrice] = useState('');

  // Return item confirmation dialog
  const [returningItemInfo, setReturningItemInfo] = useState<{
    orderId: string;
    item: OrderItem;
    orderCode: string;
  } | null>(null);

  // Settle item confirmation dialog
  const [settlingItemInfo, setSettlingItemInfo] = useState<{
    orderId: string;
    item: OrderItem;
    orderCode: string;
  } | null>(null);

  // Delete order confirmation with financial impact breakdown
  const [deletingOrderId, setDeletingOrderId] = useState<string | null>(null);

  // Single item delete confirmation dialog
  const [deletingItemInfo, setDeletingItemInfo] = useState<{
    orderId: string;
    item: OrderItem;
    orderCode: string;
  } | null>(null);

  // Order status filter: all / open / finished
  const [orderFilter, setOrderFilter] = useState<'all' | 'open' | 'finished'>('all');

  // Add item modal state (clean, empty by default)
  const [addingItemOrderId, setAddingItemOrderId] = useState<string | null>(null);
  const [newItemName, setNewItemName] = useState('');
  const [newItemQuantity, setNewItemQuantity] = useState('');
  const [newItemCost, setNewItemCost] = useState('');

  const toggleExpand = (id: string) => {
    setExpandedOrderId(expandedOrderId === id ? null : id);
  };

  const handleConfirmDeleteItem = () => {
    if (!deletingItemInfo) return;
    deleteOrderItem(deletingItemInfo.orderId, deletingItemInfo.item.id);
    setDeletingItemInfo(null);
  };

  const handleSaveAddItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!addingItemOrderId || !newItemName.trim()) return;
    const qty = parseInt(newItemQuantity) || 1;
    const cost = parseFloat(newItemCost) || 0;
    addOrderItemToOrder(addingItemOrderId, {
      name: newItemName.trim(),
      quantity: qty,
      costPrice: cost,
    });
    setAddingItemOrderId(null);
    setNewItemName('');
    setNewItemQuantity('');
    setNewItemCost('');
  };

  const handleConfirmSale = (e: React.FormEvent) => {
    e.preventDefault();
    if (!sellingItemInfo || !salePrice) return;
    const price = parseFloat(salePrice);
    if (!price || price <= 0) return;

    if ((paymentType === 'credit' || paymentType === 'partial') && !selectedCustomerId) {
      alert('يرجى اختيار أو إضافة العميل للبيع الآجل أو الجزئي');
      return;
    }

    const totalDue = price * (sellingItemInfo.item.quantity || 1);
    const initialPaid = paymentType === 'cash'
      ? totalDue
      : paymentType === 'credit'
      ? 0
      : parseFloat(partialPaidInput) || 0;

    registerItemSale(
      sellingItemInfo.orderId,
      sellingItemInfo.item.id,
      price,
      paymentMethod,
      undefined,
      paymentType,
      selectedCustomerId || undefined,
      initialPaid
    );
    setSellingItemInfo(null);
    setSalePrice('');
    setPaymentType('cash');
    setSelectedCustomerId('');
    setPartialPaidInput('');
  };

  const handleCreateInlineCustomer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inlineCustName.trim()) return;
    const created = addCustomer(inlineCustName.trim(), inlineCustPhone.trim() || undefined);
    setSelectedCustomerId(created.id);
    setInlineCustName('');
    setInlineCustPhone('');
    setShowInlineNewCustomer(false);
  };

  const openEditModal = (orderId: string, item: OrderItem) => {
    setEditingItemInfo({ orderId, item });
    setEditItemName(item.name);
    setEditItemCost(item.costPrice.toString());
    setEditItemSoldPrice(item.soldPrice !== undefined ? item.soldPrice.toString() : '');
  };

  const handleSaveEditItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItemInfo || !editItemName.trim()) return;
    const cost = parseFloat(editItemCost) || 0;
    const updates: Partial<OrderItem> = {
      name: editItemName.trim(),
      costPrice: cost,
    };
    if (editingItemInfo.item.isSold && editItemSoldPrice) {
      updates.soldPrice = parseFloat(editItemSoldPrice) || 0;
    }
    updateOrderItem(editingItemInfo.orderId, editingItemInfo.item.id, updates);
    setEditingItemInfo(null);
  };

  const handleConfirmReturn = () => {
    if (!returningItemInfo) return;
    returnOrderItem(returningItemInfo.orderId, returningItemInfo.item.id);
    setReturningItemInfo(null);
  };

  const handleConfirmSettle = () => {
    if (!settlingItemInfo) return;
    settleOrderItem(settlingItemInfo.orderId, settlingItemInfo.item.id);
    setSettlingItemInfo(null);
  };

  const handleConfirmDeleteOrder = () => {
    if (!deletingOrderId) return;
    deleteOrder(deletingOrderId);
    setDeletingOrderId(null);
  };

  const handleCreateOrderSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const valid = formItems.filter((it) => it.name.trim() !== '' && it.costPrice > 0);
    if (valid.length === 0) return;

    createNewOrder(formOrderCode.trim() || '', valid, formNotes || undefined);
    setFormOrderCode('');
    setFormNotes('');
    setFormItems([{ name: '', quantity: 1, costPrice: 0 }]);
    setShowCreateForm(false);
  };

  const deleteImpact = deletingOrderId ? getOrderProfitImpact(deletingOrderId) : null;
  const deletingOrderObj = deletingOrderId ? state.orders.find((o) => o.id === deletingOrderId) : null;

  const displayedOrders = state.orders.filter((order) => {
    if (orderFilter === 'open') return !order.isFinished;
    if (orderFilter === 'finished') return !!order.isFinished;
    return true;
  });

  return (
    <div className="w-full flex flex-col gap-[13px] text-[#1F1A2E] dark:text-[#F4F0FA]">
      {/* 1. كارت اسم الصفحة: بنفسجي متدرج، ارتفاع 52px */}
      <div className="card-header-purple flex items-center justify-between">
        <span className="text-[18px] font-[800] text-white leading-none whitespace-nowrap">
          سجل الأوردرات
        </span>

        <div className="flex items-center gap-[8px]">
          <button
            onClick={() => setShowCreateForm(!showCreateForm)}
            className="h-[26px] px-[10px] rounded-full bg-[#2F7F5F] hover:bg-[#25664C] text-white text-[12px] font-[700] flex items-center gap-1 flex-none shadow-sm cursor-pointer"
          >
            <span className="text-[12px] leading-none">{showCreateForm ? '✕' : '＋'}</span>
            <span>أوردر جديد</span>
          </button>

          <button
            onClick={() => setCurrentPage('entry')}
            className="btn-back-transparent"
            title="رجوع للرئيسية"
          >
            ➜
          </button>
        </div>
      </div>

      {/* 2. فلترة الأوردرات: كل الأوردرات / الأوردرات المفتوحة / الأوردرات المنتهية */}
      <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-white dark:bg-[#211A2D] border border-[#D4D0E0] dark:border-[#3A3150] shadow-2xs text-[11px] font-bold">
        {[
          { id: 'all', label: `كل الأوردرات (${state.orders.length})` },
          { id: 'open', label: `الأوردرات المفتوحة (${state.orders.filter((o) => !o.isFinished).length})` },
          { id: 'finished', label: `الأوردرات المنتهية (${state.orders.filter((o) => !!o.isFinished).length})` },
        ].map((pill) => (
          <button
            key={pill.id}
            type="button"
            onClick={() => setOrderFilter(pill.id as any)}
            className={`flex-1 py-1.5 rounded-xl transition cursor-pointer text-center whitespace-nowrap ${
              orderFilter === pill.id
                ? 'bg-[#5F2967] text-white shadow-xs'
                : 'text-[#666079] dark:text-[#9E97B0] hover:text-[#1F1A2E] dark:hover:text-[#F4F0FA]'
            }`}
          >
            {pill.label}
          </button>
        ))}
      </div>

      {/* Collapsible Create Order Section */}
      {showCreateForm && (
        <form
          onSubmit={handleCreateOrderSubmit}
          className="card-main p-4 space-y-3 text-xs"
        >
          <div className="flex items-center justify-between pb-1.5 border-b border-[#D4D0E0] dark:border-[#3A3150]">
            <span className="font-extrabold text-[#5F2967] dark:text-[#D8B4FE]">
              إنشاء أوردر تسلسلي جديد
            </span>
            <span className="text-[10px] text-[#2F7F5F] dark:text-[#4BA682] font-bold bg-[#E3F2EA] dark:bg-[#162E23] px-2 py-0.5 rounded-full tabular-nums">
              السيولة: {liquidity.toLocaleString('en-US')} {state.settings.currency}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <input
              type="text"
              placeholder={`أوردر رقم ${state.orderCounter || state.orders.length + 1}`}
              value={formOrderCode}
              onChange={(e) => setFormOrderCode(e.target.value)}
              className="px-3 py-1.5 rounded-xl border border-[#ECECF4] dark:border-[#32263F] bg-[#F1F1FA] dark:bg-[#17101D] font-bold outline-none focus:border-[#5F2967]"
            />
            <input
              type="text"
              placeholder="ملاحظات اختيارية..."
              value={formNotes}
              onChange={(e) => setFormNotes(e.target.value)}
              className="px-3 py-1.5 rounded-xl border border-[#ECECF4] dark:border-[#32263F] bg-[#F1F1FA] dark:bg-[#17101D] outline-none"
            />
          </div>

          <div className="space-y-1.5">
            {formItems.map((item, idx) => (
              <div key={idx} className="flex items-center gap-1.5">
                <input
                  type="text"
                  required
                  placeholder="اسم الصنف / الموديل..."
                  value={item.name}
                  onChange={(e) => {
                    const c = [...formItems];
                    c[idx].name = e.target.value;
                    setFormItems(c);
                  }}
                  className="flex-1 px-3 py-1.5 rounded-xl border border-[#ECECF4] dark:border-[#32263F] bg-[#F1F1FA] dark:bg-[#17101D] text-xs font-bold outline-none"
                />
                <input
                  type="number"
                  min="1"
                  placeholder="العدد"
                  value={item.quantity}
                  onChange={(e) => {
                    const c = [...formItems];
                    c[idx].quantity = parseInt(e.target.value) || 1;
                    setFormItems(c);
                  }}
                  className="w-16 px-1.5 py-1.5 rounded-xl border border-[#ECECF4] dark:border-[#32263F] bg-[#F1F1FA] dark:bg-[#17101D] text-center font-bold outline-none"
                />
                <input
                  type="number"
                  step="0.01"
                  required
                  placeholder="سعر التكلفة"
                  value={item.costPrice || ''}
                  onChange={(e) => {
                    const c = [...formItems];
                    c[idx].costPrice = parseFloat(e.target.value) || 0;
                    setFormItems(c);
                  }}
                  className="w-24 px-2 py-1.5 rounded-xl border border-[#ECECF4] dark:border-[#32263F] bg-[#F1F1FA] dark:bg-[#17101D] text-center font-black text-[#5F2967] dark:text-[#9B67A4] outline-none"
                />
              </div>
            ))}
          </div>

          <div className="flex gap-2 pt-1">
            <button
              type="button"
              onClick={() => setFormItems([...formItems, { name: '', quantity: 1, costPrice: 0 }])}
              className="px-3 py-1.5 rounded-xl bg-purple-50 dark:bg-purple-950/60 text-[#5F2967] dark:text-[#9B67A4] font-bold text-xs transition cursor-pointer"
            >
              + إضافة صنف
            </button>
            <button
              type="submit"
              className="flex-1 py-1.5 rounded-xl bg-[#5F2967] hover:bg-[#4A1E52] text-white font-black text-xs transition cursor-pointer shadow-xs"
            >
              حفظ الأوردر
            </button>
          </div>
        </form>
      )}

      {/* Orders Cards List */}
      {displayedOrders.length === 0 ? (
        <div className="py-10 text-center border border-dashed border-[#ECECF4] dark:border-[#32263F] rounded-3xl bg-white dark:bg-[#231A2C] p-6">
          <p className="text-xs text-[#9A98B0]">
            {orderFilter === 'finished'
              ? 'لا توجد أوردرات منتهية حالياً'
              : orderFilter === 'open'
              ? 'لا توجد أوردرات مفتوحة حالياً'
              : 'لا توجد أوردرات مسجلة حالياً'}
          </p>
        </div>
      ) : (
        <div className="w-full flex flex-col gap-[13px]">
          {displayedOrders.map((order) => {
            const isExpanded = expandedOrderId === order.id;
            const itemsCost = order.items.reduce((s, it) => s + it.costPrice * it.quantity, 0);
            const totalCost = itemsCost + (order.additionalBagCost || 0);
            const soldItems = order.items.filter((it) => it.isSold);
            const totalSold = soldItems.reduce((s, it) => s + (it.soldPrice || 0) * it.quantity, 0);
            const netProfit = totalSold - totalCost;
            const isAllSold = order.items.length > 0 && order.items.every((it) => it.isSold);
            const status: 'مقفول' | 'خسارة' | 'مفتوح' =
              isAllSold
                ? netProfit >= 0
                  ? 'مقفول'
                  : 'خسارة'
                : 'مفتوح';

            return (
              <div
                key={order.id}
                className={`card-main overflow-hidden transition-all ${
                  order.isFinished
                    ? 'border-2 border-slate-300 dark:border-slate-700/80 bg-slate-50/40 dark:bg-[#1D1726]'
                    : ''
                }`}
              >
                {/* Compact Card Header: min-h 50px */}
                <div
                  onClick={() => toggleExpand(order.id)}
                  className="min-h-[50px] px-[15px] py-[8px] flex items-center justify-between gap-2.5 cursor-pointer select-none"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-[800] text-[14px] text-[#1F1A2E] dark:text-[#F4F0FA] truncate leading-tight">
                        {order.code}
                      </h3>
                      {order.isFinished ? (
                        <span className="text-[10px] font-[800] px-2 py-0.5 rounded-full inline-flex items-center gap-1 leading-none bg-[#E2E8F0] dark:bg-[#2A2438] text-[#475569] dark:text-[#CBD5E1] border border-[#CBD5E1] dark:border-[#475569]">
                          <span>✓</span>
                          <span>منتهي</span>
                        </span>
                      ) : (
                        <span
                          className={`text-[10px] font-[700] px-2 py-0.5 rounded-full inline-flex items-center leading-none ${
                            status === 'مقفول'
                              ? 'bg-[#E3F2EA] dark:bg-[#162E23] text-[#2F7F5F] dark:text-[#4BA682]'
                              : status === 'خسارة'
                              ? 'bg-[#F8E6EC] dark:bg-[#381B26] text-[#A23B5A] dark:text-[#FB7185]'
                              : 'bg-[#F1E8F4] dark:bg-[#2D1F35] text-[#5F2967] dark:text-[#D8B4FE]'
                          }`}
                        >
                          {status} ({soldItems.length}/{order.items.length})
                        </span>
                      )}
                    </div>
                    {/* تاریخ إنشاء الأوردر فقط */}
                    <span className="text-[10px] font-[400] text-[#666079] dark:text-[#9E97B0] block mt-0.5 leading-tight">
                      تاريخ الإنشاء: {order.date}
                    </span>
                  </div>

                  {/* Summary Metrics */}
                  <div className="flex items-center gap-[10px] text-center shrink-0">
                    <div>
                      <span className="text-[11px] font-[600] text-[#666079] dark:text-[#9E97B0] block leading-tight">التكلفة</span>
                      <span className="text-[12px] font-[700] text-[#1F1A2E] dark:text-[#F4F0FA] tabular-nums block leading-tight">
                        {totalCost.toLocaleString('en-US')}
                      </span>
                    </div>
                    <div>
                      <span className="text-[11px] font-[600] text-[#666079] dark:text-[#9E97B0] block leading-tight">المبيعات</span>
                      <span className="text-[12px] font-[700] text-[#5F2967] dark:text-[#D8B4FE] tabular-nums block leading-tight">
                        {totalSold.toLocaleString('en-US')}
                      </span>
                    </div>
                    <div>
                      <span className="text-[11px] font-[600] text-[#666079] dark:text-[#9E97B0] block leading-tight">الربح</span>
                      <span
                        className={`text-[12px] font-[700] tabular-nums block leading-tight ${
                          netProfit >= 0 ? 'text-[#2F7F5F] dark:text-[#4BA682]' : 'text-[#A23B5A] dark:text-[#FB7185]'
                        }`}
                      >
                        {netProfit > 0 ? `+${netProfit.toLocaleString('en-US')}` : netProfit.toLocaleString('en-US')}
                      </span>
                    </div>
                    <div className="text-[#666079] dark:text-[#9E97B0]">
                      <Icon3D name={isExpanded ? 'chevron_up' : 'chevron_down'} size={16} />
                    </div>
                  </div>
                </div>

                {/* Expanded Items with spaced lines (Cost: red, Sold: blue, Profit: green) */}
                {isExpanded && (
                  <div className="border-t border-[#ECECF4] dark:border-[#32263F] p-3 bg-[#F1F1FA]/50 dark:bg-[#17101D]/50 space-y-2 text-xs">
                    <div className="space-y-1.5">
                      {order.items.map((it) => {
                        const itemCostTotal = it.costPrice * (it.quantity || 1);
                        const itemSoldTotal = it.isSold && it.soldPrice !== undefined ? it.soldPrice * (it.quantity || 1) : null;
                        const itemProfit = itemSoldTotal !== null ? itemSoldTotal - itemCostTotal : null;

                        return (
                          <div
                            key={it.id}
                            className="p-2.5 rounded-2xl bg-white dark:bg-[#231A2C] border border-[#ECECF4] dark:border-[#32263F] space-y-2 shadow-2xs"
                          >
                            <div className="flex items-center justify-between gap-2">
                              <div className="flex items-center gap-1.5 min-w-0">
                                <span className="font-black text-[#2B2340] dark:text-white text-xs truncate">
                                  {it.name}
                                </span>
                                <span className="text-[10px] text-[#9A98B0]">
                                  ({it.quantity} قطعة{it.size ? ` - مقاس ${it.size}` : ''})
                                </span>
                                {it.isSettled && (
                                  <span className="text-[9px] px-1.5 py-0.2 rounded-md bg-amber-500/15 text-amber-600 font-bold">
                                    مُسوّى
                                  </span>
                                )}
                              </div>

                              {/* Action Buttons for this item */}
                              <div className="flex items-center gap-1 shrink-0">
                                <button
                                  onClick={() =>
                                    setDeletingItemInfo({
                                      orderId: order.id,
                                      item: it,
                                      orderCode: order.code,
                                    })
                                  }
                                  className="p-1 text-slate-400 hover:text-rose-500 transition cursor-pointer"
                                  title="حذف الصنف"
                                >
                                  <Icon3D name="trash" size={14} />
                                </button>

                                <button
                                  onClick={() => openEditModal(order.id, it)}
                                  className="p-1 text-slate-400 hover:text-blue-500 transition cursor-pointer"
                                  title="تعديل الصنف"
                                >
                                  <Icon3D name="edit" size={14} />
                                </button>

                                {it.isSold ? (
                                  <button
                                    onClick={() =>
                                      setReturningItemInfo({
                                        orderId: order.id,
                                        item: it,
                                        orderCode: order.code,
                                      })
                                    }
                                    className="px-2 py-0.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-[#E2574C] font-bold text-[10px] transition cursor-pointer"
                                    title="ارتجاع الصنف بعد البيع"
                                  >
                                    ارتجاع
                                  </button>
                                ) : (
                                  <>
                                    <button
                                      onClick={() =>
                                        setSettlingItemInfo({
                                          orderId: order.id,
                                          item: it,
                                          orderCode: order.code,
                                        })
                                      }
                                      className="px-2 py-0.5 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-700 font-bold text-[10px] transition cursor-pointer"
                                      title="تسوية الصنف بالتكلفة"
                                    >
                                      تسوية
                                    </button>
                                    <button
                                      onClick={() => {
                                        setSellingItemInfo({ orderId: order.id, item: it });
                                        setSalePrice('');
                                        setPaymentType('cash');
                                        setSelectedCustomerId('');
                                        setPartialPaidInput('');
                                        setShowInlineNewCustomer(false);
                                      }}
                                      className="px-2.5 py-1 rounded-lg bg-[#5F2967] hover:bg-[#4A1E52] text-white font-bold text-[10px] active:scale-95 transition cursor-pointer"
                                    >
                                      تسجيل بيع
                                    </button>
                                  </>
                                )}
                              </div>
                            </div>

                            {/* Spaced lines: Cost (Red), Sold (Blue), Profit (Green) */}
                            <div className="grid grid-cols-3 gap-1 pt-1 border-t border-[#ECECF4] dark:border-[#32263F] text-[11px]">
                              <div>
                                <span className="text-[9px] text-[#9A98B0] block">سعر التكلفة</span>
                                <strong className="text-[#E2574C] font-black tabular-nums">
                                  {it.costPrice} {state.settings.currency}
                                </strong>
                              </div>
                              <div>
                                <span className="text-[9px] text-[#9A98B0] block">سعر البيع</span>
                                <strong className="text-[#3B9AC4] font-black tabular-nums">
                                  {it.isSold && it.soldPrice !== undefined
                                    ? `${it.soldPrice} ${state.settings.currency}`
                                    : 'لم يُبع'}
                                </strong>
                              </div>
                              <div>
                                <span className="text-[9px] text-[#9A98B0] block">صافي الربح</span>
                                <strong
                                  className={`font-black tabular-nums ${
                                    itemProfit !== null && itemProfit >= 0
                                      ? 'text-[#2FA36B]'
                                      : 'text-[#9A98B0]'
                                  }`}
                                >
                                  {itemProfit !== null
                                    ? `${itemProfit > 0 ? '+' : ''}${itemProfit} ${state.settings.currency}`
                                    : '-'}
                                </strong>
                              </div>
                            </div>

                            {/* Customer & Debt indicators */}
                            {it.isSold && (it.customerId || it.paymentType === 'credit' || it.paymentType === 'partial') && (
                              <div className="flex items-center gap-2 pt-1 border-t border-[#ECECF4] dark:border-[#32263F] text-[10px]">
                                {it.customerId && (
                                  <span className="text-[#5F2967] dark:text-[#9B67A4] font-bold">
                                    العميل: {customers.find((c) => c.id === it.customerId)?.name || 'عميل مسجل'}
                                  </span>
                                )}
                                {it.paymentType === 'credit' && (
                                  <span className="text-[#E2574C] font-black bg-rose-50 dark:bg-rose-950/40 px-1.5 py-0.2 rounded-md">
                                    آجل بالكامل (متبقي {itemSoldTotal || 0} {state.settings.currency})
                                  </span>
                                )}
                                {it.paymentType === 'partial' && (
                                  <span className="text-[#F5A623] font-black bg-amber-50 dark:bg-amber-950/40 px-1.5 py-0.2 rounded-md">
                                    دفع جزء (مدفوع {it.paidAmount || 0} | متبقي {Math.max(0, (itemSoldTotal || 0) - (it.paidAmount || 0))} {state.settings.currency})
                                  </span>
                                )}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>

                    <div className="pt-2 border-t border-[#ECECF4] dark:border-[#32263F] space-y-2">
                      {order.notes && (
                        <div className="text-[11px] text-[#7A7585] dark:text-[#9A98B0] bg-[#F7F7FA] dark:bg-[#1E1726] px-2.5 py-1.5 rounded-lg">
                          <span className="font-bold text-[#5F2967] dark:text-[#9B67A4]">ملاحظة: </span>
                          <span>{order.notes}</span>
                        </div>
                      )}
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          {order.isFinished ? (
                            <button
                              type="button"
                              onClick={() => toggleOrderFinished(order.id)}
                              className="px-2.5 py-1 rounded-lg bg-[#5F2967] hover:bg-[#4C1F53] text-white font-bold text-[11px] flex items-center gap-1 cursor-pointer transition shadow-xs active:scale-95"
                              title="إعادة فتح الأوردر"
                            >
                              <span>إعادة فتح الأوردر</span>
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={() => toggleOrderFinished(order.id)}
                              className="px-2.5 py-1 rounded-lg bg-[#2F7F5F] hover:bg-[#25664C] text-white font-bold text-[11px] flex items-center gap-1 cursor-pointer transition shadow-xs active:scale-95"
                              title="إقفال الأوردر"
                            >
                              <span>إقفال الأوردر</span>
                            </button>
                          )}

                          <button
                            type="button"
                            onClick={() => {
                              setAddingItemOrderId(order.id);
                              setNewItemName('');
                              setNewItemQuantity('');
                              setNewItemCost('');
                            }}
                            className="px-2.5 py-1 rounded-lg bg-[#2F7F5F] hover:bg-[#25664C] text-white font-bold text-[11px] flex items-center gap-1 cursor-pointer transition shadow-xs active:scale-95"
                            title="إضافة صنف إلى هذا الأوردر"
                          >
                            <span className="leading-none text-xs">＋</span>
                            <span>إضافة صنف</span>
                          </button>
                        </div>

                        <button
                          type="button"
                          onClick={() => setDeletingOrderId(order.id)}
                          className="text-[11px] text-slate-400 hover:text-rose-500 flex items-center gap-1 cursor-pointer transition font-bold"
                        >
                          <Icon3D name="trash" size={15} />
                          <span>حذف الأوردر</span>
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* MODAL 1: Quick Sale Dialog with Payment Type & Customer Selection */}
      {sellingItemInfo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
          <form
            onSubmit={handleConfirmSale}
            className="w-full max-w-sm bg-white dark:bg-[#231A2C] rounded-3xl p-5 border border-[#ECECF4] dark:border-[#32263F] space-y-3.5 text-right shadow-2xl text-xs my-auto"
          >
            <div className="flex items-center justify-between pb-1 border-b border-[#ECECF4] dark:border-[#32263F]">
              <h3 className="font-extrabold text-sm text-[#2B2340] dark:text-white flex items-center gap-1.5">
                <Icon3D name="sell" size={20} />
                بيع: {sellingItemInfo.item.name}
              </h3>
              <button
                type="button"
                onClick={() => setSellingItemInfo(null)}
                className="text-[#9A98B0] hover:text-[#2B2340]"
              >
                <Icon3D name="close" size={16} />
              </button>
            </div>

            <div className="p-2 rounded-xl bg-[#F1F1FA] dark:bg-[#17101D] text-[11px] text-[#9A98B0] flex justify-between">
              <span>سعر التكلفة:</span>
              <strong className="text-[#2B2340] dark:text-white font-black">
                {sellingItemInfo.item.costPrice} {state.settings.currency} (الكمية: {sellingItemInfo.item.quantity})
              </strong>
            </div>

            {/* Selling price defaults to empty */}
            <div>
              <label className="block font-bold text-[#2B2340] dark:text-white mb-1">
                سعر البيع للقطعة *
              </label>
              <input
                type="number"
                step="0.01"
                required
                autoFocus
                placeholder="أدخل سعر البيع..."
                value={salePrice}
                onChange={(e) => setSalePrice(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-[#ECECF4] dark:border-[#32263F] bg-white dark:bg-[#231A2C] font-black text-center text-[#5F2967] dark:text-[#9B67A4] text-base outline-none focus:border-[#5F2967]"
              />
            </div>

            {/* Payment Type Selection: [كاش كامل] [آجل كامل] [دفع جزء] */}
            <div className="space-y-1">
              <label className="block font-bold text-[#2B2340] dark:text-white text-[11px]">
                طريقة الدفع *
              </label>
              <div className="grid grid-cols-3 gap-1.5">
                {[
                  { id: 'cash', label: 'كاش كامل' },
                  { id: 'credit', label: 'آجل كامل' },
                  { id: 'partial', label: 'دفع جزء' },
                ].map((t) => (
                  <button
                    type="button"
                    key={t.id}
                    onClick={() => setPaymentType(t.id as any)}
                    className={`py-2 px-1 rounded-xl font-bold text-xs border transition cursor-pointer ${
                      paymentType === t.id
                        ? 'bg-[#5F2967] text-white border-[#5F2967] shadow-xs'
                        : 'bg-[#F1F1FA] dark:bg-[#17101D] text-[#2B2340] dark:text-[#F2EEF7] border-[#ECECF4] dark:border-[#32263F]'
                    }`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            </div>

            {/* If partial: show input for "المدفوع الآن" */}
            {paymentType === 'partial' && (
              <div>
                <label className="block font-bold text-[#2B2340] dark:text-white mb-1">
                  المبلغ المدفوع الآن *
                </label>
                <input
                  type="number"
                  step="0.01"
                  required
                  placeholder="0.00"
                  value={partialPaidInput}
                  onChange={(e) => setPartialPaidInput(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-[#ECECF4] dark:border-[#32263F] bg-white dark:bg-[#231A2C] font-black text-center text-[#2FA36B] outline-none focus:border-[#5F2967]"
                />
                {parseFloat(salePrice) > 0 && (
                  <span className="text-[10px] text-[#E2574C] block mt-0.5 font-bold">
                    المتبقي كدين: {Math.max(0, (parseFloat(salePrice) * (sellingItemInfo.item.quantity || 1)) - (parseFloat(partialPaidInput) || 0))} {state.settings.currency}
                  </span>
                )}
              </div>
            )}

            {/* Customer Selector: mandatory for credit/partial, optional for cash */}
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <label className="block font-bold text-[#2B2340] dark:text-white text-[11px]">
                  العميل {paymentType !== 'cash' ? '(إجباري للأجل والجزئي) *' : '(اختياري)'}
                </label>
                <button
                  type="button"
                  onClick={() => setShowInlineNewCustomer(!showInlineNewCustomer)}
                  className="text-[10px] font-bold text-[#5F2967] dark:text-[#9B67A4] hover:underline cursor-pointer"
                >
                  {showInlineNewCustomer ? 'إلغاء' : '+ عميل جديد'}
                </button>
              </div>

              {showInlineNewCustomer ? (
                <div className="p-2.5 rounded-xl bg-[#F1F1FA] dark:bg-[#17101D] border border-[#5F2967] space-y-2">
                  <input
                    type="text"
                    placeholder="اسم العميل..."
                    value={inlineCustName}
                    onChange={(e) => setInlineCustName(e.target.value)}
                    className="w-full px-2.5 py-1.5 rounded-lg border border-[#ECECF4] dark:border-[#32263F] bg-white dark:bg-[#231A2C] text-xs font-bold"
                  />
                  <input
                    type="tel"
                    placeholder="رقم الهاتف..."
                    value={inlineCustPhone}
                    onChange={(e) => setInlineCustPhone(e.target.value)}
                    className="w-full px-2.5 py-1.5 rounded-lg border border-[#ECECF4] dark:border-[#32263F] bg-white dark:bg-[#231A2C] text-xs"
                  />
                  <button
                    type="button"
                    onClick={handleCreateInlineCustomer}
                    disabled={!inlineCustName.trim()}
                    className="w-full py-1.5 rounded-lg bg-[#5F2967] text-white font-bold text-xs disabled:opacity-50"
                  >
                    إضافة العميل وتحديده
                  </button>
                </div>
              ) : (
                <select
                  required={paymentType !== 'cash'}
                  value={selectedCustomerId}
                  onChange={(e) => setSelectedCustomerId(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-[#ECECF4] dark:border-[#32263F] bg-white dark:bg-[#231A2C] text-xs font-bold outline-none focus:border-[#5F2967]"
                >
                  <option value="">{paymentType === 'cash' ? '-- بدون عميل محدد --' : '-- اختر العميل المدين --'}</option>
                  {customers.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} {c.phone ? `(${c.phone})` : ''}
                    </option>
                  ))}
                </select>
              )}
            </div>

            <div>
              <label className="block font-bold text-[#2B2340] dark:text-white mb-1">طريقة استلام النقدية</label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
                className="w-full px-3 py-2 rounded-xl border border-[#ECECF4] dark:border-[#32263F] bg-white dark:bg-[#231A2C] text-xs font-bold outline-none focus:border-[#5F2967]"
              >
                <option value="نقدية (كاش)">نقدية (كاش)</option>
                <option value="إنستاباي">إنستاباي</option>
                <option value="فودافون كاش">فودافون كاش</option>
                <option value="تحويل بنكي">تحويل بنكي</option>
                <option value="أخرى">أخرى</option>
              </select>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="submit"
                className="flex-1 py-2.5 rounded-xl bg-[#5F2967] hover:bg-[#4A1E52] text-white font-black text-xs transition cursor-pointer shadow-xs"
              >
                تأكيد البيع
              </button>
              <button
                type="button"
                onClick={() => setSellingItemInfo(null)}
                className="px-4 py-2.5 rounded-xl bg-[#ECECF4] dark:bg-[#32263F] text-[#2B2340] dark:text-[#F2EEF7] font-bold text-xs cursor-pointer"
              >
                إلغاء
              </button>
            </div>
          </form>
        </div>
      )}

      {/* MODAL 2: Edit Order Item Modal */}
      {editingItemInfo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <form
            onSubmit={handleSaveEditItem}
            className="w-full max-w-xs bg-white dark:bg-[#231A2C] rounded-3xl p-5 border border-[#ECECF4] dark:border-[#32263F] space-y-3.5 text-right shadow-2xl text-xs"
          >
            <div className="flex items-center justify-between pb-1 border-b border-[#ECECF4] dark:border-[#32263F]">
              <h3 className="font-extrabold text-sm text-[#2B2340] dark:text-white flex items-center gap-1.5">
                <Icon3D name="edit" size={18} />
                تعديل الصنف
              </h3>
              <button
                type="button"
                onClick={() => setEditingItemInfo(null)}
                className="text-[#9A98B0] hover:text-[#2B2340]"
              >
                <Icon3D name="close" size={16} />
              </button>
            </div>

            <div>
              <label className="block font-bold text-[#2B2340] dark:text-white mb-1">اسم الصنف *</label>
              <input
                type="text"
                required
                value={editItemName}
                onChange={(e) => setEditItemName(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-[#ECECF4] dark:border-[#32263F] bg-white dark:bg-[#231A2C] font-bold outline-none focus:border-[#5F2967]"
              />
            </div>

            <div>
              <label className="block font-bold text-[#2B2340] dark:text-white mb-1">سعر التكلفة *</label>
              <input
                type="number"
                step="0.01"
                required
                value={editItemCost}
                onChange={(e) => setEditItemCost(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-[#ECECF4] dark:border-[#32263F] bg-white dark:bg-[#231A2C] font-black text-center text-[#E2574C] outline-none"
              />
            </div>

            {editingItemInfo.item.isSold && (
              <div>
                <label className="block font-bold text-[#2B2340] dark:text-white mb-1">سعر البيع</label>
                <input
                  type="number"
                  step="0.01"
                  value={editItemSoldPrice}
                  onChange={(e) => setEditItemSoldPrice(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-[#ECECF4] dark:border-[#32263F] bg-white dark:bg-[#231A2C] font-black text-center text-[#3B9AC4] outline-none"
                />
              </div>
            )}

            <div className="flex gap-2 pt-1">
              <button
                type="submit"
                className="flex-1 py-2.5 rounded-xl bg-[#5F2967] hover:bg-[#4A1E52] text-white font-bold text-xs shadow-xs transition cursor-pointer"
              >
                حفظ التعديل
              </button>
              <button
                type="button"
                onClick={() => setEditingItemInfo(null)}
                className="px-4 py-2.5 rounded-xl bg-[#ECECF4] dark:bg-[#32263F] text-[#2B2340] dark:text-[#F2EEF7] font-bold text-xs cursor-pointer"
              >
                إلغاء
              </button>
            </div>
          </form>
        </div>
      )}

      {/* MODAL 3: Return Item Confirmation (مع توضيح ما سيحدث) */}
      {returningItemInfo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-sm bg-white dark:bg-[#231A2C] rounded-3xl p-5 border border-[#ECECF4] dark:border-[#32263F] space-y-3.5 text-right shadow-2xl text-xs">
            <div className="flex items-center gap-2 text-[#E2574C]">
              <Icon3D name="warning" size={22} />
              <h3 className="font-extrabold text-sm text-[#2B2340] dark:text-white">
                تأكيد ارتجاع الصنف: {returningItemInfo.item.name}
              </h3>
            </div>

            <div className="p-3 rounded-2xl bg-[#F1F1FA] dark:bg-[#17101D] border border-[#ECECF4] dark:border-[#32263F] space-y-1.5 text-[11px] leading-relaxed">
              <p className="font-bold text-[#2B2340] dark:text-white">
                ما سيحدث عند تأكيد الارتجاع:
              </p>
              <ul className="list-disc list-inside space-y-1 text-[#9A98B0]">
                <li>سيعود الصنف غير مباع ويرجع متاحاً للبيع مجدداً.</li>
                <li>يتم استرجاع تكلفته المحبوسة في الأوردر.</li>
                <li>في حال كان الأوردر مغطياً لتكلفته وحقق أرباحاً موزعة، سيتم عكس الأرباح الناتجة عن بيعه تلقائياً بنسب التوزيع:
                  <span className="block font-bold text-[#5F2967] dark:text-[#9B67A4] mr-2">
                    70% نمو رأس مال - 20% دعم بوكيت - 10% صدقة
                  </span>
                </li>
              </ul>
            </div>

            <div className="flex gap-2 pt-1">
              <button
                type="button"
                onClick={handleConfirmReturn}
                className="flex-1 py-2.5 rounded-xl bg-[#E2574C] hover:bg-rose-700 text-white font-bold text-xs shadow-xs transition cursor-pointer"
              >
                تأكيد الارتجاع
              </button>
              <button
                type="button"
                onClick={() => setReturningItemInfo(null)}
                className="px-4 py-2.5 rounded-xl bg-[#ECECF4] dark:bg-[#32263F] text-[#2B2340] dark:text-[#F2EEF7] font-bold text-xs cursor-pointer"
              >
                إلغاء
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 4: Settle Unsold Item Confirmation (تسوية) */}
      {settlingItemInfo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-sm bg-white dark:bg-[#231A2C] rounded-3xl p-5 border border-[#ECECF4] dark:border-[#32263F] space-y-3.5 text-right shadow-2xl text-xs">
            <div className="flex items-center gap-2 text-amber-600">
              <Icon3D name="warning" size={22} />
              <h3 className="font-extrabold text-sm text-[#2B2340] dark:text-white">
                تأكيد تسوية الصنف: {settlingItemInfo.item.name}
              </h3>
            </div>

            <div className="p-3 rounded-2xl bg-amber-50/60 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800/40 space-y-1.5 text-[11px] text-amber-950 dark:text-amber-200 leading-relaxed">
              <p className="font-bold">ما سيحدث عند التسوية:</p>
              <p>
                - سيتم إخراج الصنف بسعر تكلفته ({settlingItemInfo.item.costPrice} {state.settings.currency}) بدون أي أرباح، وتحرير قيمته المحبوسة في الأوردر.
              </p>
              <p>
                - تسجيل حركة تسوية في رأس المال بنفس القيمة ({settlingItemInfo.item.costPrice * (settlingItemInfo.item.quantity || 1)} {state.settings.currency}) مع ربطها بالأوردر.
              </p>
            </div>

            <div className="flex gap-2 pt-1">
              <button
                type="button"
                onClick={handleConfirmSettle}
                className="flex-1 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs shadow-xs transition cursor-pointer"
              >
                تأكيد التسوية
              </button>
              <button
                type="button"
                onClick={() => setSettlingItemInfo(null)}
                className="px-4 py-2.5 rounded-xl bg-[#ECECF4] dark:bg-[#32263F] text-[#2B2340] dark:text-[#F2EEF7] font-bold text-xs cursor-pointer"
              >
                إلغاء
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 5: Delete Order Confirmation with Breakdown */}
      {deletingOrderId && deletingOrderObj && deleteImpact && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-sm bg-white dark:bg-[#231A2C] rounded-3xl p-5 border border-[#ECECF4] dark:border-[#32263F] space-y-3.5 text-right shadow-2xl text-xs">
            <div className="flex items-center gap-2 text-[#E2574C]">
              <Icon3D name="danger" size={22} />
              <h3 className="font-extrabold text-sm text-[#2B2340] dark:text-white">
                حذف {deletingOrderObj.code}
              </h3>
            </div>

            <p className="text-[11px] text-[#9A98B0]">
              سيتم حذف الأوردر وإلغاء كل الأثر المالي المرتبط به من جميع الخزن:
            </p>

            <div className="p-3 rounded-2xl bg-[#F1F1FA] dark:bg-[#17101D] border border-[#ECECF4] dark:border-[#32263F] space-y-1.5 text-[11px]">
              <div className="flex justify-between">
                <span>استرجاع نمو رأس المال:</span>
                <strong className="text-[#5F2967] dark:text-[#9B67A4] tabular-nums font-bold">
                  -{deleteImpact.capitalGrowth.toLocaleString('en-US')} {state.settings.currency}
                </strong>
              </div>
              <div className="flex justify-between">
                <span>استرجاع دعم بوكيت:</span>
                <strong className="text-[#5F2967] dark:text-[#9B67A4] tabular-nums font-bold">
                  -{deleteImpact.pocketSupport.toLocaleString('en-US')} {state.settings.currency}
                </strong>
              </div>
              <div className="flex justify-between">
                <span>استرجاع أثر الصدقة:</span>
                <strong className="text-[#5F2967] dark:text-[#9B67A4] tabular-nums font-bold">
                  -{deleteImpact.charityInflow.toLocaleString('en-US')} {state.settings.currency}
                </strong>
              </div>
            </div>

            <div className="flex gap-2 pt-1">
              <button
                type="button"
                onClick={handleConfirmDeleteOrder}
                className="flex-1 py-2.5 rounded-xl bg-[#E2574C] hover:bg-rose-700 text-white font-bold text-xs shadow-xs transition cursor-pointer"
              >
                تأكيد الحذف النهائي
              </button>
              <button
                type="button"
                onClick={() => setDeletingOrderId(null)}
                className="px-4 py-2.5 rounded-xl bg-[#ECECF4] dark:bg-[#32263F] text-[#2B2340] dark:text-[#F2EEF7] font-bold text-xs cursor-pointer"
              >
                إلغاء
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 6: Single Item Delete Confirmation */}
      {deletingItemInfo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-sm bg-white dark:bg-[#231A2C] rounded-3xl p-5 border border-[#ECECF4] dark:border-[#32263F] space-y-3.5 text-right shadow-2xl text-xs">
            <div className="flex items-center gap-2 text-[#E2574C]">
              <Icon3D name="trash" size={22} />
              <h3 className="font-extrabold text-sm text-[#2B2340] dark:text-white">
                حذف الصنف: {deletingItemInfo.item.name}
              </h3>
            </div>

            <p className="text-[11px] text-[#666079] dark:text-[#9E97B0] leading-relaxed">
              هل أنت متأكد من حذف هذا الصنف فقط من <strong className="text-[#5F2967] dark:text-[#D8B4FE]">{deletingItemInfo.orderCode}</strong> دون حذف الأوردر أو الأصناف الأخرى؟
            </p>

            <div className="p-3 rounded-2xl bg-[#F1F1FA] dark:bg-[#17101D] border border-[#ECECF4] dark:border-[#32263F] space-y-1.5 text-[11px]">
              <div className="flex justify-between">
                <span>الكمية:</span>
                <strong className="font-bold tabular-nums">
                  {deletingItemInfo.item.quantity} قطعة{deletingItemInfo.item.size ? ` (مقاس ${deletingItemInfo.item.size})` : ''}
                </strong>
              </div>
              <div className="flex justify-between">
                <span>سعر التكلفة:</span>
                <strong className="text-[#E2574C] font-black tabular-nums">
                  {deletingItemInfo.item.costPrice} {state.settings.currency}
                </strong>
              </div>
              <div className="flex justify-between">
                <span>حالة البيع:</span>
                <strong className="font-bold">
                  {deletingItemInfo.item.isSold ? 'تم بيعه سابقاً (سيتم عكس أثره المالي بأمان)' : 'متاح في المخزون'}
                </strong>
              </div>
            </div>

            <div className="flex gap-2 pt-1">
              <button
                type="button"
                onClick={handleConfirmDeleteItem}
                className="flex-1 py-2.5 rounded-xl bg-[#E2574C] hover:bg-rose-700 text-white font-bold text-xs shadow-xs transition cursor-pointer"
              >
                تأكيد حذف الصنف
              </button>
              <button
                type="button"
                onClick={() => setDeletingItemInfo(null)}
                className="px-4 py-2.5 rounded-xl bg-[#ECECF4] dark:bg-[#32263F] text-[#2B2340] dark:text-[#F2EEF7] font-bold text-xs cursor-pointer"
              >
                إلغاء
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 7: Add Item to Existing Order */}
      {addingItemOrderId && (() => {
        const targetOrder = state.orders.find((o) => o.id === addingItemOrderId);
        const orderLabel = targetOrder
          ? targetOrder.code.includes('أوردر')
            ? targetOrder.code
            : `أوردر رقم ${targetOrder.code}`
          : 'الأوردر';

        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
            <form
              onSubmit={handleSaveAddItem}
              className="w-full max-w-sm bg-white dark:bg-[#231A2C] rounded-3xl p-5 border border-[#ECECF4] dark:border-[#32263F] space-y-3.5 text-right shadow-2xl text-xs"
            >
              <div className="flex items-center justify-between pb-2 border-b border-[#ECECF4] dark:border-[#32263F]">
                <h3 className="font-extrabold text-sm text-[#2F7F5F] dark:text-[#4BA682] flex items-center gap-1.5">
                  <span className="w-5 h-5 rounded-full bg-[#E3F2EA] dark:bg-[#162E23] text-[#2F7F5F] dark:text-[#4BA682] flex items-center justify-center text-sm font-black leading-none">＋</span>
                  <span>إضافة صنف إلى {orderLabel}</span>
                </h3>
                <button
                  type="button"
                  onClick={() => setAddingItemOrderId(null)}
                  className="text-[#9A98B0] hover:text-[#2B2340] dark:hover:text-white p-1 rounded-lg"
                  aria-label="إغلاق"
                >
                  <Icon3D name="close" size={16} />
                </button>
              </div>

              <div>
                <label className="block font-bold text-[#2B2340] dark:text-white mb-1">
                  اسم الصنف / الموديل *
                </label>
                <input
                  type="text"
                  required
                  autoFocus
                  value={newItemName}
                  onChange={(e) => setNewItemName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-[#ECECF4] dark:border-[#32263F] bg-white dark:bg-[#231A2C] font-bold outline-none focus:border-[#2F7F5F]"
                />
              </div>

              <div>
                <label className="block font-bold text-[#2B2340] dark:text-white mb-1">
                  الكمية (العدد) *
                </label>
                <input
                  type="number"
                  min="1"
                  required
                  value={newItemQuantity}
                  onChange={(e) => setNewItemQuantity(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-[#ECECF4] dark:border-[#32263F] bg-white dark:bg-[#231A2C] text-center font-bold outline-none focus:border-[#2F7F5F]"
                />
              </div>

              <div>
                <label className="block font-bold text-[#2B2340] dark:text-white mb-1">
                  سعر التكلفة ({state.settings.currency}) *
                </label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={newItemCost}
                  onChange={(e) => setNewItemCost(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-[#ECECF4] dark:border-[#32263F] bg-white dark:bg-[#231A2C] font-black text-center text-[#2F7F5F] dark:text-[#4BA682] outline-none focus:border-[#2F7F5F] text-sm tabular-nums"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-[#2F7F5F] hover:bg-[#25664C] text-white font-bold text-xs shadow-xs transition cursor-pointer"
                >
                  إضافة الصنف للأوردر
                </button>
                <button
                  type="button"
                  onClick={() => setAddingItemOrderId(null)}
                  className="px-4 py-2.5 rounded-xl bg-[#ECECF4] dark:bg-[#32263F] text-[#2B2340] dark:text-[#F2EEF7] font-bold text-xs cursor-pointer"
                >
                  إلغاء
                </button>
              </div>
            </form>
          </div>
        );
      })()}
    </div>
  );
};
