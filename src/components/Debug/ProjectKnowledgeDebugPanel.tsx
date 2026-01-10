/**
 * Project Knowledge Debug Panel
 * لوحة تحكم لاختبار نظام معرفة المشروع
 * 
 * للاستخدام في Development فقط
 */

import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { projectKnowledgeService } from '../../services/ai/project-knowledge.service';
import { logger } from '@/services/logger-service';

export const ProjectKnowledgeDebugPanel: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadKnowledge();
  }, []);

  const loadKnowledge = async () => {
    const loaded = await projectKnowledgeService.loadKnowledgeBase();
    setIsLoaded(loaded);
    
    if (loaded) {
      const statistics = projectKnowledgeService.getStats();
      setStats(statistics);
    }
  };

  const handleSearch = async () => {
    if (!query.trim()) return;
    
    setLoading(true);
    try {
      const searchResults = await projectKnowledgeService.search(query, 10);
      setResults(searchResults);
    } catch (error) {
      logger.error('ProjectKnowledgeDebugPanel search error', error as Error, { query });
    } finally {
      setLoading(false);
    }
  };

  const handleIntelligentSearch = async () => {
    if (!query.trim()) return;
    
    setLoading(true);
    try {
      const searchResults = await projectKnowledgeService.intelligentSearch(query);
      logger.debug('Intelligent Search Results', { query, resultsCount: searchResults?.results?.length });
      setResults(searchResults.results);
    } catch (error) {
      logger.error('ProjectKnowledgeDebugPanel intelligent search error', error as Error, { query });
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) {
    return (
      <FloatingButton onClick={() => setIsOpen(true)} title="Open Project Knowledge Debug Panel">
        🎓
      </FloatingButton>
    );
  }

  return (
    <Panel>
      <Header>
        <Title>🎓 Project Knowledge System</Title>
        <CloseButton onClick={() => setIsOpen(false)}>✕</CloseButton>
      </Header>

      <Content>
        {/* Status */}
        <Section>
          <SectionTitle>📊 Status</SectionTitle>
          <StatusBadge $status={isLoaded}>
            {isLoaded ? '✅ Loaded' : '❌ Not Loaded'}
          </StatusBadge>
          
          {isLoaded && stats && (
            <Stats>
              <Stat>📁 Files: <strong>{stats.totalFiles}</strong></Stat>
              <Stat>📝 Lines: <strong>{stats.totalLines.toLocaleString()}</strong></Stat>
              <Stat>⚙️ Functions: <strong>{stats.codeStats.totalFunctions}</strong></Stat>
              <Stat>🏛️ Classes: <strong>{stats.codeStats.totalClasses}</strong></Stat>
              <Stat>📋 Interfaces: <strong>{stats.codeStats.totalInterfaces}</strong></Stat>
            </Stats>
          )}
        </Section>

        {/* Search */}
        <Section>
          <SectionTitle>🔍 Search Test</SectionTitle>
          <SearchBox>
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search the project... (e.g., 'car service', 'firebase', 'authentication')"
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            />
            <ButtonGroup>
              <Button onClick={handleSearch} disabled={loading || !isLoaded}>
                {loading ? '⏳' : '🔍'} Search
              </Button>
              <Button onClick={handleIntelligentSearch} disabled={loading || !isLoaded} $primary>
                {loading ? '⏳' : '🤖'} Smart Search
              </Button>
            </ButtonGroup>
          </SearchBox>

          {/* Quick Tests */}
          <QuickTests>
            <QuickTestButton onClick={() => { setQuery('firebase config'); handleSearch(); }}>
              Test: Firebase
            </QuickTestButton>
            <QuickTestButton onClick={() => { setQuery('car service'); handleSearch(); }}>
              Test: Car Service
            </QuickTestButton>
            <QuickTestButton onClick={() => { setQuery('authentication'); handleSearch(); }}>
              Test: Auth
            </QuickTestButton>
          </QuickTests>
        </Section>

        {/* Results */}
        {results.length > 0 && (
          <Section>
            <SectionTitle>📊 Results ({results.length})</SectionTitle>
            <Results>
              {results.map((result, idx) => (
                <Result key={idx}>
                  <ResultHeader>
                    <FileName>{result.file.path}</FileName>
                    <Score>⭐ {result.relevanceScore}</Score>
                  </ResultHeader>
                  <ResultBody>
                    <ResultMeta>
                      <span>📝 {result.file.lines} lines</span>
                      <span>💾 {(result.file.size / 1024).toFixed(1)} KB</span>
                      <span>🏷️ {result.file.keywords.slice(0, 3).join(', ')}</span>
                    </ResultMeta>
                    <ResultReason>🔍 {result.matchReason}</ResultReason>
                    <ResultDescription>{result.file.summary.description.slice(0, 200)}...</ResultDescription>
                    
                    {result.file.analysis.functions && result.file.analysis.functions.length > 0 && (
                      <ResultFunctions>
                        ⚙️ Functions: {result.file.analysis.functions.slice(0, 5).join(', ')}
                      </ResultFunctions>
                    )}
                    
                    {result.file.analysis.classes && result.file.analysis.classes.length > 0 && (
                      <ResultClasses>
                        🏛️ Classes: {result.file.analysis.classes.slice(0, 3).join(', ')}
                      </ResultClasses>
                    )}
                  </ResultBody>
                </Result>
              ))}
            </Results>
          </Section>
        )}

        {/* Top Keywords */}
        {isLoaded && stats && (
          <Section>
            <SectionTitle>🏷️ Top Keywords</SectionTitle>
            <Keywords>
              {stats.topKeywords.slice(0, 20).map((kw: any) => (
                <Keyword key={kw.keyword} onClick={() => { setQuery(kw.keyword); handleSearch(); }}>
                  {kw.keyword} ({kw.count})
                </Keyword>
              ))}
            </Keywords>
          </Section>
        )}
      </Content>
    </Panel>
  );
};

// Styled Components
const FloatingButton = styled.button`
  position: fixed;
  bottom: 160px;
  right: 24px;
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border: none;
  font-size: 32px;
  cursor: pointer;
  box-shadow: 0 4px 20px rgba(0,0,0,0.2);
  z-index: 9997;
  transition: all 0.3s ease;

  &:hover {
    transform: scale(1.1);
    box-shadow: 0 6px 25px rgba(0,0,0,0.3);
  }
`;

const Panel = styled.div`
  position: fixed;
  top: 20px;
  right: 20px;
  width: 600px;
  max-height: 90vh;
  background: white;
  border-radius: 16px;
  box-shadow: 0 8px 40px rgba(0,0,0,0.2);
  z-index: 9997;
  display: flex;
  flex-direction: column;
  overflow: hidden;
`;

const Header = styled.div`
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 16px 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const Title = styled.h3`
  margin: 0;
  font-size: 18px;
  font-weight: 600;
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  color: white;
  font-size: 24px;
  cursor: pointer;
  padding: 0;
  
  &:hover {
    opacity: 0.8;
  }
`;

const Content = styled.div`
  padding: 20px;
  overflow-y: auto;
  flex: 1;
`;

const Section = styled.div`
  margin-bottom: 24px;
`;

const SectionTitle = styled.h4`
  margin: 0 0 12px 0;
  font-size: 16px;
  font-weight: 600;
  color: #333;
`;

const StatusBadge = styled.div<{ $status: boolean }>`
  display: inline-block;
  padding: 8px 16px;
  border-radius: 8px;
  background: ${p => p.$status ? '#10b981' : '#ef4444'};
  color: white;
  font-weight: 600;
  margin-bottom: 12px;
`;

const Stats = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 8px;
`;

const Stat = styled.div`
  padding: 8px;
  background: #f3f4f6;
  border-radius: 6px;
  font-size: 14px;
  
  strong {
    color: #667eea;
  }
`;

const SearchBox = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const Input = styled.input`
  padding: 12px;
  border: 2px solid #e5e7eb;
  border-radius: 8px;
  font-size: 14px;
  
  &:focus {
    outline: none;
    border-color: #667eea;
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 8px;
`;

const Button = styled.button<{ $primary?: boolean }>`
  flex: 1;
  padding: 10px;
  border: none;
  border-radius: 8px;
  background: ${p => p.$primary ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' : '#6b7280'};
  color: white;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0,0,0,0.2);
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const QuickTests = styled.div`
  display: flex;
  gap: 8px;
  margin-top: 12px;
`;

const QuickTestButton = styled.button`
  padding: 6px 12px;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  background: white;
  font-size: 12px;
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover {
    background: #f3f4f6;
    border-color: #667eea;
  }
`;

const Results = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
  max-height: 400px;
  overflow-y: auto;
`;

const Result = styled.div`
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  padding: 12px;
  background: #f9fafb;
`;

const ResultHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
`;

const FileName = styled.div`
  font-weight: 600;
  font-size: 13px;
  color: #667eea;
  font-family: monospace;
`;

const Score = styled.div`
  font-size: 12px;
  color: #f59e0b;
  font-weight: 600;
`;

const ResultBody = styled.div`
  font-size: 12px;
`;

const ResultMeta = styled.div`
  display: flex;
  gap: 12px;
  color: #6b7280;
  margin-bottom: 6px;
`;

const ResultReason = styled.div`
  color: #10b981;
  margin-bottom: 6px;
  font-weight: 500;
`;

const ResultDescription = styled.div`
  color: #4b5563;
  line-height: 1.5;
  margin-bottom: 6px;
`;

const ResultFunctions = styled.div`
  color: #8b5cf6;
  margin-top: 6px;
  font-family: monospace;
  font-size: 11px;
`;

const ResultClasses = styled.div`
  color: #ec4899;
  margin-top: 4px;
  font-family: monospace;
  font-size: 11px;
`;

const Keywords = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
`;

const Keyword = styled.button`
  padding: 4px 10px;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  background: white;
  font-size: 11px;
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover {
    background: #667eea;
    color: white;
    border-color: #667eea;
  }
`;

export default ProjectKnowledgeDebugPanel;
