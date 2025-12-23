import { ThemeProvider } from 'styled-components';
import { useProfileType } from '../../../../contexts/ProfileTypeContext';
import { PROFILE_THEMES } from '../../../../config/profile-themes';

// In ProfilePageWrapper.tsx
// Wrap content with ThemeProvider
const { permissions, profileType } = useProfileType();
const activeTheme = PROFILE_THEMES[profileType];

return (
  <ThemeProvider theme={activeTheme}> // Inject LED theme
      {/* existing content */}
  </ThemeProvider>
);

// In ProfileMyAds.tsx
// Add Bulk Upload and Clone logic
import { MatrixUploader } from '../components/MatrixUploader';
import { unifiedCarService } from '../../../../services/UnifiedCarService';

const { permissions } = useProfileType();
const [showMatrix, setShowMatrix] = useState(false);

const handleClone = async (carId) => {
   if (!permissions.canCloneListing) return;
   await unifiedCarService.cloneCarListing(carId, user.uid);
};

return (
  <>
    {permissions.canBulkUpload && (
       <Button onClick={() => setShowMatrix(true)}>Bulk Upload</Button>
    )}
    {/* Grid / Compact View Toggle */}
    {/* Clone Button in Cards */}
    {showMatrix && <MatrixUploader onClose={() => setShowMatrix(false)} />}
  </>
);
