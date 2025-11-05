# Project Constitution - Bulgarian Car Marketplace

## Core Principles

### Geographic & Language Settings
- **Location:** Republic of Bulgaria
- **Languages:** Bulgarian (BG) + English (EN)
- **Currency:** EUR (Euro)

---

## Code Standards

### File Size Rule
- **Maximum:** 300 lines per file
- **Action if exceeded:** Split code into multiple files with:
  - Proper helper functions
  - Appropriate comments
  - Link functions to connect files

### No Duplication
- Every function must have ONE canonical source
- No duplicate code across files
- Reuse through imports, not copy-paste

### File Analysis Before Work
- **Mandatory:** Analyze every file before modification
- Check for dependencies
- Verify current usage
- Plan changes before execution

### Text Emojis - FORBIDDEN
**Prohibited in entire project:**
- Text emojis like: 📍 📞 🎯 ❤️ ⚡ ⭐ 🚗
- No emojis in code
- No emojis in comments
- No emojis in file names
- No emojis in documentation

**Why?** Professional codebase standards, better compatibility, cleaner git diffs.

---

## Development Philosophy

### Real Production Code Only
- Everything built is for public release
- No experimental/test code in main branch
- Real features for real users
- Ready for live deployment

### No Deletion Policy
**Critical Rule:** Never delete files permanently

**Instead:**
```bash
# Move to DDD directory (Digital Deletion Directory)
mv old-file.ts C:\Users\hamda\Desktop\New Globul Cars\DDD\

# Manual review later
# User will decide final fate of files
```

**Benefits:**
- Easy recovery if needed
- Safe refactoring
- Audit trail preserved
- Zero risk

---

## Quality Standards

### Code Quality
- TypeScript strict mode
- Full type coverage
- No `any` types (except when necessary)
- Proper error handling
- Clean, readable code

### Documentation
- All public functions documented
- Complex logic explained
- API endpoints described
- Architecture documented

### Testing
- Critical paths tested
- User flows verified
- Edge cases handled
- Performance checked

---

## Git Workflow

### Branch Strategy
- **main:** Production-ready code
- **develop:** Integration branch
- **feature/*:** New features
- **refactor/*:** Code cleanup
- **bugfix/*:** Bug fixes

### Commit Messages
Format: `Type: Description`

Types:
- `feat:` New feature
- `fix:` Bug fix
- `refactor:` Code restructuring
- `docs:` Documentation
- `style:` Formatting
- `test:` Tests
- `chore:` Maintenance

Example:
```bash
git commit -m "refactor: Consolidate profile services"
```

---

## File Organization

### Services
- One service per domain
- Canonical source pattern
- Clear responsibilities
- Singleton exports

### Components
- Small, focused components
- Reusable design
- Props typed
- Styled components preferred

### Pages
- Route-level components
- Compose smaller components
- Handle page-level state
- SEO optimized

---

## Naming Conventions

### Files
- **Components:** PascalCase.tsx (e.g., UserProfile.tsx)
- **Services:** kebab-case.service.ts (e.g., user-profile.service.ts)
- **Types:** kebab-case.types.ts (e.g., bulgarian-user.types.ts)
- **Utils:** kebab-case.ts (e.g., format-date.ts)

### Variables
- **camelCase:** variables, functions
- **PascalCase:** Classes, Interfaces, Types
- **UPPER_SNAKE_CASE:** Constants

Examples:
```typescript
const userName = 'John';
const MAX_RETRIES = 3;
class UserService { }
interface BulgarianUser { }
```

---

## Security Rules

### Authentication
- Firebase Auth only
- Secure token handling
- Session management
- Proper logout

### Data Protection
- User data encrypted
- Firestore security rules
- API keys in environment variables
- No secrets in code

### Validation
- Client-side validation (UX)
- Server-side validation (security)
- Input sanitization
- XSS prevention

---

## Performance Standards

### Load Time
- First paint: < 2 seconds
- Interactive: < 4 seconds
- Lazy loading for heavy components
- Image optimization

### Bundle Size
- Code splitting
- Tree shaking
- Remove unused dependencies
- Minimize external libraries

### Database
- Efficient queries
- Proper indexing
- Pagination implemented
- Caching when appropriate

---

## Accessibility

### Standards
- WCAG 2.1 Level AA
- Keyboard navigation
- Screen reader support
- Proper ARIA labels

### Implementation
- Semantic HTML
- Alt text for images
- Focus indicators
- Color contrast ratios

---

## Bulgarian Market Specifics

### Language Support
- Bulgarian Cyrillic alphabet
- English as secondary
- Proper translations
- Date/time in Bulgarian format

### Currency
- All prices in EUR
- Format: 1.234,56 EUR (Bulgarian style)
- No other currencies

### Location
- Bulgarian cities
- Bulgarian regions
- Cyrillic city names
- English translations available

---

## Maintenance

### Regular Tasks
- Dependency updates (monthly)
- Security patches (immediate)
- Performance audits (quarterly)
- Code cleanup (ongoing)

### Monitoring
- Error tracking
- Performance metrics
- User analytics
- System health

---

## Refactoring Guidelines

### When to Refactor
- Code duplication detected
- File exceeds 300 lines
- Performance issues
- Unclear architecture

### How to Refactor
1. Create backup branch
2. Plan changes
3. Implement incrementally
4. Test thoroughly
5. Move old files to DDD/
6. Document changes

### Never During Refactoring
- Change user-facing features
- Modify UI/UX
- Remove functionality
- Delete files permanently

---

## Success Metrics

### Code Quality
- Zero console.log in production
- Zero TODO/FIXME comments
- 100% TypeScript coverage
- No deprecated code

### User Experience
- Fast page loads
- Smooth interactions
- No errors
- Responsive design

### Business Goals
- User satisfaction
- Feature completeness
- System reliability
- Maintainability

---

## Contact & Support

For questions about this constitution:
1. Check documentation in 📚 DOCUMENTATION/
2. Review ARCHITECTURE.md
3. Consult development team
4. Update constitution if needed

---

**Last Updated:** November 3, 2025  
**Version:** 1.0  
**Status:** Active

**This constitution is binding for all development work on Bulgarian Car Marketplace.**

