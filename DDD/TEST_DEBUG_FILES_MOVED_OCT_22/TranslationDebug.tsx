import React, { useEffect, useState, useRef } from 'react';
import { useLanguage } from './contexts/LanguageContext';
import { translations } from './locales/translations';

/**
 * Translation Debug Component
 * Shows raw translation values and tests the t() function
 */
const TranslationDebug: React.FC = () => {
  const { language, t, toggleLanguage } = useLanguage();
  const [logs, setLogs] = useState<string[]>([]);
  const originalWarnRef = useRef<typeof console.warn>();
  
  // Capture console.warn messages - ONLY ONCE
  useEffect(() => {
    if (!originalWarnRef.current) {
      originalWarnRef.current = console.warn;
      console.warn = (...args) => {
        const message = args.join(' ');
        if (message.includes('[Translation]')) {
          setLogs(prev => {
            const newLogs = [...prev, message];
            return newLogs.slice(-5); // Keep last 5 only
          });
        }
        originalWarnRef.current?.apply(console, args);
      };
    }
    
    return () => {
      if (originalWarnRef.current) {
        console.warn = originalWarnRef.current;
      }
    };
  }, []); // Empty dependency array - run only once
  
  const testKeys = [
    'home.aiAnalytics.title',
    'home.aiAnalytics.subtitle',
    'home.smartSell.title',
    'home.smartSell.description',
    'home.dealerSpotlight.title',
    'home.features.finance.title',
    'home.features.insurance.title',
    'home.features.verified.title'
  ];
  
  // Direct check from translations object - memoize to avoid recalculation
  const directCheck = (key: string) => {
    const parts = key.split('.');
    let current: any = translations[language];
    for (const part of parts) {
      if (current && typeof current === 'object') {
        current = current[part];
      } else {
        return '❌ NOT FOUND';
      }
    }
    return typeof current === 'string' ? current : '❌ NOT STRING';
  };
  
  return (
    <div style={{
      position: 'fixed',
      bottom: 0,
      right: 0,
      background: 'rgba(0,0,0,0.95)',
      color: 'white',
      padding: '15px',
      maxWidth: '500px',
      maxHeight: '500px',
      overflow: 'auto',
      zIndex: 99999,
      fontSize: '11px',
      fontFamily: 'monospace',
      borderTopLeftRadius: '8px',
      boxShadow: '0 -4px 20px rgba(0,0,0,0.5)'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
        <h3 style={{ margin: 0, fontSize: '14px' }}>🔍 Translation Debug Panel</h3>
        <button 
          onClick={toggleLanguage}
          style={{
            background: '#4CAF50',
            color: 'white',
            border: 'none',
            padding: '5px 10px',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '11px'
          }}
        >
          Toggle Lang
        </button>
      </div>
      
      <div style={{ marginBottom: '10px', padding: '8px', background: 'rgba(255,255,255,0.1)', borderRadius: '4px' }}>
        <strong>Current Language:</strong> <span style={{ color: '#FFD700' }}>{language.toUpperCase()}</span>
        <br/>
        <strong>Translations Object:</strong> {translations ? '✅ Loaded' : '❌ Missing'}
        <br/>
        <strong>Language Data:</strong> {translations[language] ? '✅ Available' : '❌ Missing'}
      </div>
      
      <hr style={{ borderColor: '#333', margin: '10px 0' }} />
      
      <div style={{ marginBottom: '10px' }}>
        <strong>📋 Test Results:</strong>
      </div>
      
      {testKeys.map(key => {
        const tResult = t(key);
        const directResult = directCheck(key);
        const isWorking = tResult !== key;
        
        return (
          <div key={key} style={{ 
            marginBottom: '12px', 
            borderLeft: `3px solid ${isWorking ? '#4CAF50' : '#f44336'}`,
            paddingLeft: '8px',
            background: 'rgba(255,255,255,0.05)',
            padding: '8px',
            borderRadius: '4px'
          }}>
            <div style={{ color: '#888', fontSize: '10px', marginBottom: '4px' }}>
              {key}
            </div>
            <div style={{ marginBottom: '4px' }}>
              <span style={{ color: '#FFD700' }}>t() Result:</span>{' '}
              <span style={{ color: isWorking ? '#4CAF50' : '#f44336' }}>
                {tResult}
              </span>
            </div>
            <div style={{ fontSize: '10px', color: '#aaa' }}>
              <span style={{ color: '#FFD700' }}>Direct:</span>{' '}
              {directResult.substring(0, 50)}{directResult.length > 50 ? '...' : ''}
            </div>
          </div>
        );
      })}
      
      {logs.length > 0 && (
        <>
          <hr style={{ borderColor: '#333', margin: '10px 0' }} />
          <div style={{ marginBottom: '5px' }}>
            <strong>⚠️ Console Warnings:</strong>
          </div>
          {logs.map((log, i) => (
            <div key={i} style={{ 
              fontSize: '9px', 
              color: '#ff9800', 
              marginBottom: '3px',
              padding: '4px',
              background: 'rgba(255,152,0,0.1)',
              borderRadius: '3px'
            }}>
              {log.replace('[Translation]', '').trim()}
            </div>
          ))}
        </>
      )}
    </div>
  );
};

export default TranslationDebug;
