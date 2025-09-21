// استخراج البيانات من netcarshow.com باستخدام الروابط المباشرة
// يعتمد على البيانات المستخرجة من fetch_webpage

const netcarshowData = {
  makes: [
    { id: 'abt', name: 'ABT' },
    { id: 'ac_schnitzer', name: 'AC Schnitzer' },
    { id: 'acura', name: 'Acura' },
    { id: 'alfa_romeo', name: 'Alfa Romeo' },
    { id: 'alpina', name: 'Alpina' },
    { id: 'alpine', name: 'Alpine' },
    { id: 'apex', name: 'Apex' },
    { id: 'arrinera', name: 'Arrinera' },
    { id: 'artega', name: 'Artega' },
    { id: 'ascari', name: 'Ascari' },
    { id: 'aston_martin', name: 'Aston Martin' },
    { id: 'audi', name: 'Audi' },
    { id: 'bac', name: 'BAC' },
    { id: 'baic', name: 'BAIC' },
    { id: 'bmw', name: 'BMW' },
    { id: 'bentley', name: 'Bentley' },
    { id: 'bertone', name: 'Bertone' },
    { id: 'borgward', name: 'Borgward' },
    { id: 'brabham', name: 'Brabham' },
    { id: 'brabus', name: 'Brabus' },
    { id: 'breckland', name: 'Breckland' },
    { id: 'bugatti', name: 'Bugatti' },
    { id: 'buick', name: 'Buick' },
    { id: 'cadillac', name: 'Cadillac' },
    { id: 'caparo', name: 'Caparo' },
    { id: 'carlsson', name: 'Carlsson' },
    { id: 'caterham', name: 'Caterham' },
    { id: 'chevrolet', name: 'Chevrolet' },
    { id: 'chrysler', name: 'Chrysler' },
    { id: 'citroen', name: 'Citroen' },
    { id: 'covini', name: 'Covini' },
    { id: 'cupra', name: 'Cupra' },
    { id: 'czinger', name: 'Czinger' },
    { id: 'ds', name: 'DS' },
    { id: 'dacia', name: 'Dacia' },
    { id: 'daewoo', name: 'Daewoo' },
    { id: 'daihatsu', name: 'Daihatsu' },
    { id: 'daimler', name: 'Daimler' },
    { id: 'datsun', name: 'Datsun' },
    { id: 'de_tomaso', name: 'De Tomaso' },
    { id: 'devon', name: 'Devon' },
    { id: 'dodge', name: 'Dodge' },
    { id: 'donkervoort', name: 'Donkervoort' },
    { id: 'edag', name: 'EDAG' },
    { id: 'edo', name: 'Edo' },
    { id: 'elfin', name: 'Elfin' },
    { id: 'eterniti', name: 'Eterniti' },
    { id: 'fm_auto', name: 'FM Auto' },
    { id: 'fpv', name: 'FPV' },
    { id: 'farbio', name: 'Farbio' },
    { id: 'ferrari', name: 'Ferrari' },
    { id: 'fiat', name: 'Fiat' },
    { id: 'fisker', name: 'Fisker' },
    { id: 'ford', name: 'Ford' },
    { id: 'gac', name: 'GAC' },
    { id: 'gm', name: 'GM' },
    { id: 'gmc', name: 'GMC' },
    { id: 'gta', name: 'GTA' },
    { id: 'geely', name: 'Geely' },
    { id: 'genesis', name: 'Genesis' },
    { id: 'gordon_murray', name: 'Gordon Murray' },
    { id: 'gumpert', name: 'Gumpert' },
    { id: 'hsv', name: 'HSV' },
    { id: 'hamann', name: 'Hamann' },
    { id: 'hennessey', name: 'Hennessey' },
    { id: 'holden', name: 'Holden' },
    { id: 'honda', name: 'Honda' },
    { id: 'hummer', name: 'Hummer' },
    { id: 'hyundai', name: 'Hyundai' },
    { id: 'icona', name: 'Icona' },
    { id: 'infiniti', name: 'Infiniti' },
    { id: 'isuzu', name: 'Isuzu' },
    { id: 'italdesign', name: 'Italdesign' },
    { id: 'iveco', name: 'Iveco' },
    { id: 'jaguar', name: 'Jaguar' },
    { id: 'jeep', name: 'Jeep' },
    { id: 'ktm', name: 'KTM' },
    { id: 'karma', name: 'Karma' },
    { id: 'kia', name: 'Kia' },
    { id: 'kleemann', name: 'Kleemann' },
    { id: 'koenigsegg', name: 'Koenigsegg' },
    { id: 'lada', name: 'Lada' },
    { id: 'lamborghini', name: 'Lamborghini' },
    { id: 'lancia', name: 'Lancia' },
    { id: 'land_rover', name: 'Land Rover' },
    { id: 'lexus', name: 'Lexus' },
    { id: 'lincoln', name: 'Lincoln' },
    { id: 'lotus', name: 'Lotus' },
    { id: 'lucid', name: 'Lucid' },
    { id: 'lynk_co', name: 'Lynk Co' },
    { id: 'mg', name: 'MG' },
    { id: 'mahindra', name: 'Mahindra' },
    { id: 'mansory', name: 'Mansory' },
    { id: 'marcos', name: 'Marcos' },
    { id: 'maserati', name: 'Maserati' },
    { id: 'maybach', name: 'Maybach' },
    { id: 'mazda', name: 'Mazda' },
    { id: 'mclaren', name: 'McLaren' },
    { id: 'mercedes-benz', name: 'Mercedes-Benz' },
    { id: 'mini', name: 'Mini' },
    { id: 'mitsubishi', name: 'Mitsubishi' },
    { id: 'morgan', name: 'Morgan' },
    { id: 'nissan', name: 'Nissan' },
    { id: 'opel', name: 'Opel' },
    { id: 'pagani', name: 'Pagani' },
    { id: 'peugeot', name: 'Peugeot' },
    { id: 'porsche', name: 'Porsche' },
    { id: 'ram', name: 'Ram' },
    { id: 'renault', name: 'Renault' },
    { id: 'rolls-royce', name: 'Rolls-Royce' },
    { id: 'saab', name: 'Saab' },
    { id: 'skoda', name: 'Skoda' },
    { id: 'smart', name: 'Smart' },
    { id: 'subaru', name: 'Subaru' },
    { id: 'suzuki', name: 'Suzuki' },
    { id: 'tesla', name: 'Tesla' },
    { id: 'toyota', name: 'Toyota' },
    { id: 'volkswagen', name: 'Volkswagen' },
    { id: 'volvo', name: 'Volvo' }
  ]
};

// إنشاء البيانات بالتنسيق المطلوب للتطبيق
function generateCarData() {
  const carData = netcarshowData.makes.map(make => ({
    id: make.id,
    name: make.name,
    models: [
      // بيانات تجريبية - سيتم استبدالها بالبيانات الحقيقية
      {
        id: `${make.id}-model-1`,
        name: `${make.name} Model 1`,
        generations: [
          {
            id: `${make.id}-gen-1`,
            name: 'Current Generation',
            years: '2020-2024',
            bodyStyles: [
              { id: 'sedan', name: 'Sedan' },
              { id: 'suv', name: 'SUV' },
              { id: 'coupe', name: 'Coupe' },
              { id: 'hatchback', name: 'Hatchback' }
            ]
          }
        ]
      }
    ]
  }));

  return carData;
}

// حفظ البيانات
const fs = require('fs');
const carData = generateCarData();

fs.writeFileSync('netcarshow-car-data.json', JSON.stringify(carData, null, 2));
console.log(`✅ تم إنشاء بيانات ${carData.length} شركة`);
console.log('📁 تم حفظ الملف: netcarshow-car-data.json');

// عرض ملخص
console.log('\n📊 ملخص الشركات:');
carData.slice(0, 10).forEach(make => {
  console.log(`- ${make.name} (${make.id})`);
});
if (carData.length > 10) {
  console.log(`... و ${carData.length - 10} شركة أخرى`);
}