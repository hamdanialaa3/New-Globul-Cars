import { logger } from '../../../services/logger-service';
// src/pages/DealerPublicPage/index.tsx
// Public Dealer Profile Page (SEO-friendly)

import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import styled from 'styled-components';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { doc, getDoc, collection, query, where, getDocs, limit } from 'firebase/firestore';
import { db } from '../../../firebase/firebase-config';
import ReviewStars from '../../../features/reviews/ReviewStars';
import ContactForm from './ContactForm';

interface DealerProfile {
  id: string;
  displayName: string;
  businessName?: string;
  profileType: 'dealer' | 'company';
  description?: string;
  photoURL?: string;
  location?: string;
  phoneNumber?: string;
  email?: string;
  isVerified: boolean;
  trustScore: number;
  trustLevel: string;
  averageRating: number;
  totalReviews: number;
  createdAt: any;
}

interface Listing {
  id: string;
  make: string;
  model: string;
  year: number;
  price: number;
  mileage: number;
  images: string[];
  status: string;
}

const DealerPublicPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const functions = getFunctions();

  const [dealer, setDealer] = useState<DealerProfile | null>(null);
  const [listings, setListings] = useState<Listing[]>([]);
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadListings = React.useCallback(async (dealerId: string) => {
    try {
      const listingsQuery = query(
        collection(db, 'cars'),
        where('sellerId', '==', dealerId),
        where('status', '==', 'active'),
        limit(12)
      );

      const listingsSnapshot = await getDocs(listingsQuery);
      const listingsData = listingsSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Listing[];

      setListings(listingsData);
    } catch (err) {
      logger.error('Error loading dealer listings:', err);
    }
  }, []);

  const loadReviews = React.useCallback(async (dealerId: string) => {
    try {
      const getReviews = httpsCallable(functions, 'getReviews');
      const result: Record<string, unknown> = await getReviews({
        targetUserId: dealerId,
        sortBy: 'recent',
        page: 1,
        limit: 10,
      });

      setReviews(result.data.reviews || []);
    } catch (err) {
      logger.error('Error loading reviews:', err);
    }
  }, [functions]);

  const loadDealerData = React.useCallback(async () => {
    if (!slug) return;

    setLoading(true);
    setError(null);

    try {
      // Find dealer by slug or ID
      const dealerDoc = await getDoc(doc(db, 'users', slug));

      if (!dealerDoc.exists()) {
        setError('Dealer not found');
        setLoading(false);
        return;
      }

      const dealerData = dealerDoc.data();

      // Only show dealers and companies
      if (!['dealer', 'company'].includes(dealerData.profileType)) {
        setError('Invalid profile type');
        setLoading(false);
        return;
      }

      setDealer({
        id: dealerDoc.id,
        ...dealerData,
      } as DealerProfile);

      // Load listings
      await loadListings(dealerDoc.id);

      // Load reviews
      await loadReviews(dealerDoc.id);

      setLoading(false);
    } catch (err: any) {
      logger.error('Error loading dealer:', err);
      setError(err.message);
      setLoading(false);
    }
  }, [slug, loadListings, loadReviews]);

  useEffect(() => {
    loadDealerData();
  }, [loadDealerData]);

  if (loading) {
    return (
      <LoadingContainer>
        <Spinner />
        <p>Loading dealer profile...</p>
      </LoadingContainer>
    );
  }

  if (error || !dealer) {
    return (
      <ErrorContainer>
        <h2>❌ {error || 'Dealer not found'}</h2>
        <button onClick={() => navigate('/')}>Go Home</button>
      </ErrorContainer>
    );
  }

  // SEO metadata
  const pageTitle = `${dealer.businessName || dealer.displayName} - Koli One`;
  const pageDescription = dealer.description || `Browse cars from ${dealer.businessName || dealer.displayName}`;
  const pageImage = dealer.photoURL || '/koli-one.png';

  return (
    <>
      <Helmet>
        <title>{pageTitle}</title>
        <meta name="description" content={pageDescription} />
        <meta property="og:title" content={pageTitle} />
        <meta property="og:description" content={pageDescription} />
        <meta property="og:image" content={pageImage} />
        <meta property="og:type" content="profile" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={pageTitle} />
        <meta name="twitter:description" content={pageDescription} />
        <meta name="twitter:image" content={pageImage} />
      </Helmet>

      <Container>
        {/* Hero Section */}
        <HeroSection>
          <ProfileImage src={dealer.photoURL || '/koli-one.png'} alt={dealer.displayName} />
          <ProfileInfo>
            <NameContainer>
              <h1>{dealer.businessName || dealer.displayName}</h1>
              {dealer.isVerified && <VerifiedBadge>✓ Verified</VerifiedBadge>}
            </NameContainer>

            <ProfileType>{dealer.profileType === 'dealer' ? 'Dealer' : '🏢 Company'}</ProfileType>

            {dealer.location && <Location>📍 {dealer.location}</Location>}

            {dealer.averageRating > 0 && (
              <RatingContainer>
                <ReviewStars rating={dealer.averageRating} showCount count={dealer.totalReviews} />
              </RatingContainer>
            )}

            {dealer.trustScore > 0 && (
              <TrustScoreBadge level={dealer.trustLevel}>
                Trust Score: {dealer.trustScore}/100
              </TrustScoreBadge>
            )}

            {dealer.description && <Description>{dealer.description}</Description>}
          </ProfileInfo>
        </HeroSection>

        {/* Active Listings */}
        <Section>
          <SectionTitle>
            <h2>Active Listings ({listings.length})</h2>
          </SectionTitle>

          {listings.length > 0 ? (
            <ListingsGrid>
              {listings.map((listing) => (
                <ListingCard key={listing.id} onClick={() => navigate(`/cars/${listing.id}`)}>
                  <ListingImage
                    src={listing.images[0] || '/default-car.jpg'}
                    alt={`${listing.make} ${listing.model}`}
                  />
                  <ListingInfo>
                    <h3>
                      {listing.make} {listing.model}
                    </h3>
                    <ListingDetails>
                      <span>{listing.year}</span>
                      <span>•</span>
                      <span>{listing.mileage.toLocaleString()} km</span>
                    </ListingDetails>
                    <ListingPrice>{listing.price.toLocaleString()} лв</ListingPrice>
                  </ListingInfo>
                </ListingCard>
              ))}
            </ListingsGrid>
          ) : (
            <EmptyState>No active listings at the moment</EmptyState>
          )}
        </Section>

        {/* Reviews Section */}
        {reviews.length > 0 && (
          <Section>
            <SectionTitle>
              <h2>⭐ Customer Reviews ({reviews.length})</h2>
            </SectionTitle>

            <ReviewsList>
              {reviews.map((review) => (
                <ReviewCard key={review.id}>
                  <ReviewHeader>
                    <ReviewerName>{review.reviewerName}</ReviewerName>
                    <ReviewStars rating={review.overallRating} size="small" />
                  </ReviewHeader>
                  <ReviewTitle>{review.title}</ReviewTitle>
                  <ReviewComment>{review.comment}</ReviewComment>
                  {review.verified && <VerifiedPurchase>✓ Verified Purchase</VerifiedPurchase>}
                  <ReviewDate>
                    {new Date(review.createdAt?.seconds * 1000).toLocaleDateString()}
                  </ReviewDate>
                </ReviewCard>
              ))}
            </ReviewsList>
          </Section>
        )}

        {/* Contact Form */}
        <Section>
          <SectionTitle>
            <h2>📧 Contact {dealer.businessName || dealer.displayName}</h2>
          </SectionTitle>
          <ContactForm dealerId={dealer.id} dealerName={dealer.businessName || dealer.displayName} />
        </Section>
      </Container>
    </>
  );
};

export default DealerPublicPage;

// Styled Components

const Container = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
`;

const LoadingContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 400px;
  gap: 20px;
`;

const Spinner = styled.div`
  width: 50px;
  height: 50px;
  border: 4px solid #f3f3f3;
  border-top: 4px solid #3498db;
  border-radius: 50%;
  animation: spin 1s linear infinite;

  @keyframes spin {
    0% {
      transform: rotate(0deg);
    }
    100% {
      transform: rotate(360deg);
    }
  }
`;

const ErrorContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 400px;
  gap: 20px;

  button {
    padding: 10px 20px;
    background: #3498db;
    color: white;
    border: none;
    border-radius: 5px;
    cursor: pointer;
    font-size: 16px;

    &:hover {
      background: #2980b9;
    }
  }
`;

const HeroSection = styled.div`
  display: flex;
  gap: 30px;
  margin-bottom: 40px;
  padding: 30px;
  background: white;
  border-radius: 10px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);

  @media (max-width: 768px) {
    flex-direction: column;
    align-items: center;
    text-align: center;
  }
`;

const ProfileImage = styled.img`
  width: 200px;
  height: 200px;
  border-radius: 10px;
  object-fit: cover;
`;

const ProfileInfo = styled.div`
  flex: 1;
`;

const NameContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 10px;

  h1 {
    margin: 0;
    font-size: 32px;
    color: #333;
  }
`;

const VerifiedBadge = styled.span`
  background: #4caf50;
  color: white;
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 14px;
  font-weight: 600;
`;

const ProfileType = styled.div`
  font-size: 18px;
  color: #666;
  margin-bottom: 10px;
`;

const Location = styled.div`
  font-size: 16px;
  color: #666;
  margin-bottom: 10px;
`;

const RatingContainer = styled.div`
  margin: 15px 0;
`;

const TrustScoreBadge = styled.div<{ level: string }>`
  display: inline-block;
  padding: 8px 16px;
  border-radius: 20px;
  font-weight: 600;
  font-size: 14px;
  margin: 10px 0;
  background: ${(props) =>
    props.level === 'elite'
      ? '#FFD700'
      : props.level === 'expert'
      ? '#FF9800'
      : props.level === 'advanced'
      ? '#9C27B0'
      : props.level === 'intermediate'
      ? '#2196F3'
      : '#9E9E9E'};
  color: white;
`;

const Description = styled.p`
  font-size: 16px;
  line-height: 1.6;
  color: #555;
  margin-top: 15px;
`;

const Section = styled.section`
  margin-bottom: 40px;
`;

const SectionTitle = styled.div`
  margin-bottom: 20px;

  h2 {
    font-size: 24px;
    color: #333;
  }
`;

const ListingsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 20px;
`;

const ListingCard = styled.div`
  background: white;
  border-radius: 10px;
  overflow: hidden;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  cursor: pointer;
  transition: transform 0.3s;

  &:hover {
    transform: translateY(-5px);
  }
`;

const ListingImage = styled.img`
  width: 100%;
  height: 200px;
  object-fit: cover;
`;

const ListingInfo = styled.div`
  padding: 15px;

  h3 {
    margin: 0 0 10px 0;
    font-size: 18px;
    color: #333;
  }
`;

const ListingDetails = styled.div`
  display: flex;
  gap: 8px;
  font-size: 14px;
  color: #666;
  margin-bottom: 10px;
`;

const ListingPrice = styled.div`
  font-size: 20px;
  font-weight: 600;
  color: #4caf50;
`;

const ReviewsList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 15px;
`;

const ReviewCard = styled.div`
  background: white;
  padding: 20px;
  border-radius: 10px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
`;

const ReviewHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
`;

const ReviewerName = styled.span`
  font-weight: 600;
  color: #333;
`;

const ReviewTitle = styled.h4`
  margin: 10px 0;
  font-size: 16px;
  color: #333;
`;

const ReviewComment = styled.p`
  font-size: 14px;
  line-height: 1.6;
  color: #555;
  margin: 10px 0;
`;

const VerifiedPurchase = styled.span`
  display: inline-block;
  background: #4caf50;
  color: white;
  padding: 2px 8px;
  border-radius: 10px;
  font-size: 12px;
  margin: 10px 0;
`;

const ReviewDate = styled.div`
  font-size: 12px;
  color: #999;
  margin-top: 10px;
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 60px 20px;
  color: #999;
  font-size: 18px;
`;
