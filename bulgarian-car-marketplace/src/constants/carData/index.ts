// Main export file for car data
export * from './types';
export * from './utils';

// Primary data source (split from monolithic file)
import type { CarMake } from './types';
import { CAR_DATA_DATA } from './data.AtoZ';

// Typed CAR_DATA export for consumers
export const CAR_DATA: CarMake[] = CAR_DATA_DATA as CarMake[];

// Helper wrappers bound to CAR_DATA
import { 
	getAllMakes as _getAllMakes,
	getModelsByMake as _getModelsByMake,
	getGenerationsByModel as _getGenerationsByModel,
	getBodyStylesByGeneration as _getBodyStylesByGeneration,
} from './helpers';

export const getAllMakes = () => _getAllMakes(CAR_DATA);
export const getModelsByMake = (makeId: string) => _getModelsByMake(CAR_DATA, makeId);
export const getGenerationsByModel = (makeId: string, modelId: string) => _getGenerationsByModel(CAR_DATA, makeId, modelId);
export const getBodyStylesByGeneration = (makeId: string, modelId: string, generationId: string) =>
	_getBodyStylesByGeneration(CAR_DATA, makeId, modelId, generationId);
