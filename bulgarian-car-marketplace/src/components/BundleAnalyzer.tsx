import React, { useEffect, useState } from 'react';
import styled from 'styled-components';

interface BundleInfo {
  totalSize: number;
  gzippedSize: number;
  chunks: Array<{
    name: string;
    size: number;
    gzippedSize: number;
  }>;
}

class BundleAnalyzerService {
  private static instance: BundleAnalyzerService;
  private bundleInfo: BundleInfo | null = null;

  static getInstance(): BundleAnalyzerService {
    if (!BundleAnalyzerService.instance) {
      BundleAnalyzerService.instance = new BundleAnalyzerService();
    }
    return BundleAnalyzerService.instance;
  }

  analyzeBundle() {
    // Analyze current bundle
    const scripts = Array.from(document.querySelectorAll('script[src]'));
    const styles = Array.from(document.querySelectorAll('link[rel="stylesheet"]'));
    
    let totalSize = 0;
    let gzippedSize = 0;
    const chunks: Array<{ name: string; size: number; gzippedSize: number }> = [];

    // Analyze JavaScript files
    scripts.forEach((script) => {
      const src = (script as HTMLScriptElement).src;
      if (src.includes('static/js/')) {
        const size = this.estimateSize(src);
        const gzipped = Math.round(size * 0.3); // Estimate gzip compression
        
        totalSize += size;
        gzippedSize += gzipped;
        
        chunks.push({
          name: src.split('/').pop() || 'unknown',
          size,
          gzippedSize: gzipped
        });
      }
    });

    // Analyze CSS files
    styles.forEach((style) => {
      const href = (style as HTMLLinkElement).href;
      if (href.includes('static/css/')) {
        const size = this.estimateSize(href);
        const gzipped = Math.round(size * 0.2); // CSS compresses better
        
        totalSize += size;
        gzippedSize += gzipped;
        
        chunks.push({
          name: href.split('/').pop() || 'unknown',
          size,
          gzippedSize: gzipped
        });
      }
    });

    this.bundleInfo = {
      totalSize,
      gzippedSize,
      chunks: chunks.sort((a, b) => b.size - a.size)
    };

    return this.bundleInfo;
  }

  private estimateSize(url: string): number {
    // This is a rough estimation - in a real app, you'd fetch the actual file size
    // For now, we'll use some heuristics based on common bundle sizes
    if (url.includes('main.')) return 500000; // ~500KB for main bundle
    if (url.includes('chunk.')) return 50000; // ~50KB for chunks
    if (url.includes('.css')) return 20000; // ~20KB for CSS
    return 10000; // Default 10KB
  }

  getBundleInfo(): BundleInfo | null {
    return this.bundleInfo;
  }

  getPerformanceScore(): number {
    if (!this.bundleInfo) return 0;

    const { gzippedSize } = this.bundleInfo;
    
    // Score based on bundle size (lower is better)
    if (gzippedSize < 100000) return 100; // Excellent
    if (gzippedSize < 250000) return 80;  // Good
    if (gzippedSize < 500000) return 60;  // Fair
    if (gzippedSize < 1000000) return 40; // Poor
    return 20; // Very poor
  }

  getRecommendations(): string[] {
    if (!this.bundleInfo) return [];

    const recommendations: string[] = [];
    const { totalSize, gzippedSize, chunks } = this.bundleInfo;

    if (gzippedSize > 500000) {
      recommendations.push('Consider code splitting to reduce initial bundle size');
    }

    if (chunks.length > 10) {
      recommendations.push('Too many chunks - consider consolidating smaller ones');
    }

    const largeChunks = chunks.filter(chunk => chunk.size > 200000);
    if (largeChunks.length > 0) {
      recommendations.push(`Large chunks detected: ${largeChunks.map(c => c.name).join(', ')}`);
    }

    if (totalSize > 2000000) {
      recommendations.push('Total bundle size is very large - consider lazy loading');
    }

    return recommendations;
  }
}

export const bundleAnalyzerService = BundleAnalyzerService.getInstance();

// Bundle Analyzer Component
export const BundleAnalyzer: React.FC = () => {
  const [bundleInfo, setBundleInfo] = useState<BundleInfo | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    // Analyze bundle on mount
    const info = bundleAnalyzerService.analyzeBundle();
    setBundleInfo(info);

    // Show analyzer in development
    if (process.env.NODE_ENV === 'development') {
      setIsVisible(true);
    }
  }, []);

  if (!isVisible || !bundleInfo) {
    return null;
  }

  const performanceScore = bundleAnalyzerService.getPerformanceScore();
  const recommendations = bundleAnalyzerService.getRecommendations();

  return (
    <AnalyzerContainer>
      <AnalyzerHeader>
        <AnalyzerTitle>Bundle Analyzer</AnalyzerTitle>
        <CloseButton onClick={() => setIsVisible(false)}>×</CloseButton>
      </AnalyzerHeader>
      
      <ScoreContainer>
        <ScoreLabel>Performance Score</ScoreLabel>
        <ScoreValue $score={performanceScore}>
          {performanceScore}/100
        </ScoreValue>
      </ScoreContainer>

      <SizeInfo>
        <SizeItem>
          <SizeLabel>Total Size</SizeLabel>
          <SizeValue>{(bundleInfo.totalSize / 1024).toFixed(1)} KB</SizeValue>
        </SizeItem>
        <SizeItem>
          <SizeLabel>Gzipped</SizeLabel>
          <SizeValue>{(bundleInfo.gzippedSize / 1024).toFixed(1)} KB</SizeValue>
        </SizeItem>
        <SizeItem>
          <SizeLabel>Chunks</SizeLabel>
          <SizeValue>{bundleInfo.chunks.length}</SizeValue>
        </SizeItem>
      </SizeInfo>

      <ToggleButton onClick={() => setShowDetails(!showDetails)}>
        {showDetails ? 'Hide Details' : 'Show Details'}
      </ToggleButton>

      {showDetails && (
        <DetailsContainer>
          <DetailsTitle>Chunk Details</DetailsTitle>
          <ChunkList>
            {bundleInfo.chunks.map((chunk, index) => (
              <ChunkItem key={index}>
                <ChunkName>{chunk.name}</ChunkName>
                <ChunkSize>{(chunk.size / 1024).toFixed(1)} KB</ChunkSize>
                <ChunkGzipped>{(chunk.gzippedSize / 1024).toFixed(1)} KB</ChunkGzipped>
              </ChunkItem>
            ))}
          </ChunkList>

          {recommendations.length > 0 && (
            <RecommendationsContainer>
              <RecommendationsTitle>Recommendations</RecommendationsTitle>
              <RecommendationsList>
                {recommendations.map((rec, index) => (
                  <RecommendationItem key={index}>{rec}</RecommendationItem>
                ))}
              </RecommendationsList>
            </RecommendationsContainer>
          )}
        </DetailsContainer>
      )}
    </AnalyzerContainer>
  );
};

// Styled Components
const AnalyzerContainer = styled.div`
  position: fixed;
  bottom: 20px;
  right: 20px;
  background: rgba(0, 0, 0, 0.9);
  color: white;
  padding: 16px;
  border-radius: 8px;
  font-family: monospace;
  font-size: 12px;
  z-index: 9999;
  max-width: 400px;
  max-height: 80vh;
  overflow-y: auto;
`;

const AnalyzerHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
`;

const AnalyzerTitle = styled.h3`
  margin: 0;
  font-size: 14px;
  font-weight: bold;
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  color: white;
  font-size: 18px;
  cursor: pointer;
  padding: 0;
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const ScoreContainer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
  padding: 8px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 4px;
`;

const ScoreLabel = styled.span`
  color: #ccc;
`;

const ScoreValue = styled.span<{ $score: number }>`
  color: ${({ $score }) => 
    $score >= 80 ? '#4ade80' : 
    $score >= 60 ? '#fbbf24' : 
    '#f87171'
  };
  font-weight: bold;
  font-size: 16px;
`;

const SizeInfo = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 8px;
  margin-bottom: 12px;
`;

const SizeItem = styled.div`
  text-align: center;
  padding: 4px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 4px;
`;

const SizeLabel = styled.div`
  color: #ccc;
  font-size: 10px;
  margin-bottom: 2px;
`;

const SizeValue = styled.div`
  color: #4ade80;
  font-weight: bold;
`;

const ToggleButton = styled.button`
  width: 100%;
  padding: 8px;
  background: #2563eb;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 12px;
  margin-bottom: 12px;

  &:hover {
    background: #1d4ed8;
  }
`;

const DetailsContainer = styled.div`
  border-top: 1px solid rgba(255, 255, 255, 0.2);
  padding-top: 12px;
`;

const DetailsTitle = styled.h4`
  margin: 0 0 8px 0;
  font-size: 12px;
  color: #ccc;
`;

const ChunkList = styled.div`
  max-height: 200px;
  overflow-y: auto;
  margin-bottom: 12px;
`;

const ChunkItem = styled.div`
  display: grid;
  grid-template-columns: 2fr 1fr 1fr;
  gap: 8px;
  padding: 4px 0;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  font-size: 10px;
`;

const ChunkName = styled.span`
  color: white;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const ChunkSize = styled.span`
  color: #fbbf24;
  text-align: right;
`;

const ChunkGzipped = styled.span`
  color: #4ade80;
  text-align: right;
`;

const RecommendationsContainer = styled.div`
  border-top: 1px solid rgba(255, 255, 255, 0.2);
  padding-top: 8px;
`;

const RecommendationsTitle = styled.h4`
  margin: 0 0 8px 0;
  font-size: 12px;
  color: #ccc;
`;

const RecommendationsList = styled.ul`
  margin: 0;
  padding-left: 16px;
`;

const RecommendationItem = styled.li`
  color: #fbbf24;
  font-size: 10px;
  margin-bottom: 4px;
`;

export default BundleAnalyzer;