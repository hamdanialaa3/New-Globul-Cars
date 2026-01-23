import { useCallback, useEffect, useMemo, useState } from 'react';
import { BULGARIA_REGIONS, getCitiesByRegion } from '../../../../data/bulgaria-locations';
import { getPostalCodesForCity, getStreetsForPostalCode } from '../../../../data/bulgaria-postal-codes';
import useSellWorkflow from '../../../../hooks/useSellWorkflow';
import { CONTACT_METHODS } from './contactConstants';
const defaultState = {
    sellerName: '',
    sellerEmail: '',
    sellerPhone: '',
    additionalPhone: '',
    preferredContact: [],
    region: '',
    city: '',
    postalCode: '',
    location: '',
    availableHours: '',
    notes: ''
};
export const useContactForm = ({ language, requireContactFields = false }) => {
    var _a, _b, _c;
    const { workflowData, updateWorkflowData } = useSellWorkflow();
    const [contactData, setContactData] = useState(() => {
        const preferred = Array.isArray(workflowData.preferredContact)
            ? workflowData.preferredContact
            : typeof workflowData.preferredContact === 'string' && workflowData.preferredContact.length > 0
                ? workflowData.preferredContact.split(',').map(value => value.trim()).filter(Boolean)
                : [];
        return Object.assign(Object.assign(Object.assign({}, defaultState), workflowData), { preferredContact: preferred });
    });
    const [availableCities, setAvailableCities] = useState([]);
    const [availablePostalCodes, setAvailablePostalCodes] = useState([]);
    const [availableStreets, setAvailableStreets] = useState([]);
    useEffect(() => {
        updateWorkflowData(Object.assign(Object.assign({}, contactData), { preferredContact: contactData.preferredContact }), 'contact');
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [contactData]);
    // Update cities when region changes
    useEffect(() => {
        if (!contactData.region) {
            setAvailableCities([]);
            setAvailablePostalCodes([]);
            setAvailableStreets([]);
            // Clear city, postal code, and location when region is cleared
            setContactData(prev => (Object.assign(Object.assign({}, prev), { city: '', postalCode: '', location: '' })));
            return;
        }
        const cities = getCitiesByRegion(contactData.region, language);
        setAvailableCities(cities);
        // Clear city if it's not in the new region's cities
        if (cities.length > 0 && !cities.some(city => { var _a; return city.name === ((_a = contactData.locationData) === null || _a === void 0 ? void 0 : _a.cityName); })) {
            setContactData(prev => (Object.assign(Object.assign({}, prev), { city: '', postalCode: '', location: '' })));
            setAvailablePostalCodes([]);
            setAvailableStreets([]);
        }
    }, [contactData.region, (_a = contactData.locationData) === null || _a === void 0 ? void 0 : _a.cityName, language]);
    // Update postal codes when city changes
    useEffect(() => {
        var _a, _b;
        if (!((_a = contactData.locationData) === null || _a === void 0 ? void 0 : _a.cityName) || !contactData.region) {
            setAvailablePostalCodes([]);
            setAvailableStreets([]);
            // Clear postal code and location when city is cleared
            setContactData(prev => (Object.assign(Object.assign({}, prev), { postalCode: '', location: '' })));
            return;
        }
        const postalCodes = getPostalCodesForCity((_b = contactData.locationData) === null || _b === void 0 ? void 0 : _b.cityName, contactData.region);
        setAvailablePostalCodes(postalCodes);
        // Clear postal code if it's not in the new city's postal codes
        if (postalCodes.length > 0 && !postalCodes.some(pc => pc.code === contactData.postalCode)) {
            setContactData(prev => (Object.assign(Object.assign({}, prev), { postalCode: '', location: '' })));
            setAvailableStreets([]);
        }
    }, [(_b = contactData.locationData) === null || _b === void 0 ? void 0 : _b.cityName, contactData.region, contactData.postalCode]);
    // Update streets when postal code changes
    useEffect(() => {
        var _a, _b;
        if (!contactData.postalCode || !((_a = contactData.locationData) === null || _a === void 0 ? void 0 : _a.cityName)) {
            setAvailableStreets([]);
            // Clear location when postal code is cleared
            setContactData(prev => (Object.assign(Object.assign({}, prev), { location: '' })));
            return;
        }
        const streets = getStreetsForPostalCode(contactData.postalCode, (_b = contactData.locationData) === null || _b === void 0 ? void 0 : _b.cityName);
        setAvailableStreets(streets);
        // Clear location if it's not in the new postal code's streets
        if (streets.length > 0 && !streets.includes(contactData.location)) {
            setContactData(prev => (Object.assign(Object.assign({}, prev), { location: '' })));
        }
    }, [contactData.postalCode, (_c = contactData.locationData) === null || _c === void 0 ? void 0 : _c.cityName, contactData.location]);
    const handleFieldChange = useCallback((field, value) => {
        setContactData(prev => (Object.assign(Object.assign({}, prev), { [field]: value })));
    }, []);
    const toggleContactMethod = useCallback((methodId) => {
        if (!CONTACT_METHODS.some(method => method.id === methodId))
            return;
        setContactData(prev => {
            const exists = prev.preferredContact.includes(methodId);
            const preferredContact = exists
                ? prev.preferredContact.filter(id => id !== methodId)
                : [...prev.preferredContact, methodId];
            return Object.assign(Object.assign({}, prev), { preferredContact });
        });
    }, []);
    const clearContactData = useCallback(() => {
        setContactData(defaultState);
    }, []);
    const availableRegions = useMemo(() => BULGARIA_REGIONS, []);
    const canContinue = useMemo(() => {
        var _a;
        if (!requireContactFields) {
            return true;
        }
        return (contactData.sellerName.trim().length > 0 &&
            contactData.sellerEmail.trim().length > 0 &&
            contactData.sellerPhone.trim().length > 0 &&
            contactData.region.trim().length > 0 &&
            ((_a = contactData.locationData) === null || _a === void 0 ? void 0 : _a.cityName.trim().length) > 0);
    }, [contactData, requireContactFields]);
    return {
        contactData,
        availableRegions,
        availableCities,
        availablePostalCodes,
        availableStreets,
        canContinue,
        handleFieldChange,
        toggleContactMethod,
        clearContactData
    };
};
export default useContactForm;
