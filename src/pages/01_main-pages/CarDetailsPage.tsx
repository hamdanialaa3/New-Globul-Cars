import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { 
  Car, 
  Calendar, 
  DollarSign, 
  MapPin, 
  Gauge, 
  Fuel, 
  Settings, 
  ChevronLeft,
  Shield
} from 'lucide-react';
import { CarSEO } from '../../components/SEO/CarSEO';
import { ContactSection } from '../../components/contact/ContactSection';
import { ImageGallery } from '../../components/gallery/ImageGallery';
import { PageLayout } from '../../components/layout/PageLayout';
import { ShareButtons } from '../../components/social/ShareButtons';
import { getCarDetails, type CarDetails as CarDetailsType } from '../../data/carDetails';
import { getBreadcrumbs } from '../../utils/breadcrumbs';
import { Breadcrumbs } from '../../components/navigation/Breadcrumbs';

export function CarDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [car, setCar] = useState<CarDetailsType | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      const carData = getCarDetails(id);
      if (carData) {
        setCar(carData);
      }
      setLoading(false);
    }
  }, [id]);

  if (loading) {
    return (
      <PageLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </PageLayout>
    );
  }

  if (!car) {
    return (
      <PageLayout>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Car Not Found</h1>
            <p className="text-gray-600 mb-8">The car you're looking for doesn't exist.</p>
            <button
              onClick={() => navigate('/inventory')}
              className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
            >
              <ChevronLeft className="h-5 w-5 mr-2" />
              Back to Inventory
            </button>
          </div>
        </div>
      </PageLayout>
    );
  }

  const breadcrumbs = getBreadcrumbs('car-details', { carName: car.name });

  return (
    <PageLayout>
      <CarSEO car={car} />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Breadcrumbs items={breadcrumbs} />
        
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-6 transition-colors"
        >
          <ChevronLeft className="h-5 w-5 mr-1" />
          Back
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Image Gallery */}
            <ImageGallery images={car.images} carName={car.name} />

            {/* Car Header */}
            <div>
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">{car.name}</h1>
                  <div className="flex flex-wrap gap-2">
                    {car.featured && (
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        Featured
                      </span>
                    )}
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      {car.condition}
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-3xl font-bold text-blue-600">{car.price}</p>
                  {car.originalPrice && (
                    <p className="text-sm text-gray-500 line-through">{car.originalPrice}</p>
                  )}
                </div>
              </div>

              {/* Share Buttons */}
              <ShareButtons 
                url={window.location.href}
                title={car.name}
                description={car.description}
              />
            </div>

            {/* Key Specifications */}
            <div className="bg-gray-50 rounded-lg p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Key Specifications</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="flex items-center space-x-3">
                  <Calendar className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-500">Year</p>
                    <p className="font-semibold text-gray-900">{car.year}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <Gauge className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-500">Mileage</p>
                    <p className="font-semibold text-gray-900">{car.mileage}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <Fuel className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-500">Fuel Type</p>
                    <p className="font-semibold text-gray-900">{car.fuelType}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <Settings className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-500">Transmission</p>
                    <p className="font-semibold text-gray-900">{car.transmission}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Description */}
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Description</h2>
              <p className="text-gray-600 leading-relaxed">{car.description}</p>
            </div>

            {/* Features */}
            {car.features && car.features.length > 0 && (
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Features</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {car.features.map((feature, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                      <span className="text-gray-700">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Technical Specifications */}
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Technical Specifications</h2>
              <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                <div className="divide-y divide-gray-200">
                  {car.specifications.engine && (
                    <div className="grid grid-cols-2 p-4 hover:bg-gray-50">
                      <span className="text-gray-600">Engine</span>
                      <span className="font-medium text-gray-900">{car.specifications.engine}</span>
                    </div>
                  )}
                  {car.specifications.power && (
                    <div className="grid grid-cols-2 p-4 hover:bg-gray-50">
                      <span className="text-gray-600">Power</span>
                      <span className="font-medium text-gray-900">{car.specifications.power}</span>
                    </div>
                  )}
                  {car.specifications.torque && (
                    <div className="grid grid-cols-2 p-4 hover:bg-gray-50">
                      <span className="text-gray-600">Torque</span>
                      <span className="font-medium text-gray-900">{car.specifications.torque}</span>
                    </div>
                  )}
                  {car.specifications.acceleration && (
                    <div className="grid grid-cols-2 p-4 hover:bg-gray-50">
                      <span className="text-gray-600">0-100 km/h</span>
                      <span className="font-medium text-gray-900">{car.specifications.acceleration}</span>
                    </div>
                  )}
                  {car.specifications.topSpeed && (
                    <div className="grid grid-cols-2 p-4 hover:bg-gray-50">
                      <span className="text-gray-600">Top Speed</span>
                      <span className="font-medium text-gray-900">{car.specifications.topSpeed}</span>
                    </div>
                  )}
                  {car.specifications.fuelConsumption && (
                    <div className="grid grid-cols-2 p-4 hover:bg-gray-50">
                      <span className="text-gray-600">Fuel Consumption</span>
                      <span className="font-medium text-gray-900">{car.specifications.fuelConsumption}</span>
                    </div>
                  )}
                  {car.specifications.co2Emissions && (
                    <div className="grid grid-cols-2 p-4 hover:bg-gray-50">
                      <span className="text-gray-600">CO₂ Emissions</span>
                      <span className="font-medium text-gray-900">{car.specifications.co2Emissions}</span>
                    </div>
                  )}
                  {car.specifications.driveType && (
                    <div className="grid grid-cols-2 p-4 hover:bg-gray-50">
                      <span className="text-gray-600">Drive Type</span>
                      <span className="font-medium text-gray-900">{car.specifications.driveType}</span>
                    </div>
                  )}
                  {car.specifications.seats && (
                    <div className="grid grid-cols-2 p-4 hover:bg-gray-50">
                      <span className="text-gray-600">Seats</span>
                      <span className="font-medium text-gray-900">{car.specifications.seats}</span>
                    </div>
                  )}
                  {car.specifications.doors && (
                    <div className="grid grid-cols-2 p-4 hover:bg-gray-50">
                      <span className="text-gray-600">Doors</span>
                      <span className="font-medium text-gray-900">{car.specifications.doors}</span>
                    </div>
                  )}
                  {car.specifications.color && (
                    <div className="grid grid-cols-2 p-4 hover:bg-gray-50">
                      <span className="text-gray-600">Exterior Color</span>
                      <span className="font-medium text-gray-900">{car.specifications.color}</span>
                    </div>
                  )}
                  {car.specifications.interior && (
                    <div className="grid grid-cols-2 p-4 hover:bg-gray-50">
                      <span className="text-gray-600">Interior</span>
                      <span className="font-medium text-gray-900">{car.specifications.interior}</span>
                    </div>
                  )}
                  {car.specifications.vin && (
                    <div className="grid grid-cols-2 p-4 hover:bg-gray-50">
                      <span className="text-gray-600">VIN</span>
                      <span className="font-medium text-gray-900 font-mono text-sm">{car.specifications.vin}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Safety Features */}
            {car.safetyFeatures && car.safetyFeatures.length > 0 && (
              <div>
                <div className="flex items-center space-x-2 mb-4">
                  <Shield className="h-6 w-6 text-blue-600" />
                  <h2 className="text-xl font-semibold text-gray-900">Safety Features</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {car.safetyFeatures.map((feature, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                      <span className="text-gray-700">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Warranty Information */}
            {car.warranty && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Warranty Information</h2>
                <div className="space-y-2">
                  {car.warranty.basic && (
                    <div className="flex items-start space-x-2">
                      <div className="w-2 h-2 bg-blue-600 rounded-full mt-2"></div>
                      <div>
                        <span className="font-medium text-gray-900">Basic Warranty: </span>
                        <span className="text-gray-700">{car.warranty.basic}</span>
                      </div>
                    </div>
                  )}
                  {car.warranty.powertrain && (
                    <div className="flex items-start space-x-2">
                      <div className="w-2 h-2 bg-blue-600 rounded-full mt-2"></div>
                      <div>
                        <span className="font-medium text-gray-900">Powertrain Warranty: </span>
                        <span className="text-gray-700">{car.warranty.powertrain}</span>
                      </div>
                    </div>
                  )}
                  {car.warranty.roadside && (
                    <div className="flex items-start space-x-2">
                      <div className="w-2 h-2 bg-blue-600 rounded-full mt-2"></div>
                      <div>
                        <span className="font-medium text-gray-900">Roadside Assistance: </span>
                        <span className="text-gray-700">{car.warranty.roadside}</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* History Report */}
            {car.historyReport && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Vehicle History</h2>
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <div className={`w-3 h-3 rounded-full ${car.historyReport.accidents ? 'bg-red-600' : 'bg-green-600'}`}></div>
                    <span className="text-gray-700">
                      {car.historyReport.accidents ? 'Accident reported' : 'No accidents reported'}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className={`w-3 h-3 rounded-full ${car.historyReport.owners === 1 ? 'bg-green-600' : 'bg-yellow-600'}`}></div>
                    <span className="text-gray-700">
                      {car.historyReport.owners} {car.historyReport.owners === 1 ? 'owner' : 'owners'}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-green-600 rounded-full"></div>
                    <span className="text-gray-700">
                      Service history: {car.historyReport.serviceHistory}
                    </span>
                  </div>
                  {car.historyReport.lastService && (
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-blue-600 rounded-full"></div>
                      <span className="text-gray-700">
                        Last service: {car.historyReport.lastService}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-8 space-y-6">
              {/* Contact Form */}
              <ContactSection carName={car.name} />

              {/* Location */}
              {car.location && (
                <div className="bg-white rounded-lg shadow-md p-6">
                  <div className="flex items-center space-x-2 mb-4">
                    <MapPin className="h-5 w-5 text-blue-600" />
                    <h3 className="text-lg font-semibold text-gray-900">Location</h3>
                  </div>
                  <p className="text-gray-600">{car.location}</p>
                </div>
              )}

              {/* Additional Info */}
              <div className="bg-gray-50 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Why Buy From Us?</h3>
                <ul className="space-y-3">
                  <li className="flex items-start space-x-2">
                    <div className="w-2 h-2 bg-blue-600 rounded-full mt-2"></div>
                    <span className="text-gray-600">Certified pre-owned vehicles</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <div className="w-2 h-2 bg-blue-600 rounded-full mt-2"></div>
                    <span className="text-gray-600">Comprehensive warranty options</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <div className="w-2 h-2 bg-blue-600 rounded-full mt-2"></div>
                    <span className="text-gray-600">Flexible financing available</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <div className="w-2 h-2 bg-blue-600 rounded-full mt-2"></div>
                    <span className="text-gray-600">Trade-in welcome</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <div className="w-2 h-2 bg-blue-600 rounded-full mt-2"></div>
                    <span className="text-gray-600">Free vehicle history report</span>
                  </li>
                </ul>
              </div>

              {/* Call to Action */}
              <div className="bg-blue-600 rounded-lg p-6 text-white">
                <h3 className="text-lg font-semibold mb-2">Ready to Buy?</h3>
                <p className="text-blue-100 mb-4 text-sm">
                  Contact us today to schedule a test drive or get more information about this vehicle.
                </p>
                <a
                  href="tel:+1234567890"
                  className="block w-full bg-white text-blue-600 text-center py-3 rounded-md font-medium hover:bg-blue-50 transition-colors"
                >
                  Call Now
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </PageLayout>
  );
}