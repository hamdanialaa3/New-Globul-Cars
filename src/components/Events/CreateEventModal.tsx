/**
 * CreateEventModal - Modal for creating car events
 * Location: Bulgaria | Languages: BG/EN
 */

import React, { useState } from 'react';
import styled from 'styled-components';
import { X, Calendar, MapPin, Users, Tag } from 'lucide-react';
import { eventsService, EventCreateData } from '@/services/social/events.service';
import { logger } from '@/services/logger-service';

interface CreateEventModalProps {
  userId: string;
  onClose: () => void;
  onCreated: () => void;
}

const EVENT_TYPES = [
  { value: 'meetup', label: 'Среща / Meetup' },
  { value: 'car_show', label: 'Автоизложение / Car Show' },
  { value: 'track_day', label: 'Трак ден / Track Day' },
  { value: 'workshop', label: 'Работилница / Workshop' },
  { value: 'cruise', label: 'Круиз / Cruise' },
  { value: 'other', label: 'Друго / Other' },
] as const;

const BULGARIAN_CITIES = [
  'София', 'Пловдив', 'Варна', 'Бургас', 'Русе', 'Стара Загора',
  'Плевен', 'Сливен', 'Добрич', 'Шумен', 'Перник', 'Хасково',
  'Ямбол', 'Пазарджик', 'Благоевград', 'Велико Търново',
];

const CreateEventModal: React.FC<CreateEventModalProps> = ({ userId, onClose, onCreated }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [eventType, setEventType] = useState<EventCreateData['eventType']>('meetup');
  const [city, setCity] = useState('');
  const [address, setAddress] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [capacity, setCapacity] = useState('');
  const [tags, setTags] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!title.trim() || !city || !address.trim() || !startDate || !endDate) {
      setError('Моля, попълнете всички задължителни полета / Please fill all required fields');
      return;
    }

    const start = new Date(startDate);
    const end = new Date(endDate);

    if (end <= start) {
      setError('Крайната дата трябва да е след началната / End date must be after start date');
      return;
    }

    if (start < new Date()) {
      setError('Началната дата не може да е в миналото / Start date cannot be in the past');
      return;
    }

    try {
      setSubmitting(true);

      const eventData: EventCreateData = {
        title: title.trim(),
        description: description.trim(),
        eventType,
        location: {
          address: address.trim(),
          city,
          coordinates: { lat: 42.6977, lng: 23.3219 }, // Default Sofia coords
        },
        startDate: start,
        endDate: end,
        capacity: capacity ? parseInt(capacity, 10) : undefined,
        visibility: 'public',
        tags: tags.split(',').map(t => t.trim()).filter(Boolean),
        requiresApproval: false,
      };

      await eventsService.createEvent(userId, eventData);

      onCreated();
      onClose();
    } catch (err) {
      logger.error('Error creating event', err as Error);
      setError('Грешка при създаване на събитието / Error creating event');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Overlay onClick={onClose}>
      <Modal onClick={(e) => e.stopPropagation()}>
        <ModalHeader>
          <h2>Създай събитие / Create Event</h2>
          <CloseButton onClick={onClose}><X size={20} /></CloseButton>
        </ModalHeader>

        <Form onSubmit={handleSubmit}>
          {error && <ErrorMessage>{error}</ErrorMessage>}

          <FormGroup>
            <Label>Заглавие / Title *</Label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Напр. BMW Среща София / BMW Meetup Sofia"
              maxLength={100}
            />
          </FormGroup>

          <FormGroup>
            <Label>Описание / Description</Label>
            <TextArea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Опишете събитието..."
              rows={3}
              maxLength={2000}
            />
          </FormGroup>

          <FormRow>
            <FormGroup>
              <Label><Tag size={14} /> Тип / Type *</Label>
              <Select value={eventType} onChange={(e) => setEventType(e.target.value as EventCreateData['eventType'])}>
                {EVENT_TYPES.map(t => (
                  <option key={t.value} value={t.value}>{t.label}</option>
                ))}
              </Select>
            </FormGroup>

            <FormGroup>
              <Label><Users size={14} /> Капацитет / Capacity</Label>
              <Input
                type="number"
                value={capacity}
                onChange={(e) => setCapacity(e.target.value)}
                placeholder="Без ограничение"
                min="1"
                max="10000"
              />
            </FormGroup>
          </FormRow>

          <FormGroup>
            <Label><MapPin size={14} /> Град / City *</Label>
            <Select value={city} onChange={(e) => setCity(e.target.value)}>
              <option value="">Изберете град...</option>
              {BULGARIAN_CITIES.map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </Select>
          </FormGroup>

          <FormGroup>
            <Label>Адрес / Address *</Label>
            <Input
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="ул. / бул. ..."
              maxLength={200}
            />
          </FormGroup>

          <FormRow>
            <FormGroup>
              <Label><Calendar size={14} /> Начало / Start *</Label>
              <Input
                type="datetime-local"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </FormGroup>

            <FormGroup>
              <Label><Calendar size={14} /> Край / End *</Label>
              <Input
                type="datetime-local"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </FormGroup>
          </FormRow>

          <FormGroup>
            <Label>Тагове / Tags (разделени със запетая)</Label>
            <Input
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              placeholder="BMW, drift, tuning..."
              maxLength={200}
            />
          </FormGroup>

          <SubmitButton type="submit" disabled={submitting}>
            {submitting ? 'Създаване...' : 'Създай събитие / Create Event'}
          </SubmitButton>
        </Form>
      </Modal>
    </Overlay>
  );
};

export default CreateEventModal;

// ==================== STYLED COMPONENTS ====================

const Overlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
`;

const Modal = styled.div`
  background: white;
  border-radius: 16px;
  max-width: 600px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
`;

const ModalHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 24px 24px 0;

  h2 {
    font-size: 1.4rem;
    font-weight: 700;
    margin: 0;
    color: #212529;
  }
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  color: #6c757d;
  padding: 4px;
  border-radius: 8px;

  &:hover {
    background: #f1f3f5;
    color: #212529;
  }
`;

const Form = styled.form`
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
  flex: 1;
`;

const FormRow = styled.div`
  display: flex;
  gap: 16px;

  @media (max-width: 500px) {
    flex-direction: column;
  }
`;

const Label = styled.label`
  font-size: 0.85rem;
  font-weight: 600;
  color: #495057;
  display: flex;
  align-items: center;
  gap: 6px;
`;

const Input = styled.input`
  padding: 10px 14px;
  border: 2px solid #dee2e6;
  border-radius: 10px;
  font-size: 0.95rem;
  color: #212529;
  transition: border-color 0.2s;

  &:focus {
    outline: none;
    border-color: #3B82F6;
  }
`;

const TextArea = styled.textarea`
  padding: 10px 14px;
  border: 2px solid #dee2e6;
  border-radius: 10px;
  font-size: 0.95rem;
  color: #212529;
  resize: vertical;
  font-family: inherit;
  transition: border-color 0.2s;

  &:focus {
    outline: none;
    border-color: #3B82F6;
  }
`;

const Select = styled.select`
  padding: 10px 14px;
  border: 2px solid #dee2e6;
  border-radius: 10px;
  font-size: 0.95rem;
  color: #212529;
  background: white;
  transition: border-color 0.2s;

  &:focus {
    outline: none;
    border-color: #3B82F6;
  }
`;

const ErrorMessage = styled.div`
  background: #FFF5F5;
  color: #C53030;
  padding: 12px 16px;
  border-radius: 10px;
  font-size: 0.9rem;
  border: 1px solid #FED7D7;
`;

const SubmitButton = styled.button`
  padding: 14px 24px;
  border-radius: 12px;
  border: none;
  background: linear-gradient(135deg, #3B82F6, #2563EB);
  color: white;
  font-size: 1rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s;
  margin-top: 8px;

  &:hover:not(:disabled) {
    transform: translateY(-1px);
    box-shadow: 0 6px 16px rgba(59, 130, 246, 0.3);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;
