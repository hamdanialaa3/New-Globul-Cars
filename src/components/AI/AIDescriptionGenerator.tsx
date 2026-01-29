import React, { useState } from 'react';
import styled from 'styled-components';
import { deepSeekService, CarData } from '../../services/ai/DeepSeekService';
import { Loader2, Wand2, Copy, Check, AlertCircle } from 'lucide-react';

interface AIDescriptionGeneratorProps {
    carData: CarData;
    onDescriptionGenerated?: (description: string) => void;
}

const Container = styled.div`
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  padding: 24px;
  margin: 20px 0;
  font-family: 'Inter', sans-serif;
`;

const Header = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 20px;
  gap: 12px;
  
  h3 {
    margin: 0;
    color: #1e293b;
    font-size: 18px;
    font-weight: 600;
  }
`;

const IconWrapper = styled.div`
  background: #eff6ff;
  color: #3b82f6;
  padding: 8px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const Controls = styled.div`
  display: flex;
  gap: 16px;
  margin-bottom: 20px;
  flex-wrap: wrap;
`;

const Select = styled.select`
  padding: 8px 12px;
  border: 1px solid #cbd5e1;
  border-radius: 6px;
  background: white;
  color: #334155;
  font-size: 14px;
  min-width: 140px;
  cursor: pointer;
  
  &:focus {
    outline: none;
    border-color: #3b82f6;
    box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.1);
  }
`;

const GenerateButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 8px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  flex-grow: 1;
  
  &:hover:not(:disabled) {
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(37, 99, 235, 0.2);
  }
  
  &:active:not(:disabled) {
    transform: translateY(0);
  }
  
  &:disabled {
    opacity: 0.7;
    cursor: not-allowed;
    background: #94a3b8;
  }
`;

const ResultArea = styled.div`
  margin-top: 20px;
  position: relative;
`;

const TextArea = styled.textarea`
  width: 100%;
  min-height: 200px;
  padding: 16px;
  border: 1px solid #cbd5e1;
  border-radius: 8px;
  font-family: inherit;
  font-size: 14px;
  line-height: 1.6;
  resize: vertical;
  color: #334155;
  
  &:focus {
    outline: none;
    border-color: #3b82f6;
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  margin-top: 8px;
`;

const ActionButton = styled.button`
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  border: 1px solid #e2e8f0;
  background: white;
  border-radius: 6px;
  color: #64748b;
  font-size: 13px;
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover {
    background: #f8fafc;
    color: #334155;
    border-color: #cbd5e1;
  }
`;

const Message = styled.div<{ type: 'error' | 'success' }>`
  margin-top: 12px;
  padding: 10px;
  border-radius: 6px;
  font-size: 14px;
  display: flex;
  align-items: center;
  gap: 8px;
  
  ${props => props.type === 'error' ? `
    background: #fef2f2;
    color: #ef4444;
    border: 1px solid #fecaca;
  ` : `
    background: #f0fdf4;
    color: #22c55e;
    border: 1px solid #bbf7d0;
  `}
`;

export const AIDescriptionGenerator: React.FC<AIDescriptionGeneratorProps> = ({
    carData,
    onDescriptionGenerated
}) => {
    const [description, setDescription] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [style, setStyle] = useState<'professional' | 'friendly'>('professional');
    const [language, setLanguage] = useState<'bg' | 'en'>('bg');
    const [copied, setCopied] = useState(false);

    const handleGenerate = async () => {
        setLoading(true);
        setError(null);
        try {
            const result = await deepSeekService.generateCarDescription(carData, style, language);
            setDescription(result);
            if (onDescriptionGenerated) {
                onDescriptionGenerated(result);
            }
        } catch (err: any) {
            setError(err.message || 'Failed to generate description');
        } finally {
            setLoading(false);
        }
    };

    const handleCopy = () => {
        navigator.clipboard.writeText(description);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <Container>
            <Header>
                <IconWrapper>
                    <Wand2 size={20} />
                </IconWrapper>
                <h3>AI Description Generator</h3>
            </Header>

            <Controls>
                <Select
                    value={style}
                    onChange={(e) => setStyle(e.target.value as any)}
                >
                    <option value="professional">Professional</option>
                    <option value="friendly">Friendly</option>
                </Select>

                <Select
                    value={language}
                    onChange={(e) => setLanguage(e.target.value as any)}
                >
                    <option value="bg">Bulgarian</option>
                    <option value="en">English</option>
                </Select>

                <GenerateButton onClick={handleGenerate} disabled={loading}>
                    {loading ? (
                        <>
                            <Loader2 size={18} className="animate-spin" />
                            Generating...
                        </>
                    ) : (
                        'Generate Description'
                    )}
                </GenerateButton>
            </Controls>

            {error && (
                <Message type="error">
                    <AlertCircle size={16} />
                    {error}
                </Message>
            )}

            {description && (
                <ResultArea>
                    <TextArea
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                    />
                    <ButtonGroup>
                        <ActionButton onClick={handleCopy}>
                            {copied ? <Check size={14} /> : <Copy size={14} />}
                            {copied ? 'Copied' : 'Copy Text'}
                        </ActionButton>
                    </ButtonGroup>
                </ResultArea>
            )}
        </Container>
    );
};
