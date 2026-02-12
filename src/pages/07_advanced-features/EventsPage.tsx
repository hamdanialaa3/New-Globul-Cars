// Professional Events Page for Koli One
// Location: Bulgaria | Languages: BG/EN | Currency: EUR

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useLanguage } from '../../contexts/LanguageContext';
import { useTheme } from '../../contexts/ThemeContext';
import { useNavigate } from 'react-router-dom';
import { logger } from '../../services/logger-service';
import { 
  collection, 
  query, 
  where, 
  orderBy, 
  getDocs,
  doc,
  updateDoc,
  increment,
  Timestamp 
} from 'firebase/firestore';
import { db } from '../../firebase/firebase-config';
import {
  Calendar,
  MapPin,
  Clock,
  Users,
  Car,
  Bookmark,
  Share2,
  Filter,
  Search
} from 'lucide-react';
import './EventsPage.css';

interface Event {
  id: string;
  title: string;
  titleBg?: string;
  titleEn?: string;
  description: string;
  descriptionBg?: string;
  descriptionEn?: string;
  date: Date;
  time: string;
  location: string;
  city: string;
  organizer: string;
  attendees: number;
  maxAttendees?: number;
  category: 'car_show' | 'racing' | 'exhibition' | 'meetup' | 'workshop' | 'auction';
  image?: string;
  featured?: boolean;
  saved?: boolean;
}

const EventsPage: React.FC = () => {
  const { user } = useAuth();
  const { language } = useLanguage();
  const { theme } = useTheme();
  const navigate = useNavigate();
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'upcoming' | 'today' | 'saved'>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadEvents();
  }, [filter, categoryFilter]);

  const loadEvents = async () => {
    try {
      setLoading(true);
      
      // Fetch real events from Firestore
      const eventsRef = collection(db, 'events');
      let q = query(eventsRef, orderBy('date', 'asc'));
      
      // Apply filter for upcoming events only
      if (filter === 'upcoming' || filter === 'today') {
        const now = Timestamp.now();
        q = query(eventsRef, where('date', '>=', now), orderBy('date', 'asc'));
      }
      
      const snapshot = await getDocs(q);
      
      if (snapshot.empty) {
        // No events in database - show empty state
        setEvents([]);
        return;
      }
      
      const firestoreEvents: Event[] = [];
      
      snapshot.forEach((docSnap) => {
        const data = docSnap.data();
        firestoreEvents.push({
          id: docSnap.id,
          title: language === 'bg' ? (data.titleBg || data.title) : (data.titleEn || data.title),
          titleBg: data.titleBg,
          titleEn: data.titleEn,
          description: language === 'bg' ? (data.descriptionBg || data.description) : (data.descriptionEn || data.description),
          descriptionBg: data.descriptionBg,
          descriptionEn: data.descriptionEn,
          date: data.date?.toDate?.() || new Date(data.date),
          time: data.time || '',
          location: data.location || '',
          city: data.city || '',
          organizer: data.organizer || '',
          attendees: data.attendees || 0,
          maxAttendees: data.maxAttendees,
          category: data.category || 'meetup',
          image: data.image,
          featured: data.featured || false,
          saved: false // Will be updated with user's saved events
        });
      });
      
      // Check user's saved events
      if (user?.uid) {
        const savedRef = collection(db, 'users', user.uid, 'saved_events');
        const savedSnapshot = await getDocs(savedRef);
        const savedIds = new Set(savedSnapshot.docs.map(d => d.id));
        
        firestoreEvents.forEach(event => {
          event.saved = savedIds.has(event.id);
        });
        
        // Filter by saved if needed
        if (filter === 'saved') {
          const savedEvents = firestoreEvents.filter(e => e.saved);
          setEvents(savedEvents);
          return;
        }
      }
      
      // Filter by today
      if (filter === 'today') {
        const today = new Date();
        const todayEvents = firestoreEvents.filter(e => 
          e.date.toDateString() === today.toDateString()
        );
        setEvents(todayEvents);
        return;
      }
      
      setEvents(firestoreEvents);
    } catch (error) {
      logger.error('Error loading events', error as Error);
      setEvents([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveEvent = (eventId: string) => {
    setEvents(prev =>
      prev.map(event =>
        event.id === eventId ? { ...event, saved: !event.saved } : event
      )
    );
  };

  const handleShareEvent = (event: Event) => {
    if (navigator.share) {
      navigator.share({
        title: event.title,
        text: event.description,
        url: window.location.href + '/' + event.id
      });
    }
  };

  const getCategoryLabel = (category: string) => {
    const labels: Record<string, { bg: string; en: string }> = {
      car_show: { bg: 'Авто Шоу', en: 'Car Show' },
      racing: { bg: 'Състезания', en: 'Racing' },
      exhibition: { bg: 'Изложение', en: 'Exhibition' },
      meetup: { bg: 'Среща', en: 'Meetup' },
      workshop: { bg: 'Работилница', en: 'Workshop' },
      auction: { bg: 'Аукцион', en: 'Auction' }
    };
    return language === 'bg' ? labels[category]?.bg : labels[category]?.en;
  };

  const formatDate = (date: Date) => {
    const options: Intl.DateTimeFormatOptions = {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    };
    return date.toLocaleDateString(language === 'bg' ? 'bg-BG' : 'en-US', options);
  };

  const filteredEvents = events.filter(event => {
    // Filter by category
    if (categoryFilter !== 'all' && event.category !== categoryFilter) return false;

    // Filter by saved
    if (filter === 'saved' && !event.saved) return false;

    // Filter by search query
    if (searchQuery && !event.title.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }

    return true;
  });

  return (
    <div className="events-page" data-theme={theme?.mode || 'light'}>
      <div className="events-container">
        {/* Header */}
        <div className="events-header">
          <div className="header-left">
            <Calendar size={40} />
            <div>
              <h1>{language === 'bg' ? 'Събития' : 'Events'}</h1>
              <p>{language === 'bg' ? 'Открийте автомобилни събития във вашия град' : 'Discover car events in your city'}</p>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="events-filters-section">
          <div className="search-bar">
            <Search size={20} />
            <input
              type="text"
              placeholder={language === 'bg' ? 'Търсене на събития...' : 'Search events...'}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="filters-row">
            <div className="filter-group">
              <button
                className={`filter-button ${filter === 'all' ? 'active' : ''}`}
                onClick={() => setFilter('all')}
              >
                {language === 'bg' ? 'Всички' : 'All'}
              </button>
              <button
                className={`filter-button ${filter === 'upcoming' ? 'active' : ''}`}
                onClick={() => setFilter('upcoming')}
              >
                {language === 'bg' ? 'Предстоящи' : 'Upcoming'}
              </button>
              <button
                className={`filter-button ${filter === 'saved' ? 'active' : ''}`}
                onClick={() => setFilter('saved')}
              >
                {language === 'bg' ? 'Запазени' : 'Saved'}
              </button>
            </div>

            <div className="category-filter">
              <Filter size={16} />
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
              >
                <option value="all">{language === 'bg' ? 'Всички категории' : 'All Categories'}</option>
                <option value="exhibition">{language === 'bg' ? 'Изложения' : 'Exhibitions'}</option>
                <option value="meetup">{language === 'bg' ? 'Срещи' : 'Meetups'}</option>
                <option value="racing">{language === 'bg' ? 'Състезания' : 'Racing'}</option>
                <option value="workshop">{language === 'bg' ? 'Работилници' : 'Workshops'}</option>
                <option value="auction">{language === 'bg' ? 'Аукциони' : 'Auctions'}</option>
              </select>
            </div>
          </div>
        </div>

        {/* Events Grid */}
        {loading ? (
          <div className="loading-state">
            <div className="loading-spinner"></div>
            <p>{language === 'bg' ? 'Зареждане на събития...' : 'Loading events...'}</p>
          </div>
        ) : filteredEvents.length === 0 ? (
          <div className="empty-state">
            <Calendar size={64} />
            <h3>{language === 'bg' ? 'Няма намерени събития' : 'No events found'}</h3>
            <p>{language === 'bg' ? 'Опитайте различни филтри' : 'Try different filters'}</p>
          </div>
        ) : (
          <div className="events-grid">
            {filteredEvents.map(event => (
              <div key={event.id} className={`event-card ${event.featured ? 'featured' : ''}`}>
                {event.featured && (
                  <div className="featured-badge">
                    {language === 'bg' ? 'Препоръчано' : 'Featured'}
                  </div>
                )}

                <div className="event-image">
                  <div className="placeholder-image">
                    <Car size={48} />
                  </div>
                  <div className="event-category-badge">
                    {getCategoryLabel(event.category)}
                  </div>
                </div>

                <div className="event-content">
                  <h3 className="event-title">{event.title}</h3>
                  <p className="event-description">{event.description}</p>

                  <div className="event-details">
                    <div className="detail-item">
                      <Calendar size={16} />
                      <span>{formatDate(event.date)}</span>
                    </div>
                    <div className="detail-item">
                      <Clock size={16} />
                      <span>{event.time}</span>
                    </div>
                    <div className="detail-item">
                      <MapPin size={16} />
                      <span>{event.location}, {event.locationData?.cityName}</span>
                    </div>
                    <div className="detail-item">
                      <Users size={16} />
                      <span>
                        {event.attendees}{event.maxAttendees && ` / ${event.maxAttendees}`} {language === 'bg' ? 'участници' : 'attendees'}
                      </span>
                    </div>
                  </div>

                  <div className="event-actions">
                    <button className="primary-button">
                      {language === 'bg' ? 'Виж детайли' : 'View Details'}
                    </button>
                    <button
                      className={`icon-button ${event.saved ? 'active' : ''}`}
                      onClick={() => handleSaveEvent(event.id)}
                      title={language === 'bg' ? 'Запази' : 'Save'}
                    >
                      <Bookmark size={18} />
                    </button>
                    <button
                      className="icon-button"
                      onClick={() => handleShareEvent(event)}
                      title={language === 'bg' ? 'Сподели' : 'Share'}
                    >
                      <Share2 size={18} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Company Footer */}
      <footer className="events-footer" style={{
        marginTop: '4rem',
        padding: '2rem',
        background: theme.mode === 'dark' ? 'rgba(30, 41, 59, 0.8)' : 'rgba(248, 250, 252, 0.8)',
        borderRadius: '12px',
        textAlign: 'center',
        fontSize: '0.95em'
      }}>
        <strong>Alaa Technologies</strong><br />
        77 Tsar Simeon Blvd, Sofia, Bulgaria | 📧 <a href="mailto:service@koli.one" style={{ color: '#3b82f6' }}>service@koli.one</a><br />
        📞 +359 87 983 9671 (Text messages only)<br />
        <span style={{ fontSize: '0.9em', opacity: 0.8 }}>
          © 2026 Alaa Technologies. Operating under Bulgarian and EU law (GDPR compliant)
        </span>
      </footer>
    </div>
  );
};

export default EventsPage;

