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

export const generateInvoiceId = (): string => {
  const now = new Date();
  // Format: INV-YYYYMMDD-HHMMSS
  const timestamp = now.toISOString().replace(/[-:T.]/g, '').slice(0, 14);
  return `INV-${timestamp}`;
};
