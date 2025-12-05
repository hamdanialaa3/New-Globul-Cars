import { 
  collection, 
  doc, 
  getDocs, 
  getDoc, 
  setDoc, 
  updateDoc, 
  query, 
  where, 
  orderBy, 
  limit,
  serverTimestamp,
  writeBatch
} from 'firebase/firestore';
import { db } from '../firebase/firebase-config';
import { serviceLogger } from './logger-wrapper';

// Bulgarian Compliance Interfaces
export interface BulgarianCompliance {
  id: string;
  type: 'gdpr' | 'data_protection' | 'financial' | 'tax' | 'business_registration';
  status: 'compliant' | 'non_compliant' | 'pending' | 'review_required';
  lastChecked: Date;
  nextReview: Date;
  requirements: ComplianceRequirement[];
  documents: ComplianceDocument[];
  notes: string;
  updatedBy: string;
  updatedAt: Date;
}

export interface ComplianceRequirement {
  id: string;
  title: string;
  titleBg: string;
  description: string;
  descriptionBg: string;
  isRequired: boolean;
  isCompleted: boolean;
  completedAt?: Date;
  completedBy?: string;
  evidence?: string;
}

export interface ComplianceDocument {
  id: string;
  name: string;
  type: 'policy' | 'agreement' | 'certificate' | 'registration' | 'audit_report';
  url: string;
  uploadedAt: Date;
  uploadedBy: string;
  expiresAt?: Date;
  isActive: boolean;
}

export interface FinancialCompliance {
  id: string;
  currency: 'EUR';
  taxRate: number;
  vatRate: number;
  businessRegistration: string;
  taxNumber: string;
  bankAccount: string;
  lastAudit: Date;
  nextAudit: Date;
  complianceStatus: 'compliant' | 'non_compliant' | 'pending';
}

export interface DataProtectionCompliance {
  id: string;
  gdprCompliant: boolean;
  dataProcessingAgreement: boolean;
  privacyPolicy: boolean;
  cookiePolicy: boolean;
  dataRetentionPolicy: boolean;
  userConsent: boolean;
  dataBreachProcedure: boolean;
  dpoAppointed: boolean;
  lastReview: Date;
  nextReview: Date;
}

export interface BusinessRegistration {
  id: string;
  businessName: string;
  businessNameBg: string;
  registrationNumber: string;
  vatNumber: string;
  address: {
    street: string;
    city: string;
    postalCode: string;
    country: 'Bulgaria';
  };
  businessType: 'sole_proprietorship' | 'partnership' | 'limited_company' | 'joint_stock_company';
  registrationDate: Date;
  isActive: boolean;
  documents: string[];
}

class BulgarianComplianceService {
  private static instance: BulgarianComplianceService;

  private constructor() {}

  public static getInstance(): BulgarianComplianceService {
    if (!BulgarianComplianceService.instance) {
      BulgarianComplianceService.instance = new BulgarianComplianceService();
    }
    return BulgarianComplianceService.instance;
  }

  // Initialize default compliance requirements
  public async initializeComplianceRequirements(): Promise<void> {
    try {
      const defaultRequirements: ComplianceRequirement[] = [
        // GDPR Requirements
        {
          id: 'gdpr_consent',
          title: 'User Consent Management',
          titleBg: 'Управление на съгласието на потребителите',
          description: 'Implement proper user consent mechanisms for data processing',
          descriptionBg: 'Внедряване на подходящи механизми за съгласие на потребителите за обработка на данни',
          isRequired: true,
          isCompleted: false
        },
        {
          id: 'gdpr_privacy_policy',
          title: 'Privacy Policy',
          titleBg: 'Политика за поверителност',
          description: 'Maintain up-to-date privacy policy in Bulgarian and English',
          descriptionBg: 'Поддържане на актуална политика за поверителност на български и английски език',
          isRequired: true,
          isCompleted: false
        },
        {
          id: 'gdpr_data_retention',
          title: 'Data Retention Policy',
          titleBg: 'Политика за съхранение на данни',
          description: 'Define and implement data retention periods',
          descriptionBg: 'Дефиниране и прилагане на периоди за съхранение на данни',
          isRequired: true,
          isCompleted: false
        },
        {
          id: 'gdpr_data_breach',
          title: 'Data Breach Procedure',
          titleBg: 'Процедура за нарушение на данни',
          description: 'Establish data breach notification procedures',
          descriptionBg: 'Създаване на процедури за уведомяване за нарушение на данни',
          isRequired: true,
          isCompleted: false
        },
        {
          id: 'gdpr_dpo',
          title: 'Data Protection Officer',
          titleBg: 'Служител по защита на данните',
          description: 'Appoint Data Protection Officer if required',
          descriptionBg: 'Назначаване на служител по защита на данните, ако е необходимо',
          isRequired: false,
          isCompleted: false
        },

        // Financial Compliance
        {
          id: 'financial_vat',
          title: 'VAT Registration',
          titleBg: 'Регистрация за ДДС',
          description: 'Register for VAT if annual turnover exceeds BGN 50,000',
          descriptionBg: 'Регистрация за ДДС, ако годишният оборот надвишава 50 000 лв',
          isRequired: true,
          isCompleted: false
        },
        {
          id: 'financial_accounting',
          title: 'Accounting Records',
          titleBg: 'Счетоводни записи',
          description: 'Maintain proper accounting records in accordance with Bulgarian law',
          descriptionBg: 'Поддържане на подходящи счетоводни записи в съответствие с българското право',
          isRequired: true,
          isCompleted: false
        },
        {
          id: 'financial_audit',
          title: 'Annual Audit',
          titleBg: 'Годишен одит',
          description: 'Conduct annual financial audit if required',
          descriptionBg: 'Провеждане на годишен финансов одит, ако е необходимо',
          isRequired: false,
          isCompleted: false
        },

        // Business Registration
        {
          id: 'business_registration',
          title: 'Business Registration',
          titleBg: 'Регистрация на бизнеса',
          description: 'Register business with Bulgarian Commercial Register',
          descriptionBg: 'Регистрация на бизнеса в Търговския регистър на България',
          isRequired: true,
          isCompleted: false
        },
        {
          id: 'business_insurance',
          title: 'Business Insurance',
          titleBg: 'Бизнес застраховка',
          description: 'Obtain required business insurance',
          descriptionBg: 'Получаване на необходимата бизнес застраховка',
          isRequired: true,
          isCompleted: false
        }
      ];

      // Save requirements to Firestore
      const batch = writeBatch(db);
      
      for (const requirement of defaultRequirements) {
        const requirementRef = doc(collection(db, 'compliance_requirements'));
        batch.set(requirementRef, requirement);
      }
      
      await batch.commit();
      serviceLogger.info('Bulgarian compliance requirements initialized');
    } catch (error) {
      serviceLogger.error('Error initializing compliance requirements', error as Error);
      throw error;
    }
  }

  // Get compliance status
  public async getComplianceStatus(): Promise<BulgarianCompliance[]> {
    try {
      const q = query(collection(db, 'compliance_status'), orderBy('lastChecked', 'desc'));
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({ 
        ...doc.data(), 
        id: doc.id,
        lastChecked: doc.data().lastChecked?.toDate() || new Date(),
        nextReview: doc.data().nextReview?.toDate() || new Date(),
        updatedAt: doc.data().updatedAt?.toDate() || new Date()
      } as BulgarianCompliance));
    } catch (error) {
      serviceLogger.error('Error getting compliance status', error as Error);
      return [];
    }
  }

  // Update compliance requirement
  public async updateComplianceRequirement(
    requirementId: string,
    isCompleted: boolean,
    completedBy: string,
    evidence?: string
  ): Promise<void> {
    try {
      const requirementRef = doc(db, 'compliance_requirements', requirementId);
      const updateData: any = {
        isCompleted,
        completedBy,
        updatedAt: serverTimestamp()
      };

      if (isCompleted) {
        updateData.completedAt = serverTimestamp();
        if (evidence) {
          updateData.evidence = evidence;
        }
      } else {
        updateData.completedAt = null;
        updateData.evidence = null;
      }

      await updateDoc(requirementRef, updateData);

      // Log the action
      await this.logComplianceAction(
        'REQUIREMENT_UPDATED',
        requirementId,
        `Requirement ${isCompleted ? 'completed' : 'marked as incomplete'}`,
        completedBy
      );
    } catch (error) {
      serviceLogger.error('Error updating compliance requirement', error as Error, { requirementId, isCompleted });
      throw error;
    }
  }

  // Get financial compliance
  public async getFinancialCompliance(): Promise<FinancialCompliance | null> {
    try {
      const q = query(collection(db, 'financial_compliance'), limit(1));
      const snapshot = await getDocs(q);
      
      if (snapshot.empty) {
        return null;
      }

      const doc = snapshot.docs[0];
      const data = doc.data();
      
      return {
        id: doc.id,
        currency: 'EUR',
        taxRate: data.taxRate || 0.10, // 10% corporate tax in Bulgaria
        vatRate: data.vatRate || 0.20, // 20% VAT in Bulgaria
        businessRegistration: data.businessRegistration || '',
        taxNumber: data.taxNumber || '',
        bankAccount: data.bankAccount || '',
        lastAudit: data.lastAudit?.toDate() || new Date(),
        nextAudit: data.nextAudit?.toDate() || new Date(),
        complianceStatus: data.complianceStatus || 'pending'
      };
    } catch (error) {
      serviceLogger.error('Error getting financial compliance', error as Error);
      return null;
    }
  }

  // Update financial compliance
  public async updateFinancialCompliance(
    complianceData: Partial<FinancialCompliance>,
    updatedBy: string
  ): Promise<void> {
    try {
      const complianceRef = doc(collection(db, 'financial_compliance'));
      const financialCompliance: Omit<FinancialCompliance, 'id'> = {
        currency: 'EUR',
        taxRate: 0.10,
        vatRate: 0.20,
        businessRegistration: '',
        taxNumber: '',
        bankAccount: '',
        lastAudit: new Date(),
        nextAudit: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year from now
        complianceStatus: 'compliant',
        ...complianceData
      };

      await setDoc(complianceRef, {
        ...financialCompliance,
        updatedBy,
        updatedAt: serverTimestamp()
      });

      // Log the action
      await this.logComplianceAction(
        'FINANCIAL_COMPLIANCE_UPDATED',
        complianceRef.id,
        'Financial compliance information updated',
        updatedBy
      );
    } catch (error) {
      serviceLogger.error('Error updating financial compliance', error as Error);
      throw error;
    }
  }

  // Get data protection compliance
  public async getDataProtectionCompliance(): Promise<DataProtectionCompliance | null> {
    try {
      const q = query(collection(db, 'data_protection_compliance'), limit(1));
      const snapshot = await getDocs(q);
      
      if (snapshot.empty) {
        return null;
      }

      const doc = snapshot.docs[0];
      const data = doc.data();
      
      return {
        id: doc.id,
        gdprCompliant: data.gdprCompliant || false,
        dataProcessingAgreement: data.dataProcessingAgreement || false,
        privacyPolicy: data.privacyPolicy || false,
        cookiePolicy: data.cookiePolicy || false,
        dataRetentionPolicy: data.dataRetentionPolicy || false,
        userConsent: data.userConsent || false,
        dataBreachProcedure: data.dataBreachProcedure || false,
        dpoAppointed: data.dpoAppointed || false,
        lastReview: data.lastReview?.toDate() || new Date(),
        nextReview: data.nextReview?.toDate() || new Date()
      };
    } catch (error) {
      serviceLogger.error('Error getting data protection compliance', error as Error);
      return null;
    }
  }

  // Update data protection compliance
  public async updateDataProtectionCompliance(
    complianceData: Partial<DataProtectionCompliance>,
    updatedBy: string
  ): Promise<void> {
    try {
      const complianceRef = doc(collection(db, 'data_protection_compliance'));
      const dataProtectionCompliance: Omit<DataProtectionCompliance, 'id'> = {
        gdprCompliant: false,
        dataProcessingAgreement: false,
        privacyPolicy: false,
        cookiePolicy: false,
        dataRetentionPolicy: false,
        userConsent: false,
        dataBreachProcedure: false,
        dpoAppointed: false,
        lastReview: new Date(),
        nextReview: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year from now
        ...complianceData
      };

      await setDoc(complianceRef, {
        ...dataProtectionCompliance,
        updatedBy,
        updatedAt: serverTimestamp()
      });

      // Log the action
      await this.logComplianceAction(
        'DATA_PROTECTION_COMPLIANCE_UPDATED',
        complianceRef.id,
        'Data protection compliance information updated',
        updatedBy
      );
    } catch (error) {
      serviceLogger.error('Error updating data protection compliance', error as Error);
      throw error;
    }
  }

  // Get business registration
  public async getBusinessRegistration(): Promise<BusinessRegistration | null> {
    try {
      const q = query(collection(db, 'business_registration'), limit(1));
      const snapshot = await getDocs(q);
      
      if (snapshot.empty) {
        return null;
      }

      const doc = snapshot.docs[0];
      const data = doc.data();
      
      return {
        id: doc.id,
        businessName: data.businessName || '',
        businessNameBg: data.businessNameBg || '',
        registrationNumber: data.registrationNumber || '',
        vatNumber: data.vatNumber || '',
        address: {
          street: data.address?.street || '',
          city: data.address?.city || '',
          postalCode: data.address?.postalCode || '',
          country: 'Bulgaria'
        },
        businessType: data.businessType || 'limited_company',
        registrationDate: data.registrationDate?.toDate() || new Date(),
        isActive: data.isActive || false,
        documents: data.documents || []
      };
    } catch (error) {
      serviceLogger.error('Error getting business registration', error as Error);
      return null;
    }
  }

  // Update business registration
  public async updateBusinessRegistration(
    registrationData: Partial<BusinessRegistration>,
    updatedBy: string
  ): Promise<void> {
    try {
      const registrationRef = doc(collection(db, 'business_registration'));
      const businessRegistration: Omit<BusinessRegistration, 'id'> = {
        businessName: '',
        businessNameBg: '',
        registrationNumber: '',
        vatNumber: '',
        address: {
          street: '',
          city: '',
          postalCode: '',
          country: 'Bulgaria'
        },
        businessType: 'limited_company',
        registrationDate: new Date(),
        isActive: false,
        documents: [],
        ...registrationData
      };

      await setDoc(registrationRef, {
        ...businessRegistration,
        updatedBy,
        updatedAt: serverTimestamp()
      });

      // Log the action
      await this.logComplianceAction(
        'BUSINESS_REGISTRATION_UPDATED',
        registrationRef.id,
        'Business registration information updated',
        updatedBy
      );
    } catch (error) {
      serviceLogger.error('Error updating business registration', error as Error);
      throw error;
    }
  }

  // Generate compliance report
  public async generateComplianceReport(): Promise<{
    overallStatus: 'compliant' | 'non_compliant' | 'pending';
    requirements: ComplianceRequirement[];
    financialCompliance: FinancialCompliance | null;
    dataProtectionCompliance: DataProtectionCompliance | null;
    businessRegistration: BusinessRegistration | null;
    recommendations: string[];
  }> {
    try {
      const [
        requirements,
        financialCompliance,
        dataProtectionCompliance,
        businessRegistration
      ] = await Promise.all([
        this.getComplianceRequirements(),
        this.getFinancialCompliance(),
        this.getDataProtectionCompliance(),
        this.getBusinessRegistration()
      ]);

      const completedRequirements = requirements.filter(req => req.isCompleted).length;
      const totalRequirements = requirements.length;
      const completionRate = totalRequirements > 0 ? completedRequirements / totalRequirements : 0;

      let overallStatus: 'compliant' | 'non_compliant' | 'pending' = 'pending';
      if (completionRate >= 0.9) {
        overallStatus = 'compliant';
      } else if (completionRate < 0.5) {
        overallStatus = 'non_compliant';
      }

      const recommendations: string[] = [];
      
      if (completionRate < 1) {
        recommendations.push('Complete all pending compliance requirements');
      }
      
      if (!financialCompliance) {
        recommendations.push('Set up financial compliance tracking');
      }
      
      if (!dataProtectionCompliance) {
        recommendations.push('Implement data protection compliance measures');
      }
      
      if (!businessRegistration) {
        recommendations.push('Complete business registration process');
      }

      return {
        overallStatus,
        requirements,
        financialCompliance,
        dataProtectionCompliance,
        businessRegistration,
        recommendations
      };
    } catch (error) {
      serviceLogger.error('Error generating compliance report', error as Error);
      throw error;
    }
  }

  // Get compliance requirements
  private async getComplianceRequirements(): Promise<ComplianceRequirement[]> {
    try {
      const q = query(collection(db, 'compliance_requirements'), orderBy('title', 'asc'));
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({ 
        ...doc.data(), 
        id: doc.id,
        completedAt: doc.data().completedAt?.toDate()
      } as ComplianceRequirement));
    } catch (error) {
      serviceLogger.error('Error getting compliance requirements', error as Error);
      return [];
    }
  }

  // Log compliance action
  private async logComplianceAction(
    action: string,
    resourceId: string,
    details: string,
    actorId: string
  ): Promise<void> {
    try {
      const logRef = doc(collection(db, 'compliance_logs'));
      await setDoc(logRef, {
        action,
        resourceId,
        details,
        actorId,
        timestamp: serverTimestamp(),
        ipAddress: 'N/A', // In production, get from request
        userAgent: navigator.userAgent
      });
    } catch (error) {
      serviceLogger.error('Error logging compliance action', error as Error, { action, resourceId });
    }
  }
}

export const bulgarianComplianceService = BulgarianComplianceService.getInstance();
