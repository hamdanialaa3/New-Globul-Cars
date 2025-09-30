// src/pages/MyListingsPage/ListingsGrid.tsx
// Listings grid component for MyListingsPage

import React from 'react';
import { Link } from 'react-router-dom';
import { MyListing } from './types';
import { SectionContainer, ListingsGrid, ListingCard, ListingImage, ListingInfo, ActionButton, EmptyState, LoadingState } from './styles';

interface ListingsGridProps {
  listings: MyListing[];
  loading: boolean;
  onEdit: (listingId: string) => void;
  onDelete: (listingId: string) => void;
  onToggleFeature: (listingId: string) => void;
}

const ListingsGridComponent: React.FC<ListingsGridProps> = ({
  listings,
  loading,
  onEdit,
  onDelete,
  onToggleFeature
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
          <ListingCard key={listing.id}>
            <ListingImage>
              <div className={`status-badge ${listing.status}`}>
                {listing.status}
              </div>
              🚗
            </ListingImage>

            <ListingInfo>
              <Link to={`/car/${listing.id}`} className="title">
                {listing.title}
              </Link>

              <div className="price">
                €{listing.price.toLocaleString()}
              </div>

              <div className="details">
                <div className="detail-item">
                  <span>👁️</span>
                  {listing.views}
                </div>
                <div className="detail-item">
                  <span>💬</span>
                  {listing.inquiries}
                </div>
                <div className="detail-item">
                  <span>📍</span>
                  {listing.location}
                </div>
                <div className="detail-item">
                  <span>⭐</span>
                  {listing.featured ? 'Featured' : 'Standard'}
                </div>
              </div>

              <div className="actions">
                <ActionButton
                  className="view"
                  onClick={() => window.open(`/car/${listing.id}`, '_blank')}
                >
                  View
                </ActionButton>

                <ActionButton
                  className="edit"
                  onClick={() => onEdit(listing.id)}
                >
                  Edit
                </ActionButton>

                <ActionButton
                  className="feature"
                  onClick={() => onToggleFeature(listing.id)}
                >
                  {listing.featured ? 'Unfeature' : 'Feature'}
                </ActionButton>

                <ActionButton
                  className="delete"
                  onClick={() => onDelete(listing.id)}
                >
                  Delete
                </ActionButton>
              </div>
            </ListingInfo>
          </ListingCard>
        ))}
      </ListingsGrid>
    </SectionContainer>
  );
};

export default ListingsGridComponent;