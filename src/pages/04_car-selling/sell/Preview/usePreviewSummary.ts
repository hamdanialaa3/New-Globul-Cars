import { useMemo } from 'react';
import useSellWorkflow from '@/hooks/useSellWorkflow';
import { WorkflowPersistenceService } from '@/services/unified-workflow-persistence.service';

interface SummaryRow {
  label: string;
  value?: string;
}

interface SummarySection {
  title: string;
  rows: SummaryRow[];
}

export interface PreviewSummary {
  vehicle: SummarySection;
  pricing: SummarySection;
  contact: SummarySection;
  equipment: {
    safety: string[];
    comfort: string[];
    infotainment: string[];
    extras: string[];
  };
  images: string[];
}

export const usePreviewSummary = (labels: {
  vehicle: { [key: string]: string };
  pricing: { [key: string]: string };
  contact: { [key: string]: string };
  sections: { vehicle: string; pricing: string; contact: string; equipment: string; images: string };
}) => {
  const { workflowData } = useSellWorkflow();
  const savedImages = useMemo(() => WorkflowPersistenceService.getImages(), []);

  const vehicleRows: SummaryRow[] = [
    { label: labels.vehicle.make, value: workflowData.make || '—' },
    { label: labels.vehicle.model, value: workflowData.model || '—' },
    { label: labels.vehicle.year, value: workflowData.year || '—' },
    { label: labels.vehicle.mileage, value: workflowData.mileage || '—' },
    { label: labels.vehicle.fuel, value: workflowData.fuelType || '—' },
    { label: labels.vehicle.transmission, value: workflowData.transmission || '—' },
    { label: labels.vehicle.color, value: workflowData.color || '—' }
  ];

  const pricingRows: SummaryRow[] = [
    {
      label: labels.pricing.price,
      value: workflowData.price
        ? `${workflowData.price} ${workflowData.currency || 'EUR'}`
        : '—'
    },
    {
      label: labels.pricing.negotiable,
      value: workflowData.negotiable !== undefined 
        ? (workflowData.negotiable ? labels.pricing.yes : labels.pricing.no)
        : '—'
    },
    {
      label: labels.pricing.vat,
      value: workflowData.vatDeductible !== undefined
        ? (workflowData.vatDeductible ? labels.pricing.included : labels.pricing.notIncluded)
        : '—'
    }
  ];

  const contactRows: SummaryRow[] = [
    { label: labels.contact.sellerName, value: workflowData.sellerName || '—' },
    { label: labels.contact.phone, value: workflowData.sellerPhone || '—' },
    { label: labels.contact.email, value: workflowData.sellerEmail || '—' },
    { label: labels.contact.region, value: workflowData.region || '—' },
    { label: labels.contact.locationData?.cityName, value: workflowData.locationData?.cityName || '—' },
    { label: labels.contact.zip, value: workflowData.postalCode || '—' }
  ];

  const equipmentSummary = {
    safety: Array.isArray(workflowData.safetyEquipment)
      ? workflowData.safetyEquipment
      : (workflowData.safety || '').split(',').filter(Boolean),
    comfort: Array.isArray(workflowData.comfortEquipment)
      ? workflowData.comfortEquipment
      : (workflowData.comfort || '').split(',').filter(Boolean),
    infotainment: Array.isArray(workflowData.infotainmentEquipment)
      ? workflowData.infotainmentEquipment
      : (workflowData.infotainment || '').split(',').filter(Boolean),
    extras: Array.isArray(workflowData.extrasEquipment)
      ? workflowData.extrasEquipment
      : (workflowData.extras || '').split(',').filter(Boolean)
  };

  return {
    vehicle: {
      title: labels.sections.vehicle,
      rows: vehicleRows
    },
    pricing: {
      title: labels.sections.pricing,
      rows: pricingRows
    },
    contact: {
      title: labels.sections.contact,
      rows: contactRows
    },
    equipment: equipmentSummary,
    images: savedImages
  } as PreviewSummary;
};

export default usePreviewSummary;

