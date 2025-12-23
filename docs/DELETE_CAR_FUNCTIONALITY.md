# Delete Car Functionality Documentation

## Overview
The car details page now includes a complete delete functionality with quota-based warnings tailored to each seller type.

## Features

### 1. Delete Button
- **Location**: Bottom of car details page
- **Visibility**: Only shown to car owner (`isOwner = true`)
- **Design**: Red border button with Trash2 icon
- **Text**: "Изтрий обява" (BG) / "Delete Listing" (EN)

### 2. Delete Confirmation Modal
A modal dialog that appears when delete button is clicked, showing:
- **Warning Icon**: AlertTriangle icon in red background
- **Title**: "Внимание при изтриване" / "Delete Warning"
- **Dynamic Message**: Changes based on seller type
- **Quota Display**: Shows current usage
- **Actions**: Cancel (gray) and Delete (red) buttons

## Seller Type Logic

### Private User (`profileType: 'private'`)
- **Quota**: 3 listings per month
- **Delete Behavior**: Deleting consumes 1 of the 3 slots
- **Warning Message**: 
  - BG: "Изтриването ще консумира 1 от вашите 3 обяви за месеца. Останали слотове: X"
  - EN: "Deleting will consume 1 of your 3 monthly listings. Remaining slots: X"
- **Quota Display**: "Активни обяви: X/3" / "Active listings: X/3"
- **Blocking**: If `activeListingsCount >= 3`, shows quota exceeded error

### Dealer (`profileType: 'dealer'`)
- **Total Quota**: 30 listings per month
- **Free Deletions**: 10 free deletions per month (can delete and re-add without penalty)
- **Warning Message**:
  - BG: "Имате 10 безплатни изтривания на месец. Използвани: X/10"
  - EN: "You have 10 free deletions per month. Used: X/10"
- **Quota Display**: "Използвани безплатни изтривания: X/10" / "Free deletions used: X/10"
- **Blocking**: If `monthlyDeletionsUsed >= 10`, shows quota exceeded error

### Company (`profileType: 'company'`)
- **Quota**: Unlimited listings and deletions
- **Warning Message**:
  - BG: "Като компания, имате неограничени изтривания."
  - EN: "As a company, you have unlimited deletions."
- **Quota Display**: None (no restrictions)
- **Blocking**: Never blocked

## Props Interface

```typescript
interface CarDetailsMobileDEStyleProps {
  car: CarListing;
  language: 'bg' | 'en';
  onBack: () => void;
  onEdit?: () => void;
  onDelete?: () => void;  // ← NEW
  isOwner?: boolean;
  onContact?: (type: 'phone' | 'message' | 'whatsapp' | 'viber' | 'email') => void;
  userProfileType?: 'private' | 'dealer' | 'company';  // ← NEW
  monthlyDeletionsUsed?: number;  // ← NEW (for dealers)
  activeListingsCount?: number;  // ← NEW (for private users)
}
```

## Implementation Details

### Styled Components
```typescript
- ModalOverlay: Dark backdrop with blur effect
- ModalContent: White card with rounded corners and shadow
- ModalHeader: Flex layout with icon and title
- ModalIcon: Red-tinted background for AlertTriangle
- ModalTitle: Bold heading
- ModalBody: Message and quota display area
- WarningText: Secondary text color for warnings
- QuotaInfo: Yellow-tinted info box
- ModalActions: Flex container for buttons
- DeleteButton: Red danger button with hover effects
- CancelButton: Transparent button with border
- DeleteCarButton: Full-width red outline button at page bottom
```

### Handler Logic
```typescript
const handleDelete = () => {
  let canDelete = true;
  
  if (userProfileType === 'private') {
    canDelete = activeListingsCount < 3;
  } else if (userProfileType === 'dealer') {
    canDelete = monthlyDeletionsUsed < 10;
  }
  // company always allowed
  
  if (canDelete && onDelete) {
    setShowDeleteModal(false);
    onDelete();
  } else {
    alert(t.quotaExceeded);
  }
};
```

### Translation Keys
All strings are bilingual (Bulgarian/English):
- `deleteCar`: Button text
- `deleteWarningTitle`: Modal title
- `deleteWarningPrivate`: Private user warning
- `deleteWarningDealer`: Dealer warning
- `deleteWarningCompany`: Company warning
- `deleteConfirm`: Confirm button text
- `deleteCancel`: Cancel button text
- `deleteSuccess`: Success message (for parent component)
- `deleteError`: Error message (for parent component)
- `quotaExceeded`: Quota limit reached error

## Usage Example

```tsx
<CarDetailsMobileDEStyle
  car={carData}
  language="bg"
  onBack={handleBack}
  onEdit={handleEdit}
  onDelete={handleDeleteCar}  // ← Implement this in parent
  isOwner={true}
  userProfileType="dealer"  // or 'private' | 'company'
  monthlyDeletionsUsed={3}  // Only for dealers
  activeListingsCount={2}  // Only for private users
  onContact={handleContact}
/>
```

## Backend Integration TODO

The parent component should implement:

1. **Fetch User Data**: Get `userProfileType`, `monthlyDeletionsUsed`, `activeListingsCount` from Firestore
2. **Delete Handler**: 
   ```typescript
   const handleDeleteCar = async () => {
     try {
       // Delete car from Firestore
       await deleteDoc(doc(db, 'cars', carId));
       
       // Update user stats
       if (userProfileType === 'dealer') {
         // Increment monthlyDeletionsUsed
       } else if (userProfileType === 'private') {
         // Decrement activeListingsCount
       }
       
       // Redirect to profile or home
       navigate('/profile');
     } catch (error) {
       alert(t.deleteError);
     }
   };
   ```

3. **Quota Reset**: Implement monthly cron job to reset `monthlyDeletionsUsed` for dealers

## Design Notes
- Modal uses backdrop blur for modern effect
- Red (#ef4444) used for danger actions to distinguish from yellow accent
- Buttons have hover animations (translateY, shadow)
- Quota info box uses subtle yellow tint (8% opacity) to match theme
- Modal is fully responsive (90% width on mobile, max 500px)

## File Location
`src/pages/01_main-pages/components/CarDetailsMobileDEStyle.tsx`

**Lines**: ~1719 total (includes new modal components and delete logic)

---
**Created**: December 2025  
**Status**: ✅ Implementation Complete
