// src/pages/MyListingsPage/styles.ts
// Shared styled-components for MyListingsPage

import styled from 'styled-components';

export const MyListingsContainer = styled.div`
  min-height: 100vh;
  background-image: url('/assets/backgrounds/metal-bg-4.jpg');
  background-size: cover;
  background-position: center;
  background-attachment: fixed;
  background-repeat: no-repeat;
  padding: 2rem 0;
  position: relative;
  filter: blur(0.5px);
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(248, 249, 250, 0.7);
    z-index: 0;
  }
`;

export const SectionContainer = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1rem;
  position: relative;
  z-index: 1;
`;

export const SectionHeader = styled.div`
  text-align: center;
  margin-bottom: 3rem;

  h1 {
    font-size: 2.5rem;
    font-weight: bold;
    color: #005ca9;
    margin-bottom: 0.5rem;
  }

  p {
    font-size: 1.1rem;
    color: #6c757d;
    margin-bottom: 2rem;
    max-width: 600px;
    margin: 0 auto 2rem;
  }
`;

export const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
  margin-bottom: 3rem;
`;

export const StatCard = styled.div`
  background: white;
  padding: 2rem;
  border-radius: 1rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  text-align: center;
  transition: transform 0.3s ease, box-shadow 0.3s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 15px rgba(0, 0, 0, 0.2);
  }

  .icon {
    font-size: 2.5rem;
    color: #005ca9;
    margin-bottom: 1rem;
  }

  .value {
    font-size: 2rem;
    font-weight: bold;
    color: #005ca9;
    margin-bottom: 0.5rem;
  }

  .label {
    color: #6c757d;
    font-size: 0.9rem;
  }
`;

export const FiltersBar = styled.div`
  background: white;
  padding: 1.5rem;
  border-radius: 1rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  margin-bottom: 2rem;
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  align-items: center;

  .filter-group {
    display: flex;
    align-items: center;
    gap: 0.5rem;

    label {
      font-weight: 500;
      color: #495057;
    }

    select, input {
      padding: 0.5rem;
      border: 1px solid #dee2e6;
      border-radius: 0.5rem;
      font-size: 0.9rem;
    }
  }
`;

export const ListingsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 2rem;
`;

export const CardContainer = styled.div`
  display: flex;
  flex-direction: column;
  background: white;
  border-radius: 1rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  transition: transform 0.3s ease, box-shadow 0.3s ease;

  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 8px 15px rgba(0, 0, 0, 0.2);
  }
`;

export const ListingCard = styled.div`
  display: flex;
  flex-direction: column;
  height: 600px;
`;

export const ActionBar = styled.div`
  display: flex;
  gap: 0.5rem;
  padding: 1rem;
  background: #f8f9fa;
  border-top: 1px solid #e9ecef;
  justify-content: center;
`;

export const ListingImage = styled.div`
  height: 200px;
  background: linear-gradient(135deg, #f0f0f0 0%, #e0e0e0 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 3rem;
  color: #ccc;
  position: relative;
  overflow: hidden;

  .status-badge {
    position: absolute;
    top: 1rem;
    right: 1rem;
    padding: 0.25rem 0.75rem;
    border-radius: 1rem;
    font-size: 0.8rem;
    font-weight: bold;
    text-transform: uppercase;
    z-index: 2;

    &.active {
      background: #28a745;
      color: white;
    }

    &.sold {
      background: #6c757d;
      color: white;
    }

    &.pending {
      background: #ffc107;
      color: #212529;
    }

    &.inactive {
      background: #dc3545;
      color: white;
    }
  }

  .featured-badge {
    position: absolute;
    top: 1rem;
    left: 1rem;
    background: #ffc107;
    color: #212529;
    padding: 0.25rem 0.5rem;
    border-radius: 0.5rem;
    font-size: 0.7rem;
    font-weight: bold;
    z-index: 2;
  }

  .urgent-badge {
    position: absolute;
    top: 3rem;
    left: 1rem;
    background: #dc3545;
    color: white;
    padding: 0.25rem 0.5rem;
    border-radius: 0.5rem;
    font-size: 0.7rem;
    font-weight: bold;
    z-index: 2;
  }

  .image-placeholder {
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    position: relative;

    img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .image-count {
      position: absolute;
      bottom: 0.5rem;
      right: 0.5rem;
      background: rgba(0, 0, 0, 0.7);
      color: white;
      padding: 0.25rem 0.5rem;
      border-radius: 0.5rem;
      font-size: 0.7rem;
      font-weight: bold;
    }

    .video-indicator {
      position: absolute;
      bottom: 0.5rem;
      left: 0.5rem;
      background: rgba(220, 53, 69, 0.9);
      color: white;
      padding: 0.25rem 0.5rem;
      border-radius: 0.5rem;
      font-size: 0.7rem;
      font-weight: bold;
    }
  }
`;

export const ListingInfo = styled.div`
  padding: 1.5rem;
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  overflow-y: auto;

  .title {
    font-size: 1.25rem;
    font-weight: bold;
    color: #005ca9;
    margin-bottom: 0.5rem;
    display: block;
    text-decoration: none;
    
    &:hover {
      text-decoration: underline;
    }
  }

  .price {
    font-size: 1.5rem;
    font-weight: bold;
    color: #28a745;
    margin-bottom: 1rem;
  }

  .vehicle-details {
    margin-bottom: 1rem;
    
    .detail-row {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      font-size: 0.9rem;
      color: #6c757d;
      margin-bottom: 0.25rem;
    }
  }

  .equipment-summary {
    margin-bottom: 1rem;
    padding: 0.75rem;
    background: #f8f9fa;
    border-radius: 0.5rem;
    
    .equipment-category {
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 0.8rem;
      color: #495057;
      margin-bottom: 0.25rem;
    }
  }

  .location-info {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-size: 0.9rem;
    color: #6c757d;
    margin-bottom: 0.5rem;
  }

  .contact-info {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-size: 0.9rem;
    color: #495057;
    margin-bottom: 1rem;
    
    .seller-type {
      margin-left: auto;
      font-size: 0.8rem;
      padding: 0.25rem 0.5rem;
      border-radius: 0.25rem;
      background: #e9ecef;
    }
  }

  .stats {
    display: flex;
    justify-content: space-between;
    margin-bottom: 1rem;
    font-size: 0.8rem;
    color: #6c757d;
    
    .stat-item {
      display: flex;
      align-items: center;
      gap: 0.25rem;
    }
  }

  .description {
    font-size: 0.9rem;
    color: #6c757d;
    line-height: 1.4;
    font-style: italic;
  }
`;

export const ActionButton = styled.button`
  width: 32px;
  height: 32px;
  border: none;
  border-radius: 50%;
  font-size: 0.8rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;

  &.edit {
    background: #005ca9;
    color: white;

    &:hover {
      background: #004080;
      transform: translateY(-1px);
    }
  }

  &.delete {
    background: #dc3545;
    color: white;

    &:hover {
      background: #c82333;
      transform: translateY(-1px);
    }
  }

  &.view {
    background: #6c757d;
    color: white;

    &:hover {
      background: #5a6268;
      transform: translateY(-1px);
    }
  }

  &.feature {
    background: #ffc107;
    color: #212529;

    &:hover {
      background: #e0a800;
      transform: translateY(-1px);
    }
  }
`;

export const EmptyState = styled.div`
  text-align: center;
  padding: 4rem 2rem;
  color: #6c757d;

  .icon {
    font-size: 4rem;
    margin-bottom: 1rem;
    opacity: 0.5;
  }

  h3 {
    font-size: 1.5rem;
    margin-bottom: 1rem;
    color: #495057;
  }

  p {
    margin-bottom: 2rem;
  }
`;

export const LoadingState = styled.div`
  text-align: center;
  padding: 4rem 2rem;
  color: #6c757d;

  .spinner {
    font-size: 2rem;
    margin-bottom: 1rem;
  }
`;
