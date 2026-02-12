import React, { useState } from 'react';
import { getAuth } from 'firebase/auth';
import styled from 'styled-components';
import {
  Megaphone,
  Plus,
  Trash2,
  Save,
  Send,
  AlertCircle,
  CheckCircle,
  Eye,
  EyeOff,
  Calendar,
  Type,
  Users
} from 'lucide-react';
import { useAdminLang } from '@/contexts/AdminLanguageContext';

const Container = styled.div`
  background: #0f1419;
  border-radius: 12px;
  border: 1px solid #1e2432;
  padding: 24px;
  margin: 20px;
`;

const Header = styled.div`
  margin-bottom: 24px;
`;

const Title = styled.h2`
  font-size: 24px;
  font-weight: 700;
  color: #ff8c61;
  margin: 0 0 8px 0;
  display: flex;
  align-items: center;
  gap: 10px;
`;

const Subtitle = styled.p`
  font-size: 14px;
  color: #9ca3af;
  margin: 0;
`;

const ActionBar = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  padding: 16px;
  background: #1a1f2e;
  border-radius: 8px;
  border: 1px solid #2d3748;
`;

const Button = styled.button<{ $variant?: 'primary' | 'secondary' | 'danger' }>`
  padding: 10px 20px;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  gap: 8px;

  ${props => {
    if (props.$variant === 'danger') {
      return `
        background: #ef4444;
        color: #fff;
        &:hover {
          background: #dc2626;
        }
      `;
    }
    if (props.$variant === 'secondary') {
      return `
        background: #374151;
        color: #e5e7eb;
        &:hover {
          background: #4b5563;
        }
      `;
    }
    return `
      background: #ff8c61;
      color: #0f1419;
      &:hover {
        background: #ff7a47;
      }
    `;
  }}

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const AnnouncementList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const AnnouncementCard = styled.div<{ $active: boolean }>`
  background: #1a1f2e;
  border-radius: 8px;
  padding: 20px;
  border: 1px solid ${props => props.$active ? '#065f46' : '#2d3748'};
  opacity: ${props => props.$active ? 1 : 0.7};
`;

const CardHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 16px;
`;

const CardTitle = styled.div`
  font-size: 16px;
  font-weight: 600;
  color: #e5e7eb;
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
`;

const CardMeta = styled.div`
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
`;

const MetaBadge = styled.span<{ $variant?: 'success' | 'warning' | 'info' }>`
  padding: 4px 10px;
  border-radius: 12px;
  font-size: 11px;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 4px;
  
  ${props => {
    if (props.$variant === 'success') {
      return `
        background: #064e3b;
        color: #6ee7b7;
      `;
    }
    if (props.$variant === 'warning') {
      return `
        background: #78350f;
        color: #fcd34d;
      `;
    }
    return `
      background: #1e3a8a;
      color: #93c5fd;
    `;
  }}
`;

const CardActions = styled.div`
  display: flex;
  gap: 8px;
`;

const IconButton = styled.button<{ $variant?: 'danger' }>`
  padding: 8px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  
  ${props => props.$variant === 'danger' ? `
    background: #7f1d1d;
    color: #fca5a5;
    &:hover {
      background: #991b1b;
    }
  ` : `
    background: #374151;
    color: #e5e7eb;
    &:hover {
      background: #4b5563;
    }
  `}

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const CardContent = styled.div`
  font-size: 14px;
  color: #d1d5db;
  line-height: 1.6;
  margin-bottom: 16px;
`;

const CardFooter = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 12px;
  border-top: 1px solid #374151;
  font-size: 12px;
  color: #6b7280;
`;

const FormModal = styled.div`
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: #1a1f2e;
  border: 2px solid #374151;
  border-radius: 12px;
  padding: 24px;
  z-index: 1000;
  max-width: 600px;
  width: 90%;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.5);
`;

const Overlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  z-index: 999;
`;

const FormTitle = styled.h3`
  font-size: 20px;
  font-weight: 700;
  color: #e5e7eb;
  margin: 0 0 20px 0;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const FormField = styled.div`
  margin-bottom: 16px;
`;

const Label = styled.label`
  display: block;
  font-size: 13px;
  font-weight: 500;
  color: #e5e7eb;
  margin-bottom: 8px;
`;

const Input = styled.input`
  width: 100%;
  background: #0f1419;
  border: 1px solid #374151;
  border-radius: 6px;
  padding: 10px 12px;
  color: #e5e7eb;
  font-size: 14px;

  &:focus {
    outline: none;
    border-color: #ff8c61;
  }
`;

const TextArea = styled.textarea`
  width: 100%;
  background: #0f1419;
  border: 1px solid #374151;
  border-radius: 6px;
  padding: 10px 12px;
  color: #e5e7eb;
  font-size: 14px;
  min-height: 120px;
  resize: vertical;
  font-family: inherit;

  &:focus {
    outline: none;
    border-color: #ff8c61;
  }
`;

const Select = styled.select`
  width: 100%;
  background: #0f1419;
  border: 1px solid #374151;
  border-radius: 6px;
  padding: 10px 12px;
  color: #e5e7eb;
  font-size: 14px;
  cursor: pointer;

  &:focus {
    outline: none;
    border-color: #ff8c61;
  }
`;

const FormActions = styled.div`
  display: flex;
  gap: 12px;
  margin-top: 24px;
`;

const Message = styled.div<{ $type: 'success' | 'error' }>`
  padding: 12px 16px;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 500;
  margin-bottom: 16px;
  display: flex;
  align-items: center;
  gap: 8px;

  ${props => props.$type === 'success' ? `
    background: #064e3b;
    color: #6ee7b7;
    border: 1px solid #047857;
  ` : `
    background: #7f1d1d;
    color: #fca5a5;
    border: 1px solid #b91c1c;
  `}
`;

interface Announcement {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'success';
  target: 'all' | 'buyers' | 'sellers' | 'dealers';
  active: boolean;
  startDate: string;
  endDate: string;
  createdAt: string;
  createdBy: string;
}

const AnnouncementManager: React.FC = () => {
  const { t } = useAdminLang();
  const [announcements, setAnnouncements] = useState<Announcement[]>([
    {
      id: '1',
      title: 'System Upgrade',
      message: 'System upgrade scheduled Friday 12 AM - 2 AM. Services will not be affected.',
      type: 'info',
      target: 'all',
      active: true,
      startDate: '2026-02-07',
      endDate: '2026-02-14',
      createdAt: '2026-02-05',
      createdBy: 'system'
    },
    {
      id: '2',
      title: 'Special Offer for Dealers',
      message: '50% discount on featured listings for new dealers for one week!',
      type: 'success',
      target: 'dealers',
      active: true,
      startDate: '2026-02-07',
      endDate: '2026-02-15',
      createdAt: '2026-02-06',
      createdBy: 'system'
    }
  ]);

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const [formData, setFormData] = useState({
    title: '',
    message: '',
    type: 'info' as 'info' | 'warning' | 'success',
    target: 'all' as 'all' | 'buyers' | 'sellers' | 'dealers',
    startDate: '',
    endDate: ''
  });

  const showMessage = (type: 'success' | 'error', text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 3000);
  };

  const handleCreate = () => {
    setFormData({
      title: '',
      message: '',
      type: 'info',
      target: 'all',
      startDate: '',
      endDate: ''
    });
    setEditingId(null);
    setShowForm(true);
  };

  const handleEdit = (announcement: Announcement) => {
    setFormData({
      title: announcement.title,
      message: announcement.message,
      type: announcement.type,
      target: announcement.target,
      startDate: announcement.startDate,
      endDate: announcement.endDate
    });
    setEditingId(announcement.id);
    setShowForm(true);
  };

  const handleSubmit = () => {
    if (!formData.title || !formData.message) {
      showMessage('error', '❌ ' + t.announcements.fillRequired);
      return;
    }

    const adminEmail = getAuth().currentUser?.email || 'unknown';

    if (editingId) {
      // Update existing
      setAnnouncements(prev =>
        prev.map(a =>
          a.id === editingId
            ? {
              ...a,
              ...formData
            }
            : a
        )
      );
      showMessage('success', '✅ ' + t.announcements.updateSuccess);
    } else {
      // Create new
      const newAnnouncement: Announcement = {
        id: Date.now().toString(),
        ...formData,
        active: true,
        createdAt: new Date().toISOString().split('T')[0],
        createdBy: adminEmail
      };
      setAnnouncements(prev => [newAnnouncement, ...prev]);
      showMessage('success', '✅ ' + t.announcements.createSuccess);
    }

    setShowForm(false);
  };

  const handleToggleActive = (id: string) => {
    setAnnouncements(prev =>
      prev.map(a =>
        a.id === id ? { ...a, active: !a.active } : a
      )
    );
    showMessage('success', '✅ ' + t.announcements.statusSuccess);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('⚠️ ' + t.announcements.deleteConfirm)) {
      setAnnouncements(prev => prev.filter(a => a.id !== id));
      showMessage('success', '✅ ' + t.announcements.deleteSuccess);
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'info': return t.announcements.info;
      case 'warning': return t.common.warning;
      case 'success': return t.announcements.success;
      default: return type;
    }
  };

  const getTargetLabel = (target: string) => {
    switch (target) {
      case 'all': return t.announcements.all;
      case 'buyers': return t.announcements.buyers;
      case 'sellers': return t.announcements.sellers;
      case 'dealers': return t.announcements.dealers;
      default: return target;
    }
  };

  return (
    <Container>
      <Header>
        <Title>
          <Megaphone size={24} />
          {t.announcements.title}
        </Title>
        <Subtitle>
          {t.announcements.subtitle}
        </Subtitle>
      </Header>

      {message && (
        <Message $type={message.type}>
          {message.type === 'success' ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
          {message.text}
        </Message>
      )}

      <ActionBar>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <Megaphone size={20} color="#9ca3af" />
          <span style={{ color: '#9ca3af', fontSize: '14px' }}>
            {announcements.filter(a => a.active).length} {t.announcements.activeAds}
          </span>
        </div>
        <Button onClick={handleCreate}>
          <Plus size={16} />
          {t.announcements.newAd}
        </Button>
      </ActionBar>

      <AnnouncementList>
        {announcements.map(announcement => (
          <AnnouncementCard key={announcement.id} $active={announcement.active}>
            <CardHeader>
              <div>
                <CardTitle>
                  <Megaphone size={16} />
                  {announcement.title}
                </CardTitle>
                <CardMeta>
                  <MetaBadge $variant={
                    announcement.type === 'success' ? 'success' :
                      announcement.type === 'warning' ? 'warning' : 'info'
                  }>
                    <Type size={10} />
                    {getTypeLabel(announcement.type)}
                  </MetaBadge>
                  <MetaBadge $variant="info">
                    <Users size={10} />
                    {getTargetLabel(announcement.target)}
                  </MetaBadge>
                  <MetaBadge $variant={announcement.active ? 'success' : 'warning'}>
                    {announcement.active ? <Eye size={10} /> : <EyeOff size={10} />}
                    {announcement.active ? t.featured.active : t.common.inactive}
                  </MetaBadge>
                </CardMeta>
              </div>
              <CardActions>
                <IconButton onClick={() => handleEdit(announcement)}>
                  <Save size={14} />
                </IconButton>
                <IconButton onClick={() => handleToggleActive(announcement.id)}>
                  {announcement.active ? <EyeOff size={14} /> : <Eye size={14} />}
                </IconButton>
                <IconButton $variant="danger" onClick={() => handleDelete(announcement.id)}>
                  <Trash2 size={14} />
                </IconButton>
              </CardActions>
            </CardHeader>

            <CardContent>{announcement.message}</CardContent>

            <CardFooter>
              <div style={{ display: 'flex', gap: '16px' }}>
                <span>
                  <Calendar size={12} style={{ display: 'inline', marginLeft: '4px' }} />
                  {t.announcements.startDate} {announcement.startDate} {t.announcements.endDate} {announcement.endDate}
                </span>
              </div>
              <span>{t.announcements.by} {announcement.createdBy}</span>
            </CardFooter>
          </AnnouncementCard>
        ))}
      </AnnouncementList>

      {/* Form Modal */}
      {showForm && (
        <>
          <Overlay onClick={() => setShowForm(false)} />
          <FormModal>
            <FormTitle>
              <Megaphone size={20} />
              {editingId ? t.announcements.update : t.announcements.newAd}
            </FormTitle>

            <FormField>
              <Label>{t.announcements.titleLabel} *</Label>
              <Input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder={t.announcements.titleLabel}
              />
            </FormField>

            <FormField>
              <Label>{t.announcements.messageLabel} *</Label>
              <TextArea
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                placeholder={t.announcements.messageLabel}
              />
            </FormField>

            <FormField>
              <Label>{t.announcements.typeLabel}</Label>
              <Select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
              >
                <option value="info">{t.announcements.info}</option>
                <option value="warning">{t.common.warning}</option>
                <option value="success">{t.announcements.success}</option>
              </Select>
            </FormField>

            <FormField>
              <Label>{t.announcements.targetLabel}</Label>
              <Select
                value={formData.target}
                onChange={(e) => setFormData({ ...formData, target: e.target.value as any })}
              >
                <option value="all">{t.announcements.all}</option>
                <option value="buyers">{t.announcements.buyers}</option>
                <option value="sellers">{t.announcements.sellers}</option>
                <option value="dealers">{t.announcements.dealers}</option>
              </Select>
            </FormField>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <FormField>
                <Label>{t.announcements.startDateLabel}</Label>
                <Input
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                />
              </FormField>

              <FormField>
                <Label>{t.announcements.endDateLabel}</Label>
                <Input
                  type="date"
                  value={formData.endDate}
                  onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                />
              </FormField>
            </div>

            <FormActions>
              <Button onClick={handleSubmit}>
                <Send size={16} />
                {editingId ? t.announcements.update : t.announcements.publish}
              </Button>
              <Button $variant="secondary" onClick={() => setShowForm(false)}>
                {t.common.cancel}
              </Button>
            </FormActions>
          </FormModal>
        </>
      )}
    </Container>
  );
};

export default AnnouncementManager;
