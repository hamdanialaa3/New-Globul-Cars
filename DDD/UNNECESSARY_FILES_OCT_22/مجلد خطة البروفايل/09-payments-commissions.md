# القسم 9: نظام المدفوعات والعمولات

## 9.1 هيكل العمولات

```
Platform Commission:

Private (Free Plan):
  • No commission on sales
  • Platform is free

Private (Premium):
  • €9.99/month subscription
  • No commission on sales

Dealer:
  • Subscription: €49-199/month
  • Commission: 2% per successful sale
  • Minimum: €20 per car
  • Maximum: €500 per car
  • Charged after sale confirmation

Company:
  • Subscription: €299-999+/month
  • Commission: 1.5% per sale (volume discount)
  • Negotiable for large fleets
  • Invoiced monthly
```

## 9.2 Payment Flow

```
Subscription Payments:
  1. User selects plan
  2. Enter payment details (Stripe)
  3. Authorization hold
  4. 14-day free trial (Dealer/Company)
  5. First charge after trial
  6. Auto-renew monthly
  7. Invoice sent via email
  8. Tax receipt (if VAT registered)

Commission Payments:
  1. Car sold (buyer pays seller directly)
  2. Seller marks as "sold" in platform
  3. Platform calculates commission
  4. Invoice generated automatically
  5. Charge to payment method on file
  6. Or deduct from account balance
  7. Receipt sent
  8. Reflected in monthly statement
```

## 9.3 Payment Methods

```
Supported:
  - Credit/Debit Cards (Stripe)
  - Bank Transfer (SEPA)
  - PayPal (for international)
  - ePay.bg (Bulgarian standard)
  - Borica (Bulgarian banks)

Features:
  • Secure payment (PCI compliant)
  • Auto-retry failed payments
  • Payment reminders
  • Receipt generation
  • Tax invoices (Bulgarian format)
  • Refund processing
```
