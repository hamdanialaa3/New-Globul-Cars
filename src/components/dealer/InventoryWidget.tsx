/**
 * Inventory Widget for Dealer Dashboard
 * 
 * Displays a comprehensive table of the dealer's inventory with:
 * - Status indicators (Active, Draft, Sold)
 * - Quick actions (Edit, Promote, Delete)
 * - Performance metrics per car (Views, Favorites)
 */

import React from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { Edit, Eye, Heart, MoreVertical, Trash2, Zap } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import { UnifiedCar } from '../../services/car/unified-car-types';
import { useNavigate } from 'react-router-dom';

const WidgetContainer = styled(motion.div)`
  background: white;
  border-radius: 16px;
  padding: 1.5rem;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
  height: 100%;
  display: flex;
  flex-direction: column;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
`;

const Title = styled.h3`
  font-size: 1.25rem;
  font-weight: 700;
  color: #1a202c;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const TableContainer = styled.div`
  overflow-x: auto;
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
`;

const Th = styled.th`
  text-align: left;
  padding: 1rem;
  font-size: 0.875rem;
  font-weight: 600;
  color: #64748b;
  border-bottom: 1px solid #e2e8f0;
`;

const Td = styled.td`
  padding: 1rem;
  border-bottom: 1px solid #f1f5f9;
  vertical-align: middle;
`;

const CarInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
`;

const CarImage = styled.img`
  width: 48px;
  height: 48px;
  border-radius: 8px;
  object-fit: cover;
`;

const CarDetails = styled.div`
  display: flex;
  flex-direction: column;
`;

const CarTitle = styled.span`
  font-weight: 600;
  color: #1e293b;
`;

const CarSubtitle = styled.span`
  font-size: 0.875rem;
  color: #64748b;
`;

const StatusBadge = styled.span<{ status: string }>`
  padding: 0.25rem 0.75rem;
  border-radius: 9999px;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: capitalize;
  
  ${props => {
        switch (props.status) {
            case 'active': return 'background: #dcfce7; color: #166534;'; // Green
            case 'draft': return 'background: #f1f5f9; color: #475569;'; // Gray
            case 'sold': return 'background: #dbeafe; color: #1e40af;'; // Blue
            default: return 'background: #f1f5f9; color: #475569;';
        }
    }}
`;

const Metric = styled.div`
  display: flex;
  align-items: center;
  gap: 0.25rem;
  color: #64748b;
  font-size: 0.875rem;
`;

const ActionButton = styled.button`
  background: none;
  border: none;
  padding: 0.5rem;
  border-radius: 8px;
  cursor: pointer;
  color: #64748b;
  transition: all 0.2s;

  &:hover {
    background: #f1f5f9;
    color: #3b82f6;
  }
`;

interface InventoryWidgetProps {
    listings: UnifiedCar[];
}

export const InventoryWidget: React.FC<InventoryWidgetProps> = ({ listings }) => {
    const { language } = useLanguage();
    const navigate = useNavigate();
    const isBg = language === 'bg';

    if (!listings || listings.length === 0) {
        return (
            <WidgetContainer>
                <Header>
                    <Title>{isBg ? 'Инвентар' : 'Inventory'}</Title>
                </Header>
                <div style={{ textAlign: 'center', padding: '2rem', color: '#94a3b8' }}>
                    {isBg ? 'Все още нямате обяви.' : 'No listings found.'}
                </div>
            </WidgetContainer>
        );
    }

    return (
        <WidgetContainer initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <Header>
                <Title>{isBg ? 'Управление на Инвентара' : 'Inventory Management'}</Title>
            </Header>

            <TableContainer>
                <Table>
                    <thead>
                        <tr>
                            <Th>{isBg ? 'Автомобил' : 'Vehicle'}</Th>
                            <Th>{isBg ? 'Статус' : 'Status'}</Th>
                            <Th>{isBg ? 'Цена' : 'Price'}</Th>
                            <Th>{isBg ? 'Статистика' : 'Stats'}</Th>
                            <Th>{isBg ? 'Действия' : 'Actions'}</Th>
                        </tr>
                    </thead>
                    <tbody>
                        {listings.map(car => (
                            <tr key={car.id}>
                                <Td>
                                    <CarInfo>
                                        <CarImage src={car.mainImage || '/default-car.png'} alt={`${car.make} ${car.model}`} />
                                        <CarDetails>
                                            <CarTitle>{car.make} {car.model}</CarTitle>
                                            <CarSubtitle>{car.year}</CarSubtitle>
                                        </CarDetails>
                                    </CarInfo>
                                </Td>
                                <Td>
                                    <StatusBadge status={car.status}>
                                        {car.status}
                                    </StatusBadge>
                                </Td>
                                <Td>
                                    <span style={{ fontWeight: 600, color: '#10b981' }}>
                                        {car.price.toLocaleString()} {isBg ? 'лв.' : 'BGN'}
                                    </span>
                                </Td>
                                <Td>
                                    <div style={{ display: 'flex', gap: '1rem' }}>
                                        <Metric>
                                            <Eye size={14} /> {car.views || 0}
                                        </Metric>
                                        <Metric>
                                            <Heart size={14} /> {car.favorites || 0}
                                        </Metric>
                                    </div>
                                </Td>
                                <Td>
                                    <div style={{ display: 'flex', gap: '0.25rem' }}>
                                        <ActionButton onClick={() => navigate(`/car/${car.id}/edit`)} title={isBg ? 'Редактирай' : 'Edit'}>
                                            <Edit size={18} />
                                        </ActionButton>
                                        <ActionButton title={isBg ? 'Промотирай' : 'Promote'}>
                                            <Zap size={18} color="#f59e0b" />
                                        </ActionButton>
                                        <ActionButton title={isBg ? 'Още' : 'More'}>
                                            <MoreVertical size={18} />
                                        </ActionButton>
                                    </div>
                                </Td>
                            </tr>
                        ))}
                    </tbody>
                </Table>
            </TableContainer>
        </WidgetContainer>
    );
};
