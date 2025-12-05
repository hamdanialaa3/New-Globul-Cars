/**
 * Bulgaria Locations Data Service
 * خدمة بيانات المواقع البلغارية
 * 
 * Provides comprehensive location data for Bulgaria including:
 * - 28 Provinces (Области)
 * - 260+ Cities/Towns (Градове)
 * - Postal codes (4 digits)
 * - Bilingual support (Bulgarian/English)
 * 
 * Data source: /public/data/bulgaria_locations_complete.md
 * 
 * Similar to brands-models-data.service.ts:
 * - Singleton pattern
 * - Caching mechanism
 * - Async loading from Markdown
 * - Province → Cities hierarchy
 * 
 * @author GitHub Copilot
 * @date November 16, 2025
 */

// ============================================
// TYPES & INTERFACES
// ============================================

export interface CityData {
  name: string;           // City name in Bulgarian
  nameEn: string;         // City name in English
  postalCode: string;     // 4-digit postal code
  district?: string;      // Optional district within city (София Център, Варна Младост, etc.)
}

export interface ProvinceData {
  name: string;           // Province name in Bulgarian
  nameEn: string;         // Province name in English
  cities: CityData[];     // All cities in this province
}

export type LocationsMap = Map<string, ProvinceData>;

// ============================================
// BULGARIA PROVINCES (28 total)
// ============================================

export const BULGARIA_PROVINCES = [
  { bg: 'София-град', en: 'Sofia City' },
  { bg: 'Благоевград', en: 'Blagoevgrad' },
  { bg: 'Бургас', en: 'Burgas' },
  { bg: 'Варна', en: 'Varna' },
  { bg: 'Пловдив', en: 'Plovdiv' },
  { bg: 'Русе', en: 'Ruse' },
  { bg: 'Велико Търново', en: 'Veliko Tarnovo' },
  { bg: 'Плевен', en: 'Pleven' },
  { bg: 'Стара Загора', en: 'Stara Zagora' },
  { bg: 'Сливен', en: 'Sliven' },
  { bg: 'Шумен', en: 'Shumen' },
  { bg: 'Добрич', en: 'Dobrich' },
  { bg: 'Хасково', en: 'Haskovo' },
  { bg: 'Кърджали', en: 'Kardzhali' },
  { bg: 'Пазарджик', en: 'Pazardzhik' },
  { bg: 'Перник', en: 'Pernik' },
  { bg: 'Кюстендил', en: 'Kyustendil' },
  { bg: 'Монтана', en: 'Montana' },
  { bg: 'Видин', en: 'Vidin' },
  { bg: 'Враца', en: 'Vratsa' },
  { bg: 'Габрово', en: 'Gabrovo' },
  { bg: 'Смолян', en: 'Smolyan' },
  { bg: 'Търговище', en: 'Targovishte' },
  { bg: 'Ямбол', en: 'Yambol' },
  { bg: 'Разград', en: 'Razgrad' },
  { bg: 'Силистра', en: 'Silistra' },
  { bg: 'София област', en: 'Sofia Province' },
  { bg: 'Ловеч', en: 'Lovech' }
] as const;

// Major cities (by population - 2023 census data)
export const MAJOR_CITIES_BG = [
  'София',           // 1,242,568
  'Пловдив',         // 346,893
  'Варна',           // 335,949
  'Бургас',          // 202,766
  'Русе',            // 144,936
  'Стара Загора',    // 136,781
  'Плевен',          // 106,954
  'Сливен',          // 89,848
  'Добрич',          // 79,430
  'Шумен'            // 77,950
] as const;

// ============================================
// SERVICE CLASS
// ============================================

class BulgariaLocationsService {
  private static instance: BulgariaLocationsService;
  private locationsCache: LocationsMap | null = null;
  private loadPromise: Promise<LocationsMap> | null = null;

  private constructor() {
    // Singleton - private constructor
  }

  /**
   * Get singleton instance
   */
  public static getInstance(): BulgariaLocationsService {
    if (!BulgariaLocationsService.instance) {
      BulgariaLocationsService.instance = new BulgariaLocationsService();
    }
    return BulgariaLocationsService.instance;
  }

  /**
   * Parse Markdown file and extract locations data
   */
  private parseLocationsMarkdown(markdown: string): LocationsMap {
    const locationsMap: LocationsMap = new Map();
    const lines = markdown.split('\n');
    
    let currentProvince: ProvinceData | null = null;
    let currentProvinceKey = '';
    let currentCity = '';
    let currentCityEn = '';

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();

      // Province header: ## Sofia City (София-град)
      // OR: ## Blagoevgrad Province (Благоевград)
      if (line.startsWith('## ')) {
        const match = line.match(/##\s+(.+?)\s+\((.+?)\)/);
        if (match) {
          let nameEn = match[1].trim();
          const nameBg = match[2].trim();
          
          // Remove "Province" or "City" from English name
          nameEn = nameEn.replace(/\s+(Province|City)$/, '').trim();
          
          currentProvinceKey = nameBg;
          currentProvince = {
            name: nameBg,
            nameEn: nameEn,
            cities: []
          };
          locationsMap.set(currentProvinceKey, currentProvince);
        }
      }
      // City header: ### Sofia (София)
      else if (line.startsWith('### ') && currentProvince) {
        const match = line.match(/###\s+(.+?)\s+\((.+?)\)/);
        if (match) {
          currentCityEn = match[1].trim();
          currentCity = match[2].trim();
        }
      }
      // Postal code line: - 1000 - Sofia Center (Център)
      else if (line.startsWith('- ') && currentProvince && currentCity) {
        const match = line.match(/^-\s+(\d{4})\s+-\s+(.+)/);
        if (match) {
          const postalCode = match[1];
          const fullName = match[2];
          
          // Extract district from full name
          // Examples:
          // "Sofia Center (Център)" → district: "Център"
          // "Blagoevgrad Center" → district: "Center"
          // "Bansko" → no district
          
          let district = '';
          
          if (fullName.includes('(')) {
            const parts = fullName.split('(');
            district = parts[1].replace(')', '').trim();
          } else if (fullName.includes(currentCityEn) && fullName.length > currentCityEn.length) {
            // Extract district from English (e.g., "Sofia Center" → "Center")
            district = fullName.replace(currentCityEn, '').trim();
          }

          currentProvince.cities.push({
            name: currentCity,
            nameEn: currentCityEn,
            postalCode: postalCode,
            district: district || undefined
          });
        }
      }
    }

    console.log('[BulgariaLocations] Parsed:', {
      provinces: locationsMap.size,
      totalCities: Array.from(locationsMap.values()).reduce((sum, p) => sum + p.cities.length, 0)
    });

    return locationsMap;
  }

  /**
   * Load and cache locations data from Markdown
   */
  public async loadLocations(): Promise<LocationsMap> {
    // Return cached data if available
    if (this.locationsCache) {
      return this.locationsCache;
    }

    // Return existing load promise if in progress
    if (this.loadPromise) {
      return this.loadPromise;
    }

    // Start new load
    this.loadPromise = (async () => {
      try {
        console.log('[BulgariaLocations] Starting to fetch data from /data/bulgaria_locations_complete.md');
        const response = await fetch('/data/bulgaria_locations_complete.md');
        console.log('[BulgariaLocations] Fetch response:', response.status, response.statusText);
        
        if (!response.ok) {
          throw new Error(`Failed to fetch locations: ${response.statusText}`);
        }
        
        const markdown = await response.text();
        console.log('[BulgariaLocations] Markdown loaded, length:', markdown.length);
        
        this.locationsCache = this.parseLocationsMarkdown(markdown);
        return this.locationsCache;
      } catch (error) {
        console.error('[BulgariaLocations] Load failed:', error);
        this.loadPromise = null;
        throw error;
      }
    })();

    return this.loadPromise;
  }

  /**
   * Get all provinces
   */
  public async getAllProvinces(): Promise<string[]> {
    const locations = await this.loadLocations();
    return Array.from(locations.keys()).sort();
  }

  /**
   * Get province data by name
   */
  public async getProvinceData(provinceName: string): Promise<ProvinceData | null> {
    const locations = await this.loadLocations();
    return locations.get(provinceName) || null;
  }

  /**
   * Get all cities in a province
   */
  public async getCitiesInProvince(provinceName: string): Promise<CityData[]> {
    const provinceData = await this.getProvinceData(provinceName);
    return provinceData?.cities || [];
  }

  /**
   * Get city by postal code
   */
  public async getCityByPostalCode(postalCode: string): Promise<CityData | null> {
    const locations = await this.loadLocations();
    
    for (const province of locations.values()) {
      const city = province.cities.find(c => c.postalCode === postalCode);
      if (city) {
        return city;
      }
    }
    
    return null;
  }

  /**
   * Search cities by keyword
   */
  public async searchCities(keyword: string): Promise<CityData[]> {
    const locations = await this.loadLocations();
    const searchLower = keyword.toLowerCase();
    const results: CityData[] = [];

    for (const province of locations.values()) {
      for (const city of province.cities) {
        if (
          city.name.toLowerCase().includes(searchLower) ||
          city.nameEn.toLowerCase().includes(searchLower) ||
          city.postalCode.includes(searchLower)
        ) {
          results.push(city);
        }
      }
    }

    return results;
  }

  /**
   * Check if postal code exists
   */
  public async postalCodeExists(postalCode: string): Promise<boolean> {
    const city = await this.getCityByPostalCode(postalCode);
    return city !== null;
  }

  /**
   * Get province name for a city
   */
  public async getProvinceForCity(cityName: string): Promise<string | null> {
    const locations = await this.loadLocations();
    
    for (const [provinceName, province] of locations.entries()) {
      const hasCity = province.cities.some(
        c => c.name === cityName || c.nameEn === cityName
      );
      if (hasCity) {
        return provinceName;
      }
    }
    
    return null;
  }

  /**
   * Check if city is a major city
   */
  public isMajorCity(cityName: string): boolean {
    return MAJOR_CITIES_BG.includes(cityName as any);
  }

  /**
   * Get major cities
   */
  public getMajorCities(): readonly string[] {
    return MAJOR_CITIES_BG;
  }

  /**
   * Get provinces with city counts
   */
  public async getProvincesWithCityCounts(): Promise<Array<{
    name: string;
    nameEn: string;
    cityCount: number;
    isMajor: boolean;
  }>> {
    const locations = await this.loadLocations();
    
    return Array.from(locations.entries()).map(([name, data]) => ({
      name: name,
      nameEn: data.nameEn,
      cityCount: data.cities.length,
      isMajor: MAJOR_CITIES_BG.includes(name as any)
    }));
  }
}

// ============================================
// EXPORTS
// ============================================

export const bulgariaLocationsService = BulgariaLocationsService.getInstance();

export default bulgariaLocationsService;
