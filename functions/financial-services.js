// functions/financial-services.js
// Cloud Functions for Bulgarian Financial Services

const functions = require('firebase-functions');
const admin = require('firebase-admin');
const axios = require('axios');

// Bulgarian Financial Partners Configuration
const FINANCIAL_PARTNERS = {
  dsk_bank: {
    name: 'ДСК Банк',
    apiUrl: 'https://api.dsk.bg/finance',
    apiKey: functions.config().dsk?.api_key,
    commission: 0.02 // 2%
  },
  unicredit: {
    name: 'УниКредит Булбанк',
    apiUrl: 'https://api.unicredit.bg/finance',
    apiKey: functions.config().unicredit?.api_key,
    commission: 0.025 // 2.5%
  },
  raiffeisen: {
    name: 'Райфайзенбанк България',
    apiUrl: 'https://api.raiffeisen.bg/finance',
    apiKey: functions.config().raiffeisen?.api_key,
    commission: 0.022 // 2.2%
  }
};

const INSURANCE_PARTNERS = {
  allianz_bg: {
    name: 'Allianz Bulgaria',
    apiUrl: 'https://api.allianz.bg/insurance',
    apiKey: functions.config().allianz?.api_key,
    commission: 0.15 // 15%
  },
  bulstrad: {
    name: 'Булстрад Виена Иншурънс Груп',
    apiUrl: 'https://api.bulstrad.bg/insurance',
    apiKey: functions.config().bulstrad?.api_key,
    commission: 0.12 // 12%
  },
  generali_bg: {
    name: 'Дженерали Застраховане',
    apiUrl: 'https://api.generali.bg/insurance',
    apiKey: functions.config().generali?.api_key,
    commission: 0.14 // 14%
  }
};

/**
 * Process finance lead and send to multiple Bulgarian banks
 */
exports.processFinanceLead = functions.firestore
  .document('serviceLeads/{leadId}')
  .onCreate(async (snap, context) => {
    const leadData = snap.data();
    const leadId = context.params.leadId;

    // Only process finance leads
    if (leadData.type !== 'finance') return;

    console.log(`Processing finance lead: ${leadId}`);

    try {
      const results = [];

      // Send to all configured banks
      for (const [partnerId, partner] of Object.entries(FINANCIAL_PARTNERS)) {
        try {
          const response = await sendToBank(partner, leadData.submittedData);
          results.push({
            partnerId,
            partnerName: partner.name,
            status: 'sent',
            response: response,
            commission: calculateCommission(leadData.submittedData.carPrice, partner.commission),
            timestamp: admin.firestore.FieldValue.serverTimestamp()
          });
        } catch (error) {
          console.error(`Error sending to ${partner.name}:`, error);
          results.push({
            partnerId,
            partnerName: partner.name,
            status: 'error',
            error: error.message,
            timestamp: admin.firestore.FieldValue.serverTimestamp()
          });
        }
      }

      // Update lead with results
      await snap.ref.update({
        partnerResponses: results,
        processedAt: admin.firestore.FieldValue.serverTimestamp(),
        status: 'sent'
      });

      // Send notification to user
      await sendUserNotification(leadData.userId, 'finance', results);

      console.log(`Finance lead ${leadId} processed successfully`);

    } catch (error) {
      console.error(`Error processing finance lead ${leadId}:`, error);

      // Update lead with error status
      await snap.ref.update({
        status: 'error',
        error: error.message,
        processedAt: admin.firestore.FieldValue.serverTimestamp()
      });
    }
  });

/**
 * Process insurance quote and send to Bulgarian insurance companies
 */
exports.processInsuranceQuote = functions.firestore
  .document('serviceLeads/{leadId}')
  .onCreate(async (snap, context) => {
    const leadData = snap.data();
    const leadId = context.params.leadId;

    // Only process insurance leads
    if (leadData.type !== 'insurance') return;

    console.log(`Processing insurance quote: ${leadId}`);

    try {
      const results = [];

      // Send to all configured insurance companies
      for (const [partnerId, partner] of Object.entries(INSURANCE_PARTNERS)) {
        try {
          const response = await sendToInsuranceCompany(partner, leadData.submittedData);
          results.push({
            partnerId,
            partnerName: partner.name,
            status: 'sent',
            response: response,
            commission: calculateInsuranceCommission(response.premium, partner.commission),
            timestamp: admin.firestore.FieldValue.serverTimestamp()
          });
        } catch (error) {
          console.error(`Error sending to ${partner.name}:`, error);
          results.push({
            partnerId,
            partnerName: partner.name,
            status: 'error',
            error: error.message,
            timestamp: admin.firestore.FieldValue.serverTimestamp()
          });
        }
      }

      // Update lead with results
      await snap.ref.update({
        partnerResponses: results,
        processedAt: admin.firestore.FieldValue.serverTimestamp(),
        status: 'sent'
      });

      // Send notification to user
      await sendUserNotification(leadData.userId, 'insurance', results);

      console.log(`Insurance quote ${leadId} processed successfully`);

    } catch (error) {
      console.error(`Error processing insurance quote ${leadId}:`, error);

      // Update lead with error status
      await snap.ref.update({
        status: 'error',
        error: error.message,
        processedAt: admin.firestore.FieldValue.serverTimestamp()
      });
    }
  });

/**
 * Send finance lead to a Bulgarian bank
 */
async function sendToBank(partner, leadData) {
  const payload = {
    applicant: {
      fullName: leadData.fullName,
      personalId: leadData.personalId,
      email: leadData.email,
      phone: leadData.phone,
      monthlyIncome: leadData.monthlyIncome,
      employmentStatus: leadData.employmentStatus
    },
    vehicle: {
      make: leadData.carMake,
      model: leadData.carModel,
      year: leadData.carYear,
      price: leadData.carPrice
    },
    financing: {
      downPayment: leadData.downPayment,
      loanTerm: leadData.loanTerm,
      currency: 'EUR'
    },
    source: 'globul_cars_marketplace',
    timestamp: new Date().toISOString()
  };

  const response = await axios.post(`${partner.apiUrl}/leads`, payload, {
    headers: {
      'Authorization': `Bearer ${partner.apiKey}`,
      'Content-Type': 'application/json'
    },
    timeout: 30000 // 30 seconds
  });

  return response.data;
}

/**
 * Send insurance quote to Bulgarian insurance company
 */
async function sendToInsuranceCompany(partner, quoteData) {
  const payload = {
    applicant: {
      fullName: quoteData.fullName,
      personalId: quoteData.personalId,
      email: quoteData.email,
      phone: quoteData.phone
    },
    vehicle: {
      make: quoteData.carMake,
      model: quoteData.carModel,
      year: quoteData.carYear,
      price: quoteData.carPrice,
      mileage: quoteData.carMileage
    },
    insurance: {
      type: quoteData.insuranceType,
      coverageAmount: quoteData.coverageAmount,
      deductible: quoteData.deductible
    },
    driver: {
      age: quoteData.driverAge,
      experience: quoteData.drivingExperience,
      accidentHistory: quoteData.accidentHistory,
      licenseIssueDate: quoteData.licenseIssueDate
    },
    additional: {
      parkingLocation: quoteData.parkingLocation,
      preferredInsurer: quoteData.preferredInsurer
    },
    source: 'globul_cars_marketplace',
    timestamp: new Date().toISOString()
  };

  const response = await axios.post(`${partner.apiUrl}/quotes`, payload, {
    headers: {
      'Authorization': `Bearer ${partner.apiKey}`,
      'Content-Type': 'application/json'
    },
    timeout: 30000 // 30 seconds
  });

  return response.data;
}

/**
 * Calculate commission for finance lead
 */
function calculateCommission(carPrice, commissionRate) {
  // Commission is typically 2-3% of the financed amount
  const financedAmount = carPrice * 0.8; // Assuming 20% down payment
  return financedAmount * commissionRate;
}

/**
 * Calculate commission for insurance quote
 */
function calculateInsuranceCommission(premium, commissionRate) {
  return premium * commissionRate;
}

/**
 * Send notification to user about lead processing
 */
async function sendUserNotification(userId, type, results) {
  try {
    // Get user data
    const userDoc = await admin.firestore().collection('users').doc(userId).get();
    const userData = userDoc.data();

    if (!userData) return;

    const successfulResponses = results.filter(r => r.status === 'sent');
    const failedResponses = results.filter(r => r.status === 'error');

    let message = '';
    let title = '';

    if (type === 'finance') {
      title = 'Заявка за финансиране обработена';
      message = `Вашата заявка за финансиране е изпратена до ${successfulResponses.length} банки. `;
      if (failedResponses.length > 0) {
        message += `Имаше проблем с ${failedResponses.length} банки.`;
      }
    } else {
      title = 'Заявка за застраховка обработена';
      message = `Вашата заявка за застраховка е изпратена до ${successfulResponses.length} застрахователи. `;
      if (failedResponses.length > 0) {
        message += `Имаше проблем с ${failedResponses.length} застрахователи.`;
      }
    }

    // Send FCM notification if user has FCM token
    if (userData.fcmToken) {
      await admin.messaging().send({
        token: userData.fcmToken,
        notification: {
          title: title,
          body: message
        },
        data: {
          type: 'financial_service',
          serviceType: type,
          leadId: context.params.leadId
        }
      });
    }

    // Store notification in Firestore
    await admin.firestore().collection('notifications').add({
      userId: userId,
      type: 'financial_service',
      serviceType: type,
      title: title,
      message: message,
      read: false,
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    });

  } catch (error) {
    console.error('Error sending user notification:', error);
  }
}

/**
 * HTTP endpoint to get financial service status
 */
exports.getFinancialServiceStatus = functions.https.onCall(async (data, context) => {
  // Check if user is authenticated
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
  }

  const { leadId } = data;

  try {
    const leadDoc = await admin.firestore().collection('serviceLeads').doc(leadId).get();

    if (!leadDoc.exists) {
      throw new functions.https.HttpsError('not-found', 'Lead not found');
    }

    const leadData = leadDoc.data();

    // Check if user owns this lead
    if (leadData.userId !== context.auth.uid) {
      throw new functions.https.HttpsError('permission-denied', 'Access denied');
    }

    return {
      status: leadData.status,
      partnerResponses: leadData.partnerResponses || [],
      processedAt: leadData.processedAt
    };

  } catch (error) {
    console.error('Error getting financial service status:', error);
    throw new functions.https.HttpsError('internal', 'Error retrieving status');
  }
});

/**
 * Scheduled function to clean up old leads
 */
exports.cleanupOldLeads = functions.pubsub
  .schedule('0 2 * * *') // Run daily at 2 AM
  .timeZone('Europe/Sofia')
  .onRun(async (context) => {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - 90); // 90 days ago

    try {
      const oldLeads = await admin.firestore()
        .collection('serviceLeads')
        .where('createdAt', '<', cutoffDate)
        .where('status', 'in', ['expired', 'rejected'])
        .get();

      const batch = admin.firestore().batch();
      oldLeads.docs.forEach(doc => {
        batch.delete(doc.ref);
      });

      await batch.commit();

      console.log(`Cleaned up ${oldLeads.size} old leads`);

    } catch (error) {
      console.error('Error cleaning up old leads:', error);
    }
  });