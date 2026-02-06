
import { jsPDF } from 'jspdf';
import { Order } from '../types';

/**
 * Generates a high-fidelity, professional Shipping Label.
 */
export const generateShippingLabelPDF = async (order: Order): Promise<jsPDF> => {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  // Fix: Use correct property 'shipping_address'
  const address = order.shipping_address;
  // Fix: Use correct property 'payment_method'
  const isCOD = order.payment_method === 'Cash on Delivery';
  
  // Fix: Use correct property 'total_amount'
  const totalAmount = Number(order.total_amount || order.total || 0);
  const subtotal = totalAmount / 1.18;
  const gstAmount = totalAmount - subtotal;
  
  // Fix: Use correct properties from Order and OrderItem types
  const vendorName = order.seller_name || order.items[0]?.vendor_name || 'VexoKart Authorized Vendor';
  const vendorId = order.vendor_id || order.items[0]?.vendor_id || 'VX-VND-001';

  // --- TOP HEADER ---
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(28);
  doc.text('VexoKart', 15, 20);
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.text('LOGISTICS HUB • SECURE FULFILLMENT', 15, 25);

  // COD/PREPAID Badge
  doc.setFillColor(0, 0, 0);
  doc.rect(145, 12, 50, 10, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text(isCOD ? 'C O D' : 'PREPAID', 170, 19, { align: 'center' });
  
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(10);
  doc.text(`Order ID: #${order.id}`, 195, 28, { align: 'right' });
  doc.text(`Date: ${new Date(order.created_at).toLocaleDateString()}`, 195, 33, { align: 'right' });

  doc.setLineWidth(0.8);
  doc.line(15, 38, 195, 38);

  // --- PRIMARY BARCODE (Visual approximation for PDF) ---
  doc.setFillColor(0, 0, 0);
  let startX = 20;
  const barPattern = [1, 2, 0.5, 3, 1, 1, 0.5, 4, 1, 2, 0.5, 3];
  for (let i = 0; i < 12; i++) {
    barPattern.forEach(w => {
        doc.rect(startX, 45, w, 18, 'F');
        startX += w + 0.5;
    });
  }
  doc.setFontSize(11);
  doc.text(`ID: ${order.id}`, 105, 70, { align: 'center', charSpace: 2 });

  // --- ADDRESS SECTION ---
  doc.setLineWidth(0.8);
  doc.rect(15, 75, 180, 55); // Outer frame
  doc.line(105, 75, 105, 130); // Middle divider

  // Left Side - Ship From
  doc.setFontSize(8);
  doc.setTextColor(120, 120, 120);
  doc.text('SHIP FROM (SELLER)', 20, 82);
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text(vendorName.toUpperCase(), 20, 90);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text(['Warehouse Node-A1', 'Industrial Logistics Estate', 'Support: 1800-VEXO-KART'], 20, 98);
  doc.setFontSize(8);
  doc.text(`REG ID: ${vendorId}`, 20, 122);

  // Right Side - Deliver To
  doc.setFontSize(8);
  doc.setTextColor(120, 120, 120);
  doc.text('DELIVER TO (CONSIGNEE)', 110, 82);
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text(address?.fullName.toUpperCase() || 'VALUED CUSTOMER', 110, 90);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text([address?.street || '', `${address?.city || ''}, ${address?.state || ''}`], 110, 98);
  doc.setFont('helvetica', 'bold');
  doc.text(`PH: ${address?.phone || ''}`, 110, 112);

  // Pincode Highlight Box
  doc.setLineWidth(1.2);
  doc.rect(130, 116, 50, 10);
  doc.setFontSize(18);
  doc.text(address?.zip || '000000', 155, 123.5, { align: 'center', charSpace: 2 });

  // --- ITEM TABLE ---
  doc.setLineWidth(0.8);
  doc.line(15, 140, 195, 140);
  doc.setFontSize(9);
  doc.text('ITEM DESCRIPTION', 15, 145);
  doc.text('QTY', 195, 145, { align: 'right' });
  doc.line(15, 147, 195, 147);

  doc.setFontSize(10);
  let y = 155;
  order.items.forEach((item) => {
    doc.setFont('helvetica', 'bold');
    doc.text(item.name.substring(0, 65).toUpperCase(), 15, y);
    doc.text(String(item.quantity), 195, y, { align: 'right' });
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    doc.text(`SKU: VXK-${item.id} • HSN: 61091000`, 15, y + 4);
    y += 12;
  });

  // --- FOOTER ---
  const footerY = 240;
  doc.setLineWidth(0.5);
  doc.rect(15, footerY, 25, 25);
  doc.setFontSize(6);
  doc.text('DIGITAL', 27.5, footerY + 12, { align: 'center' });
  doc.text('AUTH', 27.5, footerY + 15, { align: 'center' });

  doc.setFontSize(8);
  doc.setTextColor(150, 150, 150);
  doc.text(['ELECTRONIC FULFILLMENT MANIFEST', 'SUBJECT TO VEXOKART JURISDICTION'], 45, footerY + 5);

  doc.setTextColor(0, 0, 0);
  doc.setFontSize(10);
  doc.text('SUBTOTAL', 140, footerY + 5);
  doc.text(`INR ${subtotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`, 195, footerY + 5, { align: 'right' });
  
  doc.text('GST (18%)', 140, footerY + 10);
  doc.text(`INR ${gstAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`, 195, footerY + 10, { align: 'right' });

  doc.setLineWidth(0.8);
  doc.line(130, footerY + 14, 195, footerY + 14);
  
  doc.setFontSize(22);
  doc.setFont('helvetica', 'bold');
  doc.text(`INR ${totalAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`, 195, footerY + 24, { align: 'right' });
  doc.setFontSize(7);
  doc.text('TOTAL SETTLEMENT VALUE (INCLUSIVE OF GST)', 195, footerY + 28, { align: 'right' });

  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(180, 180, 180);
  doc.text('VEXOKART FULFILLMENT SYSTEM • MANIFEST V5.0 • SYSTEM GENERATED', 105, 285, { align: 'center', charSpace: 1 });

  return doc;
};

/**
 * Generates a high-fidelity Digital Tax Invoice PDF.
 */
export const generateInvoicePDF = async (order: Order): Promise<jsPDF> => {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const subtotal = order.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const gstAmount = subtotal * 0.18;
  const finalTotal = subtotal + gstAmount;
  // Fix: Use correct properties from Order and OrderItem types
  const primarySeller = order.seller_name || order.items[0]?.vendor_name || 'VexoKart Authorized Vendor';

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(22);
  doc.text('TAX INVOICE', 15, 20);
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`Invoice #: INV-${order.id}`, 195, 20, { align: 'right' });
  doc.text(`Date: ${new Date(order.created_at).toLocaleDateString()}`, 195, 25, { align: 'right' });

  doc.setLineWidth(0.5);
  doc.line(15, 30, 195, 30);

  // Seller and Buyer
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.text('SOLD BY:', 15, 40);
  doc.setFont('helvetica', 'normal');
  doc.text(primarySeller, 15, 45);
  doc.text(['Warehouse Node-A1', 'Industrial Estate', 'GSTIN: 27VEXOK7788A1Z5'], 15, 50);

  doc.setFont('helvetica', 'bold');
  doc.text('BILLED TO:', 110, 40);
  doc.setFont('helvetica', 'normal');
  // Fix: Use correct property 'shipping_address'
  doc.text(order.shipping_address?.fullName || 'Valued Customer', 110, 45);
  doc.text([
    order.shipping_address?.street || '',
    `${order.shipping_address?.city || ''}, ${order.shipping_address?.state || ''} — ${order.shipping_address?.zip || ''}`,
    `Phone: ${order.shipping_address?.phone || ''}`
  ], 110, 50);

  doc.line(15, 75, 195, 75);

  // Table Header
  doc.setFont('helvetica', 'bold');
  doc.text('Description', 15, 82);
  doc.text('Qty', 140, 82, { align: 'center' });
  doc.text('Price (INR)', 195, 82, { align: 'right' });
  doc.line(15, 85, 195, 85);

  // Items
  doc.setFont('helvetica', 'normal');
  let currentY = 92;
  order.items.forEach(item => {
    doc.text(item.name.substring(0, 50), 15, currentY);
    doc.text(String(item.quantity), 140, currentY, { align: 'center' });
    doc.text((item.price * item.quantity).toLocaleString(), 195, currentY, { align: 'right' });
    currentY += 10;
  });

  doc.line(15, currentY, 195, currentY);
  currentY += 10;

  // Totals
  doc.text('Subtotal', 140, currentY);
  doc.text(subtotal.toLocaleString(), 195, currentY, { align: 'right' });
  currentY += 7;
  doc.text('GST (18%)', 140, currentY);
  doc.text(gstAmount.toLocaleString(), 195, currentY, { align: 'right' });
  currentY += 10;
  
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.text('Grand Total', 140, currentY);
  doc.text(`INR ${finalTotal.toLocaleString()}`, 195, currentY, { align: 'right' });

  // Footer
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(150);
  doc.text('This is a computer generated invoice and does not require a signature.', 105, 280, { align: 'center' });
  doc.text('Generated by VexoKart Fulfillment Protocol', 105, 285, { align: 'center' });

  return doc;
};
