// functions/src/billing/generateInvoice.ts
// Invoice Generation System for Bulgarian Market

import { onCall, HttpsError } from 'firebase-functions/v2/https';
import { getFirestore, Timestamp, FieldValue } from 'firebase-admin/firestore';
import {
  GenerateInvoiceRequest,
  UpdateInvoiceStatusRequest,
  SendInvoiceEmailRequest,
  Invoice,
  InvoiceItem,
  BulgarianInvoiceData,
} from './types';
import {
  generateBulgarianInvoiceHTML,
  formatBulgarianDate,
  generateInvoiceNumber,
  calculateVAT,
} from './bulgarianInvoiceFormat';

const db = getFirestore();

// Globul Cars company details (should be in environment variables in production)
const COMPANY_INFO = {
  name: 'Globul Cars EOOD',
  address: 'гр. София, бул. Цариградско шосе 115',
  eik: '123456789', // Replace with real EIK
  vat: 'BG123456789', // Replace with real VAT number
  mol: 'Иван Иванов', // Replace with real MOL
  phone: '+359 888 123 456',
  email: 'invoice@mobilebg.eu',
  bank: 'Банка ДСК',
  iban: 'BG80BNBG96611020345678', // Replace with real IBAN
  bic: 'BNBGBGSD',
};

/**
 * Generate invoice for a transaction
 */
export const generateInvoice = onCall<GenerateInvoiceRequest>(async (request) => {
  const { auth, data } = request;

  if (!auth) {
    throw new HttpsError('unauthenticated', 'User must be authenticated');
  }

  // Only admins can generate invoices
  const adminDoc = await db.collection('admins').doc(auth.uid).get();
  if (!adminDoc.exists) {
    throw new HttpsError('permission-denied', 'Only admins can generate invoices');
  }

  const { buyerId, items, type = 'standard', notes, paymentMethod, referenceNumber } = data;

  if (!buyerId || !items || items.length === 0) {
    throw new HttpsError('invalid-argument', 'Buyer ID and items are required');
  }

  try {
    // Get buyer information
    const buyerDoc = await db.collection('users').doc(buyerId).get();
    if (!buyerDoc.exists) {
      throw new HttpsError('not-found', 'Buyer not found');
    }

    const buyerData = buyerDoc.data();

    // Calculate invoice totals
    let subtotal = 0;
    let totalVAT = 0;
    const invoiceItems: InvoiceItem[] = [];

    for (const item of items) {
      const vatPercent = item.vat || 20; // Default 20% VAT
      const itemSubtotal = item.quantity * item.unitPrice;
      const itemVAT = calculateVAT(itemSubtotal, vatPercent);
      const itemTotal = itemSubtotal + itemVAT;

      invoiceItems.push({
        description: item.description,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        vat: vatPercent,
        total: itemTotal,
      });

      subtotal += itemSubtotal;
      totalVAT += itemVAT;
    }

    const total = subtotal + totalVAT;

    // Generate invoice number
    const now = new Date();
    const sequenceDoc = await db.collection('counters').doc('invoiceSequence').get();
    let sequenceNumber = 1;

    if (sequenceDoc.exists) {
      sequenceNumber = (sequenceDoc.data()?.value || 0) + 1;
    }

    const invoiceNumber = generateInvoiceNumber(sequenceNumber, now);

    // Update sequence counter
    await db
      .collection('counters')
      .doc('invoiceSequence')
      .set({ value: sequenceNumber, updatedAt: Timestamp.now() });

    // Create invoice
    const invoiceRef = db.collection('invoices').doc();
    const paymentDueDate = new Date(now);
    paymentDueDate.setDate(paymentDueDate.getDate() + 14); // 14 days payment term

    const invoice: Invoice = {
      id: invoiceRef.id,
      invoiceNumber,
      type,
      status: 'draft',
      
      // Seller (Globul Cars)
      sellerName: COMPANY_INFO.name,
      sellerAddress: COMPANY_INFO.address,
      sellerEIK: COMPANY_INFO.eik,
      sellerVAT: COMPANY_INFO.vat,
      sellerPhone: COMPANY_INFO.phone,
      sellerEmail: COMPANY_INFO.email,
      sellerBank: COMPANY_INFO.bank,
      sellerIBAN: COMPANY_INFO.iban,
      sellerBIC: COMPANY_INFO.bic,
      
      // Buyer
      buyerId,
      buyerName: buyerData?.businessName || buyerData?.displayName || 'Unknown',
      buyerAddress: buyerData?.address || 'N/A',
      buyerEIK: buyerData?.eik,
      buyerVAT: buyerData?.vatNumber,
      buyerEmail: buyerData?.email || '',
      buyerPhone: buyerData?.phoneNumber,
      
      // Items
      items: invoiceItems,
      subtotal,
      totalVAT,
      total,
      currency: 'BGN',
      
      // Payment
      paymentMethod: paymentMethod as any,
      paymentDueDate: Timestamp.fromDate(paymentDueDate),
      
      // Metadata
      notes,
      referenceNumber,
      
      // Timestamps
      issueDate: Timestamp.now(),
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    };

    await invoiceRef.set(invoice);

    // Generate PDF (HTML for now, can be converted to PDF later)
    const bulgarianData: BulgarianInvoiceData = {
      invoiceNumber,
      issueDate: formatBulgarianDate(now),
      paymentDueDate: formatBulgarianDate(paymentDueDate),
      seller: {
        name: COMPANY_INFO.name,
        address: COMPANY_INFO.address,
        eik: COMPANY_INFO.eik,
        vat: COMPANY_INFO.vat,
        mol: COMPANY_INFO.mol,
        phone: COMPANY_INFO.phone,
        email: COMPANY_INFO.email,
        bank: COMPANY_INFO.bank,
        iban: COMPANY_INFO.iban,
        bic: COMPANY_INFO.bic,
      },
      buyer: {
        name: invoice.buyerName,
        address: invoice.buyerAddress,
        eik: invoice.buyerEIK,
        vat: invoice.buyerVAT,
        email: invoice.buyerEmail,
        phone: invoice.buyerPhone,
      },
      items: invoiceItems,
      subtotal,
      totalVAT,
      total,
      currency: 'BGN',
      notes,
      paymentMethod,
    };

    const invoiceHTML = generateBulgarianInvoiceHTML(bulgarianData);

    // Store HTML in Firestore (in production, convert to PDF and store in Storage)
    await invoiceRef.update({
      htmlContent: invoiceHTML,
    });

    // Log activity
    await db.collection('activities').add({
      userId: auth.uid,
      type: 'invoice_generated',
      description: `Generated invoice ${invoiceNumber} for ${invoice.buyerName}`,
      metadata: { invoiceId: invoiceRef.id, invoiceNumber },
      timestamp: Timestamp.now(),
    });

    return {
      success: true,
      invoice: {
        id: invoiceRef.id,
        invoiceNumber,
        total,
      },
      message: 'Invoice generated successfully',
    };
  } catch (error: any) {
    console.error('Error generating invoice:', error);
    throw new HttpsError('internal', error.message);
  }
});

/**
 * Get invoices for a user
 */
export const getInvoices = onCall(async (request) => {
  const { auth } = request;

  if (!auth) {
    throw new HttpsError('unauthenticated', 'User must be authenticated');
  }

  try {
    // Check if admin or buyer
    const adminDoc = await db.collection('admins').doc(auth.uid).get();
    const isAdmin = adminDoc.exists;

    let invoicesQuery;
    if (isAdmin) {
      // Admin sees all invoices
      invoicesQuery = db.collection('invoices').orderBy('createdAt', 'desc').limit(100);
    } else {
      // User sees only their invoices
      invoicesQuery = db
        .collection('invoices')
        .where('buyerId', '==', auth.uid)
        .orderBy('createdAt', 'desc')
        .limit(50);
    }

    const invoicesSnapshot = await invoicesQuery.get();
    const invoices = invoicesSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    return {
      success: true,
      invoices,
      count: invoices.length,
    };
  } catch (error: any) {
    console.error('Error getting invoices:', error);
    throw new HttpsError('internal', error.message);
  }
});

/**
 * Get single invoice details
 */
export const getInvoice = onCall<{ invoiceId: string }>(async (request) => {
  const { auth, data } = request;

  if (!auth) {
    throw new HttpsError('unauthenticated', 'User must be authenticated');
  }

  const { invoiceId } = data;

  if (!invoiceId) {
    throw new HttpsError('invalid-argument', 'Invoice ID is required');
  }

  try {
    const invoiceDoc = await db.collection('invoices').doc(invoiceId).get();
    if (!invoiceDoc.exists) {
      throw new HttpsError('not-found', 'Invoice not found');
    }

    const invoiceData = invoiceDoc.data();

    // Check permission
    const adminDoc = await db.collection('admins').doc(auth.uid).get();
    const isAdmin = adminDoc.exists;

    if (!isAdmin && invoiceData?.buyerId !== auth.uid) {
      throw new HttpsError('permission-denied', 'You can only view your own invoices');
    }

    return {
      success: true,
      invoice: {
        id: invoiceDoc.id,
        ...invoiceData,
      },
    };
  } catch (error: any) {
    console.error('Error getting invoice:', error);
    throw new HttpsError('internal', error.message);
  }
});

/**
 * Update invoice status
 */
export const updateInvoiceStatus = onCall<UpdateInvoiceStatusRequest>(async (request) => {
  const { auth, data } = request;

  if (!auth) {
    throw new HttpsError('unauthenticated', 'User must be authenticated');
  }

  // Only admins can update invoice status
  const adminDoc = await db.collection('admins').doc(auth.uid).get();
  if (!adminDoc.exists) {
    throw new HttpsError('permission-denied', 'Only admins can update invoice status');
  }

  const { invoiceId, status, paidAt } = data;

  if (!invoiceId || !status) {
    throw new HttpsError('invalid-argument', 'Invoice ID and status are required');
  }

  const validStatuses = ['sent', 'paid', 'cancelled'];
  if (!validStatuses.includes(status)) {
    throw new HttpsError('invalid-argument', 'Invalid status');
  }

  try {
    const invoiceRef = db.collection('invoices').doc(invoiceId);
    const invoiceDoc = await invoiceRef.get();

    if (!invoiceDoc.exists) {
      throw new HttpsError('not-found', 'Invoice not found');
    }

    const updates: any = {
      status,
      updatedAt: Timestamp.now(),
    };

    if (status === 'paid' && paidAt) {
      updates.paidAt = paidAt;
    }

    await invoiceRef.update(updates);

    // Log activity
    await db.collection('activities').add({
      userId: auth.uid,
      type: 'invoice_status_updated',
      description: `Updated invoice status to: ${status}`,
      metadata: { invoiceId, status },
      timestamp: Timestamp.now(),
    });

    return {
      success: true,
      message: 'Invoice status updated successfully',
    };
  } catch (error: any) {
    console.error('Error updating invoice status:', error);
    throw new HttpsError('internal', error.message);
  }
});

/**
 * Send invoice via email
 */
export const sendInvoiceEmail = onCall<SendInvoiceEmailRequest>(async (request) => {
  const { auth, data } = request;

  if (!auth) {
    throw new HttpsError('unauthenticated', 'User must be authenticated');
  }

  // Only admins can send invoices
  const adminDoc = await db.collection('admins').doc(auth.uid).get();
  if (!adminDoc.exists) {
    throw new HttpsError('permission-denied', 'Only admins can send invoices');
  }

  const { invoiceId } = data;

  if (!invoiceId) {
    throw new HttpsError('invalid-argument', 'Invoice ID is required');
  }

  try {
    const invoiceDoc = await db.collection('invoices').doc(invoiceId).get();
    if (!invoiceDoc.exists) {
      throw new HttpsError('not-found', 'Invoice not found');
    }

    const invoiceData = invoiceDoc.data() as Invoice;

    // Send email via mail collection
    await db.collection('mail').add({
      to: invoiceData.buyerEmail,
      message: {
        subject: `Фактура ${invoiceData.invoiceNumber} от Globul Cars`,
        html: `
          <h2>Здравейте, ${invoiceData.buyerName}</h2>
          <p>Получихте нова фактура от Globul Cars.</p>
          <p><strong>Номер на фактура:</strong> ${invoiceData.invoiceNumber}</p>
          <p><strong>Дата:</strong> ${formatBulgarianDate(invoiceData.issueDate.toDate())}</p>
          <p><strong>Обща сума:</strong> ${invoiceData.total.toFixed(2)} ${invoiceData.currency}</p>
          <p><strong>Срок за плащане:</strong> ${formatBulgarianDate(invoiceData.paymentDueDate.toDate())}</p>
          <p>Можете да видите пълната фактура в секция "Фактури" във вашия профил.</p>
          <p>С уважение,<br>Екипът на Globul Cars</p>
        `,
      },
    });

    // Update invoice status to sent
    await db.collection('invoices').doc(invoiceId).update({
      status: 'sent',
      sentAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    });

    // Log activity
    await db.collection('activities').add({
      userId: auth.uid,
      type: 'invoice_sent',
      description: `Sent invoice ${invoiceData.invoiceNumber} to ${invoiceData.buyerEmail}`,
      metadata: { invoiceId },
      timestamp: Timestamp.now(),
    });

    return {
      success: true,
      message: 'Invoice sent successfully',
    };
  } catch (error: any) {
    console.error('Error sending invoice:', error);
    throw new HttpsError('internal', error.message);
  }
});
