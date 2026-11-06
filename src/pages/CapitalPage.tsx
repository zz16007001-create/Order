/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Icon3D } from '../components/icons3d/Icon3D';

export const CapitalPage: React.FC = () => {
  const {
    state,
    baseCapital,
    liquidity,
    tiedInOrders,
    capitalAdvancesOpen,
    capitalGrowthTotal,
    capitalErosionSettled,
    addCapitalAdvance,
    addCapitalSettlement,
    addCapitalRepayment,
    setCurrentPage,
  } = useApp();

  const [showMovementForm, setShowMovementForm] = useState(false);
  const [movementType, setMovementType] = useState<'advance' | 'settlement' | 'repayment'>('advance');
  const [movementAmount, setMovementAmount] = useState('');
  const [movementDesc, setMovementDesc] = useState('');
  const [filterType, setFilterType] = useState<string>('all');

  const filteredTransactions = state.capitalTransactions.filter((tx) => {
    if (filterType === 'all') return true;
    return tx.type === filterType;
  });

  const handleMovementSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const num = parseFloat(movementAmount);
    if (!num || num <= 0) return;
    if (movementType === 'advance') {
      addCapitalAdvance(num, movementDesc || 'سلفة رأس مال');
    } else if (movementType === 'settlement') {
      addCapitalSettlement(num, movementDesc || 'تسوية رأس مال');
    } else {
      addCapitalRepayment(num, movementDesc || 'سداد سلفة رأس مال');
    }
    setMovementAmount('');
    setMovementDesc('');
    setShowMovementForm(false);
  };

  return (
    <div className="w-full flex flex-col gap-[13px] text-[#1F1A2E] dark:text-[#F4F0FA]">
      {/* 1) كارت اسم الصفحة «خزنة رأس المال والسيولة»: ارتفاع 52px، حشو 15px، بنفسجي متدرج */}
      <div className="card-header-purple">
        <div className="flex items-center gap-[10px]">
          <button
            onClick={() => setCurrentPage('entry')}
            className="btn-back-transparent"
            title="رجوع للرئيسية"
          >
            ➜
          </button>
          <span className="text-[18px] font-[800] text-white leading-none whitespace-nowrap">
            خزنة رأس المال والسيولة
          </span>
        </div>

        <button
          onClick={() => setShowMovementForm(!showMovementForm)}
          className="h-[32px] px-[14px] bg-white text-[#5F2967] rounded-full text-[13px] font-[700] inline-flex items-center gap-1 border-0 cursor-pointer whitespace-nowrap active:scale-95 shadow-xs"
        >
          <Icon3D name={showMovementForm ? 'close' : 'plus'} size={13} />
          <span>حركة</span>
        </button>
      </div>

      {/* 2) نموذج تسجيل الحركة (Collapsible Movement Form) */}
      {showMovementForm && (
        <form
          onSubmit={handleMovementSubmit}
          className="card-main p-4 space-y-3 text-xs"
        >
          <div className="flex items-center justify-between pb-1.5 border-b border-[#D4D0E0] dark:border-[#3A3150]">
            <span className="font-extrabold text-[#5F2967] dark:text-[#D8B4FE]">
              تسجيل حركة رأس مال
            </span>
            <button
              type="button"
              onClick={() => setShowMovementForm(false)}
              className="text-[#666079] hover:text-[#1F1A2E] p-1 cursor-pointer border-0 bg-transparent"
            >
              <Icon3D name="close" size={16} />
            </button>
          </div>

          <div className="grid grid-cols-3 gap-1.5">
            {[
              { id: 'advance', label: 'سلفة' },
              { id: 'settlement', label: 'تسوية (خصم)' },
              { id: 'repayment', label: 'سداد سلفة' },
            ].map((t) => (
              <button
                type="button"
                key={t.id}
                onClick={() => setMovementType(t.id as any)}
                className={`py-2 rounded-[12px] text-xs font-bold text-center border transition cursor-pointer ${
                  movementType === t.id
                    ? 'bg-[#5F2967] text-white border-[#5F2967]'
                    : 'bg-white dark:bg-[#211A2D] text-[#1F1A2E] dark:text-[#F4F0FA] border-[#D4D0E0] dark:border-[#3A3150]'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-[10px] text-[#666079] dark:text-[#9E97B0] mb-0.5 font-bold">
                المبلغ ({state.settings.currency}) *
              </label>
              <input
                type="number"
                step="any"
                required
                placeholder="0.00"
                value={movementAmount}
                onChange={(e) => setMovementAmount(e.target.value)}
                className="input-field w-full px-3 py-2 text-sm font-extrabold text-center tabular-nums"
              />
            </div>
            <div>
              <label className="block text-[10px] text-[#666079] dark:text-[#9E97B0] mb-0.5 font-bold">
                البيان
              </label>
              <input
                type="text"
                placeholder="تفاصيل الحركة..."
                value={movementDesc}
                onChange={(e) => setMovementDesc(e.target.value)}
                className="input-field w-full px-3 py-2 text-xs"
              />
            </div>
          </div>

          <button
            type="submit"
            className="btn-primary w-full py-2.5 text-xs shadow-sm"
          >
            تأكيد الحركة
          </button>
        </form>
      )}

      {/* 3) الكارت الأخضر «السيولة المتاحة»: ارتفاع 92px، حشو 15px، أخضر تيل متدرج */}
      <div className="w-full h-[92px] card-hero-teal relative px-[15px] flex items-center justify-between">
        <div>
          <div className="text-[11px] font-[700] text-white/85 leading-none mb-[3px]">
            السيولة المتاحة
          </div>
          <div className="flex items-baseline gap-[8px]">
            <span className="text-[30px] font-[900] leading-[34px] text-white tabular-nums">
              {liquidity.toLocaleString('en-US')}
            </span>
            <span className="text-[13px] font-[700] text-white/85 leading-none">
              ج.م
            </span>
          </div>
        </div>

        <div className="bg-[rgba(255,255,255,0.18)] rounded-[14px] py-[7px] px-[12px] text-center shrink-0">
          <div className="text-[10px] font-[700] text-white/90 leading-tight">
            الأساسي
          </div>
          <div className="text-[14px] font-[800] text-white tabular-nums leading-tight mt-[1px]">
            {baseCapital.toLocaleString('en-US')}
          </div>
        </div>
      </div>

      {/* 4) شبكة الأربع كروت الصغيرة: عمودين متساويين، ارتفاع كل كارت 58px بالظبط */}
      <div className="grid grid-cols-2 gap-[13px]">
        {/* الصف الأول - اليمين: المحبوس بالأوردرات */}
        <div className="h-[58px] px-[12px] card-main flex items-center gap-[9px]">
          <div className="w-[28px] h-[28px] rounded-full bg-[#FBF1DE] dark:bg-[#332616] text-[#B7791F] flex items-center justify-center shrink-0">
            <Icon3D name="orders" size={14} />
          </div>
          <div className="min-w-0">
            <span className="text-[11px] font-[600] text-[#666079] dark:text-[#9E97B0] leading-tight block truncate">
              المحبوس بالأوردرات
            </span>
            <span className="text-[17px] font-[900] text-[#B7791F] dark:text-[#D4983D] tabular-nums leading-tight block">
              {tiedInOrders.toLocaleString('en-US')}
            </span>
          </div>
        </div>

        {/* الصف الأول - الشمال: إجمالي النمو */}
        <div className="h-[58px] px-[12px] card-main flex items-center gap-[9px]">
          <div className="w-[28px] h-[28px] rounded-full bg-[#E3F2EA] dark:bg-[#162E23] text-[#2F7F5F] flex items-center justify-center shrink-0">
            <Icon3D name="profit" size={14} />
          </div>
          <div className="min-w-0">
            <span className="text-[11px] font-[600] text-[#666079] dark:text-[#9E97B0] leading-tight block truncate">
              إجمالي النمو
            </span>
            <span className="text-[17px] font-[900] text-[#2F7F5F] dark:text-[#4BA682] tabular-nums leading-tight block">
              +{capitalGrowthTotal.toLocaleString('en-US')}
            </span>
          </div>
        </div>

        {/* الصف الثاني - اليمين: إجمالي التسويات */}
        <div className="h-[58px] px-[12px] card-main flex items-center gap-[9px]">
          <div className="w-[28px] h-[28px] rounded-full bg-[#FBF1DE] dark:bg-[#332616] text-[#B7791F] flex items-center justify-center shrink-0">
            <Icon3D name="reconcile" size={14} />
          </div>
          <div className="min-w-0">
            <span className="text-[11px] font-[600] text-[#666079] dark:text-[#9E97B0] leading-tight block truncate">
              إجمالي التسويات
            </span>
            <span className="text-[17px] font-[900] text-[#B7791F] dark:text-[#D4983D] tabular-nums leading-tight block">
              {capitalErosionSettled.toLocaleString('en-US')}
            </span>
          </div>
        </div>

        {/* الصف الثاني - الشمال: إجمالي السلف */}
        <div className="h-[58px] px-[12px] card-main flex items-center gap-[9px]">
          <div className="w-[28px] h-[28px] rounded-full bg-[#F8E6EC] dark:bg-[#381B26] text-[#A23B5A] flex items-center justify-center shrink-0">
            <Icon3D name="advance" size={14} />
          </div>
          <div className="min-w-0">
            <span className="text-[11px] font-[600] text-[#666079] dark:text-[#9E97B0] leading-tight block truncate">
              إجمالي السلف
            </span>
            <span className="text-[17px] font-[900] text-[#A23B5A] dark:text-[#FB7185] tabular-nums leading-tight block">
              {capitalAdvancesOpen.toLocaleString('en-US')}
            </span>
          </div>
        </div>
      </div>

      {/* 5) كارت سجل حركات رأس المال */}
      <div className="card-main p-4 space-y-3">
        <div className="flex items-center justify-between pb-2 border-b border-[#D4D0E0] dark:border-[#3A3150]">
          <h3 className="font-extrabold text-xs text-[#1F1A2E] dark:text-[#F4F0FA] flex items-center gap-1.5">
            <Icon3D name="history" size={16} />
            سجل حركات رأس المال ({filteredTransactions.length})
          </h3>
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="input-field text-xs px-2.5 py-1 font-bold"
          >
            <option value="all">كل الحركات</option>
            <option value="order_creation">سحب لأوردر</option>
            <option value="advance">سلفة</option>
            <option value="settlement">تسوية</option>
            <option value="repayment">سداد</option>
            <option value="growth">نمو أرباح</option>
          </select>
        </div>

        {filteredTransactions.length === 0 ? (
          <div className="py-8 text-center text-xs text-[#666079] dark:text-[#9E97B0]">
            لا توجد حركات مسجلة
          </div>
        ) : (
          <div className="space-y-2">
            {filteredTransactions.map((tx) => {
              const isOutflow =
                tx.type === 'order_creation' ||
                tx.type === 'advance' ||
                tx.type === 'settlement' ||
                (tx.type === 'growth' && tx.amount < 0);

              const formattedAmount = Math.abs(tx.amount).toLocaleString('en-US');

              return (
                <div
                  key={tx.id}
                  className="p-3 rounded-[14px] bg-[#EDEEF2]/60 dark:bg-[#14101B] border border-[#D4D0E0]/70 dark:border-[#3A3150] flex items-center justify-between gap-3 text-xs"
                >
                  <div className="min-w-0 flex-1 flex items-center gap-2.5">
                    <div
                      className={`w-7 h-7 rounded-[10px] flex items-center justify-center font-extrabold text-xs shrink-0 ${
                        isOutflow
                          ? 'bg-[#F8E6EC] dark:bg-[#381B26] text-[#A23B5A] dark:text-[#FB7185]'
                          : 'bg-[#E3F2EA] dark:bg-[#162E23] text-[#2F7F5F] dark:text-[#4BA682]'
                      }`}
                    >
                      {isOutflow ? '↓' : '↑'}
                    </div>

                    <div className="min-w-0 flex-1">
                      <span className="font-extrabold text-[#1F1A2E] dark:text-[#F4F0FA] truncate block">
                        {tx.description}
                      </span>
                      <span className="text-[10px] text-[#666079] dark:text-[#9E97B0] block">
                        {tx.date} {tx.notes && `• ${tx.notes}`}
                      </span>
                    </div>
                  </div>

                  <span
                    className={`font-extrabold tabular-nums text-xs whitespace-nowrap flex items-center gap-1 ${
                      isOutflow
                        ? 'text-[#A23B5A] dark:text-[#FB7185]'
                        : 'text-[#2F7F5F] dark:text-[#4BA682]'
                    }`}
                  >
                    <span>{isOutflow ? '-' : '+'}</span>
                    <span>{formattedAmount}</span>
                    <span className="text-[10px] font-normal">{state.settings.currency}</span>
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
