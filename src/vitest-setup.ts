// Vitest setup: alias jest globals to vi for backward compatibility
// This allows test files using jest.mock(), jest.fn() etc. to work with Vitest
import { vi } from 'vitest';

// Make jest.* APIs available globally for legacy test files
globalThis.jest = vi as any;
