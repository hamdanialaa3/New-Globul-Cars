import { logger } from '../../../services/logger-service';
/**
 * Availability Calendar Section
 * Displays and manages user availability calendar
 */

import React, { useState, useEffect, useCallback } from 'react';
import styled from 'styled-components';
import { Calendar, Clock, Edit2, Check, X, Save } from 'lucide-react';
import { useLanguage } from '../../../contexts/LanguageContext';
import { useTheme } from '../../../contexts/ThemeContext';
import { availabilityCalendarService } from '../../../services/profile/availability-calendar.service';
import type { AvailabilityCalendar, DayAvailability } from '../../../types/profile-enhancements.types';

const SectionContainer = styled.section<{ $isDark: boolean }>`
  padding: 24px;
  background: ${props => props.$isDark ? '#1e293b' : '#ffffff'};
  border-radius: 16px;
  box-shadow: ${props => props.$isDark 
    ? '0 2px 8px rgba(0, 0, 0, 0.3)' 
    : '0 2px 8px rgba(0, 0, 0, 0.08)'};
  margin-bottom: 24px;
  border: 1px solid ${props => props.$isDark ? '#334155' : '#e2e8f0'};
`;

const SectionHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
`;

const SectionTitle = styled.h3<{ $isDark: boolean }>`
  font-size: 1.25rem;
  font-weight: 700;
  color: ${props => props.$isDark ? '#f1f5f9' : '#1e293b'};
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 0;
`;

const CalendarGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 8px;
  margin-bottom: 16px;
`;

const DayHeader = styled.div<{ $isDark: boolean }>`
  text-align: center;
  font-size: 0.75rem;
  font-weight: 600;
  color: ${props => props.$isDark ? '#94a3b8' : '#64748b'};
  padding: 8px;
  text-transform: uppercase;
`;

const DayCell = styled.div<{ $isDark: boolean; $available: boolean; $isToday: boolean }>`
  aspect-ratio: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  background: ${props => {
    if (props.$isToday) {
      return props.$isDark ? 'rgba(59, 130, 246, 0.3)' : 'rgba(59, 130, 246, 0.1)';
    }
    return props.$isDark ? '#0f172a' : '#f8fafc';
  }};
  border: 2px solid ${props => {
    if (props.$isToday) return '#3b82f6';
    return props.$available 
      ? (props.$isDark ? '#22c55e' : '#16a34a')
      : (props.$isDark ? '#1e293b' : '#e2e8f0');
  }};
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    transform: scale(1.05);
  }
`;

const DayNumber = styled.div<{ $isDark: boolean; $available: boolean }>`
  font-size: 0.875rem;
  font-weight: 700;
  color: ${props => 
    props.$available 
      ? (props.$isDark ? '#22c55e' : '#16a34a')
      : (props.$isDark ? '#64748b' : '#94a3b8')};
`;

const AvailabilityInfo = styled.div<{ $isDark: boolean }>`
  padding: 16px;
  background: ${props => props.$isDark ? '#0f172a' : '#f8fafc'};
  border-radius: 12px;
  border: 1px solid ${props => props.$isDark ? '#1e293b' : '#e2e8f0'};
  margin-top: 16px;
`;

const InfoRow = styled.div<{ $isDark: boolean }>`
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.875rem;
  color: ${props => props.$isDark ? '#cbd5e1' : '#64748b'};
  margin-bottom: 8px;

  &:last-child {
    margin-bottom: 0;
  }
`;

const EmptyState = styled.div<{ $isDark: boolean }>`
  text-align: center;
  padding: 40px 20px;
  color: ${props => props.$isDark ? '#94a3b8' : '#64748b'};
`;

interface AvailabilityCalendarSectionProps {
  userId: string;
  isOwnProfile: boolean;
}

const DAY_LABELS = {
  bg: ['Нед', 'Пон', 'Вто', 'Сря', 'Чет', 'Пет', 'Съб'],
  en: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
};

const EditButton = styled.button<{ $isDark: boolean }>`
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 14px;
  border-radius: 8px;
  border: 1px solid ${props => props.$isDark ? '#475569' : '#cbd5e1'};
  background: transparent;
  color: ${props => props.$isDark ? '#94a3b8' : '#64748b'};
  font-size: 0.8125rem;
  cursor: pointer;
  transition: all 0.2s;
  &:hover { background: ${props => props.$isDark ? '#334155' : '#f1f5f9'}; }
`;

const SaveButton = styled.button`
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 14px;
  border-radius: 8px;
  border: none;
  background: #16a34a;
  color: white;
  font-size: 0.8125rem;
  font-weight: 600;
  cursor: pointer;
  transition: opacity 0.2s;
  &:disabled { opacity: 0.6; cursor: not-allowed; }
  &:hover:not(:disabled) { background: #15803d; }
`;

const WeekEditor = styled.div`
  display: flex;
  gap: 8px;
  margin-bottom: 20px;
  flex-wrap: wrap;
`;

const DayToggle = styled.button<{ $isDark: boolean; $active: boolean }>`
  padding: 8px 14px;
  border-radius: 8px;
  border: 2px solid ${props => props.$active ? '#22c55e' : (props.$isDark ? '#334155' : '#e2e8f0')};
  background: ${props => props.$active
    ? (props.$isDark ? 'rgba(34,197,94,0.2)' : 'rgba(34,197,94,0.1)')
    : 'transparent'};
  color: ${props => props.$active
    ? '#22c55e'
    : (props.$isDark ? '#94a3b8' : '#64748b')};
  font-size: 0.8125rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  &:hover { border-color: #22c55e; }
`;

export const AvailabilityCalendarSection: React.FC<AvailabilityCalendarSectionProps> = ({
  userId,
  isOwnProfile
}) => {
  const { language } = useLanguage();
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [calendar, setCalendar] = useState<AvailabilityCalendar | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editDays, setEditDays] = useState<Record<number, boolean>>({});

  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }
    let isActive = true;

    const loadCalendar = async () => {
      try {
        const cal = await availabilityCalendarService.getCalendar(userId);
        if (isActive) setCalendar(cal);
      } catch (error) {
        logger.error('Error loading calendar:', error);
        if (isActive) setCalendar(null);
      } finally {
        if (isActive) setLoading(false);
      }
    };

    loadCalendar();
    return () => { isActive = false; };
  }, [userId]);

  const startEditing = useCallback(() => {
    const current: Record<number, boolean> = {};
    for (let d = 0; d < 7; d++) {
      current[d] = calendar?.defaultAvailability[d]?.isAvailable ?? false;
    }
    setEditDays(current);
    setEditing(true);
  }, [calendar]);

  const toggleDay = useCallback((dayOfWeek: number) => {
    setEditDays(prev => ({ ...prev, [dayOfWeek]: !prev[dayOfWeek] }));
  }, []);

  const handleSave = useCallback(async () => {
    if (!userId || saving) return;
    setSaving(true);
    try {
      const defaultSlots = [{ start: '09:00', end: '18:00', available: true }];
      for (let d = 0; d < 7; d++) {
        await availabilityCalendarService.updateDefaultAvailability(
          userId, d, editDays[d] ?? false,
          editDays[d] ? defaultSlots : []
        );
      }
      const updated = await availabilityCalendarService.getCalendar(userId);
      setCalendar(updated);
      setEditing(false);
    } catch (error) {
      logger.error('Error saving calendar:', error);
    } finally {
      setSaving(false);
    }
  }, [userId, editDays, saving]);

  const getDaysInMonth = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];
    
    // Empty cells for days before month starts
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }

    // Days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(day);
    }

    return days;
  };

  const isDayAvailable = (day: number | null): boolean => {
    if (day === null || !calendar) return false;
    
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();
    const date = new Date(year, month, day);
    const dayOfWeek = date.getDay();
    
    const defaultAvail = calendar.defaultAvailability[dayOfWeek];
    return defaultAvail?.isAvailable || false;
  };

  const isToday = (day: number | null): boolean => {
    if (day === null) return false;
    const now = new Date();
    return now.getDate() === day;
  };

  if (loading) {
    return null;
  }

  if (!calendar && !isOwnProfile) {
    return null;
  }

  const days = getDaysInMonth();
  const dayNames = language === 'bg' 
    ? ['Н', 'П', 'В', 'С', 'Ч', 'П', 'С']
    : ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

  return (
    <SectionContainer $isDark={isDark}>
      <SectionHeader>
        <SectionTitle $isDark={isDark}>
          <Calendar size={20} />
          {language === 'bg' ? 'Свободни часове' : 'Availability Calendar'}
        </SectionTitle>
        {isOwnProfile && !editing && (
          <EditButton $isDark={isDark} onClick={startEditing}>
            <Edit2 size={14} />
            {language === 'bg' ? 'Редактирай' : 'Edit'}
          </EditButton>
        )}
        {isOwnProfile && editing && (
          <div style={{ display: 'flex', gap: '8px' }}>
            <EditButton $isDark={isDark} onClick={() => setEditing(false)}>
              <X size={14} />
              {language === 'bg' ? 'Откажи' : 'Cancel'}
            </EditButton>
            <SaveButton onClick={handleSave} disabled={saving}>
              <Save size={14} />
              {saving
                ? (language === 'bg' ? 'Записване...' : 'Saving...')
                : (language === 'bg' ? 'Запази' : 'Save')}
            </SaveButton>
          </div>
        )}
      </SectionHeader>

      {editing && (
        <WeekEditor>
          {DAY_LABELS[language === 'bg' ? 'bg' : 'en'].map((label, idx) => (
            <DayToggle
              key={idx}
              $isDark={isDark}
              $active={editDays[idx] ?? false}
              onClick={() => toggleDay(idx)}
            >
              {label}
            </DayToggle>
          ))}
        </WeekEditor>
      )}

      {!calendar && !editing ? (
        <EmptyState $isDark={isDark}>
          <Calendar size={48} style={{ opacity: 0.5, marginBottom: '16px' }} />
          <p style={{ fontSize: '0.875rem', color: isDark ? '#94a3b8' : '#64748b', margin: 0 }}>
            {language === 'bg' 
              ? 'Все още няма настройки за наличност'
              : 'No availability settings yet'}
          </p>
          {isOwnProfile && (
            <EditButton $isDark={isDark} onClick={startEditing} style={{ margin: '12px auto 0' }}>
              <Edit2 size={14} />
              {language === 'bg' ? 'Настрой часовете' : 'Set up hours'}
            </EditButton>
          )}
        </EmptyState>
      ) : (
        <>
          <CalendarGrid>
            {dayNames.map((name, index) => (
              <DayHeader key={index} $isDark={isDark}>
                {name}
              </DayHeader>
            ))}
            {days.map((day, index) => (
              <DayCell
                key={index}
                $isDark={isDark}
                $available={isDayAvailable(day)}
                $isToday={isToday(day)}
              >
                {day && (
                  <DayNumber $isDark={isDark} $available={isDayAvailable(day)}>
                    {day}
                  </DayNumber>
                )}
              </DayCell>
            ))}
          </CalendarGrid>

          <AvailabilityInfo $isDark={isDark}>
            <InfoRow $isDark={isDark}>
              <Check size={16} style={{ color: '#22c55e' }} />
              {language === 'bg' ? 'Наличен' : 'Available'}
            </InfoRow>
            <InfoRow $isDark={isDark}>
              <X size={16} style={{ color: '#64748b' }} />
              {language === 'bg' ? 'Недостъпен' : 'Unavailable'}
            </InfoRow>
            <InfoRow $isDark={isDark}>
              <Clock size={16} />
              {language === 'bg' 
                ? 'Работно време: 09:00 - 18:00'
                : 'Working hours: 09:00 - 18:00'}
            </InfoRow>
          </AvailabilityInfo>
        </>
      )}
    </SectionContainer>
  );
};

export default AvailabilityCalendarSection;

