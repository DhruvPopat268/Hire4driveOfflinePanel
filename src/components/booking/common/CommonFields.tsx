import React, { useState } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { LocationInput } from './LocationInput';

interface LocationData {
  address: string;
  place_id: string;
  lat: number;
  lng: number;
  address_components: any[];
}

interface CommonFieldsProps {
  fromLocation: string;
  toLocation: string;
  fromLocationData?: LocationData;
  toLocationData?: LocationData;
  selectedCityName?: string;
  subcategoryName?: string;
  selectedDate: string;
  selectedTime: string;
  startTime?: string;
  endTime?: string;
  carType: string;
  transmissionType: string;
  receiverName?: string;
  receiverPhone?: string;
  senderType?: string;
  senderName?: string;
  senderMobile?: string;
  receiverType?: string;
  receiverMobile?: string;
  vehicleCategories: any[];
  transmissionOptions: any[];
  onTransmissionChange?: (id: string) => void;
  showToLocation: boolean;
  showTimeDuration?: boolean;
  showVehicleFields?: boolean;
  showReceiverFields?: boolean;
  dateLabel?: string;
  timeLabel?: string;
  onFieldChange: (field: string, value: string) => void;
  onLocationChange?: (field: 'fromLocation' | 'toLocation', locationData: LocationData) => void;
}

export const CommonFields: React.FC<CommonFieldsProps> = ({
  fromLocation,
  toLocation,
  fromLocationData,
  toLocationData,
  selectedCityName,
  subcategoryName,
  selectedDate,
  selectedTime,
  startTime = '',
  endTime = '',
  carType,
  transmissionType,
  receiverName = '',
  receiverPhone = '',
  senderType = 'myself',
  senderName = '',
  senderMobile = '',
  receiverType = 'other',
  receiverMobile = '',
  vehicleCategories,
  transmissionOptions,
  onTransmissionChange,
  showToLocation,
  showTimeDuration = false,
  showVehicleFields = true,
  showReceiverFields = false,
  dateLabel = 'Date',
  timeLabel = 'Time',
  onFieldChange,
  onLocationChange,
}) => {
  const [senderMobileError, setSenderMobileError] = useState('');
  const [receiverMobileError, setReceiverMobileError] = useState('');

  const validateMobile = (mobile: string) => {
    const cleanMobile = mobile.replace(/\D/g, '');
    if (cleanMobile.length === 0) return '';
    if (cleanMobile.length !== 10) return 'Please enter a valid 10-digit mobile number';
    return '';
  };

  return (
    <Card className="bg-white shadow-lg">
      <CardHeader />
      <CardContent className="space-y-8">
        {/* Location Fields */}
        <div className="space-y-4">
          <div>
            <Label htmlFor="from">Pickup Location</Label>
            <div className="relative">
              <div className="absolute left-3 top-3 w-3 h-3 bg-green-500 rounded-full z-10"></div>
              <LocationInput
                id="from"
                placeholder="Enter pickup location"
                value={fromLocation}
                onChange={(locationData) => {
                  onFieldChange('fromLocation', locationData.address);
                  onLocationChange?.('fromLocation', locationData);
                }}
                className="pl-10"
                selectedCityName={selectedCityName}
              />
            </div>
          </div>

          {showToLocation && (
            <div>
              <Label htmlFor="to">Drop Location</Label>
              <div className="relative">
                <div className="absolute left-3 top-3 w-3 h-3 bg-red-500 rounded-full z-10"></div>
                <LocationInput
                  id="to"
                  placeholder="Enter destination"
                  value={toLocation}
                  onChange={(locationData) => {
                    onFieldChange('toLocation', locationData.address);
                    onLocationChange?.('toLocation', locationData);
                  }}
                  className="pl-10"
                  selectedCityName={selectedCityName}
                />
              </div>
            </div>
          )}
        </div>

        {/* <hr className="border-gray-200" /> */}

        {/* Schedule Fields */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="selectedDate">{dateLabel}</Label>
            <Input
              type="date"
              value={selectedDate}
              onChange={(e) => onFieldChange('selectedDate', e.target.value)}
              className="pr-2"
            />
          </div>
          <div>
            <Label htmlFor="selectedTime">{timeLabel}</Label>
            <Input
              type="time"
              value={selectedTime}
              onChange={(e) => onFieldChange('selectedTime', e.target.value)}
              className="pr-2"
            />
          </div>
        </div>

        {/* <hr className="border-gray-200" /> */}

        {/* Vehicle Fields - Show only if showVehicleFields is true */}
        {showVehicleFields && (
          <div className="grid grid-cols-2 gap-4">

            <div>
              <Label>Transmission</Label>
              <Select value={transmissionType} onValueChange={(value) => {
                const selected = transmissionOptions.find(t => t.name.toLowerCase() === value);
                onFieldChange('transmissionType', value);
                if (selected && onTransmissionChange) {
                  onTransmissionChange(selected._id);
                }
              }}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {transmissionOptions.map((trans) => (
                    <SelectItem key={trans._id} value={trans.name.toLowerCase()}>{trans.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Car Type</Label>
              <Select value={carType} onValueChange={(value) => onFieldChange('carType', value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {vehicleCategories.map((vehicle) => (
                    <SelectItem key={vehicle._id} value={vehicle.vehicleName.toLowerCase()}>
                      {vehicle.vehicleName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

          </div>
        )}

        {/* Parcel Fields - Show only if showReceiverFields is true */}
        {showReceiverFields && (
          <div className="space-y-6">
            {/* Sender Section */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-800">Sender Details</h3>
              <div className="flex space-x-6">
                <div className="flex items-center space-x-2">
                  <input
                    type="radio"
                    id="senderMyself"
                    name="senderType"
                    value="myself"
                    checked={senderType === 'myself'}
                    onChange={(e) => onFieldChange('senderType', e.target.value)}
                    className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                  />
                  <Label htmlFor="senderMyself" className="cursor-pointer">Myself</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="radio"
                    id="senderOther"
                    name="senderType"
                    value="other"
                    checked={senderType === 'other'}
                    onChange={(e) => onFieldChange('senderType', e.target.value)}
                    className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                  />
                  <Label htmlFor="senderOther" className="cursor-pointer">Other</Label>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="senderName">Sender Name</Label>
                  <Input
                    id="senderName"
                    placeholder="Enter sender name"
                    value={senderName}
                    onChange={(e) => onFieldChange('senderName', e.target.value)}
                    disabled={senderType === 'myself'}
                  />
                </div>
                <div>
                  <Label htmlFor="senderMobile">Sender Mobile</Label>
                  <Input
                    id="senderMobile"
                    placeholder="Enter sender mobile"
                    value={senderMobile}
                    onChange={(e) => {
                      const value = e.target.value.replace(/\D/g, '');
                      onFieldChange('senderMobile', value);
                      setSenderMobileError(validateMobile(value));
                    }}
                    type="tel"
                    disabled={senderType === 'myself'}
                    className={senderMobileError ? 'border-red-500' : ''}
                  />
                  {senderMobileError && (
                    <p className="text-red-500 text-sm mt-1">{senderMobileError}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Receiver Section */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-800">Receiver Details</h3>
              <div className="flex space-x-6">
                <div className="flex items-center space-x-2">
                  <input
                    type="radio"
                    id="receiverMyself"
                    name="receiverType"
                    value="myself"
                    checked={receiverType === 'myself'}
                    onChange={(e) => onFieldChange('receiverType', e.target.value)}
                    className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                  />
                  <Label htmlFor="receiverMyself" className="cursor-pointer">Myself</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="radio"
                    id="receiverOther"
                    name="receiverType"
                    value="other"
                    checked={receiverType === 'other'}
                    onChange={(e) => onFieldChange('receiverType', e.target.value)}
                    className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                  />
                  <Label htmlFor="receiverOther" className="cursor-pointer">Other</Label>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="receiverName">Receiver Name</Label>
                  <Input
                    id="receiverName"
                    placeholder="Enter receiver name"
                    value={receiverName}
                    onChange={(e) => onFieldChange('receiverName', e.target.value)}
                    disabled={receiverType === 'myself'}
                  />
                </div>
                <div>
                  <Label htmlFor="receiverPhone">Receiver Mobile</Label>
                  <Input
                    id="receiverPhone"
                    placeholder="Enter receiver mobile"
                    value={receiverMobile}
                    onChange={(e) => {
                      const value = e.target.value.replace(/\D/g, '');
                      onFieldChange('receiverPhone', value);
                      setReceiverMobileError(validateMobile(value));
                    }}
                    type="tel"
                    disabled={receiverType === 'myself'}
                    className={receiverMobileError ? 'border-red-500' : ''}
                  />
                  {receiverMobileError && (
                    <p className="text-red-500 text-sm mt-1">{receiverMobileError}</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Add separator only if both vehicle and receiver fields are shown */}
        {/* {showVehicleFields && showReceiverFields && <hr className="border-gray-200" />} */}
      </CardContent>
    </Card>
  );
};