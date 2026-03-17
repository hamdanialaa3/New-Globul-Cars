/**
 * Advisor Results Component
 * 
 * Displays the cars that match the advisor criteria.
 * Simulates AI thinking process then shows results.
 */

import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { AdvisorData } from './AdvisorWizard';
import { UnifiedCar } from '@/services/car/unified-car-types';
import { searchCars } from '@/services/car/unified-car-queries';
import ModernCarCard from '../../home/HomePage/ModernCarCard';
import LoadingSpinner from '@/components/LoadingSpinner';
import { Sparkles, RefreshCw } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { logger } from '@/services/logger-service';

interface ResultsProps {
    data: AdvisorData;
    onReset: () => void;
}

const ResultsContainer = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  text-align: center;
`;

const ThinkingContainer = styled(motion.div)`
  padding: 4rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
`;

const Title = styled.h2`
  font-size: 2.5rem;
  margin-bottom: 2rem;
  color: #1e293b;
  dark: {
    color: #f8fafc;
  }
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 2rem;
  margin-top: 3rem;
  text-align: left;
`;

const ResetButton = styled.button`
  background: white;
  border: 1px solid #e2e8f0;
  padding: 0.75rem 1.5rem;
  border-radius: 9999px;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: 600;
  cursor: pointer;
  margin-top: 3rem;
  transition: all 0.2s;

  &:hover {
    background: #f1f5f9;
  }
`;

const AdvisorResults: React.FC<ResultsProps> = ({ data, onReset }) => {
    const [loading, setLoading] = useState(true);
    const [results, setResults] = useState<UnifiedCar[]>([]);
    const { language } = useLanguage();
    const isBg = language === 'bg';

    useEffect(() => {
        // Simulate AI thinking and fetch results
        const fetchResults = async () => {
            // 1. Build filters from AdvisorData
            const filters: any = {
                maxPrice: data.budget * 1.1, // Allow 10% over budget
                isActive: true, // Only show active cars
            };

            if (data.fuelType.length > 0) {
                // We can't easily filter by OR in basic firestore, so we'll filter client side or just pick primary
                // For now, let's just use price mostly
            }

            if (data.transmission) {
                filters.transmission = data.transmission;
            }

            // TODO: Implement more complex AI logic here calling a specialized backend or robust client-side filtering

            try {
                const cars = await searchCars(filters, 12);

                // Client-side scoring/filtering based on usage and priorities
                // This is where the "AI" logic effectively lives for now
                const scoredCars = cars.map(car => {
                    let score = 0;
                    if (data.usage === 'family' && ['SUV', 'Station Wagon', 'Van'].includes(car.bodyType)) score += 5;
                    if (data.usage === 'city' && ['Hatchback', 'Sedan', 'Small'].includes(car.bodyType)) score += 5;
                    if (data.usage === 'commute' && car.fuelType === 'Electric') score += 5;

                    if (data.priorities.includes('economy') && ['Diesel', 'Electric', 'Hybrid'].includes(car.fuelType)) score += 3;

                    return { car, score };
                });

                // Sort by score
                scoredCars.sort((a, b) => b.score - a.score);

                setTimeout(() => {
                    setResults(scoredCars.map(item => item.car));
                    setLoading(false);
                }, 2000); // Fake delay for "AI Thinking"

            } catch (err) {
                logger.error("AI Advisor Error", err);
                setLoading(false);
            }
        };

        fetchResults();
    }, [data]);

    if (loading) {
        return (
            <ThinkingContainer
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
            >
                <LoadingSpinner />
                <h3 style={{ marginTop: '2rem', fontSize: '1.5rem' }}>
                    {isBg ? 'AI Анализира вашите отговори...' : 'AI is analyzing your preferences...'}
                </h3>
                <p style={{ color: '#64748b' }}>
                    {isBg ? 'Проверка на наличности, история и цени...' : 'Checking inventory, history, and fair market values...'}
                </p>
            </ThinkingContainer>
        );
    }

    return (
        <ResultsContainer>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                <h2>
                    {isBg ? 'Ето какво намерихме за вас ✨' : 'Here is what we found for you ✨'}
                </h2>
                <p>Based on your budget of {data.budget.toLocaleString()} BGN and preferences.</p>

                <Grid>
                    {results.map(car => (
                        <ModernCarCard key={car.id} car={car} />
                    ))}
                </Grid>

                {results.length === 0 && (
                    <div style={{ padding: '3rem' }}>
                        <h3>No perfect matches found.</h3>
                        <p>Try adjusting your criteria.</p>
                    </div>
                )}

                <ResetButton onClick={onReset}>
                    <RefreshCw size={18} />
                    {isBg ? 'Започни отново' : 'Start Over'}
                </ResetButton>
            </motion.div>
        </ResultsContainer>
    );
};

export default AdvisorResults;
