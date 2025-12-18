// sell-workflow-collections.ts - Collection management utilities
// Split from sellWorkflowService.ts to comply with 300-line limit

export class SellWorkflowCollections {
  private static collectionName = 'cars';

  /**
   * Get the appropriate Firestore collection name based on vehicle type
   */
  static getCollectionNameForVehicleType(vehicleType: string): string {
    const typeMap: Record<string, string> = {
      'car': 'passenger_cars',           // Passenger Car / Personal use
      'suv': 'suvs',                      // SUV/Jeep / Off-road
      'van': 'vans',                      // Van / Cargo/Combi
      'motorcycle': 'motorcycles',        // Motorcycle / Two-wheeled
      'truck': 'trucks',                  // Truck / Cargo
      'bus': 'buses'                      // Bus / Passenger
    };

    // Default to 'cars' if type not found (backward compatibility)
    return typeMap[vehicleType?.toLowerCase()] || 'cars';
  }

  /**
   * Get collection name for drafts
   */
  static getDraftsCollectionName(): string {
    return 'workflow_drafts';
  }

  /**
   * Get collection name for workflow progress
   */
  static getProgressCollectionName(): string {
    return 'workflow_progress';
  }

  /**
   * Get collection name for workflow images
   */
  static getImagesCollectionName(): string {
    return 'workflow_images';
  }

  /**
   * Validate collection name exists
   */
  static isValidCollection(collectionName: string): boolean {
    const validCollections = [
      'cars',
      'passenger_cars',
      'suvs',
      'vans',
      'motorcycles',
      'trucks',
      'buses',
      'workflow_drafts',
      'workflow_progress',
      'workflow_images'
    ];

    return validCollections.includes(collectionName);
  }

  /**
   * Get all available collections
   */
  static getAllCollections(): string[] {
    return [
      'cars',
      'passenger_cars',
      'suvs',
      'vans',
      'motorcycles',
      'trucks',
      'buses'
    ];
  }

  /**
   * Get collection display name
   */
  static getCollectionDisplayName(collectionName: string): string {
    const displayNames: Record<string, string> = {
      'cars': 'All Vehicles',
      'passenger_cars': 'Passenger Cars',
      'suvs': 'SUVs & Jeeps',
      'vans': 'Vans & Combis',
      'motorcycles': 'Motorcycles',
      'trucks': 'Trucks',
      'buses': 'Buses'
    };

    return displayNames[collectionName] || collectionName;
  }
}