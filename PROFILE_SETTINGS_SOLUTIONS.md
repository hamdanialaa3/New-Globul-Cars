# 🛠️ الحلول المفصلة لمشاكل Profile Settings

## 📋 جدول المحتويات
1. [الحل 1: إزالة تكرار حقل الاسم](#الحل-1)
2. [الحل 2: تفعيل/تعطيل Email حسب نوع الحساب](#الحل-2)
3. [الحل 3: إضافة فحص صلاحيات شامل](#الحل-3)
4. [الحل 4: إصلاح useEffect](#الحل-4)
5. [الحل 5: تشديد قواعس الأمان](#الحل-5)

---

## <a name="الحل-1"></a>✅ **الحل 1: إزالة تكرار حقل الاسم**

### 🎯 الهدف
استخدام **نمط واحد موحد** للاسم:
- **للمستخدمين العاديين**: First Name + Last Name
- **للحسابات الب البيزنس**: Business Name
- **للضيوف**: Read-only Display Name

### 📝 الكود المقترح

**الملف**: `src/pages/03_user-pages/profile/ProfilePage/tabs/SettingsTab.tsx`

**الخطوة 1: تحديث الـ State**

```tsx
// ❌ الحالي (خاطئ):
const [userInfo, setUserInfo] = useState({
  displayName: user?.displayName || '',
  firstName: user?.firstName || '',
  lastName: user?.lastName || '',
  // ... باقي البيانات
});

// ✅ الصحيح:
const [userInfo, setUserInfo] = useState({
  // حذف displayName - سنحسبها من firstName + lastName
  firstName: user?.firstName || '',
  lastName: user?.lastName || '',
  phoneNumber: user?.phoneNumber || '',
  email: user?.email || '',
  city: user?.location?.city || '',
  region: user?.location?.region || '',
  address: user?.address || '', // ✅ إصلاح: كان city
  bio: user?.bio || ''
});

// إضافة computed displayName:
const displayName = useMemo(() => {
  return `${userInfo.firstName} ${userInfo.lastName}`.trim() || user?.displayName || '';
}, [userInfo.firstName, userInfo.lastName, user?.displayName]);
```

**الخطوة 2: تحديث الـ JSX (حذف Display Name)**

```tsx
// ❌ حذف هذا الحقل:
<SettingGroup>
  <Label $required>{isBg ? 'Име за показване' : 'Display Name'}</Label>
  <Input
    type="text"
    value={userInfo.displayName}
    onChange={(e) => setUserInfo({ ...userInfo, displayName: e.target.value })}
    placeholder={isBg ? 'Вашето име' : 'Your name'}
  />
</SettingGroup>

// ✅ احتفظ بـ First Name + Last Name فقط:
<FormRow>
  <SettingGroup style={{ flex: 1 }}>
    <Label $required>{isBg ? 'Име' : 'First Name'}</Label>
    <Input
      type="text"
      value={userInfo.firstName}
      onChange={(e) => setUserInfo({ ...userInfo, firstName: e.target.value })}
      placeholder={isBg ? 'Име' : 'First name'}
      disabled={isGuest || isViewingOtherProfile}
    />
  </SettingGroup>

  <SettingGroup style={{ flex: 1 }}>
    <Label $required>{isBg ? 'Фамилия' : 'Last Name'}</Label>
    <Input
      type="text"
      value={userInfo.lastName}
      onChange={(e) => setUserInfo({ ...userInfo, lastName: e.target.value })}
      placeholder={isBg ? 'Фамилия' : 'Last name'}
      disabled={isGuest || isViewingOtherProfile}
    />
  </SettingGroup>
</FormRow>
```

**الخطوة 3: تحديث handleSaveUserInfo**

```tsx
const handleSaveUserInfo = async () => {
  if (!currentUser?.uid) return;

  setSaving(true);
  try {
    // ✅ الآن نحفظ displayName المحسوبة تلقائياً
    await profileService.updateUserProfile(currentUser.uid, {
      displayName: displayName,  // ✅ computed من firstName + lastName
      firstName: userInfo.firstName,
      lastName: userInfo.lastName,
      phoneNumber: userInfo.phoneNumber,
      // email: يبقى كما هو - لا نحدثه
      location: {
        city: userInfo.city,
        region: userInfo.region,
        country: 'Bulgaria'
      },
      address: userInfo.address,
      bio: userInfo.bio
    });

    toast.success(
      language === 'bg'
        ? 'Информацията е запазена успешно!'
        : 'Information saved successfully!',
      { autoClose: 3000 }
    );
  } catch (error) {
    logger.error('Error saving user info:', error as Error);
    toast.error(
      language === 'bg'
        ? 'Грешка при запазване на информацията'
        : 'Error saving information',
      { autoClose: 3000 }
    );
  } finally {
    setSaving(false);
  }
};
```

---

## <a name="الحل-2"></a>✅ **الحل 2: تفعيل/تعطيل Email حسب نوع الحساب**

### 🎯 الهدف
السماح بتعديل Email **فقط** للمستخدمين المصرح لهم

### 📝 الكود المقترح

**الخطوة 1: إضافة متغيرات الفحص**

```tsx
// في بداية EditInformationSection component:
const EditInformationSection: React.FC<EditInformationSectionProps> = ({ user, language }) => {
  const { currentUser } = useAuth();
  
  // ✅ إضافة منطق الفحص:
  const isGuest = user?.accountType === 'guest' || !currentUser?.uid;
  const isViewingOwnProfile = currentUser?.uid === user?.uid;
  const canEditEmail = isViewingOwnProfile && !isGuest;
  const canEditProfile = isViewingOwnProfile && !isGuest;

  // ... باقي الكود
};
```

**الخطوة 2: تحديث حقل Email**

```tsx
<SettingGroup>
  <Label $required>
    <Mail size={16} style={{ marginRight: '8px', display: 'inline-block' }} />
    {isBg ? 'Имейл' : 'Email'}
  </Label>
  <Input
    type="email"
    value={userInfo.email}
    onChange={(e) => {
      // ✅ السماح بالتعديل فقط إذا كان مصرح:
      if (canEditEmail) {
        setUserInfo({ ...userInfo, email: e.target.value });
      }
    }}
    placeholder="example@email.com"
    disabled={!canEditEmail}  // ✅ شرطي بدلاً من دائم
    readOnly={!canEditEmail}
  />
  <HelpText>
    {!canEditEmail ? (
      isGuest ? (
        isBg ? 'الضيوف لا يمكنهم تعديل البريد الإلكتروني' : 'Guests cannot change email'
      ) : (
        isBg ? 'لا يمكنك تعديل بريد الملف الشخصي الآخر' : 'Cannot edit other profile email'
      )
    ) : (
      isBg ? 'البريد المستخدم في تسجيل الدخول والإشعارات' : 'Used for login and notifications'
    )}
  </HelpText>
</SettingGroup>
```

**الخطوة 3: تحديث جميع الحقول الحساسة**

```tsx
// ✅ تطبيق نفس النمط على باقي الحقول الحساسة:

<SettingGroup>
  <Label $required>{isBg ? 'الاسم الأول' : 'First Name'}</Label>
  <Input
    type="text"
    value={userInfo.firstName}
    onChange={(e) => {
      if (canEditProfile) {
        setUserInfo({ ...userInfo, firstName: e.target.value });
      }
    }}
    disabled={!canEditProfile}
    placeholder={isBg ? 'الاسم الأول' : 'First name'}
  />
</SettingGroup>

<SettingGroup>
  <Label $required>{isBg ? 'اسم العائلة' : 'Last Name'}</Label>
  <Input
    type="text"
    value={userInfo.lastName}
    onChange={(e) => {
      if (canEditProfile) {
        setUserInfo({ ...userInfo, lastName: e.target.value });
      }
    }}
    disabled={!canEditProfile}
    placeholder={isBg ? 'اسم العائلة' : 'Last name'}
  />
</SettingGroup>
```

---

## <a name="الحل-3"></a>✅ **الحل 3: إضافة فحص صلاحيات شامل**

### 🎯 الهدف
منع المستخدمين غير المصرح لهم من تعديل البيانات

### 📝 الكود المقترح

**الملف**: `src/pages/03_user-pages/profile/ProfilePage/tabs/SettingsTab.tsx`

**الخطوة 1: إضافة Guard في بداية Component**

```tsx
interface EditInformationSectionProps {
  user: BulgarianUser | null;
  language: string;
}

const EditInformationSection: React.FC<EditInformationSectionProps> = ({ user, language }) => {
  const { currentUser } = useAuth();

  // ✅ فحوصات الأمان:
  const isGuest = user?.accountType === 'guest' || !currentUser?.uid;
  const isViewingOwnProfile = currentUser?.uid === user?.uid;
  const canEdit = isViewingOwnProfile && !isGuest;

  // ✅ رسائل الخطأ الواضحة:
  if (!currentUser) {
    return (
      <Section>
        <AlertBox $variant="warning">
          <AlertIcon>⚠️</AlertIcon>
          <AlertText>
            {language === 'bg'
              ? 'يجب تسجيل الدخول لتعديل البروفايل'
              : 'You must log in to edit profile'}
          </AlertText>
        </AlertBox>
      </Section>
    );
  }

  if (isGuest) {
    return (
      <Section>
        <AlertBox $variant="danger">
          <AlertIcon>🔒</AlertIcon>
          <AlertText>
            {language === 'bg'
              ? 'المستخدمون الضيوف لا يمكنهم تعديل بيانات البروفايل'
              : 'Guest users cannot edit profile data'}
          </AlertText>
          <SubText>
            {language === 'bg'
              ? 'إنشاء حساب عادي للوصول إلى جميع الميزات'
              : 'Create a regular account to access all features'}
          </SubText>
        </AlertBox>
      </Section>
    );
  }

  if (!isViewingOwnProfile) {
    return (
      <Section>
        <AlertBox $variant="warning">
          <AlertIcon>ℹ️</AlertIcon>
          <AlertText>
            {language === 'bg'
              ? 'لا يمكنك تعديل بيانات بروفايل شخص آخر'
              : 'You cannot edit another user\'s profile'}
          </AlertText>
        </AlertBox>
      </Section>
    );
  }

  // ✅ إذا وصلنا هنا - يمكن للمستخدم التعديل
  return (
    // ... باقي الـ component
  );
};
```

**الخطوة 2: إضافة Styled Components للتنبيهات**

```tsx
const AlertBox = styled.div<{ $variant: 'success' | 'warning' | 'danger' }>`
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 16px;
  border-radius: 8px;
  border-left: 4px solid;
  background: ${(props) => {
    switch (props.$variant) {
      case 'danger':
        return 'rgba(239, 68, 68, 0.1)';
      case 'warning':
        return 'rgba(249, 115, 22, 0.1)';
      default:
        return 'rgba(34, 197, 94, 0.1)';
    }
  }};
  border-color: ${(props) => {
    switch (props.$variant) {
      case 'danger':
        return '#ef4444';
      case 'warning':
        return '#f97316';
      default:
        return '#22c55e';
    }
  }};
`;

const AlertIcon = styled.div`
  font-size: 20px;
  flex-shrink: 0;
`;

const AlertText = styled.p`
  margin: 0;
  font-weight: 600;
  color: var(--text-primary);
  font-size: 0.95rem;
`;

const SubText = styled.p`
  margin: 4px 0 0 0;
  font-size: 0.85rem;
  color: var(--text-secondary);
`;
```

---

## <a name="الحل-4"></a>✅ **الحل 4: إصلاح useEffect**

### 🎯 الهدف
مراقبة التغييرات في بيانات المستخدم وتحديثها فوراً

### 📝 الكود المقترح

```tsx
const EditInformationSection: React.FC<EditInformationSectionProps> = ({ user, language }) => {
  // ... الكود السابق

  // ❌ الحالي (خاطئ):
  // useState فقط - لا يتحدث عند تغيير user

  // ✅ الصحيح:
  const [userInfo, setUserInfo] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    phoneNumber: user?.phoneNumber || '',
    email: user?.email || '',
    city: user?.location?.city || '',
    region: user?.location?.region || '',
    address: user?.address || '',
    bio: user?.bio || ''
  });

  // ✅ إضافة useEffect:
  useEffect(() => {
    // تحديث البيانات عند تغيير user
    if (user) {
      setUserInfo({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        phoneNumber: user.phoneNumber || '',
        email: user.email || '',
        city: user.location?.city || '',
        region: user.location?.region || '',
        address: user.address || '',
        bio: user.bio || ''
      });
      logger.debug('User info updated in form', { userId: user.uid });
    }
  }, [user?.uid, user?.firstName, user?.lastName]); // ✅ مراقبة التغييرات المهمة

  // ... باقي الكود
};
```

---

## <a name="الحل-5"></a>✅ **الحل 5: تشديد قواعس الأمان**

### 📁 **الملف**: `firestore.rules`

### 🎯 الهدف
منع المستخدمين من تعديل بيانات الآخرين

### 📝 الكود المقترح

```typescript
// ✅ قواعس تحديثة لـ Firestore:

rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // ✅ مستند المستخدم:
    match /users/{userId} {
      // قراءة: يمكن للجميع قراءة بيانات المستخدم (ما عدا الحساسة)
      allow read: if request.auth != null;
      
      // كتابة: فقط المستخدم نفسه يمكنه التعديل
      allow update: if request.auth.uid == userId
        && !request.resource.data.accountType == 'guest'
        && validate_user_update(resource.data, request.resource.data);
      
      // حذف: فقط المستخدم نفسه، بعد التحقق الإضافي
      allow delete: if request.auth.uid == userId
        && !resource.data.accountType == 'guest';
    }

    // ✅ دالة التحقق من صحة البيانات:
    function validate_user_update(oldData, newData) {
      // لا يمكن تعديل: email, uid, accountType, createdAt
      return newData.email == oldData.email
        && newData.uid == oldData.uid
        && newData.accountType == oldData.accountType
        && newData.createdAt == oldData.createdAt
        // يمكن تعديل: firstName, lastName, phoneNumber, bio, etc.
        && (newData.firstName is string || newData.firstName == oldData.firstName)
        && (newData.lastName is string || newData.lastName == oldData.lastName)
        && (newData.phoneNumber is string || newData.phoneNumber == oldData.phoneNumber)
        && (newData.bio is string || newData.bio == oldData.bio);
    }
  }
}
```

### 📝 **الملف**: `functions/src/profile/update-user-profile.ts`

```typescript
// ✅ Cloud Function للتحقق من الصلاحيات:

import { onCall } from 'firebase-functions/v2/https';
import { doc, getDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db, auth } from '../firebase-config';
import { logger } from '../services/logger-service';

export const updateUserProfile = onCall(async (request) => {
  try {
    // ✅ التحقق من المصادقة:
    if (!request.auth?.uid) {
      throw new Error('Authentication required');
    }

    const { targetUserId, updateData } = request.data;

    // ✅ التحقق من الصلاحيات:
    if (request.auth.uid !== targetUserId) {
      logger.warn('Unauthorized profile update attempt', {
        requester: request.auth.uid,
        target: targetUserId
      });
      throw new Error('Cannot edit other user\'s profile');
    }

    // ✅ الحصول على بيانات المستخدم:
    const userRef = doc(db, 'users', targetUserId);
    const userSnap = await getDoc(userRef);

    if (!userSnap.exists()) {
      throw new Error('User not found');
    }

    const userData = userSnap.data();

    // ✅ منع تعديل الضيوف:
    if (userData.accountType === 'guest') {
      logger.warn('Guest user update attempt', {
        userId: targetUserId
      });
      throw new Error('Guest users cannot edit profile');
    }

    // ✅ التحقق من الحقول الحساسة:
    const protectedFields = ['email', 'uid', 'accountType', 'createdAt'];
    for (const field of protectedFields) {
      if (updateData.hasOwnProperty(field)) {
        logger.warn(`Attempt to modify protected field: ${field}`, {
          userId: targetUserId
        });
        throw new Error(`Cannot modify ${field}`);
      }
    }

    // ✅ تحديث البيانات:
    await updateDoc(userRef, {
      ...updateData,
      updatedAt: serverTimestamp()
    });

    logger.info('Profile updated successfully', {
      userId: targetUserId,
      fields: Object.keys(updateData)
    });

    return {
      success: true,
      message: 'Profile updated successfully'
    };

  } catch (error) {
    logger.error('Error updating profile', error as Error);
    throw error;
  }
});
```

---

## 📊 **ملخص الحلول**

| الحل | المشكلة | التأثير | المدة المتوقعة |
|------|--------|--------|-----------------|
| 1 | تكرار اسم | عالي | 30 دقيقة |
| 2 | Email معطل | عالي | 20 دقيقة |
| 3 | فحص صلاحيات | عالي جداً | 40 دقيقة |
| 4 | عدم تحديث البيانات | متوسط | 15 دقيقة |
| 5 | قواعس الأمان | عالي جداً | 45 دقيقة |

**المجموع**: ~2.5 ساعة

---

