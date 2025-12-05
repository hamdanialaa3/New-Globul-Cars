// Utility for safe lazy imports
import { lazy, ComponentType } from 'react';

export const safeLazy = <T extends ComponentType<any>>(
  importFn: () => Promise<any>
) => {
  return lazy(async () => {
    const module = await importFn();
    
    // 1. If module has default export, use it
    if (module && module.default) {
      return { default: module.default };
    }
    
    // 2. If module itself is a function/component, use it
    if (typeof module === 'function') {
      return { default: module };
    }
    
    // 3. Check if it's a valid React component object
    if (module && typeof module === 'object') {
      // Check for common React component patterns
      if (module.$$typeof || module.render || module.type) {
        return { default: module };
      }
      
      // Check if any property is a component
      const keys = Object.keys(module);
      for (const key of keys) {
        if (typeof module[key] === 'function' || 
            (module[key] && typeof module[key] === 'object' && (module[key].$$typeof || module[key].render))) {
          // Return the first valid component found
          console.warn(`Using ${key} from module as default export`);
          return { default: module[key] };
        }
      }
    }
    
    // 4. Fallback: log error but return empty component to prevent crash
    console.error('⚠️ Invalid lazy module - returning fallback:', module);
    return { 
      default: () => null // Return empty component instead of crashing
    };
  });
};