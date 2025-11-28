import { Invoice } from '../types';

const STORAGE_KEY = 'medipos_invoices';

export const saveInvoice = (invoice: Invoice): void => {
  const existing = getInvoices();
  const updated = [invoice, ...existing];
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
};

export const getInvoices = (): Invoice[] => {
  const data = localStorage.getItem(STORAGE_KEY);
  return data ? JSON.parse(data) : [];
};

export const generateInvoiceId = (dateString?: string): string => {
  const now = new Date();
  
  let datePart = '';
  if (dateString) {
    // dateString is expected in YYYY-MM-DD format
    datePart = dateString.replace(/-/g, '');
  } else {
    const yyyy = now.getFullYear();
    const mm = String(now.getMonth() + 1).padStart(2, '0');
    const dd = String(now.getDate()).padStart(2, '0');
    datePart = `${yyyy}${mm}${dd}`;
  }

  // Use current time for uniqueness
  const hh = String(now.getHours()).padStart(2, '0');
  const min = String(now.getMinutes()).padStart(2, '0');
  const ss = String(now.getSeconds()).padStart(2, '0');

  return `INV-${datePart}-${hh}${min}${ss}`;
};