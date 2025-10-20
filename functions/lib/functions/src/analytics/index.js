"use strict";
// functions/src/analytics/index.ts
// Export all analytics Cloud Functions
Object.defineProperty(exports, "__esModule", { value: true });
exports.calculateConversionRates = exports.calculateResponseMetrics = exports.resetMonthlyCounters = exports.resetWeeklyCounters = exports.resetDailyCounters = exports.getUserAnalytics = exports.trackEvent = void 0;
var trackEvent_1 = require("./trackEvent");
Object.defineProperty(exports, "trackEvent", { enumerable: true, get: function () { return trackEvent_1.trackEvent; } });
var getUserAnalytics_1 = require("./getUserAnalytics");
Object.defineProperty(exports, "getUserAnalytics", { enumerable: true, get: function () { return getUserAnalytics_1.getUserAnalytics; } });
var resetCounters_1 = require("./resetCounters");
Object.defineProperty(exports, "resetDailyCounters", { enumerable: true, get: function () { return resetCounters_1.resetDailyCounters; } });
Object.defineProperty(exports, "resetWeeklyCounters", { enumerable: true, get: function () { return resetCounters_1.resetWeeklyCounters; } });
Object.defineProperty(exports, "resetMonthlyCounters", { enumerable: true, get: function () { return resetCounters_1.resetMonthlyCounters; } });
Object.defineProperty(exports, "calculateResponseMetrics", { enumerable: true, get: function () { return resetCounters_1.calculateResponseMetrics; } });
Object.defineProperty(exports, "calculateConversionRates", { enumerable: true, get: function () { return resetCounters_1.calculateConversionRates; } });
//# sourceMappingURL=index.js.map