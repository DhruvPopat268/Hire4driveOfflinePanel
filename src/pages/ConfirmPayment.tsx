import { useState } from 'react';
import { CreditCard, Banknote, Smartphone, CheckCircle } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Navbar } from '../components/Sidebar';
import { persistor } from "../store/store";

export default function PaymentComponent() {
  const [selectedPaymentType, setSelectedPaymentType] = useState('');
  const [selectedOnlineMethod, setSelectedOnlineMethod] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const navigate = useNavigate();

  const handlePaymentTypeSelect = (type) => {
    setSelectedPaymentType(type);
    if (type === 'cash') {
      setSelectedOnlineMethod('');
    }
  };

  const handleOnlineMethodSelect = (method) => {
    setSelectedOnlineMethod(method);
  };

  const location = useLocation();
  const paymentData = location.state;
  console.log('Payment Data:', paymentData);

  const handlePayment = async () => {
    setIsProcessing(true);

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/rides/book`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: 'include',
        body: JSON.stringify({
          ...paymentData,
          paymentType: selectedPaymentType,
        }),
      });

      // Check if unauthorized
      if (response.status === 401) {
        alert("Your session has expired. Please login again.");
        navigate("/login");
        return;
      }

      const data = await response.json();

      if (response.status === 201) {
        // Clear persisted Redux state on successful booking
        if (typeof persistor !== "undefined" && persistor.purge) {
          persistor.purge();
        }

        alert("Ride booked successfully!");
        console.log("Ride:", data.ride);
        navigate("/currentBookings"); // 👈 redirect here
      } else {
        alert(data.message || "Failed to book ride");
      }
    } catch (error) {
      console.error(error);
      alert("Something went wrong!");
    } finally {
      setIsProcessing(false);
    }
  };


  const canProceed = selectedPaymentType === 'cash' ||
    (selectedPaymentType === 'online' && selectedOnlineMethod);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <Navbar title="Choose Payment Method" />
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          {/* <h1 className="text-3xl font-bold text-gray-800 mb-2">Choose Payment Method</h1> */}
          <p className="text-gray-600">Select your preferred payment option to continue</p>
        </div>

        {/* Payment Options Card */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-6">
          {/* Payment Type Selection */}
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Payment Type</h2>

            <div className="grid grid-cols-2 gap-3">
              {/* Cash Option */}
              <div
                className={`relative p-3 rounded-lg border-2 cursor-pointer transition-all duration-300 ${selectedPaymentType === 'cash'
                  ? 'border-green-500 bg-green-50'
                  : 'border-gray-200 hover:border-gray-300'
                  }`}
                onClick={() => handlePaymentTypeSelect('cash')}
              >
                <div className="flex flex-col items-center text-center space-y-2">
                  <div className={`p-2 rounded-full ${selectedPaymentType === 'cash' ? 'bg-green-500' : 'bg-gray-100'
                    }`}>
                    <Banknote className={`w-5 h-5 ${selectedPaymentType === 'cash' ? 'text-white' : 'text-gray-600'
                      }`} />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-gray-800">Cash</h3>
                    <p className="text-xs text-gray-600">Pay on delivery</p>
                  </div>
                </div>
                {selectedPaymentType === 'cash' && (
                  <CheckCircle className="absolute top-2 right-2 w-4 h-4 text-green-500" />
                )}
              </div>

              {/* Online Option */}
              <div
                className={`relative p-3 rounded-lg border-2 cursor-pointer transition-all duration-300 ${selectedPaymentType === 'online'
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300'
                  }`}
                onClick={() => handlePaymentTypeSelect('online')}
              >
                <div className="flex flex-col items-center text-center space-y-2">
                  <div className={`p-2 rounded-full ${selectedPaymentType === 'online' ? 'bg-blue-500' : 'bg-gray-100'
                    }`}>
                    <CreditCard className={`w-5 h-5 ${selectedPaymentType === 'online' ? 'text-white' : 'text-gray-600'
                      }`} />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-gray-800">Online</h3>
                    <p className="text-xs text-gray-600">Pay securely</p>
                  </div>
                </div>
                {selectedPaymentType === 'online' && (
                  <CheckCircle className="absolute top-2 right-2 w-4 h-4 text-blue-500" />
                )}
              </div>
            </div>
          </div>

          {/* Online Payment Methods */}
          {selectedPaymentType === 'online' && (
            <div className="animate-in fade-in duration-300">
              <h3 className="text-base font-semibold text-gray-800 mb-3">Online Payment</h3>

              <div className="space-y-2">
                {/* Razorpay Option */}
                <div
                  className={`p-3 rounded-lg border-2 cursor-pointer transition-all duration-200 ${selectedOnlineMethod === 'razorpay'
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                    }`}
                  onClick={() => handleOnlineMethodSelect('razorpay')}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className={`p-2 rounded-lg ${selectedOnlineMethod === 'razorpay' ? 'bg-blue-500' : 'bg-gray-100'
                        }`}>
                        <Smartphone className={`w-4 h-4 ${selectedOnlineMethod === 'razorpay' ? 'text-white' : 'text-gray-600'
                          }`} />
                      </div>
                      <div>
                        <h4 className="text-sm font-medium text-gray-800">Razorpay</h4>
                        <p className="text-xs text-gray-600">Cards, UPI, Banking</p>
                      </div>
                    </div>
                    {selectedOnlineMethod === 'razorpay' && (
                      <CheckCircle className="w-4 h-4 text-blue-500" />
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Order Summary */}
          {selectedPaymentType && (
            <div className="mt-8 p-6 bg-gray-50 rounded-lg">
              <h3 className="font-semibold text-gray-800 mb-3">Amount to pay</h3>
              <div className="space-y-2 text-sm">

                <div className="border-t pt-2 mt-3">
                  <div className="flex justify-between font-semibold">
                    <span className="text-gray-800">Total:</span>
                    <span className="text-gray-800">₹{paymentData?.totalPayable || 0}</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Action Button */}
        {selectedPaymentType && (
          <div className="text-center">
            <button
              onClick={handlePayment}
              disabled={!canProceed || isProcessing}
              className={`w-full px-6 py-3 rounded-lg font-semibold transition-all duration-300 ${canProceed && !isProcessing
                ? 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
            >
              {isProcessing ? (
                <div className="flex items-center justify-center space-x-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span className="text-sm">Processing...</span>
                </div>
              ) : selectedPaymentType === 'cash' ? (
                'Confirm Cash Payment'
              ) : (
                'Proceed to Payment'
              )}
            </button>
          </div>
        )}

        {/* Security Badge */}
        <div className="text-center mt-4">
          <div className="inline-flex items-center space-x-2 text-xs text-gray-600">
            <CheckCircle className="w-3 h-3 text-green-500" />
            <span>Secure & encrypted</span>
          </div>
        </div>
      </div>
    </div>
  );
}