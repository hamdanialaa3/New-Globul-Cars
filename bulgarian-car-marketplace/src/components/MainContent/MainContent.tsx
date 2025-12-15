/**
 * MainContent Component
 * Shown after loading completes
 * Contains AI Chat Interface
 */

import React, { useState } from 'react';
import StyledComponents from 'styled-components';
import { logger } from '../../services/logger-service';

const styled = StyledComponents;

interface MainContentProps {
  isVisible: boolean;
  apiKey: string;
}

// ============================================
// Styled Components
// ============================================

const MainContentDiv = styled.div<{ isVisible: boolean }>`
  display: ${props => (props.isVisible ? 'flex' : 'none')};
  height: 100vh;
  width: 100%;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: radial-gradient(circle at center, #1a1a2e 0%, #050505 100%);
  padding: 20px;
  box-sizing: border-box;
  overflow-y: auto;
`;

const ContentCard = styled.div`
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 20px;
  padding: 40px;
  max-width: 800px;
  width: 100%;
  text-align: center;
  backdrop-filter: blur(10px);
  box-shadow: 0 0 30px rgba(0, 0, 0, 0.5);
  animation: fadeInContent 1s ease-out;

  @keyframes fadeInContent {
    from {
      opacity: 0;
      transform: translateY(20px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
`;

const Title = styled.h1`
  font-size: 3rem;
  margin-bottom: 10px;
  background: linear-gradient(90deg, #fff, #00ccff);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
`;

const Subtitle = styled.p`
  color: #aaa;
  font-size: 1.1rem;
`;

const AIInterface = styled.div`
  margin-top: 30px;
  display: flex;
  flex-direction: column;
  gap: 15px;
`;

const TextArea = styled.textarea`
  width: 100%;
  background: rgba(0, 0, 0, 0.3);
  border: 1px solid #333;
  border-radius: 10px;
  padding: 15px;
  color: white;
  font-family: 'Exo 2', sans-serif;
  font-size: 1rem;
  resize: none;
  height: 100px;
  box-sizing: border-box;

  &:focus {
    outline: none;
    border-color: #00ccff;
    box-shadow: 0 0 10px rgba(0, 204, 255, 0.2);
  }
`;

const Button = styled.button<{ disabled?: boolean }>`
  padding: 15px 30px;
  background: linear-gradient(45deg, #00ccff, #0088cc);
  border: none;
  border-radius: 30px;
  color: white;
  font-weight: 700;
  font-size: 1rem;
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  margin: 0 auto;

  &:hover:not(:disabled) {
    transform: scale(1.05);
    box-shadow: 0 0 20px rgba(0, 204, 255, 0.4);
  }

  &:disabled {
    background: #444;
    cursor: not-allowed;
    transform: none;
    box-shadow: none;
  }
`;

const ResponseArea = styled.div<{ isActive: boolean }>`
  margin-top: 20px;
  text-align: left;
  background: rgba(0, 204, 255, 0.05);
  padding: 20px;
  border-radius: 10px;
  border-left: 3px solid #00ccff;
  min-height: 50px;
  opacity: ${props => (props.isActive ? 1 : 0)};
  transition: opacity 0.5s;
  color: #e0e0e0;
  line-height: 1.6;
`;

// ============================================
// Component
// ============================================

const MainContent: React.FC<MainContentProps> = ({ isVisible, apiKey }) => {
  const [userQuery, setUserQuery] = useState('');
  const [response, setResponse] = useState('');
  const [showResponse, setShowResponse] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const callGemini = async (prompt: string) => {
    try {
      const apiResponse = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${apiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            systemInstruction: {
              parts: [
                {
                  text: "You are 'AutoHub Expert', a professional car mechanic and market analyst. Answer the user's question concisely and professionally. If they ask about buying, suggest checking the platform's listings.",
                },
              ],
            },
          }),
        }
      );

      const data = await apiResponse.json();
      return data.candidates[0].content.parts[0].text;
    } catch (error) {
      logger.error('Gemini API error:', error as Error, {
        context: 'MainContent',
        action: 'callGeminiAPI'
      });
      throw error;
    }
  };

  const handleAsk = async () => {
    const question = userQuery.trim();
    if (!question) return;

    setIsLoading(true);
    setResponse('Analyzing your request...');
    setShowResponse(true);

    try {
      const answer = await callGemini(question);
      setResponse(answer);
    } catch (error) {
      setResponse('Error connecting to AI Database. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && e.ctrlKey) {
      handleAsk();
    }
  };

  return (
    <MainContentDiv isVisible={isVisible}>
      <ContentCard>
        <Title>AutoHub AI</Title>
        <Subtitle>Welcome to the future of car diagnostics and sales.</Subtitle>

        <AIInterface>
          <TextArea
            value={userQuery}
            onChange={e => setUserQuery(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Ask about car maintenance, specs, or buying tips (e.g., 'What should I check when buying a used BMW?')..."
          />
          <Button onClick={handleAsk} disabled={isLoading || !userQuery.trim()}>
            <span>{isLoading ? '⚙️ Processing...' : '✨ Ask AutoHub Expert'}</span>
          </Button>
          <ResponseArea isActive={showResponse}>{response}</ResponseArea>
        </AIInterface>
      </ContentCard>
    </MainContentDiv>
  );
};

export default MainContent;
