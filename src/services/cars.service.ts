// Shim for backward compatibility or incorrect imports
// This resolves "Missing carsService module" errors
import { unifiedCarService } from './car/unified-car-service';

export const carsService = unifiedCarService;
export default unifiedCarService;
