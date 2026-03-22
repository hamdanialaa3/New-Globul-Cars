/**
 * Create User via Firebase REST API
 * No .env needed - uses public Firebase REST API
 */

const FIREBASE_PROJECT_ID = 'fire-new-globul';
const FIREBASE_API_KEY = process.env.VITE_FIREBASE_API_KEY || 'YOUR_API_KEY_HERE';

// Perfect Bulgarian dealer profile data
const userData = {
  email: 'hamdanialaa@gmail.com',
  password: 'Alaa1983',
  displayName: 'Ибрахим Моторс',
  profile: {
    name: 'Ибрахим Моторс',
    email: 'hamdanialaa@gmail.com',
    phone: '+359888123456',
    city: 'София',
    address: 'бул. "Цариградско шосе" 115, София 1784',
    bio: 'Водещ дилър на луксозни и спортни автомобили в България. 15+ години опит. Специализирани в BMW, Mercedes, Audi и Porsche. Над 500 доволни клиенти.',
    dealerName: 'Ибрахим Моторс ЕООД',
    dealerLicense: 'BG-DLR-2009-00847',
    businessRegistration: 'ЕИК 175834521',
    established: '2009',
    languages: ['български', 'английски', 'арабски'],
    specialties: ['Луксозни автомобили', 'Спортни коли', 'SUV', 'Електрически автомобили'],
    certifications: [
      'Оторизиран дилър BMW',
      'Сертифициран Mercedes-Benz партньор',
      'Audi Quality Partner'
    ],
    serviceOfferings: [
      'Продажба на нови автомобили',
      'Продажба на употребявани автомобили',
      'Изкупуване на автомобили',
      'Финансиране и лизинг',
      'Гаранция до 5 години',
      'Технически преглед',
      'Застраховка'
    ],
    openingHours: {
      monday: '09:00 - 19:00',
      tuesday: '09:00 - 19:00',
      wednesday: '09:00 - 19:00',
      thursday: '09:00 - 19:00',
      friday: '09:00 - 19:00',
      saturday: '10:00 - 18:00',
      sunday: 'Почивен ден'
    },
    website: 'https://ibrahim-motors.bg',
    socialMedia: {
      facebook: 'https://facebook.com/ibrahimmotors',
      instagram: 'https://instagram.com/ibrahimmotors',
      youtube: 'https://youtube.com/@ibrahimmotors'
    },
    isDealerVerified: true,
    dealerVerifiedAt: new Date().toISOString(),
    trustScore: 98,
    totalListings: 508,
    totalSales: 247,
    averageRating: 4.9,
    totalReviews: 183,
    responseTime: '< 2 ساعات',
    responseRate: 98,
    memberSince: '2009-03-15',
    premiumMember: true,
    badges: [
      'verified_dealer',
      'top_seller',
      'fast_responder',
      'quality_partner',
      'customer_favorite'
    ]
  }
};

async function createUser() {
  try {
    console.log('🔑 Creating user account...');
    
    // Step 1: Create auth user via REST API
    const signUpUrl = `https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=${FIREBASE_API_KEY}`;
    
    const authResponse = await fetch(signUpUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: userData.email,
        password: userData.password,
        displayName: userData.displayName,
        returnSecureToken: true
      })
    });

    if (!authResponse.ok) {
      const error = await authResponse.json();
      throw new Error(`Auth creation failed: ${JSON.stringify(error)}`);
    }

    const authData = await authResponse.json();
    const userId = authData.localId;
    const idToken = authData.idToken;

    console.log('✅ Auth user created:', userId);
    console.log('📧 Email:', userData.email);
    console.log('🔐 Access Token:', idToken.substring(0, 20) + '...');

    console.log('\n📋 Next Steps:');
    console.log('1. Login to Firebase Console: https://console.firebase.google.com/');
    console.log('2. Go to Firestore Database');
    console.log('3. Create document in "users" collection with ID:', userId);
    console.log('4. Copy this data into the document:\n');
    console.log(JSON.stringify({
      ...userData.profile,
      uid: userId,
      createdAt: new Date().toISOString(),
      lastLogin: new Date().toISOString(),
      role: 'dealer',
      status: 'active'
    }, null, 2));

    console.log('\n🎯 Then you can login with:');
    console.log('   Email:', userData.email);
    console.log('   Password: Alaa1983');

    return {
      success: true,
      userId,
      email: userData.email
    };

  } catch (error) {
    console.error('❌ Error:', error);
    
    if ((error as any).message?.includes('EMAIL_EXISTS')) {
      console.log('\n⚠️  User already exists! Try logging in with:');
      console.log('   Email:', userData.email);
      console.log('   Password: Alaa1983');
    }
    
    return {
      success: false,
      error: (error as Error).message
    };
  }
}

// Run it
createUser().then(() => {
  console.log('\n✨ Script completed');
  process.exit(0);
}).catch((error) => {
  console.error('❌ Fatal error:', error);
  process.exit(1);
});
