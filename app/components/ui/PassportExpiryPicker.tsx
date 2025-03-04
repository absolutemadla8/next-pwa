'use client';

import React, { useState, useEffect } from 'react';
import CalendarList from './CalendarList';
import useBottomSheetStore from '@/app/store/bottomSheetStore';

interface PassportExpiryPickerProps {
  initialDate?: string;
  onDateSelect: (date: string) => void;
  guestIndex: number;
}

const PassportExpiryPicker: React.FC<PassportExpiryPickerProps> = ({ 
  initialDate,
  onDateSelect,
  guestIndex
}) => {
  const { closeSheet } = useBottomSheetStore();
  const [selectedDate, setSelectedDate] = useState<Date | null>(
    initialDate ? new Date(initialDate) : null
  );

  // Convert date to YYYY-MM-DD format
  const formatDateToYYYYMMDD = (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const handleDateChange = (dates: Date[]) => {
    if (dates.length > 0) {
      const selectedDate = dates[0];
      setSelectedDate(selectedDate);
      onDateSelect(formatDateToYYYYMMDD(selectedDate));
      
      // Close the sheet after selection
      closeSheet();
    }
  };

  return (
    <div className="flex flex-col w-full px-4 bg-white">
      <div className="my-4">
        <p className="text-xs text-blue-800 mb-2">
          Please select the passport expiry date. The passport must be valid for at least 6 months beyond your trip dates.
        </p>
      </div>
      
      <CalendarList
        mode="single"
        minDate={new Date()} // Current date as minimum
        maxDate={new Date(new Date().getFullYear() + 15, 11, 31)} // 15 years in the future
        initialSelectedDates={selectedDate ? [selectedDate] : []}
        onChange={handleDateChange}
        primaryColor="indigo-600"
        secondaryColor="indigo-200"
        hoverColor="indigo-50"
        monthsToShow={3}
      />
    </div>
  );
};

export default PassportExpiryPicker;