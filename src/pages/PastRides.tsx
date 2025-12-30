import React, { useEffect, useState } from "react";
import apiClient from '@/lib/axiosInterceptor';
import { Clock, Eye, MapPin, CreditCard } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Navbar } from '../components/Sidebar';

interface Booking {
  _id: string;
  riderId?: string;
  status: string;
  totalPayable: number;
  paymentType?: string;
  createdAt?: string;
  updatedAt?: string;
  rideInfo?: any;
  driverInfo?: {
    driverName: string;
    driverMobile: string;
  };
}

const PastRides: React.FC = () => {
  const [pastBookings, setPastBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      setLoading(true);

      const response = await apiClient.get(
        `${import.meta.env.VITE_API_URL}/api/offline-staff/past/my-rides`
      );

      if (response.data && response.data.rides) {
        setPastBookings(response.data.rides);
      } else {
        setPastBookings([]);
      }

    } catch (error) {
      console.error("Error fetching past rides:", error);
      setPastBookings([]);
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = (booking: Booking) => {
    navigate(`/detailView/${booking._id}`);
  };

  return (
    <div className="bg-gray-50 min-h-screen">
      <Navbar title="Past Rides" className="bg-black" />

      <div className="pt-4 p-6">
        <div className="max-w-md mx-auto">
          {loading ? (
            <div className="text-center py-12">
              <Clock size={48} className="mx-auto text-gray-400 mb-4 animate-spin" />
              <p className="text-gray-500">Loading past rides...</p>
            </div>
          ) : pastBookings.length > 0 ? (
            <div className="space-y-4">
              {pastBookings.map((booking) => (
                <div
                  key={booking._id}
                  className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-lg">
                      {booking.rideInfo?.categoryName} - {booking.rideInfo?.subcategoryName}
                    </h3>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                      booking.status === "COMPLETED" 
                        ? "bg-green-100 text-green-800"
                        : booking.status === "CANCELLED"
                          ? "bg-red-100 text-red-800"
                          : "bg-gray-100 text-gray-800"
                    }`}>
                      {booking.status}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-4">
                    {/* Pickup Location */}
                    <div className="flex items-start">
                      <MapPin className="w-4 h-4 text-green-500 flex-shrink-0 mt-1 mr-2" />
                      <div>
                        <div className="font-medium text-sm">Pickup Location</div>
                        <div className="text-gray-600 text-sm">{booking.rideInfo?.fromLocation?.address}</div>
                      </div>
                    </div>

                    {/* Drop Location */}
                    {booking.rideInfo?.toLocation && (
                      <div className="flex items-start">
                        <MapPin className="w-4 h-4 text-red-500 flex-shrink-0 mt-1 mr-2" />
                        <div>
                          <div className="font-medium text-sm">Drop Location</div>
                          <div className="text-gray-600 text-sm">{booking.rideInfo?.toLocation?.address}</div>
                        </div>
                      </div>
                    )}

                    {/* Driver Category */}
                    {booking.rideInfo?.selectedCategory && (
                      <div className="flex items-start">
                        <div className="w-3 h-3 bg-orange-500 rounded-full mt-2 mr-2 flex-shrink-0"></div>
                        <div>
                          <div className="font-medium text-sm">Driver Category</div>
                          <div className="text-gray-600 text-sm">{booking.rideInfo?.selectedCategory}</div>
                        </div>
                      </div>
                    )}

                    {/* Date */}
                    {booking.rideInfo?.selectedDate && (
                      <div className="flex items-start">
                        <div className="w-3 h-3 bg-blue-500 rounded-full mt-2 mr-2 flex-shrink-0"></div>
                        <div>
                          <div className="font-medium text-sm">{booking.rideInfo?.subcategoryName?.toLowerCase().includes('weekly') || booking.rideInfo?.subcategoryName?.toLowerCase().includes('monthly') ? 'Start Date' : 'Date'}</div>
                          <div className="text-gray-600 text-sm">
                            {new Date(booking.rideInfo?.selectedDate).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Time */}
                    {booking.rideInfo?.selectedTime && (
                      <div className="flex items-start">
                        <div className="w-3 h-3 bg-yellow-500 rounded-full mt-2 mr-2 flex-shrink-0"></div>
                        <div>
                          <div className="font-medium text-sm">{booking.rideInfo?.subcategoryName?.toLowerCase().includes('weekly') || booking.rideInfo?.subcategoryName?.toLowerCase().includes('monthly') ? 'Start Time' : 'Time'}</div>
                          <div className="text-gray-600 text-sm">{booking.rideInfo?.selectedTime}</div>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="border-t pt-4">
                    <div className="flex justify-between items-center mb-2">
                      {booking.driverInfo ? (
                        <span className="text-sm text-gray-600">
                          Driver: {booking.driverInfo.driverName}
                        </span>
                      ) : (
                        <span className="text-sm text-gray-500 italic">
                          Driver not assigned
                        </span>
                      )}

                      <div className="text-right">
                        <span className="font-semibold text-lg">₹{booking.totalPayable}</span>
                        {booking.paymentType && (
                          <div className="text-xs text-gray-500 capitalize flex items-center justify-end mt-1">
                            <CreditCard size={12} className="mr-1" />
                            {booking.paymentType}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex gap-3 mt-4">
                      <button
                        onClick={() => handleViewDetails(booking)}
                        className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center"
                      >
                        <Eye size={16} className="mr-2" />
                        View Details
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Clock size={48} className="mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-semibold text-gray-600 mb-2">
                No Past Rides
              </h3>
              <p className="text-gray-500">You don't have any past rides.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PastRides;