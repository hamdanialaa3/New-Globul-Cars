import { z } from "zod";

// Input schema for initializing a bulk upload
export const initBulkUploadSchema = z.object({
    filename: z.string().min(1, "Filename is required"),
    rowCount: z.number().min(1).max(500, "Maximum 500 rows per upload"),
    fieldsMapping: z.record(z.string(), z.string()).optional(),
});

// Single row schema (CSV data row)
export const dealerInventoryRowSchema = z.object({
    vin: z.string().min(17, "VIN must be 17 characters").max(17).regex(/^[A-HJ-NPR-Z0-9]+$/),
    make: z.string().min(1, "Make is required"),
    model: z.string().min(1, "Model is required"),
    year: z.coerce.number().min(1900).max(2026),
    price_eur: z.coerce.number().min(0, "Price must be positive"),
    mileage_km: z.coerce.number().min(0).optional(),
    fuel_type: z.string().optional(),
    transmission: z.string().optional(),
    images: z.string().optional(), // usually comma-separated URLs in CSV
    description: z.string().optional(),
});

export type DealerInventoryRow = z.infer<typeof dealerInventoryRowSchema>;

export interface BulkUploadJob {
    jobId: string;
    dealerId: string;
    filename: string;
    status: "pending" | "processing" | "completed" | "failed";
    progress: number;
    totalRows: number;
    successCount: number;
    failCount: number;
    createdAt: number;
    errorsUrl?: string;
    csvStoragePath?: string;
}
