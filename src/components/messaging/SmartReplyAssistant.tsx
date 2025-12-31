import React, { useState } from 'react';
import styled from 'styled-components';
import { deepSeekService } from '../../services/ai/DeepSeekService';
import {
  ModernSparkles,
  ModernLoader,
  ModernMessageSquare
} from './icons/ModernIcons';

interface SmartReplyAssistantProps {
    messageText: string;
    onReplySelected: (reply: string) => void;
    carContext?: string; // e.g., "Audi A4 2015"
}

const Container = styled.div`
  margin-top: 8px;
`;

const SuggestionButton = styled.button`
  display: flex;
  align-items: center;
  gap: 6px;
  background: transparent;
  border: 1px solid #e2e8f0;
  color: #64748b;
  padding: 6px 12px;
  border-radius: 99px;
  font-size: 13px;
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover {
    border-color: #3b82f6;
    color: #3b82f6;
    background: #eff6ff;
  }
`;

const SuggestionsList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-top: 10px;
  background: white;
  border: 1px solid #e2e8f0;
  padding: 12px;
  border-radius: 12px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
`;

const ReplyOption = styled.button`
  text-align: left;
  padding: 8px 12px;
  background: #f8fafc;
  border: 1px solid transparent;
  border-radius: 8px;
  font-size: 14px;
  color: #334155;
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover {
    background: #eff6ff;
    border-color: #bfdbfe;
    color: #1e40af;
  }
`;

export const SmartReplyAssistant: React.FC<SmartReplyAssistantProps> = ({
    messageText,
    onReplySelected,
    carContext
}) => {
    const [replies, setReplies] = useState<string[]>([]);
    const [loading, setLoading] = useState(false);
    const [isOpen, setIsOpen] = useState(false);

    const generateReplies = async () => {
        setLoading(true);
        setIsOpen(true);
        try {
            const prompt = `
        I am a car seller in Bulgaria. I received this message: "${messageText}".
        Context: ${carContext || 'General inquiry'}.
        
        Generate 3 short, professional replies in Bulgarian.
        1. Friendly & Open
        2. Professional & Direct
        3. Simple acknowledgment
        
        Return ONLY the 3 replies separated by "|||".
      `;

            const response = await deepSeekService.generateText({
                prompt,
                temperature: 0.7
            });

            if (response.success) {
                const generated = response.content.split('|||').map(s => s.trim()).filter(Boolean);
                setReplies(generated);
            }
        } catch (error) {
            console.error('Smart reply error', error);
        } finally {
            setLoading(false);
        }
    };

    if (!messageText) return null;

    return (
        <Container>
            {!isOpen ? (
                <SuggestionButton onClick={generateReplies}>
                    <ModernSparkles size={14} color="#8b5cf6" />
                    Smart Replies
                </SuggestionButton>
            ) : (
                <SuggestionsList>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                        <span style={{ fontSize: '12px', fontWeight: 600, color: '#64748b' }}>AI Suggestions</span>
                        <button onClick={() => setIsOpen(false)} style={{ border: 'none', background: 'none', cursor: 'pointer', color: '#94a3b8' }}>&times;</button>
                    </div>

                    {loading ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px', color: '#64748b', fontSize: '14px' }}>
                            <ModernLoader size={16} />
                            Generating replies...
                        </div>
                    ) : (
                        replies.map((reply, index) => (
                            <ReplyOption key={index} onClick={() => { onReplySelected(reply); setIsOpen(false); }}>
                                {reply}
                            </ReplyOption>
                        ))
                    )}
                </SuggestionsList>
            )}
        </Container>
    );
};
