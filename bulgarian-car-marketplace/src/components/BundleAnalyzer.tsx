// src/components/BundleAnalyzer.tsx
// Bundle analyzer component for monitoring bundle size and dependencies

import React, { useEffect, useState } from 'react';
import styled from 'styled-components';

interface BundleInfo {
  totalSize: number;
  gzippedSize: number;
  chunks: Array<{
    name: string;
    size: number;
    modules: string[];
  }>;
}

const AnalyzerContainer = styled.div<{ visible: boolean }>`
  position: fixed;
  top: 20px;
  left: 20px;
  background: rgba(0, 0, 0, 0.9);
  color: white;
  padding: 15px;
  border-radius: 8px;
  font-size: 12px;
  font-family: monospace;
  z-index: 9999;
  display: ${props => props.visible ? 'block' : 'none'};
  max-width: 400px;
  max-height: 80vh;
  overflow-y: auto;
`;

const BundleItem = styled.div`
  margin: 5px 0;
  padding: 5px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 4px;
`;

const SizeBar = styled.div<{ percentage: number }>`
  height: 4px;
  background: #4CAF50;
  width: ${props => props.percentage}%;
  border-radius: 2px;
  margin-top: 2px;
`;

const BundleAnalyzer: React.FC = () => {
  const [bundleInfo, setBundleInfo] = useState<BundleInfo | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Simulate bundle analysis (in real app, this would come from webpack-bundle-analyzer)
    const mockBundleInfo: BundleInfo = {
      totalSize: 248.91 * 1024, // Convert KB to bytes
      gzippedSize: 85.2 * 1024,
      chunks: [
        { name: 'main.js', size: 200 * 1024, modules: ['react', 'styled-components', 'firebase'] },
        { name: 'vendor.js', size: 150 * 1024, modules: ['lodash', 'axios', 'moment'] },
        { name: 'pages.js', size: 80 * 1024, modules: ['HomePage', 'CarsPage', 'ProfilePage'] },
        { name: 'components.js', size: 60 * 1024, modules: ['Header', 'Footer', 'CarCard'] }
      ]
    };

    setBundleInfo(mockBundleInfo);

    // Keyboard shortcut to toggle visibility (Ctrl+Shift+B)
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.shiftKey && e.key === 'B') {
        setVisible(prev => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyPress);

    return () => {
      window.removeEventListener('keydown', handleKeyPress);
    };
  }, []);

  const formatSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  if (!bundleInfo) return null;

  const maxChunkSize = Math.max(...bundleInfo.chunks.map(c => c.size));

  return (
    <AnalyzerContainer visible={visible}>
      <div><strong>Bundle Analyzer</strong></div>
      <div>Press Ctrl+Shift+B to toggle</div>
      <hr style={{ margin: '10px 0', borderColor: '#555' }} />

      <div><strong>Total Size:</strong> {formatSize(bundleInfo.totalSize)}</div>
      <div><strong>Gzipped:</strong> {formatSize(bundleInfo.gzippedSize)}</div>
      <div><strong>Chunks: {bundleInfo.chunks.length}</strong></div>

      <div style={{ marginTop: '10px' }}>
        {bundleInfo.chunks.map((chunk, index) => (
          <BundleItem key={index}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>{chunk.name}</span>
              <span>{formatSize(chunk.size)}</span>
            </div>
            <SizeBar percentage={(chunk.size / maxChunkSize) * 100} />
            <div style={{ fontSize: '10px', marginTop: '2px', color: '#ccc' }}>
              {chunk.modules.slice(0, 3).join(', ')}
              {chunk.modules.length > 3 && '...'}
            </div>
          </BundleItem>
        ))}
      </div>
    </AnalyzerContainer>
  );
};

export default BundleAnalyzer;