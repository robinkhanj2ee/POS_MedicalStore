import React, { useState, useEffect, useCallback } from 'react';
import { Plus, Printer, Save, RotateCcw, Sparkles, AlertCircle } from 'lucide-react';
import { Invoice, LineItem } from '../types';
import { LineItemRow } from './LineItemRow';
import { generateInvoiceId, saveInvoice } from '../services/storageService';
import { generateThermalReceipt } from '../utils/pdfGenerator';
import { TAX_RATE } from '../constants';
import { checkDrugInteractions } from '../services/geminiService';

interface Props {
  onInvoiceSaved: () => void;
}

export const InvoiceForm: React.FC<Props> = ({ onInvoiceSaved }) => {
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [items, setItems] = useState<LineItem[]>([]);
  const [globalDiscount, setGlobalDiscount] = useState(0);
  const [aiAnalysis, setAiAnalysis] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // Empty initial item
  useEffect(() => {
    if (items.length === 0) {
      addItem();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const addItem = () => {
    const newItem: LineItem = {
      id: Math.random().toString(36).substr(2, 9),
      medicineName: '',
      batchNumber: '',
      expiryDate: '',
      quantity: 1,
      unitPrice: 0,
      discountPercent: 0
    };
    setItems(prev => [...prev, newItem]);
  };

  const updateItem = (id: string, field: keyof LineItem, value: any) => {
    setItems(prev => prev.map(item => 
      item.id === id ? { ...item, [field]: value } : item
    ));
  };

  const removeItem = (id: string) => {
    if (items.length > 1) {
      setItems(prev => prev.filter(item => item.id !== id));
    } else {
      // If only one item, just clear it
      const cleared = { ...items[0], medicineName: '', batchNumber: '', expiryDate: '', quantity: 1, unitPrice: 0, discountPercent: 0 };
      setItems([cleared]);
    }
  };

  const calculateTotals = useCallback(() => {
    const subtotal = items.reduce((sum, item) => {
      const itemTotal = item.quantity * item.unitPrice * (1 - item.discountPercent / 100);
      return sum + itemTotal;
    }, 0);

    // Apply global discount on subtotal
    const taxableAmount = subtotal * (1 - globalDiscount / 100);
    const taxAmount = taxableAmount * TAX_RATE;
    const grandTotal = taxableAmount + taxAmount;

    return { subtotal, taxAmount, grandTotal };
  }, [items, globalDiscount]);

  const { subtotal, taxAmount, grandTotal } = calculateTotals();

  const handleSave = (print: boolean) => {
    if (items.some(i => !i.medicineName || i.unitPrice <= 0)) {
      alert("Please ensure all items have a name and valid price.");
      return;
    }

    const invoice: Invoice = {
      id: generateInvoiceId(),
      date: new Date().toLocaleDateString(),
      time: new Date().toLocaleTimeString(),
      customerName,
      customerPhone,
      items,
      subtotal,
      taxRate: TAX_RATE,
      taxAmount,
      globalDiscountPercent: globalDiscount,
      grandTotal
    };

    saveInvoice(invoice);
    
    if (print) {
      generateThermalReceipt(invoice);
    }

    handleReset();
    onInvoiceSaved();
  };

  const handleReset = () => {
    setCustomerName('');
    setCustomerPhone('');
    setItems([]);
    setGlobalDiscount(0);
    setAiAnalysis(null);
    addItem(); // Add back the first empty row
  };

  const handleAiCheck = async () => {
    setIsAnalyzing(true);
    setAiAnalysis(null);
    const result = await checkDrugInteractions(items);
    setAiAnalysis(result);
    setIsAnalyzing(false);
  };

  const headerInputClass = "w-full px-4 py-2.5 bg-white border border-slate-200 rounded-lg text-slate-700 placeholder-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all duration-200 outline-none shadow-sm hover:border-blue-300";

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 flex flex-col h-full overflow-hidden">
      {/* Header Inputs */}
      <div className="p-6 border-b border-slate-100 grid grid-cols-1 md:grid-cols-12 gap-6 bg-white">
        <div className="md:col-span-5">
          <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 ml-1">Customer Name</label>
          <input
            type="text"
            value={customerName}
            onChange={e => setCustomerName(e.target.value)}
            className={headerInputClass}
            placeholder="Enter customer name..."
          />
        </div>
        <div className="md:col-span-4">
          <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 ml-1">Phone Number</label>
          <input
            type="tel"
            value={customerPhone}
            onChange={e => setCustomerPhone(e.target.value)}
            className={headerInputClass}
            placeholder="(555) 000-0000"
          />
        </div>
        <div className="md:col-span-3 flex flex-col justify-end">
           <div className="bg-slate-50 px-4 py-2.5 rounded-lg border border-slate-200 flex justify-between items-center h-[46px]">
             <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Invoice ID</span>
             <span className="font-mono font-bold text-slate-700 text-sm">AUTO-GEN</span>
           </div>
        </div>
      </div>

      {/* Items Header */}
      <div className="px-6 py-3 bg-slate-50/80 border-y border-slate-200 text-xs font-bold text-slate-500 uppercase tracking-wider grid grid-cols-12 gap-3">
        <div className="col-span-3">Medicine Name</div>
        <div className="col-span-2">Batch Info</div>
        <div className="col-span-2">Expiry</div>
        <div className="col-span-1 text-center">Qty</div>
        <div className="col-span-1 text-right">Rate</div>
        <div className="col-span-1 text-center">Disc %</div>
        <div className="col-span-1 text-right">Total</div>
        <div className="col-span-1 text-center">Action</div>
      </div>

      {/* Items List - Scrollable */}
      <div className="flex-1 overflow-y-auto p-6 min-h-[300px] bg-white">
        {items.map(item => (
          <LineItemRow
            key={item.id}
            item={item}
            onChange={updateItem}
            onRemove={removeItem}
          />
        ))}
        
        <button
          onClick={addItem}
          className="mt-6 w-full py-3 border-2 border-dashed border-slate-200 rounded-lg text-slate-500 hover:text-blue-600 hover:border-blue-300 hover:bg-blue-50/50 transition-all flex items-center justify-center gap-2 font-medium group"
        >
          <div className="bg-slate-100 rounded-full p-1 group-hover:bg-blue-100 transition-colors">
            <Plus size={18} />
          </div>
          <span>Add Another Medicine</span>
        </button>

        {/* AI Section */}
        <div className="mt-8 p-1 bg-gradient-to-r from-indigo-500/5 via-purple-500/5 to-blue-500/5 rounded-xl">
          <div className="bg-white/80 backdrop-blur-sm rounded-lg border border-indigo-100 p-5">
            <div className="flex justify-between items-center mb-3">
              <h4 className="text-indigo-900 font-bold text-sm flex items-center gap-2">
                <Sparkles size={16} className="text-indigo-500" /> 
                AI Pharmacist Assistant
              </h4>
              <button 
                onClick={handleAiCheck}
                disabled={isAnalyzing}
                className="text-xs font-medium bg-indigo-600 text-white px-4 py-1.5 rounded-full shadow-sm hover:bg-indigo-700 hover:shadow disabled:opacity-50 transition-all"
              >
                {isAnalyzing ? "Analyzing..." : "Check Interactions"}
              </button>
            </div>
            {aiAnalysis ? (
              <div className="text-sm text-indigo-800 bg-indigo-50/50 p-3 rounded-lg border border-indigo-100 leading-relaxed">
                <div className="flex gap-3 items-start">
                   <AlertCircle className="shrink-0 mt-0.5 text-indigo-500" size={18} />
                   <p>{aiAnalysis}</p>
                </div>
              </div>
            ) : (
              <p className="text-slate-400 text-xs italic pl-1">
                Add multiple medicines and click check to analyze potential drug interactions.
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Footer Calculations */}
      <div className="bg-slate-50 border-t border-slate-200 p-6">
        <div className="flex flex-col md:flex-row justify-between gap-8">
           {/* Actions */}
           <div className="flex gap-3 items-end">
              <button
                onClick={handleReset}
                className="flex items-center gap-2 px-5 py-2.5 border border-slate-300 text-slate-700 rounded-lg hover:bg-white hover:border-slate-400 hover:shadow-sm font-medium transition-all"
              >
                <RotateCcw size={18} /> Reset
              </button>
              <button
                onClick={() => handleSave(false)}
                className="flex items-center gap-2 px-5 py-2.5 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 font-medium shadow-sm hover:shadow-md transition-all"
              >
                <Save size={18} /> Save Only
              </button>
              <button
                onClick={() => handleSave(true)}
                className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-bold shadow-md hover:shadow-lg transition-all"
              >
                <Printer size={18} /> Save & Print 58mm
              </button>
           </div>

           {/* Totals */}
           <div className="w-full md:w-80 space-y-3 text-sm">
              <div className="flex justify-between text-slate-600 px-1">
                <span>Subtotal</span>
                <span className="font-medium text-slate-900">{subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center text-slate-600 bg-white p-2 rounded border border-slate-200">
                <span>Global Discount (%)</span>
                <input 
                  type="number" 
                  min="0" max="100" 
                  value={globalDiscount}
                  onChange={e => setGlobalDiscount(parseFloat(e.target.value) || 0)}
                  className="w-20 py-1 px-2 text-right border border-slate-200 rounded text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all font-medium"
                />
              </div>
              <div className="flex justify-between text-slate-600 px-1">
                <span>Tax (5% GST)</span>
                <span className="font-medium text-slate-900">{taxAmount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center text-lg font-bold text-slate-800 border-t border-slate-300 pt-3 mt-2 px-1">
                <span>Grand Total</span>
                <span className="text-blue-700 text-xl">{grandTotal.toFixed(2)}</span>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};