# Advanced Search System - Bulgarian Car Marketplace

## Overview
This comprehensive advanced search system is inspired by mobile.de and provides professional car search functionality with programmatic linking between search and display sections.

## Features

### 1. Basic Data Section
- **Make & Model**: Dropdown selection with comprehensive car makes
- **Vehicle Type**: Cabriolet, Estate, SUV, Saloon, Small car, Sports, Van, Other
- **Seats & Doors**: Range inputs for minimum/maximum seats and doors
- **Sliding Door**: Yes/No option
- **Condition**: New, Used, Pre-registration, Employee car, Classic, Demonstration
- **Payment Type**: Buy or Leasing
- **Price Range**: EUR currency with from/to inputs
- **First Registration**: Year range (1950-2025)
- **Mileage**: Kilometer range inputs
- **HU Valid Until**: Date input for technical inspection
- **Owners Count**: 1, 2, 3, 4+ owners
- **Service History**: Full service history available
- **Roadworthy**: Vehicle roadworthiness status

### 2. Technical Data Section
- **Fuel Type**: Gasoline, Diesel, Electric, Ethanol, Hybrid, Hydrogen, LPG, Natural gas, Other, Plug-in hybrid
- **Power**: Horsepower range (hp)
- **Cubic Capacity**: Engine displacement range (ccm)
- **Fuel Tank Volume**: Liters range
- **Weight**: Vehicle weight range (kg)
- **Cylinders**: Number of cylinders range
- **Drive Type**: Front, Rear, All-wheel drive
- **Transmission**: Manual, Automatic, Semi-automatic
- **Fuel Consumption**: Up to specified liters/100km
- **Emission Sticker**: Green, Yellow, Red, Blue
- **Emission Class**: Euro 1-6 standards
- **Particulate Filter**: Yes/No

### 3. Exterior Section
- **Exterior Color**: Black, Beige, Gray, Brown, White, Orange, Blue, Yellow, Red, Silver, Gold, Metallic
- **Trailer Coupling**: Fixed, Detachable, Swiveling options
- **Trailer Load**: Braked and unbraked load capacity
- **Nose Weight**: Maximum nose weight
- **Parking Sensors**: 360° Camera, Camera, Front, Rear, Rear traffic alert, Self-steering systems
- **Cruise Control**: Standard or Adaptive Cruise Control

### 4. Interior Section
- **Interior Color**: Beige, Black, Blue, Brown, Gray, Red, Other
- **Interior Material**: Alcantara, Fabric, Artificial leather, Partial leather, Full leather, Velour, Other
- **Airbags**: Driver, Front, Front+Side, Front+Side+More
- **Air Conditioning**: No AC, Manual/Auto, Auto 2-zone, Auto 3-zone, Auto 4-zone
- **Extras**: Comprehensive list including:
  - Alarm, Ambient lighting, Android Auto, Apple CarPlay
  - Arm rest, Auto dimming mirror, Auxiliary heating, Bluetooth
  - Cargo barrier, CD player, DAB radio, Digital cockpit
  - Disabled accessible, Electric backseat, Electric seats, Electric seats with memory
  - Electric windows, Emergency call, Fatigue warning, Folding seats
  - Folding mirrors, Hands-free, Head-up display, Heated rear seats
  - Heated seats, Heated steering, Induction charging, Integrated streaming
  - Isofix, Leather steering, Lumbar support, Massage seats
  - Multifunction steering, Navigation, Onboard computer, Paddle shifters
  - Passenger isofix, Seat ventilation, Right-hand drive, Ski bag
  - Smoker package, Sound system, Sport seats, Touchscreen
  - Tuner/radio, TV, USB port, Virtual mirrors
  - Voice control, Winter package, WLAN/WiFi hotspot

### 5. Offer Details Section
- **Seller Type**: Dealer, Private seller, Company
- **Dealer Rating**: From 3, 4, or 5 stars
- **Ad Online Since**: 1 day, 3 days, 7 days, 14 days
- **Special Options**:
  - Ads with pictures
  - Ads with video
  - Discount offers
  - Non-smoker vehicle
  - Taxi
  - VAT reclaimable
  - Warranty
- **Damaged Vehicles**: Option to exclude damaged cars
- **Commercial/Export**: Commercial, Export, Import options
- **Approved Used Programme**: Yes/No

### 6. Location Section
- **Country**: Bulgaria, Germany, Austria, Switzerland, Other
- **City/Postcode**: Bulgarian cities dropdown
- **Radius**: 10km, 25km, 50km, 100km, 200km
- **Delivery Offers**: Show only offers with delivery

### 7. Search Description
- Keyword search in vehicle descriptions
- Examples: drive mode switch, LTE, thermal glazing

## Technical Implementation

### State Management
- Comprehensive React state with TypeScript interfaces
- All form fields properly typed and validated
- Reset functionality for all search parameters

### URL Parameter Linking
- Programmatic linking between search parameters and results
- URLSearchParams for clean URL structure
- Support for arrays, booleans, and strings in URL parameters

### UI/UX Features
- Professional black-yellow gradient theme
- Glass morphism effects with backdrop blur
- Responsive grid layout
- Smooth animations and transitions
- Bulgarian language throughout
- Professional icons and labels (no emojis)

### Data Arrays
- Comprehensive car makes list
- Bulgarian cities for location filtering
- Extensive extras and features lists
- Professional terminology in Bulgarian

## Usage

### Basic Search Flow
1. User selects search criteria in any section
2. Form submits with programmatic parameter passing
3. Results page receives filtered parameters
4. Display components filter cars based on search criteria

### Advanced Features
- Range inputs for numeric values
- Checkbox groups for multiple selections
- Dropdown selects with comprehensive options
- Boolean toggles for special filters
- Keyword search in descriptions

## Integration Points

### With Car Display Components
- URL parameters passed to car listing components
- Filtered results based on search criteria
- Real-time filtering as parameters change

### With Navigation
- React Router integration for clean URLs
- Search state preservation across navigation
- Back/forward browser button support

## Future Enhancements
- Save search functionality
- Search history
- Advanced sorting options
- Export search results
- Email alerts for new matches</content>
<parameter name="filePath">c:\Users\hamda\Desktop\New Globul Cars\ADVANCED_SEARCH_SYSTEM_README.md