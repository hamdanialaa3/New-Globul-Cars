import { logger } from '../../../../services/logger-service';
// src/pages/AdminPage/VerificationReview.tsx
// Admin panel for reviewing verification requests

import React, { useState, useEffect } from 'react';
import { 
  collection, 
  query, 
  where, 
  orderBy, 
  onSnapshot, 
  Timestamp,
  getDocs,
  limit as firestoreLimit 
} from 'firebase/firestore';
import { db } from '../../../../firebase/firebase-config';  /* ⚡ FIXED */
import { httpsCallable } from 'firebase/functions';
import { functions } from '../../../../firebase/firebase-config';  /* ⚡ FIXED */
import { useLanguage } from '../../../../contexts/LanguageContext';

interface VerificationDocument {
  type: 'eik' | 'license' | 'vat' | 'insurance' | 'id';
  url: string;
  uploadedAt: Timestamp;
  verified: boolean;
}

interface VerificationRequest {
  id: string;
  userId: string;
  targetProfileType: 'dealer' | 'company';
  status: 'pending' | 'approved' | 'rejected';
  submittedAt: Timestamp;
  userEmail: string;
  displayName: string;
  businessInfo: {
    legalName: string;
    eik: string;
    vat?: string;
    address: string;
    city: string;
    phone: string;
    email: string;
  };
  documents: VerificationDocument[];
}

const VerificationReview: React.FC = () => {
  const { t } = useLanguage();
  const [requests, setRequests] = useState<VerificationRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'pending' | 'approved' | 'rejected' | 'all'>('pending');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRequest, setSelectedRequest] = useState<VerificationRequest | null>(null);
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [processing, setProcessing] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;

  // Statistics
  const [stats, setStats] = useState({
    pending: 0,
    approved: 0,
    rejected: 0,
    total: 0,
  });

  // Load verification requests
  useEffect(() => {
    let q;
    
    if (filter === 'all') {
      q = query(
        collection(db, 'verificationRequests'),
        orderBy('submittedAt', 'desc')
      );
    } else {
      q = query(
        collection(db, 'verificationRequests'),
        where('status', '==', filter),
        orderBy('submittedAt', 'desc')
      );
    }

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const loadedRequests: VerificationRequest[] = [];
      
      snapshot.forEach((doc) => {
        loadedRequests.push({
          id: doc.id,
          ...doc.data(),
        } as VerificationRequest);
      });

      setRequests(loadedRequests);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [filter]);

  // Load statistics
  useEffect(() => {
    const loadStats = async () => {
      const statuses = ['pending', 'approved', 'rejected'];
      const counts: any = {};
      
      for (const status of statuses) {
        const q = query(
          collection(db, 'verificationRequests'),
          where('status', '==', status)
        );
        const snapshot = await getDocs(q);
        counts[status] = snapshot.size;
      }

      setStats({
        pending: counts.pending || 0,
        approved: counts.approved || 0,
        rejected: counts.rejected || 0,
        total: (counts.pending || 0) + (counts.approved || 0) + (counts.rejected || 0),
      });
    };

    loadStats();
  }, [requests]);

  // Filter requests by search term
  const filteredRequests = requests.filter((req) => {
    if (!searchTerm) return true;
    
    const search = searchTerm.toLowerCase();
    return (
      req.userEmail.toLowerCase().includes(search) ||
      req.displayName.toLowerCase().includes(search) ||
      req.businessInfo.legalName.toLowerCase().includes(search) ||
      req.businessInfo.eik.includes(search)
    );
  });

  // Pagination
  const totalPages = Math.ceil(filteredRequests.length / itemsPerPage);
  const paginatedRequests = filteredRequests.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Approve verification
  const handleApprove = async () => {
    if (!selectedRequest) return;

    setProcessing(true);
    try {
      const approveVerification = httpsCallable(functions, 'approveVerification');
      
      await approveVerification({
        userId: selectedRequest.userId,
        requestId: selectedRequest.id,
      });

      setShowApproveModal(false);
      setSelectedRequest(null);
      alert(t('admin.verificationApproved'));
    } catch (error: any) {
      logger.error('Approval error:', error);
      alert(t('admin.approvalError') + ': ' + error.message);
    } finally {
      setProcessing(false);
    }
  };

  // Reject verification
  const handleReject = async () => {
    if (!selectedRequest || !rejectionReason.trim()) {
      alert(t('admin.rejectionReasonRequired'));
      return;
    }

    setProcessing(true);
    try {
      const rejectVerification = httpsCallable(functions, 'rejectVerification');
      
      await rejectVerification({
        userId: selectedRequest.userId,
        requestId: selectedRequest.id,
        reason: rejectionReason,
      });

      setShowRejectModal(false);
      setSelectedRequest(null);
      setRejectionReason('');
      alert(t('admin.verificationRejected'));
    } catch (error: any) {
      logger.error('Rejection error:', error);
      alert(t('admin.rejectionError') + ': ' + error.message);
    } finally {
      setProcessing(false);
    }
  };

  // Document type labels
  const getDocumentTypeLabel = (type: string): string => {
    const labels: Record<string, string> = {
      eik: t('admin.docEIK'),
      license: t('admin.docLicense'),
      vat: t('admin.docVAT'),
      insurance: t('admin.docInsurance'),
      id: t('admin.docID'),
    };
    return labels[type] || type;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">{t('admin.totalRequests')}</p>
              <p className="text-3xl font-bold text-gray-900">{stats.total}</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-full">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">{t('admin.pending')}</p>
              <p className="text-3xl font-bold text-yellow-600">{stats.pending}</p>
            </div>
            <div className="p-3 bg-yellow-100 rounded-full">
              <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">{t('admin.approved')}</p>
              <p className="text-3xl font-bold text-green-600">{stats.approved}</p>
            </div>
            <div className="p-3 bg-green-100 rounded-full">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">{t('admin.rejected')}</p>
              <p className="text-3xl font-bold text-red-600">{stats.rejected}</p>
            </div>
            <div className="p-3 bg-red-100 rounded-full">
              <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
          {/* Status Filter */}
          <div className="flex space-x-2">
            <button
              onClick={() => setFilter('pending')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                filter === 'pending'
                  ? 'bg-yellow-100 text-yellow-800'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {t('admin.pending')}
            </button>
            <button
              onClick={() => setFilter('approved')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                filter === 'approved'
                  ? 'bg-green-100 text-green-800'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {t('admin.approved')}
            </button>
            <button
              onClick={() => setFilter('rejected')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                filter === 'rejected'
                  ? 'bg-red-100 text-red-800'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {t('admin.rejected')}
            </button>
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                filter === 'all'
                  ? 'bg-blue-100 text-blue-800'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {t('admin.all')}
            </button>
          </div>

          {/* Search */}
          <div className="relative">
            <input
              type="text"
              placeholder={t('admin.searchPlaceholder')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <svg 
              className="absolute left-3 top-2.5 w-5 h-5 text-gray-400" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>
      </div>

      {/* Requests Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                {t('admin.user')}
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                {t('admin.business')}
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                {t('admin.type')}
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                {t('admin.status')}
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                {t('admin.submitted')}
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                {t('admin.actions')}
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {paginatedRequests.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                  {t('admin.noRequests')}
                </td>
              </tr>
            ) : (
              paginatedRequests.map((request) => (
                <tr key={request.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {request.displayName}
                        </div>
                        <div className="text-sm text-gray-500">
                          {request.userEmail}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900">
                      {request.businessInfo.legalName}
                    </div>
                    <div className="text-sm text-gray-500">
                      EIK: {request.businessInfo.eik}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      request.targetProfileType === 'dealer' 
                        ? 'bg-orange-100 text-orange-800' 
                        : 'bg-blue-100 text-blue-800'
                    }`}>
                      {request.targetProfileType === 'dealer' ? t('admin.dealer') : t('admin.company')}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      request.status === 'pending' 
                        ? 'bg-yellow-100 text-yellow-800'
                        : request.status === 'approved'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {t(`admin.status${request.status.charAt(0).toUpperCase() + request.status.slice(1)}`)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {request.submittedAt.toDate().toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={() => setSelectedRequest(request)}
                      className="text-blue-600 hover:text-blue-900 mr-4"
                    >
                      {t('admin.view')}
                    </button>
                    {request.status === 'pending' && (
                      <>
                        <button
                          onClick={() => {
                            setSelectedRequest(request);
                            setShowApproveModal(true);
                          }}
                          className="text-green-600 hover:text-green-900 mr-4"
                        >
                          {t('admin.approve')}
                        </button>
                        <button
                          onClick={() => {
                            setSelectedRequest(request);
                            setShowRejectModal(true);
                          }}
                          className="text-red-600 hover:text-red-900"
                        >
                          {t('admin.reject')}
                        </button>
                      </>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
            <div className="flex-1 flex justify-between sm:hidden">
              <button
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
              >
                {t('admin.previous')}
              </button>
              <button
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
              >
                {t('admin.next')}
              </button>
            </div>
            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-gray-700">
                  {t('admin.showing')} <span className="font-medium">{(currentPage - 1) * itemsPerPage + 1}</span> {t('admin.to')}{' '}
                  <span className="font-medium">{Math.min(currentPage * itemsPerPage, filteredRequests.length)}</span> {t('admin.of')}{' '}
                  <span className="font-medium">{filteredRequests.length}</span> {t('admin.results')}
                </p>
              </div>
              <div>
                <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                  <button
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                  >
                    <span className="sr-only">{t('admin.previous')}</span>
                    <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </button>
                  
                  {[...Array(totalPages)].map((_, i) => (
                    <button
                      key={i + 1}
                      onClick={() => setCurrentPage(i + 1)}
                      className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                        currentPage === i + 1
                          ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                          : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                      }`}
                    >
                      {i + 1}
                    </button>
                  ))}
                  
                  <button
                    onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                    disabled={currentPage === totalPages}
                    className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                  >
                    <span className="sr-only">{t('admin.next')}</span>
                    <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                    </svg>
                  </button>
                </nav>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Document Viewer Modal */}
      {selectedRequest && !showApproveModal && !showRejectModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-start mb-6">
                <h2 className="text-2xl font-bold text-gray-900">
                  {t('admin.verificationDetails')}
                </h2>
                <button
                  onClick={() => setSelectedRequest(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="space-y-6">
                {/* User Info */}
                <div>
                  <h3 className="text-lg font-semibold mb-3">{t('admin.userInformation')}</h3>
                  <div className="bg-gray-50 rounded-lg p-4 grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-600">{t('admin.name')}</p>
                      <p className="font-medium">{selectedRequest.displayName}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">{t('admin.email')}</p>
                      <p className="font-medium">{selectedRequest.userEmail}</p>
                    </div>
                  </div>
                </div>

                {/* Business Info */}
                <div>
                  <h3 className="text-lg font-semibold mb-3">{t('admin.businessInformation')}</h3>
                  <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-gray-600">{t('admin.legalName')}</p>
                        <p className="font-medium">{selectedRequest.businessInfo.legalName}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">{t('admin.eik')}</p>
                        <p className="font-medium">{selectedRequest.businessInfo.eik}</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-gray-600">{t('admin.city')}</p>
                        <p className="font-medium">{selectedRequest.businessInfo.city}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">{t('admin.phone')}</p>
                        <p className="font-medium">{selectedRequest.businessInfo.phone}</p>
                      </div>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">{t('admin.address')}</p>
                      <p className="font-medium">{selectedRequest.businessInfo.address}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">{t('admin.businessEmail')}</p>
                      <p className="font-medium">{selectedRequest.businessInfo.email}</p>
                    </div>
                  </div>
                </div>

                {/* Documents */}
                <div>
                  <h3 className="text-lg font-semibold mb-3">{t('admin.documents')}</h3>
                  <div className="grid grid-cols-2 gap-4">
                    {selectedRequest.documents.map((doc, index) => (
                      <div key={index} className="border border-gray-200 rounded-lg p-4">
                        <p className="text-sm font-medium text-gray-700 mb-2">
                          {getDocumentTypeLabel(doc.type)}
                        </p>
                        <a
                          href={doc.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-800 text-sm flex items-center"
                        >
                          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                          {t('admin.viewDocument')}
                        </a>
                        {doc.url.match(/\.(jpg|jpeg|png|gif)$/i) && (
                          <img 
                            src={doc.url} 
                            alt={doc.type}
                            className="mt-2 w-full h-32 object-cover rounded"
                          />
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Actions */}
              {selectedRequest.status === 'pending' && (
                <div className="mt-6 flex justify-end space-x-3">
                  <button
                    onClick={() => {
                      setShowRejectModal(true);
                    }}
                    className="px-4 py-2 border border-red-300 text-red-700 rounded-md hover:bg-red-50 transition-colors"
                  >
                    {t('admin.reject')}
                  </button>
                  <button
                    onClick={() => {
                      setShowApproveModal(true);
                    }}
                    className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
                  >
                    {t('admin.approve')}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Approve Modal */}
      {showApproveModal && selectedRequest && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h3 className="text-lg font-semibold mb-4">{t('admin.confirmApproval')}</h3>
            <p className="text-gray-600 mb-6">
              {t('admin.approveConfirmMessage').replace('{name}', selectedRequest.businessInfo.legalName)}
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => {
                  setShowApproveModal(false);
                  setSelectedRequest(null);
                }}
                disabled={processing}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
              >
                {t('admin.cancel')}
              </button>
              <button
                onClick={handleApprove}
                disabled={processing}
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors disabled:opacity-50"
              >
                {processing ? t('admin.processing') : t('admin.approve')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reject Modal */}
      {showRejectModal && selectedRequest && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h3 className="text-lg font-semibold mb-4">{t('admin.rejectVerification')}</h3>
            <p className="text-gray-600 mb-4">
              {t('admin.rejectMessage').replace('{name}', selectedRequest.businessInfo.legalName)}
            </p>
            <textarea
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder={t('admin.rejectionReasonPlaceholder')}
              rows={4}
              className="w-full border border-gray-300 rounded-md p-3 focus:ring-2 focus:ring-red-500 focus:border-transparent mb-4"
            />
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => {
                  setShowRejectModal(false);
                  setSelectedRequest(null);
                  setRejectionReason('');
                }}
                disabled={processing}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
              >
                {t('admin.cancel')}
              </button>
              <button
                onClick={handleReject}
                disabled={processing || !rejectionReason.trim()}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors disabled:opacity-50"
              >
                {processing ? t('admin.processing') : t('admin.reject')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VerificationReview;
