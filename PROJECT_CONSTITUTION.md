# 🏛️ PROJECT CONSTITUTION & ARCHITECTURAL STANDARDS
> **Scope:** Koli One (Web & Mobile)
> **Status:** STRICT & MANDATORY
> **Last Updated:** February 2026

## 1. 🛑 Core Commandments (Non-Negotiable)

1.  **Strict Numeric IDs:**
    *   **Public URLs** MUST use Numeric IDs (e.g., `/profile/90`, `/car/1/5`).
    *   **NEVER** expose Firebase UIDs (e.g., `AbC123...`) in URLs.
    *   **User Profile Pattern:** `/profile/{numericId}` (Owner) OR `/profile/view/{numericId}` (Visitor).
    *   **Car URL Pattern:** `/car/{sellerNumericId}/{carNumericId}`.

2.  **Code Quality & File Size:**
    *   **Max File Size:** 300 lines. Split logic if exceeded.
    *   **No "Flash of Wrong Content":** Use Loading Guards (`isValidationReady`).
    *   **Emojis:** Forbidden in business logic/comments (except in this documentation).

3.  **Data Integrity:**
    *   **Atomicity:** All Critical Writes (Car Creation, Financials) MUST use `runTransaction`.
    *   **Validation:** Shared validation logic (Constitution guards) must be enforced on both Web and Mobile.

## 2. 🌍 Localization & Context
*   **Target Market:** Bulgaria 🇧🇬
*   **Languages:** Bulgarian (Primary), English (Secondary).
*   **Currency:** EUR (€).
*   **Timezone:** Europe/Sofia.

## 3. 🛡️ Routing Constitution (Profile System)

### 3.1 Rules
*   **I am User 90:**
    *   Visit Self: `/profile/90` ✅
    *   Visit User 80: `/profile/view/80` ✅
    *   Attempt `/profile/80`: **REDIRECT** -> `/profile/view/80` 🔄
    *   Attempt `/profile/AbC...`: **BLOCK/REDIRECT** 🚫

### 3.2 Implementation Constraints
*   **Loading Guards:** Do not render profile content until `isConstitutionChecked` is true.
*   **Performance:** Check constraints before fetching data (1-2ms overhead max).

## 4. 🔗 Dependencies & Infrastructure
*   **Live Site:** https://koli.one
*   **Firebase Project:** `fire-new-globul`
*   **Repository:** `hamdanialaa3/New-Globul-Cars`
*   **Algolia:** Sync indexes via `npm run sync-algolia`.

## 5. 📱 Mobile Specifics
*   **Parity:** Mobile services in `services/` MUST match Web logic.
*   **Navigation:** Use `expo-router` with strict typed routes.
*   **Images:** Use `expo-image-manipulator` for client-side resizing (matches Web Canvas logic).

---
*Derived from `Read_me!!!!!CONSTITUTION.md` and `FINAL_CONSTITUTION_GEMINI_INTEGRATION_JAN24_2026.md`*
