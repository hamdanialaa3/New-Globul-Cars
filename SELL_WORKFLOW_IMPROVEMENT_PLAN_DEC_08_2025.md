# Sell Workflow Improvement Plan - December 8, 2025

## 1. Overview
This document tracks the analysis and improvements for the Car Selling Workflow (`/sell/*`). The goal is to ensure robust data persistence, correct timer behavior, and proper validation UI across all steps.

## 2. Current State Analysis (To Be Filled)

### A. Persistence (Auto-save)
- **Mechanism:** [Pending Analysis] (Likely `workflowPersistenceService` + `localStorage`)
- **Coverage:** [Pending Analysis] (Does it cover all fields in all steps?)
- **Issues:** [Pending Analysis]

### B. Countdown Timer
- **Location:** `/sell/inserat/car/data`
- **Current Behavior:** Resets forms on 0.
- **Requirement:** Ensure it clears data correctly and only when intended.

### C. Validation UI
- **Requirement:** Red (invalid/untouched) -> Green (valid/touched). Placeholders like "Example: ...".
- **Current State:** [Pending Analysis]

### D. Clear Conditions
1.  **Timer Expiry:** Should clear data.
2.  **Manual Clear:** Button exists, needs verification.
3.  **Publish Success:** Should clear data.

## 3. Task List

### Phase 1: Analysis & Discovery
- [ ] Analyze `workflowPersistenceService.ts`
- [ ] Analyze `VehicleData.tsx` (Timer & Form State)
- [ ] Analyze `VehicleStartPageNew.tsx`
- [ ] Analyze `EquipmentMainPage.tsx`
- [ ] Analyze `ImagesPage.tsx`
- [ ] Check "Publish" logic for data clearing.

### Phase 2: Implementation - Persistence & State
- [ ] Ensure `workflowPersistenceService` saves every field change immediately.
- [ ] Verify state restoration on page reload.

### Phase 3: Implementation - UI & Validation
- [ ] Add/Update placeholders ("Example: ...").
- [ ] Verify Red/Green validation styling.

### Phase 4: Implementation - Clearing Logic
- [ ] Fix Timer expiry logic to clear storage.
- [ ] Verify Manual Clear button.
- [ ] Add "Clear on Success" to `createCarListing` flow.

## 4. File Map
- `src/services/workflowPersistenceService.ts`
- `src/pages/sell/VehicleData.tsx`
- `src/pages/sell/VehicleStartPageNew.tsx`
- `src/pages/sell/EquipmentMainPage.tsx`
- `src/pages/sell/ImagesPage.tsx`
