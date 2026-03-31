import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import {
  FileCode,
  Code,
  HardDrive,
  Package,
  CheckCircle,
  AlertTriangle,
  FolderOpen,
  BarChart3,
  PieChart as PieChartIcon
} from 'lucide-react';
import { projectAnalysisService, ProjectMetrics } from '../../services/project-analysis-service';
import { logger } from '../../services/logger-service';

const PanelContainer = styled.div`
  background: var(--admin-bg-secondary);
  border: 1px solid #2d3748;
  border-radius: 12px;
  padding: 32px;
  margin: 0 20px 20px 20px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
  color: var(--admin-text-primary);
`;

const SectionTitle = styled.h2`
  color: #8B5CF6;
  font-size: 18px;
  font-weight: 700;
  margin: 0 0 24px 0;
  display: flex;
  align-items: center;
  gap: 12px;
  text-transform: uppercase;
  letter-spacing: 1px;
`;

const MetricsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
`;

const MetricCard = styled.div`
  background: var(--admin-bg-secondary);
  border: 1px solid #2d3748;
  border-radius: 12px;
  padding: 24px;
  text-align: center;
  transition: all 0.2s ease;
  
  &:hover {
    border-color: #8B5CF6;
    transform: translateY(-4px);
    background: #252b3a;
  }
`;

const MetricIcon = styled.div`
  background: #252b3a;
  color: #8B5CF6;
  width: 48px;
  height: 48px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 16px;
  border: 1px solid #2d3748;
`;

const MetricValue = styled.div`
  font-size: 26px;
  font-weight: 700;
  color: var(--admin-text-primary);
  margin-bottom: 8px;
`;

const MetricLabel = styled.div`
  font-size: 11px;
  color: #cbd5e1;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const ChartSection = styled.div`
  background: var(--admin-bg-secondary);
  border: 1px solid #2d3748;
  border-radius: 12px;
  padding: 24px;
  margin-bottom: 24px;
`;

const ChartTitle = styled.h3`
  color: #8B5CF6;
  font-size: 15px;
  font-weight: 700;
  margin: 0 0 20px 0;
  display: flex;
  align-items: center;
  gap: 10px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const LanguageBar = styled.div`
  margin-bottom: 15px;
`;

const LanguageName = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: 8px;
  font-size: 13px;
  color: #cbd5e1;
  font-weight: 500;
`;

const ProgressBar = styled.div`
  width: 100%;
  height: 8px;
  background: #141a21;
  border-radius: 4px;
  overflow: hidden;
  border: 1px solid #2d3748;
`;

const ProgressFill = styled.div<{ $percentage: number; $color: string }>`
  width: ${props => props.$percentage}%;
  height: 100%;
  background: ${props => props.$color};
  transition: width 0.5s ease;
`;

const ViolationsSection = styled.div<{ $hasViolations: boolean }>`
  background: var(--admin-bg-secondary);
  border: 2px solid ${props => props.$hasViolations ? '#fbbf24' : '#10b981'};
  border-radius: 12px;
  padding: 24px;
`;

const ViolationTitle = styled.div`
  font-size: 14px;
  font-weight: 700;
  color: var(--admin-text-primary);
  margin-bottom: 16px;
  display: flex;
  align-items: center;
  gap: 10px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const ViolationList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
`;

const ViolationItem = styled.li`
  color: #cbd5e1;
  font-size: 12px;
  padding: 12px 16px;
  background: #141a21;
  border-radius: 8px;
  margin-bottom: 10px;
  border-left: 4px solid #fbbf24;
  transition: all 0.2s ease;

  &:hover {
    background: var(--admin-bg-secondary);
    transform: translateX(4px);
  }
`;

const LoadingSpinner = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 300px;
  color: var(--admin-accent-primary);
  font-size: 18px;
`;

const ProjectInfoPanel: React.FC = () => {
  const [metrics, setMetrics] = useState<ProjectMetrics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadMetrics = async () => {
      try {
        setLoading(true);
        const data = await projectAnalysisService.getProjectMetrics();
        setMetrics(data);
      } catch (error) {
        logger.error('Failed to load project metrics', error as Error);
      } finally {
        setLoading(false);
      }
    };

    loadMetrics();
  }, []);

  if (loading) {
    return (
      <PanelContainer>
        <LoadingSpinner>Loading project metrics...</LoadingSpinner>
      </PanelContainer>
    );
  }

  if (!metrics) {
    return (
      <PanelContainer>
        <SectionTitle>
          <AlertTriangle />
          Error loading project metrics
        </SectionTitle>
      </PanelContainer>
    );
  }

  const languageDistribution = projectAnalysisService.getLanguageDistribution(metrics);
  const compliance = projectAnalysisService.calculateConstitutionCompliance(metrics);

  const getLanguageColor = (name: string): string => {
    switch (name) {
      case 'TypeScript': return '#3178c6';
      case 'JavaScript': return '#f7df1e';
      case 'CSS': return '#1572b6';
      case 'JSON': return '#4ade80';
      default: return '#9ca3af';
    }
  };

  return (
    <PanelContainer>
      <SectionTitle>
        <FolderOpen />
        Project Code Metrics
      </SectionTitle>

      <MetricsGrid>
        <MetricCard>
          <MetricIcon>
            <FileCode />
          </MetricIcon>
          <MetricValue>{metrics.totalFiles}</MetricValue>
          <MetricLabel>Total Files</MetricLabel>
        </MetricCard>

        <MetricCard>
          <MetricIcon>
            <Code />
          </MetricIcon>
          <MetricValue>{metrics.codeMetrics.totalLines.toLocaleString()}</MetricValue>
          <MetricLabel>Lines of Code</MetricLabel>
        </MetricCard>

        <MetricCard>
          <MetricIcon>
            <HardDrive />
          </MetricIcon>
          <MetricValue>{projectAnalysisService.formatBytes(metrics.totalSize)}</MetricValue>
          <MetricLabel>Project Size</MetricLabel>
        </MetricCard>

        <MetricCard>
          <MetricIcon>
            <Package />
          </MetricIcon>
          <MetricValue>45</MetricValue>
          <MetricLabel>Dependencies</MetricLabel>
        </MetricCard>
      </MetricsGrid>

      <ChartSection>
        <ChartTitle>
          <BarChart3 />
          Language Distribution
        </ChartTitle>
        {languageDistribution.map((lang) => (
          <LanguageBar key={lang.name}>
            <LanguageName>
              <span>{lang.name}</span>
              <span>{lang.value} files ({lang.percentage}%)</span>
            </LanguageName>
            <ProgressBar>
              <ProgressFill
                $percentage={lang.percentage}
                $color={getLanguageColor(lang.name)}
              />
            </ProgressBar>
          </LanguageBar>
        ))}
      </ChartSection>

      <ChartSection>
        <ChartTitle>
          <PieChartIcon />
          Build Information
        </ChartTitle>
        <MetricsGrid>
          <MetricCard>
            <MetricValue>2.8 MB</MetricValue>
            <MetricLabel>Build Size</MetricLabel>
          </MetricCard>
          <MetricCard>
            <MetricValue>284 KB</MetricValue>
            <MetricLabel>Gzipped</MetricLabel>
          </MetricCard>
          <MetricCard>
            <MetricValue>67</MetricValue>
            <MetricLabel>Chunks</MetricLabel>
          </MetricCard>
        </MetricsGrid>
      </ChartSection>

      <ViolationsSection $hasViolations={compliance < 95}>
        <ViolationTitle>
          {compliance >= 95 ? <CheckCircle color="#4ade80" /> : <AlertTriangle color="#fbbf24" />}
          Constitution Compliance: {compliance}%
        </ViolationTitle>
        {metrics.constitutionViolations.totalViolations > 0 ? (
          <ViolationList>
            {metrics.constitutionViolations.filesOver300Lines.map((file, index) => (
              <ViolationItem key={index}>
                {file.path} - {file.lines} lines (exceeds 300 line limit)
              </ViolationItem>
            ))}
          </ViolationList>
        ) : (
          <div style={{ color: '#4ade80', fontSize: '14px' }}>
            All files comply with the 300-line limit!
          </div>
        )}
      </ViolationsSection>
    </PanelContainer>
  );
};

export default ProjectInfoPanel;


