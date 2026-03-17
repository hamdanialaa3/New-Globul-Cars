/**
 * Admin Manual Payment Verification Dashboard
 * Complete dashboard for verifying manual bank transfers
 * 
 * Features:
 * - Real-time pending transactions list
 * - Receipt preview
 * - Quick verify/reject actions
 * - Transaction history
 * - Search & filters
 * - WhatsApp integration
 * 
 * @route /admin/manual-payments
 * @since January 9, 2026
 */

import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { 
  CheckCircle, XCircle, Clock, Search, Filter, Eye, 
  ExternalLink, Download, MessageCircle, AlertCircle,
  TrendingUp, DollarSign, Users, Calendar
} from 'lucide-react';
import { toast } from 'react-toastify';
import { useAuth } from '@/contexts/AuthProvider';
import { useLanguage } from '@/contexts/LanguageContext';
import { manualPaymentService } from '@/services/payment/manual-payment-service';
import type { ManualPaymentTransaction, PaymentStatus } from '@/types/payment.types';
import { logger } from '@/services/logger-service';
import { AdminService } from '@/services/admin-permissions.service';
import { BANK_DETAILS } from '../../../../config/bank-details';

const AdminManualPaymentsDashboard: React.FC = () => {
  const { user } = useAuth();
  const { language } = useLanguage();

  const [transactions, setTransactions] = useState<ManualPaymentTransaction[]>([]);
  const [filteredTransactions, setFilteredTransactions] = useState<ManualPaymentTransaction[]>([]);
  const [selectedTransaction, setSelectedTransaction] = useState<ManualPaymentTransaction | null>(null);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<PaymentStatus | 'all'>('pending_manual_verification');
  const [searchQuery, setSearchQuery] = useState('');
  const [verificationNotes, setVerificationNotes] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  // Statistics
  const [stats, setStats] = useState({
    pending: 0,
    verified: 0,
    rejected: 0,
    totalAmount: 0
  });

  useEffect(() => {
    // Check admin permissions
    const initializeAdmin = async () => {
      if (!user) {
        toast.error('Access denied. Admin only.');
        return;
      }

      const hasAccess = await checkAdminAccess(user);
      if (!hasAccess) {
        return;
      }

      loadTransactions();

      // Real-time updates every 30 seconds
      const interval = setInterval(loadTransactions, 30000);
      return () => clearInterval(interval);
    };

    initializeAdmin();
  }, [user]);

  useEffect(() => {
    // Apply filters
    let filtered = transactions;

    if (filterStatus !== 'all') {
      filtered = filtered.filter(t => t.status === filterStatus);
    }

    if (searchQuery) {
      filtered = filtered.filter(t => 
        t.referenceNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.userEmail.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.userName.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    setFilteredTransactions(filtered);
  }, [transactions, filterStatus, searchQuery]);

  const checkAdminAccess = async (currentUser: any): Promise<boolean> => {
    try {
      // Check admin permissions from Firestore
      const adminService = AdminService.getInstance();
      const hasAccess = await adminService.isAdmin(currentUser.uid);
      
      if (!hasAccess) {
        logger.warn('[AdminManualPayments] Unauthorized access attempt', { 
          userId: currentUser.uid, 
          email: currentUser.email 
        });
        toast.error('Unauthorized: Admin access required');
        return false;
      }
      
      return true;
    } catch (error) {
      logger.error('[AdminManualPayments] Error checking admin access', error as Error);
      toast.error('Failed to verify admin permissions');
      return false;
    }
  };

  const loadTransactions = async () => {
    try {
      setLoading(true);
      const allTransactions = await manualPaymentService.getAllTransactions();
      setTransactions(allTransactions);

      // Calculate statistics
      const pending = allTransactions.filter(t => t.status === 'pending_manual_verification').length;
      const verified = allTransactions.filter(t => t.status === 'verified').length;
      const rejected = allTransactions.filter(t => t.status === 'rejected').length;
      const totalAmount = allTransactions
        .filter(t => t.status === 'verified' || t.status === 'completed')
        .reduce((sum, t) => sum + t.amount, 0);

      setStats({ pending, verified, rejected, totalAmount });
    } catch (error) {
      logger.error('Failed to load transactions', error as Error);
      toast.error('Failed to load transactions');
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (transactionId: string) => {
    if (!verificationNotes) {
      toast.error(language === 'bg' ? 'Моля, добавете бележка' : 'Please add a note');
      return;
    }

    setIsProcessing(true);
    try {
      await manualPaymentService.verifyTransaction({
        transactionId,
        status: 'verified',
        notes: verificationNotes,
        adminId: user!.uid
      });

      toast.success(language === 'bg' ? '✅ Плащането е потвърдено!' : '✅ Payment verified!');
      setVerificationNotes('');
      setSelectedTransaction(null);
      loadTransactions();
    } catch (error) {
      logger.error('Failed to verify payment', error as Error);
      toast.error('Failed to verify payment');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReject = async (transactionId: string) => {
    if (!verificationNotes) {
      toast.error(language === 'bg' ? 'Моля, посочете причина' : 'Please provide a reason');
      return;
    }

    setIsProcessing(true);
    try {
      await manualPaymentService.verifyTransaction({
        transactionId,
        status: 'rejected',
        notes: verificationNotes,
        adminId: user!.uid
      });

      toast.success(language === 'bg' ? '❌ Плащането е отхвърлено' : '❌ Payment rejected');
      setVerificationNotes('');
      setSelectedTransaction(null);
      loadTransactions();
    } catch (error) {
      logger.error('Failed to reject payment', error as Error);
      toast.error('Failed to reject payment');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleWhatsAppContact = (transaction: ManualPaymentTransaction) => {
    const phone = BANK_DETAILS.contact.phone.replace(/[^0-9]/g, '');
    const message = encodeURIComponent(
      `Hi ${transaction.userName}, regarding your payment REF: ${transaction.referenceNumber}`
    );
    window.open(`https://wa.me/${phone}?text=${message}`, '_blank');
  };

  const formatDate = (date: Date | undefined) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleString(language === 'bg' ? 'bg-BG' : 'en-US');
  };

  const getStatusBadge = (status: PaymentStatus) => {
    const statusConfig = {
      pending_manual_verification: { color: '#FFC107', label: language === 'bg' ? 'В очакване' : 'Pending' },
      verified: { color: '#00A651', label: language === 'bg' ? 'Потвърдено' : 'Verified' },
      rejected: { color: '#F44336', label: language === 'bg' ? 'Отхвърлено' : 'Rejected' },
      expired: { color: '#9E9E9E', label: language === 'bg' ? 'Изтекло' : 'Expired' },
      completed: { color: '#2196F3', label: language === 'bg' ? 'Завършено' : 'Completed' },
      refunded: { color: '#FF9800', label: language === 'bg' ? 'Възстановено' : 'Refunded' }
    };

    const config = statusConfig[status];
    return <StatusBadge color={config.color}>{config.label}</StatusBadge>;
  };

  if (loading) {
    return (
      <LoadingContainer>
        <Clock size={48} />
        <p>{language === 'bg' ? 'Зареждане...' : 'Loading...'}</p>
      </LoadingContainer>
    );
  }

  return (
    <Container>
      {/* Header */}
      <Header>
        <Title>{language === 'bg' ? '💳 Управление на ръчни плащания' : '💳 Manual Payments Management'}</Title>
        <Subtitle>
          {language === 'bg' 
            ? 'Потвърждавайте банкови преводи и активирайте абонаменти'
            : 'Verify bank transfers and activate subscriptions'}
        </Subtitle>
      </Header>

      {/* Statistics Cards */}
      <StatsGrid>
        <StatCard color="#FFC107">
          <StatIcon><Clock size={32} /></StatIcon>
          <StatValue>{stats.pending}</StatValue>
          <StatLabel>{language === 'bg' ? 'В очакване' : 'Pending'}</StatLabel>
        </StatCard>
        <StatCard color="#00A651">
          <StatIcon><CheckCircle size={32} /></StatIcon>
          <StatValue>{stats.verified}</StatValue>
          <StatLabel>{language === 'bg' ? 'Потвърдени' : 'Verified'}</StatLabel>
        </StatCard>
        <StatCard color="#F44336">
          <StatIcon><XCircle size={32} /></StatIcon>
          <StatValue>{stats.rejected}</StatValue>
          <StatLabel>{language === 'bg' ? 'Отхвърлени' : 'Rejected'}</StatLabel>
        </StatCard>
        <StatCard color="#2196F3">
          <StatIcon><DollarSign size={32} /></StatIcon>
          <StatValue>€{stats.totalAmount.toFixed(2)}</StatValue>
          <StatLabel>{language === 'bg' ? 'Общо приходи' : 'Total Revenue'}</StatLabel>
        </StatCard>
      </StatsGrid>

      {/* Filters & Search */}
      <FiltersBar>
        <SearchBox>
          <Search size={20} />
          <input
            type="text"
            placeholder={language === 'bg' ? 'Търси по номер, email или име...' : 'Search by ref, email or name...'}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </SearchBox>
        <FilterButtons>
          <FilterButton 
            active={filterStatus === 'all'}
            onClick={() => setFilterStatus('all')}
          >
            {language === 'bg' ? 'Всички' : 'All'}
          </FilterButton>
          <FilterButton 
            active={filterStatus === 'pending_manual_verification'}
            onClick={() => setFilterStatus('pending_manual_verification')}
          >
            {language === 'bg' ? 'В очакване' : 'Pending'}
          </FilterButton>
          <FilterButton 
            active={filterStatus === 'verified'}
            onClick={() => setFilterStatus('verified')}
          >
            {language === 'bg' ? 'Потвърдени' : 'Verified'}
          </FilterButton>
          <FilterButton 
            active={filterStatus === 'rejected'}
            onClick={() => setFilterStatus('rejected')}
          >
            {language === 'bg' ? 'Отхвърлени' : 'Rejected'}
          </FilterButton>
        </FilterButtons>
      </FiltersBar>

      {/* Transactions Table */}
      <TableContainer>
        <Table>
          <thead>
            <tr>
              <th>{language === 'bg' ? 'Референция' : 'Reference'}</th>
              <th>{language === 'bg' ? 'Клиент' : 'Customer'}</th>
              <th>{language === 'bg' ? 'Сума' : 'Amount'}</th>
              <th>{language === 'bg' ? 'Банка' : 'Bank'}</th>
              <th>{language === 'bg' ? 'Дата' : 'Date'}</th>
              <th>{language === 'bg' ? 'Статус' : 'Status'}</th>
              <th>{language === 'bg' ? 'Разписка' : 'Receipt'}</th>
              <th>{language === 'bg' ? 'Действия' : 'Actions'}</th>
            </tr>
          </thead>
          <tbody>
            {filteredTransactions.length === 0 ? (
              <tr>
                <td colSpan={8} style={{ textAlign: 'center', padding: '40px' }}>
                  <AlertCircle size={48} color="rgba(255, 255, 255, 0.3)" />
                  <p style={{ color: 'rgba(255, 255, 255, 0.5)', marginTop: '16px' }}>
                    {language === 'bg' ? 'Няма транзакции' : 'No transactions found'}
                  </p>
                </td>
              </tr>
            ) : (
              filteredTransactions.map((transaction) => (
                <tr key={transaction.id}>
                  <td>
                    <RefNumber>{transaction.referenceNumber}</RefNumber>
                  </td>
                  <td>
                    <CustomerInfo>
                      <strong>{transaction.userName}</strong>
                      <small>{transaction.userEmail}</small>
                    </CustomerInfo>
                  </td>
                  <td>
                    <Amount>€{transaction.amount.toFixed(2)}</Amount>
                  </td>
                  <td>
                    <BankBadge bank={transaction.selectedBankAccount}>
                      {transaction.selectedBankAccount === 'revolut' ? 'Revolut' : 'iCard'}
                    </BankBadge>
                  </td>
                  <td>
                    <DateText>{formatDate(transaction.createdAt)}</DateText>
                  </td>
                  <td>
                    {getStatusBadge(transaction.status)}
                  </td>
                  <td>
                    {transaction.receiptUrl ? (
                      <ReceiptButton onClick={() => window.open(transaction.receiptUrl, '_blank')}>
                        <Eye size={16} />
                        {language === 'bg' ? 'Виж' : 'View'}
                      </ReceiptButton>
                    ) : (
                      <NoReceipt>-</NoReceipt>
                    )}
                  </td>
                  <td>
                    <ActionButtons>
                      <ActionButton primary onClick={() => setSelectedTransaction(transaction)}>
                        <Eye size={16} />
                      </ActionButton>
                      <ActionButton onClick={() => handleWhatsAppContact(transaction)}>
                        <MessageCircle size={16} />
                      </ActionButton>
                    </ActionButtons>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </Table>
      </TableContainer>

      {/* Transaction Detail Modal */}
      {selectedTransaction && (
        <Modal onClick={() => setSelectedTransaction(null)}>
          <ModalContent onClick={(e) => e.stopPropagation()}>
            <ModalHeader>
              <ModalTitle>{language === 'bg' ? 'Детайли за плащане' : 'Payment Details'}</ModalTitle>
              <CloseButton onClick={() => setSelectedTransaction(null)}>×</CloseButton>
            </ModalHeader>

            <ModalBody>
              {/* Transaction Info */}
              <InfoSection>
                <InfoLabel>{language === 'bg' ? 'Референтен номер:' : 'Reference Number:'}</InfoLabel>
                <InfoValue>{selectedTransaction.referenceNumber}</InfoValue>
              </InfoSection>

              <InfoSection>
                <InfoLabel>{language === 'bg' ? 'Клиент:' : 'Customer:'}</InfoLabel>
                <InfoValue>
                  {selectedTransaction.userName} ({selectedTransaction.userEmail})
                </InfoValue>
              </InfoSection>

              <InfoSection>
                <InfoLabel>{language === 'bg' ? 'Сума:' : 'Amount:'}</InfoLabel>
                <InfoValue>€{selectedTransaction.amount.toFixed(2)} {selectedTransaction.currency}</InfoValue>
              </InfoSection>

              <InfoSection>
                <InfoLabel>{language === 'bg' ? 'Тип плащане:' : 'Payment Type:'}</InfoLabel>
                <InfoValue>{selectedTransaction.itemDescription}</InfoValue>
              </InfoSection>

              <InfoSection>
                <InfoLabel>{language === 'bg' ? 'Банка:' : 'Bank:'}</InfoLabel>
                <InfoValue>
                  {selectedTransaction.selectedBankAccount === 'revolut' ? 'Revolut' : 'iCard'}
                </InfoValue>
              </InfoSection>

              <InfoSection>
                <InfoLabel>{language === 'bg' ? 'Създадено на:' : 'Created At:'}</InfoLabel>
                <InfoValue>{formatDate(selectedTransaction.createdAt)}</InfoValue>
              </InfoSection>

              {selectedTransaction.receiptUrl && (
                <InfoSection>
                  <InfoLabel>{language === 'bg' ? 'Разписка:' : 'Receipt:'}</InfoLabel>
                  <ReceiptPreview>
                    <img src={selectedTransaction.receiptUrl} alt="Receipt" />
                    <ReceiptButton onClick={() => window.open(selectedTransaction.receiptUrl, '_blank')}>
                      <Download size={16} />
                      {language === 'bg' ? 'Изтегли' : 'Download'}
                    </ReceiptButton>
                  </ReceiptPreview>
                </InfoSection>
              )}

              {selectedTransaction.whatsappMessageSent && (
                <InfoSection>
                  <InfoLabel>{language === 'bg' ? 'WhatsApp:' : 'WhatsApp:'}</InfoLabel>
                  <InfoValue style={{ color: '#25D366' }}>
                    ✅ {language === 'bg' ? 'Доказателство изпратено' : 'Proof sent'}
                  </InfoValue>
                </InfoSection>
              )}

              {/* Verification Section */}
              {selectedTransaction.status === 'pending_manual_verification' && (
                <>
                  <Divider />
                  <VerificationSection>
                    <VerificationLabel>
                      {language === 'bg' ? 'Бележки за проверка:' : 'Verification Notes:'}
                    </VerificationLabel>
                    <VerificationTextarea
                      value={verificationNotes}
                      onChange={(e) => setVerificationNotes(e.target.value)}
                      placeholder={language === 'bg' 
                        ? 'Добавете бележки за проверката...'
                        : 'Add verification notes...'}
                      rows={3}
                    />
                    <VerificationButtons>
                      <VerifyButton 
                        onClick={() => handleVerify(selectedTransaction.id)}
                        disabled={isProcessing}
                      >
                        <CheckCircle size={20} />
                        {isProcessing ? '...' : (language === 'bg' ? 'Потвърди' : 'Verify')}
                      </VerifyButton>
                      <RejectButton 
                        onClick={() => handleReject(selectedTransaction.id)}
                        disabled={isProcessing}
                      >
                        <XCircle size={20} />
                        {isProcessing ? '...' : (language === 'bg' ? 'Отхвърли' : 'Reject')}
                      </RejectButton>
                    </VerificationButtons>
                  </VerificationSection>
                </>
              )}

              {/* Existing Verification Info */}
              {selectedTransaction.verifiedBy && (
                <>
                  <Divider />
                  <InfoSection>
                    <InfoLabel>{language === 'bg' ? 'Проверено от:' : 'Verified By:'}</InfoLabel>
                    <InfoValue>{selectedTransaction.verifiedBy}</InfoValue>
                  </InfoSection>
                  {selectedTransaction.verificationNotes && (
                    <InfoSection>
                      <InfoLabel>{language === 'bg' ? 'Бележки:' : 'Notes:'}</InfoLabel>
                      <InfoValue>{selectedTransaction.verificationNotes}</InfoValue>
                    </InfoSection>
                  )}
                </>
              )}
            </ModalBody>
          </ModalContent>
        </Modal>
      )}
    </Container>
  );
};

export default AdminManualPaymentsDashboard;

// ============================================================================
// STYLED COMPONENTS
// ============================================================================

const Container = styled.div`
  max-width: 1400px;
  margin: 0 auto;
  padding: 40px 20px;
  min-height: 100vh;
`;

const LoadingContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  gap: 16px;
  color: rgba(255, 255, 255, 0.7);
`;

const Header = styled.div`
  margin-bottom: 32px;
`;

const Title = styled.h1`
  margin: 0 0 8px 0;
  font-size: 32px;
  font-weight: 700;
  color: #fff;
`;

const Subtitle = styled.p`
  margin: 0;
  font-size: 16px;
  color: rgba(255, 255, 255, 0.7);
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
  margin-bottom: 32px;
`;

const StatCard = styled.div<{ color: string }>`
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.1), rgba(255, 255, 255, 0.05));
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 16px;
  padding: 24px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  border-left: 4px solid ${props => props.color};
`;

const StatIcon = styled.div`
  color: rgba(255, 255, 255, 0.8);
`;

const StatValue = styled.div`
  font-size: 32px;
  font-weight: 700;
  color: #fff;
`;

const StatLabel = styled.div`
  font-size: 14px;
  color: rgba(255, 255, 255, 0.7);
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const FiltersBar = styled.div`
  display: flex;
  gap: 16px;
  margin-bottom: 24px;
  flex-wrap: wrap;
`;

const SearchBox = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  flex: 1;
  min-width: 300px;
  padding: 12px 16px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;

  svg {
    color: rgba(255, 255, 255, 0.5);
  }

  input {
    flex: 1;
    background: transparent;
    border: none;
    color: #fff;
    font-size: 14px;
    outline: none;

    &::placeholder {
      color: rgba(255, 255, 255, 0.5);
    }
  }
`;

const FilterButtons = styled.div`
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
`;

const FilterButton = styled.button<{ active?: boolean }>`
  padding: 10px 20px;
  background: ${props => props.active 
    ? 'linear-gradient(135deg, #0075EB, #00A651)'
    : 'rgba(255, 255, 255, 0.05)'};
  border: 1px solid ${props => props.active 
    ? 'rgba(0, 117, 235, 0.5)'
    : 'rgba(255, 255, 255, 0.1)'};
  border-radius: 8px;
  color: #fff;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: ${props => props.active 
      ? 'linear-gradient(135deg, #0085FF, #00B65E)'
      : 'rgba(255, 255, 255, 0.08)'};
  }
`;

const TableContainer = styled.div`
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 16px;
  overflow-x: auto;
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;

  thead {
    background: rgba(255, 255, 255, 0.05);
    
    th {
      padding: 16px;
      text-align: left;
      font-size: 13px;
      font-weight: 600;
      color: rgba(255, 255, 255, 0.7);
      text-transform: uppercase;
      letter-spacing: 0.5px;
      border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    }
  }

  tbody {
    tr {
      border-bottom: 1px solid rgba(255, 255, 255, 0.05);
      transition: background 0.2s ease;

      &:hover {
        background: rgba(255, 255, 255, 0.03);
      }
    }

    td {
      padding: 16px;
      font-size: 14px;
      color: rgba(255, 255, 255, 0.9);
    }
  }
`;

const RefNumber = styled.div`
  font-family: 'Courier New', monospace;
  font-weight: 600;
  color: #0075EB;
  font-size: 13px;
`;

const CustomerInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;

  strong {
    color: #fff;
    font-size: 14px;
  }

  small {
    color: rgba(255, 255, 255, 0.6);
    font-size: 12px;
  }
`;

const Amount = styled.div`
  font-size: 16px;
  font-weight: 700;
  color: #00A651;
`;

const BankBadge = styled.span<{ bank: string }>`
  display: inline-block;
  padding: 4px 12px;
  background: ${props => props.bank === 'revolut' ? 'rgba(0, 117, 235, 0.2)' : 'rgba(0, 166, 81, 0.2)'};
  border: 1px solid ${props => props.bank === 'revolut' ? '#0075EB' : '#00A651'};
  border-radius: 12px;
  font-size: 12px;
  font-weight: 600;
  color: ${props => props.bank === 'revolut' ? '#0075EB' : '#00A651'};
`;

const DateText = styled.div`
  font-size: 13px;
  color: rgba(255, 255, 255, 0.7);
`;

const StatusBadge = styled.span<{ color: string }>`
  display: inline-block;
  padding: 6px 12px;
  background: ${props => props.color}22;
  border: 1px solid ${props => props.color};
  border-radius: 12px;
  font-size: 12px;
  font-weight: 600;
  color: ${props => props.color};
  white-space: nowrap;
`;

const ReceiptButton = styled.button`
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  background: rgba(0, 117, 235, 0.2);
  border: 1px solid #0075EB;
  border-radius: 6px;
  color: #0075EB;
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: rgba(0, 117, 235, 0.3);
  }
`;

const NoReceipt = styled.span`
  color: rgba(255, 255, 255, 0.3);
`;

const ActionButtons = styled.div`
  display: flex;
  gap: 8px;
`;

const ActionButton = styled.button<{ primary?: boolean }>`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  background: ${props => props.primary 
    ? 'linear-gradient(135deg, #0075EB, #00A651)'
    : 'rgba(255, 255, 255, 0.1)'};
  border: 1px solid ${props => props.primary 
    ? 'rgba(0, 117, 235, 0.5)'
    : 'rgba(255, 255, 255, 0.2)'};
  border-radius: 6px;
  color: #fff;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    transform: scale(1.1);
  }
`;

// Modal Styles
const Modal = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.8);
  backdrop-filter: blur(5px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
`;

const ModalContent = styled.div`
  background: linear-gradient(135deg, rgba(30, 30, 30, 0.95), rgba(20, 20, 20, 0.95));
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 24px;
  max-width: 700px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
`;

const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
`;

const ModalTitle = styled.h3`
  margin: 0;
  font-size: 24px;
  font-weight: 700;
  color: #fff;
`;

const CloseButton = styled.button`
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 50%;
  color: #fff;
  font-size: 24px;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: rgba(255, 255, 255, 0.2);
  }
`;

const ModalBody = styled.div`
  padding: 24px;
`;

const InfoSection = styled.div`
  margin-bottom: 20px;
`;

const InfoLabel = styled.div`
  font-size: 13px;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.7);
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 8px;
`;

const InfoValue = styled.div`
  font-size: 16px;
  color: #fff;
  line-height: 1.5;
`;

const ReceiptPreview = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;

  img {
    width: 100%;
    max-height: 400px;
    object-fit: contain;
    border-radius: 12px;
    background: rgba(0, 0, 0, 0.3);
  }
`;

const Divider = styled.div`
  height: 1px;
  background: rgba(255, 255, 255, 0.1);
  margin: 24px 0;
`;

const VerificationSection = styled.div`
  padding: 20px;
  background: rgba(255, 255, 255, 0.03);
  border-radius: 12px;
`;

const VerificationLabel = styled.div`
  font-size: 14px;
  font-weight: 600;
  color: #fff;
  margin-bottom: 12px;
`;

const VerificationTextarea = styled.textarea`
  width: 100%;
  padding: 12px;
  background: rgba(0, 0, 0, 0.3);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 8px;
  color: #fff;
  font-size: 14px;
  font-family: inherit;
  resize: vertical;
  margin-bottom: 16px;

  &:focus {
    outline: none;
    border-color: rgba(0, 117, 235, 0.5);
  }

  &::placeholder {
    color: rgba(255, 255, 255, 0.5);
  }
`;

const VerificationButtons = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
`;

const VerifyButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 14px;
  background: linear-gradient(135deg, #00A651, #00B65E);
  border: none;
  border-radius: 8px;
  color: #fff;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 166, 81, 0.4);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const RejectButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 14px;
  background: linear-gradient(135deg, #F44336, #E53935);
  border: none;
  border-radius: 8px;
  color: #fff;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(244, 67, 54, 0.4);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;
