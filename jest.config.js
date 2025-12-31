// jest.config.js
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  setupFiles: ['<rootDir>/src/setupTests.ts'],
  testEnvironmentOptions: {
    html: '<html lang="zh-cmn-Hant"></html>',
    url: 'https://jestjs.io/',
    userAgent: 'Agent/007',
    resources: 'usable',
  },
  roots: ['<rootDir>/src'],
  testMatch: [
    '**/__tests__/**/*.+(ts|tsx|js|jsx)',
    '**/?(*.)+(spec|test).+(ts|tsx|js|jsx)'
  ],
  transform: {
    '^.+\\.(ts|tsx)$': ['ts-jest', {
      tsconfig: 'tsconfig.json',
    }],
    '^.+\\.(js|jsx)$': 'babel-jest',
  },
  transformIgnorePatterns: [
    '/node_modules/(?!(@babel|@jest|react|react-dom|date-fns|d3|styled-components)/)',
  ],
  // Professional path mapping synchronized with tsconfig.json
  // CRITICAL: Order matters - specific patterns MUST come before generic ones
  moduleNameMapper: {
      // styled-components global mock for all tests
      '^styled-components$': '<rootDir>/src/__mocks__/styled-components.js',
    // Force all date-fns/locale/bg imports to use manual mock (fix ESM test errors)
    '^date-fns/locale/bg$': '<rootDir>/src/__mocks__/date-fns/locale/bg.js',
    // d3 mock FIRST to prevent ES module parsing
    '^d3$': '<rootDir>/src/__mocks__/d3Mock.js',
    
    // Firebase config mock to prevent initialization errors
    '^@/firebase/firebase-config$': '<rootDir>/src/__mocks__/firebase/firebase-config.ts',
    
    // TypeScript path aliases (specific patterns before generic @/(.*)$)
    '^@/services/(.*)$': '<rootDir>/src/services/$1',
    '^@/components/(.*)$': '<rootDir>/src/components/$1',
    '^@/contexts/(.*)$': '<rootDir>/src/contexts/$1',
    '^@/utils/(.*)$': '<rootDir>/src/utils/$1',
    '^@/types/(.*)$': '<rootDir>/src/types/$1',
    '^@/hooks/(.*)$': '<rootDir>/src/hooks/$1',
    '^@/pages/(.*)$': '<rootDir>/src/pages/$1',
    '^@/firebase/(.*)$': '<rootDir>/src/firebase/$1',
    '^@/data/(.*)$': '<rootDir>/src/data/$1',
    '^@/constants/(.*)$': '<rootDir>/src/constants/$1',
    '^@/features/(.*)$': '<rootDir>/src/features/$1',
    '^@/assets/(.*)$': '<rootDir>/src/assets/$1',
    
    // Monorepo packages
    '^@globul-cars/core$': '<rootDir>/packages/core/src/index',
    '^@globul-cars/core/(.*)$': '<rootDir>/packages/core/src/$1',
    '^@globul-cars/services$': '<rootDir>/packages/services/src/index',
    '^@globul-cars/services/(.*)$': '<rootDir>/packages/services/src/$1',
    
    // Generic fallback (MUST be last among @/ patterns)
    '^@/(.*)$': '<rootDir>/src/$1',
    
    // Static assets
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
    '\\.(jpg|jpeg|png|gif|svg)$': '<rootDir>/src/__mocks__/fileMock.js',
  },
  setupFiles: ['<rootDir>/src/globalSetup.js'],
  setupFilesAfterEnv: ['<rootDir>/src/setupTests.ts', '<rootDir>/src/setupTestsAfterEnv.js'],
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.d.ts',
    '!src/**/*.stories.tsx',
    '!src/index.tsx',
    '!src/reportWebVitals.ts',
  ],
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 70,
      lines: 70,
      statements: 70
    }
  },
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
  transformIgnorePatterns: [
    // Transform ES modules from node_modules (d3, Firebase, date-fns, etc.)
    'node_modules/(?!(firebase|@firebase|d3|d3-array|d3-axis|d3-brush|d3-chord|d3-color|d3-contour|d3-delaunay|d3-dispatch|d3-drag|d3-dsv|d3-ease|d3-fetch|d3-force|d3-format|d3-geo|d3-hierarchy|d3-interpolate|d3-path|d3-polygon|d3-quadtree|d3-random|d3-scale|d3-scale-chromatic|d3-selection|d3-shape|d3-time|d3-time-format|d3-timer|d3-transition|d3-zoom|internmap|delaunator|robust-predicates|date-fns|date-fns/locale)/)'
  ],
  globals: {
    'ts-jest': {
      isolatedModules: true,
    }
  }
};
