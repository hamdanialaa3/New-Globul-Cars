import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { CarCard } from '../../components/CarCard';
import { ContactSection } from '../../components/ContactSection';
import { FinanceCalculator } from '../../components/FinanceCalculator';
import { ShareButtons } from '../../components/ShareButtons';
import { ImageGallery } from '../../components/ImageGallery';
import { SpecificationsTable } from '../../components/SpecificationsTable';
import { RelatedCars } from '../../components/RelatedCars';
import { LoadingSpinner } from '../../components/LoadingSpinner';
import { ErrorMessage } from '../../components/ErrorMessage';
import { CarSEO } from '../../components/SEO/CarSEO';
import { getCar, getRelatedCars } from '../../services/api';
import type { Car } from '../../types';
import './CarDetailsPage.css';

export function CarDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [car, setCar] = useState<Car | null>(null);
  const [relatedCars, setRelatedCars] = useState<Car[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCarData = async () => {
      if (!id) {
        setError('Invalid car ID');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const [carData, related] = await Promise.all([
          getCar(id),
          getRelatedCars(id),
        ]);
        setCar(carData);
        setRelatedCars(related);
        setError(null);
      } catch (err) {
        setError('Failed to load car details');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchCarData();
  }, [id]);

  if (loading) {
    return <LoadingSpinner />;
  }

  if (error || !car) {
    return (
      <ErrorMessage
        message={error || 'Car not found'}
        onRetry={() => window.location.reload()}
      />
    );
  }

  return (
    <>
      <CarSEO car={car} />
      <div className="car-details-page">
        <button className="back-button" onClick={() => navigate(-1)}>
          ← Back to Results
        </button>

        <div className="car-details-container">
          <ImageGallery images={car.images} alt={`${car.make} ${car.model}`} />

          <div className="car-info-section">
            <h1 className="car-title">
              {car.year} {car.make} {car.model}
            </h1>
            <p className="car-price">${car.price.toLocaleString()}</p>

            <SpecificationsTable car={car} />

            <ShareButtons
              url={window.location.href}
              title={`${car.year} ${car.make} ${car.model}`}
            />
          </div>
        </div>

        <FinanceCalculator carPrice={car.price} />

        <ContactSection carDetails={car} />

        {relatedCars.length > 0 && (
          <RelatedCars cars={relatedCars} currentCarId={car.id} />
        )}
      </div>
    </>
  );
}