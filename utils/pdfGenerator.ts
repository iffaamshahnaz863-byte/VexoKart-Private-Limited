import { jsPDF } from 'jspdf';
import { Order } from '../types';

/**
 * Generates a production-ready shipping and tax label PDF.
 * Returns the jsPDF instance for direct download/printing.
 */
export const generateShippingLabelPDF = async (order: Order): Promise<jsPDF> => {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const address = order.shippingAddress || order.shipping_address;
  const isCOD = order.payment_mode === 'Cash on Delivery';
  
  const totalAmount = Number(order.total_amount || order.total || 0);
  const subtotal = totalAmount / 1.18;
  const gstAmount = totalAmount - subtotal;
  
  const vendorName = order.seller_name || order.items[0]?.vendor_name || 'VexoKart Authorized Vendor';
  const vendorId = order.vendor_id || order.items[0]?.vendor_id || 'VX-001';

  // --- HEADER ---
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(24);
  doc.text('VexoKart', 20, 20);
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.text('LOGISTICS HUB', 20, 24);

  doc.setFillColor(0, 0, 0);
  doc.rect(140, 12, 50, 12, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text(isCOD ? 'COD' : 'PAID', 165, 20, { align: 'center' });
  
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(10);
  doc.text(`Order #${order.id}`, 190, 28, { align: 'right' });

  doc.setLineWidth(0.8);
  doc.line(20, 32, 190, 32);

  // --- ADDRESSES ---
  doc.setFontSize(8);
  doc.setTextColor(120, 120, 120);
  doc.text('SHIP FROM', 20, 40);
  doc.text('DELIVER TO', 110, 40);

  doc.setTextColor(0, 0, 0);
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text(vendorName, 20, 46);
  doc.text(address?.fullName || 'Verified Customer', 110, 46);

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(60, 60, 60);
  doc.text(['Warehouse Node-A1', 'Industrial Estate', 'India', `ID: ${vendorId}`], 20, 52);
  
  const customerAddr = [
    address?.street || '',
    `${address?.city || ''}, ${address?.state || ''}`,
    `Phone: ${address?.phone || ''}`
  ];
  doc.text(customerAddr, 110, 52);

  doc.setFillColor(245, 245, 245);
  doc.rect(110, 72, 40, 10, 'F');
  doc.setDrawColor(0, 0, 0);
  doc.rect(110, 72, 40, 10, 'S');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.text(address?.zip || '000000', 130, 79, { align: 'center' });

  // --- LOGISTICS IDENTIFIERS ---
  doc.setLineWidth(0.3);
  doc.line(20, 88, 190, 88);

  doc.setFillColor(0, 0, 0);
  let startX = 25;
  const barWidths = [0.5, 1, 0.5, 1.5, 0.5, 2, 0.5, 1, 0.5, 1, 0.5, 2, 0.5, 1, 0.5, 1.5];
  for (let i = 0; i < 6; i++) {
    barWidths.forEach(w => {
        doc.rect(startX, 93, w, 15, 'F');
        startX += w + 0.8;
    });
  }

  doc.setTextColor(0, 0, 0);
  doc.setFontSize(9);
  doc.text(`ID: ${order.id}`, 105, 115, { align: 'center' });

  doc.setDrawColor(0, 0, 0);
  doc.setLineWidth(0.5);
  doc.rect(160, 93, 25, 25, 'S');
  doc.setFontSize(6);
  doc.text('SECURE QR', 172.5, 106, { align: 'center' });

  // --- ITEMS ---
  doc.setLineWidth(0.5);
  doc.line(20, 128, 190, 128);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.text('ITEM DESCRIPTION', 20, 134);
  doc.text('QTY', 180, 134, { align: 'right' });
  doc.line(20, 136, 190, 136);

  doc.setFont('helvetica', 'normal');
  let y = 143;
  order.items.forEach((item) => {
    doc.text(item.name.substring(0, 60), 20, y);
    doc.text(String(item.quantity), 180, y, { align: 'right' });
    y += 8;
  });

  // --- TOTALS ---
  doc.line(130, y + 5, 190, y + 5);
  y += 12;
  doc.setFontSize(8);
  doc.text('SUBTOTAL', 130, y);
  doc.text(`INR ${subtotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`, 190, y, { align: 'right' });
  
  y += 6;
  doc.text('GST (18%)', 130, y);
  doc.text(`INR ${gstAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`, 190, y, { align: 'right' });

  y += 10;
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('TOTAL PAYABLE', 130, y);
  doc.text(`INR ${totalAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`, 190, y, { align: 'right' });

  // --- FOOTER ---
  doc.setFontSize(7);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(180, 180, 180);
  doc.text('COMPUTER GENERATED LABEL • VEXOKART LOGISTICS V.5.0', 105, 280, { align: 'center' });

  return doc;
};
