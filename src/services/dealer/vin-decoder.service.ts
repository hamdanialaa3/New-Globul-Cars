import { serviceLogger } from '../logger-service';

export interface DecodedVinData {
  vin: string;
  make?: string;
  model?: string;
  year?: number;
  bodyType?: string;
  fuelType?: string;
  transmission?: string;
  engineSize?: string;
  confidence: number;
  source: 'nhtsa' | 'fallback';
}

class VinDecoderService {
  private readonly VIN_REGEX = /[A-HJ-NPR-Z0-9]{17}/gi;

  extractCandidateVINs(text: string): string[] {
    if (!text) {
      return [];
    }

    const matches = text.match(this.VIN_REGEX) || [];
    return Array.from(new Set(matches.map(vin => vin.toUpperCase())));
  }

  async decodeVIN(vin: string): Promise<DecodedVinData | null> {
    const cleanVin = vin.trim().toUpperCase();
    if (cleanVin.length !== 17) {
      return null;
    }

    try {
      const endpoint = `https://vpic.nhtsa.dot.gov/api/vehicles/DecodeVin/${cleanVin}?format=json`;
      const response = await fetch(endpoint);
      const payload = await response.json();
      const results = payload?.Results || [];

      const byName = (name: string) =>
        results.find((r: any) => r.Variable === name)?.Value || undefined;
      const year = byName('Model Year');

      return {
        vin: cleanVin,
        make: byName('Make'),
        model: byName('Model'),
        year: year ? Number(year) : undefined,
        bodyType: byName('Body Class'),
        fuelType: byName('Fuel Type - Primary'),
        transmission: byName('Transmission Style'),
        engineSize: byName('Displacement (L)'),
        confidence: 0.8,
        source: 'nhtsa',
      };
    } catch (error) {
      serviceLogger.warn('VIN decoding failed, fallback path used', {
        vin: cleanVin,
        message: (error as Error).message,
      });

      return {
        vin: cleanVin,
        confidence: 0.3,
        source: 'fallback',
      };
    }
  }
}

export const vinDecoderService = new VinDecoderService();
