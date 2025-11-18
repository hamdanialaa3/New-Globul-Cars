# 📊 TEST COVERAGE PLAN - 80%+ Target
## Comprehensive Testing Strategy for Bulgarian Car Marketplace

**Phase:** 1  
**Duration:** 6 weeks  
**Priority:** HIGH (Critical Foundation)  
**Target:** Increase coverage from <50% to 80%+

---

## 🎯 **Objectives**

### **Primary Goals:**
1. ✅ Achieve 80%+ overall test coverage
2. ✅ 90%+ coverage for critical business logic (Services)
3. ✅ 70%+ coverage for UI components
4. ✅ 100% coverage for payment flows
5. ✅ Full E2E testing for user journeys

### **Why Test Coverage Matters:**
- ✅ Catches bugs before production
- ✅ Enables confident refactoring
- ✅ Documents expected behavior
- ✅ Reduces maintenance costs
- ✅ Improves code quality

---

## 📈 **Current State Analysis**

### **Existing Test Infrastructure:**
```typescript
// package.json
"test": "craco test",
"test:ci": "craco test --watchAll=false --passWithNoTests --coverage"

Framework: Jest + React Testing Library
Config: jest.config.js
Coverage: <50% (estimated, no recent reports)
```

### **What's Already Tested:**
```
Services with __tests__/ folders:
  ✅ Some service tests exist
  ⚠️ Coverage is incomplete
  
Components:
  ⚠️ Minimal component testing
  ⚠️ No systematic coverage
  
Integration:
  ❌ No E2E tests currently
```

---

## 🎯 **Target Coverage Breakdown**

### **By Module:**

| Module | Current | Target | Priority |
|--------|---------|--------|----------|
| **Services** (103 services) | ~30% | **90%+** | 🔴 Critical |
| **Components** (200+) | ~20% | **70%+** | 🟡 High |
| **Pages** (101+) | ~10% | **60%+** | 🟢 Medium |
| **Utils** | ~40% | **95%+** | 🔴 Critical |
| **Hooks** | ~25% | **85%+** | 🟡 High |
| **Contexts** | ~50% | **90%+** | 🔴 Critical |
| **Overall** | **<50%** | **80%+** | 🔴 Critical |

---

## 📋 **Testing Strategy**

### **1. Unit Testing (Jest + Testing Library)**

#### **Services Layer (Priority 1):**
```
Target: 103 services → 90%+ coverage

Critical Services (100% coverage required):
1. ✅ firebase-auth-users-service.ts
2. ✅ payment-service.ts
3. ✅ validation-service.ts
4. ✅ workflowPersistenceService.ts
5. ✅ socket-service.ts
6. ✅ unified-cities-service.ts
7. ✅ stripe-service.ts
8. ✅ commission-service.ts
9. ✅ email-verification.ts
10. ✅ security-service.ts

High Priority Services (90%+ coverage):
11. ✅ bulgarian-profile-service.ts
12. ✅ firebase-cache.service.ts
13. ✅ firebase-real-data-service.ts
14. ✅ image-upload-service.ts
15. ✅ notification-service.ts
16. ✅ real-time-analytics-service.ts
17. ✅ billing-service.ts
18. ✅ subscription-service.ts
19. ✅ drafts-service.ts
20. ✅ logger-service.ts

Medium Priority (80%+ coverage):
- All remaining services (83 services)
```

#### **Test Template for Services:**
```typescript
// Example: services/__tests__/validation-service.test.ts
import { validator } from '../validation-service';

describe('ValidationService', () => {
  describe('validateEmail', () => {
    it('should validate correct Bulgarian email', () => {
      expect(validator.validateEmail('test@abv.bg')).toBe(true);
    });

    it('should reject invalid email', () => {
      expect(validator.validateEmail('invalid')).toBe(false);
    });

    it('should handle empty string', () => {
      expect(validator.validateEmail('')).toBe(false);
    });
  });

  describe('validatePhone', () => {
    it('should validate Bulgarian phone (+359)', () => {
      expect(validator.validatePhone('+359888123456')).toBe(true);
    });

    it('should reject invalid format', () => {
      expect(validator.validatePhone('123')).toBe(false);
    });
  });

  // ... more tests
});
```

---

#### **Components Layer (Priority 2):**
```
Target: 200+ components → 70%+ coverage

Critical Components (90%+ coverage):
1. ✅ Header/Header.tsx
2. ✅ MobileHeader
3. ✅ MobileBottomNav
4. ✅ Toast/ToastProvider
5. ✅ NotificationHandler
6. ✅ ErrorBoundary
7. ✅ ProtectedRoute
8. ✅ AdminRoute
9. ✅ AuthGuard
10. ✅ FloatingAddButton

High Priority Components (80%+ coverage):
- Form components (Input, Select, Textarea, etc.)
- Card components (CarCard, UserCard, PostCard)
- Modal components
- Navigation components

Medium Priority (70%+ coverage):
- Display components
- Layout components
- Utility components
```

#### **Test Template for Components:**
```typescript
// Example: components/__tests__/Header.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Header from '../Header';
import { LanguageProvider } from '@/contexts/LanguageContext';
import { AuthProvider } from '@/contexts/AuthProvider';

const renderWithProviders = (ui: React.ReactElement) => {
  return render(
    <BrowserRouter>
      <LanguageProvider>
        <AuthProvider>
          {ui}
        </AuthProvider>
      </LanguageProvider>
    </BrowserRouter>
  );
};

describe('Header Component', () => {
  it('should render logo and navigation', () => {
    renderWithProviders(<Header />);
    
    expect(screen.getByAltText(/logo/i)).toBeInTheDocument();
    expect(screen.getByText(/home/i)).toBeInTheDocument();
    expect(screen.getByText(/cars/i)).toBeInTheDocument();
  });

  it('should show login button when not authenticated', () => {
    renderWithProviders(<Header />);
    
    expect(screen.getByText(/login/i)).toBeInTheDocument();
  });

  it('should toggle mobile menu', () => {
    renderWithProviders(<Header />);
    
    const menuButton = screen.getByLabelText(/menu/i);
    fireEvent.click(menuButton);
    
    expect(screen.getByRole('navigation')).toHaveClass('open');
  });
});
```

---

#### **Pages Layer (Priority 3):**
```
Target: 101+ pages → 60%+ coverage

Critical Pages (80%+ coverage):
1. ✅ HomePage
2. ✅ CarsPage
3. ✅ CarDetailsPage
4. ✅ LoginPage
5. ✅ RegisterPage
6. ✅ ProfilePage (+ 6 subpages)
7. ✅ SellPage (all 15+ workflow pages)
8. ✅ CheckoutPage
9. ✅ PaymentSuccessPage
10. ✅ MessagesPage

High Priority Pages (70%+ coverage):
- All Protected Routes (35+ pages)
- Payment Pages (4 pages)
- Admin Pages (5 pages)

Medium Priority (60%+ coverage):
- Public pages
- Legal pages
- Testing pages (exclude from production coverage)
```

---

### **2. Integration Testing**

#### **API Integration Tests:**
```typescript
// Test Firebase interactions
describe('Firebase Integration', () => {
  it('should save user to Firestore on registration', async () => {
    // Test AuthProvider + Firebase
  });

  it('should retrieve car listings from Firestore', async () => {
    // Test carListingService + Firebase
  });

  it('should upload images to Firebase Storage', async () => {
    // Test image-upload-service + Firebase
  });
});
```

#### **Context Integration Tests:**
```typescript
// Test Provider interactions
describe('Context Integration', () => {
  it('should sync AuthProvider with ProfileTypeProvider', async () => {
    // Test context coordination
  });

  it('should update language across all components', async () => {
    // Test LanguageProvider propagation
  });
});
```

---

### **3. End-to-End Testing (Cypress)**

#### **Critical User Journeys:**

**Journey 1: Car Browsing (Guest)**
```gherkin
Feature: Browse cars as guest user
  Scenario: View car listings
    Given I am on the homepage
    When I click "Browse Cars"
    Then I should see a list of cars
    When I click on a car
    Then I should see car details
```

**Journey 2: User Registration & Login**
```gherkin
Feature: User authentication
  Scenario: Register new account
    Given I am on the register page
    When I fill in email, password, name, phone
    And I agree to terms
    And I click "Register"
    Then I should receive verification email
    When I verify my email
    Then I should be logged in
    And I should see my profile
```

**Journey 3: Sell Car Workflow (Authenticated)**
```gherkin
Feature: Sell a car
  Scenario: Complete sell workflow
    Given I am logged in
    When I click "Sell Car"
    Then I should see vehicle type selection
    When I select "Car"
    And I select seller type "Private"
    And I fill in vehicle data
    And I add equipment
    And I upload 5 images
    And I set price to "15000 EUR"
    And I fill in contact info
    And I click "Publish"
    Then I should see success message
    And my car should be listed
```

**Journey 4: Payment Flow**
```gherkin
Feature: Subscribe to premium plan
  Scenario: Upgrade to premium
    Given I am logged in as private user
    When I go to billing page
    And I select "Premium" plan
    And I click "Subscribe"
    Then I should see Stripe checkout
    When I complete payment
    Then I should be redirected to success page
    And my plan should be "Premium"
```

**Journey 5: Messages**
```gherkin
Feature: Send message to seller
  Scenario: Contact car seller
    Given I am logged in
    And I am viewing a car
    When I click "Contact Seller"
    And I type a message
    And I click "Send"
    Then the message should be sent
    And I should see it in my messages
    And seller should receive notification
```

#### **Cypress Configuration:**
```javascript
// cypress.config.js
module.exports = {
  e2e: {
    baseUrl: 'http://localhost:3000',
    specPattern: 'cypress/e2e/**/*.cy.{js,jsx,ts,tsx}',
    supportFile: 'cypress/support/e2e.ts',
    video: true,
    screenshotOnRunFailure: true,
    viewportWidth: 1280,
    viewportHeight: 720,
  },
  env: {
    FIREBASE_API_KEY: process.env.REACT_APP_FIREBASE_API_KEY,
    // ... other env vars
  },
};
```

---

## 🛠️ **Tools & Setup**

### **Testing Stack:**
```json
{
  "dependencies": {
    "@testing-library/react": "^16.3.0",
    "@testing-library/jest-dom": "^6.8.0",
    "@testing-library/user-event": "^13.5.0",
    "jest": "^27.5.1",
    "cypress": "^13.6.0",
    "@cypress/code-coverage": "^3.12.0"
  }
}
```

### **Coverage Tools:**
```bash
# Install coverage tools
npm install --save-dev codecov
npm install --save-dev istanbul-lib-coverage
npm install --save-dev @cypress/code-coverage
```

### **CI/CD Integration:**
```yaml
# .github/workflows/test.yml
name: Test Coverage
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Install dependencies
        run: npm install
      - name: Run tests with coverage
        run: npm run test:ci
      - name: Upload coverage to Codecov
        uses: codecov/codecov-action@v3
        with:
          token: ${{ secrets.CODECOV_TOKEN }}
```

---

## 📅 **Implementation Timeline (6 Weeks)**

### **Week 1: Foundation & Planning**
```
Days 1-2: Setup & Configuration
  ✅ Configure Jest coverage thresholds
  ✅ Setup Cypress
  ✅ Create test utilities and helpers
  ✅ Setup CI/CD pipeline

Days 3-5: Critical Services Testing
  ✅ Write tests for top 10 critical services
  ✅ Target: 100% coverage for these services
  ✅ Fix any bugs discovered
```

### **Week 2: Services Layer (Part 1)**
```
Days 1-3: High Priority Services
  ✅ Test 20 high-priority services
  ✅ Target: 90%+ coverage
  ✅ Mock Firebase calls
  ✅ Test error handling

Days 4-5: Medium Priority Services (Part 1)
  ✅ Start testing remaining services
  ✅ Target: 40 services covered
```

### **Week 3: Services Layer (Part 2) + Hooks**
```
Days 1-3: Medium Priority Services (Part 2)
  ✅ Complete testing remaining services
  ✅ Target: All 103 services tested
  ✅ Overall services coverage: 90%+

Days 4-5: Hooks & Custom Hooks
  ✅ Test all custom hooks
  ✅ useLanguage, useAuth, useProfileType
  ✅ Target: 85%+ coverage
```

### **Week 4: Components Layer**
```
Days 1-2: Critical Components
  ✅ Header, MobileHeader, MobileBottomNav
  ✅ Toast, Notifications, Error Boundaries
  ✅ Target: 90%+ coverage

Days 3-5: High Priority Components
  ✅ Form components
  ✅ Card components
  ✅ Modal components
  ✅ Target: 80%+ coverage
```

### **Week 5: Pages & Integration Tests**
```
Days 1-3: Critical Pages
  ✅ HomePage, CarsPage, CarDetailsPage
  ✅ LoginPage, RegisterPage, ProfilePage
  ✅ Sell workflow pages (15+)
  ✅ Target: 80%+ coverage

Days 4-5: Integration Tests
  ✅ Context integration
  ✅ Firebase integration
  ✅ Real-time features
```

### **Week 6: E2E Tests & Validation**
```
Days 1-3: Cypress E2E Tests
  ✅ 5 critical user journeys
  ✅ All test scenarios passing
  ✅ Video recordings reviewed

Days 4-5: Coverage Validation & Reporting
  ✅ Verify 80%+ overall coverage
  ✅ Generate comprehensive coverage report
  ✅ Document gaps and plan for next iteration
  ✅ Update documentation
```

---

## 📊 **Coverage Thresholds**

### **Jest Configuration:**
```javascript
// jest.config.js
module.exports = {
  coverageThreshold: {
    global: {
      statements: 80,
      branches: 75,
      functions: 80,
      lines: 80,
    },
    './src/services/**/*.ts': {
      statements: 90,
      branches: 85,
      functions: 90,
      lines: 90,
    },
    './src/components/**/*.tsx': {
      statements: 70,
      branches: 65,
      functions: 70,
      lines: 70,
    },
    './src/contexts/**/*.tsx': {
      statements: 90,
      branches: 85,
      functions: 90,
      lines: 90,
    },
    './src/utils/**/*.ts': {
      statements: 95,
      branches: 90,
      functions: 95,
      lines: 95,
    },
  },
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.d.ts',
    '!src/index.tsx',
    '!src/reportWebVitals.ts',
    '!src/service-worker.ts',
    '!src/**/__tests__/**',
    '!src/**/*.test.{ts,tsx}',
  ],
};
```

---

## ✅ **Success Criteria**

### **Quantitative Metrics:**
- [x] Overall coverage: **80%+**
- [x] Services coverage: **90%+**
- [x] Components coverage: **70%+**
- [x] Critical services: **100%**
- [x] All 5 E2E journeys passing
- [x] Zero failing tests in CI/CD

### **Qualitative Metrics:**
- [x] All critical bugs caught by tests
- [x] Tests are maintainable and readable
- [x] Test suite runs in <10 minutes
- [x] Coverage reports integrated in CI/CD
- [x] Team trained on testing best practices

---

## 🎯 **Testing Best Practices**

### **1. AAA Pattern (Arrange, Act, Assert):**
```typescript
it('should calculate commission correctly', () => {
  // Arrange
  const price = 10000;
  const rate = 0.05;
  
  // Act
  const commission = calculateCommission(price, rate);
  
  // Assert
  expect(commission).toBe(500);
});
```

### **2. Test Isolation:**
```typescript
beforeEach(() => {
  // Reset state before each test
  jest.clearAllMocks();
});

afterEach(() => {
  // Cleanup after each test
  cleanup();
});
```

### **3. Mocking External Dependencies:**
```typescript
// Mock Firebase
jest.mock('../firebase/firebase-config', () => ({
  db: jest.fn(),
  auth: jest.fn(),
  storage: jest.fn(),
}));

// Mock API calls
jest.mock('../services/api-service', () => ({
  fetchCars: jest.fn(() => Promise.resolve(mockCars)),
}));
```

### **4. Descriptive Test Names:**
```typescript
// ✅ Good
it('should return error when email is invalid', () => {});

// ❌ Bad
it('test email', () => {});
```

### **5. Test Edge Cases:**
```typescript
describe('validatePrice', () => {
  it('should accept valid price', () => {
    expect(validatePrice(1000)).toBe(true);
  });

  it('should reject negative price', () => {
    expect(validatePrice(-100)).toBe(false);
  });

  it('should reject zero price', () => {
    expect(validatePrice(0)).toBe(false);
  });

  it('should reject non-numeric value', () => {
    expect(validatePrice('abc')).toBe(false);
  });

  it('should handle null/undefined', () => {
    expect(validatePrice(null)).toBe(false);
    expect(validatePrice(undefined)).toBe(false);
  });
});
```

---

## 📚 **Documentation & Training**

### **Developer Guide:**
```markdown
# Testing Guide for Developers

## Writing Unit Tests
1. Create test file next to source file
2. Follow AAA pattern
3. Mock external dependencies
4. Test edge cases
5. Use descriptive names

## Running Tests
- Local: npm test
- CI: npm run test:ci
- Coverage: npm run test:ci --coverage

## Best Practices
- Keep tests simple and focused
- One assertion per test (when possible)
- Avoid test interdependencies
- Use beforeEach/afterEach for setup/cleanup
```

### **Training Sessions:**
```
Week 1: Testing fundamentals (2 hours)
Week 2: Jest + Testing Library (2 hours)
Week 3: Mocking strategies (1.5 hours)
Week 4: E2E testing with Cypress (2 hours)
```

---

## 🚀 **Quick Start**

### **Run Tests:**
```bash
# Watch mode (development)
npm test

# Single run with coverage
npm run test:ci

# Run specific test file
npm test -- validation-service.test.ts

# Update snapshots
npm test -- -u
```

### **View Coverage:**
```bash
# Generate coverage report
npm run test:ci --coverage

# Open HTML report
open coverage/lcov-report/index.html
```

### **Run E2E Tests:**
```bash
# Open Cypress GUI
npx cypress open

# Run headless
npx cypress run

# Run specific spec
npx cypress run --spec "cypress/e2e/sell-workflow.cy.ts"
```

---

## 📊 **Progress Tracking**

### **Weekly Checklist:**
```
Week 1:
  [ ] Jest configured
  [ ] Cypress installed
  [ ] CI/CD pipeline setup
  [ ] 10 critical services tested (100%)
  [ ] Week 1 report submitted

Week 2:
  [ ] 20 high-priority services tested (90%+)
  [ ] 40 medium-priority services tested (80%+)
  [ ] Week 2 report submitted

Week 3:
  [ ] All 103 services tested
  [ ] Services coverage: 90%+
  [ ] All hooks tested (85%+)
  [ ] Week 3 report submitted

Week 4:
  [ ] Critical components tested (90%+)
  [ ] High-priority components tested (80%+)
  [ ] Week 4 report submitted

Week 5:
  [ ] Critical pages tested (80%+)
  [ ] Integration tests completed
  [ ] Week 5 report submitted

Week 6:
  [ ] 5 E2E journeys completed
  [ ] Overall coverage: 80%+
  [ ] Final report submitted
  [ ] Phase 1 complete ✅
```

---

## 📈 **Reporting Template**

### **Weekly Progress Report:**
```markdown
# Test Coverage - Week X Report

## Achievements
- Tests written: X
- Coverage increase: X% → Y%
- Bugs found: X
- Bugs fixed: X

## Challenges
- Challenge 1: Description + Solution
- Challenge 2: Description + Solution

## Next Week Goals
- Goal 1
- Goal 2
- Goal 3

## Metrics
- Current coverage: X%
- Target coverage: 80%
- Services tested: X/103
- Components tested: X/200+
- Pages tested: X/101+
```

---

**Phase 1 Status:** Ready for Implementation ✅  
**Estimated Effort:** 6 weeks (1.5 developer-months)  
**Expected Outcome:** 80%+ test coverage with comprehensive test suite
