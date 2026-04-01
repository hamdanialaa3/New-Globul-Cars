import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { adService } from '../services/campaignService';
import { AdCampaign } from '../types';
import { AdCampaignForm } from './CampaignForm';
import { AdRenderer } from '../components/CampaignRenderer';

const Container = styled.div`
  padding: 2rem;
  background: #f8f9fa;
  min-height: 100vh;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
`;

const Table = styled.table`
  width: 100%;
  background: white;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
  border-collapse: collapse;

  th, td {
    padding: 1rem;
    text-align: left;
    border-bottom: 1px solid #eee;
  }
  
  th {
    background: #fff;
    font-weight: 600;
  }
`;

const Badge = styled.span<{ $active: boolean }>`
  padding: 0.25rem 0.5rem;
  border-radius: 99px;
  font-size: 0.8rem;
  background: ${p => p.$active ? '#d1fae5' : '#fee2e2'};
  color: ${p => p.$active ? '#065f46' : '#991b1b'};
`;

const ActionButton = styled.button`
  background: none;
  border: none;
  color: #666;
  cursor: pointer;
  margin-right: 0.5rem;
  &:hover { color: #000; }
`;

// Preview Modal Styles
const ModalOverlay = styled.div`
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  background: var(--admin-glass-card-bg);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
`;

const ModalContent = styled.div`
  background: white;
  padding: 2rem;
  border-radius: 8px;
  min-width: 400px;
  max-width: 90%;
  max-height: 90vh;
  overflow: auto;
  position: relative;
`;

export const AdManagerDashboard = () => {
    const [campaigns, setCampaigns] = useState<AdCampaign[]>([]);
    const [isEditing, setIsEditing] = useState(false);
    const [selectedCampaign, setSelectedCampaign] = useState<AdCampaign | undefined>(undefined);
    const [previewCampaign, setPreviewCampaign] = useState<AdCampaign | null>(null);

    const loadData = async () => {
        const data = await adService.getCampaigns();
        setCampaigns(data);
    };

    useEffect(() => {
        loadData();
    }, []);

    const handleDelete = async (id: string) => {
        if (confirm('Are you sure you want to delete this campaign?')) {
            await adService.deleteCampaign(id);
            loadData();
        }
    };

    if (isEditing) {
        return (
            <Container>
                <button onClick={() => { setIsEditing(false); setSelectedCampaign(undefined); }}>&larr; Back to List</button>
                <AdCampaignForm
                    initialData={selectedCampaign}
                    onSuccess={() => { setIsEditing(false); loadData(); }}
                />
            </Container>
        );
    }

    return (
        <Container>
            <Header>
                <h1>Ad Manager</h1>
                <button
                    style={{ padding: '0.8rem 1.2rem', background: '#000', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                    onClick={() => setIsEditing(true)}
                >
                    + New Campaign
                </button>
            </Header>

            <Table>
                <thead>
                    <tr>
                        <th>Name</th>
                        <th>Type</th>
                        <th>Placements</th>
                        <th>Status</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {campaigns.map(cam => (
                        <tr key={cam.id}>
                            <td>{cam.name}</td>
                            <td>{cam.type}</td>
                            <td>{cam.placementIds.join(', ')}</td>
                            <td><Badge $active={cam.isActive}>{cam.isActive ? 'Active' : 'Inactive'}</Badge></td>
                            <td>
                                <ActionButton onClick={() => setPreviewCampaign(cam)}>Preview</ActionButton>
                                <ActionButton onClick={() => { setSelectedCampaign(cam); setIsEditing(true); }}>Edit</ActionButton>
                                <ActionButton onClick={() => handleDelete(cam.id!)}>Delete</ActionButton>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </Table>

            {/* Preview Modal */}
            {previewCampaign && (
                <ModalOverlay onClick={() => setPreviewCampaign(null)}>
                    <ModalContent onClick={e => e.stopPropagation()}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                            <h3>Preview: {previewCampaign.name}</h3>
                            <button onClick={() => setPreviewCampaign(null)}>&times;</button>
                        </div>
                        <div style={{ border: '1px dashed #ccc', padding: '1rem', background: '#f9f9f9', display: 'flex', justifyContent: 'center' }}>
                            <AdRenderer ad={previewCampaign} placementId="preview_mode" />
                        </div>
                    </ModalContent>
                </ModalOverlay>
            )}

        </Container>
    );
};
