# القسم 18: Verification and Approval System (Detailed)

## 18.1 Verification Levels

```
Level Progression:
  none → basic → business → company

none:
  - No verification
  - Default for new accounts
  - Access: basic features only

basic:
  - Email + Phone verified
  - All profile types can achieve
  - Trust Score: +30

business:
  - basic + EIK/BULSTAT verified + documents
  - Required for dealer
  - Trust Score: +20

company:
  - business + full corporate docs + team setup
  - Required for company type
  - Trust Score: +20
```

## 18.2 Approval Workflow (Private → Dealer)

```
Step-by-Step Process:

1. User clicks "Upgrade to Dealer" button in profile
   
2. Pre-check modal appears:
   Bulgarian: "Необходими изисквания за дилър"
   English: "Dealer Requirements"
   
   Requirements shown:
   - Email verified (check/cross)
   - Phone verified (check/cross)
   - Business registration (pending)
   - Payment method (pending)
   
   Buttons: [Cancel] [Continue]

3. Terms & Conditions page:
   Sections:
   - Dealer responsibilities
   - Consumer protection laws (Bulgaria)
   - Platform fees and commissions
   - Data protection (GDPR)
   
   Checkbox: "I accept the terms"
   Button: [Continue to Documents]

4. Document Upload page:
   Required documents:
   - Business license (PDF/JPG, max 5MB)
   - EIK/BULSTAT certificate (PDF/JPG)
   - Owner ID (PDF/JPG)
   - Proof of address (PDF/JPG)
   
   Optional:
   - Insurance policy
   - Tax registration
   
   Each document:
   - Upload button
   - Preview
   - Status: pending/uploaded/verified
   
   Button: [Submit for Review]

5. Submission confirmation:
   Message:
   Bulgarian: "Вашата заявка е подадена успешно"
   English: "Your application has been submitted"
   
   Expected time: 24-48 business hours
   Notification: Email when reviewed

6. Admin Review (backend):
   Admin Dashboard shows pending applications
   
   For each application:
   - User details
   - Documents preview
   - EIK verification button (calls external API)
   - Notes field
   - Actions: [Approve] [Reject] [Request More Info]
   
   On Approve:
   - profileType → 'dealer'
   - verification.status → 'approved'
   - verification.level → 'business'
   - Email notification sent
   - Onboarding email triggered
   
   On Reject:
   - verification.status → 'rejected'
   - Email with reason
   - User can resubmit after fixing issues

7. Post-Approval:
   - User receives email
   - Logs in to see dealer profile activated
   - Green theme applied
   - New features unlocked
   - Onboarding checklist appears

Total Duration: 2-5 days
```

## 18.3 EIK/BULSTAT Verification (External API)

```
API Integration:
  Endpoint: https://portal.registryagency.bg/api/  (example)
  Method: POST
  Payload: { eik: "123456789" }
  Response: { valid: boolean, companyName: string, status: string }

Implementation:
  - Cloud Function: verifyEIK(eik: string)
  - Calls Bulgarian Registry API
  - Validates EIK format first (9 or 13 digits)
  - Checks against registry
  - Returns company data if valid
  - Stores result in verification.notes
  - Manual review if API unavailable

Fallback:
  - If API fails, admin reviews manually
  - Can check manually at: https://portal.registryagency.bg/
```
