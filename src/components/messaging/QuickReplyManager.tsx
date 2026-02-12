import { logger } from '../../services/logger-service';
// src/components/messaging/QuickReplyManager.tsx
// Quick Reply Templates Manager Component
// Connected to Backend P2.1 Quick Reply System

import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import {
  createQuickReply,
  getQuickReplies,
  updateQuickReply,
  deleteQuickReply,
  QuickReplyTemplate,
} from '../../services/messaging/cloud-messaging-service';

// ==================== STYLED COMPONENTS ====================

const Container = styled.div`
  padding: 20px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
`;

const Title = styled.h2`
  font-size: 24px;
  font-weight: 600;
  color: #1a1a1a;
  margin: 0;
`;

const AddButton = styled.button`
  background: #4267b2;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s;

  &:hover {
    background: #365899;
  }
`;

const CategoryTabs = styled.div`
  display: flex;
  gap: 10px;
  margin-bottom: 20px;
  overflow-x: auto;
  padding-bottom: 10px;

  &::-webkit-scrollbar {
    height: 4px;
  }

  &::-webkit-scrollbar-thumb {
    background: #ddd;
    border-radius: 2px;
  }
`;

const CategoryTab = styled.button<{ $active?: boolean }>`
  padding: 8px 16px;
  border: 2px solid ${props => props.$active ? '#4267b2' : '#e0e0e0'};
  background: ${props => props.$active ? '#f0f4ff' : 'white'};
  color: ${props => props.$active ? '#4267b2' : '#666'};
  border-radius: 20px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  white-space: nowrap;
  transition: all 0.2s;

  &:hover {
    border-color: #4267b2;
    background: #f0f4ff;
  }
`;

const TemplatesList = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 16px;
`;

const TemplateCard = styled.div`
  background: #f9f9f9;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  padding: 16px;
  transition: box-shadow 0.2s;

  &:hover {
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }
`;

const TemplateHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: start;
  margin-bottom: 12px;
`;

const TemplateTitle = styled.h3`
  font-size: 16px;
  font-weight: 600;
  color: #1a1a1a;
  margin: 0;
  flex: 1;
`;

const TemplateActions = styled.div`
  display: flex;
  gap: 8px;
`;

const IconButton = styled.button`
  background: transparent;
  border: none;
  color: #666;
  cursor: pointer;
  padding: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: color 0.2s;

  &:hover {
    color: #4267b2;
  }

  &.delete:hover {
    color: #f44336;
  }
`;

const TemplateMessage = styled.p`
  font-size: 14px;
  color: #666;
  line-height: 1.5;
  margin: 0 0 12px 0;
  white-space: pre-wrap;
`;

const TemplateFooter = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 12px;
  border-top: 1px solid #e0e0e0;
`;

const UsageCount = styled.span`
  font-size: 12px;
  color: #999;
`;

const LanguageBadge = styled.span`
  background: #e3f2fd;
  color: #1976d2;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
`;

// Modal styles
const Modal = styled.div<{ $show?: boolean }>`
  display: ${props => props.$show ? 'flex' : 'none'};
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  align-items: center;
  justify-content: center;
  z-index: 1000;
`;

const ModalContent = styled.div`
  background: white;
  border-radius: 12px;
  padding: 24px;
  max-width: 500px;
  width: 90%;
  max-height: 90vh;
  overflow-y: auto;
`;

const ModalTitle = styled.h3`
  font-size: 20px;
  font-weight: 600;
  color: #1a1a1a;
  margin: 0 0 20px 0;
`;

const FormGroup = styled.div`
  margin-bottom: 16px;
`;

const Label = styled.label`
  display: block;
  font-size: 14px;
  font-weight: 500;
  color: #333;
  margin-bottom: 8px;
`;

const Input = styled.input`
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #e0e0e0;
  border-radius: 6px;
  font-size: 14px;
  transition: border-color 0.2s;

  &:focus {
    outline: none;
    border-color: #4267b2;
  }
`;

const Textarea = styled.textarea`
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #e0e0e0;
  border-radius: 6px;
  font-size: 14px;
  min-height: 120px;
  resize: vertical;
  transition: border-color 0.2s;

  &:focus {
    outline: none;
    border-color: #4267b2;
  }
`;

const Select = styled.select`
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #e0e0e0;
  border-radius: 6px;
  font-size: 14px;
  background: white;
  cursor: pointer;
  transition: border-color 0.2s;

  &:focus {
    outline: none;
    border-color: #4267b2;
  }
`;

const ModalActions = styled.div`
  display: flex;
  gap: 12px;
  justify-content: flex-end;
  margin-top: 24px;
`;

const Button = styled.button<{ $variant?: 'primary' | 'secondary' }>`
  padding: 10px 20px;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  border: none;

  ${props => props.$variant === 'primary' ? `
    background: #4267b2;
    color: white;
    &:hover {
      background: #365899;
    }
  ` : `
    background: #f0f0f0;
    color: #666;
    &:hover {
      background: #e0e0e0;
    }
  `}

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 60px 20px;
  color: #999;
`;

const LoadingState = styled.div`
  text-align: center;
  padding: 40px 20px;
  color: #666;
`;

// ==================== COMPONENT ====================

interface Props {
  language?: 'bg' | 'en';
  onUseTemplate?: (template: QuickReplyTemplate) => void;
}

const QuickReplyManager: React.FC<Props> = ({ language = 'bg', onUseTemplate }) => {
  const [templates, setTemplates] = useState<QuickReplyTemplate[]>([]);
  const [filteredTemplates, setFilteredTemplates] = useState<QuickReplyTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [showModal, setShowModal] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<QuickReplyTemplate | null>(null);

  const [formData, setFormData] = useState({
    title: '',
    message: '',
    category: 'greeting' as string,
    language: language,
  });

  const categories = [
    { value: 'all', label: language === 'bg' ? 'Всички' : 'All' },
    { value: 'greeting', label: language === 'bg' ? 'Поздрав' : 'Greeting' },
    { value: 'pricing', label: language === 'bg' ? 'Цени' : 'Pricing' },
    { value: 'availability', label: language === 'bg' ? 'Наличност' : 'Availability' },
    { value: 'appointment', label: language === 'bg' ? 'Среща' : 'Appointment' },
    { value: 'closing', label: language === 'bg' ? 'Завършване' : 'Closing' },
    { value: 'custom', label: language === 'bg' ? 'Персонализиран' : 'Custom' },
  ];

  useEffect(() => {
    loadTemplates();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [language]);

  useEffect(() => {
    if (selectedCategory === 'all') {
      setFilteredTemplates(templates);
    } else {
      setFilteredTemplates(templates.filter(t => t.category === selectedCategory));
    }
  }, [templates, selectedCategory]);

  const loadTemplates = async () => {
    setLoading(true);
    try {
      const result = await getQuickReplies({ language });
      if (result.success && result.templates) {
        setTemplates(result.templates);
      }
    } catch (error) {
      logger.error('Error loading templates:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (template?: QuickReplyTemplate) => {
    if (template) {
      setEditingTemplate(template);
      setFormData({
        title: template.title,
        message: template.message,
        category: template.category,
        language: template.language,
      });
    } else {
      setEditingTemplate(null);
      setFormData({
        title: '',
        message: '',
        category: 'greeting',
        language: language,
      });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingTemplate(null);
    setFormData({
      title: '',
      message: '',
      category: 'greeting',
      language: language,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (editingTemplate) {
        const result = await updateQuickReply(editingTemplate.id, {
          title: formData.title,
          message: formData.message,
          category: formData.category,
        });
        
        if (result.success) {
          await loadTemplates();
          handleCloseModal();
        }
      } else {
        const result = await createQuickReply(formData);
        
        if (result.success) {
          await loadTemplates();
          handleCloseModal();
        }
      }
    } catch (error) {
      logger.error('Error saving template:', error);
    }
  };

  const handleDelete = async (templateId: string) => {
    if (window.confirm(language === 'bg' ? 'Сигурни ли сте, че искате да изтриете този шаблон?' : 'Are you sure you want to delete this template?')) {
      try {
        const result = await deleteQuickReply(templateId);
        if (result.success) {
          await loadTemplates();
        }
      } catch (error) {
        logger.error('Error deleting template:', error);
      }
    }
  };

  const handleUseTemplate = (template: QuickReplyTemplate) => {
    if (onUseTemplate) {
      onUseTemplate(template);
    }
  };

  return (
    <Container>
      <Header>
        <Title>{language === 'bg' ? 'Бързи Отговори' : 'Quick Replies'}</Title>
        <AddButton onClick={() => handleOpenModal()}>
          + {language === 'bg' ? 'Нов Шаблон' : 'New Template'}
        </AddButton>
      </Header>

      <CategoryTabs>
        {categories.map(cat => (
          <CategoryTab
            key={cat.value}
            $active={selectedCategory === cat.value}
            onClick={() => setSelectedCategory(cat.value)}
          >
            {cat.label}
          </CategoryTab>
        ))}
      </CategoryTabs>

      {loading ? (
        <LoadingState>{language === 'bg' ? 'Зареждане...' : 'Loading...'}</LoadingState>
      ) : filteredTemplates.length === 0 ? (
        <EmptyState>
          {language === 'bg' ? 'Няма намерени шаблони' : 'No templates found'}
        </EmptyState>
      ) : (
        <TemplatesList>
          {filteredTemplates.map(template => (
            <TemplateCard key={template.id}>
              <TemplateHeader>
                <TemplateTitle>{template.title}</TemplateTitle>
                <TemplateActions>
                  <IconButton onClick={() => handleUseTemplate(template)} title={language === 'bg' ? 'Използвай' : 'Use'}>
                    ✓
                  </IconButton>
                  <IconButton onClick={() => handleOpenModal(template)} title={language === 'bg' ? 'Редактирай' : 'Edit'}>
                    ✎
                  </IconButton>
                  <IconButton className="delete" onClick={() => handleDelete(template.id)} title={language === 'bg' ? 'Изтрий' : 'Delete'}>
                    ×
                  </IconButton>
                </TemplateActions>
              </TemplateHeader>
              <TemplateMessage>{template.message}</TemplateMessage>
              <TemplateFooter>
                <UsageCount>
                  {language === 'bg' ? 'Използван' : 'Used'} {template.usageCount} {language === 'bg' ? 'пъти' : 'times'}
                </UsageCount>
                <LanguageBadge>{template.language.toUpperCase()}</LanguageBadge>
              </TemplateFooter>
            </TemplateCard>
          ))}
        </TemplatesList>
      )}

      <Modal $show={showModal} onClick={handleCloseModal}>
        <ModalContent onClick={(e) => e.stopPropagation()}>
          <ModalTitle>
            {editingTemplate 
              ? (language === 'bg' ? 'Редактирай Шаблон' : 'Edit Template')
              : (language === 'bg' ? 'Нов Шаблон' : 'New Template')
            }
          </ModalTitle>

          <form onSubmit={handleSubmit}>
            <FormGroup>
              <Label>{language === 'bg' ? 'Заглавие' : 'Title'}</Label>
              <Input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
                maxLength={100}
              />
            </FormGroup>

            <FormGroup>
              <Label>{language === 'bg' ? 'Категория' : 'Category'}</Label>
              <Select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                required
              >
                {categories.filter(cat => cat.value !== 'all').map(cat => (
                  <option key={cat.value} value={cat.value}>
                    {cat.label}
                  </option>
                ))}
              </Select>
            </FormGroup>

            <FormGroup>
              <Label>{language === 'bg' ? 'Съобщение' : 'Message'}</Label>
              <Textarea
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                required
                maxLength={1000}
                placeholder={language === 'bg' ? 'Въведете съобщение...' : 'Enter message...'}
              />
            </FormGroup>

            <FormGroup>
              <Label>{language === 'bg' ? 'Език' : 'Language'}</Label>
              <Select
                value={formData.language}
                onChange={(e) => setFormData({ ...formData, language: e.target.value as 'bg' | 'en' })}
                required
              >
                <option value="bg">Български (BG)</option>
                <option value="en">English (EN)</option>
              </Select>
            </FormGroup>

            <ModalActions>
              <Button type="button" $variant="secondary" onClick={handleCloseModal}>
                {language === 'bg' ? 'Отказ' : 'Cancel'}
              </Button>
              <Button type="submit" $variant="primary">
                {editingTemplate 
                  ? (language === 'bg' ? 'Запази' : 'Save')
                  : (language === 'bg' ? 'Създай' : 'Create')
                }
              </Button>
            </ModalActions>
          </form>
        </ModalContent>
      </Modal>
    </Container>
  );
};

export default QuickReplyManager;
