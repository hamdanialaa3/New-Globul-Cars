// Main export file for car data
export * from './types';
export * from './utils';

// Re-export from carData_static for backward compatibility
export { CAR_DATA, getAllMakes, getModelsByMake, getGenerationsByModel, getBodyStylesByGeneration } from '../carData_static';
