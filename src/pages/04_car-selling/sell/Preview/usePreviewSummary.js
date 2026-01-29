import { useMemo } from 'react';
import useSellWorkflow from '../../../../hooks/useSellWorkflow';
import { WorkflowPersistenceService } from '../../../../services/unified-workflow-persistence.service';
export const usePreviewSummary = (labels) => {
    var _a, _b;
    const { workflowData } = useSellWorkflow();
    const savedImages = useMemo(() => WorkflowPersistenceService.getImages(), []);
    const vehicleRows = [
        { label: labels.vehicle.make, value: workflowData.make || '—' },
        { label: labels.vehicle.model, value: workflowData.model || '—' },
        { label: labels.vehicle.year, value: workflowData.year || '—' },
        { label: labels.vehicle.mileage, value: workflowData.mileage || '—' },
        { label: labels.vehicle.fuel, value: workflowData.fuelType || '—' },
        { label: labels.vehicle.transmission, value: workflowData.transmission || '—' },
        { label: labels.vehicle.color, value: workflowData.color || '—' }
    ];
    const pricingRows = [
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
    const contactRows = [
        { label: labels.contact.sellerName, value: workflowData.sellerName || '—' },
        { label: labels.contact.phone, value: workflowData.sellerPhone || '—' },
        { label: labels.contact.email, value: workflowData.sellerEmail || '—' },
        { label: labels.contact.region, value: workflowData.region || '—' },
        { label: (_a = labels.contact.locationData) === null || _a === void 0 ? void 0 : _a.cityName, value: ((_b = workflowData.locationData) === null || _b === void 0 ? void 0 : _b.cityName) || '—' },
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
    };
};
export default usePreviewSummary;
