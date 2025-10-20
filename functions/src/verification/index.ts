// functions/src/verification/index.ts
// Export all verification Cloud Functions

export { approveVerification } from './approveVerification';
export { rejectVerification } from './rejectVerification';
export { verifyEIK } from './verifyEIK';
export { onVerificationApproved } from './onVerificationApproved';
export { 
  sendApprovalEmail, 
  sendRejectionEmail, 
  notifyAdminsNewRequest 
} from './emailService';
