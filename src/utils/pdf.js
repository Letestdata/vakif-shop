// src/utils/pdf.js — Invoice PDF generator using jsPDF + jspdf-autotable
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

export function generateInvoicePDF(order) {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });

  const gold   = [212, 175, 55];
  const black  = [10, 10, 10];
  const white  = [255, 255, 255];
  const grey   = [60, 60, 60];
  const lgrey  = [240, 240, 240];

  // Helper function to format currency properly
  const formatCurrency = (amount) => {
    const num = parseFloat(amount || 0);
    return `Rs. ${num.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  // ── Header background ──
  doc.setFillColor(...black);
  doc.rect(0, 0, 210, 45, 'F');

  // Gold accent line
  doc.setFillColor(...gold);
  doc.rect(0, 45, 210, 1.5, 'F');

  // Logo text
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(32);
  doc.setTextColor(...gold);
  doc.text('VAAKIF', 20, 22);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(...white);
  doc.text('LUXURY ARTIFICIAL JEWELLERY', 20, 30);

  // Invoice label
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.setTextColor(...gold);
  doc.text('TAX INVOICE', 190, 18, { align: 'right' });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(200, 200, 200);
  doc.text(`Invoice: ${order.invoice_number || order.invoiceNumber || 'N/A'}`, 190, 26, { align: 'right' });
  doc.text(`Order: ${order.order_id || order.orderId}`, 190, 32, { align: 'right' });
  doc.text(`Date: ${new Date(order.created_at || order.date || Date.now()).toLocaleDateString('en-IN')}`, 190, 38, { align: 'right' });

  // ── Bill To section ──
  let y = 58;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(...gold);
  doc.text('BILL TO', 20, y);

  doc.setFillColor(...gold);
  doc.rect(20, y + 1, 20, 0.5, 'F');

  y += 8;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(...black);
  doc.text(order.customer_name || order.customerName || '', 20, y);

  y += 6;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(...grey);
  doc.text(`Phone: ${order.customer_phone || order.phone || ''}`, 20, y);
  y += 5;
  
  const addr = (order.delivery_address || order.address || '').slice(0, 100);
  const addrLines = doc.splitTextToSize(`Address: ${addr}`, 85);
  doc.text(addrLines, 20, y);
  y += addrLines.length * 5;

  if (order.customer_email || order.email) {
    doc.text(`Email: ${order.customer_email || order.email}`, 20, y);
    y += 5;
  }

  // ── Shop info (right side) ──
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(...gold);
  doc.text('FROM', 120, 58);
  doc.setFillColor(...gold);
  doc.rect(120, 59, 18, 0.5, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(...black);
  doc.text('Vaakif Jewellery', 120, 67);
  
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(...grey);
  doc.text('Supur, Idar, Gujarat - 383430', 120, 73);
  doc.text('+91 98989 37895', 120, 79);
  doc.text('vaakif@gmail.com', 120, 85);

  // ── Status badge ──
  const status = (order.status || 'pending').toUpperCase();
  const statusColor = {
    DELIVERED: [34, 197, 94],
    PENDING:   [234, 179, 8],
    CANCELLED: [239, 68, 68],
    CONFIRMED: [59, 130, 246],
    SHIPPED:   [168, 85, 247],
    PROCESSING:[249, 115, 22],
  }[status] || [150, 150, 150];

  doc.setFillColor(...statusColor);
  doc.roundedRect(120, 90, 40, 8, 2, 2, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(...white);
  doc.text(status, 140, 95.5, { align: 'center' });

  // ── Items table ──
  y = Math.max(y, 105);
  const items = Array.isArray(order.items)
    ? order.items
    : (typeof order.items === 'string' ? JSON.parse(order.items) : []);

  const tableBody = items.map((item, i) => {
    const qty = parseInt(item.quantity) || 1;
    const price = parseFloat(item.price) || 0;
    const total = price * qty;
    
    return [
      (i + 1).toString(),
      item.name || '',
      item.category || 'Jewellery',
      qty.toString(),
      formatCurrency(price),
      formatCurrency(total),
    ];
  });

  autoTable(doc, {
    startY: y,
    head: [['#', 'Product', 'Category', 'Qty', 'Unit Price', 'Total']],
    body: tableBody,
    margin: { left: 20, right: 20 },
    styles: { 
      font: 'helvetica', 
      fontSize: 9, 
      cellPadding: 3,
      lineColor: [200, 200, 200],
      lineWidth: 0.1,
    },
    headStyles: {
      fillColor: gold,
      textColor: black,
      fontStyle: 'bold',
      halign: 'center',
    },
    columnStyles: {
      0: { halign: 'center', cellWidth: 12 },
      1: { cellWidth: 70 },
      2: { cellWidth: 28, halign: 'center' },
      3: { halign: 'center', cellWidth: 15 },
      4: { halign: 'right', cellWidth: 30 },
      5: { halign: 'right', cellWidth: 30 },
    },
    alternateRowStyles: { fillColor: [252, 249, 241] },
    theme: 'striped',
  });

  const finalY = doc.lastAutoTable.finalY + 10;

  // ── Payment method (left side) ──
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(...grey);
  const paymentMethod = (order.payment_method || 'COD').toUpperCase();
  const paymentStatus = (order.payment_status || 'Unpaid');
  doc.text(`Payment Method: ${paymentMethod}`, 20, finalY + 5);
  doc.text(`Payment Status: ${paymentStatus}`, 20, finalY + 11);

  // ── Totals (right side) ──
  const subtotal       = parseFloat(order.subtotal || order.cartSubtotal || 0);
  const deliveryCharge = parseFloat(order.delivery_charge || order.deliveryCharge || 0);
  const grandTotal     = parseFloat(order.grand_total || order.cartTotal || 0);

  const totalsX = 115;
  const totalsWidth = 75;

  doc.setFillColor(...lgrey);
  doc.rect(totalsX, finalY, totalsWidth, 32, 'F');

  // Subtotal
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(...grey);
  doc.text('Subtotal:', totalsX + 5, finalY + 8);
  doc.text(formatCurrency(subtotal), totalsX + totalsWidth - 5, finalY + 8, { align: 'right' });

  // Delivery Charge
  doc.text('Delivery Charge:', totalsX + 5, finalY + 15);
  const deliveryText = deliveryCharge === 0 ? 'FREE' : formatCurrency(deliveryCharge);
  doc.text(deliveryText, totalsX + totalsWidth - 5, finalY + 15, { align: 'right' });

  // Separator line
  doc.setFillColor(...gold);
  doc.rect(totalsX + 5, finalY + 18, totalsWidth - 10, 0.5, 'F');

  // Grand Total
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(...black);
  doc.text('Grand Total:', totalsX + 5, finalY + 26);
  doc.text(formatCurrency(grandTotal), totalsX + totalsWidth - 5, finalY + 26, { align: 'right' });

  // ── Footer ──
  const footerY = 277;
  doc.setFillColor(...black);
  doc.rect(0, footerY, 210, 20, 'F');

  doc.setFont('helvetica', 'italic');
  doc.setFontSize(9);
  doc.setTextColor(...gold);
  doc.text('Thank you for shopping at Vaakif Jewellery!', 105, footerY + 7, { align: 'center' });
  
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(160, 160, 160);
  doc.text('Supur, Idar, Gujarat | +91 98989 37895 | vaakif@gmail.com | wa.me/919898937895', 105, footerY + 13, { align: 'center' });

  // ── Watermark (subtle) ──
  doc.setGState(new doc.GState({ opacity: 0.03 }));
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(70);
  doc.setTextColor(...gold);
  doc.text('VAAKIF', 105, 160, { align: 'center', angle: 45 });
  doc.setGState(new doc.GState({ opacity: 1 }));

  const filename = `Vaakif_Invoice_${order.invoice_number || order.order_id || 'order'}.pdf`;
  doc.save(filename);
}