import React, { useState, useEffect } from "react";
import { FiX, FiCreditCard, FiPhone, FiCheck, FiClock, FiAlertCircle } from "react-icons/fi";
import { toast } from "react-hot-toast";

const PAYMENT_STATUS = {
  IDLE: 'idle',
  PROCESSING: 'processing', 
  SUCCESS: 'success',
  FAILED: 'failed',
  EXPIRED: 'expired'
};

const PaymentModal = ({ 
  isOpen, 
  onClose, 
  selectedPlan, 
  user 
}) => {
  const [formData, setFormData] = useState({
    phoneNumber: '',
    amount: selectedPlan?.price || 0,
    paymentType: selectedPlan?.type || 'subscription',
    description: selectedPlan?.name ? `${selectedPlan.name} subscription` : 'Payment'
  });
  
  const [paymentState, setPaymentState] = useState({
    status: PAYMENT_STATUS.IDLE,
    paymentId: null,
    checkoutRequestID: null,
    message: '',
    isLoading: false
  });

  // Reset state when modal opens/closes
  useEffect(() => {
    if (!isOpen) {
      setPaymentState({
        status: PAYMENT_STATUS.IDLE,
        paymentId: null,
        checkoutRequestID: null,
        message: '',
        isLoading: false
      });
    }
  }, [isOpen]);

  // Auto-populate phone number from user profile
  useEffect(() => {
    if (user?.profile?.phoneNumber) {
      setFormData(prev => ({
        ...prev,
        phoneNumber: formatPhoneNumberDisplay(user.profile.phoneNumber)
      }));
    }
  }, [user]);

  const formatPhoneNumberDisplay = (phone) => {
    // Format for display: 254XXXXXXXXX -> 0XXXXXXXXX
    if (phone.startsWith('254')) {
      return `0${phone.substring(3)}`;
    }
    return phone;
  };

  const formatPhoneNumberForAPI = (phone) => {
    // Format for API: 0XXXXXXXXX -> 254XXXXXXXXX
    const digits = phone.replace(/\D/g, '');
    if (digits.startsWith('254')) return digits;
    if (digits.startsWith('0')) return `254${digits.substring(1)}`;
    if (digits.startsWith('7') || digits.startsWith('1')) return `254${digits}`;
    return digits;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const initiatePayment = async (e) => {
    e.preventDefault();
    
    if (!formData.phoneNumber) {
      toast.error('Please enter your M-Pesa phone number');
      return;
    }

    setPaymentState(prev => ({ ...prev, isLoading: true, message: 'Initiating payment...' }));

    try {
      const token = localStorage.getItem('token');
      
      const response = await fetch('/api/payments/initiate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          phoneNumber: formatPhoneNumberForAPI(formData.phoneNumber),
          amount: formData.amount,
          paymentType: formData.paymentType,
          description: formData.description,
          accountReference: `${formData.paymentType}-${Date.now()}`
        })
      });

      const data = await response.json();

      if (data.success) {
        setPaymentState({
          status: PAYMENT_STATUS.PROCESSING,
          paymentId: data.data.paymentId,
          checkoutRequestID: data.data.checkoutRequestID,
          message: 'Payment request sent! Please check your phone for M-Pesa prompt.',
          isLoading: false
        });

        toast.success('Payment request sent to your phone!');
        
        // Start checking payment status
        startStatusCheck(data.data.paymentId);
      } else {
        throw new Error(data.message || 'Failed to initiate payment');
      }
    } catch (error) {
      console.error('Payment initiation error:', error);
      setPaymentState({
        status: PAYMENT_STATUS.FAILED,
        paymentId: null,
        checkoutRequestID: null,
        message: error.message || 'Failed to initiate payment. Please try again.',
        isLoading: false
      });
      toast.error(error.message || 'Payment failed to initiate');
    }
  };

  const startStatusCheck = (paymentId) => {
    const checkStatus = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`/api/payments/${paymentId}/status`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        const data = await response.json();
        
        if (data.success) {
          const { status } = data.data;
          
          if (status === 'completed') {
            setPaymentState(prev => ({
              ...prev,
              status: PAYMENT_STATUS.SUCCESS,
              message: 'Payment completed successfully!',
              isLoading: false
            }));
            toast.success('Payment completed successfully!');
            
            // Refresh user data or redirect
            setTimeout(() => {
              onClose();
              window.location.reload(); // Or use your app's state management
            }, 3000);
            
          } else if (status === 'failed' || status === 'cancelled') {
            setPaymentState(prev => ({
              ...prev,
              status: PAYMENT_STATUS.FAILED,
              message: 'Payment was unsuccessful. Please try again.',
              isLoading: false
            }));
            toast.error('Payment failed');
            
          } else if (status === 'expired') {
            setPaymentState(prev => ({
              ...prev,
              status: PAYMENT_STATUS.EXPIRED,
              message: 'Payment request expired. Please try again.',
              isLoading: false
            }));
            toast.error('Payment expired');
            
          } else {
            // Still processing, check again
            setTimeout(checkStatus, 3000);
          }
        }
      } catch (error) {
        console.error('Status check error:', error);
        setTimeout(checkStatus, 5000); // Retry after 5 seconds on error
      }
    };

    // Start checking after 3 seconds
    setTimeout(checkStatus, 3000);
  };

  const getStatusIcon = () => {
    switch (paymentState.status) {
      case PAYMENT_STATUS.PROCESSING:
        return <FiClock className="w-6 h-6 text-yellow-500 animate-spin" />;
      case PAYMENT_STATUS.SUCCESS:
        return <FiCheck className="w-6 h-6 text-green-500" />;
      case PAYMENT_STATUS.FAILED:
      case PAYMENT_STATUS.EXPIRED:
        return <FiAlertCircle className="w-6 h-6 text-red-500" />;
      default:
        return <FiCreditCard className="w-6 h-6 text-blue-500" />;
    }
  };

  const getStatusColor = () => {
    switch (paymentState.status) {
      case PAYMENT_STATUS.PROCESSING:
        return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case PAYMENT_STATUS.SUCCESS:
        return 'text-green-600 bg-green-50 border-green-200';
      case PAYMENT_STATUS.FAILED:
      case PAYMENT_STATUS.EXPIRED:
        return 'text-red-600 bg-red-50 border-red-200';
      default:
        return 'text-blue-600 bg-blue-50 border-blue-200';
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-md w-full p-6 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-semibold text-gray-900">
            Complete Payment
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <FiX className="w-6 h-6" />
          </button>
        </div>

        {/* Plan Summary */}
        {selectedPlan && (
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <h4 className="font-medium text-gray-900 mb-2">{selectedPlan.name}</h4>
            <p className="text-sm text-gray-600 mb-3">{selectedPlan.description}</p>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Amount:</span>
              <span className="text-xl font-bold text-green-600">
                KSH {selectedPlan.price.toLocaleString()}
              </span>
            </div>
          </div>
        )}

        {/* Status Display */}
        {paymentState.status !== PAYMENT_STATUS.IDLE && (
          <div className={`border rounded-lg p-4 mb-6 ${getStatusColor()}`}>
            <div className="flex items-center mb-2">
              {getStatusIcon()}
              <span className="ml-2 font-medium">
                {paymentState.status === PAYMENT_STATUS.PROCESSING && 'Processing Payment'}
                {paymentState.status === PAYMENT_STATUS.SUCCESS && 'Payment Successful'}
                {paymentState.status === PAYMENT_STATUS.FAILED && 'Payment Failed'}
                {paymentState.status === PAYMENT_STATUS.EXPIRED && 'Payment Expired'}
              </span>
            </div>
            <p className="text-sm">{paymentState.message}</p>
          </div>
        )}

        {/* Payment Form */}
        {paymentState.status === PAYMENT_STATUS.IDLE && (
          <form onSubmit={initiatePayment}>
            <div className="mb-4">
              <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700 mb-2">
                M-Pesa Phone Number
              </label>
              <div className="relative">
                <FiPhone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="tel"
                  id="phoneNumber"
                  name="phoneNumber"
                  value={formData.phoneNumber}
                  onChange={handleInputChange}
                  placeholder="0712345678"
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Enter the phone number that will receive the M-Pesa prompt
              </p>
            </div>

            <div className="mb-6">
              <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-2">
                Amount (KSH)
              </label>
              <input
                type="number"
                id="amount"
                name="amount"
                value={formData.amount}
                onChange={handleInputChange}
                min="1"
                max="70000"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50"
                readOnly
              />
            </div>

            <button
              type="submit"
              disabled={paymentState.isLoading}
              className="w-full bg-green-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-green-700 focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {paymentState.isLoading ? (
                <div className="flex items-center justify-center">
                  <FiClock className="animate-spin w-4 h-4 mr-2" />
                  Initiating Payment...
                </div>
              ) : (
                `Pay KSH ${formData.amount.toLocaleString()}`
              )}
            </button>
          </form>
        )}

        {/* Retry Button */}
        {(paymentState.status === PAYMENT_STATUS.FAILED || paymentState.status === PAYMENT_STATUS.EXPIRED) && (
          <button
            onClick={() => setPaymentState(prev => ({ ...prev, status: PAYMENT_STATUS.IDLE }))}
            className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
          >
            Try Again
          </button>
        )}

        {/* Help Text */}
        <div className="mt-6 p-4 bg-blue-50 rounded-lg">
          <h5 className="font-medium text-blue-900 mb-2">How to Pay:</h5>
          <ol className="text-sm text-blue-700 space-y-1">
            <li>1. Enter your M-Pesa phone number</li>
            <li>2. Click "Pay Now" to initiate payment</li>
            <li>3. Check your phone for M-Pesa prompt</li>
            <li>4. Enter your M-Pesa PIN to complete</li>
          </ol>
        </div>
      </div>
    </div>
  );
};

export default PaymentModal;
