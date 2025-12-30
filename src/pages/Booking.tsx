import React, { useEffect, useState, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import apiClient from '@/lib/axiosInterceptor';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { CommonFields } from '../components/booking/common/CommonFields';
import { setBookingStep1, updateField, purgeStore } from '../store/slices/bookingSlice';
import { ConfirmationDialog } from '../components/ui/confirmation-dialog';

const Booking = () => {
  const navigate = useNavigate();
  const { categoryId, subcategoryId, subSubcategoryId } = useParams();
  const dispatch = useDispatch();

  const bookingData = useSelector(state => state.booking);
  const { riderId, riderName } = bookingData;

  const [fromLocation, setFromLocation] = useState(bookingData.fromLocation || '');
  const [toLocation, setToLocation] = useState(bookingData.toLocation || '');
  const [fromLocationData, setFromLocationData] = useState(bookingData.fromLocationData || null);
  const [toLocationData, setToLocationData] = useState(bookingData.toLocationData || null);
  const [carType, setCarType] = useState(bookingData.carType || '');
  const [transmissionType, setTransmissionType] = useState(bookingData.transmissionType || '');
  const [selectedTransmissionId, setSelectedTransmissionId] = useState(bookingData.transmissionTypeId || '');
  const [selectedDate, setSelectedDate] = useState(bookingData.selectedDate || '');
  const [selectedTime, setSelectedTime] = useState(bookingData.selectedTime || '');
  const [startTime, setStartTime] = useState(bookingData.startTime || '');
  const [endTime, setEndTime] = useState(bookingData.endTime || '');
  const [vehicleCategories, setVehicleCategories] = useState([]);
  const [categoryName, setCategoryName] = useState(bookingData.categoryName || '');
  const [subcategoryName, setSubcategoryName] = useState(bookingData.subcategoryName || '');
  const [subSubcategoryName, setSubSubcategoryName] = useState(bookingData.subSubcategoryName || '');
  const [cities, setCities] = useState([]);
  const [selectedCity, setSelectedCity] = useState(bookingData.selectedCity || '');
  const [selectedCityName, setSelectedCityName] = useState(bookingData.selectedCityName || '');
  const [citySearch, setCitySearch] = useState(bookingData.selectedCityName || '');
  const [showCityDropdown, setShowCityDropdown] = useState(false);
  const [loading, setLoading] = useState(true);
  const [citiesLoading, setCitiesLoading] = useState(true);
  const cityDropdownRef = useRef(null);
  const [showBackConfirmation, setShowBackConfirmation] = useState(false);

  useEffect(() => {
    const today = new Date().toISOString().split('T')[0];
    if (!selectedDate) setSelectedDate(today);

    if (!startTime) setStartTime('03:00');
    if (!endTime) setEndTime('05:00');
  }, []);

  // Set default time based on subcategory
  useEffect(() => {
    if (!selectedTime && subcategoryName) {
      const now = new Date();
      const isOutstation = subcategoryName.toLowerCase() === 'outstation' || subcategoryName.toLowerCase() === 'out-station';
      const minutesToAdd = isOutstation ? 62 : 32;
      
      now.setMinutes(now.getMinutes() + minutesToAdd);
      
      const hours = now.getHours().toString().padStart(2, '0');
      const minutes = now.getMinutes().toString().padStart(2, '0');
      const formattedTime = `${hours}:${minutes}`;
      
      setSelectedTime(formattedTime);
    }
  }, [subcategoryName]);

  useEffect(() => {
    const fetchCities = async () => {
      try {
        const response = await apiClient.get(`${import.meta.env.VITE_API_URL}/api/cities`);
        const activeCities = response.data.filter(city => city.status === true);
        setCities(activeCities);
      } catch (error) {
        console.error('Failed to fetch cities', error);
      } finally {
        setCitiesLoading(false);
      }
    };

    fetchCities();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (cityDropdownRef.current && !cityDropdownRef.current.contains(event.target)) {
        setShowCityDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const requests = [
          apiClient.get(`${import.meta.env.VITE_API_URL}/api/subcategories/${subcategoryId}`),
          apiClient.get(`${import.meta.env.VITE_API_URL}/api/drivervehicletypes/active`)
        ];
        
        // Add sub-subcategory request if subSubcategoryId exists
        if (subSubcategoryId) {
          requests.push(apiClient.get(`${import.meta.env.VITE_API_URL}/api/subsubcategories/${subSubcategoryId}`));
        }
        
        const responses = await Promise.all(requests);
        const [subcategoryRes, transmissionRes, subSubcategoryRes] = responses;

        setSubcategoryName(subcategoryRes.data.name);
        setCategoryName(subcategoryRes.data?.categoryId?.name || '');
        setTransmissionOptions(transmissionRes.data?.data || []);
        
        // Debug logs for subcategory
        const subcategoryNameLower = subcategoryRes.data.name?.toLowerCase();
        const isOutstationDebug = subcategoryNameLower === 'outstation' || subcategoryNameLower === 'out-station';
        console.log('🔍 Booking.tsx Debug:', {
          originalSubcategoryName: subcategoryRes.data.name,
          subcategoryNameLower,
          categoryName: subcategoryRes.data?.categoryId?.name || '',
          selectedCityName,
          isOutstationCheck: isOutstationDebug,
          cityNameThatWillBePassed: isOutstationDebug ? undefined : selectedCityName,
          checkConditions: {
            equalsOutstation: subcategoryNameLower === 'outstation',
            equalsOutStation: subcategoryNameLower === 'out-station'
          }
        });
        
        // Set sub-subcategory name if available
        if (subSubcategoryRes) {
          setSubSubcategoryName(subSubcategoryRes.data.name);
        }

        if (!transmissionType && transmissionRes.data?.data?.length > 0) {
          setTransmissionType(transmissionRes.data.data[0].name.toLowerCase());
          setSelectedTransmissionId(transmissionRes.data.data[0]._id);
        } else if (transmissionType && bookingData.transmissionTypeId) {
          setSelectedTransmissionId(bookingData.transmissionTypeId);
        }
      } catch (error) {
        console.error('Failed to fetch data', error);
      } finally {
        setLoading(false);
      }
    };

    if (subcategoryId && selectedCity) {
      fetchData();
      dispatch(updateField({ field: 'categoryId', value: categoryId }));
      dispatch(updateField({ field: 'subcategoryId', value: subcategoryId }));
      if (subSubcategoryId) {
        dispatch(updateField({ field: 'subSubcategoryId', value: subSubcategoryId }));
      }
    }
  }, [categoryId, subcategoryId, subSubcategoryId, selectedCity]);

  useEffect(() => {
    const fetchVehiclesByType = async () => {
      if (!selectedTransmissionId) return;
      
      try {
        const response = await apiClient.post(
          `${import.meta.env.VITE_API_URL}/api/vehiclecategories/by-type`,
          { driverVehicleTypeId: selectedTransmissionId }
        );
        setVehicleCategories(response.data?.data || []);
        
        if (!carType && response.data?.data?.length > 0) {
          setCarType(response.data.data[0].vehicleName.toLowerCase());
        }
      } catch (error) {
        console.error('Failed to fetch vehicles by type', error);
      }
    };

    fetchVehiclesByType();
  }, [selectedTransmissionId]);

  useEffect(() => {
    dispatch(updateField({ field: 'fromLocation', value: fromLocation }));
  }, [fromLocation]);

  useEffect(() => {
    dispatch(updateField({ field: 'toLocation', value: toLocation }));
  }, [toLocation]);

  useEffect(() => {
    dispatch(updateField({ field: 'carType', value: carType }));
  }, [carType]);

  useEffect(() => {
    dispatch(updateField({ field: 'transmissionType', value: transmissionType }));
  }, [transmissionType]);

  useEffect(() => {
    const selectedVehicle = vehicleCategories.find(v => v.vehicleName.toLowerCase() === carType.toLowerCase());
    if (selectedVehicle?._id) {
      dispatch(updateField({ field: 'carTypeId', value: selectedVehicle._id }));
    }
  }, [carType, vehicleCategories]);

  useEffect(() => {
    if (selectedTransmissionId) {
      dispatch(updateField({ field: 'transmissionTypeId', value: selectedTransmissionId }));
    }
  }, [selectedTransmissionId]);

  useEffect(() => {
    dispatch(updateField({ field: 'selectedDate', value: selectedDate }));
  }, [selectedDate]);

  useEffect(() => {
    dispatch(updateField({ field: 'selectedTime', value: selectedTime }));
  }, [selectedTime]);

  useEffect(() => {
    dispatch(updateField({ field: 'startTime', value: startTime }));
  }, [startTime]);

  useEffect(() => {
    dispatch(updateField({ field: 'endTime', value: endTime }));
  }, [endTime]);

  useEffect(() => {
    dispatch(updateField({ field: 'fromLocationData', value: fromLocationData }));
  }, [fromLocationData]);

  useEffect(() => {
    dispatch(updateField({ field: 'toLocationData', value: toLocationData }));
  }, [toLocationData]);

  useEffect(() => {
    dispatch(updateField({ field: 'selectedCity', value: selectedCity }));
  }, [selectedCity]);

  useEffect(() => {
    dispatch(updateField({ field: 'selectedCityName', value: selectedCityName }));
  }, [selectedCityName]);

  // Parcel fields state
  const [riderData, setRiderData] = useState(null);
  const [senderType, setSenderType] = useState('myself');
  const [senderName, setSenderName] = useState('');
  const [senderMobile, setSenderMobile] = useState('');
  const [receiverType, setReceiverType] = useState('other');
  const [receiverName, setReceiverName] = useState('');
  const [receiverMobile, setReceiverMobile] = useState('');

  useEffect(() => {
    const fetchStaff = async () => {
      try {
        const res = await apiClient.get(
          `${import.meta.env.VITE_API_URL}/api/offline-staff/find-staff`
        );
        if (res.data?.success && res.data.staff) {
          // Staff is authenticated, continue with booking
          setRiderData({ name: riderName, mobile: '' }); // Use rider info from Redux
          if (senderType === 'myself' && riderName) {
            setSenderName(riderName);
            setSenderMobile(''); // We don't have rider mobile in this context
          }
        }
      } catch (err) {
        console.error("Error fetching staff:", err);
        if (err.response?.status === 401) {
          navigate('/login');
        }
      }
    };

    fetchStaff();
  }, []);

  // Handle sender type change
  useEffect(() => {
    if (senderType === 'myself' && riderName) {
      setSenderName(riderName);
      setSenderMobile(''); // We don't have rider mobile in booking context
    } else if (senderType === 'other') {
      setSenderName('');
      setSenderMobile('');
    }
  }, [senderType, riderName]);

  // Handle receiver type change
  useEffect(() => {
    if (receiverType === 'myself' && riderName) {
      setReceiverName(riderName);
      setReceiverMobile(''); // We don't have rider mobile in booking context
    } else if (receiverType === 'other') {
      setReceiverName('');
      setReceiverMobile('');
    }
  }, [receiverType, riderName]);

  const [transmissionOptions, setTransmissionOptions] = useState([]);

  const handleBackClick = () => {
    setShowBackConfirmation(true);
  };

  const handleConfirmBack = () => {
    dispatch(purgeStore());
    navigate('/');
  };

  const handleNextPage = () => {
    const bookingData = {
      riderId,
      riderName,
      categoryId,
      subcategoryId,
      subSubcategoryId,
      categoryName,
      subcategoryName,
      subSubcategoryName,
      selectedCity,
      selectedCityName,
      fromLocation,
      toLocation,
      fromLocationData,
      toLocationData,
      selectedDate,
      selectedTime,
      startTime,
      endTime,
      senderType,
      senderName,
      senderMobile,
      receiverType,
      receiverName,
      receiverMobile
    };

    if (categoryName.toLowerCase() === 'driver') {
      const selectedVehicle = vehicleCategories.find(v => v.vehicleName.toLowerCase() === carType.toLowerCase());
      bookingData.carType = carType;
      bookingData.transmissionType = transmissionType;
      bookingData.carTypeId = selectedVehicle?._id || null;
      bookingData.transmissionTypeId = selectedTransmissionId || null;
    }
    dispatch(setBookingStep1(bookingData));
    navigate('/booking-step2', { state: bookingData });
  };

  const isFormValid = () => {
    const basicValid = fromLocation && selectedDate && selectedTime;
    
    if (categoryName.toLowerCase() === 'parcel') {
      const parcelValid = senderName.trim() && senderMobile.trim() && receiverName.trim() && receiverMobile.trim();
      return basicValid && parcelValid && isTimeValid();
    }
    
    return basicValid && isTimeValid();
  };

  const isTimeValid = () => {
    if (!selectedTime || !selectedDate || !subcategoryName) return true;
    
    const now = new Date();
    const selectedDateTime = new Date(`${selectedDate}T${selectedTime}`);
    const isOutstation = subcategoryName.toLowerCase() === 'outstation' || subcategoryName.toLowerCase() === 'out-station';
    const requiredMinutes = isOutstation ? 60 : 30; // Adding 1 extra minute to avoid edge cases
    
    const minAllowedTime = new Date(now.getTime() + requiredMinutes * 60000);
    return selectedDateTime >= minAllowedTime;
  };

  const getValidationError = () => {
    if (categoryName.toLowerCase() === 'parcel') {
      const parcelValid = senderName.trim() && senderMobile.trim() && receiverName.trim() && receiverMobile.trim();
      if (!parcelValid) {
        return 'Please fill in all sender and receiver details for parcel booking';
      }
    }
    
    if (!isTimeValid()) {
      const isOutstation = subcategoryName?.toLowerCase() === 'outstation' || subcategoryName?.toLowerCase() === 'out-station';
      const requiredMinutes = isOutstation ? 60 : 30;
      return `Please select a time at least ${requiredMinutes} minutes from now for ${isOutstation ? 'outstation' : 'local'} bookings`;
    }
    
    return '';
  };

  if (citiesLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-4 px-4 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading cities...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-4 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center mb-6">
          <Button variant="ghost" onClick={handleBackClick} className="mr-4 p-2 hover:bg-white/50 rounded-full">
            <ArrowLeft className="w-6 h-6" />
          </Button>
          <div className="flex-1">
            {riderName && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-2">
                <p className="text-blue-800 font-medium text-sm">
                  Booking for: <span className="font-bold">{riderName}</span>
                </p>
              </div>
            )}
            <h1 className="text-2xl font-bold text-gray-900">
              {categoryName} - {subcategoryName}{subSubcategoryName ? ` - ${subSubcategoryName}` : ''} Booking - Step 1
            </h1>
          </div>
        </div>

        <div className="space-y-6">
          {/* City Selection */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select City *
            </label>
            <div className="relative" ref={cityDropdownRef}>
              <input
                type="text"
                value={citySearch}
                onChange={(e) => {
                  setCitySearch(e.target.value);
                  setShowCityDropdown(true);
                }}
                onFocus={() => setShowCityDropdown(true)}
                placeholder="Search and select a city..."
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
              {showCityDropdown && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                  {cities
                    .filter(city => city.name.toLowerCase().includes(citySearch.toLowerCase()))
                    .map((city) => (
                      <div
                        key={city._id}
                        onClick={() => {
                          setSelectedCity(city._id);
                          setSelectedCityName(city.name);
                          setCitySearch(city.name);
                          setShowCityDropdown(false);
                        }}
                        className="p-3 hover:bg-blue-50 cursor-pointer border-b border-gray-100 last:border-b-0"
                      >
                        {city.name}
                      </div>
                    ))}
                  {cities.filter(city => city.name.toLowerCase().includes(citySearch.toLowerCase())).length === 0 && (
                    <div className="p-3 text-gray-500 text-center">
                      No cities found
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Booking Form - Only show after city selection */}
          {selectedCity && (
            <>
              {loading ? (
                <div className="bg-white rounded-lg shadow-md p-6 text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                  <p className="text-gray-600">Loading booking details...</p>
                </div>
              ) : (
                <>
                  <CommonFields
                    fromLocation={fromLocation}
                    toLocation={toLocation}
                    fromLocationData={fromLocationData}
                    toLocationData={toLocationData}
                    selectedCityName={subcategoryName?.toLowerCase() === 'outstation' || subcategoryName?.toLowerCase() === 'out-station' ? undefined : selectedCityName}
                    subcategoryName={subcategoryName}
                    selectedDate={selectedDate}
                    selectedTime={selectedTime}
                    startTime={startTime}
                    endTime={endTime}
                    carType={carType}
                    transmissionType={transmissionType}
                    vehicleCategories={vehicleCategories}
                    transmissionOptions={transmissionOptions}
                    onTransmissionChange={(id) => setSelectedTransmissionId(id)}
                    showToLocation={!subcategoryName.toLowerCase().includes('hourly')}
                    showTimeDuration={subcategoryName?.toLowerCase().includes('monthly') || subcategoryName?.toLowerCase().includes('weekly')}
                    showVehicleFields={categoryName.toLowerCase() !== 'cab' && categoryName.toLowerCase() !== 'parcel'}
                    showReceiverFields={categoryName.toLowerCase() === 'parcel'}
                    senderType={senderType}
                    senderName={senderName}
                    senderMobile={senderMobile}
                    receiverType={receiverType}
                    receiverName={receiverName}
                    receiverMobile={receiverMobile}
                    dateLabel={subcategoryName?.toLowerCase() === 'weekly' || subcategoryName?.toLowerCase() === 'monthly' ? 'Start Date' : 'Date'}
                    timeLabel={subcategoryName?.toLowerCase() === 'weekly' || subcategoryName?.toLowerCase() === 'monthly' ? 'Start Time' : 'Time'}
                    onFieldChange={(field, value) => {
                      switch (field) {
                        case 'fromLocation': setFromLocation(value); break;
                        case 'toLocation': setToLocation(value); break;
                        case 'selectedDate': setSelectedDate(value); break;
                        case 'selectedTime': setSelectedTime(value); break;
                        case 'startTime': setStartTime(value); break;
                        case 'endTime': setEndTime(value); break;
                        case 'carType': setCarType(value); break;
                        case 'transmissionType': setTransmissionType(value); break;
                        case 'senderType': setSenderType(value); break;
                        case 'senderName': setSenderName(value); break;
                        case 'senderMobile': setSenderMobile(value); break;
                        case 'receiverType': setReceiverType(value); break;
                        case 'receiverName': setReceiverName(value); break;
                        case 'receiverPhone': setReceiverMobile(value); break;
                      }
                    }}
                    onLocationChange={(field, locationData) => {
                      if (field === 'fromLocation') {
                        setFromLocationData(locationData);
                      } else if (field === 'toLocation') {
                        setToLocationData(locationData);
                      }
                    }}
                  />
                  {getValidationError() && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                      <p className="text-red-600 text-sm font-medium">{getValidationError()}</p>
                    </div>
                  )}
                  <Button
                    onClick={handleNextPage}
                    disabled={!isFormValid()}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white py-4 text-lg font-semibold rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next Step
                  </Button>
                </>
              )}
            </>
          )}
        </div>
      </div>
      
      {/* Back Confirmation Dialog */}
      <ConfirmationDialog
        isOpen={showBackConfirmation}
        onClose={() => setShowBackConfirmation(false)}
        onConfirm={handleConfirmBack}
        title="Clear All Data?"
        description="Going back will clear all your booking data. Are you sure you want to continue?"
        confirmText="Yes, Clear All"
        cancelText="Stay Here"
      />
    </div>
  );
};

export default Booking;