/**
 * My Car Story Section
 * Displays user's personal story about their experience with cars
 */

import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { BookOpen, Edit2, Save, X, Award, Car, Calendar } from 'lucide-react';
import { useLanguage } from '../../../contexts/LanguageContext';
import { useTheme } from '../../../contexts/ThemeContext';
import type { CarStory } from '../../../types/profile-enhancements.types';
import { carStoryService } from '../../../services/profile/car-story.service';
import { logger } from '../../../services/logger-service';

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

const EditButton = styled.button<{ $isDark: boolean }>`
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  background: ${props => props.$isDark ? '#334155' : '#f8fafc'};
  color: ${props => props.$isDark ? '#cbd5e1' : '#64748b'};
  border: 1px solid ${props => props.$isDark ? '#475569' : '#e2e8f0'};
  border-radius: 8px;
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: ${props => props.$isDark ? '#475569' : '#f1f5f9'};
    border-color: ${props => props.$isDark ? '#64748b' : '#cbd5e1'};
  }
`;

const StoryContent = styled.div<{ $isDark: boolean }>`
  color: ${props => props.$isDark ? '#cbd5e1' : '#64748b'};
  line-height: 1.8;
  font-size: 0.9375rem;
  margin-bottom: 20px;
`;

const StoryTextarea = styled.textarea<{ $isDark: boolean }>`
  width: 100%;
  min-height: 150px;
  padding: 16px;
  background: ${props => props.$isDark ? '#0f172a' : '#f8fafc'};
  border: 1px solid ${props => props.$isDark ? '#1e293b' : '#e2e8f0'};
  border-radius: 12px;
  color: ${props => props.$isDark ? '#f1f5f9' : '#1e293b'};
  font-size: 0.9375rem;
  line-height: 1.8;
  font-family: inherit;
  resize: vertical;
  margin-bottom: 16px;

  &:focus {
    outline: none;
    border-color: ${props => props.$isDark ? '#475569' : '#cbd5e1'};
  }
`;

const StoryDetails = styled.div<{ $isDark: boolean }>`
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  padding-top: 20px;
  border-top: 1px solid ${props => props.$isDark ? '#1e293b' : '#e2e8f0'};
`;

const DetailItem = styled.div<{ $isDark: boolean }>`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  background: ${props => props.$isDark ? '#0f172a' : '#f8fafc'};
  border-radius: 8px;
  font-size: 0.875rem;
  color: ${props => props.$isDark ? '#cbd5e1' : '#64748b'};
`;

const ButtonsGroup = styled.div`
  display: flex;
  gap: 8px;
  margin-top: 16px;
`;

const SaveButton = styled.button<{ $isDark: boolean }>`
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 10px 20px;
  background: ${props => props.$isDark ? '#22c55e' : '#16a34a'};
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: ${props => props.$isDark ? '#16a34a' : '#15803d'};
  }
`;

const CancelButton = styled.button<{ $isDark: boolean }>`
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 10px 20px;
  background: ${props => props.$isDark ? '#334155' : '#f8fafc'};
  color: ${props => props.$isDark ? '#cbd5e1' : '#64748b'};
  border: 1px solid ${props => props.$isDark ? '#475569' : '#e2e8f0'};
  border-radius: 8px;
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: ${props => props.$isDark ? '#475569' : '#f1f5f9'};
  }
`;

const EmptyState = styled.div<{ $isDark: boolean }>`
  text-align: center;
  padding: 40px 20px;
  color: ${props => props.$isDark ? '#94a3b8' : '#64748b'};
`;

const EmptyIcon = styled.div<{ $isDark: boolean }>`
  margin-bottom: 16px;
  opacity: 0.5;
  color: ${props => props.$isDark ? '#64748b' : '#94a3b8'};
`;

const EmptyText = styled.p<{ $isDark: boolean }>`
  font-size: 0.875rem;
  color: ${props => props.$isDark ? '#94a3b8' : '#64748b'};
  margin: 0 0 16px 0;
`;

interface CarStorySectionProps {
  userId: string;
  isOwnProfile: boolean;
}

export const CarStorySection: React.FC<CarStorySectionProps> = ({
  userId,
  isOwnProfile
}) => {
  const { language } = useLanguage();
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [carStory, setCarStory] = useState<CarStory | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editedStory, setEditedStory] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Don't load if userId is invalid
    if (!userId || typeof userId !== 'string') {
      setLoading(false);
      return;
    }

    const loadCarStory = async () => {
      try {
        const data = await carStoryService.getCarStory(userId);
        if (data) {
          setCarStory(data);
          setEditedStory(data.story || '');
        }
      } catch (error) {
        logger.error('Error loading car story:', error);
        setCarStory(null);
      } finally {
        setLoading(false);
      }
    };

    loadCarStory();
  }, [userId]);

  const handleSave = async () => {
    try {
      await carStoryService.updateStoryText(userId, editedStory);
      const updatedStory = await carStoryService.getCarStory(userId);
      if (updatedStory) {
        setCarStory(updatedStory);
      }
      setIsEditing(false);
    } catch (error) {
      logger.error('Error saving car story:', error);
    }
  };

  const handleCancel = () => {
    setEditedStory(carStory?.story || '');
    setIsEditing(false);
  };

  if (loading) {
    return null;
  }

  if (!carStory && !isOwnProfile) {
    return null;
  }

  return (
    <SectionContainer $isDark={isDark}>
      <SectionHeader>
        <SectionTitle $isDark={isDark}>
          <BookOpen size={20} />
          {language === 'bg' ? 'Моята история с автомобилите' : 'My Car Story'}
        </SectionTitle>
        {isOwnProfile && !isEditing && (
          <EditButton $isDark={isDark} onClick={() => setIsEditing(true)}>
            <Edit2 size={16} />
            {language === 'bg' ? 'Редактирай' : 'Edit'}
          </EditButton>
        )}
      </SectionHeader>

      {!carStory && isOwnProfile ? (
        <EmptyState $isDark={isDark}>
          <EmptyIcon $isDark={isDark}>
            <BookOpen size={48} />
          </EmptyIcon>
          <EmptyText $isDark={isDark}>
            {language === 'bg' 
              ? 'Разкажете вашата история с автомобилите'
              : 'Tell your story with cars'}
          </EmptyText>
          <EditButton $isDark={isDark} onClick={() => setIsEditing(true)}>
            <Edit2 size={16} />
            {language === 'bg' ? 'Добави история' : 'Add Story'}
          </EditButton>
        </EmptyState>
      ) : (
        <>
          {isEditing ? (
            <>
              <StoryTextarea
                $isDark={isDark}
                value={editedStory}
                onChange={(e) => setEditedStory(e.target.value)}
                placeholder={language === 'bg' 
                  ? 'Разкажете за вашия опит с автомобилите...'
                  : 'Tell us about your experience with cars...'}
              />
              <ButtonsGroup>
                <SaveButton $isDark={isDark} onClick={handleSave}>
                  <Save size={16} />
                  {language === 'bg' ? 'Запази' : 'Save'}
                </SaveButton>
                <CancelButton $isDark={isDark} onClick={handleCancel}>
                  <X size={16} />
                  {language === 'bg' ? 'Отказ' : 'Cancel'}
                </CancelButton>
              </ButtonsGroup>
            </>
          ) : (
            <>
              <StoryContent $isDark={isDark}>
                {carStory?.story || (language === 'bg' 
                  ? 'Все още няма история'
                  : 'No story yet')}
              </StoryContent>
              {carStory && (
                <StoryDetails $isDark={isDark}>
                  {carStory.yearsOfExperience && (
                    <DetailItem $isDark={isDark}>
                      <Calendar size={16} />
                      {carStory.yearsOfExperience} {language === 'bg' ? 'години опит' : 'years experience'}
                    </DetailItem>
                  )}
                  {carStory.favoriteBrands && carStory.favoriteBrands.length > 0 && (
                    <DetailItem $isDark={isDark}>
                      <Car size={16} />
                      {language === 'bg' ? 'Любими марки' : 'Favorite Brands'}: {carStory.favoriteBrands.join(', ')}
                    </DetailItem>
                  )}
                  {carStory.specialties && carStory.specialties.length > 0 && (
                    <DetailItem $isDark={isDark}>
                      <Award size={16} />
                      {language === 'bg' ? 'Специализации' : 'Specialties'}: {carStory.specialties.join(', ')}
                    </DetailItem>
                  )}
                </StoryDetails>
              )}
            </>
          )}
        </>
      )}
    </SectionContainer>
  );
};

export default CarStorySection;

