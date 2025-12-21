import { logger } from '../../services/logger-service';
// src/components/Verification/index.ts
// Verification Components Index - ملف ربط مكونات التحقق
// الموقع: بلغاريا | اللغات: BG/EN | العملة: EUR

/**
 * Verification Components Module
 * 
 * مكونات التحقق المتقدمة للمستخدمين البلغاريين
 * Advanced verification components for Bulgarian users
 * 
 * Available Components:
 * 1. PhoneVerificationModal - نافذة التحقق من الهاتف
 * 2. IDVerificationModal - نافذة التحقق من الهوية
 * 3. DocumentUpload - مكون رفع المستندات
 */

// ==================== EXPORTS ====================

export { default as PhoneVerificationModal } from './PhoneVerificationModal';
export { default as IDVerificationModal } from './IDVerificationModal';
export { default as EmailVerificationModal } from './EmailVerificationModal';
export { default as BusinessVerificationModal } from './BusinessVerificationModal';
export { default as DocumentUpload } from './DocumentUpload';

// ==================== USAGE EXAMPLES ====================

/**
 * Example 1: Phone Verification
 * 
 * import { PhoneVerificationModal } from './components/Verification';
 * 
 * <PhoneVerificationModal
 *   onClose={() => setShowModal(false)}
 *   onSuccess={() => {
 *     logger.info('Phone verified!');
 *     setShowModal(false);
 *   }}
 * />
 */

/**
 * Example 2: ID Verification
 * 
 * import { IDVerificationModal } from './components/Verification';
 * 
 * <IDVerificationModal
 *   onClose={() => setShowModal(false)}
 *   onSuccess={() => {
 *     logger.info('ID submitted!');
 *     setShowModal(false);
 *   }}
 * />
 */

/**
 * Example 3: Document Upload (standalone)
 * 
 * import { DocumentUpload } from './components/Verification';
 * 
 * <DocumentUpload
 *   label="Upload Document"
 *   icon={<FileText size={24} />}
 *   onFileSelect={(file) => logger.info(file)}
 *   accept="image/*"
 *   optional={false}
 * />
 */
