import React from 'react';
import { Car, Plus } from 'lucide-react';
import * as S from './styles';
import { PersonalVehicle } from '@/types/personal-vehicle.types';
import { PersonalVehicleCard } from '@/components/Profile';

type Props = {
  language: 'bg' | 'en';
  themePrimary: string;
  personalVehicles: PersonalVehicle[];
  isLoading: boolean;
  onAddVehicle: () => void;
  onDeleteVehicle: (vehicleId: string) => void;
};

export const PersonalVehiclesSection: React.FC<Props> = ({
  language,
  themePrimary,
  personalVehicles,
  isLoading,
  onAddVehicle,
  onDeleteVehicle,
}) => {
  return (
    <S.ContentSection $themeColor={themePrimary} style={{ marginTop: '24px' }}>
      <S.SectionHeader>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
          <div>
            <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', margin: 0 }}>
              <Car size={24} />
              {language === 'bg' ? 'Моите превозни средства' : 'My Personal Vehicles'}
              {personalVehicles.length > 0 && (
                <span style={{ 
                  fontSize: '0.9rem', 
                  color: 'var(--text-secondary)',
                  fontWeight: 'normal',
                  marginLeft: '0.5rem'
                }}>
                  ({personalVehicles.length})
                </span>
              )}
            </h2>
          </div>
          <button
            onClick={onAddVehicle}
            style={{
              padding: '0.75rem 1.5rem',
              background: 'var(--accent-primary)',
              color: 'white',
              border: 'none',
              borderRadius: '12px',
              fontSize: '0.95rem',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              transition: 'all 0.3s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 8px 24px rgba(59, 130, 246, 0.4)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = 'none';
            }}
          >
            <Plus size={18} />
            {language === 'bg' ? 'Добави превозно средство' : 'Add Vehicle'}
          </button>
        </div>
      </S.SectionHeader>

      {isLoading ? (
        <div style={{ textAlign: 'center', padding: '3rem' }}>
          {language === 'bg' ? 'Зареждане...' : 'Loading...'}
        </div>
      ) : personalVehicles.length > 0 ? (
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', 
          gap: '1.5rem',
          marginTop: '1.5rem'
        }}>
          {personalVehicles.map(vehicle => (
            <PersonalVehicleCard
              key={vehicle.id}
              vehicle={vehicle}
              onDelete={onDeleteVehicle}
            />
          ))}
        </div>
      ) : (
        <div style={{
          textAlign: 'center',
          padding: '3rem',
          background: 'var(--bg-secondary)',
          borderRadius: '12px',
          border: '2px dashed var(--border)',
        }}>
          <Car size={48} color="var(--text-tertiary)" style={{ marginBottom: '1rem' }} />
          <h3 style={{ fontSize: '1.1rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
            {language === 'bg' ? 'Няма добавени превозни средства' : 'No vehicles added'}
          </h3>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-tertiary)', marginBottom: '1.5rem' }}>
            {language === 'bg'
              ? 'Добавете вашето превозно средство, за да следите неговите данни и получавате напомняния.'
              : 'Add your vehicle to track its data and receive reminders.'}
          </p>
          <button
            onClick={onAddVehicle}
            style={{
              padding: '0.875rem 1.75rem',
              background: 'var(--accent-primary)',
              color: 'white',
              border: 'none',
              borderRadius: '12px',
              fontSize: '1rem',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              transition: 'all 0.3s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 8px 24px rgba(59, 130, 246, 0.4)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = 'none';
            }}
          >
            <Plus size={20} />
            {language === 'bg' ? 'Добави превозно средство сега' : 'Add vehicle now'}
          </button>
        </div>
      )}
    </S.ContentSection>
  );
};

export default PersonalVehiclesSection;
