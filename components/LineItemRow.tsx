import React from 'react';
import { Trash2 } from 'lucide-react';
import { LineItem } from '../types';

interface Props {
  item: LineItem;
  onChange: (id: string, field: keyof LineItem, value: any) => void;
  onRemove: (id: string) => void;
}

export const LineItemRow: React.FC<Props> = ({ item, onChange, onRemove }) => {
  const total = (item.quantity * item.unitPrice * (1 - item.discountPercent / 100)).toFixed(2);

  const inputClass = "w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-slate-700 placeholder-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all duration-200 outline-none text-sm shadow-sm hover:border-blue-300";

  return (
    <div className="grid grid-cols-12 gap-3 items-start py-3 border-b border-slate-100 hover:bg-slate-50/80 transition-colors group">
      <div className="col-span-3">
        <input
          type="text"
          placeholder="Medicine Name"
          className={inputClass}
          value={item.medicineName}
          onChange={(e) => onChange(item.id, 'medicineName', e.target.value)}
        />
      </div>
      <div className="col-span-2">
        <input
          type="text"
          placeholder="Batch No."
          className={inputClass}
          value={item.batchNumber}
          onChange={(e) => onChange(item.id, 'batchNumber', e.target.value)}
        />
      </div>
      <div className="col-span-2">
        <input
          type="text"
          placeholder="MM/YY"
          className={inputClass}
          value={item.expiryDate}
          onChange={(e) => onChange(item.id, 'expiryDate', e.target.value)}
        />
      </div>
      <div className="col-span-1">
        <input
          type="number"
          min="1"
          className={`${inputClass} text-center px-1`}
          value={item.quantity}
          onChange={(e) => onChange(item.id, 'quantity', parseFloat(e.target.value) || 0)}
        />
      </div>
      <div className="col-span-1">
        <input
          type="number"
          min="0"
          step="0.01"
          className={`${inputClass} text-right px-2`}
          value={item.unitPrice}
          onChange={(e) => onChange(item.id, 'unitPrice', parseFloat(e.target.value) || 0)}
        />
      </div>
      <div className="col-span-1">
        <input
          type="number"
          min="0"
          max="100"
          className={`${inputClass} text-center px-1`}
          value={item.discountPercent}
          onChange={(e) => onChange(item.id, 'discountPercent', parseFloat(e.target.value) || 0)}
        />
      </div>
      <div className="col-span-1 text-right font-semibold text-slate-700 py-2 text-sm">
        {total}
      </div>
      <div className="col-span-1 flex justify-center py-1.5">
        <button
          onClick={() => onRemove(item.id)}
          className="text-slate-400 hover:text-red-500 p-1.5 rounded-md hover:bg-red-50 transition-colors opacity-0 group-hover:opacity-100"
          title="Remove Item"
        >
          <Trash2 size={18} />
        </button>
      </div>
    </div>
  );
};