/**
 * Import function triggers from their respective submodules:
 *
 * const {onCall} = require("firebase-functions/v2/https");
 * const {onDocumentWritten} = require("firebase-function    // Create insurance quote document
    const quoteData = {
      id: admin.firestore().collection("serviceLeads").doc().id,
      userId,
      carId,
      carDetails,
      type: "insurance",
      insuranceType,
      coverageAmount: Number(coverageAmount),
      deductible: Number(deductible) || 0,
      preferredInsurer: preferredCompany || "any",
      contactInfo,
      driverInfo,
      status: "pending",
      partnerId: null, // Will be assigned by manager
      submittedData: data,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    }; *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */

const {setGlobalOptions} = require("firebase-functions");
const {onCall, logger} = require("firebase-functions/v2/https");
const admin = require("firebase-admin");
const FinancialServicesManager = require(
    "./adapters/financial-services-manager",
);

// Initialize Firebase Admin
admin.initializeApp();

// Initialize Financial Services Manager
const financialManager = new FinancialServicesManager();

// For cost control, you can set the maximum number of containers that can be
// running at the same time. This helps mitigate the impact of unexpected
// traffic spikes by instead downgrading performance. This limit is a
// per-function limit. You can override the limit for each function using the
// `maxInstances` option in the function's options, e.g.
// `onRequest({ maxInstances: 5 }, (req, res) => { ... })`.
// NOTE: setGlobalOptions does not apply to functions using the v1 API. V1
// functions should each use functions.runWith({ maxInstances: 10 }) instead.
// In the v1 API, each function can only serve one request per container, so
// this will be the maximum concurrent request count.
// Use v1 API configuration instead of setGlobalOptions
// setGlobalOptions({maxInstances: 10});

// Create and deploy your first functions
// https://firebase.google.com/docs/functions/get-started

// exports.helloWorld = onRequest((request, response) => {
//   logger.info("Hello logs!", {structuredData: true});
//   response.send("Hello from Firebase!");
// });

// ==========================================
// FINANCIAL SERVICES API GATEWAY
// ==========================================

/**
 * Finance Leads API - Handles finance application submissions
 * POST /finance-leads
 */
exports.submitFinanceLead = onCall(async (data, context) => {
  // Verify user is authenticated
  if (!context.auth) {
    throw new Error("User must be authenticated");
  }

  const userId = context.auth.uid;

  try {
    const {
      carId,
      carDetails,
      financeAmount,
      downPayment,
      loanTerm,
      monthlyIncome,
      employmentStatus,
      preferredBank,
      contactInfo,
    } = data;

    // Validate required fields
    if (!carId || !financeAmount || !contactInfo) {
      throw new Error("Missing required fields");
    }

    // Create finance lead document
    const leadData = {
      id: admin.firestore().collection("serviceLeads").doc().id,
      userId,
      carId,
      carDetails,
      type: "finance",
      financeAmount: Number(financeAmount),
      downPayment: Number(downPayment) || 0,
      loanTerm: Number(loanTerm) || 60, // months
      monthlyIncome: Number(monthlyIncome),
      employmentStatus,
      preferredBank: preferredBank || "any",
      contactInfo,
      status: "pending",
      partnerId: null, // Will be assigned by manager
      submittedData: data,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    };

    // Route to appropriate bank partner using the manager
    const routingResult = await financialManager.routeFinanceLead(leadData);

    if (routingResult.success) {
      // Update lead with partner information
      leadData.partnerId = routingResult.partnerId;
      leadData.status = routingResult.status || "processing";

      // Save to Firestore
      const docRef = admin.firestore()
          .collection("financeLeads")
          .doc(leadData.id);
      await docRef.set(leadData);

      logger.info("Finance lead submitted and routed", {
        leadId: leadData.id,
        userId,
        partnerId: routingResult.partnerId,
        commission: routingResult.commission,
      });

      return {
        success: true,
        leadId: leadData.id,
        partnerId: routingResult.partnerId,
        status: routingResult.status,
        estimatedRate: routingResult.estimatedRate,
        monthlyPayment: routingResult.monthlyPayment,
        commission: routingResult.commission,
        message: routingResult.message ||
          "تم استلام طلب التمويل بنجاح. سيتم التواصل معك قريباً.",
      };
    } else {
      // Save lead even if routing failed
      const docRef = admin.firestore()
          .collection("financeLeads")
          .doc(leadData.id);
      await docRef.set(leadData);

      logger.warn("Finance lead submitted but routing failed", {
        leadId: leadData.id,
        userId,
        errors: routingResult.errors,
      });

      return {
        success: false,
        leadId: leadData.id,
        errors: routingResult.errors,
        message: routingResult.message ||
          "تم حفظ طلبكم لكن لم نتمكن من توجيهه حالياً.",
      };
    }
  } catch (error) {
    logger.error("Finance lead submission error",
        {error: error.message, userId});
    throw new Error("فشل في إرسال طلب التمويل: " + error.message);
  }
});

/**
 * Insurance Quotes API - Handles insurance quote requests
 * POST /insurance-quotes
 */
exports.submitInsuranceQuote = onCall(async (data, context) => {
  // Verify user is authenticated
  if (!context.auth) {
    throw new Error("User must be authenticated");
  }

  const userId = context.auth.uid;

  try {
    const {
      carId,
      carDetails,
      insuranceType, // 'comprehensive', 'third_party', 'casco'
      coverageAmount,
      deductible,
      preferredCompany,
      contactInfo,
      driverInfo,
    } = data;

    // Validate required fields
    if (!carId || !insuranceType || !contactInfo) {
      throw new Error("Missing required fields");
    }

    // Create insurance quote document
    const quoteData = {
      id: admin.firestore().collection("insuranceQuotes").doc().id,
      userId,
      carId,
      carDetails,
      insuranceType,
      coverageAmount: Number(coverageAmount),
      deductible: Number(deductible) || 0,
      preferredCompany: preferredCompany || "any",
      contactInfo,
      driverInfo,
      status: "pending",
      partnerId: null, // Will be assigned by manager
      submittedData: data,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    };

    // Route to appropriate insurance partner using the manager
    const routingResult = await financialManager.routeInsuranceQuote(quoteData);

    if (routingResult.success) {
      // Update quote with partner information
      quoteData.partnerId = routingResult.partnerId;
      quoteData.status = routingResult.status || "quoted";
      quoteData.quotes = routingResult.quotes;

      // Save to Firestore
      const quoteDocRef = admin.firestore()
          .collection("insuranceQuotes")
          .doc(quoteData.id);
      await quoteDocRef.set(quoteData);

      logger.info("Insurance quote submitted and routed", {
        quoteId: quoteData.id,
        userId,
        partnerId: routingResult.partnerId,
        commission: routingResult.commission,
      });

      return {
        success: true,
        quoteId: quoteData.id,
        partnerId: routingResult.partnerId,
        status: routingResult.status,
        quotes: routingResult.quotes,
        selectedQuote: routingResult.selectedQuote,
        commission: routingResult.commission,
        message: routingResult.message ||
          "تم استلام طلب عرض التأمين بنجاح. سيتم التواصل معك قريباً.",
      };
    } else {
      // Save quote even if routing failed
      const quoteDocRef = admin.firestore()
          .collection("insuranceQuotes")
          .doc(quoteData.id);
      await quoteDocRef.set(quoteData);

      logger.warn("Insurance quote submitted but routing failed", {
        quoteId: quoteData.id,
        userId,
        errors: routingResult.errors,
      });

      return {
        success: false,
        quoteId: quoteData.id,
        errors: routingResult.errors,
        message: routingResult.message ||
          "تم حفظ طلبكم لكن لم نتمكن من توجيهه حالياً.",
      };
    }
  } catch (error) {
    logger.error("Insurance quote submission error",
        {error: error.message, userId});
    throw new Error("فشل في إرسال طلب عرض التأمين: " + error.message);
  }
});

/**
 * Get available financial service partners
 * GET /available-partners
 */
exports.getAvailablePartners = onCall(async (data, context) => {
  try {
    const partners = await financialManager.getAvailablePartners();
    return {
      success: true,
      partners,
    };
  } catch (error) {
    logger.error("Error fetching available partners",
        {error: error.message});
    throw new Error("فشل في جلب الشركاء المتاحين");
  }
});
exports.getUserFinancialServices = onCall(async (data, context) => {
  if (!context.auth) {
    throw new Error("User must be authenticated");
  }

  const userId = context.auth.uid;

  try {
    // Get all service leads for user
    const serviceLeads = await admin.firestore()
        .collection("serviceLeads")
        .where("userId", "==", userId)
        .orderBy("createdAt", "desc")
        .limit(20)
        .get();

    // Separate by type
    const financeLeads = [];
    const insuranceQuotes = [];

    serviceLeads.docs.forEach((doc) => {
      const data = doc.data();
      if (data.type === "finance") {
        financeLeads.push({
          id: doc.id,
          ...data,
        });
      } else if (data.type === "insurance") {
        insuranceQuotes.push({
          id: doc.id,
          ...data,
        });
      }
    });

    return {
      financeLeads,
      insuranceQuotes,
    };
  } catch (error) {
    logger.error("Error fetching user financial services",
        {error: error.message, userId});
    throw new Error("فشل في جلب الخدمات المالية");
  }
});

// Export financial services functions
const financialServices = require('./financial-services');
exports.processFinanceLead = financialServices.processFinanceLead;
exports.processInsuranceQuote = financialServices.processInsuranceQuote;
exports.getFinancialServiceStatus = financialServices.getFinancialServiceStatus;
exports.cleanupOldLeads = financialServices.cleanupOldLeads;

// Export analytics functions (temporarily commenting out due to compilation issues)
// const analytics = require('./src/analytics');
// exports.getAveragePriceByModel = analytics.getAveragePriceByModel;
// exports.getMarketTrends = analytics.getMarketTrends;
// exports.getDealerPerformance = analytics.getDealerPerformance;
// exports.getSalesPeakHours = analytics.getSalesPeakHours;
// exports.getRegionalPriceVariations = analytics.getRegionalPriceVariations;
// exports.getSubscriptionStatus = analytics.getSubscriptionStatus;

// Export subscription functions (with CORS enabled)
const subscriptions = require('./lib/subscriptions');
exports.createB2BSubscription = subscriptions.createB2BSubscription;
exports.getB2BSubscription = subscriptions.getB2BSubscription;
exports.cancelB2BSubscription = subscriptions.cancelB2BSubscription;
exports.upgradeB2BSubscription = subscriptions.upgradeB2BSubscription;
