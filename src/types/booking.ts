export interface BookingData {
  categoryId: string;
  subcategoryId: string;
  subSubcategoryId?: string;
  subcategoryName: string;
  subSubcategoryName?: string;
  fromLocation: string;
  toLocation: string;
  carType: string;
  transmissionType: string;
  selectedDate: string;
  selectedTime: string;
}

export interface SubcategoryFormProps {
  bookingData: BookingData;
  onFieldChange: (field: string, value: any) => void;
  onNext: () => void;
  isValid: boolean;
}

export type SubcategoryType = 'one-way' | 'hourly' | 'round-trip';