'use client'

import React, { useState, useEffect, useMemo, ReactNode } from 'react';

interface CalendarListProps {
  minDate?: Date;
  maxDate?: Date;
  mode?: 'single' | 'multiple' | 'range';
  initialSelectedDates?: Date[];
  onChange?: (dates: Date[]) => void;
  monthsToShow?: number;
  primaryColor?: string; // Hex color
  secondaryColor?: string; // Hex color
  hoverColor?: string; // Hex color
  dateSlots?: { [key: string]: ReactNode };
}

const DEFAULT_COLORS = {
  primary: '#10b981', // green-500 equivalent
  secondary: '#d1fae5', // green-100 equivalent
  hover: '#ecfdf5', // green-50 equivalent
  text: {
    default: '#1e293b', // slate-800 equivalent
    disabled: '#94a3b8', // slate-400 equivalent
    selected: '#22AB78', // white for selected dates
    inRange: '#22AB78'  // green-700 for dates in range
  }
};

const CalendarList: React.FC<CalendarListProps> = ({
  minDate = new Date(new Date().getFullYear(), new Date().getMonth() - 1, 1),
  maxDate = new Date(new Date().getFullYear(), new Date().getMonth() + 12, 0),
  mode = 'single',
  initialSelectedDates = [],
  onChange,
  monthsToShow = 12,
  primaryColor = DEFAULT_COLORS.primary,
  secondaryColor = DEFAULT_COLORS.secondary,
  hoverColor = DEFAULT_COLORS.hover,
  dateSlots = {}
}) => {
  // State for selected dates
  const [selectedDates, setSelectedDates] = useState<Date[]>([]);
  const [hoverDate, setHoverDate] = useState<Date | null>(null);
  const [rangeStart, setRangeStart] = useState<Date | null>(null);
  const [hoveredElement, setHoveredElement] = useState<string | null>(null);

  // Initialize state with proper date conversion
  useEffect(() => {
    if (initialSelectedDates && initialSelectedDates.length > 0) {
      // Ensure dates are properly converted if they're strings
      const processedDates = initialSelectedDates.map(date => 
        date instanceof Date ? date : new Date(date)
      );
      setSelectedDates(processedDates);

      // For range mode, set the range start if we have initial dates
      if (mode === 'range' && processedDates.length === 1) {
        setRangeStart(processedDates[0]);
      }
    }
  }, []);  // Only run on initial mount

  // Generate array of months to display
  const months = useMemo(() => {
    const result: Date[] = [];
    const startMonth = new Date(minDate);
    startMonth.setDate(1); // Start from the first day of the month

    for (let i = 0; i < monthsToShow; i++) {
      const monthStart = new Date(startMonth);
      monthStart.setMonth(monthStart.getMonth() + i);

      // Skip if beyond max date
      if (monthStart > maxDate) break;

      result.push(monthStart);
    }
    return result;
  }, [minDate, maxDate, monthsToShow]);

  // Helper to format date to YYYY-MM-DD for comparison
  const formatDateKey = (date: Date): string => {
    return date.toISOString().split('T')[0];
  };

  // Generate days for a specific month
  const generateDays = (monthDate: Date): (Date | null)[] => {
    const month = monthDate.getMonth();
    const year = monthDate.getFullYear();

    // Get first day of month
    const firstDay = new Date(year, month, 1);
    // Get last day of month
    const lastDay = new Date(year, month + 1, 0);

    // Create array for all days and prefill with nulls for days before first day of month
    const days: (Date | null)[] = Array(firstDay.getDay()).fill(null);

    // Fill in the days of the month
    for (let i = 1; i <= lastDay.getDate(); i++) {
      const currentDate = new Date(year, month, i);
      days.push(currentDate);
    }

    return days;
  };

  // Check if dates are the same day
  const isSameDay = (date1: Date, date2: Date): boolean => {
    return (
      date1.getDate() === date2.getDate() &&
      date1.getMonth() === date2.getMonth() &&
      date1.getFullYear() === date2.getFullYear()
    );
  };

  // Check if a date is selected
  const isDateSelected = (date: Date | null): boolean => {
    if (!date) return false;

    // For range mode during selection process
    if (mode === 'range' && rangeStart && hoverDate && selectedDates.length === 1) {
      const start = rangeStart < hoverDate ? rangeStart : hoverDate;
      const end = rangeStart < hoverDate ? hoverDate : rangeStart;
      return date >= start && date <= end;
    }

    // Regular selection check
    return selectedDates.some(selectedDate => isSameDay(selectedDate, date));
  };

  // Check if a date is the start or end of a range OR the first selected date in a range
  const isRangeEdge = (date: Date | null): boolean => {
    if (mode !== 'range' || !date) return false;

    // Complete range case (two dates selected)
    if (selectedDates.length === 2) {
      return isSameDay(date, selectedDates[0]) || isSameDay(date, selectedDates[1]);
    }

    // First date in range selection process
    if (selectedDates.length === 1 && rangeStart) {
      return isSameDay(date, rangeStart);
    }

    return false;
  };

  // Check if a date is between range start and end
  const isInRange = (date: Date | null): boolean => {
    if (mode !== 'range' || !date) return false;

    let start: Date | null = null;
    let end: Date | null = null;

    // Check for temporary hover range first
    if (rangeStart && hoverDate) {
      start = rangeStart < hoverDate ? rangeStart : hoverDate;
      end = rangeStart < hoverDate ? hoverDate : rangeStart;
    }
    // Then check for finalized range
    else if (selectedDates.length === 2) {
      start = selectedDates[0];
      end = selectedDates[1];
    } else {
      return false;
    }

    if (!start || !end) return false;

    const dateTime = date.getTime();
    return dateTime > start.getTime() && dateTime < end.getTime();
  };

  // Check if date is before min date or after max date
  const isDateDisabled = (date: Date | null): boolean => {
    if (!date) return true;
    
    // Start of day comparison to allow selecting today
    const dateAtStartOfDay = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    const minDateAtStartOfDay = new Date(minDate.getFullYear(), minDate.getMonth(), minDate.getDate());
    const maxDateAtStartOfDay = new Date(maxDate.getFullYear(), maxDate.getMonth(), maxDate.getDate());
    
    return dateAtStartOfDay < minDateAtStartOfDay || dateAtStartOfDay > maxDateAtStartOfDay;
  };

  // Handle date click based on mode
  const handleDateClick = (date: Date): void => {
    if (isDateDisabled(date)) return;

    let newSelectedDates = [...selectedDates];

    if (mode === 'single') {
      newSelectedDates = [date];
    } else if (mode === 'multiple') {
      // Check if date is already selected
      const isAlreadySelected = newSelectedDates.some(selectedDate => 
        isSameDay(selectedDate, date)
      );

      if (isAlreadySelected) {
        // Remove date if already selected
        newSelectedDates = newSelectedDates.filter(selectedDate => 
          !isSameDay(selectedDate, date)
        );
      } else {
        // Add date if not already selected
        newSelectedDates.push(date);
      }
    } else if (mode === 'range') {
      if (!rangeStart || selectedDates.length === 2) {
        // Start new range
        newSelectedDates = [date];
        setRangeStart(date);
      } else {
        // Complete the range
        const start = rangeStart < date ? rangeStart : date;
        const end = rangeStart < date ? date : rangeStart;
        newSelectedDates = [start, end];
        setRangeStart(null);
      }
    }

    setSelectedDates(newSelectedDates);

    // Call onChange with new selected dates
    if (onChange) {
      onChange(newSelectedDates);
    }
  };

  // Handle mouse enter for range selection
  const handleMouseEnter = (date: Date, id: string): void => {
    setHoveredElement(id);
    if (mode === 'range' && rangeStart && !isDateDisabled(date)) {
      setHoverDate(date);
    }
  };

  // Handle mouse leave for range selection
  const handleMouseLeave = (): void => {
    setHoveredElement(null);
    setHoverDate(null);
  };

  // Get day name abbreviations
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div className="w-full px-4 h-[calc(100vh-200px)] overflow-y-auto">
      {months.map((month, monthIndex) => (
        <div 
          key={`${month.getFullYear()}-${month.getMonth()}`}
          className="mb-8"
        >
          <h2 
            className="text-lg mb-4"
            style={{ 
              fontFamily: 'var(--font-nohemi)',
              color: DEFAULT_COLORS.text.default
            }}
          >
            {month.toLocaleString('default', { month: 'long', year: 'numeric' })}
          </h2>

          <div className="grid grid-cols-7 mb-2">
            {dayNames.map((day, i) => (
              <div 
                key={i} 
                className="text-center text-sm font-normal tracking-tight"
                style={{ 
                  fontFamily: 'var(--font)',
                  color: DEFAULT_COLORS.text.default
                }}
              >
                {day}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-1">
            {generateDays(month).map((date, dateIndex) => {
              if (!date) {
                return <div key={`empty-${dateIndex}`} className="h-16 p-1"></div>;
              }

              const isSelected = isDateSelected(date);
              const isDisabled = isDateDisabled(date);
              const isEdge = isRangeEdge(date);
              const inRange = isInRange(date);
              const dateKey = formatDateKey(date);
              const hasContent = dateSlots[dateKey];
              const dateId = `date-${dateKey}`;
              const isHovered = hoveredElement === dateId;

              // Container styles
              const containerStyles: React.CSSProperties = {
                transition: 'all 0.2s ease',
                height: '4rem',
                padding: '0.25rem',
                position: 'relative',
                borderRadius: '0.25rem',
              };

              // Date number styles
              const dateNumberStyles: React.CSSProperties = {
                fontFamily: 'var(--font-nohemi)',
                textAlign: 'center',
                fontWeight: 500
              };

              if (isDisabled) {
                containerStyles.color = DEFAULT_COLORS.text.disabled;
                containerStyles.cursor = 'not-allowed';
                dateNumberStyles.color = DEFAULT_COLORS.text.disabled;
              } else {
                containerStyles.cursor = 'pointer';
                dateNumberStyles.color = DEFAULT_COLORS.text.default;

                // Apply range background if in range
                if (inRange) {
                  containerStyles.backgroundColor = "#D6EFDD";
                  dateNumberStyles.color = DEFAULT_COLORS.text.inRange;
                }

                // Apply edge styling if it's the start or end of the range
                if (isEdge) {
                  containerStyles.backgroundColor = DEFAULT_COLORS.text.inRange;
                  dateNumberStyles.color = '#FFFFFF';
                }

                // Apply selection styling for single/multiple modes
                if (isSelected && mode !== 'range') {
                  containerStyles.backgroundColor = DEFAULT_COLORS.text.inRange;
                  dateNumberStyles.color = '#FFFFFF';
                }

                // Apply hover styling if not selected or in range
                if (isHovered && !isSelected && !inRange && !isDisabled) {
                  containerStyles.backgroundColor = hoverColor;
                }
              }

              return (
                <div
                  id={dateId}
                  key={dateKey}
                  style={containerStyles}
                  onClick={() => !isDisabled && handleDateClick(date)}
                  onMouseEnter={() => handleMouseEnter(date, dateId)}
                  onMouseLeave={handleMouseLeave}
                >
                  <div style={dateNumberStyles}>
                    {date.getDate()}
                  </div>

                  {/* Container for custom date content */}
                  <div className="mt-1 h-8 overflow-hidden">
                    {hasContent && dateSlots[dateKey]}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
};

export default CalendarList;