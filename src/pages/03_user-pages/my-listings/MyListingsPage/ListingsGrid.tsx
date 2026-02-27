// src/pages/MyListingsPage/ListingsGrid.tsx
// Listings grid component for MyListingsPage

import React from 'react';
import { Link } from 'react-router-dom';
import { MyListing } from './types';
import { SectionContainer, ListingsGrid, CardContainer, ListingCard, ListingImage, ListingInfo, ActionButton, ActionBar, EmptyState, LoadingState } from './styles';
import { CarIcon } from '../../../../components/icons/CarIcon';
import { getCarDetailsUrl } from '../../../../utils/routing-utils';

interface ListingsGridProps {
  listings: MyListing[];
  loading: boolean;
  onEdit: (listingId: string) => void;
  onDelete: (listingId: string) => void;
  onToggleFeature: (listingId: string) => void;
  onStatusChange?: (listingId: string, status: string) => void;
}

const ListingsGridComponent: React.FC<ListingsGridProps> = ({
  listings,
  loading,
  onEdit,
  onDelete,
  onToggleFeature,
  onStatusChange
}) => {
  if (loading) {
    return (
      <SectionContainer>
        <LoadingState>
          <div className="spinner">⏳</div>
          <p>Loading your listings...</p>
        </LoadingState>
      </SectionContainer>
    );
  }

  if (listings.length === 0) {
    return (
      <SectionContainer>
        <EmptyState>
          <div className="icon">📋</div>
          <h3>No listings found</h3>
          <p>You haven't created any car listings yet.</p>
          <Link to="/sell-car">
            <ActionButton className="edit">Create Your First Listing</ActionButton>
          </Link>
        </EmptyState>
      </SectionContainer>
    );
  }

  return (
    <SectionContainer>
      <ListingsGrid>
        {listings.map((listing) => (
          <CardContainer key={listing.id}>
            <ListingCard>
              <ListingImage>
                <div className={`status-badge ${listing.status}`}>
                  {listing.status}
                </div>
                {listing.featured && <div className="featured-badge">⭐ Featured</div>}
                {listing.isUrgent && <div className="urgent-badge">🔥 Urgent</div>}
                <div className="image-placeholder">
                  {listing.media.images.length > 0 ? (
                    <img src={listing.media.images[0]} alt={listing.title} loading="lazy" width={120} height={80} />
                  ) : (
                    <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
                      <CarIcon size={48} color="#FF7900" />
                    </span>
                  )}
                  {listing.media.images.length > 1 && (
                    <div className="image-count">+{listing.media.images.length - 1}</div>
                  )}
                  {listing.media.hasVideo && <div className="video-indicator">🎥</div>}
                </div>
              </ListingImage>

              <ListingInfo>
                <Link 
                  to={getCarDetailsUrl({
                    sellerNumericId: (listing as any).sellerNumericId,
                    carNumericId: (listing as any).carNumericId,
                    id: listing.id
                  })} 
                  className="title"
                >
                  {listing.title}
                </Link>

                <div className="price">
                  €{listing.price.toLocaleString()}
                </div>

                <div className="vehicle-details">
                  <div className="detail-row">
                    <span>📅</span>
                    <span>{listing.vehicle.year}</span>
                    <span>•</span>
                    <span>🛣️</span>
                    <span>{listing.vehicle.mileage.toLocaleString()} km</span>
                  </div>
                  <div className="detail-row">
                    <span>⛽</span>
                    <span>{listing.vehicle.fuelType}</span>
                    <span>•</span>
                    <span>⚙️</span>
                    <span>{listing.vehicle.transmission}</span>
                  </div>
                  <div className="detail-row">
                    <span>🚪</span>
                    <span>{listing.vehicle.doors} doors</span>
                    <span>•</span>
                    <span>👥</span>
                    <span>{listing.vehicle.seats} seats</span>
                  </div>
                </div>

                <div className="equipment-summary">
                  <div className="equipment-category">
                    <span>🛡️ Safety:</span>
                    <span>{listing.equipment.safety.length} features</span>
                  </div>
                  <div className="equipment-category">
                    <span>✨ Comfort:</span>
                    <span>{listing.equipment.comfort.length} features</span>
                  </div>
                  <div className="equipment-category">
                    <span>🎵 Infotainment:</span>
                    <span>{listing.equipment.infotainment.length} features</span>
                  </div>
                  <div className="equipment-category">
                    <span>⚡ Extras:</span>
                    <span>{listing.equipment.extras.length} features</span>
                  </div>
                </div>

                <div className="location-info">
                  <span>📍</span>
                  <span>{listing.locationData?.cityNameName.bg}, {listing.location.region}</span>
                </div>

                <div className="contact-info">
                  <span>👤</span>
                  <span>{listing.contact.sellerName}</span>
                  <span className="seller-type">
                    {listing.contact.sellerType === 'dealer' ? '🏢 Dealer' : '👤 Private'}
                  </span>
                </div>

                <div className="stats">
                  <div className="stat-item">
                    <span>👁️</span>
                    <span>{listing.views}</span>
                  </div>
                  <div className="stat-item">
                    <span>💬</span>
                    <span>{listing.inquiries}</span>
                  </div>
                  <div className="stat-item">
                    <span>❤️</span>
                    <span>{listing.favorites}</span>
                  </div>
                  <div className="stat-item">
                    <span>📅</span>
                    <span>{listing.createdAt.toLocaleDateString()}</span>
                  </div>
                </div>

                {listing.description && (
                  <div className="description">
                    {listing.description.length > 100 
                      ? `${listing.description.substring(0, 100)}...`
                      : listing.description
                    }
                  </div>
                )}
              </ListingInfo>
            </ListingCard>

            <ActionBar>
              <ActionButton
                className="view"
                onClick={() => window.open(
                  getCarDetailsUrl({
                    sellerNumericId: (listing as any).sellerNumericId,
                    carNumericId: (listing as any).carNumericId,
                    id: listing.id
                  }), 
                  '_blank'
                )}
                title="View Listing"
              >
                👁️
              </ActionButton>

              <ActionButton
                className="edit"
                onClick={() => onEdit(listing.id)}
                title="Edit Listing"
              >
                ✏️
              </ActionButton>

              <ActionButton
                className="status"
                onClick={() => {
                  const newStatus = listing.status === 'active' ? 'inactive' : 'active';
                  onStatusChange && onStatusChange(listing.id, newStatus);
                }}
                title={listing.status === 'active' ? 'Deactivate' : 'Activate'}
              >
                {listing.status === 'active' ? '⏸️' : '▶️'}
              </ActionButton>

              <ActionButton
                className="feature"
                onClick={() => onToggleFeature(listing.id)}
                title={listing.featured ? 'Remove from Featured' : 'Make Featured'}
              >
                {listing.featured ? '⭐' : '☆'}
              </ActionButton>

              <ActionButton
                className="delete"
                onClick={() => onDelete(listing.id)}
                title="Delete Listing"
              >
                🗑️
              </ActionButton>
            </ActionBar>
          </CardContainer>
        ))}
      </ListingsGrid>
    </SectionContainer>
  );
};

export default ListingsGridComponent;