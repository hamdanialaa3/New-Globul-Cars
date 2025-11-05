// Professional Events Page for Bulgarian Car Marketplace
// Location: Bulgaria | Languages: BG/EN | Currency: EUR

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useLanguage } from '../../contexts/LanguageContext';
import { useNavigate } from 'react-router-dom';
import { logger } from '../../services/logger-service';
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
  description: string;
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
      
      // Mock events data with BG/EN support
      const mockEvents: Event[] = [
        {
          id: '1',
          title: language === 'bg' ? 'София Авто Шоу 2025' : 'Sofia Auto Show 2025',
          description: language === 'bg' 
            ? 'Най-голямото автомобилно изложение в България с над 200 автомобила'
            : 'The biggest car exhibition in Bulgaria with over 200 cars',
          date: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7), // 7 days from now
          time: '10:00 - 18:00',
          location: language === 'bg' ? 'Интер Експо Център' : 'Inter Expo Center',
          city: language === 'bg' ? 'София' : 'Sofia',
          organizer: 'Bulgarian Auto Association',
          attendees: 1250,
          maxAttendees: 5000,
          category: 'exhibition',
          featured: true,
          saved: false
        },
        {
          id: '2',
          title: language === 'bg' ? 'БМВ Клуб Среща' : 'BMW Club Meetup',
          description: language === 'bg'
            ? 'Месечна среща на собственици на БМВ - кафе и разговори'
            : 'Monthly BMW owners meetup - coffee and conversations',
          date: new Date(Date.now() + 1000 * 60 * 60 * 24 * 3), // 3 days from now
          time: '15:00 - 19:00',
          location: language === 'bg' ? 'Boyana Lake' : 'Boyana Lake',
          city: language === 'bg' ? 'София' : 'Sofia',
          organizer: 'BMW Club Bulgaria',
          attendees: 45,
          maxAttendees: 100,
          category: 'meetup',
          featured: false,
          saved: true
        },
        {
          id: '3',
          title: language === 'bg' ? 'Класически Автомобили - Аукцион' : 'Classic Cars Auction',
          description: language === 'bg'
            ? 'Аукцион на класически и ретро автомобили'
            : 'Auction of classic and vintage cars',
          date: new Date(Date.now() + 1000 * 60 * 60 * 24 * 14), // 14 days from now
          time: '12:00 - 20:00',
          location: language === 'bg' ? 'Grand Hotel Sofia' : 'Grand Hotel Sofia',
          city: language === 'bg' ? 'София' : 'Sofia',
          organizer: 'Classic Auto Bulgaria',
          attendees: 320,
          maxAttendees: 500,
          category: 'auction',
          featured: true,
          saved: false
        },
        {
          id: '4',
          title: language === 'bg' ? 'Авто Механика Работилница' : 'Auto Mechanics Workshop',
          description: language === 'bg'
            ? 'Практическа работилница за основна поддръжка на автомобили'
            : 'Practical workshop for basic car maintenance',
          date: new Date(Date.now() + 1000 * 60 * 60 * 24 * 5), // 5 days from now
          time: '09:00 - 17:00',
          location: language === 'bg' ? 'Автосервиз Еврокар' : 'Eurocar Service',
          city: language === 'bg' ? 'Пловдив' : 'Plovdiv',
          organizer: 'Auto Education BG',
          attendees: 12,
          maxAttendees: 20,
          category: 'workshop',
          featured: false,
          saved: false
        },
        {
          id: '5',
          title: language === 'bg' ? 'ПистаДен - Пловдив' : 'Track Day - Plovdiv',
          description: language === 'bg'
            ? 'Ден на пистата за любители на скоростта'
            : 'Track day for speed enthusiasts',
          date: new Date(Date.now() + 1000 * 60 * 60 * 24 * 10), // 10 days from now
          time: '08:00 - 18:00',
          location: language === 'bg' ? 'Пистата Пловдив' : 'Plovdiv Circuit',
          city: language === 'bg' ? 'Пловдив' : 'Plovdiv',
          organizer: 'Track Events Bulgaria',
          attendees: 85,
          maxAttendees: 120,
          category: 'racing',
          featured: true,
          saved: true
        }
      ];

      setEvents(mockEvents);
    } catch (error) {
      logger.error('Error loading events', error as Error);
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
    <div className="events-page">
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
                      <span>{event.location}, {event.city}</span>
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
    </div>
  );
};

export default EventsPage;

