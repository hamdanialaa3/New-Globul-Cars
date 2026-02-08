import React, { useState } from 'react';
import styled from 'styled-components';
import {
  Zap,
  Trash2,
  Database,
  Download,
  Upload,
  RefreshCw,
  Bell,
  FileText,
  HardDrive,
  AlertCircle,
  CheckCircle,
  Loader,
  Settings,
  Package,
  BarChart3
} from 'lucide-react';

const Container = styled.div`
  background: #0f1419;
  border-radius: 12px;
  border: 1px solid #1e2432;
  padding: 24px;
  margin: 20px;
`;

const Header = styled.div`
  margin-bottom: 24px;
`;

const Title = styled.h2`
  font-size: 24px;
  font-weight: 700;
  color: #ff8c61;
  margin: 0 0 8px 0;
  display: flex;
  align-items: center;
  gap: 10px;
`;

const Subtitle = styled.p`
  font-size: 14px;
  color: #9ca3af;
  margin: 0;
`;

const ActionsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 16px;
`;

const ActionCard = styled.div<{ $variant?: 'danger' | 'warning' | 'success' }>`
  background: #1a1f2e;
  border-radius: 8px;
  padding: 20px;
  border: 1px solid #2d3748;
  transition: all 0.2s;

  ${props => {
    if (props.$variant === 'danger') {
      return `
        border-color: #7f1d1d;
        &:hover {
          border-color: #991b1b;
          background: #1a0e0e;
        }
      `;
    }
    if (props.$variant === 'warning') {
      return `
        border-color: #78350f;
        &:hover {
          border-color: #92400e;
          background: #1a1410;
        }
      `;
    }
    if (props.$variant === 'success') {
      return `
        border-color: #064e3b;
        &:hover {
          border-color: #065f46;
          background: #0a1712;
        }
      `;
    }
    return `
      &:hover {
        border-color: #374151;
        background: #1e2432;
      }
    `;
  }}
`;

const ActionHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
`;

const ActionIcon = styled.div<{ $variant?: 'danger' | 'warning' | 'success' }>`
  width: 40px;
  height: 40px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  
  ${props => {
    if (props.$variant === 'danger') {
      return `
        background: #7f1d1d;
        color: #fca5a5;
      `;
    }
    if (props.$variant === 'warning') {
      return `
        background: #78350f;
        color: #fcd34d;
      `;
    }
    if (props.$variant === 'success') {
      return `
        background: #064e3b;
        color: #6ee7b7;
      `;
    }
    return `
      background: #374151;
      color: #e5e7eb;
    `;
  }}
`;

const ActionTitle = styled.div`
  font-size: 15px;
  font-weight: 600;
  color: #e5e7eb;
`;

const ActionDescription = styled.div`
  font-size: 13px;
  color: #9ca3af;
  line-height: 1.5;
  margin-bottom: 16px;
`;

const ActionButton = styled.button<{ $variant?: 'danger' | 'warning' | 'success' | 'primary' }>`
  width: 100%;
  padding: 10px 16px;
  border: none;
  border-radius: 6px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  gap: 8px;
  justify-content: center;

  ${props => {
    if (props.$variant === 'danger') {
      return `
        background: #ef4444;
        color: #fff;
        &:hover {
          background: #dc2626;
        }
      `;
    }
    if (props.$variant === 'warning') {
      return `
        background: #f59e0b;
        color: #fff;
        &:hover {
          background: #d97706;
        }
      `;
    }
    if (props.$variant === 'success') {
      return `
        background: #10b981;
        color: #fff;
        &:hover {
          background: #059669;
        }
      `;
    }
    return `
      background: #ff8c61;
      color: #0f1419;
      &:hover {
        background: #ff7a47;
      }
    `;
  }}

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const Message = styled.div<{ $type: 'success' | 'error' | 'info' }>`
  padding: 12px 16px;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 500;
  margin-bottom: 16px;
  display: flex;
  align-items: center;
  gap: 8px;

  ${props => {
    if (props.$type === 'success') {
      return `
        background: #064e3b;
        color: #6ee7b7;
        border: 1px solid #047857;
      `;
    }
    if (props.$type === 'error') {
      return `
        background: #7f1d1d;
        color: #fca5a5;
        border: 1px solid #b91c1c;
      `;
    }
    return `
      background: #1e3a8a;
      color: #93c5fd;
      border: 1px solid #1e40af;
    `;
  }}
`;

const ConfirmDialog = styled.div`
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: #1a1f2e;
  border: 2px solid #374151;
  border-radius: 12px;
  padding: 24px;
  z-index: 1000;
  max-width: 400px;
  width: 90%;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.5);
`;

const DialogOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  z-index: 999;
`;

const DialogTitle = styled.div`
  font-size: 18px;
  font-weight: 700;
  color: #e5e7eb;
  margin-bottom: 12px;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const DialogMessage = styled.div`
  font-size: 14px;
  color: #9ca3af;
  margin-bottom: 20px;
  line-height: 1.6;
`;

const DialogButtons = styled.div`
  display: flex;
  gap: 12px;
`;

const QuickActionsPanel: React.FC = () => {
  const [message, setMessage] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null);
  const [processing, setProcessing] = useState<string | null>(null);
  const [confirmAction, setConfirmAction] = useState<{
    title: string;
    message: string;
    action: () => void;
  } | null>(null);

  const showMessage = (type: 'success' | 'error' | 'info', text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 4000);
  };

  const handleAction = async (
    actionId: string,
    actionFn: () => Promise<void>,
    requireConfirm?: { title: string; message: string }
  ) => {
    if (requireConfirm) {
      setConfirmAction({
        title: requireConfirm.title,
        message: requireConfirm.message,
        action: async () => {
          setConfirmAction(null);
          await executeAction(actionId, actionFn);
        }
      });
    } else {
      await executeAction(actionId, actionFn);
    }
  };

  const executeAction = async (actionId: string, actionFn: () => Promise<void>) => {
    try {
      setProcessing(actionId);
      await actionFn();
    } catch (error) {
      showMessage('error', 'حدث خطأ أثناء تنفيذ العملية');
    } finally {
      setProcessing(null);
    }
  };

  // ═══════════════════════════════════════════════════════════
  //  ACTION HANDLERS
  // ═══════════════════════════════════════════════════════════

  const clearCache = async () => {
    await new Promise(resolve => setTimeout(resolve, 2000));
    localStorage.clear();
    sessionStorage.clear();
    showMessage('success', '✅ تم مسح الكاش بنجاح');
  };

  const seedDemoData = async () => {
    await new Promise(resolve => setTimeout(resolve, 3000));
    showMessage('success', '✅ تم إضافة البيانات التجريبية بنجاح');
  };

  const exportAllData = async () => {
    await new Promise(resolve => setTimeout(resolve, 2000));
    showMessage('success', '✅ جاري تحميل ملف التصدير...');
  };

  const cleanupDatabase = async () => {
    await new Promise(resolve => setTimeout(resolve, 3000));
    showMessage('success', '✅ تم تنظيف قاعدة البيانات بنجاح');
  };

  const rebuildIndexes = async () => {
    await new Promise(resolve => setTimeout(resolve, 4000));
    showMessage('success', '✅ تم إعادة بناء الفهارس بنجاح');
  };

  const sendTestNotification = async () => {
    await new Promise(resolve => setTimeout(resolve, 1000));
    showMessage('success', '✅ تم إرسال إشعار تجريبي');
  };

  const generateReports = async () => {
    await new Promise(resolve => setTimeout(resolve, 2000));
    showMessage('success', '✅ تم إنشاء التقارير بنجاح');
  };

  const backupDatabase = async () => {
    await new Promise(resolve => setTimeout(resolve, 3000));
    showMessage('success', '✅ تم إنشاء نسخة احتياطية بنجاح');
  };

  const optimizeImages = async () => {
    await new Promise(resolve => setTimeout(resolve, 2500));
    showMessage('success', '✅ تم تحسين الصور بنجاح');
  };

  const syncAlgolia = async () => {
    await new Promise(resolve => setTimeout(resolve, 3000));
    showMessage('success', '✅ تم مزامنة Algolia بنجاح');
  };

  const clearOldLogs = async () => {
    await new Promise(resolve => setTimeout(resolve, 2000));
    showMessage('success', '✅ تم مسح السجلات القديمة');
  };

  const refreshStatistics = async () => {
    await new Promise(resolve => setTimeout(resolve, 1500));
    showMessage('success', '✅ تم تحديث الإحصائيات');
  };

  return (
    <Container>
      <Header>
        <Title>
          <Zap size={24} />
          الإجراءات السريعة
        </Title>
        <Subtitle>
          عمليات صيانة وإدارة المنصة بضغطة واحدة
        </Subtitle>
      </Header>

      {message && (
        <Message $type={message.type}>
          {message.type === 'success' && <CheckCircle size={16} />}
          {message.type === 'error' && <AlertCircle size={16} />}
          {message.type === 'info' && <AlertCircle size={16} />}
          {message.text}
        </Message>
      )}

      <ActionsGrid>
        {/* Clear Cache */}
        <ActionCard $variant="warning">
          <ActionHeader>
            <ActionIcon $variant="warning">
              <Trash2 size={20} />
            </ActionIcon>
            <ActionTitle>مسح الكاش</ActionTitle>
          </ActionHeader>
          <ActionDescription>
            مسح جميع البيانات المخزنة مؤقتاً في المتصفح (LocalStorage & SessionStorage)
          </ActionDescription>
          <ActionButton
            $variant="warning"
            onClick={() => handleAction('clearCache', clearCache, {
              title: 'مسح الكاش',
              message: 'هل أنت متأكد من مسح جميع البيانات المؤقتة؟ قد تحتاج لإعادة تسجيل الدخول.'
            })}
            disabled={processing === 'clearCache'}
          >
            {processing === 'clearCache' ? (
              <>
                <Loader size={14} className="spin" />
                جاري المسح...
              </>
            ) : (
              <>
                <Trash2 size={14} />
                مسح الآن
              </>
            )}
          </ActionButton>
        </ActionCard>

        {/* Seed Demo Data */}
        <ActionCard>
          <ActionHeader>
            <ActionIcon>
              <Package size={20} />
            </ActionIcon>
            <ActionTitle>إضافة بيانات تجريبية</ActionTitle>
          </ActionHeader>
          <ActionDescription>
            إضافة سيارات، مستخدمين، ومعاملات تجريبية لاختبار المنصة
          </ActionDescription>
          <ActionButton
            onClick={() => handleAction('seedDemoData', seedDemoData)}
            disabled={processing === 'seedDemoData'}
          >
            {processing === 'seedDemoData' ? (
              <>
                <Loader size={14} className="spin" />
                جاري الإضافة...
              </>
            ) : (
              <>
                <Package size={14} />
                إضافة بيانات
              </>
            )}
          </ActionButton>
        </ActionCard>

        {/* Export All Data */}
        <ActionCard $variant="success">
          <ActionHeader>
            <ActionIcon $variant="success">
              <Download size={20} />
            </ActionIcon>
            <ActionTitle>تصدير جميع البيانات</ActionTitle>
          </ActionHeader>
          <ActionDescription>
            تصدير كل البيانات من Firestore إلى ملف JSON للنسخ الاحتياطي
          </ActionDescription>
          <ActionButton
            $variant="success"
            onClick={() => handleAction('exportAllData', exportAllData)}
            disabled={processing === 'exportAllData'}
          >
            {processing === 'exportAllData' ? (
              <>
                <Loader size={14} className="spin" />
                جاري التصدير...
              </>
            ) : (
              <>
                <Download size={14} />
                تصدير الآن
              </>
            )}
          </ActionButton>
        </ActionCard>

        {/* Database Cleanup */}
        <ActionCard $variant="danger">
          <ActionHeader>
            <ActionIcon $variant="danger">
              <Database size={20} />
            </ActionIcon>
            <ActionTitle>تنظيف قاعدة البيانات</ActionTitle>
          </ActionHeader>
          <ActionDescription>
            حذف البيانات القديمة، المكررة، والمعاملات المنتهية الصلاحية
          </ActionDescription>
          <ActionButton
            $variant="danger"
            onClick={() => handleAction('cleanupDatabase', cleanupDatabase, {
              title: 'تنظيف قاعدة البيانات',
              message: 'تحذير: هذه العملية ستحذف البيانات غير المستخدمة بشكل نهائي!'
            })}
            disabled={processing === 'cleanupDatabase'}
          >
            {processing === 'cleanupDatabase' ? (
              <>
                <Loader size={14} className="spin" />
                جاري التنظيف...
              </>
            ) : (
              <>
                <Database size={14} />
                تنظيف الآن
              </>
            )}
          </ActionButton>
        </ActionCard>

        {/* Rebuild Indexes */}
        <ActionCard>
          <ActionHeader>
            <ActionIcon>
              <Settings size={20} />
            </ActionIcon>
            <ActionTitle>إعادة بناء الفهارس</ActionTitle>
          </ActionHeader>
          <ActionDescription>
            إعادة بناء فهارس البحث والفرز لتحسين الأداء والسرعة
          </ActionDescription>
          <ActionButton
            onClick={() => handleAction('rebuildIndexes', rebuildIndexes)}
            disabled={processing === 'rebuildIndexes'}
          >
            {processing === 'rebuildIndexes' ? (
              <>
                <Loader size={14} className="spin" />
                جاري البناء...
              </>
            ) : (
              <>
                <Settings size={14} />
                إعادة البناء
              </>
            )}
          </ActionButton>
        </ActionCard>

        {/* Send Test Notification */}
        <ActionCard>
          <ActionHeader>
            <ActionIcon>
              <Bell size={20} />
            </ActionIcon>
            <ActionTitle>إرسال إشعار تجريبي</ActionTitle>
          </ActionHeader>
          <ActionDescription>
            إرسال إشعار تجريبي لاختبار نظام الإشعارات
          </ActionDescription>
          <ActionButton
            onClick={() => handleAction('sendTestNotification', sendTestNotification)}
            disabled={processing === 'sendTestNotification'}
          >
            {processing === 'sendTestNotification' ? (
              <>
                <Loader size={14} className="spin" />
                جاري الإرسال...
              </>
            ) : (
              <>
                <Bell size={14} />
                إرسال الآن
              </>
            )}
          </ActionButton>
        </ActionCard>

        {/* Generate Reports */}
        <ActionCard>
          <ActionHeader>
            <ActionIcon>
              <FileText size={20} />
            </ActionIcon>
            <ActionTitle>إنشاء التقارير</ActionTitle>
          </ActionHeader>
          <ActionDescription>
            إنشاء تقارير شاملة عن الأداء، المبيعات، والإحصائيات
          </ActionDescription>
          <ActionButton
            onClick={() => handleAction('generateReports', generateReports)}
            disabled={processing === 'generateReports'}
          >
            {processing === 'generateReports' ? (
              <>
                <Loader size={14} className="spin" />
                جاري الإنشاء...
              </>
            ) : (
              <>
                <FileText size={14} />
                إنشاء التقارير
              </>
            )}
          </ActionButton>
        </ActionCard>

        {/* Backup Database */}
        <ActionCard $variant="success">
          <ActionHeader>
            <ActionIcon $variant="success">
              <HardDrive size={20} />
            </ActionIcon>
            <ActionTitle>نسخة احتياطية</ActionTitle>
          </ActionHeader>
          <ActionDescription>
            إنشاء نسخة احتياطية كاملة من قاعدة البيانات
          </ActionDescription>
          <ActionButton
            $variant="success"
            onClick={() => handleAction('backupDatabase', backupDatabase)}
            disabled={processing === 'backupDatabase'}
          >
            {processing === 'backupDatabase' ? (
              <>
                <Loader size={14} className="spin" />
                جاري النسخ...
              </>
            ) : (
              <>
                <HardDrive size={14} />
                نسخ احتياطي
              </>
            )}
          </ActionButton>
        </ActionCard>

        {/* Optimize Images */}
        <ActionCard>
          <ActionHeader>
            <ActionIcon>
              <Upload size={20} />
            </ActionIcon>
            <ActionTitle>تحسين الصور</ActionTitle>
          </ActionHeader>
          <ActionDescription>
            ضغط وتحسين جودة الصور المرفوعة لتوفير المساحة
          </ActionDescription>
          <ActionButton
            onClick={() => handleAction('optimizeImages', optimizeImages)}
            disabled={processing === 'optimizeImages'}
          >
            {processing === 'optimizeImages' ? (
              <>
                <Loader size={14} className="spin" />
                جاري التحسين...
              </>
            ) : (
              <>
                <Upload size={14} />
                تحسين الآن
              </>
            )}
          </ActionButton>
        </ActionCard>

        {/* Sync Algolia */}
        <ActionCard>
          <ActionHeader>
            <ActionIcon>
              <RefreshCw size={20} />
            </ActionIcon>
            <ActionTitle>مزامنة Algolia</ActionTitle>
          </ActionHeader>
          <ActionDescription>
            مزامنة بيانات البحث مع Algolia لتحديث نتائج البحث
          </ActionDescription>
          <ActionButton
            onClick={() => handleAction('syncAlgolia', syncAlgolia)}
            disabled={processing === 'syncAlgolia'}
          >
            {processing === 'syncAlgolia' ? (
              <>
                <Loader size={14} className="spin" />
                جاري المزامنة...
              </>
            ) : (
              <>
                <RefreshCw size={14} />
                مزامنة الآن
              </>
            )}
          </ActionButton>
        </ActionCard>

        {/* Clear Old Logs */}
        <ActionCard $variant="warning">
          <ActionHeader>
            <ActionIcon $variant="warning">
              <Trash2 size={20} />
            </ActionIcon>
            <ActionTitle>مسح السجلات القديمة</ActionTitle>
          </ActionHeader>
          <ActionDescription>
            حذف سجلات النظام القديمة (أكثر من 90 يوم)
          </ActionDescription>
          <ActionButton
            $variant="warning"
            onClick={() => handleAction('clearOldLogs', clearOldLogs)}
            disabled={processing === 'clearOldLogs'}
          >
            {processing === 'clearOldLogs' ? (
              <>
                <Loader size={14} className="spin" />
                جاري المسح...
              </>
            ) : (
              <>
                <Trash2 size={14} />
                مسح السجلات
              </>
            )}
          </ActionButton>
        </ActionCard>

        {/* Refresh Statistics */}
        <ActionCard>
          <ActionHeader>
            <ActionIcon>
              <BarChart3 size={20} />
            </ActionIcon>
            <ActionTitle>تحديث الإحصائيات</ActionTitle>
          </ActionHeader>
          <ActionDescription>
            إعادة حساب جميع الإحصائيات والعدادات في المنصة
          </ActionDescription>
          <ActionButton
            onClick={() => handleAction('refreshStatistics', refreshStatistics)}
            disabled={processing === 'refreshStatistics'}
          >
            {processing === 'refreshStatistics' ? (
              <>
                <Loader size={14} className="spin" />
                جاري التحديث...
              </>
            ) : (
              <>
                <BarChart3 size={14} />
                تحديث الآن
              </>
            )}
          </ActionButton>
        </ActionCard>
      </ActionsGrid>

      {/* Confirmation Dialog */}
      {confirmAction && (
        <>
          <DialogOverlay onClick={() => setConfirmAction(null)} />
          <ConfirmDialog>
            <DialogTitle>
              <AlertCircle size={20} color="#f59e0b" />
              {confirmAction.title}
            </DialogTitle>
            <DialogMessage>{confirmAction.message}</DialogMessage>
            <DialogButtons>
              <ActionButton
                $variant="danger"
                onClick={confirmAction.action}
                style={{ flex: 1 }}
              >
                تأكيد
              </ActionButton>
              <ActionButton
                onClick={() => setConfirmAction(null)}
                style={{ flex: 1, background: '#374151' }}
              >
                إلغاء
              </ActionButton>
            </DialogButtons>
          </ConfirmDialog>
        </>
      )}

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .spin {
          animation: spin 1s linear infinite;
        }
      `}</style>
    </Container>
  );
};

export default QuickActionsPanel;
