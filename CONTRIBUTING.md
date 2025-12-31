# Contributing to Bulgarski Mobili

First off, thank you for considering contributing to Bulgarski Mobili! It's people like you that make this project better for everyone.

## 📋 Table of Contents
- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [How Can I Contribute?](#how-can-i-contribute)
- [Development Guidelines](#development-guidelines)
- [Pull Request Process](#pull-request-process)
- [Style Guides](#style-guides)
- [Community](#community)

## 📜 Code of Conduct

### Our Pledge

We as members, contributors, and leaders pledge to make participation in our community a harassment-free experience for everyone, regardless of age, body size, visible or invisible disability, ethnicity, sex characteristics, gender identity and expression, level of experience, education, socio-economic status, nationality, personal appearance, race, religion, or sexual identity and orientation.

### Our Standards

Examples of behavior that contributes to a positive environment:
- Using welcoming and inclusive language
- Being respectful of differing viewpoints and experiences
- Gracefully accepting constructive criticism
- Focusing on what is best for the community
- Showing empathy towards other community members

Examples of unacceptable behavior:
- Trolling, insulting/derogatory comments, and personal or political attacks
- Public or private harassment
- Publishing others' private information without explicit permission
- Other conduct which could reasonably be considered inappropriate

### Enforcement

Instances of abusive, harassing, or otherwise unacceptable behavior may be reported to the project maintainers. All complaints will be reviewed and investigated promptly and fairly.

## 🚀 Getting Started

### Prerequisites
- Node.js >= 18.0.0
- npm >= 8.0.0
- Git
- Firebase account (for testing Firebase features)

### Setting Up Your Development Environment

1. **Fork the repository** on GitHub
2. **Clone your fork** locally:
   ```bash
   git clone https://github.com/YOUR_USERNAME/New-Globul-Cars.git
   cd New-Globul-Cars
   ```
3. **Add the upstream repository**:
   ```bash
   git remote add upstream https://github.com/hamdanialaa3/New-Globul-Cars.git
   ```
4. **Install dependencies**:
   ```bash
   npm install
   ```
5. **Create a `.env.local` file** from the template:
   ```bash
   cp .env.example .env.local
   ```
6. **Start the development server**:
   ```bash
   npm start
   ```

## 🤔 How Can I Contribute?

### Reporting Bugs

Before creating bug reports, please check the existing issues to avoid duplicates. When you create a bug report, include as many details as possible:

**Bug Report Template:**
```markdown
**Describe the bug**
A clear and concise description of what the bug is.

**To Reproduce**
Steps to reproduce the behavior:
1. Go to '...'
2. Click on '...'
3. Scroll down to '...'
4. See error

**Expected behavior**
A clear and concise description of what you expected to happen.

**Screenshots**
If applicable, add screenshots to help explain your problem.

**Environment:**
 - OS: [e.g., Windows 10, macOS]
 - Browser: [e.g., Chrome 96, Firefox 94]
 - Node version: [e.g., 18.12.0]
 - App version: [e.g., 0.1.0]

**Additional context**
Add any other context about the problem here.
```

### Suggesting Enhancements

Enhancement suggestions are tracked as GitHub issues. When creating an enhancement suggestion, include:

**Enhancement Request Template:**
```markdown
**Is your feature request related to a problem?**
A clear and concise description of what the problem is.

**Describe the solution you'd like**
A clear and concise description of what you want to happen.

**Describe alternatives you've considered**
A clear and concise description of any alternative solutions or features you've considered.

**Additional context**
Add any other context or screenshots about the feature request here.
```

### Contributing Code

1. **Find an issue to work on** or create a new one
2. **Comment on the issue** to let others know you're working on it
3. **Create a branch** for your work:
   ```bash
   git checkout -b feature/your-feature-name
   # or
   git checkout -b fix/your-bug-fix
   ```
4. **Make your changes** following our development guidelines
5. **Test your changes** thoroughly
6. **Commit your changes** with a descriptive message
7. **Push to your fork** and **submit a pull request**

## 💻 Development Guidelines

### Project Architecture

Follow the established project structure:
- `src/components/` - Reusable UI components
- `src/pages/` - Full page components
- `src/features/` - Complex features (car-listing, analytics, etc.)
- `src/services/` - Business logic layer (singleton pattern)
- `src/contexts/` - React Context providers
- `src/hooks/` - Custom React hooks
- `src/utils/` - Utility functions
- `src/types/` - TypeScript type definitions

### Core Principles (from PROJECT_CONSTITUTION.md)

1. **Quality First**: No spaghetti code or temporary solutions
2. **Bulgarian Experience**: The site should feel native to Bulgarian users (language, currency, culture)
3. **Performance**: Every millisecond matters. Use WebP images and optimized code
4. **Design Excellence**: Aim for a WOW effect from the first glance

### Naming Conventions

- **Components**: PascalCase (e.g., `CarCard.tsx`)
- **Functions/Variables**: camelCase (e.g., `handleSearch`)
- **Constants**: UPPER_SNAKE_CASE (e.g., `MAX_UPLOAD_SIZE`)
- **Files**: kebab-case for utility files (e.g., `listing-limits.ts`)

### Path Aliases

Always use path aliases instead of relative imports:

```typescript
// ✅ Good
import { useAuth } from '@/contexts/AuthProvider';
import { logger } from '@/services/logger-service';

// ❌ Bad
import { useAuth } from '../../../contexts/AuthProvider';
```

### Service Layer Pattern

All business logic should be in services with singleton pattern:

```typescript
import { logger } from '@/services/logger-service';

class MyService {
  private static instance: MyService;

  static getInstance(): MyService {
    if (!this.instance) {
      this.instance = new MyService();
    }
    return this.instance;
  }

  async doWork() {
    try {
      logger.info('Starting work', { context });
      // Implementation
    } catch (error) {
      logger.error('Work failed', error as Error, { context });
      throw error;
    }
  }
}
```

### Logging

- **Never use** `console.log` in production code
- Use `logger-service.ts` for all logging:
  ```typescript
  import { logger } from '@/services/logger-service';
  
  logger.info('Info message', { context });
  logger.error('Error message', error, { context });
  logger.warn('Warning message', { context });
  ```

### TypeScript Guidelines

- Use strict TypeScript mode
- Define types for all props and function parameters
- Use canonical types from `src/types/`
- Never use `any` unless absolutely necessary (document why)

### Testing

- Write tests for all new features
- Use Jest and React Testing Library
- Test files: `*.test.ts` or `*.test.tsx`
- Maintain minimum 70% coverage (configured in jest.config.js)
- Run tests before submitting PR: `npm test`

### Code Quality

Before submitting a PR:
```bash
# Type check
npm run type-check

# Run tests
npm run test:ci

# Build (includes console.log check)
npm run build
```

## 📝 Pull Request Process

1. **Update documentation** if you're changing functionality
2. **Add tests** for new features
3. **Ensure all tests pass**: `npm run test:ci`
4. **Ensure TypeScript compiles**: `npm run type-check`
5. **Update the README.md** if necessary
6. **Follow the PR template** (will be provided when you open a PR)
7. **Request review** from maintainers
8. **Address review comments** promptly
9. **Squash commits** if requested

### PR Checklist

- [ ] My code follows the project's style guidelines
- [ ] I have performed a self-review of my own code
- [ ] I have commented my code, particularly in hard-to-understand areas
- [ ] I have made corresponding changes to the documentation
- [ ] My changes generate no new warnings
- [ ] I have added tests that prove my fix is effective or that my feature works
- [ ] New and existing unit tests pass locally with my changes
- [ ] Any dependent changes have been merged and published

## 🎨 Style Guides

### Git Commit Messages

- Use present tense ("Add feature" not "Added feature")
- Use imperative mood ("Move cursor to..." not "Moves cursor to...")
- Limit the first line to 72 characters or less
- Reference issues and pull requests after the first line

Examples:
```
Add user authentication with Firebase
Fix numeric ID routing issue (#123)
Update README with new installation steps
Refactor search service for better performance
```

### JavaScript/TypeScript Style

This project uses:
- **ESLint** with TypeScript rules
- **Prettier** for formatting
- **2 spaces** for indentation
- **Single quotes** for strings
- **Semicolons** at the end of statements

The linter will automatically run on staged files via husky pre-commit hooks.

### React/JSX Style

- Use functional components with hooks
- Use TypeScript for prop types
- One component per file
- Use PascalCase for component names
- Use meaningful prop names

Example:
```typescript
interface CarCardProps {
  car: Car;
  onSelect: (carId: string) => void;
  isSelected?: boolean;
}

export const CarCard: React.FC<CarCardProps> = ({ 
  car, 
  onSelect, 
  isSelected = false 
}) => {
  // Component implementation
};
```

## 🌍 Translation

When adding user-facing text:
1. Add entries to both `src/locales/bg/` and `src/locales/en/`
2. Use the `useLanguage()` hook to access translations
3. Follow existing namespace structure

Example:
```typescript
const { t } = useLanguage();
<p>{t('common.welcome')}</p>
```

## 🐛 Common Pitfalls to Avoid

1. **Never bypass listing limits** - Always call `canAddListing()` before creating listings
2. **Never use UUIDs in URLs** - Always resolve to numeric IDs for public-facing routes
3. **Never create duplicate search logic** - Use `UnifiedSearchService` exclusively
4. **Never use console.log** - Use `logger-service` (prebuild script will fail builds with console.log)
5. **Never hardcode collection names** - Use `SellWorkflowCollections.getCollectionNameForVehicleType()`
6. **Never skip numeric ID assignment** - Car creation MUST go through proper services
7. **Never add routes to AppRoutes.tsx** - Use modular route files in `src/routes/`

## 💬 Community

### Getting Help

- Check the [README.md](README.md) for basic information
- Review [PROJECT_CONSTITUTION.md](PROJECT_CONSTITUTION.md) for core principles
- Search existing issues before creating a new one
- Join discussions in issue comments

### Asking Questions

When asking questions:
- Check existing documentation first
- Be specific about what you've tried
- Include relevant code snippets or error messages
- Be patient and respectful

## 🎉 Recognition

Contributors will be recognized in:
- The project's README (if significant contribution)
- Release notes for features they contributed
- GitHub's contributor list

## 📄 License

By contributing, you agree that your contributions will be licensed under the same license as the project (MIT License).

---

Thank you for contributing to Bulgarski Mobili! Your efforts help create a better platform for the Bulgarian automotive community. 🚗💙
