// src/locales/subscription-translations.ts
// Billing & Subscription Translations
// To be merged with main translations file

export const subscriptionTranslations = {
  bg: {
    billing: {
      // Verification
      verifying: 'Проверка на сесията...',
      pleaseWait: 'Моля изчакайте, докато потвърдим вашата покупка',
      
      // Common
      plan: 'План',
      status: 'Статус',
      active: 'Активен',
      renewsOn: 'Обновява се на',
      goToProfile: 'Към профила',
      viewInvoices: 'Виж фактури',
      tryAgain: 'Опитайте отново',
      
      // Success Page
      success: {
        title: 'Благодарим за покупката!',
        message: 'Вашият абонамент е активиран успешно. Сега имате достъп до всички премиум функции.',
      },
      
      // Cancel Page
      cancel: {
        title: 'Процесът беше отменен',
        message: 'Не се притеснявайте! Можете да се върнете и да изберете план по всяко време.',
        surveyTitle: 'Защо решихте да не продължите? (по избор)',
        viewPlans: 'Разгледайте плановете отново',
        goHome: 'Към началната страница',
        reasons: {
          expensive: 'Твърде скъпо',
          notReady: 'Все още не съм готов',
          missingFeatures: 'Липсващи функции',
          foundAlternative: 'Намерих алтернатива',
          other: 'Друга причина',
        },
        benefits: {
          noCommitment: 'Без ангажимент - отменете по всяко време',
          cancelAnytime: 'Отменете лесно с 1 клик',
          moneyBackGuarantee: '30-дневна гаранция за връщане на пари',
        },
      },
      
      // Usage Warnings
      usage: {
        limitReached: 'Достигнат лимит!',
        approachingLimit: 'Близо до лимита',
        information: 'Информация',
        upgrade: 'Надстрой',
      },
      
      // Trial
      trial: {
        daysLeft: 'Остават {{days}} дни от пробния период',
        upgrade: 'Надстройте сега',
      },
      
      // Discount
      discount: {
        enterCode: 'Въведете код за отстъпка',
        apply: 'Приложи',
        percentOff: '{{percent}}% отстъпка',
        amountOff: '{{amount}} лв. отстъпка',
      },
    },
    
    pricing: {
      // Plan Comparison
      choosePlan: 'Изберете план',
      month: 'месец',
      year: 'година',
      savePercent: 'Спестете {{percent}}%',
      whatsIncluded: 'Какво е включено',
      selectPlan: 'Изберете този план',
      trialDays: '{{days}} дни безплатен пробен период',
      mostPopular: 'Най-популярен',
      
      // Features
      features: {
        listings: 'Обяви',
        analytics: 'Аналитика',
        team: 'Екипни членове',
        api: 'API достъп',
        support: 'Поддръжка',
        branding: 'Персонализиране',
        campaigns: 'Кампании',
      },
    },
    
    upgrade: {
      // Upgrade Page
      title: 'Надстройте вашия план',
      youllGet: 'Ще получите',
      selectPlan: 'Изберете този план',
      
      // Downgrade
      confirm: {
        title: 'Потвърдете понижаването',
        message: 'Сигурни ли сте, че искате да понижите плана си?',
        accept: 'Да, понижи плана',
      },
      warning: {
        listings: 'Имате {{current}} обяви, но новият план позволява само {{max}}',
        team: 'Имате {{current}} членове в екипа, но новият план позволява само {{max}}',
        campaigns: 'Имате {{current}} кампании, но новият план позволява само {{max}}',
      },
      success: 'Планът беше променен успешно',
    },
  },
  
  en: {
    billing: {
      // Verification
      verifying: 'Verifying session...',
      pleaseWait: 'Please wait while we confirm your purchase',
      
      // Common
      plan: 'Plan',
      status: 'Status',
      active: 'Active',
      renewsOn: 'Renews on',
      goToProfile: 'Go to Profile',
      viewInvoices: 'View Invoices',
      tryAgain: 'Try Again',
      
      // Success Page
      success: {
        title: 'Thank you for your purchase!',
        message: 'Your subscription has been activated successfully. You now have access to all premium features.',
      },
      
      // Cancel Page
      cancel: {
        title: 'Checkout Cancelled',
        message: 'No worries! You can come back and choose a plan anytime.',
        surveyTitle: 'Why did you decide not to continue? (optional)',
        viewPlans: 'View Plans Again',
        goHome: 'Go to Homepage',
        reasons: {
          expensive: 'Too expensive',
          notReady: 'Not ready yet',
          missingFeatures: 'Missing features',
          foundAlternative: 'Found an alternative',
          other: 'Other reason',
        },
        benefits: {
          noCommitment: 'No commitment - cancel anytime',
          cancelAnytime: 'Cancel easily with 1 click',
          moneyBackGuarantee: '30-day money-back guarantee',
        },
      },
      
      // Usage Warnings
      usage: {
        limitReached: 'Limit Reached!',
        approachingLimit: 'Approaching Limit',
        information: 'Information',
        upgrade: 'Upgrade',
      },
      
      // Trial
      trial: {
        daysLeft: '{{days}} days left in your trial',
        upgrade: 'Upgrade Now',
      },
      
      // Discount
      discount: {
        enterCode: 'Enter discount code',
        apply: 'Apply',
        percentOff: '{{percent}}% off',
        amountOff: '{{amount}} BGN off',
      },
    },
    
    pricing: {
      // Plan Comparison
      choosePlan: 'Choose Plan',
      month: 'month',
      year: 'year',
      savePercent: 'Save {{percent}}%',
      whatsIncluded: "What's Included",
      selectPlan: 'Select This Plan',
      trialDays: '{{days}} days free trial',
      mostPopular: 'Most Popular',
      
      // Features
      features: {
        listings: 'Listings',
        analytics: 'Analytics',
        team: 'Team Members',
        api: 'API Access',
        support: 'Support',
        branding: 'Branding',
        campaigns: 'Campaigns',
      },
    },
    
    upgrade: {
      // Upgrade Page
      title: 'Upgrade Your Plan',
      youllGet: "You'll Get",
      selectPlan: 'Select This Plan',
      
      // Downgrade
      confirm: {
        title: 'Confirm Downgrade',
        message: 'Are you sure you want to downgrade your plan?',
        accept: 'Yes, Downgrade Plan',
      },
      warning: {
        listings: 'You have {{current}} listings, but the new plan only allows {{max}}',
        team: 'You have {{current}} team members, but the new plan only allows {{max}}',
        campaigns: 'You have {{current}} campaigns, but the new plan only allows {{max}}',
      },
      success: 'Plan changed successfully',
    },
  },
};

export default subscriptionTranslations;
