/**
 * Create user via Firebase REST API - Direct execution
 * Uses the actual API key from the project
 */

const API_KEY = 'AIzaSyAUYM_qygK5pUrlXtdDLmEi-_Kh9SyvRmk';
const PROJECT_ID = 'fire-new-globul';

// Step 1: Create Auth User
async function createAuthUser() {
  console.log('🔑 Създаване на акаунт...');
  
  const res = await fetch(
    `https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=${API_KEY}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Referer': 'http://localhost:3000' },
      body: JSON.stringify({
        email: 'hamdanialaa@gmail.com',
        password: 'Alaa1983',
        displayName: 'Ибрахим Моторс',
        returnSecureToken: true
      })
    }
  );

  const data = await res.json();
  
  if (!res.ok) {
    if (data.error?.message === 'EMAIL_EXISTS') {
      console.log('⚠️  Акаунтът вече съществува! Опит за вход...');
      return await signIn();
    }
    throw new Error(`Auth error: ${JSON.stringify(data.error)}`);
  }

  console.log('✅ Акаунт създаден успешно!');
  console.log('   UID:', data.localId);
  console.log('   Email:', data.email);
  return { uid: data.localId, idToken: data.idToken };
}

// Sign in if user already exists  
async function signIn() {
  const res = await fetch(
    `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${API_KEY}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Referer': 'http://localhost:3000' },
      body: JSON.stringify({
        email: 'hamdanialaa@gmail.com',
        password: 'Alaa1983',
        returnSecureToken: true
      })
    }
  );
  const data = await res.json();
  if (!res.ok) throw new Error(`Sign in error: ${JSON.stringify(data.error)}`);
  console.log('✅ Вход успешен!');
  console.log('   UID:', data.localId);
  return { uid: data.localId, idToken: data.idToken };
}

// Step 2: Create Firestore Profile Document
async function createFirestoreProfile(uid, idToken) {
  console.log('\n📋 Създаване на профил в Firestore...');
  
  const now = new Date().toISOString();
  
  // Firestore REST API document format
  const doc = {
    fields: {
      uid: { stringValue: uid },
      name: { stringValue: 'Ибрахим Моторс' },
      email: { stringValue: 'hamdanialaa@gmail.com' },
      phone: { stringValue: '+359888123456' },
      city: { stringValue: 'София' },
      address: { stringValue: 'бул. "Цариградско шосе" 115, София 1784' },
      bio: { stringValue: 'Водещ дилър на луксозни и спортни автомобили в България. 15+ години опит. Специализирани в BMW, Mercedes, Audi и Porsche. Над 500 доволни клиенти.' },
      dealerName: { stringValue: 'Ибрахим Моторс ЕООД' },
      dealerLicense: { stringValue: 'BG-DLR-2009-00847' },
      businessRegistration: { stringValue: 'ЕИК 175834521' },
      established: { stringValue: '2009' },
      website: { stringValue: 'https://ibrahim-motors.bg' },
      role: { stringValue: 'dealer' },
      status: { stringValue: 'active' },
      isDealerVerified: { booleanValue: true },
      premiumMember: { booleanValue: true },
      trustScore: { integerValue: '98' },
      totalListings: { integerValue: '508' },
      totalSales: { integerValue: '247' },
      averageRating: { doubleValue: 4.9 },
      totalReviews: { integerValue: '183' },
      responseRate: { integerValue: '98' },
      responseTime: { stringValue: 'под 2 часа' },
      memberSince: { stringValue: '2009-03-15' },
      userNumericId: { integerValue: '1' },
      createdAt: { stringValue: now },
      lastLogin: { stringValue: now },
      dealerVerifiedAt: { stringValue: now },
      languages: {
        arrayValue: {
          values: [
            { stringValue: 'български' },
            { stringValue: 'английски' },
            { stringValue: 'арабски' }
          ]
        }
      },
      specialties: {
        arrayValue: {
          values: [
            { stringValue: 'Луксозни автомобили' },
            { stringValue: 'Спортни коли' },
            { stringValue: 'SUV' },
            { stringValue: 'Електрически автомобили' }
          ]
        }
      },
      certifications: {
        arrayValue: {
          values: [
            { stringValue: 'Оторизиран дилър BMW' },
            { stringValue: 'Сертифициран Mercedes-Benz партньор' },
            { stringValue: 'Audi Quality Partner' }
          ]
        }
      },
      serviceOfferings: {
        arrayValue: {
          values: [
            { stringValue: 'Продажба на нови автомобили' },
            { stringValue: 'Продажба на употребявани автомобили' },
            { stringValue: 'Изкупуване на автомобили' },
            { stringValue: 'Финансиране и лизинг' },
            { stringValue: 'Гаранция до 5 години' },
            { stringValue: 'Технически преглед' },
            { stringValue: 'Застраховка' }
          ]
        }
      },
      badges: {
        arrayValue: {
          values: [
            { stringValue: 'verified_dealer' },
            { stringValue: 'top_seller' },
            { stringValue: 'fast_responder' },
            { stringValue: 'quality_partner' },
            { stringValue: 'customer_favorite' }
          ]
        }
      },
      openingHours: {
        mapValue: {
          fields: {
            monday: { stringValue: '09:00 - 19:00' },
            tuesday: { stringValue: '09:00 - 19:00' },
            wednesday: { stringValue: '09:00 - 19:00' },
            thursday: { stringValue: '09:00 - 19:00' },
            friday: { stringValue: '09:00 - 19:00' },
            saturday: { stringValue: '10:00 - 18:00' },
            sunday: { stringValue: 'Почивен ден' }
          }
        }
      },
      socialMedia: {
        mapValue: {
          fields: {
            facebook: { stringValue: 'https://facebook.com/ibrahimmotors' },
            instagram: { stringValue: 'https://instagram.com/ibrahimmotors' },
            youtube: { stringValue: 'https://youtube.com/@ibrahimmotors' }
          }
        }
      }
    }
  };

  const url = `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/(default)/documents/users?documentId=${uid}`;
  
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${idToken}`
    },
    body: JSON.stringify(doc)
  });

  if (!res.ok) {
    const errData = await res.json();
    if (errData.error?.status === 'ALREADY_EXISTS') {
      console.log('⚠️  Профилът вече съществува в Firestore');
      
      // Try PATCH instead
      console.log('🔄 Обновяване на профила...');
      const patchUrl = `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/(default)/documents/users/${uid}`;
      const patchRes = await fetch(patchUrl, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${idToken}`
        },
        body: JSON.stringify(doc)
      });
      
      if (patchRes.ok) {
        console.log('✅ Профилът е обновен успешно!');
        return true;
      } else {
        const patchErr = await patchRes.json();
        console.log('⚠️  Грешка при обновяване:', JSON.stringify(patchErr.error?.message));
        return false;
      }
    }
    throw new Error(`Firestore error: ${JSON.stringify(errData.error)}`);
  }

  console.log('✅ Профилът е създаден в Firestore!');
  return true;
}

// Step 3: Set numeric ID counter
async function setNumericIdCounter(idToken) {
  console.log('\n🔢 Задаване на числов идентификатор...');
  
  const url = `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/(default)/documents/counters/userNumericId`;
  
  // Check if counter exists
  const checkRes = await fetch(url, {
    headers: { 'Authorization': `Bearer ${idToken}` }
  });
  
  if (checkRes.ok) {
    const counterDoc = await checkRes.json();
    const currentValue = parseInt(counterDoc.fields?.currentId?.integerValue || '0');
    console.log('   Текущ брояч:', currentValue);
    if (currentValue >= 1) {
      console.log('✅ Броячът вече е настроен');
      return;
    }
  }
  
  // Create/update counter
  const counterDoc = {
    fields: {
      currentId: { integerValue: '1' }
    }
  };
  
  const createUrl = `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/(default)/documents/counters?documentId=userNumericId`;
  
  const res = await fetch(createUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${idToken}`
    },
    body: JSON.stringify(counterDoc)
  });
  
  if (res.ok || (await res.json()).error?.status === 'ALREADY_EXISTS') {
    console.log('✅ Броячът е настроен на 1');
  }
}

// Run everything
async function main() {
  console.log('╔════════════════════════════════════════════╗');
  console.log('║  Създаване на потребител #1                ║');
  console.log('║  Ибрахим Моторс - Премиум дилър           ║');
  console.log('╚════════════════════════════════════════════╝\n');

  try {
    // 1. Create/sign in auth user
    const { uid, idToken } = await createAuthUser();
    
    // 2. Create Firestore profile
    await createFirestoreProfile(uid, idToken);
    
    // 3. Set numeric ID counter
    await setNumericIdCounter(idToken);
    
    console.log('\n╔════════════════════════════════════════════╗');
    console.log('║  ✅ ГОТОВО! Всичко е настроено!            ║');
    console.log('╠════════════════════════════════════════════╣');
    console.log('║  📧 Имейл: hamdanialaa@gmail.com          ║');
    console.log('║  🔐 Парола: Alaa1983                      ║');
    console.log('║  🆔 UID:', uid.padEnd(33), '║');
    console.log('║  #️⃣  Числов ID: 1                         ║');
    console.log('║  👤 Роля: Премиум дилър                   ║');
    console.log('║  ⭐ Рейтинг: 4.9/5 (183 отзива)          ║');
    console.log('║  🚗 Обяви: 508                            ║');
    console.log('╚════════════════════════════════════════════╝');
    console.log('\n🌐 Влезте от: http://localhost:3000/login');
    
  } catch (error) {
    console.error('\n❌ Грешка:', error.message);
  }
}

main();
