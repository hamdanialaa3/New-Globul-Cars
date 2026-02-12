/**
 * Events Service - Car events and meetups system
 * Location: Bulgaria | Languages: BG/EN | Currency: EUR
 */

import {
  collection,
  doc,
  addDoc,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
  limit,
  updateDoc,
  deleteDoc,
  increment,
  arrayUnion,
  arrayRemove,
  serverTimestamp,
  Timestamp,
  GeoPoint
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../../firebase/firebase-config';
import { logger } from '../logger-service';

// ==================== INTERFACES ====================

export interface CarEvent {
  id: string;
  organizerId: string;
  organizerInfo: {
    displayName: string;
    profileImage?: string;
    profileType: 'private' | 'dealer' | 'company';
    isVerified: boolean;
  };
  title: string;
  description: string;
  eventType: 'meetup' | 'car_show' | 'track_day' | 'workshop' | 'cruise' | 'other';
  coverImage?: string;
  gallery: string[];
  location: {
    address: string;
    city: string;
    coordinates: GeoPoint;
    placeId?: string;
  };
  startDate: Date;
  endDate: Date;
  capacity?: number;
  attendeeCount: number;
  attendees: string[];
  interestedCount: number;
  interested: string[];
  visibility: 'public' | 'private';
  tags: string[];
  requiresApproval: boolean;
  status: 'upcoming' | 'ongoing' | 'completed' | 'cancelled';
  createdAt: Date;
  updatedAt: Date;
}

export interface EventRSVP {
  id: string;
  eventId: string;
  userId: string;
  userInfo: {
    displayName: string;
    profileImage?: string;
  };
  status: 'going' | 'interested' | 'not_going';
  carInfo?: {
    make: string;
    model: string;
    year: number;
  };
  message?: string;
  createdAt: Date;
}

export interface EventCreateData {
  title: string;
  description: string;
  eventType: CarEvent['eventType'];
  coverImage?: File;
  location: {
    address: string;
    city: string;
    coordinates: { lat: number; lng: number };
    placeId?: string;
  };
  startDate: Date;
  endDate: Date;
  capacity?: number;
  visibility: 'public' | 'private';
  tags: string[];
  requiresApproval: boolean;
}

// ==================== SERVICE CLASS ====================

class EventsService {
  private readonly collectionName = 'events';
  private readonly rsvpCollectionName = 'eventRSVPs';

  /**
   * Create a new event
   */
  async createEvent(userId: string, eventData: EventCreateData): Promise<string> {
    try {
      const userDoc = await getDoc(doc(db, 'users', userId));
      
      if (!userDoc.exists()) throw new Error('User not found');
      
      const userData = userDoc.data();
      
      let coverImageUrl: string | undefined;
      if (eventData.coverImage) {
        coverImageUrl = await this.uploadEventImage(userId, eventData.coverImage);
      }
      
      const eventRef = await addDoc(collection(db, this.collectionName), {
        organizerId: userId,
        organizerInfo: {
          displayName: userData.displayName || 'Anonymous',
          profileImage: userData.profileImage?.url,
          profileType: userData.profileType || 'private',
          isVerified: userData.isVerified || false
        },
        title: eventData.title,
        description: eventData.description,
        eventType: eventData.eventType,
        coverImage: coverImageUrl,
        gallery: [],
        location: {
          ...eventData.location,
          coordinates: new GeoPoint(
            eventData.locationData?.coordinates.lat,
            eventData.locationData?.coordinates.lng
          )
        },
        startDate: Timestamp.fromDate(eventData.startDate),
        endDate: Timestamp.fromDate(eventData.endDate),
        capacity: eventData.capacity,
        attendeeCount: 0,
        attendees: [],
        interestedCount: 0,
        interested: [],
        visibility: eventData.visibility,
        tags: eventData.tags,
        requiresApproval: eventData.requiresApproval,
        status: 'upcoming',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      
      await updateDoc(doc(db, 'users', userId), {
        'stats.eventsOrganized': increment(1),
        'lastActivity': serverTimestamp()
      });
      
      return eventRef.id;
    } catch (error) {
      logger.error('Error creating event', error as Error, { userId });
      throw new Error('Failed to create event');
    }
  }

  /**
   * Get upcoming events
   */
  async getUpcomingEvents(cityFilter?: string, limitCount = 20): Promise<CarEvent[]> {
    try {
      const now = new Date();
      let q = query(
        collection(db, this.collectionName),
        where('status', '==', 'upcoming'),
        where('startDate', '>', Timestamp.fromDate(now)),
        orderBy('startDate', 'asc'),
        limit(limitCount)
      );
      
      if (cityFilter) {
        q = query(
          collection(db, this.collectionName),
          where('status', '==', 'upcoming'),
          where('locationData.cityId', '==', cityFilter),
          where('startDate', '>', Timestamp.fromDate(now)),
          orderBy('startDate', 'asc'),
          limit(limitCount)
        );
      }
      
      const snapshot = await getDocs(q);
      
      return snapshot.docs.map((doc: any) => this.convertToEvent(doc));
    } catch (error) {
      logger.error('Error getting events', error as Error, { cityFilter, limitCount });
      throw new Error('Failed to load events');
    }
  }

  /**
   * RSVP to an event
   */
  async rsvpEvent(
    eventId: string,
    userId: string,
    status: EventRSVP['status'],
    carInfo?: EventRSVP['carInfo'],
    message?: string
  ): Promise<void> {
    try {
      const eventRef = doc(db, this.collectionName, eventId);
      const eventDoc = await getDoc(eventRef);
      
      if (!eventDoc.exists()) throw new Error('Event not found');
      
      const event = eventDoc.data();
      
      const userDoc = await getDoc(doc(db, 'users', userId));
      if (!userDoc.exists()) throw new Error('User not found');
      
      const userData = userDoc.data();
      
      const existingRSVP = await getDocs(
        query(
          collection(db, this.rsvpCollectionName),
          where('eventId', '==', eventId),
          where('userId', '==', userId)
        )
      );
      
      if (!existingRSVP.empty) {
        const rsvpDoc = existingRSVP.docs[0];
        const oldStatus = rsvpDoc.data().status;
        
        await updateDoc(rsvpDoc.ref, {
          status,
          carInfo,
          message,
          updatedAt: serverTimestamp()
        });
        
        await this.updateEventCounts(eventRef, oldStatus, status, userId);
      } else {
        await addDoc(collection(db, this.rsvpCollectionName), {
          eventId,
          userId,
          userInfo: {
            displayName: userData.displayName || 'Anonymous',
            profileImage: userData.profileImage?.url
          },
          status,
          carInfo,
          message,
          createdAt: serverTimestamp()
        });
        
        await this.updateEventCounts(eventRef, null, status, userId);
      }
      
      if (status === 'going' && event.organizerId !== userId) {
        await addDoc(collection(db, 'notifications'), {
          userId: event.organizerId,
          type: 'event_rsvp',
          fromUserId: userId,
          eventId,
          rsvpStatus: status,
          isRead: false,
          createdAt: serverTimestamp()
        });
      }
    } catch (error) {
      logger.error('Error RSVPing to event', error as Error, { eventId, status });
      throw new Error('Failed to RSVP');
    }
  }

  /**
   * Get event attendees
   */
  async getEventAttendees(eventId: string): Promise<EventRSVP[]> {
    try {
      const snapshot = await getDocs(
        query(
          collection(db, this.rsvpCollectionName),
          where('eventId', '==', eventId),
          where('status', '==', 'going')
        )
      );
      
      return snapshot.docs.map((doc: any) => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt.toDate()
      } as EventRSVP));
    } catch (error) {
      logger.error('Error getting event attendees', error as Error, { eventId });
      throw new Error('Failed to load attendees');
    }
  }

  // ==================== PRIVATE HELPERS ====================

  private async uploadEventImage(userId: string, file: File): Promise<string> {
    const timestamp = Date.now();
    const fileName = `${userId}_${timestamp}.${file.name.split('.').pop()}`;
    const storageRef = ref(storage, `events/${userId}/${fileName}`);
    
    await uploadBytes(storageRef, file);
    return await getDownloadURL(storageRef);
  }

  private async updateEventCounts(
    eventRef: any,
    oldStatus: EventRSVP['status'] | null,
    newStatus: EventRSVP['status'],
    userId: string
  ): Promise<void> {
    const updates: Record<string, unknown> = {};
    
    if (oldStatus === 'going') {
      updates.attendeeCount = increment(-1);
      updates.attendees = arrayRemove(userId);
    } else if (oldStatus === 'interested') {
      updates.interestedCount = increment(-1);
      updates.interested = arrayRemove(userId);
    }
    
    if (newStatus === 'going') {
      updates.attendeeCount = increment(1);
      updates.attendees = arrayUnion(userId);
    } else if (newStatus === 'interested') {
      updates.interestedCount = increment(1);
      updates.interested = arrayUnion(userId);
    }
    
    if (Object.keys(updates).length > 0) {
      updates.updatedAt = serverTimestamp();
      await updateDoc(eventRef, updates);
    }
  }

  private convertToEvent(doc: any): CarEvent {
    const data = doc.data();
    return {
      id: doc.id,
      ...data,
      startDate: data.startDate.toDate(),
      endDate: data.endDate.toDate(),
      createdAt: data.createdAt.toDate(),
      updatedAt: data.updatedAt.toDate()
    } as CarEvent;
  }
}

export const eventsService = new EventsService();
