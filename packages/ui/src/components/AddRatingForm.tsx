// src/components/AddRatingForm.tsx
// Add rating form component for Bulgarian Car Marketplace

import React, { useState } from 'react';
import styled from 'styled-components';
import { useTranslation } from '@globul-cars/coreuseTranslation';

interface AddRatingFormProps {
  carId: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  onRatingAdded: () => void;
  onCancel: () => void;
  className?: string;
}

const FormContainer = styled.div`
  background: ${({ theme }) => theme.colors.background.paper};
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  max-width: 600px;
  margin: 0 auto;
`;

const FormTitle = styled.h3`
  margin: 0 0 24px 0;
  color: ${({ theme }) => theme.colors.text.primary};
  font-size: 20px;
  font-weight: 600;
`;

const RatingSection = styled.div`
  margin-bottom: 24px;
`;

const SectionTitle = styled.h4`
  margin: 0 0 12px 0;
  color: ${({ theme }) => theme.colors.text.primary};
  font-size: 16px;
  font-weight: 500;
`;

const OverallRating = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 16px;
`;

const StarsContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
`;

const StarButton = styled.button<{ active: boolean }>`
  background: none;
  border: none;
  font-size: 32px;
  color: ${({ active }) => active ? '#FFD700' : '#E0E0E0'};
  cursor: pointer;
  padding: 4px;
  border-radius: 4px;
  transition: all 0.2s ease;

  &:hover {
    color: #FFD700;
    transform: scale(1.1);
  }

  &:focus {
    outline: 2px solid ${({ theme }) => theme.colors.primary.main};
    outline-offset: 2px;
  }
`;

const RatingLabel = styled.span`
  font-size: 16px;
  color: ${({ theme }) => theme.colors.text.primary};
  font-weight: 500;
`;

const CategoryRatings = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
  margin-bottom: 24px;
`;

const CategoryRating = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const CategoryName = styled.span`
  font-size: 14px;
  color: ${({ theme }) => theme.colors.text.primary};
  font-weight: 500;
`;

const CategoryStars = styled.div`
  display: flex;
  align-items: center;
  gap: 2px;
`;

const CategoryStarButton = styled.button<{ active: boolean }>`
  background: none;
  border: none;
  font-size: 20px;
  color: ${({ active }) => active ? '#FFD700' : '#E0E0E0'};
  cursor: pointer;
  padding: 2px;
  border-radius: 2px;
  transition: color 0.2s ease;

  &:hover {
    color: #FFD700;
  }
`;

const FormGroup = styled.div`
  margin-bottom: 20px;
`;

const Label = styled.label`
  display: block;
  margin-bottom: 8px;
  font-weight: 500;
  color: ${({ theme }) => theme.colors.text.primary};
`;

const Input = styled.input`
  width: 100%;
  padding: 12px;
  border: 2px solid ${({ theme }) => theme.colors.grey[300]};
  border-radius: 8px;
  font-size: 16px;
  transition: border-color 0.2s ease;

  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.primary.main};
  }
`;

const Textarea = styled.textarea`
  width: 100%;
  padding: 12px;
  border: 2px solid ${({ theme }) => theme.colors.grey[300]};
  border-radius: 8px;
  font-size: 16px;
  min-height: 100px;
  resize: vertical;
  transition: border-color 0.2s ease;

  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.primary.main};
  }
`;

const ProsConsContainer = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
  margin-bottom: 24px;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const ProsConsGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const TagInput = styled.div`
  display: flex;
  gap: 8px;
  align-items: center;
`;

const TagList = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-top: 8px;
`;

const Tag = styled.span`
  background: ${({ theme }) => theme.colors.primary.main};
  color: white;
  padding: 4px 8px;
  border-radius: 16px;
  font-size: 12px;
  display: flex;
  align-items: center;
  gap: 4px;
`;

const RemoveTagButton = styled.button`
  background: none;
  border: none;
  color: white;
  cursor: pointer;
  font-size: 14px;
  padding: 0;
  margin-left: 4px;

  &:hover {
    opacity: 0.8;
  }
`;

const CheckboxGroup = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 24px;
`;

const Checkbox = styled.input`
  width: 18px;
  height: 18px;
  accent-color: ${({ theme }) => theme.colors.primary.main};
`;

const CheckboxLabel = styled.label`
  font-size: 14px;
  color: ${({ theme }) => theme.colors.text.primary};
  cursor: pointer;
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 12px;
  justify-content: flex-end;

  @media (max-width: 480px) {
    flex-direction: column;
  }
`;

const Button = styled.button<{ variant: 'primary' | 'secondary' }>`
  padding: 12px 24px;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  border: 2px solid ${({ theme, variant }) =>
    variant === 'primary' ? theme.colors.primary.main : theme.colors.grey[300]};

  background: ${({ theme, variant }) =>
    variant === 'primary' ? theme.colors.primary.main : 'transparent'};
  color: ${({ theme, variant }) =>
    variant === 'primary' ? 'white' : theme.colors.text.primary};

  &:hover {
    background: ${({ theme, variant }) =>
      variant === 'primary' ? theme.colors.primary.dark : theme.colors.grey[100]};
    transform: translateY(-1px);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
  }

  @media (max-width: 480px) {
    width: 100%;
  }
`;

const AddRatingForm: React.FC<AddRatingFormProps> = ({
  carId,
  userId,
  userName,
  userAvatar,
  onRatingAdded,
  onCancel,
  className
}) => {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    rating: 0,
    title: '',
    comment: '',
    pros: [] as string[],
    cons: [] as string[],
    verifiedPurchase: false,
    categories: {
      reliability: 0,
      performance: 0,
      comfort: 0,
      value: 0,
      design: 0
    }
  });

  const [prosInput, setProsInput] = useState('');
  const [consInput, setConsInput] = useState('');

  const handleOverallRating = (rating: number) => {
    setFormData(prev => ({ ...prev, rating }));
  };

  const handleCategoryRating = (category: keyof typeof formData.categories, rating: number) => {
    setFormData(prev => ({
      ...prev,
      categories: { ...prev.categories, [category]: rating }
    }));
  };

  const addPro = () => {
    if (prosInput.trim() && !formData.pros.includes(prosInput.trim())) {
      setFormData(prev => ({
        ...prev,
        pros: [...prev.pros, prosInput.trim()]
      }));
      setProsInput('');
    }
  };

  const addCon = () => {
    if (consInput.trim() && !formData.cons.includes(consInput.trim())) {
      setFormData(prev => ({
        ...prev,
        cons: [...prev.cons, consInput.trim()]
      }));
      setConsInput('');
    }
  };

  const removePro = (pro: string) => {
    setFormData(prev => ({
      ...prev,
      pros: prev.pros.filter(p => p !== pro)
    }));
  };

  const removeCon = (con: string) => {
    setFormData(prev => ({
      ...prev,
      cons: prev.cons.filter(c => c !== con)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.rating === 0) {
      alert(t('ratings.errors.noRating'));
      return;
    }

    if (!formData.title.trim()) {
      alert(t('ratings.errors.noTitle'));
      return;
    }

    if (!formData.comment.trim()) {
      alert(t('ratings.errors.noComment'));
      return;
    }

    // Check if all categories are rated
    const unratedCategories = Object.entries(formData.categories)
      .filter(([_, rating]) => rating === 0)
      .map(([category]) => category);

    if (unratedCategories.length > 0) {
      alert(t('ratings.errors.unratedCategories'));
      return;
    }

    setLoading(true);

    try {
      // TODO: Implement rating service
      console.log('Rating data:', {
        carId,
        userId,
        userName,
        userAvatar,
        rating: formData.rating,
        title: formData.title.trim(),
        comment: formData.comment.trim(),
        pros: formData.pros.length > 0 ? formData.pros : undefined,
        cons: formData.cons.length > 0 ? formData.cons : undefined,
        verifiedPurchase: formData.verifiedPurchase,
        categories: formData.categories
      });

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      onRatingAdded();
    } catch (error) {
      console.error('Error adding rating:', error);
      alert(t('ratings.errors.submitFailed'));
    } finally {
      setLoading(false);
    }
  };

  const categoryNames = {
    reliability: t('ratings.categories.reliability'),
    performance: t('ratings.categories.performance'),
    comfort: t('ratings.categories.comfort'),
    value: t('ratings.categories.value'),
    design: t('ratings.categories.design')
  };

  return (
    <FormContainer className={className}>
      <FormTitle>{t('ratings.addReview')}</FormTitle>

      <form onSubmit={handleSubmit}>
        <RatingSection>
          <SectionTitle>{t('ratings.overallRating')}</SectionTitle>
          <OverallRating>
            <StarsContainer>
              {[1, 2, 3, 4, 5].map(star => (
                <StarButton
                  key={star}
                  type="button"
                  active={star <= formData.rating}
                  onClick={() => handleOverallRating(star)}
                  aria-label={`${star} ${t('ratings.stars')}`}
                >
                  ★
                </StarButton>
              ))}
            </StarsContainer>
            <RatingLabel>
              {formData.rating > 0 ? `${formData.rating} ${t('ratings.stars')}` : t('ratings.selectRating')}
            </RatingLabel>
          </OverallRating>
        </RatingSection>

        <RatingSection>
          <SectionTitle>{t('ratings.categoryRatings')}</SectionTitle>
          <CategoryRatings>
            {Object.entries(categoryNames).map(([category, name]) => (
              <CategoryRating key={category}>
                <CategoryName>{name}</CategoryName>
                <CategoryStars>
                  {[1, 2, 3, 4, 5].map(star => (
                    <CategoryStarButton
                      key={star}
                      type="button"
                      active={star <= formData.categories[category as keyof typeof formData.categories]}
                      onClick={() => handleCategoryRating(category as keyof typeof formData.categories, star)}
                      aria-label={`${star} ${t('ratings.stars')} ${t('ratings.for')} ${name}`}
                    >
                      ★
                    </CategoryStarButton>
                  ))}
                </CategoryStars>
              </CategoryRating>
            ))}
          </CategoryRatings>
        </RatingSection>

        <FormGroup>
          <Label htmlFor="title">{t('ratings.reviewTitle')} *</Label>
          <Input
            id="title"
            type="text"
            value={formData.title}
            onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
            placeholder={t('ratings.titlePlaceholder')}
            maxLength={100}
            required
          />
        </FormGroup>

        <FormGroup>
          <Label htmlFor="comment">{t('ratings.reviewComment')} *</Label>
          <Textarea
            id="comment"
            value={formData.comment}
            onChange={(e) => setFormData(prev => ({ ...prev, comment: e.target.value }))}
            placeholder={t('ratings.commentPlaceholder')}
            maxLength={1000}
            required
          />
        </FormGroup>

        <ProsConsContainer>
          <ProsConsGroup>
            <Label>{t('ratings.pros')}</Label>
            <TagInput>
              <Input
                type="text"
                value={prosInput}
                onChange={(e) => setProsInput(e.target.value)}
                placeholder={t('ratings.addPro')}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addPro())}
              />
              <Button
                type="button"
                variant="secondary"
                onClick={addPro}
                disabled={!prosInput.trim()}
              >
                {t('common.add')}
              </Button>
            </TagInput>
            <TagList>
              {formData.pros.map(pro => (
                <Tag key={pro}>
                  {pro}
                  <RemoveTagButton onClick={() => removePro(pro)}>×</RemoveTagButton>
                </Tag>
              ))}
            </TagList>
          </ProsConsGroup>

          <ProsConsGroup>
            <Label>{t('ratings.cons')}</Label>
            <TagInput>
              <Input
                type="text"
                value={consInput}
                onChange={(e) => setConsInput(e.target.value)}
                placeholder={t('ratings.addCon')}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addCon())}
              />
              <Button
                type="button"
                variant="secondary"
                onClick={addCon}
                disabled={!consInput.trim()}
              >
                {t('common.add')}
              </Button>
            </TagInput>
            <TagList>
              {formData.cons.map(con => (
                <Tag key={con}>
                  {con}
                  <RemoveTagButton onClick={() => removeCon(con)}>×</RemoveTagButton>
                </Tag>
              ))}
            </TagList>
          </ProsConsGroup>
        </ProsConsContainer>

        <CheckboxGroup>
          <Checkbox
            id="verifiedPurchase"
            type="checkbox"
            checked={formData.verifiedPurchase}
            onChange={(e) => setFormData(prev => ({ ...prev, verifiedPurchase: e.target.checked }))}
          />
          <CheckboxLabel htmlFor="verifiedPurchase">
            {t('ratings.verifiedPurchase')}
          </CheckboxLabel>
        </CheckboxGroup>

        <ButtonGroup>
          <Button type="button" variant="secondary" onClick={onCancel}>
            {t('common.cancel')}
          </Button>
          <Button type="submit" variant="primary" disabled={loading}>
            {loading ? t('common.submitting') : t('ratings.submitReview')}
          </Button>
        </ButtonGroup>
      </form>
    </FormContainer>
  );
};

export default AddRatingForm;