import React, { useState, useRef } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { useAIEvaluation } from '../../hooks/useAIEvaluation';
import { HolographicScanner } from './HolographicScanner';
import { PriceGauge } from './PriceGauge';
import { NeoButton } from './NeoButton';

const GlassPanel = styled(motion.div)`
  background: rgba(13, 15, 30, 0.85);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(0, 243, 255, 0.2);
  border-radius: 16px;
  padding: 2rem;
  width: 100%;
  max-width: 600px;
  box-shadow: 0 0 40px rgba(0, 0, 0, 0.5);
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
  overflow: hidden;

  /* Glowing corners */
  &::before {
    content: '';
    position: absolute;
    top: 0; left: 0;
    width: 20px; height: 2px;
    background: #00f3ff;
    box-shadow: 0 0 10px #00f3ff;
  }
  &::after {
    content: '';
    position: absolute;
    bottom: 0; right: 0;
    width: 20px; height: 2px;
    background: #00f3ff;
    box-shadow: 0 0 10px #00f3ff;
  }
`;

const Title = styled.h2`
  color: #fff;
  font-family: 'Exo 2', sans-serif;
  text-transform: uppercase;
  letter-spacing: 3px;
  margin-bottom: 2rem;
  text-align: center;
  
  span {
    color: #00f3ff;
    text-shadow: 0 0 10px rgba(0, 243, 255, 0.5);
  }
`;

const FileInput = styled.input`
  display: none;
`;

const PriceInput = styled.input`
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(0, 243, 255, 0.3);
  padding: 12px;
  border-radius: 8px;
  color: #fff;
  font-family: 'Exo 2', sans-serif;
  width: 100%;
  margin-bottom: 1rem;
  font-size: 1.1rem;
  text-align: center;

  &:focus {
    outline: none;
    border-color: #00f3ff;
    box-shadow: 0 0 10px rgba(0, 243, 255, 0.2);
  }
`;

const ResultGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.5rem;
  width: 100%;
  margin-top: 2rem;

  @media (max-width: 600px) {
    grid-template-columns: 1fr;
  }
`;

const InfoCard = styled.div`
  background: rgba(255, 255, 255, 0.03);
  padding: 1rem;
  border-radius: 8px;
  border-left: 2px solid #00f3ff;
  
  h4 {
    color: #00f3ff;
    margin: 0 0 0.5rem 0;
    font-size: 0.8rem;
    text-transform: uppercase;
    letter-spacing: 1px;
  }
  
  p {
    color: #e0e0e0;
    margin: 0;
    font-size: 0.95rem;
  }
`;

export const AIEvaluationWidget: React.FC = () => {
    const { state, result, logs, error, evaluateCarImage, reset } = useAIEvaluation();
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string>('');
    const [price, setPrice] = useState<string>('');

    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setImageFile(file);
            setImagePreview(URL.createObjectURL(file));
            reset(); // Reset previous results if any
        }
    };

    const startAnalysis = () => {
        if (imageFile && price) {
            evaluateCarImage(imageFile, parseFloat(price));
        }
    };

    const isScanning = state === 'scanning' || state === 'thinking' || state === 'uploading';

    return (
        <GlassPanel
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
        >
            <Title>Neural <span>Scanner</span> V2.0</Title>

            {/* 1. UPLOAD & PREVIEW AREA */}
            <HolographicScanner
                imageSrc={imagePreview}
                isScanning={isScanning}
                logs={logs}
                scanColor={state === 'thinking' ? '#bb29ff' : '#00f3ff'}
            />

            <div style={{ marginTop: '2rem', width: '100%', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {/* INPUTS - Only show when idle or complete/error */}
                {!isScanning && !result && (
                    <>
                        <input
                            type="file"
                            accept="image/*"
                            ref={fileInputRef}
                            onChange={handleFileChange}
                            style={{ display: 'none' }}
                        />

                        {!imageFile ? (
                            <NeoButton
                                onClick={() => fileInputRef.current?.click()}
                                style={{ width: '100%' }}
                            >
                                Upload Car Photo
                            </NeoButton>
                        ) : (
                            <>
                                <PriceInput
                                    type="number"
                                    placeholder="Enter Asking Price (BGN)"
                                    value={price}
                                    onChange={(e) => setPrice(e.target.value)}
                                />
                                <NeoButton
                                    onClick={startAnalysis}
                                    disabled={!price}
                                    style={{ width: '100%' }}
                                >
                                    Initialize Scan
                                </NeoButton>
                                <div style={{ textAlign: 'center', marginTop: '0.5rem' }}>
                                    <button
                                        onClick={() => { setImageFile(null); setImagePreview(''); reset(); }}
                                        style={{ background: 'none', border: 'none', color: '#666', cursor: 'pointer', fontSize: '0.8rem', textDecoration: 'underline' }}
                                    >
                                        Reset / Cancel
                                    </button>
                                </div>
                            </>
                        )}
                    </>
                )}
            </div>

            {/* ERROR MESSAGE */}
            <AnimatePresence>
                {error && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        style={{ color: '#ef4444', marginTop: '1rem', textAlign: 'center' }}
                    >
                        ❌ System Failure: {error}
                    </motion.div>
                )}
            </AnimatePresence>

            {/* 2. RESULTS DISPLAY */}
            <AnimatePresence>
                {result && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        style={{ width: '100%', overflow: 'hidden' }}
                    >
                        <ResultGrid>
                            {/* Left: Gauge */}
                            <div style={{ display: 'flex', justifyContent: 'center' }}>
                                <PriceGauge
                                    isFairPrice={result.marketAnalysis.isFairPrice}
                                    deviation={result.marketAnalysis.priceDeviation}
                                />
                            </div>

                            {/* Right: Data */}
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                                <InfoCard>
                                    <h4>Vehicle Identity</h4>
                                    <p>{result.carDetails.year} {result.carDetails.make} {result.carDetails.model}</p>
                                </InfoCard>
                                <InfoCard>
                                    <h4>Condition Scan</h4>
                                    <p>{result.carDetails.condition}</p>
                                </InfoCard>
                                <InfoCard>
                                    <h4>AI Verdict</h4>
                                    <p>{result.marketAnalysis.advice}</p>
                                </InfoCard>
                            </div>
                        </ResultGrid>

                        <div style={{ marginTop: '2rem', textAlign: 'center' }}>
                            <NeoButton variant="secondary" onClick={() => reset()}>
                                Scan Another Vehicle
                            </NeoButton>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

        </GlassPanel>
    );
};
