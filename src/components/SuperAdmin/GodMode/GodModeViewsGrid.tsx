import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { X, Eye, TrendingUp, RefreshCw, BarChart, ArrowUpCircle, RotateCcw } from 'lucide-react';
import { collection, query, orderBy, getDocs, updateDoc, doc, limit } from 'firebase/firestore';
import { db } from '../../../firebase/firebase-config';
import { logger } from '../../../services/logger-service';

// Reusing God Mode styles
const Overlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.85);
  backdrop-filter: blur(8px);
  z-index: 2000;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 40px;
  animation: fadeIn 0.3s ease-out;

  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }
`;

const Container = styled.div`
  background: #1a1a1a;
  border-radius: 16px;
  width: 100%;
  max-width: 1400px;
  height: 90vh;
  display: flex;
  flex-direction: column;
  border: 1px solid #333;
  box-shadow: 0 20px 50px rgba(0, 0, 0, 0.5);
  overflow: hidden;
`;

const Header = styled.div`
  padding: 24px;
  border-bottom: 1px solid #333;
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: #222;
`;

const Title = styled.h2`
  color: #fff;
  font-size: 24px;
  font-weight: 700;
  display: flex;
  align-items: center;
  gap: 12px;
  margin: 0;
`;

const Badge = styled.span`
  background: #3498db;
  color: #fff;
  font-size: 11px;
  padding: 4px 8px;
  border-radius: 4px;
  text-transform: uppercase;
  letter-spacing: 1px;
  font-weight: 800;
`;

const Controls = styled.div`
  display: flex;
  gap: 16px;
  align-items: center;
`;

const CloseButton = styled.button`
  background: transparent;
  border: none;
  color: #888;
  cursor: pointer;
  padding: 8px;
  border-radius: 50%;
  transition: all 0.2s;
  
  &:hover {
    background: #333;
    color: #fff;
  }
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
  padding: 24px;
  overflow-y: auto;
  flex: 1;
  background: #111;

  &::-webkit-scrollbar {
    width: 8px;
  }
  &::-webkit-scrollbar-track {
    background: #111;
  }
  &::-webkit-scrollbar-thumb {
    background: #333;
    border-radius: 4px;
  }
`;

const Card = styled.div`
  background: #222;
  border-radius: 12px;
  padding: 20px;
  border: 1px solid #333;
  transition: all 0.2s;
  position: relative;
  display: flex;
  flex-direction: column;

  &:hover {
    transform: translateY(-4px);
    border-color: #555;
    box-shadow: 0 10px 20px rgba(0,0,0,0.3);
  }
`;

const CardHeader = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: 16px;
  align-items: center;
`;

const ViewCount = styled.div`
  font-size: 32px;
  font-weight: 800;
  color: #fff;
  display: flex;
  align-items: center;
  gap: 8px;
  
  svg {
    color: #3498db;
    opacity: 0.8;
  }
`;

const ItemTitle = styled.div`
  font-size: 14px;
  color: #ccc;
  font-weight: 600;
  margin-bottom: 4px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const ItemSub = styled.div`
  font-size: 12px;
  color: #666;
`;

const Actions = styled.div`
  display: flex;
  gap: 8px;
  margin-top: auto;
  border-top: 1px solid #333;
  padding-top: 16px;
`;

const ActionButton = styled.button<{ danger?: boolean; special?: boolean }>`
  flex: 1;
  background: ${props => props.special ? 'rgba(52, 152, 219, 0.1)' : (props.danger ? 'rgba(231, 76, 60, 0.1)' : 'rgba(255, 255, 255, 0.05)')};
  color: ${props => props.special ? '#3498db' : (props.danger ? '#e74c3c' : '#fff')};
  border: 1px solid ${props => props.special ? 'rgba(52, 152, 219, 0.3)' : (props.danger ? 'rgba(231, 76, 60, 0.3)' : 'rgba(255, 255, 255, 0.1)')};
  padding: 8px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;

  &:hover {
    background: ${props => props.special ? '#3498db' : (props.danger ? '#e74c3c' : '#fff')};
    color: ${props => props.special ? '#fff' : (props.danger ? '#fff' : '#000')};
  }
`;

interface GodModeViewsGridProps {
    onClose: () => void;
}

export const GodModeViewsGrid: React.FC<GodModeViewsGridProps> = ({ onClose }) => {
    const [hotItems, setHotItems] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [totalViews, setTotalViews] = useState(0);

    const fetchHotItems = async () => {
        setLoading(true);
        try {
            // Get top viewed cars (limit 50)
            const q = query(
                collection(db, 'cars'),
                orderBy('views', 'desc'),
                limit(50)
            );
            const snapshot = await getDocs(q);
            const data = snapshot.docs.map((doc: any) => ({
                id: doc.id,
                ...doc.data()
            }));

            setHotItems(data);

            // Calculate total views of top 50
            const total = data.reduce((acc, curr: any) => acc + (curr.views || 0), 0);
            setTotalViews(total);

        } catch (error) {
            logger.error('GodMode: Failed to fetch hot items', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchHotItems();
    }, []);

    const handleResetViews = async (carId: string) => {
        if (window.confirm('Are you sure you want to RESET views for this item to 0?')) {
            try {
                await updateDoc(doc(db, 'cars', carId), { views: 0 });
                // Update local state
                setHotItems(prev => prev.map((item: any) =>
                    item.id === carId ? { ...item, views: 0 } : item
                ));
            } catch (error) {
                alert('Failed: ' + error);
            }
        }
    };

    const handleBoostViews = async (carId: string, currentViews: number) => {
        const boostAmount = 1000;
        try {
            const newViews = (currentViews || 0) + boostAmount;
            await updateDoc(doc(db, 'cars', carId), { views: newViews });
            // Update local state
            setHotItems(prev => prev.map((item: any) =>
                item.id === carId ? { ...item, views: newViews } : item
            ));
        } catch (error) {
            alert('Failed: ' + error);
        }
    };

    return (
        <Overlay>
            <Container>
                <Header>
                    <Title>
                        <TrendingUp size={28} />
                        GOD MODE: TRAFFIC CONTROL
                        <Badge>TOP 50 | {totalViews.toLocaleString()} VIEWS</Badge>
                    </Title>
                    <Controls>
                        <CloseButton onClick={fetchHotItems} title="Refresh Data">
                            <RefreshCw size={20} />
                        </CloseButton>
                        <CloseButton onClick={onClose} title="Close God Mode">
                            <X size={24} />
                        </CloseButton>
                    </Controls>
                </Header>

                <Grid>
                    {loading ? (
                        <div style={{ color: '#fff', gridColumn: '1/-1', textAlign: 'center', padding: '100px' }}>
                            <BarChart size={40} style={{ marginBottom: 20 }} />
                            <div>ANALYZING TRAFFIC PATTERNS...</div>
                        </div>
                    ) : hotItems.map((item: any) => (
                        <Card key={item.id}>
                            <CardHeader>
                                <Eye color="#888" size={20} />
                                <div style={{ fontSize: 10, color: '#666' }}>ID: {item.id.substring(0, 8)}...</div>
                            </CardHeader>

                            <ViewCount>
                                {item.views?.toLocaleString() || 0}
                                <span style={{ fontSize: 12, fontWeight: 400, color: '#666', marginTop: 12 }}>views</span>
                            </ViewCount>

                            <ItemTitle>{item.make} {item.model} {item.year}</ItemTitle>
                            <ItemSub>{(item.price || 0).toLocaleString()} EUR</ItemSub>

                            <Actions>
                                <ActionButton special onClick={() => handleBoostViews(item.id, item.views)}>
                                    <ArrowUpCircle size={14} /> BOOST (+1K)
                                </ActionButton>
                                <ActionButton danger onClick={() => handleResetViews(item.id)}>
                                    <RotateCcw size={14} /> RESET
                                </ActionButton>
                            </Actions>
                        </Card>
                    ))}
                </Grid>
            </Container>
        </Overlay>
    );
};
