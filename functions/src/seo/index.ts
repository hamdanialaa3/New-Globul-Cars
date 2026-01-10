/**
 * SEO Functions Index
 * Central export for all SEO-related Cloud Functions
 */

// IndexNow Service
export {
    onCarCreated as indexNowOnCarCreated,
    submitToIndexNow,
} from './indexnow-service';

// Search Console Service
export {
    requestIndexing,
    getSearchPerformanceDashboard,
    onCarCreatedIndexing,
    onCarSold,
} from './search-console-service';

// Image Optimizer
export {
    optimizeImage,
} from './image-optimizer';

// Prerender
export {
    prerender,
} from './prerender';
