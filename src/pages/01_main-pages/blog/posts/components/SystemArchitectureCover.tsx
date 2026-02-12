import React from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { Database, Search, Network, RefreshCw, ArrowRight, Server } from 'lucide-react';

const DiagramContainer = styled.div`
    width: 100%;
    height: 400px;
    background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
    border-radius: 24px;
    position: relative;
    overflow: hidden;
    display: flex;
    justify-content: center;
    align-items: center;
    border: 1px solid rgba(255,255,255,0.1);
    margin-bottom: 2rem;
`;

const GridBackground = styled.div`
    position: absolute;
    inset: 0;
    opacity: 0.1;
    background-image: linear-gradient(#3b82f6 1px, transparent 1px),
        linear-gradient(90deg, #3b82f6 1px, transparent 1px);
    background-size: 40px 40px;
`;

const Node = styled(motion.div) <{ $color: string; $glow: string }>`
    background: rgba(15, 23, 42, 0.9);
    border: 2px solid ${props => props.$color};
    padding: 1.5rem;
    border-radius: 16px;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.5rem;
    color: white;
    box-shadow: 0 0 20px ${props => props.$glow};
    z-index: 10;
    width: 140px;
`;

const ConnectionLine = styled(motion.div) <{ $color: string }>`
    position: absolute;
    height: 4px;
    background: ${props => props.$color};
    z-index: 1;
    transform-origin: left center;
`;

const Label = styled.span`
    font-size: 0.875rem;
    font-weight: 700;
    color: #cbd5e1;
`;

const Particle = styled(motion.div)`
    width: 8px;
    height: 8px;
    background: white;
    border-radius: 50%;
    position: absolute;
    z-index: 5;
    box-shadow: 0 0 10px white;
`;

export const SystemArchitectureCover: React.FC = () => {
    return (
        <DiagramContainer>
            <GridBackground />

            {/* Central Router */}
            <Node
                $color="#10b981"
                $glow="rgba(16, 185, 129, 0.3)"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
                style={{ position: 'absolute' }}
            >
                <Network size={32} color="#10b981" />
                <Label>Query Router</Label>
            </Node>

            {/* Left Model: Firestore */}
            <Node
                $color="#3b82f6"
                $glow="rgba(59, 130, 246, 0.3)"
                initial={{ x: -200, opacity: 0 }}
                animate={{ x: -220, opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                style={{ position: 'absolute' }}
            >
                <Database size={32} color="#3b82f6" />
                <Label>Firestore</Label>
            </Node>

            {/* Right Model: Algolia */}
            <Node
                $color="#f59e0b"
                $glow="rgba(245, 158, 11, 0.3)"
                initial={{ x: 200, opacity: 0 }}
                animate={{ x: 220, opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.4 }}
                style={{ position: 'absolute' }}
            >
                <Search size={32} color="#f59e0b" />
                <Label>Algolia</Label>
            </Node>

            {/* Sync Arrow (Curved) */}
            <svg style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none', zIndex: 1 }}>
                {/* Router to Firestore */}
                <motion.path
                    d="M 50% 50% L 35% 50%" // adjust based on Node positions
                    stroke="#3b82f6"
                    strokeWidth="2"
                    fill="none"
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ duration: 1, delay: 0.5 }}
                />
                {/* Router to Algolia */}
                <motion.path
                    d="M 50% 50% L 65% 50%"
                    stroke="#f59e0b"
                    strokeWidth="2"
                    fill="none"
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ duration: 1, delay: 0.5 }}
                />

                {/* Sync Loop from Firestore to Algolia */}
                <motion.path
                    d="M 35% 60% Q 50% 80% 65% 60%"
                    stroke="rgba(255,255,255,0.2)"
                    strokeWidth="2"
                    strokeDasharray="5,5"
                    fill="none"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 1, delay: 1 }}
                />
            </svg>

            {/* Animated Data Particles */}
            {/* Left */}
            <Particle
                initial={{ x: -40, y: 0, opacity: 0 }}
                animate={{ x: -180, opacity: [0, 1, 0] }}
                transition={{ duration: 1.5, repeat: Infinity, repeatDelay: 0.5 }}
            />
            {/* Right */}
            <Particle
                initial={{ x: 40, y: 0, opacity: 0 }}
                animate={{ x: 180, opacity: [0, 1, 0] }}
                transition={{ duration: 1.5, repeat: Infinity, repeatDelay: 0.5, delay: 0.7 }}
            />

            {/* Sync Label */}
            <motion.div
                style={{ position: 'absolute', bottom: '25%', color: 'rgba(255,255,255,0.5)', fontSize: '0.75rem', fontWeight: 600 }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.2 }}
            >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                    <RefreshCw size={12} /> Sync
                </div>
            </motion.div>

        </DiagramContainer>
    );
};
