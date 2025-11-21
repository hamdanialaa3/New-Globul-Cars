export const logger = {
  info: (message: string, payload?: unknown) => {
    try { console.log(`[INFO] ${message}`, payload ?? ''); } catch {}
  },
  warn: (message: string, payload?: unknown) => {
    try { console.warn(`[WARN] ${message}`, payload ?? ''); } catch {}
  },
  error: (message: string, payload?: unknown) => {
    try { console.error(`[ERROR] ${message}`, payload ?? ''); } catch {}
  },
};
