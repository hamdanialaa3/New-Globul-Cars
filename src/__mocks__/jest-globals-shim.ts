// Shim: redirect @jest/globals imports to Vitest globals
export { describe, it, it as test, expect, beforeEach, afterEach, beforeAll, afterAll, vi as jest } from 'vitest';
