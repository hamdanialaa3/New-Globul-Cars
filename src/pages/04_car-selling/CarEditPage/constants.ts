export const FUEL_TYPES = ['petrol', 'diesel', 'electric', 'hybrid', 'lpg', '__other__'];
export const TRANSMISSIONS = ['manual', 'automatic'];
export const COLORS = ['white', 'black', 'silver', 'gray', 'blue', 'red', 'green', 'other'];
export const CONDITIONS = ['new', 'used', 'parts'];
export const DRIVE_TYPES = ['front-wheel', 'rear-wheel', 'all-wheel'];

export const DOOR_CHIP_OPTIONS = [
    { value: '2', label: '2/3' },
    { value: '4', label: '4/5' },
    { value: '6', label: '6/7' },
];

export const ROADWORTHY_CHOICES: Array<'yes' | 'no'> = ['yes', 'no'];
export const SALE_TYPE_CHOICES: Array<'private' | 'commercial'> = ['private', 'commercial'];
export const SALE_TIMELINE_CHOICES: Array<'unknown' | 'soon' | 'months'> = ['unknown', 'soon', 'months'];

export const FIRST_REGISTRATION_MONTHS = [
    { value: '01', labelBg: 'Януари', labelEn: 'January' },
    { value: '02', labelBg: 'Февруари', labelEn: 'February' },
    { value: '03', labelBg: 'Март', labelEn: 'March' },
    { value: '04', labelBg: 'Април', labelEn: 'April' },
    { value: '05', labelBg: 'Май', labelEn: 'May' },
    { value: '06', labelBg: 'Юни', labelEn: 'June' },
    { value: '07', labelBg: 'Юли', labelEn: 'July' },
    { value: '08', labelBg: 'Август', labelEn: 'August' },
    { value: '09', labelBg: 'Септември', labelEn: 'September' },
    { value: '10', labelBg: 'Октомври', labelEn: 'October' },
    { value: '11', labelBg: 'Ноември', labelEn: 'November' },
    { value: '12', labelBg: 'Декември', labelEn: 'December' }
];

export const SAFETY_EQUIPMENT = [
    'abs', 'esp', 'airbags', 'parkingSensors', 'rearviewCamera',
    'blindSpotMonitor', 'laneDeparture', 'collisionWarning'
];

export const COMFORT_EQUIPMENT = [
    'ac', 'climate', 'heatedSeats', 'ventilatedSeats',
    'sunroof', 'rainSensor', 'cruiseControl', 'parkAssist'
];

export const INFOTAINMENT_EQUIPMENT = [
    'navigation', 'bluetooth', 'usb', 'carPlay', 'androidAuto',
    'soundSystem', 'wifi', 'radio'
];

export const EXTRA_EQUIPMENT = [
    'ledLights', 'xenon', 'daylight', 'alloyWheels', 'keyless',
    'startStop', 'sportPackage', 'towHitch'
];
