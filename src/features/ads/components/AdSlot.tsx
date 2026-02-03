import React from 'react';
import { useAdInventory } from '../hooks/useAdHooks';
import { AdRenderer } from './AdRenderer';
import { AdContext } from '../types';
import styled from 'styled-components';

const SlotPlaceholder = styled.div<{ $debug?: boolean }>`
  min-height: 100px;
  background: ${props => props.$debug ? '#f0f0f0' : 'transparent'};
  display: ${props => props.$debug ? 'flex' : 'none'};
  align-items: center;
  justify-content: center;
  border: 1px dashed #ccc;
  color: #888;
  font-size: 0.8rem;
`;

interface AdSlotProps {
    placementId: string;
    className?: string;
    style?: React.CSSProperties;
    fallback?: React.ReactNode;
    debug?: boolean;
    context?: AdContext; // Pass specific context like { brand: 'BMW' }
}

export const AdSlot: React.FC<AdSlotProps> = ({
    placementId,
    className,
    style,
    fallback = null,
    debug = false,
    context
}) => {
    const { ad, loading } = useAdInventory(placementId, context);

    if (loading) {
        return debug ? (
            <SlotPlaceholder $debug className={className} style={style}>
                Loading: {placementId}...
            </SlotPlaceholder>
        ) : <div className={className} style={style} />;
    }

    if (!ad) {
        if (debug) {
            return (
                <SlotPlaceholder $debug className={className} style={style}>
                    No Ad: {placementId}
                </SlotPlaceholder>
            );
        }
        return <>{fallback}</>;
    }

    return (
        <div className={className} style={style} data-placement={placementId}>
            <AdRenderer ad={ad} placementId={placementId} />
        </div>
    );
};
