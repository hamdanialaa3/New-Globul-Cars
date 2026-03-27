import { logger } from '../services/logger-service';
import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { collection, getDocs, doc, updateDoc, deleteDoc, addDoc } from 'firebase/firestore';

const IS_DEV = process.env.NODE_ENV === 'development';

import { db } from '../firebase/firebase-config';
import { Database, Edit, Trash2, Plus, Save, X } from 'lucide-react';
import { useAdminLang } from '../contexts/AdminLanguageContext';

const Container = styled.div`
  padding: 2rem;
  background: linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%);
  border-radius: 16px;
  margin: 1rem;
  color: white;
`;

const Title = styled.h2`
  color: #ffd700;
  margin-bottom: 2rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const TabsContainer = styled.div`
  display: flex;
  gap: 1rem;
  margin-bottom: 2rem;
`;

const Tab = styled.button<{ active: boolean }>`
  padding: 0.75rem 1.5rem;
  background: ${props => props.active ? '#6366F1' : 'rgba(255, 255, 255, 0.1)'};
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    background: ${props => props.active ? '#6366F1' : 'rgba(255, 255, 255, 0.2)'};
  }
`;

const DataTable = styled.div`
  background: rgba(255, 255, 255, 0.05);
  border-radius: 12px;
  overflow: hidden;
`;

const TableHeader = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr 1fr auto;
  gap: 1rem;
  padding: 1rem;
  background: rgba(255, 215, 0, 0.1);
  font-weight: bold;
`;

const TableRow = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr 1fr auto;
  gap: 1rem;
  padding: 1rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  transition: background 0.3s ease;

  &:hover {
    background: rgba(255, 255, 255, 0.05);
  }
`;

const ActionButton = styled.button<{ variant?: 'edit' | 'delete' | 'save' | 'cancel' }>`
  padding: 0.5rem;
  background: ${props => {
    switch (props.variant) {
      case 'edit': return '#4CAF50';
      case 'delete': return '#f44336';
      case 'save': return '#2196F3';
      case 'cancel': return '#757575';
      default: return '#6366F1';
    }
  }};
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  margin: 0 0.25rem;
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
  }
`;

const Input = styled.input`
  padding: 0.5rem;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 6px;
  color: white;
  width: 100%;

  &:focus {
    outline: none;
    border-color: #6366F1;
  }
`;

const AddButton = styled.button`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 1rem 2rem;
  background: linear-gradient(135deg, #4CAF50 0%, #45a049 100%);
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  margin-bottom: 1rem;
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(76, 175, 80, 0.4);
  }
`;

interface DataItem {
  id: string;
  [key: string]: unknown;
}

const RealDataManager: React.FC = () => {
  const { t } = useAdminLang();
  if (!IS_DEV) return null;

  const [activeTab, setActiveTab] = useState('users');
  const [data, setData] = useState<DataItem[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editData, setEditData] = useState<Record<string, unknown>>({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadData();
  }, [activeTab]);

  const loadData = async () => {
    setLoading(true);
    try {
      const snapshot = await getDocs(collection(db, activeTab));
      const items = snapshot.docs.map((doc: any) => ({ id: doc.id, ...doc.data() }));
      setData(items);
    } catch (error) {
      logger.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (item: unknown) => {
    setEditingId(item.id);
    setEditData({ ...item });
  };

  const handleSave = async () => {
    if (!editingId) return;

    try {
      const { id, ...updateData } = editData;
      await updateDoc(doc(db, activeTab, editingId), updateData);
      await loadData();
      setEditingId(null);
      setEditData({});
    } catch (error) {
      logger.error('Error updating data:', error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm(`${t.common.delete}?`)) return;

    try {
      await deleteDoc(doc(db, activeTab, id));
      await loadData();
    } catch (error) {
      logger.error('Error deleting data:', error);
    }
  };

  const handleAdd = async () => {
    const newItem = activeTab === 'users'
      ? { displayName: t.realData.newUserDefault, email: 'new@example.com', profileType: 'private' }
      : { make: 'BMW', model: 'X5', price: 25000, status: 'active' };

    try {
      await addDoc(collection(db, activeTab), newItem);
      await loadData();
    } catch (error) {
      logger.error('Error adding data:', error);
    }
  };

  const renderTableContent = () => {
    if (activeTab === 'users') {
      return (
        <>
          <TableHeader>
            <div>{t.realData.name}</div>
            <div>{t.realData.email}</div>
            <div>{t.realData.accountType}</div>
            <div>{t.common.actions}</div>
          </TableHeader>
          {data.map((user: any) => (
            <TableRow key={user.id}>
              <div>
                {editingId === user.id ? (
                  <Input
                    value={editData.displayName || ''}
                    onChange={(e) => setEditData({ ...editData, displayName: e.target.value })}
                  />
                ) : (
                  user.displayName || t.common.unknown
                )}
              </div>
              <div>
                {editingId === user.id ? (
                  <Input
                    value={editData.email || ''}
                    onChange={(e) => setEditData({ ...editData, email: e.target.value })}
                  />
                ) : (
                  user.email
                )}
              </div>
              <div>
                {editingId === user.id ? (
                  <Input
                    value={editData.profileType || ''}
                    onChange={(e) => setEditData({ ...editData, profileType: e.target.value })}
                  />
                ) : (
                  user.profileType || 'private'
                )}
              </div>
              <div>
                {editingId === user.id ? (
                  <>
                    <ActionButton variant="save" onClick={handleSave}>
                      <Save size={16} />
                    </ActionButton>
                    <ActionButton variant="cancel" onClick={() => setEditingId(null)}>
                      <X size={16} />
                    </ActionButton>
                  </>
                ) : (
                  <>
                    <ActionButton variant="edit" onClick={() => handleEdit(user)}>
                      <Edit size={16} />
                    </ActionButton>
                    <ActionButton variant="delete" onClick={() => handleDelete(user.id)}>
                      <Trash2 size={16} />
                    </ActionButton>
                  </>
                )}
              </div>
            </TableRow>
          ))}
        </>
      );
    } else {
      return (
        <>
          <TableHeader>
            <div>{t.realData.make}</div>
            <div>{t.realData.model}</div>
            <div>{t.realData.price}</div>
            <div>{t.common.actions}</div>
          </TableHeader>
          {data.map((car: any) => (
            <TableRow key={car.id}>
              <div>
                {editingId === car.id ? (
                  <Input
                    value={editData.make || ''}
                    onChange={(e) => setEditData({ ...editData, make: e.target.value })}
                  />
                ) : (
                  car.make
                )}
              </div>
              <div>
                {editingId === car.id ? (
                  <Input
                    value={editData.model || ''}
                    onChange={(e) => setEditData({ ...editData, model: e.target.value })}
                  />
                ) : (
                  car.model
                )}
              </div>
              <div>
                {editingId === car.id ? (
                  <Input
                    type="number"
                    value={editData.price || ''}
                    onChange={(e) => setEditData({ ...editData, price: parseInt(e.target.value) })}
                  />
                ) : (
                  `${car.price}€`
                )}
              </div>
              <div>
                {editingId === car.id ? (
                  <>
                    <ActionButton variant="save" onClick={handleSave}>
                      <Save size={16} />
                    </ActionButton>
                    <ActionButton variant="cancel" onClick={() => setEditingId(null)}>
                      <X size={16} />
                    </ActionButton>
                  </>
                ) : (
                  <>
                    <ActionButton variant="edit" onClick={() => handleEdit(car)}>
                      <Edit size={16} />
                    </ActionButton>
                    <ActionButton variant="delete" onClick={() => handleDelete(car.id)}>
                      <Trash2 size={16} />
                    </ActionButton>
                  </>
                )}
              </div>
            </TableRow>
          ))}
        </>
      );
    }
  };

  return (
    <Container>
      <Title><Database size={24} />{t.realData.manageRealData}</Title>

      <TabsContainer>
        <Tab active={activeTab === 'users'} onClick={() => setActiveTab('users')}>
          {t.realData.usersTab} ({data.length})
        </Tab>
        <Tab active={activeTab === 'cars'} onClick={() => setActiveTab('cars')}>
          {t.realData.carsTab} ({data.length})
        </Tab>
      </TabsContainer>

      <AddButton onClick={handleAdd}>
        <Plus size={20} />
        {activeTab === 'users' ? t.realData.addUser : t.realData.addCar}
      </AddButton>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '2rem' }}>
          {t.common.loading}
        </div>
      ) : (
        <DataTable>
          {renderTableContent()}
        </DataTable>
      )}
    </Container>
  );
};

export default RealDataManager;
