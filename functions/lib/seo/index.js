"use strict";
/**
 * SEO Functions Index
 * Central export for all SEO-related Cloud Functions
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.prerender = exports.optimizeImage = exports.onCarSold = exports.onCarCreatedIndexing = exports.getSearchPerformanceDashboard = exports.requestIndexing = exports.submitToIndexNow = exports.indexNowOnCarCreated = void 0;
// IndexNow Service
var indexnow_service_1 = require("./indexnow-service");
Object.defineProperty(exports, "indexNowOnCarCreated", { enumerable: true, get: function () { return indexnow_service_1.onCarCreated; } });
Object.defineProperty(exports, "submitToIndexNow", { enumerable: true, get: function () { return indexnow_service_1.submitToIndexNow; } });
// Search Console Service
var search_console_service_1 = require("./search-console-service");
Object.defineProperty(exports, "requestIndexing", { enumerable: true, get: function () { return search_console_service_1.requestIndexing; } });
Object.defineProperty(exports, "getSearchPerformanceDashboard", { enumerable: true, get: function () { return search_console_service_1.getSearchPerformanceDashboard; } });
Object.defineProperty(exports, "onCarCreatedIndexing", { enumerable: true, get: function () { return search_console_service_1.onCarCreatedIndexing; } });
Object.defineProperty(exports, "onCarSold", { enumerable: true, get: function () { return search_console_service_1.onCarSold; } });
// Image Optimizer
var image_optimizer_1 = require("./image-optimizer");
Object.defineProperty(exports, "optimizeImage", { enumerable: true, get: function () { return image_optimizer_1.optimizeImage; } });
// Prerender
var prerender_1 = require("./prerender");
Object.defineProperty(exports, "prerender", { enumerable: true, get: function () { return prerender_1.prerender; } });
//# sourceMappingURL=index.js.map