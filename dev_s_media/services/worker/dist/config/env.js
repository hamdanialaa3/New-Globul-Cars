"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.config = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
const zod_1 = require("zod");
const path_1 = __importDefault(require("path"));
dotenv_1.default.config({ path: path_1.default.resolve(__dirname, '../../../../.env.production') });
const envSchema = zod_1.z.object({
    REDIS_HOST: zod_1.z.string().default('localhost'),
    REDIS_PORT: zod_1.z.string().default('6379'),
    PAGE_ACCESS_TOKEN: zod_1.z.string(),
    FB_PAGE_ID: zod_1.z.string(),
    // IG ID is optional now
    IG_USER_ID: zod_1.z.string().optional(),
    DATABASE_URL: zod_1.z.string(),
    LLM_API_URL: zod_1.z.string().default('http://localhost:5000/generate')
});
exports.config = envSchema.parse(process.env);
