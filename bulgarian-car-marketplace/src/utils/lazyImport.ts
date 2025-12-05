// Utility for safe lazy imports
import { lazy, ComponentType } from 'react';

export const safeLazy = <T extends ComponentType<any>>(
  importFn: () => Promise<{ default: T } | T>
) => {
  return lazy(() => 
    importFn().then(module => {
      // Handle both default exports and module objects
      if ('default' in module) {
        return { default: module.default };
      }
      // If it's already a component (function or class)
      if (typeof module === 'function' || (module && typeof module === 'object' && 'render' in module)) {
        return { default: module as T };
      }
      // Fallback: throw error for debugging
      console.error('Invalid module loaded:', module);
      throw new Error('Lazy loaded module must be a React component or have a default export');
    })
  );
};