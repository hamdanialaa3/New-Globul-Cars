"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.config = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
const zod_1 = require("zod");
const path_1 = __importDefault(require("path"));
// Load from root .env.production with absolute path
dotenv_1.default.config({ path: path_1.default.resolve(__dirname, '../../../../.env.production') });
const envSchema = zod_1.z.object({
    NODE_ENV: zod_1.z.enum(['development', 'production']).default('development'),
    PORT: zod_1.z.string().default('3005'),
    REDIS_HOST: zod_1.z.string().default('localhost'),
    REDIS_PORT: zod_1.z.string().default('6379'),
    WEBHOOK_SECRET: zod_1.z.string(),
    DATABASE_URL: zod_1.z.string()
});
exports.config = envSchema.parse(process.env);
