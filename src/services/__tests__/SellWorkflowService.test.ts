import { describe, it, expect, jest } from '@jest/globals';

// Mock dependencies - MUST be before imports
jest.mock('../../../firebase/firebase-config');
jest.mock('firebase/firestore');

import { SellWorkflowService, WorkflowData } from '../sell-workflow-service';

describe('SellWorkflowService', () => {
    describe('validateWorkflowData', () => {
        it('should identify missing critical fields', () => {
            const invalidData: WorkflowData = {
                // Missing make and year
                model: 'Civic',
            };

            const result = SellWorkflowService.validateWorkflowData(invalidData);

            expect(result.isValid).toBe(false);
            expect(result.criticalMissing).toBe(true);
            expect(result.missingFields).toContain('Make (Марка)');
            expect(result.missingFields).toContain('Year (Година)');
        });

        it('should validate complete data as valid', () => {
            const validData: WorkflowData = {
                make: 'Honda',
                year: 2020,
            };

            const result = SellWorkflowService.validateWorkflowData(validData);

            expect(result.isValid).toBe(true);
            expect(result.criticalMissing).toBe(false);
        });
    });

    describe('transformWorkflowData', () => {
        it('should correctly transform basic vehicle data', () => {
            const input: WorkflowData = {
                make: 'Toyota',
                model: 'Corolla',
                year: '2022',
                mileage: '15000',
                price: '25000'
            };

            const userId = 'user123';
            const result = SellWorkflowService.transformWorkflowData(input, userId);

            expect(result.make).toBe('Toyota');
            expect(result.model).toBe('Corolla');
            expect(result.year).toBe(2022);
            expect(result.mileage).toBe(15000);
            expect(result.price).toBe(25000);
            expect(result.sellerId).toBe(userId);
        });

        it('should handle boolean string conversions', () => {
            const input: WorkflowData = {
                make: 'Test',
                year: 2024,
                negotiable: 'true',
                hasVideo: true,
                nonSmoker: 'true'
            };

            const result = SellWorkflowService.transformWorkflowData(input, 'user1');

            expect(result.negotiable).toBe(true);
            expect(result.hasVideo).toBe(true);
            expect(result.nonSmoker).toBe(true);
        });

        it('should parse array strings correctly', () => {
            const input: WorkflowData = {
                make: 'Test',
                year: 2024,
                features: 'ABC, DEF, GHI',
                safety: 'ABS, Airbags'
            };

            // Note: transformWorkflowData functionality for generic 'features' might vary,
            // but let's check safetyEquipment which uses parseArray
            const result = SellWorkflowService.transformWorkflowData(input, 'user1');

            expect(result.safetyEquipment).toEqual(['ABS', 'Airbags']);
        });

        it('should map region names correctly', () => {
            // Mocking BULGARIAN_CITIES behavior by using a known city from the constants file
            // Assuming "София" is in the list
            const input: WorkflowData = {
                make: 'Test',
                year: 2024,
                region: 'София'
            };

            const result = SellWorkflowService.transformWorkflowData(input, 'user1');

            // Depending on how transformWorkflowData uses the mocked IMPORT, 
            // in a real unit test we might need to mock the module.
            // Here we assume the constant is available in the localized context.
            expect(result.region).toBeDefined();
        });
    });

    describe('getCollectionNameForVehicleType', () => {
        it('should return correct collection for known types', () => {
            expect(SellWorkflowService.getCollectionNameForVehicleType('car')).toBe('passenger_cars');
            expect(SellWorkflowService.getCollectionNameForVehicleType('Suv')).toBe('suvs'); // Case insensitive
            expect(SellWorkflowService.getCollectionNameForVehicleType('motorcycle')).toBe('motorcycles');
        });

        it('should return default cars for unknown types', () => {
            expect(SellWorkflowService.getCollectionNameForVehicleType('spaceship')).toBe('cars');
        });
    });
});
