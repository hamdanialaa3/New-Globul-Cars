# ♿ ACCESSIBILITY PLAN - WCAG 2.1 AA Compliance
## Making Bulgarian Car Marketplace Accessible for All Users

**Phase:** 4  
**Duration:** 6 weeks (parallel with Phase 3)  
**Priority:** MEDIUM-HIGH (Legal compliance, inclusivity)  
**Target:** WCAG 2.1 Level AA (international standard)

---

## 🎯 **Objectives**

### **Primary Goals:**
1. ✅ Achieve WCAG 2.1 Level AA compliance (101+ pages)
2. ✅ Pass automated accessibility tests (axe-core, Lighthouse)
3. ✅ Support screen readers (NVDA, JAWS, VoiceOver)
4. ✅ Full keyboard navigation support
5. ✅ Ensure color contrast ratios meet standards

### **Why Accessibility?**
- ✅ **Legal Compliance** - EU Web Accessibility Directive, Bulgarian law
- ✅ **SEO Benefits** - Better semantic HTML = better rankings
- ✅ **Wider Audience** - 15%+ of population has disabilities
- ✅ **Better UX** - Accessibility improvements benefit all users
- ✅ **Corporate Responsibility** - Ethical obligation to inclusivity

---

## 📊 **Current State Assessment**

### **Accessibility Audit (To Be Conducted):**
```
Run automated tools:
  ✅ Lighthouse Accessibility Score
  ✅ axe DevTools (browser extension)
  ✅ WAVE (Web Accessibility Evaluation Tool)
  ✅ Pa11y automated testing

Manual testing:
  ✅ Screen reader testing (NVDA on Windows, VoiceOver on Mac)
  ✅ Keyboard-only navigation
  ✅ Color blindness simulation (Chrome DevTools)
  ✅ Voice control testing

Expected findings:
  ❌ Missing alt text on images
  ❌ Low color contrast (some areas)
  ❌ Missing ARIA labels
  ❌ Keyboard traps in modals
  ❌ Improper heading hierarchy
  ❌ Form labels not properly associated
  ❌ Focus indicators missing/weak
```

---

## 🔍 **WCAG 2.1 Level AA Requirements**

### **Principle 1: Perceivable**
Information must be presented in ways users can perceive.

#### **1.1 Text Alternatives**
```
Guideline 1.1.1: Non-text Content (Level A)
  ✅ Alt text for all images
  ✅ Empty alt for decorative images (alt="")
  ✅ Descriptive alt for meaningful images
  ✅ SVG icons have title/aria-label

Implementation:
  <img src="car.jpg" alt="2020 BMW 3 Series sedan in blue" />
  <img src="decoration.svg" alt="" aria-hidden="true" />
  <svg role="img" aria-label="Search icon"><title>Search</title>...</svg>
```

#### **1.2 Time-based Media**
```
Guideline 1.2.1: Audio-only and Video-only (Level A)
  ✅ Transcripts for audio content
  ✅ Audio descriptions for videos

Guideline 1.2.2: Captions (Level A)
  ✅ Closed captions for videos

Note: Currently no video content, but prepare for future.
```

#### **1.3 Adaptable**
```
Guideline 1.3.1: Info and Relationships (Level A)
  ✅ Semantic HTML (headers, lists, tables)
  ✅ Proper heading hierarchy (h1 → h2 → h3)
  ✅ Form labels associated with inputs
  ✅ ARIA landmarks (nav, main, aside, footer)

Guideline 1.3.2: Meaningful Sequence (Level A)
  ✅ Logical reading order
  ✅ Tab order follows visual order

Guideline 1.3.3: Sensory Characteristics (Level A)
  ✅ Don't rely solely on color, shape, or position
  ✅ Use text labels + icons (not just icons)

Guideline 1.3.4: Orientation (Level AA)
  ✅ Support both portrait and landscape
  ✅ No orientation restrictions

Guideline 1.3.5: Identify Input Purpose (Level AA)
  ✅ Autocomplete attributes on inputs
  ✅ type="email", type="tel", etc.
```

#### **1.4 Distinguishable**
```
Guideline 1.4.1: Use of Color (Level A)
  ✅ Don't use color alone to convey info
  ✅ Use icons/text with color indicators

Guideline 1.4.3: Contrast (Minimum) (Level AA)
  ✅ 4.5:1 contrast for normal text
  ✅ 3:1 contrast for large text (18pt+ or 14pt+ bold)

Guideline 1.4.4: Resize Text (Level AA)
  ✅ Text can scale to 200% without losing content
  ✅ No horizontal scrolling at 200% zoom

Guideline 1.4.10: Reflow (Level AA)
  ✅ Content reflows to fit 320px width
  ✅ No 2D scrolling required

Guideline 1.4.11: Non-text Contrast (Level AA)
  ✅ 3:1 contrast for UI components (buttons, inputs)
  ✅ 3:1 contrast for graphical objects

Guideline 1.4.12: Text Spacing (Level AA)
  ✅ Content adapts to increased spacing:
     - Line height: 1.5x font size
     - Paragraph spacing: 2x font size
     - Letter spacing: 0.12x font size
     - Word spacing: 0.16x font size

Guideline 1.4.13: Content on Hover or Focus (Level AA)
  ✅ Tooltips dismissible (Esc key)
  ✅ Tooltips hoverable (can move mouse over)
  ✅ Tooltips persistent (don't disappear too quickly)
```

---

### **Principle 2: Operable**
Users must be able to operate the interface.

#### **2.1 Keyboard Accessible**
```
Guideline 2.1.1: Keyboard (Level A)
  ✅ All functionality available via keyboard
  ✅ No keyboard traps
  ✅ Tab order is logical

Guideline 2.1.2: No Keyboard Trap (Level A)
  ✅ Focus can always move away using keyboard
  ✅ Modals have proper focus management

Guideline 2.1.4: Character Key Shortcuts (Level A)
  ✅ Single-key shortcuts can be disabled
  ✅ Or only active when component has focus
```

#### **2.2 Enough Time**
```
Guideline 2.2.1: Timing Adjustable (Level A)
  ✅ Users can turn off, adjust, or extend time limits
  ✅ Session timeout warnings (5 minutes before)

Guideline 2.2.2: Pause, Stop, Hide (Level A)
  ✅ Auto-playing content can be paused
  ✅ Auto-updating content can be controlled
```

#### **2.3 Seizures**
```
Guideline 2.3.1: Three Flashes or Below Threshold (Level A)
  ✅ No content flashes more than 3 times/second
  ✅ Remove blinking animations
```

#### **2.4 Navigable**
```
Guideline 2.4.1: Bypass Blocks (Level A)
  ✅ Skip navigation link (skip to main content)
  ✅ ARIA landmarks

Guideline 2.4.2: Page Titled (Level A)
  ✅ Unique, descriptive page titles
  ✅ Format: "Page Name - Globul Cars"

Guideline 2.4.3: Focus Order (Level A)
  ✅ Tab order is logical and intuitive

Guideline 2.4.4: Link Purpose (In Context) (Level A)
  ✅ Links have descriptive text
  ✅ Avoid "click here" or "read more" alone

Guideline 2.4.5: Multiple Ways (Level AA)
  ✅ Navigation menu
  ✅ Search function
  ✅ Sitemap (future)

Guideline 2.4.6: Headings and Labels (Level AA)
  ✅ Descriptive headings
  ✅ Descriptive labels

Guideline 2.4.7: Focus Visible (Level AA)
  ✅ Visible focus indicator (outline, border, shadow)
  ✅ Don't use outline: none without alternative
```

#### **2.5 Input Modalities**
```
Guideline 2.5.1: Pointer Gestures (Level A)
  ✅ Multi-point gestures have single-point alternative
  ✅ Path-based gestures have simple alternative

Guideline 2.5.2: Pointer Cancellation (Level A)
  ✅ Click action on mouseup (not mousedown)
  ✅ Allows user to cancel by moving pointer away

Guideline 2.5.3: Label in Name (Level A)
  ✅ Accessible name contains visible text

Guideline 2.5.4: Motion Actuation (Level A)
  ✅ Device motion functions have UI alternative
  ✅ Can disable motion-triggered actions
```

---

### **Principle 3: Understandable**
Information and UI operation must be understandable.

#### **3.1 Readable**
```
Guideline 3.1.1: Language of Page (Level A)
  ✅ <html lang="bg-BG"> or lang="en-US"
  ✅ Update lang attribute when language changes

Guideline 3.1.2: Language of Parts (Level AA)
  ✅ Inline language changes marked
  ✅ <span lang="en">English text</span> in Bulgarian page
```

#### **3.2 Predictable**
```
Guideline 3.2.1: On Focus (Level A)
  ✅ Receiving focus doesn't trigger context change
  ✅ No auto-submit on focus

Guideline 3.2.2: On Input (Level A)
  ✅ Changing input doesn't auto-submit
  ✅ Warn before context changes

Guideline 3.2.3: Consistent Navigation (Level AA)
  ✅ Navigation order consistent across pages
  ✅ Same navigation component everywhere

Guideline 3.2.4: Consistent Identification (Level AA)
  ✅ Same icons/labels for same functionality
  ✅ Search icon always means search
```

#### **3.3 Input Assistance**
```
Guideline 3.3.1: Error Identification (Level A)
  ✅ Errors identified in text
  ✅ Explain what went wrong

Guideline 3.3.2: Labels or Instructions (Level A)
  ✅ Form labels provided
  ✅ Instructions for complex inputs

Guideline 3.3.3: Error Suggestion (Level AA)
  ✅ Suggest corrections for errors
  ✅ Example: "Email must contain @"

Guideline 3.3.4: Error Prevention (Legal, Financial, Data) (Level AA)
  ✅ Confirmation step before submission
  ✅ Ability to review/edit before final submit
  ✅ Applies to: Payments, car listings, profile changes
```

---

### **Principle 4: Robust**
Content must be robust enough for assistive technologies.

#### **4.1 Compatible**
```
Guideline 4.1.1: Parsing (Level A)
  ✅ Valid HTML (no duplicate IDs, proper nesting)
  ✅ Pass W3C validator

Guideline 4.1.2: Name, Role, Value (Level A)
  ✅ All UI components have accessible name
  ✅ Role is programmatically determined
  ✅ State changes announced to assistive tech

Guideline 4.1.3: Status Messages (Level AA)
  ✅ Status messages use ARIA live regions
  ✅ Success/error messages announced
  ✅ Loading states announced
```

---

## 🛠️ **Implementation Strategy**

### **Phase 1: Foundation (Week 1)**

#### **1. Setup Accessibility Testing Tools**
```bash
# Install dependencies
npm install --save-dev @axe-core/react jest-axe cypress-axe pa11y

# Configure in test setup
// src/setupTests.ts
import { toHaveNoViolations } from 'jest-axe';
expect.extend(toHaveNoViolations);
```

#### **2. Automated Testing Integration**
```typescript
// Example: Component accessibility test
import { axe } from 'jest-axe';
import { render } from '@testing-library/react';
import { CarCard } from './CarCard';

describe('CarCard Accessibility', () => {
  it('should have no accessibility violations', async () => {
    const { container } = render(<CarCard {...mockData} />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
```

#### **3. Baseline Audit**
```bash
# Run Lighthouse on all pages
npm run test:lighthouse

# Run axe on all pages
npm run test:axe

# Generate report
npm run test:a11y-report
```

---

### **Phase 2: Quick Wins (Week 2)**

#### **1. Alt Text for Images**
```typescript
// Before
<img src={car.image} />

// After
<img 
  src={car.image} 
  alt={`${car.year} ${car.make} ${car.model}`}
/>

// Decorative images
<img src={decorationImage} alt="" aria-hidden="true" />
```

#### **2. Form Labels**
```typescript
// Before
<input type="text" placeholder="Email" />

// After
<label htmlFor="email">Email Address</label>
<input 
  type="email" 
  id="email" 
  name="email"
  autoComplete="email"
  required
  aria-required="true"
/>
```

#### **3. Skip Navigation Link**
```typescript
// src/components/Layout/SkipNavigation.tsx (ALREADY EXISTS!)
import styled from 'styled-components';

const SkipLink = styled.a`
  position: absolute;
  top: -40px;
  left: 0;
  background: #003366;
  color: white;
  padding: 8px;
  text-decoration: none;
  z-index: 100;

  &:focus {
    top: 0;
  }
`;

export const SkipNavigation = () => (
  <SkipLink href="#main-content">
    Skip to main content
  </SkipLink>
);

// Add to Layout
<SkipNavigation />
<Header />
<main id="main-content">
  {children}
</main>
```

#### **4. Focus Indicators**
```typescript
// src/styles/GlobalStyles.tsx
const GlobalStyles = createGlobalStyle`
  /* Enhanced focus indicators */
  *:focus {
    outline: 3px solid ${({ theme }) => theme.colors.primary};
    outline-offset: 2px;
  }

  /* Skip link focus */
  a.skip-link:focus {
    position: static;
  }

  /* Button focus */
  button:focus-visible {
    outline: 3px solid ${({ theme }) => theme.colors.primary};
    outline-offset: 2px;
  }
`;
```

---

### **Phase 3: Core Components (Weeks 3-4)**

#### **1. Accessible Button Component**
```typescript
// src/components/Button/Button.tsx
interface ButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  ariaLabel?: string;
  ariaDescribedBy?: string;
  type?: 'button' | 'submit' | 'reset';
  loading?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  onClick,
  disabled,
  ariaLabel,
  ariaDescribedBy,
  type = 'button',
  loading,
}) => (
  <StyledButton
    type={type}
    onClick={onClick}
    disabled={disabled || loading}
    aria-label={ariaLabel}
    aria-describedby={ariaDescribedBy}
    aria-busy={loading}
  >
    {loading && <Spinner aria-hidden="true" />}
    {children}
  </StyledButton>
);
```

#### **2. Accessible Modal**
```typescript
// src/components/Modal/AccessibleModal.tsx
import { useEffect, useRef } from 'react';
import FocusTrap from 'focus-trap-react';

export const AccessibleModal: React.FC = ({ isOpen, onClose, children, title }) => {
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (isOpen) {
      // Focus close button when opened
      closeButtonRef.current?.focus();
      
      // Prevent body scroll
      document.body.style.overflow = 'hidden';
      
      return () => {
        document.body.style.overflow = 'unset';
      };
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <FocusTrap>
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
      >
        <Overlay onClick={onClose} aria-hidden="true" />
        <ModalContent>
          <ModalHeader>
            <h2 id="modal-title">{title}</h2>
            <button
              ref={closeButtonRef}
              onClick={onClose}
              aria-label="Close modal"
            >
              ×
            </button>
          </ModalHeader>
          <ModalBody>{children}</ModalBody>
        </ModalContent>
      </div>
    </FocusTrap>
  );
};
```

#### **3. Accessible Form Validation**
```typescript
// src/components/Input/Input.tsx
interface InputProps {
  label: string;
  error?: string;
  required?: boolean;
  // ... other props
}

export const Input: React.FC<InputProps> = ({
  label,
  error,
  required,
  id,
  ...props
}) => {
  const errorId = `${id}-error`;

  return (
    <FormGroup>
      <Label htmlFor={id}>
        {label}
        {required && <RequiredIndicator aria-label="required">*</RequiredIndicator>}
      </Label>
      <StyledInput
        id={id}
        aria-required={required}
        aria-invalid={!!error}
        aria-describedby={error ? errorId : undefined}
        {...props}
      />
      {error && (
        <ErrorMessage id={errorId} role="alert">
          {error}
        </ErrorMessage>
      )}
    </FormGroup>
  );
};
```

#### **4. Accessible Dropdown/Select**
```typescript
// Use existing library or build with ARIA
import Select from 'react-select';

<Select
  aria-label="Select car make"
  options={makes}
  onChange={handleChange}
  isClearable
  isSearchable
  placeholder="Choose a make..."
  // react-select handles ARIA automatically
/>
```

---

### **Phase 4: Page-Level Fixes (Week 5)**

#### **Priority Pages (High Traffic):**
```
1. Home Page (/)
   ✅ Hero section alt text
   ✅ Featured cars accessible
   ✅ Stats section semantic HTML

2. Cars List Page (/cars)
   ✅ Filter form accessible
   ✅ Card grid keyboard navigable
   ✅ Pagination accessible

3. Car Details Page (/car/:id)
   ✅ Image gallery keyboard controls
   ✅ Specifications table semantic
   ✅ Contact buttons accessible

4. Sell Workflow (15+ pages)
   ✅ Multi-step form accessible
   ✅ Progress indicator accessible
   ✅ Form validation accessible
   ✅ Image upload accessible

5. Profile Pages
   ✅ Profile forms accessible
   ✅ Settings page accessible
   ✅ My Listings page accessible
```

#### **Heading Hierarchy Example:**
```typescript
// HomePage.tsx - Proper heading structure
<main>
  <h1>Find Your Perfect Car in Bulgaria</h1> {/* Only one h1 */}
  
  <section>
    <h2>Featured Cars</h2> {/* Level 2 */}
    {cars.map(car => (
      <article>
        <h3>{car.title}</h3> {/* Level 3 */}
      </article>
    ))}
  </section>

  <section>
    <h2>Recent Listings</h2> {/* Level 2 */}
    {/* ... */}
  </section>
</main>
```

#### **ARIA Landmarks:**
```typescript
// Layout.tsx
<>
  <SkipNavigation />
  <header role="banner">
    <nav role="navigation" aria-label="Main navigation">
      {/* Navigation links */}
    </nav>
  </header>

  <main id="main-content" role="main">
    {children}
  </main>

  <aside role="complementary" aria-label="Sidebar">
    {/* Filters, ads, etc. */}
  </aside>

  <footer role="contentinfo">
    {/* Footer content */}
  </footer>
</>
```

---

### **Phase 5: Advanced Features & Testing (Week 6)**

#### **1. Live Regions for Dynamic Content**
```typescript
// src/components/Toast/Toast.tsx
export const Toast: React.FC = ({ message, type }) => (
  <div
    role="alert"
    aria-live="polite"
    aria-atomic="true"
  >
    <Icon type={type} aria-hidden="true" />
    <span>{message}</span>
  </div>
);

// Search Results Loading
<div aria-live="polite" aria-busy={loading}>
  {loading ? (
    <span>Loading results...</span>
  ) : (
    <span>{results.length} cars found</span>
  )}
</div>
```

#### **2. Keyboard Shortcuts**
```typescript
// src/hooks/useKeyboardShortcuts.ts
export const useKeyboardShortcuts = () => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // / key for search
      if (e.key === '/' && !isInputFocused()) {
        e.preventDefault();
        searchInputRef.current?.focus();
      }

      // Escape to close modal
      if (e.key === 'Escape') {
        closeModal();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);
};

// Add help tooltip
<button aria-label="Search (Press / key)">
  <Search />
</button>
```

#### **3. Screen Reader Testing Checklist**
```
Test with NVDA (Windows):
  ✅ Navigation menu readable
  ✅ Form labels announced
  ✅ Button purposes clear
  ✅ Error messages announced
  ✅ Dynamic content changes announced
  ✅ Images described appropriately

Test with VoiceOver (Mac):
  ✅ All interactive elements reachable
  ✅ Rotor navigation works (headings, links, forms)
  ✅ Dynamic updates announced

Test with JAWS (Windows):
  ✅ Forms mode works correctly
  ✅ Tables navigable
  ✅ ARIA widgets work
```

#### **4. Color Contrast Fixes**
```typescript
// Use contrast checker tool first
// WebAIM Contrast Checker: https://webaim.org/resources/contrastchecker/

// src/styles/theme.ts - Ensure AA compliance
export const bulgarianTheme = {
  colors: {
    primary: '#003366',      // Dark blue (7.73:1 on white) ✅
    secondary: '#CC0000',    // Red (5.39:1 on white) ✅
    text: '#1E3A5F',         // Dark blue-gray (9.82:1) ✅
    textSecondary: '#666666', // Gray (5.74:1) ✅
    
    // FIX: Light gray was 3.2:1 ❌
    // NEW: Darker gray 4.6:1 ✅
    textTertiary: '#757575',
    
    success: '#16a34a',      // Green (3.04:1) - use for large text only
    error: '#dc2626',        // Red (5.07:1) ✅
  },
};
```

---

## 📋 **Testing Strategy**

### **Automated Testing:**
```bash
# Jest + axe-core (unit/component tests)
npm run test:a11y

# Cypress + cypress-axe (E2E tests)
npm run test:e2e:a11y

# Pa11y (page-level audits)
npm run test:pa11y

# Lighthouse CI (continuous monitoring)
npm run test:lighthouse:ci
```

### **Manual Testing:**
```
1. Keyboard Navigation Test:
   ✅ Tab through all interactive elements
   ✅ Shift+Tab to go backwards
   ✅ Enter/Space to activate buttons
   ✅ Arrow keys in custom widgets
   ✅ Escape to close modals

2. Screen Reader Test:
   ✅ Navigate with NVDA/JAWS/VoiceOver
   ✅ Check all images have alt text
   ✅ Verify form labels read correctly
   ✅ Confirm error messages announced

3. Zoom Test:
   ✅ Zoom to 200% (Ctrl/Cmd +)
   ✅ Verify no horizontal scroll
   ✅ Check all content still readable
   ✅ Ensure buttons still clickable

4. Color Blindness Test:
   ✅ Use Chrome DevTools color vision simulation
   ✅ Test all color-coded elements
   ✅ Verify icons/text supplement color
```

---

## 📅 **Implementation Timeline (6 Weeks)**

### **Week 1: Foundation**
```
Days 1-2: Setup & Audit
  ✅ Install testing tools
  ✅ Run baseline audit (Lighthouse, axe)
  ✅ Document all issues
  ✅ Prioritize fixes

Days 3-5: Quick Wins
  ✅ Add alt text to images
  ✅ Fix form labels
  ✅ Add skip navigation
  ✅ Enhance focus indicators
```

### **Week 2: Core Components**
```
Days 1-2: Button & Input Components
  ✅ Accessible Button component
  ✅ Accessible Input component
  ✅ ARIA attributes

Days 3-5: Modal & Dropdown
  ✅ Accessible Modal (focus trap)
  ✅ Accessible Dropdown/Select
  ✅ Keyboard navigation
```

### **Week 3-4: Page-Level Fixes**
```
Week 3: High-Traffic Pages
  ✅ Home Page
  ✅ Cars List Page
  ✅ Car Details Page
  ✅ Search Page

Week 4: Sell Workflow & Profile
  ✅ All 15+ sell workflow pages
  ✅ Profile pages
  ✅ Settings page
  ✅ Payment pages
```

### **Week 5: Advanced Features**
```
Days 1-2: Dynamic Content
  ✅ ARIA live regions
  ✅ Loading states
  ✅ Toast notifications

Days 3-5: Keyboard Shortcuts & Testing
  ✅ Implement keyboard shortcuts
  ✅ Manual screen reader testing
  ✅ Color contrast fixes
```

### **Week 6: Final Testing & Documentation**
```
Days 1-3: Comprehensive Testing
  ✅ Test all 101+ pages
  ✅ Automated test suite
  ✅ Manual testing

Days 4-5: Documentation & Training
  ✅ Accessibility guidelines document
  ✅ Component accessibility docs
  ✅ Team training session
```

---

## ✅ **Success Criteria**

### **Automated Test Results:**
- [x] Lighthouse Accessibility Score: 90+ (currently unknown)
- [x] axe violations: 0 critical/serious
- [x] WAVE errors: 0
- [x] W3C HTML validator: 0 errors

### **Manual Test Results:**
- [x] All pages navigable by keyboard only
- [x] All pages usable with screen reader
- [x] All text readable at 200% zoom
- [x] All color contrasts meet AA standard (4.5:1 for text)

### **Compliance:**
- [x] WCAG 2.1 Level AA: 100% compliant
- [x] EU Web Accessibility Directive: Compliant
- [x] Screen reader compatible: NVDA, JAWS, VoiceOver

---

## 🛠️ **Tools & Resources**

### **Testing Tools:**
```
Automated:
  ✅ axe DevTools (browser extension)
  ✅ Lighthouse (Chrome DevTools)
  ✅ WAVE (web accessibility evaluation)
  ✅ Pa11y (command-line tool)

Manual:
  ✅ NVDA (Windows screen reader)
  ✅ JAWS (Windows screen reader)
  ✅ VoiceOver (Mac/iOS screen reader)
  ✅ Chrome DevTools (color vision simulation)

Libraries:
  ✅ @axe-core/react (React testing)
  ✅ jest-axe (Jest integration)
  ✅ cypress-axe (Cypress integration)
  ✅ focus-trap-react (modal focus management)
```

### **Reference Documentation:**
```
Standards:
  📖 WCAG 2.1: https://www.w3.org/WAI/WCAG21/quickref/
  📖 ARIA Authoring Practices: https://www.w3.org/WAI/ARIA/apg/

Guides:
  📖 WebAIM: https://webaim.org/
  📖 A11y Project: https://www.a11yproject.com/
  📖 MDN Accessibility: https://developer.mozilla.org/en-US/docs/Web/Accessibility

Tools:
  📖 Contrast Checker: https://webaim.org/resources/contrastchecker/
  📖 Color Oracle: https://colororacle.org/ (color blindness simulator)
```

---

## 📝 **Documentation to Create**

### **1. Accessibility Guidelines Document**
```markdown
# Accessibility Guidelines for Globul Cars

## General Principles
- Always use semantic HTML
- Provide text alternatives for non-text content
- Ensure sufficient color contrast
- Support keyboard navigation
- Use ARIA when semantic HTML isn't enough

## Component Checklist
- [ ] All images have alt text
- [ ] All form inputs have labels
- [ ] All buttons have descriptive text/aria-label
- [ ] All interactive elements keyboard accessible
- [ ] Color contrast meets 4.5:1 minimum
- [ ] Focus indicators visible

## Testing Checklist
- [ ] Run axe DevTools
- [ ] Test with keyboard only
- [ ] Test with screen reader
- [ ] Test at 200% zoom
- [ ] Test with color blindness simulator
```

### **2. Component Accessibility Documentation**
```typescript
// Example: Button.tsx documentation

/**
 * Accessible Button Component
 * 
 * Accessibility features:
 * - Semantic <button> element
 * - Keyboard accessible (Enter/Space)
 * - Focus indicator visible
 * - Loading state announced to screen readers
 * - Disabled state properly conveyed
 * 
 * @example
 * <Button 
 *   onClick={handleClick}
 *   ariaLabel="Submit form"
 *   loading={isLoading}
 * >
 *   Submit
 * </Button>
 */
```

---

**Phase 4 Status:** Ready for Implementation ✅  
**Estimated Effort:** 6 weeks (parallel with Mobile App development)  
**Expected Outcome:** WCAG 2.1 Level AA compliant, Lighthouse 90+ accessibility score
