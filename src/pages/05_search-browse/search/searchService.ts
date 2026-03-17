/**
 * 🔥 Search Service — PRODUCTION FIRESTORE CONNECTION
 * Source of truth: Firestore multi-collection queries
 * No mock data. All filters, options, and results from DB.
 */

import {
    collection,
    query,
    where,
    orderBy,
    limit,
    getDocs,
    startAfter,
    DocumentSnapshot,
    QueryConstraint,
    Timestamp,
} from 'firebase/firestore';
import { db } from '@/firebase/firebase-config';
import { VEHICLE_COLLECTIONS } from '@/services/car/unified-car-types';
import { resolveCanonicalBrand } from '@/services/brand-normalization';

// ─── Color name → hex mapping (used when colorHex is missing) ───
const COLOR_NAME_TO_HEX: Record<string, string> = {
    // Basic
    white: '#FFFFFF',
    black: '#000000',
    silver: '#C0C0C0',
    gray: '#808080',
    grey: '#808080',
    red: '#CC0000',
    blue: '#0044CC',
    green: '#228B22',
    yellow: '#FFD700',
    orange: '#FF8C00',
    brown: '#8B4513',
    beige: '#F5F5DC',
    gold: '#DAA520',
    purple: '#6A0DAD',
    pink: '#FF69B4',
    bronze: '#CD7F32',
    maroon: '#800000',
    teal: '#008080',
    turquoise: '#40E0D0',
    metallic: '#BCC6CC',

    // Bulgarian
    'бял': '#FFFFFF',
    'черен': '#000000',
    'сребърен': '#C0C0C0',
    'сив': '#808080',
    'червен': '#CC0000',
    'син': '#0044CC',
    'зелен': '#228B22',
    'жълт': '#FFD700',
    'оранжев': '#FF8C00',
    'кафяв': '#8B4513',
    'бежов': '#F5F5DC',
    'златист': '#DAA520',
    'лилав': '#6A0DAD',
    'розов': '#FF69B4',
    'бронзов': '#CD7F32',
    'бордо': '#800000',
    'тюркоазен': '#40E0D0',
    'металик': '#BCC6CC',

    // German
    'weiß': '#FFFFFF',
    'schwarz': '#000000',
    'silber': '#C0C0C0',
    'grau': '#808080',
    'rot': '#CC0000',
    'blau': '#0044CC',
    'grün': '#228B22',
    'gelb': '#FFD700',
    // 'orange' already defined in English section (same word)
    'braun': '#8B4513',
    // 'beige' already defined in English section (same word)
    // 'gold' already defined in English section (same word)
    'lila': '#6A0DAD',
    'rosa': '#FF69B4',
    // 'bronze' already defined in English section (same word)
    // 'maroon' already defined in English section (same word)
    'türkis': '#40E0D0',

    // Common Variations
    'anthracite': '#383E42',
    'graphite': '#4B4E53',
    'navy': '#000080',
    'pearl': '#FDEEF4',
    'champagne': '#F7E7CE',
    'burgundy': '#800020',
    'lime': '#32CD32',
    'olive': '#808000',
    'cyan': '#00FFFF',
    'magenta': '#FF00FF',
    'cream': '#FFFDD0',
    'ivory': '#FFFFF0',
};

function resolveColorHex(colorName?: string, colorHex?: string): string | null {
    if (colorHex && colorHex.startsWith('#')) return colorHex;
    if (!colorName) return null;
    const lower = colorName.toLowerCase().trim();
    return COLOR_NAME_TO_HEX[lower] || null;
}

// ─── Types ───
export interface FirestoreCarResult {
    id: string;
    _collection?: string;
    make: string;
    model: string;
    year: number;
    price: number;
    mileage: number;
    fuelType: string;
    transmission: string;
    power: number;
    bodyType: string;
    color: string;
    colorHex: string | null;
    city: string;
    region: string;
    images: string[];
    mainImage: string;
    sellerType: string;
    sellerNumericId?: number;
    carNumericId?: number;
    numericId?: number;
    status: string;
    createdAt: Date;
    updatedAt: Date;
    views: number;
    favorites: number;
    title: string;           // computed: "{year} {make} {model}"
    subtitle: string;        // computed from specs
    priceFormatted: string;  // computed
    mileageFormatted: string;// computed
    condition: string;
    description?: string;
    // Dynamic fields via [key: string]: any
    [key: string]: any;
}

export interface DynamicFilterOptions {
    makes: string[];
    models: string[];  // depends on selected make
    cities: string[];
    fuelTypes: string[];
    transmissions: string[];
    bodyTypes: string[];
    colors: Array<{ name: string; hex: string; count: number; isBase?: boolean }>;
    yearRange: { min: number; max: number };
    priceRange: { min: number; max: number };
    conditions: string[];
    sellerTypes: string[];
    totalActive: number;
}

export interface SearchRequest {
    make?: string;
    model?: string;
    priceMin?: number;
    priceMax?: number;
    yearFrom?: number;
    yearTo?: number;
    mileageMax?: number;
    fuelType?: string;
    transmission?: string;
    bodyType?: string;
    condition?: string;
    color?: string;
    colorHex?: string;
    city?: string;
    sellerType?: string;
    features?: string[];
    sortBy: 'relevance' | 'price_asc' | 'price_desc' | 'newest' | 'year_desc' | 'year_asc' | 'mileage_asc' | 'mileage_desc';
    page: number;
    perPage: number;
}

export interface SearchResponse {
    results: FirestoreCarResult[];
    total: number;
    page: number;
    perPage: number;
    totalPages: number;
    facets: Record<string, Record<string, number>>;
    missingFieldsReport: Record<string, number> | null;
    processingMs: number;
    source: string;
}

// ─── MISSING FIELD DETECTION ───
interface MissingFieldReport {
    field: string;
    count: number;
    sampleCarIds: string[];
    recommendedCommand: string;
    notes: string;
}

// ─── Cache for filter options (5 min TTL) ───
let _filterOptionsCache: DynamicFilterOptions | null = null;
let _filterOptionsCacheTime: number = 0;
const CACHE_TTL_MS = 5 * 60 * 1000;

// ─── Raw document → normalized car ───
function mapRawDoc(docData: any, docId: string, collectionName: string): FirestoreCarResult | null {
    const status = docData.status || 'active';
    if (status !== 'active') return null;

    const make = docData.make || docData.brand || '';
    const model = docData.model || '';
    const year = Number(docData.year) || 0;
    const price = Number(docData.netPrice || docData.finalPrice || docData.price) || 0;
    const mileage = Number(docData.mileage || docData.km) || 0;

    // Skip if missing critical fields
    if (!make || !year || !price) return null;

    const fuelType = docData.fuelType || docData.fuel || '';
    const transmission = docData.transmission || docData.gearbox || '';
    const power = Number(docData.power || docData.horsepower || docData.hp) || 0;
    const bodyType = docData.bodyType || docData.vehicleType || '';
    const color = docData.color || docData.colorName || '';
    const colorHex = resolveColorHex(color, docData.colorHex);

    let city = '';
    if (docData.city) city = docData.city;
    else if (docData.location?.city) city = docData.location.city;
    else if (docData.cityNormalized) city = docData.cityNormalized;
    else if (typeof docData.location === 'string') city = docData.location;

    const region = docData.region || docData.location?.region || docData.locationData?.regionName || '';

    const images: string[] = Array.isArray(docData.images) ? docData.images.filter(Boolean) : [];
    const mainImageIndex = typeof docData.featuredImageIndex === 'number' ? docData.featuredImageIndex : 0;
    const mainImage = images[mainImageIndex] || docData.mainImage || docData.thumbnail || images[0] || '';

    const sellerType = docData.sellerType || (docData.dealerId ? 'dealer' : 'private');

    // Timestamps normalization
    let createdAt: Date;
    let updatedAt: Date;

    const parseDate = (val: any): Date => {
        if (!val) return new Date();
        if (typeof val.toDate === 'function') return val.toDate(); // Firestore Timestamp
        if (val instanceof Date) return val;
        if (typeof val === 'number') return new Date(val);
        if (typeof val === 'string') {
            const d = new Date(val);
            return isNaN(d.getTime()) ? new Date() : d;
        }
        // Handle { seconds, nanoseconds } object without toDate (e.g. serialized)
        if (val && typeof val.seconds === 'number') return new Date(val.seconds * 1000);
        return new Date();
    };

    createdAt = parseDate(docData.createdAt);
    updatedAt = parseDate(docData.updatedAt || docData.createdAt);

    return {
        ...docData, // spread raw data first to preserve any extra fields
        id: docId,
        _collection: collectionName,
        make,
        model,
        year,
        price,
        mileage,
        fuelType,
        transmission,
        power,
        bodyType,
        color,
        colorHex,
        city,
        region,
        images,
        mainImage,
        sellerType,
        sellerNumericId: docData.sellerNumericId ? Number(docData.sellerNumericId) : undefined,
        carNumericId: docData.carNumericId ? Number(docData.carNumericId) : (docData.numericId ? Number(docData.numericId) : undefined),
        numericId: docData.numericId ? Number(docData.numericId) : undefined,
        status,
        createdAt,
        updatedAt,
        views: Number(docData.views) || 0,
        favorites: Number(docData.favorites) || 0,
        title: `${year} ${make} ${model}`.trim(),
        subtitle: [
            power ? `${power} HP` : '',
            fuelType,
            transmission,
        ].filter(Boolean).join(' · '),
        priceFormatted: `€${price.toLocaleString('en-US')}`,
        mileageFormatted: `${mileage.toLocaleString('en-US')} km`,
        condition: docData.condition || '',
        description: docData.description,
    };
}

// ─── Fetch ALL active cars from all collections ───
async function fetchAllActiveCars(): Promise<FirestoreCarResult[]> {
    const startTime = performance.now();
    const allCars: FirestoreCarResult[] = [];

    const promises = VEHICLE_COLLECTIONS.map(async (collectionName) => {
        try {
            const q = query(
                collection(db, collectionName),
                where('status', '==', 'active'),
                orderBy('createdAt', 'desc'),
                limit(500)
            );
            const snap = await getDocs(q);
            const cars: FirestoreCarResult[] = [];
            snap.forEach((doc) => {
                const car = mapRawDoc(doc.data(), doc.id, collectionName);
                if (car) cars.push(car);
            });
            return cars;
        } catch (err) {
            logger.warn(`[SearchService] ⚠️ Error querying ${collectionName}:`, err as Error);
            return [];
        }
    });

    const results = await Promise.all(promises);
    results.forEach((cars) => allCars.push(...cars));

    const elapsed = performance.now() - startTime;
    logger.info(`[SearchService] Fetched ${allCars.length} active cars across ${VEHICLE_COLLECTIONS.length} collections in ${elapsed.toFixed(0)}ms`);

    return allCars;
}

// ─── Color Normalization Map ───
const COLOR_ALIASES: Record<string, string> = {
    // Black
    'black': 'black', 'schwarz': 'black', 'черен': 'black',
    'deep black': 'black', 'carbon black': 'black', 'jet black': 'black', 'obsidian': 'black',
    // White
    'white': 'white', 'weiß': 'white', 'бял': 'white',
    'pearl white': 'white', 'alpine white': 'white', 'ivory': 'white', 'cream': 'white',
    // Silver
    'silver': 'silver', 'silber': 'silver', 'сребърен': 'silver',
    'metallic': 'silver', 'platinum': 'silver',
    // Grey
    'gray': 'grey', 'grey': 'grey', 'grau': 'grey', 'сив': 'grey',
    'anthracite': 'grey', 'graphite': 'grey', 'charcoal': 'grey', 'gunmetal': 'grey', 'metallic gray': 'grey', 'mineral grey': 'grey',
    // Red
    'red': 'red', 'rot': 'red', 'червен': 'red',
    'maroon': 'red', 'burgundy': 'red', 'crimson': 'red', 'cherry': 'red', 'bordó': 'red', 'бордо': 'red',
    // Blue
    'blue': 'blue', 'blau': 'blue', 'син': 'blue',
    'navy': 'blue', 'azure': 'blue', 'sapphire': 'blue', 'midnight blue': 'blue', 'baby blue': 'blue', 'sky blue': 'blue',
    // Green
    'green': 'green', 'grün': 'green', 'зелен': 'green',
    'lime': 'green', 'olive': 'green', 'emerald': 'green', 'forest green': 'green',
    // Yellow
    'yellow': 'yellow', 'gelb': 'yellow', 'жълт': 'yellow',
    'gold': 'yellow', 'mustard': 'yellow', 'златист': 'yellow',
    // Orange
    'orange': 'orange', 'оранжев': 'orange',
    'copper': 'orange', 'sunset': 'orange',
    // Brown
    'brown': 'brown', 'braun': 'brown', 'кафяв': 'brown',
    'chocolate': 'brown', 'coffee': 'brown', 'bronze': 'brown', 'бронзов': 'brown',
    // Beige
    'beige': 'beige', 'бежов': 'beige',
    'fawn': 'beige', 'tan': 'beige', 'champagne': 'beige',
};

function normalizeToCanonicalColor(rawColor?: string): string {
    if (!rawColor) return 'other';
    const lower = rawColor.toLowerCase().trim();
    // 1. Direct lookup
    if (COLOR_ALIASES[lower]) return COLOR_ALIASES[lower];

    // 2. Contains match (e.g. "metallic black" -> "black")
    for (const [alias, canonical] of Object.entries(COLOR_ALIASES)) {
        if (lower.includes(alias)) return canonical;
    }

    return 'other';
}

// ═══════════════════════════════════════════
// GET FILTER OPTIONS — Dynamic from DB
// ═══════════════════════════════════════════
export async function getFilterOptions(forceRefresh = false): Promise<DynamicFilterOptions> {
    const now = Date.now();
    if (!forceRefresh && _filterOptionsCache && (now - _filterOptionsCacheTime < CACHE_TTL_MS)) {
        return _filterOptionsCache;
    }

    const allCars = await fetchAllActiveCars();

    const makesSet = new Set<string>();
    const modelsSet = new Set<string>();
    const citiesSet = new Set<string>();
    const fuelTypesSet = new Set<string>();
    const transmissionsSet = new Set<string>();
    const bodyTypesSet = new Set<string>();
    const conditionsSet = new Set<string>();
    const sellerTypesSet = new Set<string>();

    let minYear = Infinity, maxYear = -Infinity;
    let minPrice = Infinity, maxPrice = -Infinity;
    const BASE_COLORS = [
        { id: 'black', name: 'Black', hex: '#000000' },
        { id: 'white', name: 'White', hex: '#FFFFFF' },
        { id: 'silver', name: 'Silver', hex: '#C0C0C0' },
        { id: 'grey', name: 'Grey', hex: '#808080' },
        { id: 'red', name: 'Red', hex: '#CC0000' },
        { id: 'blue', name: 'Blue', hex: '#0044CC' },
        { id: 'green', name: 'Green', hex: '#228B22' },
        { id: 'yellow', name: 'Yellow', hex: '#FFD700' },
        { id: 'orange', name: 'Orange', hex: '#FF8C00' },
        { id: 'brown', name: 'Brown', hex: '#8B4513' },
        { id: 'beige', name: 'Beige', hex: '#F5F5DC' },
    ];

    // Initialize with base colors
    const colorMap: Record<string, { name: string; hex: string; count: number; isBase: boolean }> = {};

    BASE_COLORS.forEach(c => {
        colorMap[c.id] = { name: c.name, hex: c.hex, count: 0, isBase: true };
    });

    // Aggregation loop
    for (const car of allCars) {
        // ... (existing loops for makes, models, etc. untouched)
        if (car.make) makesSet.add(car.make);
        if (car.model) modelsSet.add(car.model);
        if (car.city) citiesSet.add(car.city);
        if (car.fuelType) fuelTypesSet.add(car.fuelType);
        if (car.transmission) transmissionsSet.add(car.transmission);
        if (car.bodyType) bodyTypesSet.add(car.bodyType);
        if (car.condition) conditionsSet.add(car.condition);
        if (car.sellerType) sellerTypesSet.add(car.sellerType);

        if (car.year) {
            minYear = Math.min(minYear, car.year);
            maxYear = Math.max(maxYear, car.year);
        }
        if (car.price) {
            minPrice = Math.min(minPrice, car.price);
            maxPrice = Math.max(maxPrice, car.price);
        }

        // Color aggregation
        if (car.color) {
            const canonical = normalizeToCanonicalColor(car.color);
            if (colorMap[canonical]) {
                colorMap[canonical].count++;
            }
            // If canonical is 'other', we don't count it for the buttons, 
            // but it's available via search.
        }
    }

    const sortedColors = Object.values(colorMap).sort((a, b) => {
        // Base colors first
        if (a.isBase && !b.isBase) return -1;
        if (!a.isBase && b.isBase) return 1;
        // Then by count
        return b.count - a.count;
    });

    const options: DynamicFilterOptions = {
        makes: Array.from(makesSet).sort(),
        models: Array.from(modelsSet).sort(),
        cities: Array.from(citiesSet).sort(),
        fuelTypes: Array.from(fuelTypesSet).sort(),
        transmissions: Array.from(transmissionsSet).sort(),
        bodyTypes: Array.from(bodyTypesSet).sort(),
        colors: sortedColors,
        yearRange: {
            min: minYear === Infinity ? 2000 : minYear,
            max: maxYear === -Infinity ? new Date().getFullYear() : maxYear,
        },
        priceRange: {
            min: minPrice === Infinity ? 0 : minPrice,
            max: maxPrice === -Infinity ? 100000 : maxPrice,
        },
        conditions: Array.from(conditionsSet).sort(),
        sellerTypes: Array.from(sellerTypesSet).sort(),
        totalActive: allCars.length,
    };

    _filterOptionsCache = options;
    _filterOptionsCacheTime = now;

    return options;
}

// ═══════════════════════════════════════════
// SEARCH — Production Firestore query
// ═══════════════════════════════════════════
export async function searchCarsFromDB(req: SearchRequest): Promise<SearchResponse> {
    const startTime = performance.now();

    // Fetch all active cars (uses internal cache if populated from getFilterOptions)
    const allCars = await fetchAllActiveCars();

    // ─── Apply filters ───
    let filtered = [...allCars];

    // Make (case-insensitive)
    if (req.make) {
        const canonical = resolveCanonicalBrand(req.make) || req.make;
        const searchMake = canonical.toLowerCase().trim();
        filtered = filtered.filter(c => {
            const carMake = (c.make || '').toLowerCase().trim();
            return carMake === searchMake || carMake.includes(searchMake);
        });
    }

    // Model (case-insensitive, partial match)
    if (req.model) {
        const searchModel = req.model.toLowerCase().trim();
        filtered = filtered.filter(c =>
            (c.model || '').toLowerCase().includes(searchModel)
        );
    }

    // Price range
    if (req.priceMin) {
        filtered = filtered.filter(c => c.price >= req.priceMin!);
    }
    if (req.priceMax) {
        filtered = filtered.filter(c => c.price <= req.priceMax!);
    }

    // Year range
    if (req.yearFrom) {
        filtered = filtered.filter(c => c.year >= req.yearFrom!);
    }
    if (req.yearTo) {
        filtered = filtered.filter(c => c.year <= req.yearTo!);
    }

    // Mileage max
    if (req.mileageMax) {
        filtered = filtered.filter(c => c.mileage <= req.mileageMax!);
    }

    // Fuel type
    if (req.fuelType) {
        const ft = req.fuelType.toLowerCase();
        filtered = filtered.filter(c => (c.fuelType || '').toLowerCase() === ft);
    }

    // Transmission
    if (req.transmission) {
        const t = req.transmission.toLowerCase();
        filtered = filtered.filter(c => (c.transmission || '').toLowerCase() === t);
    }

    // Body type
    if (req.bodyType) {
        const bt = req.bodyType.toLowerCase();
        filtered = filtered.filter(c => (c.bodyType || '').toLowerCase() === bt);
    }

    // Condition
    if (req.condition) {
        const cond = req.condition.toLowerCase();
        filtered = filtered.filter(c => (c.condition || '').toLowerCase() === cond);
    }

    // Color (by name or hex)
    if (req.colorHex) {
        // If searching by HEX, we assume it's one of our BASE COLORS.
        // We should filter cars that NORMALIZE to this base color.
        // Or if it's a specific hex, we check match.

        // Find if this hex belongs to a base color
        // Note: we can't await here easily without refactoring, but we know our base colors.

        // Strategy: 
        // 1. Check if the requested hex matches a base color hex.
        // 2. If so, filter by normalized canonical name (e.g. 'red').
        // 3. If not, filter by exact hex match.

        const BASE_COLORS_MAP: Record<string, string> = {
            '#000000': 'black', '#FFFFFF': 'white', '#C0C0C0': 'silver', '#808080': 'grey',
            '#CC0000': 'red', '#0044CC': 'blue', '#228B22': 'green', '#FFD700': 'yellow',
            '#FF8C00': 'orange', '#8B4513': 'brown', '#F5F5DC': 'beige'
        };

        const canonical = BASE_COLORS_MAP[req.colorHex] || BASE_COLORS_MAP[req.colorHex.toUpperCase()];

        if (canonical) {
            filtered = filtered.filter(c => normalizeToCanonicalColor(c.color) === canonical);
        } else {
            filtered = filtered.filter(c => c.colorHex === req.colorHex);
        }

    } else if (req.color) {
        const colorLower = req.color.toLowerCase();
        // If searched by text (via "Other"), use partial match or exact?
        // User might type "Nardo Grey". normalizeToCanonicalColor("Nardo Grey") -> "grey".
        // But user might want SPECIFICALLY Nardo Grey.
        // If user typed "Red", they want all reds.

        // Check if input is a canonical color name
        const canonical = normalizeToCanonicalColor(req.color);
        if (canonical !== 'other') {
            filtered = filtered.filter(c => normalizeToCanonicalColor(c.color) === canonical);
        } else {
            // Specific search (e.g. "Magenta")
            filtered = filtered.filter(c => (c.color || '').toLowerCase().includes(colorLower));
        }
    }

    // City
    if (req.city) {
        const cityLower = req.city.toLowerCase();
        filtered = filtered.filter(c => (c.city || '').toLowerCase() === cityLower);
    }

    // Seller type
    if (req.sellerType) {
        filtered = filtered.filter(c => (c.sellerType || '').toLowerCase() === req.sellerType!.toLowerCase());
    }

    // ─── Build facets from filtered results ───
    const facets: Record<string, Record<string, number>> = {
        make: {},
        fuelType: {},
        transmission: {},
        bodyType: {},
        color: {},
        city: {},
        sellerType: {},
    };

    for (const car of filtered) {
        if (car.make) facets.make[car.make] = (facets.make[car.make] || 0) + 1;
        if (car.fuelType) facets.fuelType[car.fuelType] = (facets.fuelType[car.fuelType] || 0) + 1;
        if (car.transmission) facets.transmission[car.transmission] = (facets.transmission[car.transmission] || 0) + 1;
        if (car.bodyType) facets.bodyType[car.bodyType] = (facets.bodyType[car.bodyType] || 0) + 1;
        if (car.color) facets.color[car.color] = (facets.color[car.color] || 0) + 1;
        if (car.city) facets.city[car.city] = (facets.city[car.city] || 0) + 1;
        if (car.sellerType) facets.sellerType[car.sellerType] = (facets.sellerType[car.sellerType] || 0) + 1;
    }

    // ─── Sort ───
    switch (req.sortBy) {
        case 'price_asc':
            filtered.sort((a, b) => a.price - b.price);
            break;
        case 'price_desc':
            filtered.sort((a, b) => b.price - a.price);
            break;
        case 'newest':
            filtered.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
            break;
        case 'year_desc':
            filtered.sort((a, b) => b.year - a.year);
            break;
        case 'year_asc':
            filtered.sort((a, b) => a.year - b.year);
            break;
        case 'mileage_asc':
            filtered.sort((a, b) => a.mileage - b.mileage);
            break;
        case 'mileage_desc':
            filtered.sort((a, b) => b.mileage - a.mileage);
            break;
        default: // relevance — newest first, most views
            filtered.sort((a, b) => {
                const viewsDiff = (b.views || 0) - (a.views || 0);
                if (viewsDiff !== 0) return viewsDiff;
                return b.createdAt.getTime() - a.createdAt.getTime();
            });
    }

    // ─── Missing fields report ───
    let missingFieldsReport: Record<string, number> | null = null;
    const missingColorHex = allCars.filter(c => !c.colorHex).length;
    const missingCity = allCars.filter(c => !c.city).length;
    const missingImages = allCars.filter(c => !c.mainImage).length;

    if (missingColorHex > 0 || missingCity > 0 || missingImages > 0) {
        missingFieldsReport = {};
        if (missingColorHex > 0) missingFieldsReport['colorHex'] = missingColorHex;
        if (missingCity > 0) missingFieldsReport['city'] = missingCity;
        if (missingImages > 0) missingFieldsReport['images'] = missingImages;
    }

    // ─── Paginate ───
    const total = filtered.length;
    const perPage = req.perPage || 20;
    const totalPages = Math.max(1, Math.ceil(total / perPage));
    const page = Math.min(Math.max(1, req.page), totalPages);
    const startIdx = (page - 1) * perPage;
    const paginated = filtered.slice(startIdx, startIdx + perPage);

    const processingMs = performance.now() - startTime;

    return {
        results: paginated,
        total,
        page,
        perPage,
        totalPages,
        facets,
        missingFieldsReport,
        processingMs,
        source: 'firestore',
    };
}

// ─── Get models for a specific make ───
export async function getModelsForMake(make: string): Promise<string[]> {
    const options = await getFilterOptions();
    // Need to re-query for models specific to this make
    const allCars = await fetchAllActiveCars();
    const models = new Set<string>();
    const makeLower = make.toLowerCase();
    for (const car of allCars) {
        if ((car.make || '').toLowerCase() === makeLower && car.model) {
            models.add(car.model);
        }
    }
    return Array.from(models).sort();
}

// ─── Missing field detection & reporting ───
export async function detectMissingFields(): Promise<MissingFieldReport[]> {
    const allCars = await fetchAllActiveCars();
    const reports: MissingFieldReport[] = [];
    const totalCars = allCars.length;
    if (totalCars === 0) return reports;

    const threshold = 0.005; // 0.5%

    // Check colorHex
    const missingColorHex = allCars.filter(c => !c.colorHex);
    if (missingColorHex.length / totalCars > threshold) {
        reports.push({
            field: 'colorHex',
            count: missingColorHex.length,
            sampleCarIds: missingColorHex.slice(0, 3).map(c => c.id),
            recommendedCommand: 'node scripts/extractColorsFromImages.js --source=firestore --dryRun=false',
            notes: 'Requires VISION_API_KEY or node-vibrant. Run on staging first.',
        });
    }

    // Check city
    const missingCity = allCars.filter(c => !c.city);
    if (missingCity.length / totalCars > threshold) {
        reports.push({
            field: 'city',
            count: missingCity.length,
            sampleCarIds: missingCity.slice(0, 3).map(c => c.id),
            recommendedCommand: 'node scripts/normalizeCities.js --source=firestore --apiKey=GOOGLE_PLACES_API_KEY',
            notes: 'Script will call Places API for each unique city string.',
        });
    }

    // Check images
    const missingImages = allCars.filter(c => !c.mainImage);
    if (missingImages.length / totalCars > threshold) {
        reports.push({
            field: 'images',
            count: missingImages.length,
            sampleCarIds: missingImages.slice(0, 3).map(c => c.id),
            recommendedCommand: 'notify admin via dashboard',
            notes: 'Cars without images should display "Image not available" placeholder.',
        });
    }

    return reports;
}
