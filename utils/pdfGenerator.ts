import jsPDF from 'jspdf';
import { Invoice } from '../types';
import { STORE_PROFILE } from '../constants';

export const generateThermalReceipt = (invoice: Invoice) => {
  // 58mm width. Height is variable, we set a long initial page, then we might crop or just let it be.
  // For thermal printers, the continuous feed usually handles height, but for PDF export we need a sufficient height.
  // Let's estimate height: Header (30) + Items (N * 10) + Totals (30) + Footer (10)
  const estimatedHeight = 80 + (invoice.items.length * 15);
  
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: [58, estimatedHeight] 
  });

  const pageWidth = 58;
  const margin = 2;
  const contentWidth = pageWidth - (margin * 2);
  let yPos = 5; // Start Y position

  // Helper for centering text
  const centerText = (text: string, y: number, size: number = 9, isBold: boolean = false) => {
    doc.setFontSize(size);
    doc.setFont("courier", isBold ? "bold" : "normal");
    const textWidth = doc.getTextWidth(text);
    const x = (pageWidth - textWidth) / 2;
    doc.text(text, x, y);
  };

  // Helper for left/right text line
  const lineText = (left: string, right: string, y: number, size: number = 8) => {
    doc.setFontSize(size);
    doc.setFont("courier", "normal");
    doc.text(left, margin, y);
    const rightWidth = doc.getTextWidth(right);
    doc.text(right, pageWidth - margin - rightWidth, y);
  };

  // Header
  centerText(STORE_PROFILE.name, yPos, 10, true);
  yPos += 4;
  centerText("Medical Store", yPos, 7);
  yPos += 4;
  centerText(STORE_PROFILE.phone, yPos, 7);
  yPos += 6;

  // Meta
  doc.setFontSize(7);
  doc.text(`Date: ${invoice.date} ${invoice.time}`, margin, yPos);
  yPos += 3;
  doc.text(`Inv: ${invoice.id}`, margin, yPos);
  yPos += 4;
  
  if (invoice.customerName) {
    doc.text(`Cust: ${invoice.customerName}`, margin, yPos);
    yPos += 4;
  }

  // Divider
  doc.setLineDash([1, 1], 0);
  doc.line(margin, yPos, pageWidth - margin, yPos);
  yPos += 3;

  // Headers
  doc.setFont("courier", "bold");
  doc.text("Item", margin, yPos);
  doc.text("Ttl", pageWidth - margin - doc.getTextWidth("Ttl"), yPos);
  yPos += 3;
  doc.setLineDash([], 0); // Reset dash

  // Items
  doc.setFont("courier", "normal");
  invoice.items.forEach(item => {
    // Item Name (wrap if needed, but simplified for receipt)
    const name = item.medicineName.length > 18 
      ? item.medicineName.substring(0, 17) + ".." 
      : item.medicineName;
    
    doc.text(name, margin, yPos);
    yPos += 3;
    
    // Details line: Qty x Price
    const details = `${item.quantity} x ${item.unitPrice.toFixed(2)}`;
    const total = (item.quantity * item.unitPrice * (1 - item.discountPercent/100)).toFixed(2);
    
    lineText(` ${details}`, total, yPos);
    yPos += 4;
  });

  // Divider
  yPos += 1;
  doc.setLineDash([1, 1], 0);
  doc.line(margin, yPos, pageWidth - margin, yPos);
  yPos += 4;
  doc.setLineDash([], 0);

  // Totals
  lineText("Subtotal:", invoice.subtotal.toFixed(2), yPos);
  yPos += 4;
  lineText(`Tax (${(invoice.taxRate * 100).toFixed(0)}%):`, invoice.taxAmount.toFixed(2), yPos);
  yPos += 4;
  if (invoice.globalDiscountPercent > 0) {
      lineText(`Disc (${invoice.globalDiscountPercent}%):`, `-${(invoice.subtotal * invoice.globalDiscountPercent / 100).toFixed(2)}`, yPos);
      yPos += 4;
  }
  
  // Grand Total
  doc.setFont("courier", "bold");
  doc.setFontSize(10);
  lineText("TOTAL:", invoice.grandTotal.toFixed(2), yPos);
  yPos += 6;

  // Footer
  centerText("Thank You!", yPos, 9);
  yPos += 4;
  centerText("Get Well Soon", yPos, 8);

  // Save
  doc.save(`${invoice.id}.pdf`);
};
