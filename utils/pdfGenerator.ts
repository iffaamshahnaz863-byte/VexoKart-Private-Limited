import { jsPDF } from 'jspdf';
import { Order } from '../types';

/**
 * Generates a production-ready shipping and tax label PDF.
 * Layout mirrors standard Amazon/Flipkart courier manifests.
 */
export const generateShippingLabelPDF = async (order: Order): Promise<void> => {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const address = order.shippingAddress || order.shipping_address;
  const isCOD = order.payment_mode === 'Cash on Delivery';
  
  // Financial Math (Back-calculating 18% GST from inclusive total)
  const totalAmount = Number(order.total_amount || order.total || 0);
  const subtotal = totalAmount / 1.18;
  const gstAmount = totalAmount - subtotal;
  
  const vendorName = order.seller_name || order.items[0]?.vendor_name || 'VexoKart Authorized Vendor';
  const vendorId = order.vendor_id || order.items[0]?.vendor_id || 'VX-001';

  // --- TOP HEADER ---
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(24);
  doc.text('VexoKart', 20, 20);
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.text('LOGISTICS HUB', 20, 24);

  // Payment Badge (Right)
  doc.setFillColor(0, 0, 0);
  doc.rect(140, 12, 50, 12, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text(isCOD ? 'COD' : 'PAID', 165, 20, { align: 'center' });
  
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(10);
  doc.text(`Order #${order.id}`, 190, 28, { align: 'right' });

  // Divider
  doc.setLineWidth(0.8);
  doc.line(20, 32, 190, 32);

  // --- ADDRESS SECTION (2 COLUMN) ---
  doc.setFontSize(8);
  doc.setTextColor(120, 120, 120);
  doc.text('SHIP FROM', 20, 40);
  doc.text('DELIVER TO', 110, 40);

  doc.setTextColor(0, 0, 0);
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text(vendorName, 20, 46); // Vendor
  doc.text(address?.fullName || 'Verified Customer', 110, 46); // Customer

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(60, 60, 60);
  
  // Vendor Block
  doc.text(['VexoKart Warehouse Node-A1', 'Fulfillment Park, Industrial Zone', 'India', `Vendor ID: ${vendorId}`, 'Ph: 1800-VEXO-KART'], 20, 52);
  
  // Customer Block
  const customerAddr = [
    address?.street || '',
    `${address?.city || ''}, ${address?.state || ''}`,
    `Phone: ${address?.phone || ''}`
  ];
  doc.text(customerAddr, 110, 52);

  // Pincode Highlight Box
  doc.setFillColor(245, 245, 245);
  doc.rect(110, 68, 40, 10, 'F');
  doc.setDrawColor(0, 0, 0);
  doc.rect(110, 68, 40, 10, 'S');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.text(address?.zip || '000000', 130, 75, { align: 'center' });

  // --- BARCODE / QR IDENTIFICATION ---
  doc.setLineWidth(0.3);
  doc.line(20, 85, 190, 85);

  // Barcode (1D Representative)
  doc.setFontSize(7);
  doc.setTextColor(150, 150, 150);
  doc.rect(20, 90, 120, 20); // Border for visual grouping
  doc.setFont('helvetica', 'normal');
  doc.text('||| || |||| ||| || |||| ||| || |||| ||| || ||||', 80, 100, { align: 'center' }); // Visual representation
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(9);
  doc.text(`ID: ${order.id}`, 80, 106, { align: 'center' });

  // QR Node
  doc.rect(155, 90, 25, 25);
  doc.setFontSize(6);
  doc.text('QR SECURE', 167.5, 103, { align: 'center' });

  // --- ITEM SUMMARY ---
  doc.setLineWidth(0.5);
  doc.line(20, 125, 190, 125);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.text('ITEM DESCRIPTION', 20, 131);
  doc.text('QTY', 180, 131, { align: 'right' });
  doc.line(20, 133, 190, 133);

  doc.setFont('helvetica', 'normal');
  let y = 140;
  order.items.forEach((item) => {
    const itemName = item.name.length > 60 ? item.name.substring(0, 57) + '...' : item.name;
    doc.text(itemName, 20, y);
    doc.text(String(item.quantity), 180, y, { align: 'right' });
    y += 8;
  });

  // --- PRICE & TAX ---
  doc.line(130, y + 5, 190, y + 5);
  y += 12;
  doc.setFontSize(8);
  doc.setTextColor(100, 100, 100);
  doc.text('SUBTOTAL', 130, y);
  doc.setTextColor(0, 0, 0);
  doc.text(`INR ${subtotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`, 190, y, { align: 'right' });
  
  y += 6;
  doc.setTextColor(100, 100, 100);
  doc.text('GST (18%)', 130, y);
  doc.setTextColor(0, 0, 0);
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
  doc.text('THIS IS A COMPUTER GENERATED SHIPPING LABEL • VERIFIED BY VEXOKART PROTOCOL V.5.0', 105, 280, { align: 'center' });
  doc.text('VexoKart Fulfillment System • Secure Logistics Node', 105, 284, { align: 'center' });

  // Trigger Download
  doc.save(`VexoKart_Label_Order_${order.id}.pdf`);
};
