export interface LineItem {
  id: string;
  medicineName: string;
  batchNumber: string;
  expiryDate: string;
  quantity: number;
  unitPrice: number;
  discountPercent: number;
}

export interface Invoice {
  id: string;
  date: string;
  time: string;
  customerName: string;
  customerPhone: string;
  items: LineItem[];
  subtotal: number;
  taxRate: number; // 0.05
  taxAmount: number;
  globalDiscountPercent: number; // Applied to subtotal before tax? Or specific logic. Usually applied per item or total. We'll apply to subtotal.
  grandTotal: number;
}

export interface StoreProfile {
  name: string;
  address: string;
  phone: string;
  gstin: string;
}
