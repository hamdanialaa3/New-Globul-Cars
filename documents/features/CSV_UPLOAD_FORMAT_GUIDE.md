/**
 * CSV Upload Format Guide
 * For Dealer & Enterprise Plan Users
 * Koli One Auction Platform
 * Location: Bulgaria | Currency: EUR
 */

# CSV/Excel Upload Format Guide

## 📋 Overview

Bulk upload allows dealers to add up to **50 listings** at once using CSV or Excel files.

---

## 📊 CSV Format

### File Requirements
- **Format:** `.csv` or `.xlsx` / `.xls`
- **Encoding:** UTF-8
- **Max Records:** 50 cars per upload
- **Max File Size:** 10 MB
- **Delimiter:** Comma (,)

### Required Headers

| Column | Type | Format | Example | Notes |
|--------|------|--------|---------|-------|
| make | string | Brand name | Mercedes-Benz | ✅ Required |
| model | string | Model name | E 220 | ✅ Required |
| year | number | YYYY | 2020 | ✅ Required (1900-2027) |
| price | number | EUR | 25000 | ✅ Required |
| mileage | number | km | 45000 | ✅ Required (≥0) |
| fuelType | string | See options below | diesel | ✅ Required |
| transmission | string | See options below | automatic | ✅ Required |
| engineSize | number | Liters (L) | 2.0 | ⚪ Optional |
| doors | number | Count | 4 | ⚪ Optional (default: 4) |
| seats | number | Count | 5 | ⚪ Optional (default: 5) |
| color | string | Color name | Black | ⚪ Optional |
| description | string | Text (max 500 chars) | Premium sedan in excellent condition | ⚪ Optional |
| location | string | City name | Sofia | ⚪ Optional (default: Bulgaria) |
| images | string | URLs separated by \| | https://example.com/img1.jpg\|https://example.com/img2.jpg | ⚪ Optional |

### Valid Values

#### Fuel Types
```
petrol    (Бензин)
diesel    (Дизел)
electric  (Електричество)
hybrid    (Хибрид)
lpg       (Газ)
cng       (CNG газ)
```

#### Transmission Types
```
manual          (Ръчна)
automatic       (Автоматична)
semi-automatic  (Полуавтоматична)
```

---

## 📝 Example CSV

```csv
make,model,year,price,mileage,fuelType,transmission,engineSize,doors,seats,color,description,location,images
Mercedes-Benz,E 220,2020,25000,45000,diesel,automatic,2.0,4,5,Black,Premium sedan in excellent condition,Sofia,https://example.com/img1.jpg|https://example.com/img2.jpg
BMW,320d,2019,22000,60000,diesel,manual,2.0,4,5,White,Sport package with leather interior,Plovdiv,
Volkswagen,Golf 7,2018,14500,82000,petrol,automatic,1.4,4,5,Silver,Well maintained hatchback,Burgas,https://example.com/golf1.jpg
Audi,A4,2021,35000,22000,diesel,automatic,2.0,4,5,Grey,Excellent condition with service records,Sofia,https://example.com/audi1.jpg|https://example.com/audi2.jpg
Tesla,Model 3,2022,42000,8000,electric,automatic,0,4,5,White,Electric car with full battery,Varna,
```

---

## ✅ Validation Rules

### Year
- **Range:** 1900 - 2027
- **Type:** 4-digit number
- **Error Example:** Year = 1899 ❌ → "Year must be between 1900 and 2027"

### Price
- **Currency:** EUR (€)
- **Type:** Positive decimal number
- **Minimum:** > 0
- **Error Examples:**
  - Price = -15000 ❌ → "Price must be a positive number"
  - Price = 0 ❌ → "Price must be a positive number"
  - Price = abc ❌ → "Price must be a positive number"

### Mileage
- **Type:** Non-negative integer
- **Unit:** Kilometers (km)
- **Minimum:** 0
- **Error Examples:**
  - Mileage = -100 ❌ → "Mileage must be a non-negative number"
  - Mileage = 50000,5 ❌ → "Mileage must be a non-negative number"

### Fuel Type
- **Must be one of:** petrol, diesel, electric, hybrid, lpg, cng
- **Case-insensitive:** "Diesel" = "diesel" ✅
- **Error Example:** fuelType = "bio-fuel" ❌ → "Fuel type must be one of: petrol, diesel, electric, hybrid, lpg, cng"

### Transmission
- **Must be one of:** manual, automatic, semi-automatic
- **Case-insensitive:** "Automatic" = "automatic" ✅
- **Error Example:** transmission = "CVT" ❌ → "Transmission must be one of: manual, automatic, semi-automatic"

### Description
- **Max Length:** 500 characters
- **Trimmed:** Leading/trailing spaces removed
- **Allowed:** Special characters, multiple lines (in quotes)

### Images
- **Format:** URLs separated by pipe (|)
- **Protocol:** https:// only
- **Max URLs:** 10 per listing
- **Example:** `https://example.com/img1.jpg|https://example.com/img2.jpg|https://example.com/img3.jpg`

---

## 🔧 Creating CSV with Excel

### Step 1: Open Excel
1. Create new spreadsheet
2. Add headers in row 1

### Step 2: Fill Data
| A | B | C | D | E | F | G | H | I | J | K | L | M | N |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| make | model | year | price | mileage | fuelType | transmission | engineSize | doors | seats | color | description | location | images |
| Mercedes-Benz | E 220 | 2020 | 25000 | 45000 | diesel | automatic | 2.0 | 4 | 5 | Black | Premium sedan | Sofia | https://... |

### Step 3: Export as CSV
1. **File → Save As**
2. **Format:** CSV UTF-8 (.csv)
3. **Encoding:** UTF-8
4. Click **Save**

### Step 4: Upload
1. Go to `/dealer-dashboard`
2. Click **[Bulk Upload]** button
3. Select your CSV file
4. Review validation results
5. Click **[Upload X Cars]**

---

## 🔧 Creating CSV with Google Sheets

### Step 1: Create Sheet
1. Go to sheets.google.com
2. Create new spreadsheet
3. Add headers

### Step 2: Add Data
Same format as Excel table above

### Step 3: Export as CSV
1. **File → Download → Comma Separated Values (.csv)**
2. Google Sheets converts to CSV automatically

### Step 4: Upload
Same as Excel above

---

## 📱 Command Line (CSV Creation)

### Using `cut` command (Mac/Linux)
```bash
# Create sample CSV
cat > cars.csv << 'EOF'
make,model,year,price,mileage,fuelType,transmission,engineSize,doors,seats,color,description,location,images
Mercedes-Benz,E 220,2020,25000,45000,diesel,automatic,2.0,4,5,Black,Premium sedan,Sofia,
BMW,320d,2019,22000,60000,diesel,manual,2.0,4,5,White,Sport package,Plovdiv,
EOF

# Upload to Koli One
curl -X POST https://kolioneauction.com/api/bulk-upload \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "file=@cars.csv"
```

---

## ⚠️ Common Errors & Solutions

### Error: "make is required"
**Cause:** Cell is empty or missing  
**Solution:** Fill the cell with car make (e.g., "Mercedes-Benz")

### Error: "Year must be between 1900 and 2027"
**Cause:** 
- Invalid format (e.g., "2020-01-01")
- Outside range (e.g., 1850, 2030)

**Solution:** Use 4-digit year (1900-2027)

### Error: "Price must be a positive number"
**Cause:**
- Contains currency symbol (e.g., "€25000")
- Negative number (e.g., "-15000")
- Text instead of number (e.g., "expensive")

**Solution:** Use positive number only (e.g., "25000")

### Error: "Fuel type must be one of: ..."
**Cause:** Invalid fuel type (e.g., "bio-fuel", "hybrid electric")

**Solution:** Use exact match:
- ✅ petrol, diesel, electric, hybrid, lpg, cng

### Error: "Mileage must be a non-negative number"
**Cause:**
- Negative number (e.g., "-50000")
- Decimal (e.g., "50000.5")

**Solution:** Use non-negative integer (0, 50000, 145000)

---

## 📊 Upload Limits

### Free Users
- ❌ No bulk upload available
- Upgrade to **Dealer Plan** (€50/month)

### Dealer Plan
- ✅ 50 cars per upload
- 10 uploads per day (500 cars/day max)
- CSV or Excel files

### Enterprise Plan
- ✅ 50 cars per upload
- Unlimited uploads per day
- CSV, Excel, JSON API available

---

## 🎯 Tips & Best Practices

1. **Validate Before Upload**
   - Check for required fields (make, model, year, price, mileage, fuelType, transmission)
   - Ensure year is 4-digit (1900-2027)
   - Verify price is positive number

2. **Image Best Practices**
   - Use HTTPS URLs only
   - Use descriptive filenames (car-1.jpg, not unnamed.jpg)
   - Compress images (< 2 MB each)
   - Use pipe (|) to separate multiple images

3. **Location Format**
   - Use Bulgarian city names (Sofia, Plovdiv, Varna, Burgas, etc.)
   - Default if empty: "Bulgaria"
   - No country needed (Bulgaria is default)

4. **Description Tips**
   - Write in second person: "Beautiful sedan with..."
   - Include: condition, mileage, features, servicing
   - Max 500 characters
   - Use line breaks for readability

5. **Batch Upload Strategy**
   - Upload 20-30 cars per batch
   - Wait 1-2 seconds between batches
   - Prevents server overload
   - Easier to track errors

---

## 📞 Support

**Need Help?**
- [Download Sample CSV](https://kolioneauction.com/guides/sample-bulk-upload.csv)
- [Video Tutorial](https://www.youtube.com/watch?v=sample)
- Email: support@kolioneauction.com
- Chat: Click **Help** button in dashboard

**Error Reporting:**
Include:
1. Your CSV file (anonymized)
2. Error message screenshot
3. Step where error occurred
4. Your subscription tier

---

**Last Updated:** February 8, 2026  
**Supported Since:** February 2026  
**Language:** Bulgarian & English
