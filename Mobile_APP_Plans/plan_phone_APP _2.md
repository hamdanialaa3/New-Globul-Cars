Plan: Full Sell Workflow Port + Profile Sync Fix
The mobile sell flow already has a working 7-step wizard, image upload pipeline, cloud drafts, and AI integration. However, it has 21 critical gaps vs the web: zero validation, missing fields (condition, color, sellerType, sellerEmail, postalCode), no data transformation, no structured location picker, equipment format mismatch, and no listing limit enforcement. In parallel, a profile sync bug causes the web to overwrite Firestore displayName with a stale Firebase Auth value on every auth state change, because (a) mobile never updates Auth displayName, and (b) the web's createOrUpdateBulgarianProfile unconditionally writes Auth displayName to Firestore. Both issues are fixed comprehensively below.

Steps

Part A — Profile Sync Fix (2 files)
Mobile: Update Firebase Auth displayName on profile edit — In edit.tsx handleSave, after calling updateUserProfile(), also call updateProfile(auth.currentUser, { displayName, photoURL }) from firebase/auth. This ensures Auth stays in sync with Firestore, matching the web's behavior in auth-service.ts lines 580-584.

Web: Stop overwriting displayName for existing users — In social-auth-service.ts createOrUpdateBulgarianProfile(), change the logic so that displayName and photoURL are only written when isNewUser === true. For existing users, only write lastLogin: serverTimestamp(). This prevents every page reload from overwriting Firestore with a potentially stale Auth value.

Part B — Sell Types & Constants Alignment (2 files)
Update VehicleFormData type — In sellTypes.ts, add all missing fields to match web's UnifiedWorkflowData: condition, sellerType, color/exteriorColor, sellerEmail, postalCode, priceType, negotiable, featuredImageIndex, imagesCount, engineSize, powerKW, previousOwners, hasAccidentHistory, hasServiceHistory, warranty, warrantyMonths, vatDeductible, financing, tradeIn, firstRegistration, searchKeywords[]. Update the VEHICLE_TYPE_OPTIONS from 4 types (Car/Motorbike/Truck/Boat) to 6 matching web exactly: car, van, motorcycle, truck, bus, suv — with only car enabled. Add CONDITION_OPTIONS (new/used/damaged), SELLER_TYPE_OPTIONS (private/dealer/company), PRICE_TYPE_OPTIONS (fixed/negotiable), EXTERIOR_COLORS (25 colors matching web's VehicleData/types.ts).

Add Bulgaria location data — Create mobile_new/src/data/bulgaria-locations.ts by copying the web's bulgaria-locations.ts (28 regions, their cities, and helper functions getCitiesByRegion, getRegionByCity). Copy the BULGARIAN_CITIES data from bulgarianCities.ts (28 entries with coordinates).

Part C — Zustand Store Update (1 file)
Expand useSellStore — In useSellStore.ts, update the VehicleFormData shape to include all the new fields from step 3. Ensure the persisted store migration handles the new fields (set defaults: condition: 'used', sellerType: 'private', priceType: 'fixed', negotiable: false).
Part D — Step-by-Step UI Gap Closure (7 files)
Step 1 — BasicInfoStep — In BasicInfoStep.tsx:

Replace 4 vehicle type cards with 6 matching web (car enabled, suv/van/motorcycle/truck/bus show "Coming Soon").
Add condition toggle buttons (New/Used/Damaged) after vehicle type — matching SellVehicleStep2.
Add sellerType toggle buttons (Private/Dealer/Company) at bottom of step.
Keep existing make/model/year/variant fields.
Step 2 — TechnicalSpecsStep — In TechnicalSpecsStep.tsx:

Add color/exteriorColor picker using EXTERIOR_COLORS (25 options + "Other" free text) — use a scrollable chip list or bottom sheet.
Add engineSize numeric input (cc).
Add previousOwners picker (1-5+).
Add hasAccidentHistory toggle (Yes/No).
Add hasServiceHistory toggle (Yes/No).
Keep existing mileage/VIN/power/fuelType/transmission/driveType/bodyType/doors/seats.
Step 3 — EquipmentStep — In EquipmentStep.tsx:

Expand equipment items per category to match web's full list (8 per category instead of 3-4).
Fix data format: Store equipment as BOTH Record<string, boolean> AND string[] to match web's dual format (safety: {ABS: true} + safetyEquipment: ['ABS']). Currently mobile stores arrays only, but web's sell-workflow-transformers.ts expects both.
Add visual category completion indicators (filled count / total).
Step 4 — PhotosStep — In PhotosStep.tsx:

Increase max photos from 15 to 20 (matching web).
Add featuredImageIndex — tap-to-set-main-image feature (star icon on selected image).
Add image reordering via long-press-and-drag.
Track imagesCount in the form data.
Step 5 — Split into PricingStep + ContactStep — This is the biggest structural change. The current PricingContactStep.tsx merges pricing and contact. Split into two:

New PricingStep.tsx (replaces Step 5):

Price input (EUR hardcoded, no currency picker).
priceType toggle (Fixed/Negotiable) — auto-syncs negotiable boolean.
warranty toggle (Yes/No), warrantyMonths picker (3/6/12/24/36) when Yes.
vatDeductible toggle (for dealers/companies only — based on sellerType).
financing toggle (Available/Not).
tradeIn toggle (Accept/No).
New ContactLocationStep.tsx (new Step 6):

sellerName — auto-populated from user profile on mount (call getDoc(doc(db, 'users', uid)) to pre-fill).
sellerEmail — auto-populated from profile, with email validation.
sellerPhone — with +359 default prefix, phone-pad keyboard.
region — cascading dropdown using BULGARIA_REGIONS (28 regions) — use @react-native-picker/picker or @gorhom/bottom-sheet for UX.
city — filtered by selected region via getCitiesByRegion().
postalCode — free text (or picker if data available).
Listing limit check on mount: call getDoc(doc(db, 'users', uid)) to read stats.activeListings, compare against plan limits. Show modal if at capacity.
Step 6 (now Step 7) — AIDescriptionStep — In AIDescriptionStep.tsx:

Add bilingual toggle (BG/EN) for AI-generated descriptions matching web's SmartDescriptionGenerator.
Pass all vehicle data (make/model/year/fuel/transmission/mileage/equipment/condition/color) to the AI generation function for richer output.
Step 7 (now Step 8) — ReviewStep — In ReviewStep.tsx:

Display ALL sections: Vehicle Info, Technicals, Equipment summary, Image thumbnails (with main image highlighted), Pricing, Contact/Location, Description.
Add "Edit" shortcut per section (navigates back to that step).
Show image preview carousel.
Display pricing with EUR format.
Part E — WizardOrchestrator Update (1 file)
Update orchestrator step count and navigation — In WizardOrchestrator.tsx:
Change TOTAL_STEPS from 7 to 8 (added ContactLocation step).
Update step labels array for the progress bar.
Wire the new PricingStep and ContactLocationStep components.
Add per-step validation before allowing "Next": Step 1 requires vehicleType; Step 2 requires make, model, year; Step 5 requires price > 0; Step 6 requires sellerName, sellerEmail, sellerPhone, region, city.
Add publish validation (stricter): all required fields checked, min 3 images for cars / 2 for motorcycles.
Show validation errors as inline red text below fields.
Part F — Data Transformation & Publish Pipeline (2 files)
Create mobile data transformer — Create mobile_new/src/services/sell-workflow-transformers.ts based on web's sell-workflow-transformers.ts. This transforms VehicleFormData → Partial<CarListing> with:

Location resolution: look up BULGARIAN_CITIES for coordinates from selected region.
Equipment dual-format: convert arrays to Record + array.
Parse numeric strings (year, mileage, price).
Set status: 'active', isActive: true, isSold: false, views: 0, favorites: 0.
Set sellerId, sellerNumericId, createdAt, updatedAt.
Generate searchKeywords[] from make + model + year + city for Algolia downstream.
Set imagesCount, featuredImageIndex.
Strip undefined values, sanitize HTML (<> removal).
Update SellService.submitListing — In SellService.ts:

Insert the transformer before calling NumericCarSystemService.createCarAtomic() — pass transformed data instead of raw form data.
Add SEO slug generation after car creation: call updateDoc(carRef, { slug, canonicalUrl }) using a simple slug function (make-model-year-numericId).
Add listing limit check before creation: read user doc, check stats.activeListings against plan tier.
Add rate limiting: simple timestamp-based check (max 1 listing per 30 seconds).
Add input sanitization: strip <script>, <> from all text fields.
Part G — Validation Layer (1 new file)
Create sell form validation service — Create mobile_new/src/services/sell-validation.ts matching web's sell-workflow-validation.ts:
validateStep(step, data) → { valid: boolean, errors: Record<string, string> }
validateForPublish(data) → full validation with all required fields
Rules: year 1900–current+1, mileage 0–1M, price > 0 and ≤ 10M, email regex, Bulgarian phone regex ^(\+359|0)(87|88|89|98|99|43|44)[0-9]{7}$, min 3 images (car) / 2 (motorcycle), max 20 images
Cross-field: new condition → mileage should be 0, electric vehicle → mileage cap warnings
Use Zod (already in package.json) for schema definitions where possible
Part H — Bilingual Support (1 file)
Add sell flow translations — Create mobile_new/src/i18n/sell-translations.ts with BG/EN labels for every field, step title, validation error, button, and placeholder in the sell flow. Use the same useLanguage pattern from settings. The web's sell flow uses inline language === 'bg' ? '...' : '...' — centralize in a translation object.
Part I — Sell Tab Entry Update (1 file)
Update sell tab screen — In mobile_new/app/(tabs)/sell.tsx/sell.tsx), ensure the WizardOrchestrator is the primary entry point (remove or deprioritize WebView fallback now that native wizard is complete). Keep Smart Sell and Quick Capture as secondary entry points.
Verification

Profile sync: Change name on mobile → reload web app → name should reflect. Change name on web → open mobile → name should reflect. No overwrite on page reload.
Sell flow: Complete a full car listing on mobile with all fields → verify Firestore document matches web-created listings in structure (same fields, same collection routing, equipment in dual format, location with coordinates, slug set).
Validation: Try to advance step 1 without selecting vehicle type → blocked. Try to publish without price → blocked. Try to publish with 0 images → blocked for car.
Draft persistence: Fill 3 steps on mobile → kill app → reopen → draft should restore.
Data consistency: Create listing on mobile → verify it appears in web search/listing pages correctly (all fields render, location shows, equipment displays, images load).
Run npm run type-check in mobile_new.
Decisions

Vehicle types: Matched web exactly — 6 types (car, suv, van, motorcycle, truck, bus), removed Boat.
Currency: Hardcoded EUR in sell form (consistent with settings removal).
Location: Full cascading Region → City dropdowns using Bulgaria data, with coordinate resolution.
Scope: Everything in one comprehensive pass — no phased approach.
Step count changes from 7 to 8 (PricingContact split into Pricing + ContactLocation).
Profile sync fixed on BOTH sides: mobile updates Auth displayName, web stops overwriting for existing users.
Equipment stored in dual format (Record + array) to ensure web compatibility.
نفذ هذه الخطة بعناية و دقة و احترافية الى حد 100% و