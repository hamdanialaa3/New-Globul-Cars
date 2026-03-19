import { logger } from '../../services/logger-service';
/**
 * EventCard - Display event in feed/list
 * Location: Bulgaria | Languages: BG/EN | Currency: EUR
 */

import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { CarEvent } from '../../services/social/events.service';
import { Calendar, MapPin, Users, Clock, Check } from 'lucide-react';
import { format } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { doc, getDoc, setDoc, deleteDoc, increment, updateDoc, Timestamp } from 'firebase/firestore';
import { db } from '../../firebase/firebase-config';

// ==================== STYLED COMPONENTS ====================

const Card = styled.div`
  background: white;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  transition: all 0.2s;
  cursor: pointer;
  
  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
  }
`;

const CoverImage = styled.div<{ $imageUrl?: string }>`
  width: 100%;
  height: 200px;
  background: ${p => p.$imageUrl 
    ? `url(${p.$imageUrl}) center/cover` 
    : 'linear-gradient(135deg, #FF8F10, #FF7900)'};
  position: relative;
`;

const EventBadge = styled.div<{ $type: CarEvent['eventType'] }>`
  position: absolute;
  top: 16px;
  left: 16px;
  padding: 6px 12px;
  border-radius: 20px;
  background: ${p => {
    switch (p.$type) {
      case 'car_show': return '#1d4ed8';
      case 'track_day': return '#dc2626';
      case 'workshop': return '#16a34a';
      case 'cruise': return '#ea580c';
      default: return '#6366f1';
    }
  }};
  color: white;
  font-size: 0.8rem;
  font-weight: 700;
  text-transform: uppercase;
`;

const Content = styled.div`
  padding: 20px;
`;

const Header = styled.div`
  margin-bottom: 16px;
`;

const Title = styled.h3`
  font-size: 1.25rem;
  font-weight: 700;
  color: #212529;
  margin: 0 0 8px 0;
  line-height: 1.3;
`;

const OrganizerInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.9rem;
  color: #6c757d;
  
  .name {
    font-weight: 600;
    color: #495057;
  }
`;

const Description = styled.p`
  color: #6c757d;
  font-size: 0.95rem;
  line-height: 1.6;
  margin: 0 0 16px 0;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
`;

const InfoGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  margin-bottom: 16px;
`;

const InfoItem = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.9rem;
  color: #495057;
  
  svg {
    width: 18px;
    height: 18px;
    color: #FF8F10;
  }
`;

const Footer = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-top: 16px;
  border-top: 1px solid #e9ecef;
`;

const AttendeeCount = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.9rem;
  color: #495057;
  
  svg {
    width: 18px;
    height: 18px;
    color: #16a34a;
  }
  
  .count {
    font-weight: 700;
    color: #212529;
  }
`;

const InterestedButton = styled.button`
  padding: 8px 20px;
  border-radius: 20px;
  border: 2px solid #FF8F10;
  background: white;
  color: #FF8F10;
  font-size: 0.9rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover {
    background: #FF8F10;
    color: white;
  }
`;

// ==================== COMPONENT ====================

interface EventCardProps {
  event: CarEvent;
}

const EventCard: React.FC<EventCardProps> = ({ event }) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isInterested, setIsInterested] = useState(false);
  const [localInterestedCount, setLocalInterestedCount] = useState(event.interestedCount || 0);

  useEffect(() => {
    if (!user || !event.id) return;
    let isActive = true;
    const checkRsvp = async () => {
      const rsvpRef = doc(db, 'events', event.id, 'rsvps', user.uid);
      const rsvpSnap = await getDoc(rsvpRef);
      if (isActive) setIsInterested(rsvpSnap.exists());
    };
    checkRsvp().catch(() => {});
    return () => { isActive = false; };
  }, [user, event.id]);
  
  const getEventTypeLabel = (type: CarEvent['eventType']) => {
    const labels = {
      meetup: 'Meetup',
      car_show: 'Car Show',
      track_day: 'Track Day',
      workshop: 'Workshop',
      cruise: 'Cruise',
      other: 'Event'
    };
    return labels[type];
  };
  
  const handleClick = () => {
    navigate(`/events/${event.id}`);
  };
  
  const handleInterested = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!user) {
      navigate('/login');
      return;
    }
    try {
      const rsvpRef = doc(db, 'events', event.id, 'rsvps', user.uid);
      const eventRef = doc(db, 'events', event.id);

      if (isInterested) {
        await deleteDoc(rsvpRef);
        await updateDoc(eventRef, { interestedCount: increment(-1) });
        setIsInterested(false);
        setLocalInterestedCount(prev => Math.max(0, prev - 1));
      } else {
        await setDoc(rsvpRef, {
          userId: user.uid,
          status: 'interested',
          createdAt: Timestamp.fromDate(new Date()),
        });
        await updateDoc(eventRef, { interestedCount: increment(1) });
        setIsInterested(true);
        setLocalInterestedCount(prev => prev + 1);
      }
    } catch (error) {
      logger.error('RSVP toggle failed', error as Error);
    }
  };
  
  return (
    <Card onClick={handleClick}>
      <CoverImage $imageUrl={event.coverImage}>
        <EventBadge $type={event.eventType}>
          {getEventTypeLabel(event.eventType)}
        </EventBadge>
      </CoverImage>
      
      <Content>
        <Header>
          <Title>{event.title}</Title>
          <OrganizerInfo>
            by <span className="name">{event.organizerInfo.displayName}</span>
          </OrganizerInfo>
        </Header>
        
        <Description>{event.description}</Description>
        
        <InfoGrid>
          <InfoItem>
            <Calendar />
            {format(event.startDate, 'MMM dd, yyyy')}
          </InfoItem>
          
          <InfoItem>
            <Clock />
            {format(event.startDate, 'HH:mm')}
          </InfoItem>
          
          <InfoItem>
            <MapPin />
            {event.locationData?.cityName}
          </InfoItem>
          
          <InfoItem>
            <Users />
            {event.attendeeCount} / {event.capacity || '∞'}
          </InfoItem>
        </InfoGrid>
        
        <Footer>
          <AttendeeCount>
            <Users />
            <span className="count">{event.attendeeCount}</span> going
            {localInterestedCount > 0 && (
              <span>, {localInterestedCount} interested</span>
            )}
          </AttendeeCount>
          
          <InterestedButton onClick={handleInterested} style={isInterested ? { background: '#FF8F10', color: 'white' } : {}}>
            {isInterested ? <><Check size={16} /> Going</> : 'Interested'}
          </InterestedButton>
        </Footer>
      </Content>
    </Card>
  );
};

export default EventCard;
