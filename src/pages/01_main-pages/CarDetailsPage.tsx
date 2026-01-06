import { useParams, Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { CarCard } from '../../components/cars/CarCard';
import { Button } from '../../components/ui/Button';
import { Phone, MessageCircle, ArrowLeft, Share2, Heart } from 'lucide-react';
import { mockCars } from '../../data/mockCars';
import { Car } from '../../types';
import { ImageGallery } from '../../components/cars/ImageGallery';
import { CarFeatures } from '../../components/cars/CarFeatures';
import { CarSpecifications } from '../../components/cars/CarSpecifications';
import { CarPriceCalculator } from '../../components/cars/CarPriceCalculator';
import { SimilarCars } from '../../components/cars/SimilarCars';
import { ShareDialog } from '../../components/ui/ShareDialog';
import { CarSEO } from '../../components/SEO/CarSEO';

export function CarDetailsPage() {
  const { id } = useParams();
  const [car, setCar] = useState<Car | null>(null);
  const [isShareOpen, setIsShareOpen] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);

  useEffect(() => {
    const foundCar = mockCars.find(c => c.id === id);
    setCar(foundCar || null);
    
    // Check if car is in favorites
    const favorites = JSON.parse(localStorage.getItem('favorites') || '[]');
    setIsFavorite(favorites.includes(id));
  }, [id]);

  const toggleFavorite = () => {
    const favorites = JSON.parse(localStorage.getItem('favorites') || '[]');
    
    if (isFavorite) {
      const newFavorites = favorites.filter((fid: string) => fid !== id);
      localStorage.setItem('favorites', JSON.stringify(newFavorites));
      setIsFavorite(false);
    } else {
      favorites.push(id);
      localStorage.setItem('favorites', JSON.stringify(favorites));
      setIsFavorite(true);
    }
  };

  if (!car) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">السيارة غير موجودة</h2>
          <Link to="/cars">
            <Button>
              <ArrowLeft className="ml-2" size={20} />
              العودة إلى قائمة السيارات
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <>
      <CarSEO car={car} />
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container mx-auto px-4">
          {/* Breadcrumb */}
          <nav className="mb-6 flex items-center gap-2 text-sm">
            <Link to="/" className="text-gray-600 hover:text-blue-600">الرئيسية</Link>
            <span className="text-gray-400">/</span>
            <Link to="/cars" className="text-gray-600 hover:text-blue-600">السيارات</Link>
            <span className="text-gray-400">/</span>
            <span className="text-gray-900">{car.make} {car.model}</span>
          </nav>

          {/* Action Buttons */}
          <div className="flex gap-4 mb-6">
            <Link to="/cars">
              <Button variant="outline">
                <ArrowLeft className="ml-2" size={20} />
                العودة
              </Button>
            </Link>
            <Button
              variant="outline"
              onClick={() => setIsShareOpen(true)}
            >
              <Share2 className="ml-2" size={20} />
              مشاركة
            </Button>
            <Button
              variant="outline"
              onClick={toggleFavorite}
              className={isFavorite ? 'text-red-600 border-red-600' : ''}
            >
              <Heart
                className="ml-2"
                size={20}
                fill={isFavorite ? 'currentColor' : 'none'}
              />
              {isFavorite ? 'إزالة من المفضلة' : 'إضافة للمفضلة'}
            </Button>
          </div>

          {/* Main Content */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column - Car Details */}
            <div className="lg:col-span-2 space-y-6">
              {/* Image Gallery */}
              <ImageGallery images={car.images} />

              {/* Car Info */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">
                      {car.make} {car.model}
                    </h1>
                    <p className="text-gray-600">{car.year} - {car.mileage.toLocaleString('ar-EG')} كم</p>
                  </div>
                  <div className="text-left">
                    <div className="text-3xl font-bold text-blue-600">
                      {car.price.toLocaleString('ar-EG')} ج.م
                    </div>
                    {car.negotiable && (
                      <span className="text-sm text-gray-600">قابل للتفاوض</span>
                    )}
                  </div>
                </div>

                {/* Features */}
                <CarFeatures car={car} />
              </div>

              {/* Specifications */}
              <CarSpecifications car={car} />

              {/* Description */}
              {car.description && (
                <div className="bg-white rounded-lg shadow-md p-6">
                  <h2 className="text-xl font-bold text-gray-900 mb-4">الوصف</h2>
                  <p className="text-gray-700 leading-relaxed">{car.description}</p>
                </div>
              )}
            </div>

            {/* Right Column - Actions & Calculator */}
            <div className="space-y-6">
              {/* Contact Card */}
              <div className="bg-white rounded-lg shadow-md p-6 sticky top-24">
                <h3 className="text-lg font-bold text-gray-900 mb-4">تواصل مع البائع</h3>
                
                <div className="space-y-3">
                  <a href={`tel:${car.seller.phone}`} className="block">
                    <Button className="w-full" size="lg">
                      <Phone className="ml-2" size={20} />
                      اتصال مباشر
                    </Button>
                  </a>
                  
                  <a 
                    href={`https://wa.me/${car.seller.whatsapp}?text=مرحباً، أنا مهتم بـ ${car.make} ${car.model}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block"
                  >
                    <Button className="w-full bg-green-600 hover:bg-green-700" size="lg">
                      <MessageCircle className="ml-2" size={20} />
                      واتساب
                    </Button>
                  </a>
                </div>

                <div className="mt-6 pt-6 border-t border-gray-200">
                  <div className="flex items-center gap-3">
                    <img
                      src={car.seller.avatar}
                      alt={car.seller.name}
                      className="w-12 h-12 rounded-full"
                    />
                    <div>
                      <p className="font-semibold text-gray-900">{car.seller.name}</p>
                      <p className="text-sm text-gray-600">{car.seller.location}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Price Calculator */}
              <CarPriceCalculator car={car} />
            </div>
          </div>

          {/* Similar Cars */}
          <SimilarCars currentCar={car} />
        </div>

        {/* Share Dialog */}
        <ShareDialog
          isOpen={isShareOpen}
          onClose={() => setIsShareOpen(false)}
          url={window.location.href}
          title={`${car.make} ${car.model} ${car.year}`}
        />
      </div>
    </>
  );
}