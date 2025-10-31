# ✅ Integration Test Checklist - ID Card System

## 🎯 نظرة عامة

هذا الـ checklist للتأكد من أن كل شيء يعمل بشكل متكامل.

---

## 🧪 Pre-Test Setup

### ✅ Environment Check:
```bash
cd bulgarian-car-marketplace

# Check Node version
node --version  # Should be >= 16

# Check dependencies
npm list firebase
npm list firestore

# Check if running
ps aux | grep node
```

### ✅ Firebase Config:
```bash
# Check Firestore rules
cat firestore.rules

# Verify firebase.json
cat firebase.json

# Test Firebase connection
firebase projects:list
```

### ✅ Assets Check:
```bash
# ID card images must exist
ls public/assets/ID_front\ \(1\).png
ls public/assets/ID_Back.png
```

---

## 🧪 Test Scenarios

### Test 1: Basic Page Load
**URL:** `http://localhost:3000/profile`

**Steps:**
1. ✅ Navigate to profile page
2. ✅ Click "Settings" tab
3. ✅ Verify "ID Card" section appears
4. ✅ Check for "Edit with ID Card" button

**Expected:**
- Section renders without errors
- Button is clickable
- No console errors

---

### Test 2: Open ID Card Editor
**Prerequisites:** Logged in user

**Steps:**
1. ✅ Click "Edit with ID Card" button
2. ✅ Wait for loading overlay (if first time)
3. ✅ Verify modal opens
4. ✅ Check "Front Side" tab is active
5. ✅ Verify left column shows form
6. ✅ Verify right column shows ID image

**Expected:**
- Modal opens smoothly (animation)
- Form sections visible:
  - 📄 Document
  - 👤 Names (Cyrillic)
  - 🔤 Names (Latin)
  - ℹ️ Personal Info
  - 📅 Validity
- ID card image loads correctly
- No layout issues

---

### Test 3: Form Validation
**Prerequisites:** ID Editor open

**Test 3.1: Empty Form Submission**
**Steps:**
1. ✅ Leave all fields empty
2. ✅ Click "Next" button

**Expected:**
- Error messages appear
- Form doesn't submit
- Required fields highlighted

---

**Test 3.2: Invalid EGN**
**Steps:**
1. ✅ Enter document number: `AA1234567`
2. ✅ Enter invalid EGN: `1234567890`
3. ✅ Fill other required fields
4. ✅ Try to save

**Expected:**
- EGN validation fails
- Error message: "Invalid EGN"
- Form doesn't save

---

**Test 3.3: Invalid Document Number**
**Steps:**
1. ✅ Enter invalid format: `ABC123`
2. ✅ Enter valid EGN: `9508010133`
3. ✅ Fill other fields
4. ✅ Try to save

**Expected:**
- Document number validation fails
- Error about format
- Form doesn't save

---

### Test 4: Valid Form Submission
**Prerequisites:** ID Editor open

**Steps:**
1. ✅ Fill FRONT side:
   ```
   Document Number: AA1234567
   EGN: 9508010133
   Surname (BG): ИВАНОВА
   Name (BG): СЛАВИНА
   Father's Name (BG): ГЕОРГИЕВА
   Surname (EN): IVANOVA
   Name (EN): SLAVINA
   Father's Name (EN): GEORGIEVA
   Nationality: БЪЛГАРИЯ / BGR (auto-filled)
   Date of Birth: 01.08.1995
   Sex: F
   Height: 168
   Expiry Date: 17.06.2034
   Authority: MBP/Mol BGR
   ```

2. ✅ Click "Next"
3. ✅ Fill BACK side:
   ```
   Place of Birth: СОФИЯ/SOFIA
   Region: обл.СОФИЯ
   Municipality: общ.СТОЛИЧНА гр.СОФИЯ/SOFIA
   Street: бул.КНЯГИНЯ МАРИЯ ЛУИЗА 48
   Height: 168 (auto-filled)
   Eye Color: BROWN
   Authority: MBP/Mol BGR (auto-filled)
   Issue Date: 17.06.2024
   ```

4. ✅ Click "Save"

**Expected:**
- Saving indicator appears
- No errors
- Success alert with trust score: "✅ Data saved successfully! 🎉 Trust Score: +65 points"
- Modal closes
- Verification badge appears in Settings

---

### Test 5: Firestore Data Check
**Prerequisites:** Test 4 completed

**Steps:**
1. ✅ Open Firebase Console
2. ✅ Navigate to Firestore
3. ✅ Find `users/{test-user-id}`
4. ✅ Verify fields:

**Expected Structure:**
```javascript
{
  // Profile
  firstName: "SLAVINA",
  middleName: "GEORGIEVA",
  lastName: "IVANOVA",
  firstNameBG: "СЛАВИНА",
  middleNameBG: "ГЕОРГИЕВА",
  lastNameBG: "ИВАНОВА",
  
  // Personal
  dateOfBirth: "01.08.1995",
  sex: "F",
  height: "168",
  eyeColor: "BROWN",
  placeOfBirth: "СОФИЯ/SOFIA",
  
  // Address
  address: "бул.КНЯГИНЯ МАРИЯ ЛУИЗА 48, общ.СТОЛИЧНА гр.СОФИЯ/SOFIA",
  addressOblast: "обл.СОФИЯ",
  
  // Verification
  verification: {
    idVerified: true,
    idVerifiedAt: [Timestamp],
    trustScore: 65,  // Or higher
    verificationMethod: "id_card_manual"
  },
  
  // Sensitive (nested)
  idCard: {
    documentNumber: "AA1234567",
    personalNumber: "9508010133",
    expiryDate: "17.06.2034",
    issueDate: "17.06.2024",
    issuingAuthority: "MBP/Mol BGR",
    verified: true
  },
  
  updatedAt: [Timestamp]
}
```

---

### Test 6: Security Rules
**Prerequisites:** Firebase console access

**Test 6.1: Owner Access**
**Steps:**
1. ✅ Login as user A
2. ✅ Try to read user A's data
3. ✅ Try to update user A's ID card

**Expected:**
- Read: ✅ Allowed
- Update: ✅ Allowed (if valid)

---

**Test 6.2: Other User Access**
**Steps:**
1. ✅ Login as user A
2. ✅ Try to read user B's data
3. ✅ Try to update user B's ID card

**Expected:**
- Read: ❌ Denied (unless admin)
- Update: ❌ Denied

---

**Test 6.3: Format Validation**
**Steps:**
1. ✅ Try to save invalid document number via API
2. ✅ Try to save invalid EGN via API

**Expected:**
- Both requests rejected by Firestore
- Error: "Permission denied" or validation error

---

### Test 7: Real-time Updates
**Prerequisites:** Test 4 completed

**Steps:**
1. ✅ Keep profile page open in Tab 1
2. ✅ Open same profile in Tab 2
3. ✅ Update ID data in Tab 2
4. ✅ Watch Tab 1

**Expected:**
- Tab 1 updates automatically
- No page refresh needed
- Verification badge appears
- Trust score updates

---

### Test 8: Auto-fill from EGN
**Prerequisites:** ID Editor open

**Steps:**
1. ✅ Enter valid EGN: `9508010133`
2. ✅ Click "Auto-fill from EGN" button
3. ✅ Watch form

**Expected:**
- Date of birth auto-fills: `01.08.1995`
- Sex auto-fills: `F`
- Alert: "✅ Data auto-filled from EGN!"

---

### Test 9: Load Existing Data
**Prerequisites:** User with saved ID data

**Steps:**
1. ✅ Open ID Editor
2. ✅ Wait for loading

**Expected:**
- Loading overlay shows
- Form pre-fills with existing data
- All fields populated correctly
- No errors

---

### Test 10: Cross-Browser Testing
**Prerequisites:** All above tests passed in Chrome

**Browsers to Test:**
- ✅ Chrome
- ✅ Firefox
- ✅ Edge
- ✅ Safari (if available)

**For Each Browser:**
1. ✅ Open editor
2. ✅ Verify layout (form | image)
3. ✅ Fill and save
4. ✅ Check success

**Expected:**
- Consistent layout
- No browser-specific bugs
- Images load properly

---

### Test 11: Mobile Responsive
**Prerequisites:** Chrome DevTools

**Steps:**
1. ✅ Open DevTools (F12)
2. ✅ Toggle device toolbar
3. ✅ Test devices:
   - iPhone 12 Pro
   - iPad
   - Samsung Galaxy S21
4. ✅ Open ID Editor

**Expected:**
- Form shows (full width)
- Image column hidden on mobile
- All fields accessible
- Buttons work
- Smooth scrolling

---

### Test 12: Error Handling
**Test 12.1: Network Error**
**Steps:**
1. ✅ Open ID Editor
2. ✅ Turn off WiFi
3. ✅ Try to save

**Expected:**
- Error message shows
- User-friendly text
- Doesn't crash

---

**Test 12.2: Invalid Data**
**Steps:**
1. ✅ Enter data that fails validation
2. ✅ Try to save

**Expected:**
- Validation errors listed
- Form doesn't submit
- Clear error messages

---

**Test 12.3: Missing User**
**Steps:**
1. ✅ Log out
2. ✅ Try to access profile

**Expected:**
- Redirect to login
- Or "Not authenticated" error

---

### Test 13: Performance
**Prerequisites:** Chrome DevTools

**Steps:**
1. ✅ Open Performance tab
2. ✅ Start recording
3. ✅ Open ID Editor
4. ✅ Fill form
5. ✅ Save
6. ✅ Stop recording

**Expected Metrics:**
- Page load: < 3s
- Modal open: < 500ms
- Form submission: < 2s
- No memory leaks
- No layout shifts

---

### Test 14: Console Errors
**Prerequisites:** Open DevTools Console

**Steps:**
1. ✅ Navigate through entire flow
2. ✅ Watch console

**Expected:**
- No errors (red text)
- Only info/debug messages
- No warnings about React

---

### Test 15: Verification Badge Display
**Prerequisites:** ID data saved

**Steps:**
1. ✅ Go to Settings tab
2. ✅ Look at ID Card section

**Expected:**
```
✓ Verified
Trust Score: 65/100
```
- Green badge visible
- Trust score displayed
- Correct value

---

## 📊 Test Results Summary

### ✅ Passing Criteria:
- All 15 tests pass
- No console errors
- No layout issues
- Data saves correctly
- Security rules enforced
- Real-time updates work

### ❌ Failure Actions:
If any test fails:
1. Note the specific test number
2. Check console for errors
3. Verify Firestore rules deployed
4. Check network requests
5. Review service layer code
6. Fix and retest

---

## 🚀 Production Readiness

### ✅ Before Going Live:
- [ ] All 15 tests passed
- [ ] Security audit complete
- [ ] Performance optimized
- [ ] Error tracking setup (Sentry)
- [ ] Backup strategy in place
- [ ] Encryption layer added (for EGN)
- [ ] Rate limiting configured
- [ ] Monitoring dashboards ready

---

## 📝 Test Log Template

```
Date: ___/___/2025
Tester: __________
Browser: __________
Device: __________

Test 1: [ ] Pass [ ] Fail - Notes: _____________
Test 2: [ ] Pass [ ] Fail - Notes: _____________
Test 3: [ ] Pass [ ] Fail - Notes: _____________
...
Test 15: [ ] Pass [ ] Fail - Notes: _____________

Overall: [ ] PASS [ ] FAIL

Issues Found:
1. _______________________________________________
2. _______________________________________________

Actions Taken:
1. _______________________________________________
2. _______________________________________________

Signature: _____________
```

---

## 🎓 Quick Manual Test (5 minutes)

For quick verification:

1. **Start app**: `npm start`
2. **Login**: Create/login to test account
3. **Navigate**: Profile → Settings
4. **Open editor**: Click "Edit with ID Card"
5. **Fill form**: Use test data above
6. **Save**: Both front & back
7. **Verify badge**: Check for green badge
8. **Check Firestore**: Verify data saved

✅ If all steps work → System is good!
❌ If any fails → Run full test suite above

---

## 🎉 Success!

If all tests pass:
```
 ██████╗  ██████╗      ██╗
██╔════╝ ██╔═══██╗    ██╔╝
██║  ███╗██║   ██║   ██╔╝ 
██║   ██║██║   ██║  ██╔╝  
╚██████╔╝╚██████╔╝ ██╔╝   
 ╚═════╝  ╚═════╝  ╚═╝    

SYSTEM IS PRODUCTION READY! 🚀
```

