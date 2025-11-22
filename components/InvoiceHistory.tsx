import React, { useEffect, useState } from 'react';
import { FileText, Printer, Search } from 'lucide-react';
import { Invoice } from '../types';
import { getInvoices } from '../services/storageService';
import { generateThermalReceipt } from '../utils/pdfGenerator';

export const InvoiceHistory: React.FC = () => {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [search, setSearch] = useState('');

  useEffect(() => {
    setInvoices(getInvoices());
  }, []);

  const filtered = invoices.filter(inv => 
    inv.customerName.toLowerCase().includes(search.toLowerCase()) ||
    inv.id.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 h-full flex flex-col overflow-hidden">
      <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-white">
        <div>
          <h2 className="font-bold text-xl text-slate-800">Invoice History</h2>
          <p className="text-slate-500 text-xs mt-1">View and reprint past transactions</p>
        </div>
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text" 
            placeholder="Search by customer or ID..." 
            className="pl-10 pr-4 py-2.5 border border-slate-200 rounded-lg text-sm text-slate-700 placeholder-slate-400 focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none w-72 transition-all shadow-sm bg-white hover:border-blue-300"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>
      
      <div className="flex-1 overflow-auto">
        <table className="w-full text-sm text-left">
          <thead className="text-xs font-bold text-slate-500 uppercase bg-slate-50 sticky top-0 z-10">
            <tr>
              <th className="px-6 py-4 border-b border-slate-200">Invoice ID</th>
              <th className="px-6 py-4 border-b border-slate-200">Date & Time</th>
              <th className="px-6 py-4 border-b border-slate-200">Customer</th>
              <th className="px-6 py-4 border-b border-slate-200 text-right">Items</th>
              <th className="px-6 py-4 border-b border-slate-200 text-right">Total</th>
              <th className="px-6 py-4 border-b border-slate-200 text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-12 text-center text-slate-400 flex flex-col items-center justify-center">
                  <div className="bg-slate-50 p-4 rounded-full mb-3">
                    <FileText size={32} className="text-slate-300" />
                  </div>
                  No invoices found matching your search.
                </td>
              </tr>
            ) : (
              filtered.map((inv) => (
                <tr key={inv.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="px-6 py-4 font-semibold text-slate-700 font-mono text-xs">{inv.id}</td>
                  <td className="px-6 py-4 text-slate-500">{inv.date} <span className="text-xs text-slate-400 ml-1">{inv.time}</span></td>
                  <td className="px-6 py-4 text-slate-700 font-medium">{inv.customerName || 'Walk-in Customer'}</td>
                  <td className="px-6 py-4 text-right text-slate-600">{inv.items.length}</td>
                  <td className="px-6 py-4 text-right font-bold text-emerald-600">{inv.grandTotal.toFixed(2)}</td>
                  <td className="px-6 py-4 text-center">
                    <button
                      onClick={() => generateThermalReceipt(inv)}
                      className="text-blue-600 hover:text-blue-800 hover:bg-blue-50 p-2 rounded-lg transition-colors border border-transparent hover:border-blue-100"
                      title="Reprint Receipt"
                    >
                      <Printer size={18} />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};