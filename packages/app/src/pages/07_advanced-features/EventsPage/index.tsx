/**
 * EventsPage - Browse and discover car events
 * Location: Bulgaria | Languages: BG/EN | Currency: EUR
 */

import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useAuth } from '@globul-cars/core/contextsAuthProvider';
import { eventsService, CarEvent } from '@globul-cars/services/social/events.service';
import EventCard from '@globul-cars/ui/componentsEvents/EventCard';
import { Calendar, Plus, Filter, MapPin } from 'lucide-react';

// ==================== STYLED COMPONENTS ====================

const Container = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 40px 20px;
`;

const Header = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 32px;
  
  @media (max-width: 768px) {
    flex-direction: column;
    align-items: flex-start;
    gap: 16px;
  }
`;

const HeaderLeft = styled.div`
  h1 {
    font-size: 2rem;
    font-weight: 800;
    color: #212529;
    margin: 0 0 8px 0;
  }
  
  p {
    color: #6c757d;
    font-size: 1rem;
    margin: 0;
  }
`;

const HeaderActions = styled.div`
  display: flex;
  gap: 12px;
`;

const CreateButton = styled.button`
  padding: 12px 24px;
  border-radius: 24px;
  border: none;
  background: linear-gradient(135deg, #FF8F10, #FF7900);
  color: white;
  font-size: 1rem;
  font-weight: 700;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all 0.2s;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 16px rgba(255, 143, 16, 0.3);
  }
  
  svg {
    width: 20px;
    height: 20px;
  }
`;

const FilterButton = styled.button`
  padding: 12px 20px;
  border-radius: 24px;
  border: 2px solid #dee2e6;
  background: white;
  color: #495057;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all 0.2s;
  
  &:hover {
    border-color: #FF8F10;
    color: #FF8F10;
  }
  
  svg {
    width: 18px;
    height: 18px;
  }
`;

const Filters = styled.div`
  display: flex;
  gap: 12px;
  margin-bottom: 24px;
  flex-wrap: wrap;
`;

const FilterChip = styled.button<{ $active: boolean }>`
  padding: 8px 16px;
  border-radius: 20px;
  border: 2px solid ${p => p.$active ? '#FF8F10' : '#dee2e6'};
  background: ${p => p.$active ? 'rgba(255, 143, 16, 0.1)' : 'white'};
  color: ${p => p.$active ? '#FF8F10' : '#6c757d'};
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover {
    border-color: #FF8F10;
    color: #FF8F10;
  }
`;

const EventsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 24px;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 80px 20px;
  
  svg {
    width: 80px;
    height: 80px;
    color: #dee2e6;
    margin-bottom: 24px;
  }
  
  h3 {
    font-size: 1.5rem;
    font-weight: 700;
    color: #212529;
    margin: 0 0 12px 0;
  }
  
  p {
    color: #6c757d;
    font-size: 1rem;
    margin: 0 0 24px 0;
  }
`;

const LoadingSpinner = styled.div`
  text-align: center;
  padding: 60px;
  color: #6c757d;
  font-size: 1.1rem;
`;

// ==================== COMPONENT ====================

const EventsPage: React.FC = () => {
  const { user } = useAuth();
  
  const [events, setEvents] = useState<CarEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState<CarEvent['eventType'] | 'all'>('all');
  const [cityFilter, setCityFilter] = useState<string>('');
  
  // ==================== EFFECTS ====================
  
  useEffect(() => {
    loadEvents();
  }, [cityFilter]);
  
  // ==================== HANDLERS ====================
  
  const loadEvents = async () => {
    try {
      setLoading(true);
      const loadedEvents = await eventsService.getUpcomingEvents(cityFilter || undefined);
      setEvents(loadedEvents);
    } catch (error) {
      console.error('Failed to load events:', error);
    } finally {
      setLoading(false);
    }
  };
  
  const handleCreateEvent = () => {
    // TODO: Open event creator modal
    console.log('Create event clicked');
  };
  
  const filteredEvents = filterType === 'all' 
    ? events 
    : events.filter(e => e.eventType === filterType);
  
  // ==================== RENDER ====================
  
  return (
    <Container>
      <Header>
        <HeaderLeft>
          <h1>Car Events & Meetups</h1>
          <p>Discover and join automotive events in Bulgaria</p>
        </HeaderLeft>
        
        <HeaderActions>
          <FilterButton>
            <Filter />
            Filter
          </FilterButton>
          <CreateButton onClick={handleCreateEvent}>
            <Plus />
            Create Event
          </CreateButton>
        </HeaderActions>
      </Header>
      
      <Filters>
        <FilterChip $active={filterType === 'all'} onClick={() => setFilterType('all')}>
          All Events
        </FilterChip>
        <FilterChip $active={filterType === 'meetup'} onClick={() => setFilterType('meetup')}>
          Meetups
        </FilterChip>
        <FilterChip $active={filterType === 'car_show'} onClick={() => setFilterType('car_show')}>
          Car Shows
        </FilterChip>
        <FilterChip $active={filterType === 'track_day'} onClick={() => setFilterType('track_day')}>
          Track Days
        </FilterChip>
        <FilterChip $active={filterType === 'workshop'} onClick={() => setFilterType('workshop')}>
          Workshops
        </FilterChip>
        <FilterChip $active={filterType === 'cruise'} onClick={() => setFilterType('cruise')}>
          Cruises
        </FilterChip>
      </Filters>
      
      {loading ? (
        <LoadingSpinner>Loading events...</LoadingSpinner>
      ) : filteredEvents.length > 0 ? (
        <EventsGrid>
          {filteredEvents.map(event => (
            <EventCard key={event.id} event={event} />
          ))}
        </EventsGrid>
      ) : (
        <EmptyState>
          <Calendar />
          <h3>No Events Found</h3>
          <p>Be the first to create an event in your area!</p>
          <CreateButton onClick={handleCreateEvent}>
            <Plus />
            Create Event
          </CreateButton>
        </EmptyState>
      )}
    </Container>
  );
};

export default EventsPage;
