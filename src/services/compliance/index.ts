/**
 * Bulgarian Compliance Services - Barrel Export
 * 
 * Unified export for all compliance-related services:
 * - GDPR compliance (data protection, deletion, export)
 * - Financial compliance (VAT, taxes, accounting)
 * - Business registration (legal entities, Commercial Register)
 * 
 * ✅ ARCHITECTURE FIX: Split from 616-line monolithic file
 * 
 * @compliance EU GDPR, Bulgarian Tax Law, Bulgarian Commercial Act
 * @location Bulgaria (EU)
 */

// Core types and interfaces
export * from './gdpr.service';
export * from './financial.service';
export * from './business-registration.service';

// Service instances (for backward compatibility)
import { gdprService } from './gdpr.service';
import { financialComplianceService } from './financial.service';
import { businessRegistrationService } from './business-registration.service';

/**
 * Legacy unified compliance service (for backward compatibility)
 * Maps to new modular services
 * 
 * @deprecated Use individual services (gdprService, financialComplianceService, businessRegistrationService)
 */
export class BulgarianComplianceService {
  private static instance: BulgarianComplianceService;

  static getInstance(): BulgarianComplianceService {
    if (!this.instance) {
      this.instance = new BulgarianComplianceService();
    }
    return this.instance;
  }

  // GDPR methods
  async getDataProtectionCompliance() {
    return gdprService.getDataProtectionCompliance();
  }

  async updateDataProtectionCompliance(data: any, updatedBy: string) {
    return gdprService.updateDataProtectionCompliance(data, updatedBy);
  }

  async deleteAllUserData(userId: string, reason?: string) {
    return gdprService.deleteAllUserData(userId, reason);
  }

  async exportAllUserData(userId: string) {
    return gdprService.exportAllUserData(userId);
  }

  // Financial methods
  async getFinancialCompliance() {
    return financialComplianceService.getFinancialCompliance();
  }

  async updateFinancialCompliance(data: any, updatedBy: string) {
    return financialComplianceService.updateFinancialCompliance(data, updatedBy);
  }

  validateVATNumber(vatNumber: string) {
    return financialComplianceService.validateVATNumber(vatNumber);
  }

  validateEIK(eik: string) {
    return financialComplianceService.validateEIK(eik);
  }

  // Business registration methods
  async getBusinessRegistration() {
    return businessRegistrationService.getBusinessRegistration();
  }

  async updateBusinessRegistration(data: any, updatedBy: string) {
    return businessRegistrationService.updateBusinessRegistration(data, updatedBy);
  }
}

export const bulgarianComplianceService = BulgarianComplianceService.getInstance();

// Direct exports for modern usage
export { gdprService, financialComplianceService, businessRegistrationService };
