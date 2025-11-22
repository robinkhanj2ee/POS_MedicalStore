import React, { useState } from 'react';
import { LayoutDashboard, History, Pill, Stethoscope } from 'lucide-react';
import { InvoiceForm } from './components/InvoiceForm';
import { InvoiceHistory } from './components/InvoiceHistory';
import { STORE_PROFILE } from './constants';

type View = 'pos' | 'history';

function App() {
  const [currentView, setCurrentView] = useState<View>('pos');

  // Force refresh history when a new invoice is saved
  const [refreshKey, setRefreshKey] = useState(0);
  const handleInvoiceSaved = () => {
    setRefreshKey(prev => prev + 1);
  };

  return (
    <div className="flex h-screen bg-slate-100 overflow-hidden font-sans">
      {/* Sidebar */}
      <aside className="w-64 bg-slate-900 text-white flex flex-col shadow-xl z-10">
        <div className="p-6 border-b border-slate-800">
          <div className="flex items-center gap-3 mb-2">
            <div className="bg-blue-500 p-2 rounded-lg">
              <Pill size={24} className="text-white" />
            </div>
            <h1 className="text-xl font-bold tracking-tight">MediPOS</h1>
          </div>
          <p className="text-slate-400 text-xs pl-1">Pharmacy Solution v1.0</p>
        </div>

        <nav className="flex-1 p-4 space-y-2">
          <button
            onClick={() => setCurrentView('pos')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
              currentView === 'pos' 
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/50' 
                : 'text-slate-400 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <LayoutDashboard size={20} />
            <span className="font-medium">New Invoice</span>
          </button>

          <button
            onClick={() => setCurrentView('history')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
              currentView === 'history' 
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/50' 
                : 'text-slate-400 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <History size={20} />
            <span className="font-medium">History</span>
          </button>
        </nav>

        <div className="p-4 border-t border-slate-800 bg-slate-950/50">
           <div className="flex items-center gap-3 text-slate-400">
              <Stethoscope size={16} />
              <div className="text-xs">
                <p className="font-semibold text-slate-300">{STORE_PROFILE.name}</p>
                <p className="truncate w-40">{STORE_PROFILE.address}</p>
              </div>
           </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Topbar */}
        <header className="h-16 bg-white border-b border-slate-200 shadow-sm flex items-center justify-between px-8">
           <h2 className="text-xl font-semibold text-slate-800">
             {currentView === 'pos' ? 'Point of Sale' : 'Transaction History'}
           </h2>
           <div className="flex items-center gap-4">
              <span className="text-sm text-slate-500 bg-slate-100 px-3 py-1 rounded-full">
                 {new Date().toLocaleDateString()}
              </span>
           </div>
        </header>

        {/* Viewport */}
        <div className="flex-1 p-6 overflow-hidden">
          {currentView === 'pos' ? (
            <InvoiceForm onInvoiceSaved={handleInvoiceSaved} />
          ) : (
            <InvoiceHistory key={refreshKey} />
          )}
        </div>
      </main>
    </div>
  );
}

export default App;
