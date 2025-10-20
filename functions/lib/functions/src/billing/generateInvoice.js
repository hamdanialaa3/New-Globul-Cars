"use strict";
// functions/src/billing/generateInvoice.ts
// Invoice Generation System for Bulgarian Market
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendInvoiceEmail = exports.updateInvoiceStatus = exports.getInvoice = exports.getInvoices = exports.generateInvoice = void 0;
const https_1 = require("firebase-functions/v2/https");
const firestore_1 = require("firebase-admin/firestore");
const bulgarianInvoiceFormat_1 = require("./bulgarianInvoiceFormat");
const db = (0, firestore_1.getFirestore)();
// Globul Cars company details (should be in environment variables in production)
const COMPANY_INFO = {
    name: 'Globul Cars EOOD',
    address: 'гр. София, бул. Цариградско шосе 115',
    eik: '123456789', // Replace with real EIK
    vat: 'BG123456789', // Replace with real VAT number
    mol: 'Иван Иванов', // Replace with real MOL
    phone: '+359 888 123 456',
    email: 'invoice@globul.net',
    bank: 'Банка ДСК',
    iban: 'BG80BNBG96611020345678', // Replace with real IBAN
    bic: 'BNBGBGSD',
};
/**
 * Generate invoice for a transaction
 */
exports.generateInvoice = (0, https_1.onCall)(async (request) => {
    var _a;
    const { auth, data } = request;
    if (!auth) {
        throw new https_1.HttpsError('unauthenticated', 'User must be authenticated');
    }
    // Only admins can generate invoices
    const adminDoc = await db.collection('admins').doc(auth.uid).get();
    if (!adminDoc.exists) {
        throw new https_1.HttpsError('permission-denied', 'Only admins can generate invoices');
    }
    const { buyerId, items, type = 'standard', notes, paymentMethod, referenceNumber } = data;
    if (!buyerId || !items || items.length === 0) {
        throw new https_1.HttpsError('invalid-argument', 'Buyer ID and items are required');
    }
    try {
        // Get buyer information
        const buyerDoc = await db.collection('users').doc(buyerId).get();
        if (!buyerDoc.exists) {
            throw new https_1.HttpsError('not-found', 'Buyer not found');
        }
        const buyerData = buyerDoc.data();
        // Calculate invoice totals
        let subtotal = 0;
        let totalVAT = 0;
        const invoiceItems = [];
        for (const item of items) {
            const vatPercent = item.vat || 20; // Default 20% VAT
            const itemSubtotal = item.quantity * item.unitPrice;
            const itemVAT = (0, bulgarianInvoiceFormat_1.calculateVAT)(itemSubtotal, vatPercent);
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
            sequenceNumber = (((_a = sequenceDoc.data()) === null || _a === void 0 ? void 0 : _a.value) || 0) + 1;
        }
        const invoiceNumber = (0, bulgarianInvoiceFormat_1.generateInvoiceNumber)(sequenceNumber, now);
        // Update sequence counter
        await db
            .collection('counters')
            .doc('invoiceSequence')
            .set({ value: sequenceNumber, updatedAt: firestore_1.Timestamp.now() });
        // Create invoice
        const invoiceRef = db.collection('invoices').doc();
        const paymentDueDate = new Date(now);
        paymentDueDate.setDate(paymentDueDate.getDate() + 14); // 14 days payment term
        const invoice = {
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
            buyerName: (buyerData === null || buyerData === void 0 ? void 0 : buyerData.businessName) || (buyerData === null || buyerData === void 0 ? void 0 : buyerData.displayName) || 'Unknown',
            buyerAddress: (buyerData === null || buyerData === void 0 ? void 0 : buyerData.address) || 'N/A',
            buyerEIK: buyerData === null || buyerData === void 0 ? void 0 : buyerData.eik,
            buyerVAT: buyerData === null || buyerData === void 0 ? void 0 : buyerData.vatNumber,
            buyerEmail: (buyerData === null || buyerData === void 0 ? void 0 : buyerData.email) || '',
            buyerPhone: buyerData === null || buyerData === void 0 ? void 0 : buyerData.phoneNumber,
            // Items
            items: invoiceItems,
            subtotal,
            totalVAT,
            total,
            currency: 'BGN',
            // Payment
            paymentMethod: paymentMethod,
            paymentDueDate: firestore_1.Timestamp.fromDate(paymentDueDate),
            // Metadata
            notes,
            referenceNumber,
            // Timestamps
            issueDate: firestore_1.Timestamp.now(),
            createdAt: firestore_1.Timestamp.now(),
            updatedAt: firestore_1.Timestamp.now(),
        };
        await invoiceRef.set(invoice);
        // Generate PDF (HTML for now, can be converted to PDF later)
        const bulgarianData = {
            invoiceNumber,
            issueDate: (0, bulgarianInvoiceFormat_1.formatBulgarianDate)(now),
            paymentDueDate: (0, bulgarianInvoiceFormat_1.formatBulgarianDate)(paymentDueDate),
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
        const invoiceHTML = (0, bulgarianInvoiceFormat_1.generateBulgarianInvoiceHTML)(bulgarianData);
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
            timestamp: firestore_1.Timestamp.now(),
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
    }
    catch (error) {
        console.error('Error generating invoice:', error);
        throw new https_1.HttpsError('internal', error.message);
    }
});
/**
 * Get invoices for a user
 */
exports.getInvoices = (0, https_1.onCall)(async (request) => {
    const { auth } = request;
    if (!auth) {
        throw new https_1.HttpsError('unauthenticated', 'User must be authenticated');
    }
    try {
        // Check if admin or buyer
        const adminDoc = await db.collection('admins').doc(auth.uid).get();
        const isAdmin = adminDoc.exists;
        let invoicesQuery;
        if (isAdmin) {
            // Admin sees all invoices
            invoicesQuery = db.collection('invoices').orderBy('createdAt', 'desc').limit(100);
        }
        else {
            // User sees only their invoices
            invoicesQuery = db
                .collection('invoices')
                .where('buyerId', '==', auth.uid)
                .orderBy('createdAt', 'desc')
                .limit(50);
        }
        const invoicesSnapshot = await invoicesQuery.get();
        const invoices = invoicesSnapshot.docs.map((doc) => (Object.assign({ id: doc.id }, doc.data())));
        return {
            success: true,
            invoices,
            count: invoices.length,
        };
    }
    catch (error) {
        console.error('Error getting invoices:', error);
        throw new https_1.HttpsError('internal', error.message);
    }
});
/**
 * Get single invoice details
 */
exports.getInvoice = (0, https_1.onCall)(async (request) => {
    const { auth, data } = request;
    if (!auth) {
        throw new https_1.HttpsError('unauthenticated', 'User must be authenticated');
    }
    const { invoiceId } = data;
    if (!invoiceId) {
        throw new https_1.HttpsError('invalid-argument', 'Invoice ID is required');
    }
    try {
        const invoiceDoc = await db.collection('invoices').doc(invoiceId).get();
        if (!invoiceDoc.exists) {
            throw new https_1.HttpsError('not-found', 'Invoice not found');
        }
        const invoiceData = invoiceDoc.data();
        // Check permission
        const adminDoc = await db.collection('admins').doc(auth.uid).get();
        const isAdmin = adminDoc.exists;
        if (!isAdmin && (invoiceData === null || invoiceData === void 0 ? void 0 : invoiceData.buyerId) !== auth.uid) {
            throw new https_1.HttpsError('permission-denied', 'You can only view your own invoices');
        }
        return {
            success: true,
            invoice: Object.assign({ id: invoiceDoc.id }, invoiceData),
        };
    }
    catch (error) {
        console.error('Error getting invoice:', error);
        throw new https_1.HttpsError('internal', error.message);
    }
});
/**
 * Update invoice status
 */
exports.updateInvoiceStatus = (0, https_1.onCall)(async (request) => {
    const { auth, data } = request;
    if (!auth) {
        throw new https_1.HttpsError('unauthenticated', 'User must be authenticated');
    }
    // Only admins can update invoice status
    const adminDoc = await db.collection('admins').doc(auth.uid).get();
    if (!adminDoc.exists) {
        throw new https_1.HttpsError('permission-denied', 'Only admins can update invoice status');
    }
    const { invoiceId, status, paidAt } = data;
    if (!invoiceId || !status) {
        throw new https_1.HttpsError('invalid-argument', 'Invoice ID and status are required');
    }
    const validStatuses = ['sent', 'paid', 'cancelled'];
    if (!validStatuses.includes(status)) {
        throw new https_1.HttpsError('invalid-argument', 'Invalid status');
    }
    try {
        const invoiceRef = db.collection('invoices').doc(invoiceId);
        const invoiceDoc = await invoiceRef.get();
        if (!invoiceDoc.exists) {
            throw new https_1.HttpsError('not-found', 'Invoice not found');
        }
        const updates = {
            status,
            updatedAt: firestore_1.Timestamp.now(),
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
            timestamp: firestore_1.Timestamp.now(),
        });
        return {
            success: true,
            message: 'Invoice status updated successfully',
        };
    }
    catch (error) {
        console.error('Error updating invoice status:', error);
        throw new https_1.HttpsError('internal', error.message);
    }
});
/**
 * Send invoice via email
 */
exports.sendInvoiceEmail = (0, https_1.onCall)(async (request) => {
    const { auth, data } = request;
    if (!auth) {
        throw new https_1.HttpsError('unauthenticated', 'User must be authenticated');
    }
    // Only admins can send invoices
    const adminDoc = await db.collection('admins').doc(auth.uid).get();
    if (!adminDoc.exists) {
        throw new https_1.HttpsError('permission-denied', 'Only admins can send invoices');
    }
    const { invoiceId } = data;
    if (!invoiceId) {
        throw new https_1.HttpsError('invalid-argument', 'Invoice ID is required');
    }
    try {
        const invoiceDoc = await db.collection('invoices').doc(invoiceId).get();
        if (!invoiceDoc.exists) {
            throw new https_1.HttpsError('not-found', 'Invoice not found');
        }
        const invoiceData = invoiceDoc.data();
        // Send email via mail collection
        await db.collection('mail').add({
            to: invoiceData.buyerEmail,
            message: {
                subject: `Фактура ${invoiceData.invoiceNumber} от Globul Cars`,
                html: `
          <h2>Здравейте, ${invoiceData.buyerName}</h2>
          <p>Получихте нова фактура от Globul Cars.</p>
          <p><strong>Номер на фактура:</strong> ${invoiceData.invoiceNumber}</p>
          <p><strong>Дата:</strong> ${(0, bulgarianInvoiceFormat_1.formatBulgarianDate)(invoiceData.issueDate.toDate())}</p>
          <p><strong>Обща сума:</strong> ${invoiceData.total.toFixed(2)} ${invoiceData.currency}</p>
          <p><strong>Срок за плащане:</strong> ${(0, bulgarianInvoiceFormat_1.formatBulgarianDate)(invoiceData.paymentDueDate.toDate())}</p>
          <p>Можете да видите пълната фактура в секция "Фактури" във вашия профил.</p>
          <p>С уважение,<br>Екипът на Globul Cars</p>
        `,
            },
        });
        // Update invoice status to sent
        await db.collection('invoices').doc(invoiceId).update({
            status: 'sent',
            sentAt: firestore_1.Timestamp.now(),
            updatedAt: firestore_1.Timestamp.now(),
        });
        // Log activity
        await db.collection('activities').add({
            userId: auth.uid,
            type: 'invoice_sent',
            description: `Sent invoice ${invoiceData.invoiceNumber} to ${invoiceData.buyerEmail}`,
            metadata: { invoiceId },
            timestamp: firestore_1.Timestamp.now(),
        });
        return {
            success: true,
            message: 'Invoice sent successfully',
        };
    }
    catch (error) {
        console.error('Error sending invoice:', error);
        throw new https_1.HttpsError('internal', error.message);
    }
});
//# sourceMappingURL=generateInvoice.js.map