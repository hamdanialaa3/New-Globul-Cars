import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Import the service (this will work in Node.js environment)
import { carDataService } from './bulgarian-car-marketplace/src/services/carDataService.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function generateCarDataJSON() {
  try {
    console.log('🔄 بدء إنشاء ملف البيانات JSON...');

    // Get all cars from the service (using searchCars without filters)
    const allCars = carDataService.searchCars();

    // Create public directory if it doesn't exist
    const publicDir = path.join(__dirname, 'public');
    if (!fs.existsSync(publicDir)) {
      fs.mkdirSync(publicDir, { recursive: true });
    }

    // Write the data to JSON file
    const jsonPath = path.join(publicDir, 'car-data.json');
    fs.writeFileSync(jsonPath, JSON.stringify(allCars, null, 2), 'utf8');

    console.log(`✅ تم إنشاء ملف car-data.json بنجاح مع ${allCars.length} سيارة`);
    console.log(`📁 الملف محفوظ في: ${jsonPath}`);

    // Also create a summary file
    const summary = {
      totalCars: allCars.length,
      brands: carDataService.getAllBrands().length,
      categories: carDataService.getAllCategories().length,
      generations: carDataService.getAllGenerations().length,
      sizes: carDataService.getAllSizes().length,
      engineSizes: carDataService.getAllEngineSizes().length,
      fuelTypes: carDataService.getAllFuelTypes().length,
      transmissions: carDataService.getAllTransmissions().length,
      colors: carDataService.getAllColors().length,
      years: carDataService.getAllYears().length,
      generatedAt: new Date().toISOString(),
      currency: 'EUR',
      country: 'Bulgaria',
      languages: ['bg', 'en']
    };

    const summaryPath = path.join(publicDir, 'car-data-summary.json');
    fs.writeFileSync(summaryPath, JSON.stringify(summary, null, 2), 'utf8');

    console.log(`✅ تم إنشاء ملف car-data-summary.json بنجاح`);
    console.log(`📁 الملف محفوظ في: ${summaryPath}`);

  } catch (error) {
    console.error('❌ خطأ في إنشاء ملف البيانات:', error);
    process.exit(1);
  }
}

// Run the function
generateCarDataJSON();