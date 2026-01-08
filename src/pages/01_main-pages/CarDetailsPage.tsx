import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Container, Row, Col, Button, Badge } from 'react-bootstrap';
import { FaArrowLeft, FaHeart, FaRegHeart, FaPhone, FaEnvelope, FaMapMarkerAlt } from 'react-icons/fa';
import { useFavorites } from '../../context/FavoritesContext';
import { Car } from '../../types/car';
import { getCars } from '../../services/api';
import { formatPrice } from '../../utils/price-rating';
import './CarDetailsPage.css';

const CarDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { favorites, addFavorite, removeFavorite } = useFavorites();
  const [car, setCar] = useState<Car | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);

  useEffect(() => {
    const fetchCar = async () => {
      try {
        const cars = await getCars();
        const foundCar = cars.find(c => c.id === Number(id));
        if (foundCar) {
          setCar(foundCar);
        }
      } catch (error) {
        console.error('Error fetching car:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCar();
  }, [id]);

  if (loading) {
    return (
      <Container className="my-5 text-center">
        <div className="spinner-border" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </Container>
    );
  }

  if (!car) {
    return (
      <Container className="my-5 text-center">
        <h2>Car not found</h2>
        <Button onClick={() => navigate('/')} className="mt-3">
          <FaArrowLeft className="me-2" />
          Back to Home
        </Button>
      </Container>
    );
  }

  const isFavorite = favorites.some(fav => fav.id === car.id);

  const handleFavoriteToggle = () => {
    if (isFavorite) {
      removeFavorite(car.id);
    } else {
      addFavorite(car);
    }
  };

  return (
    <Container className="car-details-page my-5">
      <Button 
        variant="outline-secondary" 
        onClick={() => navigate(-1)}
        className="mb-4"
      >
        <FaArrowLeft className="me-2" />
        Back
      </Button>

      <Row>
        <Col lg={8}>
          <div className="main-image-container mb-3">
            <img
              src={car.images[selectedImage]}
              alt={`${car.make} ${car.model}`}
              className="img-fluid rounded"
            />
            <Button
              variant="light"
              className="favorite-btn"
              onClick={handleFavoriteToggle}
            >
              {isFavorite ? <FaHeart color="red" /> : <FaRegHeart />}
            </Button>
          </div>

          <div className="image-thumbnails d-flex gap-2 mb-4">
            {car.images.map((image, index) => (
              <img
                key={index}
                src={image}
                alt={`Thumbnail ${index + 1}`}
                className={`thumbnail ${selectedImage === index ? 'active' : ''}`}
                onClick={() => setSelectedImage(index)}
              />
            ))}
          </div>

          <div className="car-description mb-4">
            <h3>Description</h3>
            <p>{car.description}</p>
          </div>

          <div className="car-features mb-4">
            <h3>Features</h3>
            <Row>
              {car.features.map((feature, index) => (
                <Col md={6} key={index} className="mb-2">
                  <Badge bg="secondary" className="w-100 text-start p-2">
                    {feature}
                  </Badge>
                </Col>
              ))}
            </Row>
          </div>
        </Col>

        <Col lg={4}>
          <div className="car-info-card p-4 rounded shadow-sm">
            <h2 className="mb-3">{car.make} {car.model}</h2>
            <h3 className="text-primary mb-4">{formatPrice(car.price)}</h3>

            <div className="specs mb-4">
              <div className="spec-item d-flex justify-content-between mb-2">
                <span className="text-muted">Year:</span>
                <strong>{car.year}</strong>
              </div>
              <div className="spec-item d-flex justify-content-between mb-2">
                <span className="text-muted">Mileage:</span>
                <strong>{car.mileage.toLocaleString()} km</strong>
              </div>
              <div className="spec-item d-flex justify-content-between mb-2">
                <span className="text-muted">Transmission:</span>
                <strong>{car.transmission}</strong>
              </div>
              <div className="spec-item d-flex justify-content-between mb-2">
                <span className="text-muted">Fuel Type:</span>
                <strong>{car.fuelType}</strong>
              </div>
              <div className="spec-item d-flex justify-content-between mb-2">
                <span className="text-muted">Color:</span>
                <strong>{car.color}</strong>
              </div>
              <div className="spec-item d-flex justify-content-between mb-2">
                <span className="text-muted">Body Type:</span>
                <strong>{car.bodyType}</strong>
              </div>
            </div>

            <div className="seller-info mb-4">
              <h5 className="mb-3">Seller Information</h5>
              <div className="d-flex align-items-center mb-2">
                <FaMapMarkerAlt className="me-2 text-muted" />
                <span>{car.location}</span>
              </div>
              <div className="d-flex align-items-center mb-2">
                <FaPhone className="me-2 text-muted" />
                <span>+1 (555) 123-4567</span>
              </div>
              <div className="d-flex align-items-center mb-2">
                <FaEnvelope className="me-2 text-muted" />
                <span>contact@globalcars.com</span>
              </div>
            </div>

            <Button variant="primary" size="lg" className="w-100 mb-2">
              <FaPhone className="me-2" />
              Contact Seller
            </Button>
            <Button variant="outline-primary" size="lg" className="w-100">
              <FaEnvelope className="me-2" />
              Send Message
            </Button>
          </div>
        </Col>
      </Row>
    </Container>
  );
};

export default CarDetailsPage;