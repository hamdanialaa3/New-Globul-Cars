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
  background: linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%);
  border: 2px solid #ffd700;
  border-radius: 15px;
  padding: 30px;
  margin: 20px;
  box-shadow: 0 20px 40px rgba(255, 215, 0, 0.2);
  color: #ffd700;
`;

const SectionTitle = styled.h2`
  color: #ffd700;
  font-size: 20px;
  font-weight: 700;
  margin: 0 0 25px 0;
  text-shadow: 0 2px 4px rgba(255, 215, 0, 0.3);
  display: flex;
  align-items: center;
  gap: 10px;
`;

const MetricsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
`;

const MetricCard = styled.div`
  background: linear-gradient(135deg, #2d2d2d 0%, #1a1a1a 100%);
  border: 2px solid #ffd700;
  border-radius: 12px;
  padding: 20px;
  text-align: center;
  transition: all 0.3s ease;
  
  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 15px 40px rgba(255, 215, 0, 0.3);
  }
`;

const MetricIcon = styled.div`
  background: linear-gradient(135deg, #ffd700 0%, #ffed4e 100%);
  color: #000000;
  width: 50px;
  height: 50px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 12px;
  border: 3px solid #ffd700;
  box-shadow: 0 5px 15px rgba(255, 215, 0, 0.3);
`;

const MetricValue = styled.div`
  font-size: 28px;
  font-weight: 800;
  color: #ffd700;
  margin-bottom: 6px;
  text-shadow: 0 2px 4px rgba(255, 215, 0, 0.3);
`;

const MetricLabel = styled.div`
  font-size: 12px;
  color: #ffd700;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 1px;
`;

const ChartSection = styled.div`
  background: linear-gradient(135deg, #2d2d2d 0%, #1a1a1a 100%);
  border: 2px solid #ffd700;
  border-radius: 12px;
  padding: 25px;
  margin-bottom: 30px;
`;

const ChartTitle = styled.h3`
  color: #ffd700;
  font-size: 16px;
  font-weight: 600;
  margin: 0 0 20px 0;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const LanguageBar = styled.div`
  margin-bottom: 15px;
`;

const LanguageName = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: 6px;
  font-size: 13px;
  color: #ffd700;
`;

const ProgressBar = styled.div`
  width: 100%;
  height: 8px;
  background: #1a1a1a;
  border-radius: 4px;
  overflow: hidden;
  border: 1px solid #ffd700;
`;

const ProgressFill = styled.div<{ $percentage: number; $color: string }>`
  width: ${props => props.$percentage}%;
  height: 100%;
  background: ${props => props.$color};
  transition: width 0.5s ease;
`;

const ViolationsSection = styled.div<{ $hasViolations: boolean }>`
  background: linear-gradient(135deg, #2d2d2d 0%, #1a1a1a 100%);
  border: 2px solid ${props => props.$hasViolations ? '#fbbf24' : '#4ade80'};
  border-radius: 12px;
  padding: 20px;
`;

const ViolationTitle = styled.div`
  font-size: 14px;
  font-weight: 600;
  color: #ffd700;
  margin-bottom: 12px;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const ViolationList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
`;

const ViolationItem = styled.li`
  color: #ffd700;
  font-size: 12px;
  padding: 8px 12px;
  background: #1a1a1a;
  border-radius: 6px;
  margin-bottom: 8px;
  border-left: 3px solid #fbbf24;
`;

const LoadingSpinner = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 300px;
  color: #ffd700;
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

