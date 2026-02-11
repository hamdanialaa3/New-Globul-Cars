import React, { useState } from 'react';
import styled, { keyframes, css } from 'styled-components';
import { Facebook } from 'lucide-react';
import axios from 'axios';

interface FacebookSmartButtonProps {
  adId: string;
  adData: any;
  isOwner: boolean;
  className?: string; // Allow external positioning
}

const pulse = keyframes`
  0% { box-shadow: 0 0 0 0 rgba(24, 119, 242, 0.7); transform: scale(1); }
  50% { box-shadow: 0 0 0 10px rgba(24, 119, 242, 0); transform: scale(1.05); }
  100% { box-shadow: 0 0 0 0 rgba(24, 119, 242, 0); transform: scale(1); }
`;

const loadingSpin = keyframes`
  to { transform: rotate(360deg); }
`;

const Button = styled.button<{ $loading: boolean }>`
  background: #1877F2;
  color: white;
  border: none;
  border-radius: 50%;
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(24, 119, 242, 0.3);

  &:hover {
    background: #166fe5;
    transform: translateY(-2px);
    box-shadow: 0 6px 16px rgba(24, 119, 242, 0.4);
  }

  ${props => props.$loading && css`
    animation: ${pulse} 2s infinite;
    pointer-events: none;
  `}
`;

const Spinner = styled.div`
  width: 20px;
  height: 20px;
  border: 2px solid rgba(255,255,255,0.3);
  border-top-color: white;
  border-radius: 50%;
  animation: ${loadingSpin} 0.8s linear infinite;
`;

const Tooltip = styled.div`
  position: absolute;
  top: 120%;
  left: 50%;
  transform: translateX(-50%);
  background: rgba(0,0,0,0.8);
  color: white;
  padding: 6px 10px;
  border-radius: 6px;
  font-size: 12px;
  white-space: nowrap;
  opacity: 0;
  pointer-events: none;
  transition: opacity 0.2s;

  ${Button}:hover & {
    opacity: 1;
  }
`;

const PUBLISHER_API_URL = import.meta.env.VITE_PUBLISHER_API_URL || 'https://us-central1-fire-new-globul.cloudfunctions.net/webhooks-ad-published';

export const FacebookSmartButton: React.FC<FacebookSmartButtonProps> = ({ adId, adData, isOwner, className }) => {
  const [loading, setLoading] = useState(false);
  const [published, setPublished] = useState(false);

  if (!isOwner) return null;

  const handlePublish = async () => {
    const shareUrl = `https://koli.one/car/${adData.sellerNumericId || 'view'}/${adData.carNumericId || adId}`;
    const facebookShareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`;

    // Open the share dialog
    window.open(facebookShareUrl, 'fb-share', 'width=580,height=296');

    setPublished(true);
    // Optional: Call the automation endpoint silently if needed in future
  };

  return (
    <div className={className} style={{ position: 'relative' }}>
      <Button onClick={handlePublish} $loading={loading} disabled={loading || published}>
        {loading ? <Spinner /> : <Facebook size={24} fill="white" />}
        <Tooltip>
          {published ? 'Published!' : 'Auto-Post to FB'}
        </Tooltip>
      </Button>
    </div>
  );
};
