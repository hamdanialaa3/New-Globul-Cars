// Simple Auth Test Component
// مكون اختبار المصادقة المبسط

import React, { useState, useEffect } from 'react';
import { User, onAuthStateChanged } from 'firebase/auth';
import { SocialAuthService } from '../firebase/social-auth-service';
import { auth } from '../firebase/firebase-config';

const SimpleAuthTest: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [logs, setLogs] = useState<string[]>([]);

  const addLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString('ar-SA');
    setLogs(prev => [...prev, `[${timestamp}] ${message}`]);
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
      if (currentUser) {
        addLog(`✅ تسجيل دخول: ${currentUser.email || 'مجهول'}`);
      } else {
        addLog('❌ غير مسجل دخول');
      }
    });

    return () => unsubscribe();
  }, []);

  const testGoogleLogin = async () => {
    addLog('🔄 اختبار تسجيل دخول Google...');
    try {
      const result = await SocialAuthService.signInWithGoogle();
      if (result && result.user) {
        addLog(`✅ Google Login نجح: ${result.user.email}`);
      } else {
        addLog(`❌ Google Login فشل`);
      }
    } catch (error: any) {
      addLog(`❌ خطأ Google: ${error.message}`);
    }
  };

  const testAnonymousLogin = async () => {
    addLog('🔄 اختبار تسجيل دخول مجهول...');
    try {
      const result = await SocialAuthService.signInAnonymously();
      if (result && result.user) {
        addLog(`✅ Anonymous Login نجح: ${result.user.uid}`);
      } else {
        addLog(`❌ Anonymous Login فشل`);
      }
    } catch (error: any) {
      addLog(`❌ خطأ Anonymous: ${error.message}`);
    }
  };

  const testLogout = async () => {
    addLog('🔄 اختبار تسجيل خروج...');
    try {
      await auth.signOut();
      addLog('✅ تسجيل خروج نجح');
    } catch (error: any) {
      addLog(`❌ خطأ خروج: ${error.message}`);
    }
  };

  return (
    <div style={{ 
      maxWidth: '600px', 
      margin: '2rem auto', 
      padding: '2rem', 
      border: '1px solid #ccc', 
      borderRadius: '8px',
      fontFamily: 'Arial, sans-serif'
    }}>
      <h2>🔐 اختبار المصادقة البسيط</h2>
      
      <div style={{ marginBottom: '1rem', padding: '1rem', backgroundColor: '#f5f5f5' }}>
        <h3>📊 الحالة الحالية</h3>
        {loading ? (
          <p>⏳ جارٍ التحقق...</p>
        ) : user ? (
          <div style={{ color: 'green' }}>
            <p>✅ مسجل دخول</p>
            <p>📧 البريد: {user.email || 'غير متوفر'}</p>
            <p>👤 الاسم: {user.displayName || 'غير متوفر'}</p>
            <p>🆔 UID: {user.uid}</p>
          </div>
        ) : (
          <p style={{ color: 'red' }}>❌ غير مسجل دخول</p>
        )}
      </div>

      <div style={{ marginBottom: '1rem' }}>
        <h3>🧪 اختبارات المصادقة</h3>
        <button onClick={testGoogleLogin} style={{ margin: '0.5rem', padding: '0.5rem 1rem' }}>
          🔍 اختبار Google
        </button>
        <button onClick={testAnonymousLogin} style={{ margin: '0.5rem', padding: '0.5rem 1rem' }}>
          👤 اختبار مجهول
        </button>
        <button onClick={testLogout} style={{ margin: '0.5rem', padding: '0.5rem 1rem' }}>
          🚪 تسجيل خروج
        </button>
      </div>

      <div style={{ marginTop: '1rem' }}>
        <h3>📝 سجل الأحداث</h3>
        <div style={{ 
          height: '200px', 
          overflow: 'auto', 
          backgroundColor: '#000', 
          color: '#00ff00', 
          padding: '1rem',
          fontFamily: 'monospace',
          whiteSpace: 'pre-wrap'
        }}>
          {logs.join('\n')}
        </div>
      </div>
    </div>
  );
};

export default SimpleAuthTest;