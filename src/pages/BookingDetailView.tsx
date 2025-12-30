import React, { useEffect, useState } from "react";
import apiClient from '@/lib/axiosInterceptor';
import { ArrowLeft, Phone, Clock, MapPin, Calendar, CreditCard, User, Car, Navigation, X } from "lucide-react";
import { useParams } from "react-router-dom";
import { useNavigate } from "react-router-dom";

interface Driver {
    name: string;
    phone?: string;
    vehicle: string;
    estimatedArrival: string;
}

interface Booking {
    _id: string;
    subcategoryName?: string;
    carType?: string;
    transmissionType?: string;
    status: string;
    fromLocation: any;
    toLocation?: any;
    totalPayable: number;
    paymentType?: string;
    driver?: Driver;
    selectedDate?: string;
    selectedTime?: string;
    selectedUsage?: string;
    createdAt?: string;
    updatedAt?: string;
    includeInsurance?: boolean;
    notes?: string;
    selectedCategory?: string;
    categoryId?: string;
    rideInfo?: any;
    isReferralEarningUsed?: boolean;
    referralEarningUsedAmount?: number;
}

interface BookingDetailViewProps {
    onBack: () => void;
}



const BookingDetailView: React.FC<BookingDetailViewProps> = ({ onBack }) => {
    const [booking, setBooking] = useState<Booking | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    const navigate = useNavigate();
    const { id: bookingId } = useParams<{ id: string }>();

    useEffect(() => {
        if (bookingId) {
            fetchBookingDetails();
        }
    }, [bookingId]);

    const fetchBookingDetails = async () => {
        try {
            setLoading(true);
            setError(null);

            const response = await apiClient.post(
                `${import.meta.env.VITE_API_URL}/api/rides/bookingDetail`,
                { rideId: bookingId }
            );
            

            setBooking(response.data.data);
        } catch (error: any) {
            console.error("Error fetching booking details:", error);
            setError(
                error.response?.data?.message ||
                error.message ||
                "Failed to fetch booking details"
            );
        } finally {
            setLoading(false);
        }
    };

    const handleCancelBooking = async () => {
        try {
            const confirmed = window.confirm('Are you sure you want to cancel this booking?');
            if (!confirmed) return;

            const response = await apiClient.post(
                `${import.meta.env.VITE_API_URL}/api/rides/booking/cancel`,
                { bookingId }
            );

            if (response.status === 200) {
                alert('Booking cancelled successfully');
                onBack();
            }
        } catch (error: any) {
            console.error("Error cancelling booking:", error);
            alert(error.response?.data?.message || 'Error cancelling booking');
        }
    };

    const formatDate = (dateString: string) => {
        if (!dateString) return "Not specified";
        try {
            return new Date(dateString).toLocaleDateString('en-IN', {
                day: 'numeric',
                month: 'short',
                year: 'numeric',
            });
        } catch (error) {
            return dateString;
        }
    };

    if (loading) {
        return (
            <div className="p-6 bg-gray-50 min-h-screen">
                <div className="max-w-md mx-auto">
                    <div className="flex items-center mb-6">
                        <button onClick={onBack} className="mr-3 p-2 hover:bg-gray-100 rounded-lg">
                            <ArrowLeft size={20} />
                        </button>
                        <h2 className="text-xl font-semibold">Booking Details</h2>
                    </div>
                    <div className="text-center py-12">
                        <Clock size={48} className="mx-auto text-gray-400 mb-4 animate-spin" />
                        <p className="text-gray-500">Loading booking details...</p>
                    </div>
                </div>
            </div>
        );
    }

    

    if (error || !booking) {
        return (
            <div className="p-6 bg-gray-50 min-h-screen">
                <div className="max-w-md mx-auto">
                    <div className="flex items-center mb-6">
                        <button onClick={onBack} className="mr-3 p-2 hover:bg-gray-100 rounded-lg">
                            <ArrowLeft size={20} />
                        </button>
                        <h2 className="text-xl font-semibold">Booking Details</h2>
                    </div>
                    <div className="text-center py-12">
                        <X size={48} className="mx-auto text-red-400 mb-4" />
                        <h3 className="text-lg font-semibold text-gray-600 mb-2">Error Loading Booking</h3>
                        <p className="text-gray-500">{error || "Booking not found"}</p>
                        <button
                            onClick={onBack}
                            className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                        >
                            Go Back
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    const subcategoryLower = booking.rideInfo?.subcategoryName?.toLowerCase() || '';
    const isWeeklyOrMonthly = subcategoryLower === 'weekly' || subcategoryLower === 'monthly';

    return (
        <div className="p-4 bg-gray-50 min-h-screen">
            <div className="max-w-lg mx-auto">
                {/* Header */}
                <div className="flex items-center mb-4">
                    <button
                        onClick={() => navigate(-1)}
                        className="mr-3 p-2 hover:bg-gray-100 rounded-lg"
                    >
                        <ArrowLeft size={20} />
                    </button>
                    <h2 className="text-xl font-semibold">Booking Details</h2>
                </div>

                {/* Main Card - Combined Information */}
                <div className="bg-white rounded-lg shadow-sm p-5 mb-4">
                    {/* Service and Status */}
                    <div className="flex items-center justify-between mb-4 pb-3 border-b">
                        <div>
                            <h3 className="font-semibold text-lg">
                                {booking.rideInfo?.categoryName} - {booking.rideInfo?.subcategoryName}
                            </h3>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${booking.status === 'BOOKED' ? 'bg-blue-100 text-blue-800' :
                            booking.status === 'CONFIRMED' ? 'bg-green-100 text-green-800' :
                                booking.status === 'CANCELLED' ? 'bg-red-100 text-red-800' :
                                    'bg-gray-100 text-gray-800'
                            }`}>
                            {booking.status}
                        </span>
                    </div>

                    {/* Price and Payment */}
                    <div className="flex justify-between items-center mb-5 pb-4 border-b">
                        <div className="text-2xl font-bold text-gray-800">₹{booking.totalPayable}</div>
                        {booking.paymentType && (
                            <div className="text-sm text-gray-500 capitalize flex items-center">
                                <CreditCard size={14} className="mr-1" />
                                {booking.paymentType}
                            </div>
                        )}
                    </div>

                    {/* Ride Charges Breakdown */}
                    <div className="mb-5 pb-4 border-b">
                        <h4 className="font-semibold text-gray-800 mb-3 text-sm">Ride Charges Breakdown</h4>
                        <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                                <span className="text-gray-600">Base fare</span>
                                <span className="font-medium">₹{booking.rideInfo?.subtotal || 0}</span>
                            </div>

                            {booking.rideInfo?.discount && (
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Discount</span>
                                    <span className="font-medium">-₹{booking.rideInfo?.discount || 0}</span>
                                </div>
                            )}

                            {booking.rideInfo?.includeInsurance && (
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Insurance Charges</span>
                                    <span className="font-medium">₹{booking.rideInfo?.insuranceCharges || 0}</span>
                                </div>
                            )}

                            <div className="flex justify-between">
                                <span className="text-gray-600">GST</span>
                                <span className="font-medium">₹{booking.rideInfo?.gstCharges || 0}</span>
                            </div>

                            {booking.rideInfo?.cancellationCharges > 0 && (
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Cancellation Charges</span>
                                    <span className="font-medium">₹{booking.rideInfo.cancellationCharges}</span>
                                </div>
                            )}

                            {booking.isReferralEarningUsed && booking.referralEarningUsedAmount && (
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Referral Earning Used</span>
                                    <span className="font-medium ">-₹{booking.referralEarningUsedAmount}</span>
                                </div>
                            )}


                            {booking.rideInfo?.adminAddedRideExtraCharges?.Charges > 0  && (
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Admin Added Ride Extra Charges</span>
                                    <span className="font-medium ">₹{booking.rideInfo?.adminAddedRideExtraCharges?.Charges}</span>
                                </div>
                            )}


                            <div className="flex justify-between border-t pt-2 font-semibold">
                                <span className="text-gray-800">Total Payable</span>
                                <span className="text-gray-800">₹{booking.totalPayable}</span>
                            </div>
                        </div>
                    </div>

                    {/* Sender & Receiver Details */}
                    {(booking.rideInfo?.senderDetails || booking.rideInfo?.receiverDetails) && (
                        <div className="mb-5 pb-4 border-b">
                            <h4 className="font-semibold text-gray-800 mb-3 flex items-center">
                                <User size={16} className="mr-2" />
                                Sender & Receiver Details
                            </h4>

                            <div className="space-y-3 text-sm">
                                {booking.rideInfo?.senderDetails && (
                                    <div className="p-3 border rounded-lg ">
                                        <div className="font-medium text-gray-700 mb-1">Sender Details</div>
                                        <div className="text-gray-600">
                                            <span className="block">Name: {booking.rideInfo.senderDetails.name}</span>
                                            <span className="block">Phone: {booking.rideInfo.senderDetails.phone}</span>
                                        </div>
                                    </div>
                                )}

                                {booking.rideInfo?.receiverDetails && (
                                    <div className="p-3 border rounded-lg ">
                                        <div className="font-medium text-gray-700 mb-1">Receiver Details</div>
                                        <div className="text-gray-600">
                                            <span className="block">Name: {booking.rideInfo.receiverDetails.name}</span>
                                            <span className="block">Phone: {booking.rideInfo.receiverDetails.phone}</span>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}


                    {/* Location Details */}
                    <div className="mb-5 pb-4 border-b">
                        <h4 className="font-semibold text-gray-800 mb-3 flex items-center">
                            <MapPin size={16} className="mr-2" />
                            Location Details
                        </h4>

                        <div className="space-y-3">
                            <div className="flex items-start">
                                <div className="w-2 h-2 bg-green-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                                <div className="text-sm">
                                    <div className="font-medium text-gray-600">Pickup Location</div>
                                    <div className="text-gray-800">{booking.rideInfo?.fromLocation?.address || booking.fromLocation}</div>
                                </div>
                            </div>

                            {(booking.rideInfo?.toLocation || booking.toLocation) && (
                                <div className="flex items-start">
                                    <div className="w-2 h-2 bg-red-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                                    <div className="text-sm">
                                        <div className="font-medium text-gray-600">Drop Location</div>
                                        <div className="text-gray-800">{booking.rideInfo?.toLocation?.address || booking.toLocation}</div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Weekly/Monthly Booking Details */}
                    {isWeeklyOrMonthly && (
                        <div className="mb-5 pb-4 border-b">
                            <h4 className="font-semibold text-gray-800 mb-3 flex items-center">
                                <Calendar size={16} className="mr-2" />
                                {subcategoryLower === 'weekly' ? 'Weekly' : 'Monthly'} Booking Details
                            </h4>

                            <div className="space-y-3 text-sm">
                                {booking.rideInfo?.SelectedDays && (
                                    <div className="flex items-center justify-between">
                                        <span className="text-gray-600">Number of Days</span>
                                        <span className="font-medium text-gray-800">{booking.rideInfo.SelectedDays} days</span>
                                    </div>
                                )}

                                {booking.rideInfo?.selectedDates && Array.isArray(booking.rideInfo.selectedDates) && booking.rideInfo.selectedDates.length > 0 && (
                                    <div>
                                        <div className="text-gray-600 mb-2">Selected Dates</div>
                                        <div className="flex flex-wrap gap-2">
                                            {booking.rideInfo.selectedDates.map((date: string, index: number) => (
                                                <span 
                                                    key={index}
                                                    className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-medium"
                                                >
                                                    {formatDate(date)}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Booking Information */}
                    <div className="grid grid-cols-2 gap-3 mb-5">
                        <div>
                            <div className="text-xs text-gray-500">Booking ID</div>
                            <div className="text-sm font-medium">{booking._id?.slice(-8) || 'N/A'}</div>
                        </div>

                        <div>
                            <div className="text-xs text-gray-500">Driver Category</div>
                            <div className="text-sm font-medium">{booking.rideInfo?.selectedCategory}</div>
                        </div>

                        <div>
                            <div className="text-xs text-gray-500">Car</div>
                            <div className="text-sm font-medium">{booking.rideInfo?.carType}</div>
                        </div>

                        <div>
                            <div className="text-xs text-gray-500">Car Type</div>
                            <div className="text-sm font-medium">{booking.rideInfo?.transmissionType}</div>
                        </div>

                        <div>
                            <div className="text-xs text-gray-500">Ride Duration</div>
                            <div className="text-sm font-medium">
                                {booking.rideInfo?.selectedUsage}{" "}
                                
                            </div>
                        </div>

                          {booking.createdAt && (
                            <div>
                                <div className="text-xs text-gray-500">Booked On</div>
                                <div className="text-sm font-medium">{formatDate(booking.createdAt)}</div>
                            </div>
                        )}

                        {booking.rideInfo?.selectedDate && (
                            <div>
                                <div className="text-xs text-gray-500">Start Date</div>
                                <div className="text-sm font-medium">{formatDate(booking.rideInfo?.selectedDate)}</div>
                            </div>
                        )}

                        {booking.rideInfo?.selectedTime && (
                            <div>
                                <div className="text-xs text-gray-500">Start Time</div>
                                <div className="text-sm font-medium">{booking.rideInfo?.selectedTime}</div>
                            </div>
                        )}

                      
                    </div>

                    {/* Additional Service Details */}
                    {(booking.rideInfo?.includeInsurance !== undefined) && (
                        <div className="mb-4 text-sm">
                            <span className="text-gray-600">Insurance: </span>
                            <span className="font-medium">{booking.rideInfo?.includeInsurance ? 'Included' : 'Not Included'}</span>
                        </div>
                    )}

                    {/* Notes */}
                    {booking.rideInfo?.notes && (
                        <div className="pt-3 border-t">
                            <h4 className="font-semibold text-gray-800 mb-2 text-sm">Special Notes</h4>
                            <p className="text-gray-600 text-sm">{booking.rideInfo?.notes}</p>
                        </div>
                    )}
                </div>

                {/* Driver Information */}
                {booking.driver ? (
                    <div className="bg-white rounded-lg shadow-sm p-5 mb-4">
                        <h4 className="font-semibold text-gray-800 mb-4 flex items-center">
                            <User size={16} className="mr-2" />
                            Driver Information
                        </h4>

                        <div className="grid grid-cols-2 gap-3 mb-4">
                            <div>
                                <div className="text-xs text-gray-500">Name</div>
                                <div className="text-sm font-medium">{booking.driver.name}</div>
                            </div>

                            {booking.driver.phone && (
                                <div>
                                    <div className="text-xs text-gray-500">Phone</div>
                                    <div className="text-sm font-medium">{booking.driver.phone}</div>
                                </div>
                            )}

                            {booking.driver.vehicle && (
                                <div>
                                    <div className="text-xs text-gray-500">Vehicle</div>
                                    <div className="text-sm font-medium">{booking.driver.vehicle}</div>
                                </div>
                            )}

                            {booking.driver.estimatedArrival && (
                                <div>
                                    <div className="text-xs text-gray-500">ETA</div>
                                    <div className="text-sm font-medium">{booking.driver.estimatedArrival}</div>
                                </div>
                            )}
                        </div>

                        <button className="w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center text-sm">
                            <Phone size={16} className="mr-2" />
                            Call Driver
                        </button>
                    </div>
                ) : booking.status === "BOOKED" ? (
                    <div className="bg-white rounded-lg shadow-sm p-5 mb-4 text-center">
                        <Clock size={32} className="mx-auto text-gray-400 mb-2" />
                        <h4 className="font-medium text-gray-600 mb-1 text-sm">Driver Not Assigned</h4>
                        <p className="text-xs text-gray-500">We'll notify you once a driver is assigned to your booking.</p>
                    </div>
                ) : null}
            </div>
        </div>
    );
};

export default BookingDetailView;