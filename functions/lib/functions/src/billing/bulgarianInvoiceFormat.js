"use strict";
// functions/src/billing/bulgarianInvoiceFormat.ts
// Bulgarian Invoice PDF Generation
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateBulgarianInvoiceHTML = generateBulgarianInvoiceHTML;
exports.formatBulgarianDate = formatBulgarianDate;
exports.generateInvoiceNumber = generateInvoiceNumber;
exports.calculateVAT = calculateVAT;
exports.calculateTotalWithVAT = calculateTotalWithVAT;
/**
 * Generate Bulgarian invoice HTML
 * Follows Bulgarian accounting standards
 */
function generateBulgarianInvoiceHTML(data) {
    const html = `
<!DOCTYPE html>
<html lang="bg">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Фактура ${data.invoiceNumber}</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    
    body {
      font-family: Arial, sans-serif;
      font-size: 12px;
      line-height: 1.6;
      color: #333;
      padding: 20px;
    }
    
    .invoice-container {
      max-width: 210mm;
      margin: 0 auto;
      background: white;
      padding: 20mm;
    }
    
    .invoice-header {
      text-align: center;
      margin-bottom: 30px;
      border-bottom: 2px solid #333;
      padding-bottom: 20px;
    }
    
    .invoice-title {
      font-size: 24px;
      font-weight: bold;
      margin-bottom: 10px;
    }
    
    .invoice-number {
      font-size: 16px;
      color: #666;
    }
    
    .parties-section {
      display: table;
      width: 100%;
      margin-bottom: 30px;
    }
    
    .party {
      display: table-cell;
      width: 50%;
      vertical-align: top;
      padding: 15px;
    }
    
    .party-left {
      border-right: 1px solid #ddd;
    }
    
    .party-title {
      font-weight: bold;
      font-size: 14px;
      margin-bottom: 10px;
      text-transform: uppercase;
      color: #0066cc;
    }
    
    .party-info {
      line-height: 1.8;
    }
    
    .items-table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 30px;
    }
    
    .items-table th,
    .items-table td {
      border: 1px solid #ddd;
      padding: 10px;
      text-align: left;
    }
    
    .items-table th {
      background: #f5f5f5;
      font-weight: bold;
      text-align: center;
    }
    
    .items-table td.number {
      text-align: center;
    }
    
    .items-table td.amount {
      text-align: right;
    }
    
    .totals-section {
      float: right;
      width: 300px;
      margin-bottom: 30px;
    }
    
    .totals-table {
      width: 100%;
      border-collapse: collapse;
    }
    
    .totals-table td {
      padding: 8px;
      border-bottom: 1px solid #eee;
    }
    
    .totals-table td:first-child {
      text-align: left;
      font-weight: 600;
    }
    
    .totals-table td:last-child {
      text-align: right;
    }
    
    .totals-table tr.total {
      font-size: 16px;
      font-weight: bold;
      background: #f5f5f5;
    }
    
    .totals-table tr.total td {
      padding: 12px 8px;
      border-top: 2px solid #333;
      border-bottom: 2px solid #333;
    }
    
    .footer-section {
      clear: both;
      margin-top: 50px;
      padding-top: 20px;
      border-top: 1px solid #ddd;
    }
    
    .payment-info {
      margin-bottom: 20px;
    }
    
    .payment-title {
      font-weight: bold;
      margin-bottom: 10px;
    }
    
    .signatures {
      display: table;
      width: 100%;
      margin-top: 40px;
    }
    
    .signature {
      display: table-cell;
      width: 50%;
      text-align: center;
      padding: 20px;
    }
    
    .signature-line {
      border-top: 1px solid #333;
      margin-top: 60px;
      padding-top: 10px;
    }
    
    .notes {
      margin-top: 30px;
      padding: 15px;
      background: #f9f9f9;
      border-left: 3px solid #0066cc;
    }
    
    @media print {
      body {
        padding: 0;
      }
      
      .invoice-container {
        padding: 0;
      }
    }
  </style>
</head>
<body>
  <div class="invoice-container">
    <!-- Header -->
    <div class="invoice-header">
      <div class="invoice-title">ФАКТУРА</div>
      <div class="invoice-number">№ ${data.invoiceNumber}</div>
      <div style="margin-top: 10px;">Дата: ${data.issueDate}</div>
    </div>
    
    <!-- Parties -->
    <div class="parties-section">
      <div class="party party-left">
        <div class="party-title">Издател / Доставчик</div>
        <div class="party-info">
          <strong>${data.seller.name}</strong><br>
          Адрес: ${data.seller.address}<br>
          ЕИК/БУЛСТАТ: ${data.seller.eik}<br>
          ${data.seller.vat ? `ДДС №: ${data.seller.vat}<br>` : ''}
          МОЛ: ${data.seller.mol}<br>
          Телефон: ${data.seller.phone}<br>
          Email: ${data.seller.email}<br>
          <br>
          <strong>Банкова сметка:</strong><br>
          Банка: ${data.seller.bank}<br>
          IBAN: ${data.seller.iban}<br>
          BIC: ${data.seller.bic}
        </div>
      </div>
      
      <div class="party">
        <div class="party-title">Получател / Клиент</div>
        <div class="party-info">
          <strong>${data.buyer.name}</strong><br>
          Адрес: ${data.buyer.address}<br>
          ${data.buyer.eik ? `ЕИК/БУЛСТАТ: ${data.buyer.eik}<br>` : ''}
          ${data.buyer.vat ? `ДДС №: ${data.buyer.vat}<br>` : ''}
          ${data.buyer.mol ? `МОЛ: ${data.buyer.mol}<br>` : ''}
          Email: ${data.buyer.email}<br>
          ${data.buyer.phone ? `Телефон: ${data.buyer.phone}<br>` : ''}
        </div>
      </div>
    </div>
    
    <!-- Items Table -->
    <table class="items-table">
      <thead>
        <tr>
          <th style="width: 50px;">№</th>
          <th>Наименование на стоката/услугата</th>
          <th style="width: 80px;">Количество</th>
          <th style="width: 100px;">Ед. цена</th>
          <th style="width: 80px;">ДДС %</th>
          <th style="width: 120px;">Сума</th>
        </tr>
      </thead>
      <tbody>
        ${data.items.map((item, index) => `
          <tr>
            <td class="number">${index + 1}</td>
            <td>${item.description}</td>
            <td class="number">${item.quantity}</td>
            <td class="amount">${item.unitPrice.toFixed(2)}</td>
            <td class="number">${item.vat}%</td>
            <td class="amount">${item.total.toFixed(2)}</td>
          </tr>
        `).join('')}
      </tbody>
    </table>
    
    <!-- Totals -->
    <div class="totals-section">
      <table class="totals-table">
        <tr>
          <td>Стойност без ДДС:</td>
          <td>${data.subtotal.toFixed(2)} ${data.currency}</td>
        </tr>
        <tr>
          <td>ДДС:</td>
          <td>${data.totalVAT.toFixed(2)} ${data.currency}</td>
        </tr>
        <tr class="total">
          <td>ОБЩО ЗА ПЛАЩАНЕ:</td>
          <td>${data.total.toFixed(2)} ${data.currency}</td>
        </tr>
      </table>
    </div>
    
    <!-- Footer -->
    <div class="footer-section">
      <div class="payment-info">
        <div class="payment-title">Условия за плащане:</div>
        <div>Срок за плащане: ${data.paymentDueDate}</div>
        ${data.paymentMethod ? `<div>Метод на плащане: ${data.paymentMethod}</div>` : ''}
      </div>
      
      ${data.notes ? `
        <div class="notes">
          <strong>Забележки:</strong><br>
          ${data.notes}
        </div>
      ` : ''}
      
      <div class="signatures">
        <div class="signature">
          <div class="signature-line">
            Съставил<br>
            <small>(подпис и печат)</small>
          </div>
        </div>
        <div class="signature">
          <div class="signature-line">
            Получил<br>
            <small>(подпис и печат)</small>
          </div>
        </div>
      </div>
    </div>
  </div>
</body>
</html>
  `;
    return html.trim();
}
/**
 * Format Bulgarian date
 */
function formatBulgarianDate(date) {
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}.${month}.${year}`;
}
/**
 * Generate invoice number
 * Format: YYYY-MM-NNNN (e.g., 2025-10-0001)
 */
function generateInvoiceNumber(sequenceNumber, date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const sequence = String(sequenceNumber).padStart(4, '0');
    return `${year}-${month}-${sequence}`;
}
/**
 * Calculate VAT amount
 */
function calculateVAT(amount, vatPercent) {
    return (amount * vatPercent) / 100;
}
/**
 * Calculate total with VAT
 */
function calculateTotalWithVAT(amount, vatPercent) {
    const vat = calculateVAT(amount, vatPercent);
    return amount + vat;
}
//# sourceMappingURL=bulgarianInvoiceFormat.js.map