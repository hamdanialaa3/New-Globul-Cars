// Car Makes and Models Data
// Central data source for all car makes and their corresponding models

export interface CarMakeData {
  make: string;
  models: string[];
}

export const CAR_MAKES_MODELS: CarMakeData[] = [
  // ========== European Brands ==========
  {
    make: 'Audi',
    models: ['A1', 'A3', 'A4', 'A5', 'A6', 'A7', 'A8', 'Q2', 'Q3', 'Q5', 'Q7', 'Q8', 'TT', 'R8', 'e-tron', 'RS3', 'RS4', 'RS5', 'RS6', 'RS7', 'S3', 'S4', 'S5', 'S6', 'S7', 'S8']
  },
  {
    make: 'BMW',
    models: ['1 Series', '2 Series', '3 Series', '4 Series', '5 Series', '6 Series', '7 Series', '8 Series', 'X1', 'X2', 'X3', 'X4', 'X5', 'X6', 'X7', 'Z4', 'i3', 'i4', 'iX', 'M2', 'M3', 'M4', 'M5', 'M8', 'X3 M', 'X4 M', 'X5 M', 'X6 M']
  },
  {
    make: 'Mercedes-Benz',
    models: ['A-Class', 'B-Class', 'C-Class', 'CLA', 'CLS', 'E-Class', 'S-Class', 'GLA', 'GLB', 'GLC', 'GLE', 'GLS', 'G-Class', 'EQC', 'EQS', 'EQE', 'EQA', 'EQB', 'AMG GT', 'SL', 'SLC', 'V-Class', 'Vito', 'Sprinter']
  },
  {
    make: 'Volkswagen',
    models: ['Polo', 'Golf', 'Jetta', 'Passat', 'Arteon', 'Tiguan', 'Touareg', 'T-Roc', 'T-Cross', 'ID.3', 'ID.4', 'ID.5', 'ID.7', 'ID.Buzz', 'Up', 'Taigo', 'Caddy', 'Transporter', 'Crafter', 'Amarok']
  },
  {
    make: 'Opel',
    models: ['Corsa', 'Astra', 'Insignia', 'Crossland', 'Grandland', 'Mokka', 'Combo', 'Vivaro', 'Zafira']
  },
  {
    make: 'Ford',
    models: ['Fiesta', 'Focus', 'Mondeo', 'Mustang', 'EcoSport', 'Kuga', 'Edge', 'Explorer', 'Ranger', 'F-150', 'Transit', 'Transit Custom', 'Tourneo', 'Puma', 'Bronco', 'Maverick', 'Raptor']
  },
  {
    make: 'Peugeot',
    models: ['208', '308', '408', '508', '2008', '3008', '5008', 'Rifter', 'Traveller', 'Partner', 'Expert', 'Boxer', 'e-208', 'e-2008']
  },
  {
    make: 'Renault',
    models: ['Clio', 'Megane', 'Talisman', 'Captur', 'Kadjar', 'Koleos', 'Arkana', 'Zoe', 'Twingo', 'Scenic', 'Espace', 'Kangoo', 'Trafic', 'Master']
  },
  {
    make: 'Citroën',
    models: ['C3', 'C4', 'C5', 'C3 Aircross', 'C5 Aircross', 'Berlingo', 'SpaceTourer', 'Jumpy', 'Jumper', 'ë-C4', 'Ami']
  },
  {
    make: 'Fiat',
    models: ['500', 'Panda', 'Tipo', '500X', '500L', 'Doblo', 'Ducato', 'Fiorino', '500e', 'Strada']
  },
  {
    make: 'Skoda',
    models: ['Citigo', 'Fabia', 'Scala', 'Octavia', 'Superb', 'Kamiq', 'Karoq', 'Kodiaq', 'Enyaq', 'Yeti', 'Rapid']
  },
  {
    make: 'SEAT',
    models: ['Ibiza', 'Leon', 'Arona', 'Ateca', 'Tarraco', 'Alhambra', 'Mii', 'Toledo']
  },
  {
    make: 'Alfa Romeo',
    models: ['MiTo', 'Giulietta', 'Giulia', 'Stelvio', 'Tonale', '4C', 'Spider']
  },
  {
    make: 'Lancia',
    models: ['Ypsilon', 'Delta', 'Musa', 'Thema']
  },
  {
    make: 'Ferrari',
    models: ['488', 'F8', 'Roma', 'Portofino', '812', 'SF90', '296', 'LaFerrari', 'California', 'F12']
  },
  {
    make: 'Lamborghini',
    models: ['Huracan', 'Aventador', 'Urus', 'Gallardo', 'Murcielago']
  },
  {
    make: 'Porsche',
    models: ['911', 'Taycan', 'Panamera', 'Cayenne', 'Macan', 'Boxster', 'Cayman', '718']
  },
  {
    make: 'Jaguar',
    models: ['XE', 'XF', 'XJ', 'F-Type', 'E-Pace', 'F-Pace', 'I-Pace', 'XK', 'X-Type', 'S-Type']
  },
  {
    make: 'Land Rover',
    models: ['Defender', 'Discovery', 'Discovery Sport', 'Range Rover', 'Range Rover Sport', 'Range Rover Evoque', 'Range Rover Velar', 'Freelander']
  },
  {
    make: 'Mini',
    models: ['Cooper', 'Countryman', 'Clubman', 'Paceman', 'Roadster', 'Coupe']
  },
  {
    make: 'Smart',
    models: ['ForTwo', 'ForFour', 'Roadster']
  },
  {
    make: 'Dacia',
    models: ['Sandero', 'Logan', 'Duster', 'Jogger', 'Spring', 'Lodgy', 'Dokker']
  },
  {
    make: 'Volvo',
    models: ['S60', 'S90', 'V60', 'V90', 'XC40', 'XC60', 'XC90', 'C40', 'V40', 'S40', 'C30', 'V70', 'XC70']
  },
  // ========== Russian Brands ==========
  {
    make: 'Lada',
    models: ['Niva', 'Granta', 'Vesta', 'Largus', 'XRAY', 'Kalina', 'Priora', '2107', '2110', '2112']
  },
  {
    make: 'UAZ',
    models: ['Hunter', 'Patriot', 'Pickup', '469', 'Bukhanka']
  },
  {
    make: 'GAZ',
    models: ['Volga', 'Sobol', 'GAZelle', '3110', '31105']
  },
  // ========== Japanese Brands ==========
  {
    make: 'Toyota',
    models: ['Aygo', 'Yaris', 'Corolla', 'Camry', 'Prius', 'C-HR', 'RAV4', 'Highlander', 'Land Cruiser', 'Hilux', 'Avensis', 'Auris', 'Verso', 'Supra', 'GT86', 'Celica', 'MR2', 'bZ4X', 'Mirai', 'Proace']
  },
  {
    make: 'Honda',
    models: ['Civic', 'Accord', 'HR-V', 'CR-V', 'Jazz', 'Insight', 'e', 'NSX', 'S2000', 'Prelude', 'Integra', 'Pilot']
  },
  {
    make: 'Nissan',
    models: ['Micra', 'Leaf', 'Qashqai', 'X-Trail', 'Juke', 'Ariya', 'Note', 'Pulsar', 'Primera', '370Z', '350Z', 'GT-R', 'Navara', 'Pathfinder', 'Murano', 'Patrol']
  },
  {
    make: 'Mazda',
    models: ['Mazda2', 'Mazda3', 'Mazda6', 'CX-3', 'CX-30', 'CX-5', 'CX-60', 'MX-5', 'MX-30', 'RX-7', 'RX-8', 'CX-7', 'CX-9']
  },
  {
    make: 'Subaru',
    models: ['Impreza', 'Legacy', 'Outback', 'Forester', 'XV', 'WRX', 'BRZ', 'Levorg', 'Tribeca', 'Solterra']
  },
  {
    make: 'Mitsubishi',
    models: ['Space Star', 'ASX', 'Eclipse Cross', 'Outlander', 'Pajero', 'L200', 'Lancer', 'Colt', 'Galant', 'Evolution']
  },
  {
    make: 'Suzuki',
    models: ['Ignis', 'Swift', 'Baleno', 'Vitara', 'S-Cross', 'Jimny', 'SX4', 'Splash', 'Alto', 'Wagon R', 'Celerio']
  },
  {
    make: 'Lexus',
    models: ['IS', 'ES', 'GS', 'LS', 'RC', 'LC', 'UX', 'NX', 'RX', 'GX', 'LX', 'CT', 'SC']
  },
  {
    make: 'Infiniti',
    models: ['Q30', 'Q50', 'Q60', 'Q70', 'QX30', 'QX50', 'QX55', 'QX60', 'QX70', 'QX80', 'FX', 'G']
  },
  {
    make: 'Acura',
    models: ['ILX', 'TLX', 'RLX', 'NSX', 'MDX', 'RDX', 'TSX', 'RSX', 'Integra']
  },
  // ========== Korean Brands ==========
  {
    make: 'Hyundai',
    models: ['i10', 'i20', 'i30', 'i40', 'Elantra', 'Sonata', 'Tucson', 'Santa Fe', 'Kona', 'Ioniq', 'Ioniq 5', 'Ioniq 6', 'Nexo', 'Veloster', 'Genesis', 'Accent', 'Bayon', 'Palisade']
  },
  {
    make: 'Kia',
    models: ['Picanto', 'Rio', 'Ceed', 'Stonic', 'Sportage', 'Sorento', 'EV6', 'Niro', 'e-Niro', 'Soul', 'Optima', 'Stinger', 'Venga', 'Carens', 'Carnival', 'EV9', 'XCeed', 'ProCeed']
  },
  {
    make: 'Genesis',
    models: ['G70', 'G80', 'G90', 'GV60', 'GV70', 'GV80']
  },
  {
    make: 'SsangYong',
    models: ['Tivoli', 'Korando', 'Rexton', 'Musso', 'Kyron', 'Actyon']
  },
  // ========== American Brands ==========
  {
    make: 'Chevrolet',
    models: ['Spark', 'Aveo', 'Cruze', 'Malibu', 'Camaro', 'Corvette', 'Bolt', 'Trax', 'Equinox', 'Blazer', 'Tahoe', 'Suburban', 'Silverado', 'Colorado', 'Captiva', 'Orlando', 'Volt']
  },
  {
    make: 'Cadillac',
    models: ['CT4', 'CT5', 'CT6', 'XT4', 'XT5', 'XT6', 'Escalade', 'Lyriq', 'CTS', 'ATS', 'SRX', 'XTS']
  },
  {
    make: 'Dodge',
    models: ['Challenger', 'Charger', 'Durango', 'Journey', 'Viper', 'Dart', 'Nitro', 'Caliber', 'Avenger']
  },
  {
    make: 'Jeep',
    models: ['Renegade', 'Compass', 'Cherokee', 'Grand Cherokee', 'Wrangler', 'Gladiator', 'Commander', 'Patriot', 'Avenger']
  },
  {
    make: 'Chrysler',
    models: ['300C', 'Pacifica', 'Voyager', 'PT Cruiser', 'Sebring', 'Crossfire']
  },
  {
    make: 'RAM',
    models: ['1500', '2500', '3500', 'Rebel', 'TRX', 'ProMaster']
  },
  {
    make: 'Lincoln',
    models: ['MKZ', 'Continental', 'Nautilus', 'Aviator', 'Navigator', 'Corsair']
  },
  {
    make: 'Buick',
    models: ['Encore', 'Envision', 'Enclave', 'Regal', 'LaCrosse']
  },
  {
    make: 'GMC',
    models: ['Terrain', 'Acadia', 'Yukon', 'Sierra', 'Canyon', 'Hummer EV']
  },
  {
    make: 'Hummer',
    models: ['H1', 'H2', 'H3', 'EV']
  },
  {
    make: 'Tesla',
    models: ['Model 3', 'Model S', 'Model X', 'Model Y', 'Cybertruck', 'Roadster']
  },
  // ========== Chinese Brands ==========
  {
    make: 'BYD',
    models: ['Atto 3', 'Dolphin', 'Seal', 'Tang', 'Han', 'Yuan Plus', 'e6']
  },
  {
    make: 'Geely',
    models: ['Coolray', 'Emgrand', 'GC9', 'Atlas', 'Azkarra', 'Okavango']
  },
  {
    make: 'MG',
    models: ['ZS', 'HS', 'MG4', 'MG5', 'Marvel R', '3', '6', '7', 'Cyberster']
  },
  {
    make: 'Great Wall',
    models: ['Ora', 'Wingle', 'Haval H6', 'Haval Jolion', 'Haval F7', 'Poer']
  },
  {
    make: 'Chery',
    models: ['Tiggo', 'Tiggo 7', 'Tiggo 8', 'Arrizo', 'QQ', 'Omoda']
  },
  {
    make: 'Lynk & Co',
    models: ['01', '02', '03', '05']
  },
  {
    make: 'Polestar',
    models: ['1', '2', '3', '4']
  },
  {
    make: 'NIO',
    models: ['ET5', 'ET7', 'ES6', 'ES7', 'ES8']
  },
  // ========== Indian Brands ==========
  {
    make: 'Tata',
    models: ['Nano', 'Indica', 'Nexon', 'Harrier', 'Safari', 'Tigor']
  },
  {
    make: 'Mahindra',
    models: ['Scorpio', 'XUV500', 'XUV700', 'Thar', 'KUV100', 'Bolero']
  },
  // ========== Other ==========
  {
    make: 'Aston Martin',
    models: ['DB9', 'DB11', 'DBS', 'Vantage', 'DBX', 'Rapide', 'Vanquish']
  },
  {
    make: 'Bentley',
    models: ['Continental', 'Flying Spur', 'Bentayga', 'Mulsanne']
  },
  {
    make: 'Rolls-Royce',
    models: ['Ghost', 'Wraith', 'Dawn', 'Phantom', 'Cullinan', 'Spectre']
  },
  {
    make: 'Maserati',
    models: ['Ghibli', 'Quattroporte', 'Levante', 'MC20', 'GranTurismo', 'GranCabrio']
  },
  {
    make: 'McLaren',
    models: ['570S', '600LT', '720S', 'GT', 'Artura', 'P1', '650S']
  },
  {
    make: 'Bugatti',
    models: ['Veyron', 'Chiron', 'Divo', 'Centodieci']
  },
  {
    make: 'Lotus',
    models: ['Elise', 'Exige', 'Evora', 'Emira', 'Evija']
  },
  {
    make: 'Saab',
    models: ['9-3', '9-5', '900', '9000']
  },
  {
    make: 'Rover',
    models: ['25', '45', '75', '200', '400', '600', '800']
  },
  {
    make: 'Other',
    models: []
  }
];

/**
 * Get all car makes
 */
export const getAllMakes = (): string[] => {
  return CAR_MAKES_MODELS.map(item => item.make);
};

/**
 * Get models by make
 */
export const getModelsByMake = (make: string): string[] => {
  const makeData = CAR_MAKES_MODELS.find(item => item.make === make);
  return makeData ? makeData.models : [];
};

/**
 * Check if a make has models defined
 */
export const hasModels = (make: string): boolean => {
  const models = getModelsByMake(make);
  return models.length > 0;
};

