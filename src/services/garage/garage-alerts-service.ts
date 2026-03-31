import { differenceInDays, isAfter, isBefore, addDays } from 'date-fns';
import { GarageVehicle, GarageAlert } from './garage-types';
import { Timestamp } from 'firebase/firestore';

export const garageAlertsService = {
  /**
   * Generates alerts for a given vehicle based on document expiry dates.
   * Checks MOT (ГТП), Insurance, and Vignette.
   */
  generateAlertsForVehicle(vehicle: GarageVehicle): GarageAlert[] {
    const alerts: GarageAlert[] = [];
    if (!vehicle.documents) return alerts;

    const today = new Date();

    const checkExpiry = (
      dateField: string | Timestamp | undefined,
      docType: 'mot' | 'insurance' | 'vignette',
      docNameBG: string
    ) => {
      if (!dateField) return;

      // Parse date handling both string and Firestore Timestamp
      let expiryDate: Date;
      if (typeof dateField === 'string') {
        expiryDate = new Date(dateField);
      } else {
        expiryDate = dateField.toDate();
      }

      if (isNaN(expiryDate.getTime())) return;

      const daysRemaining = differenceInDays(expiryDate, today);

      if (daysRemaining < 0) {
        // Expired
        alerts.push({
          id: `${vehicle.id}-${docType}-expired`,
          vehicleId: vehicle.id,
          vehicleName: `${vehicle.make} ${vehicle.model}`,
          type: docType,
          severity: 'high',
          message: `Изтекъл срок на ${docNameBG}! (преди ${Math.abs(daysRemaining)} дни)`,
          daysRemaining
        });
      } else if (daysRemaining <= 14) {
        // Expiring soon (within 2 weeks)
        alerts.push({
          id: `${vehicle.id}-${docType}-warning`,
          vehicleId: vehicle.id,
          vehicleName: `${vehicle.make} ${vehicle.model}`,
          type: docType,
          severity: daysRemaining <= 3 ? 'high' : 'medium',
          message: `${docNameBG} изтича след ${daysRemaining} дни.`,
          daysRemaining
        });
      }
    };

    checkExpiry(vehicle.documents.motExpiry, 'mot', 'ГТП');
    checkExpiry(vehicle.documents.insuranceExpiry, 'insurance', 'Гражданска отговорност');
    checkExpiry(vehicle.documents.vignetteExpiry, 'vignette', 'Винетка');

    return alerts.sort((a, b) => a.daysRemaining - b.daysRemaining);
  },

  /**
   * Generates an aggregated view of all alerts for a user's entire garage.
   */
  getAllAlerts(vehicles: GarageVehicle[]): GarageAlert[] {
    let allAlerts: GarageAlert[] = [];
    vehicles.forEach(vehicle => {
      const vehicleAlerts = this.generateAlertsForVehicle(vehicle);
      allAlerts = [...allAlerts, ...vehicleAlerts];
    });

    // Sort globally by most urgent
    return allAlerts.sort((a, b) => a.daysRemaining - b.daysRemaining);
  }
};
