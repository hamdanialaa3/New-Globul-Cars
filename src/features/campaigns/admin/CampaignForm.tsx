import React from 'react';
import { toast } from 'react-toastify';
import { useForm, useFieldArray } from 'react-hook-form';
import styled from 'styled-components';
import { adService } from '../services/campaignService';
import { AdCampaign } from '../types';

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1rem;
  max-width: 800px;
  background: #fff;
  padding: 2rem;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
`;

const InputGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  
  label {
    font-weight: 600;
    font-size: 0.9rem;
  }
  
  input, select, textarea {
    padding: 0.8rem;
    border: 1px solid #ddd;
    border-radius: 4px;
    font-size: 1rem;
  }
`;

const Button = styled.button`
  padding: 1rem 2rem;
  background: #007bff;
  color: white;
  border: none;
  border-radius: 4px;
  font-weight: bold;
  cursor: pointer;
  margin-top: 1rem;
  
  &:hover {
    background: #0056b3;
  }
`;

export const AdCampaignForm: React.FC<{ onSuccess: () => void, initialData?: AdCampaign }> = ({ onSuccess, initialData }) => {
    const { register, handleSubmit, control, watch } = useForm<AdCampaign>({
        defaultValues: initialData || {
            type: 'image',
            targetDevices: 'both',
            isActive: true,
            placementIds: ['home_top'],
            startDate: new Date().toISOString().split('T')[0],
            weight: 50
        }
    });

    const adType = watch('type');

    const onSubmit = async (data: AdCampaign) => {
        try {
            if (initialData?.id) {
                await adService.updateCampaign(initialData.id, data);
            } else {
                await adService.createCampaign(data);
            }
            onSuccess();
        } catch (e) {
            toast.error('Error saving campaign: ' + e);
        }
    };

    return (
        <Form onSubmit={handleSubmit(onSubmit)}>
            <h3>{initialData ? 'Edit Campaign' : 'New Ad Campaign'}</h3>

            <InputGroup>
                <label>Campaign Name</label>
                <input {...register('name', { required: true })} placeholder="e.g. Summer Sale Banner" />
            </InputGroup>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <InputGroup>
                    <label>Type</label>
                    <select {...register('type')}>
                        <option value="image">Image Banner</option>
                        <option value="html_js">Custom HTML/JS</option>
                        <option value="google_adsense">Google AdSense</option>
                        <option value="google_gam">Google Ad Manager</option>
                    </select>
                </InputGroup>

                <InputGroup>
                    <label>Weight (Priority 0-100)</label>
                    <input type="number" {...register('weight')} min="0" max="100" />
                </InputGroup>
            </div>

            <InputGroup>
                <label>Placement IDs (comma separated code)</label>
                {/* Simplified for demo: split string to array in real app */}
                <input
                    placeholder="home_top, sidebar_right"
                    {...register('placementIds')}
                // Note: In real implementation, use useFieldArray for dynamic inputs
                />
                <small>Enter valid placement codes used in code (e.g., home_top)</small>
            </InputGroup>

            {adType === 'image' && (
                <>
                    <InputGroup>
                        <label>Image URL</label>
                        <input {...register('imageUrl')} placeholder="https://..." />
                    </InputGroup>
                    <InputGroup>
                        <label>Destination URL</label>
                        <input {...register('destinationUrl')} placeholder="https://..." />
                    </InputGroup>
                </>
            )}

            {(adType === 'html_js' || adType.startsWith('google')) && (
                <InputGroup>
                    <label>Script/Tag Code</label>
                    <textarea {...register('scriptCode')} rows={5} placeholder="<script>...</script>" />
                </InputGroup>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <InputGroup>
                    <label>Target Devices</label>
                    <select {...register('targetDevices')}>
                        <option value="both">All Devices</option>
                        <option value="desktop">Desktop Only</option>
                        <option value="mobile">Mobile Only</option>
                    </select>
                </InputGroup>

                <InputGroup>
                    <label>Start Date</label>
                    <input type="date" {...register('startDate')} />
                </InputGroup>
            </div>

            <Button type="submit">Save Campaign</Button>
        </Form>
    );
};
