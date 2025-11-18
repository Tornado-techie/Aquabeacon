// File: client/src/pages/Payments.jsx

import React, { useEffect } from 'react';
import { FiDollarSign, FiDownload, FiCreditCard, FiCheckCircle, FiClock } from 'react-icons/fi';

const Payments = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);
  const payments = [
    {
      id: 1,
      amount: 5000,
      description: 'License Renewal Fee',
      date: '2024-10-16',
      status: 'completed',
      receipt: 'QHX12345678',
      method: 'M-Pesa',
      transactionId: 'TXN001234567890'
    },
    {
      id: 2,
      amount: 2500,
      description: 'Inspection Fee',
      date: '2024-10-14',
      status: 'completed',
      receipt: 'QHX12345679',
      method: 'M-Pesa',
      transactionId: 'TXN001234567891'
    },
    {
      id: 3,
      amount: 7500,
      description: 'Certification Fee',
      date: '2024-10-18',
      status: 'pending',
      receipt: null,
      method: 'M-Pesa',
      transactionId: 'TXN001234567892'
    }
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const totalPaid = payments
    .filter(p => p.status === 'completed')
    .reduce((sum, p) => sum + p.amount, 0);

  const pendingAmount = payments
    .filter(p => p.status === 'pending')
    .reduce((sum, p) => sum + p.amount, 0);

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Payment History</h1>
            <p className="text-gray-600 mt-1">Track your payments and transactions</p>
          </div>
          <button className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
            <FiCreditCard className="w-4 h-4 mr-2" />
            Make Payment
          </button>
        </div>

        {/* Payment Summary */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow-sm p-4">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <FiCheckCircle className="w-5 h-5 text-green-600" />
              </div>
              <div className="ml-3">
                <p className="text-2xl font-bold text-gray-900">
                  KES {totalPaid.toLocaleString()}
                </p>
                <p className="text-gray-600 text-sm">Total Paid</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-4">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <FiClock className="w-5 h-5 text-yellow-600" />
              </div>
              <div className="ml-3">
                <p className="text-2xl font-bold text-gray-900">
                  KES {pendingAmount.toLocaleString()}
                </p>
                <p className="text-gray-600 text-sm">Pending</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-4">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <FiDollarSign className="w-5 h-5 text-blue-600" />
              </div>
              <div className="ml-3">
                <p className="text-2xl font-bold text-gray-900">{payments.length}</p>
                <p className="text-gray-600 text-sm">Total Transactions</p>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          {payments.map((payment) => (
            <div key={payment.id} className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="text-lg font-semibold text-gray-900">
                      {payment.description}
                    </h3>
                    <span className={`px-2 py-1 text-xs rounded-full font-medium ${getStatusColor(payment.status)}`}>
                      {payment.status}
                    </span>
                  </div>
                  
                  <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 mb-3">
                    <span>📅 {payment.date}</span>
                    <span>💳 {payment.method}</span>
                    <span>🆔 {payment.transactionId}</span>
                    {payment.receipt && (
                      <span>📄 Receipt: {payment.receipt}</span>
                    )}
                  </div>
                  
                  <div className="text-2xl font-bold text-gray-900">
                    KES {payment.amount.toLocaleString()}
                  </div>
                </div>
                
                <div className="mt-4 lg:mt-0 lg:ml-6">
                  {payment.status === 'completed' ? (
                    <button className="w-full lg:w-auto flex items-center justify-center px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors">
                      <FiDownload className="w-4 h-4 mr-2" />
                      Download Receipt
                    </button>
                  ) : (
                    <button className="w-full lg:w-auto flex items-center justify-center px-4 py-2 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition-colors">
                      <FiCreditCard className="w-4 h-4 mr-2" />
                      Complete Payment
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Payments;