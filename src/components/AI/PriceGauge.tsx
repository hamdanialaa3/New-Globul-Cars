import React from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  position: relative;
  width: 200px;
  height: 200px;
`;

const SVG = styled.svg`
  width: 100%;
  height: 100%;
  transform: rotate(-90deg);
`;

const Circle = styled(motion.circle) <{ $color: string }>`
  fill: none;
  stroke: ${props => props.$color};
  stroke-width: 10;
  stroke-linecap: round;
`;

const BackgroundCircle = styled.circle`
  fill: none;
  stroke: rgba(255, 255, 255, 0.1);
  stroke-width: 10;
`;

const ScoreText = styled(motion.div)`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  text-align: center;
  color: #fff;
  font-family: 'Exo 2', sans-serif;
`;

const Label = styled.div<{ $color: string }>`
  font-size: 1.5rem;
  font-weight: 800;
  color: ${props => props.$color};
  text-transform: uppercase;
  text-shadow: 0 0 10px ${props => props.$color};
`;

const SubLabel = styled.div`
  font-size: 0.8rem;
  opacity: 0.7;
  margin-top: 4px;
`;

interface PriceGaugeProps {
    isFairPrice: boolean;
    deviation: string; // e.g. "-5%", "+12%"
}

export const PriceGauge: React.FC<PriceGaugeProps> = ({ isFairPrice, deviation }) => {
    const deviationNum = parseFloat(deviation.replace('%', ''));
    const isGoodDeal = deviationNum <= 0;

    // Calculate stroke dasharray for circle (circumference = 2 * PI * r)
    // r = 80, C = ~502
    const r = 80;
    const c = 2 * Math.PI * r;

    // Map score: 
    // If good deal (-10%), fill 80-100% green
    // If bad deal (+20%), fill 40-60% red
    let fillPercentage = 0;
    let color = '#fff';
    let label = '';

    if (isGoodDeal) {
        fillPercentage = 0.9; // 90% filled
        color = '#00f3ff'; // Cyan
        label = 'GREAT DEAL';
    } else if (deviationNum < 10) {
        fillPercentage = 0.6; // 60% filled
        color = '#f59e0b'; // Amber
        label = 'FAIR PRICE';
    } else {
        fillPercentage = 0.3; // 30% filled
        color = '#ef4444'; // Red
        label = 'HIGH PRICE';
    }

    const strokeDashoffset = c - (c * fillPercentage);

    return (
        <Container>
            <SVG viewBox="0 0 200 200">
                <BackgroundCircle cx="100" cy="100" r={r} />
                <Circle
                    cx="100"
                    cy="100"
                    r={r}
                    $color={color}
                    initial={{ strokeDasharray: c, strokeDashoffset: c }}
                    animate={{ strokeDashoffset }}
                    transition={{ duration: 1.5, ease: "easeOut" }}
                />
            </SVG>
            <ScoreText
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.5 }}
            >
                <Label $color={color}>{label}</Label>
                <SubLabel>{deviation} Market Dev.</SubLabel>
            </ScoreText>
        </Container>
    );
};
