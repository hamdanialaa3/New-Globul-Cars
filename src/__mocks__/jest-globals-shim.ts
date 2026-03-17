// Shim: redirect @jest/globals imports to Vitest globals
export { describe, it, expect, beforeEach, afterEach, beforeAll, afterAll, vi as jest } from 'vitest';
