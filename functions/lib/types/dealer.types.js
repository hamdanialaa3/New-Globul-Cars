"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.dealerInventoryRowSchema = exports.initBulkUploadSchema = void 0;
const zod_1 = require("zod");
// Input schema for initializing a bulk upload
exports.initBulkUploadSchema = zod_1.z.object({
    filename: zod_1.z.string().min(1, "Filename is required"),
    rowCount: zod_1.z.number().min(1).max(500, "Maximum 500 rows per upload"),
    fieldsMapping: zod_1.z.record(zod_1.z.string(), zod_1.z.string()).optional(),
});
// Single row schema (CSV data row)
exports.dealerInventoryRowSchema = zod_1.z.object({
    vin: zod_1.z.string().min(17, "VIN must be 17 characters").max(17).regex(/^[A-HJ-NPR-Z0-9]+$/),
    make: zod_1.z.string().min(1, "Make is required"),
    model: zod_1.z.string().min(1, "Model is required"),
    year: zod_1.z.coerce.number().min(1900).max(2026),
    price_eur: zod_1.z.coerce.number().min(0, "Price must be positive"),
    mileage_km: zod_1.z.coerce.number().min(0).optional(),
    fuel_type: zod_1.z.string().optional(),
    transmission: zod_1.z.string().optional(),
    images: zod_1.z.string().optional(), // usually comma-separated URLs in CSV
    description: zod_1.z.string().optional(),
});
//# sourceMappingURL=dealer.types.js.map