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

// Helper function to create a timezone-agnostic date representation (year, month, day)
const createDateKey = (date: Date): string => {
  return `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
};

// Helper function to create date with no time component
const normalizeDate = (date: Date): Date => {
  const normalizedDate = new Date(date);
  normalizedDate.setHours(0, 0, 0, 0);
  return normalizedDate;
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
  
  // Cache date keys for faster comparison
  const [selectedDateKeys, setSelectedDateKeys] = useState<Set<string>>(new Set());

  // Initialize state with proper date conversion
  useEffect(() => {
    if (initialSelectedDates && initialSelectedDates.length > 0) {
      // Ensure dates are properly normalized
      const processedDates = initialSelectedDates.map(date => 
        normalizeDate(date instanceof Date ? date : new Date(date))
      );
      setSelectedDates(processedDates);
      
      // Cache date keys
      const dateKeys = new Set(processedDates.map(date => createDateKey(date)));
      setSelectedDateKeys(dateKeys);

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
      // Ensure the time is set to noon to avoid timezone issues
      currentDate.setHours(12, 0, 0, 0);
      days.push(currentDate);
    }

    return days;
  };

  // Check if dates are the same day (timezone-agnostic)
  const isSameDay = (date1: Date, date2: Date): boolean => {
    return createDateKey(date1) === createDateKey(date2);
  };

  // Check if a date is selected
  const isDateSelected = (date: Date | null): boolean => {
    if (!date) return false;
    
    const dateKey = createDateKey(date);

    // For range mode during selection process
    if (mode === 'range' && rangeStart && hoverDate && selectedDates.length === 1) {
      const startKey = createDateKey(rangeStart);
      const hoverKey = createDateKey(hoverDate);
      
      // Construct simple date strings for comparison (YYYY-MM-DD)
      const startDate = `${rangeStart.getFullYear()}-${String(rangeStart.getMonth() + 1).padStart(2, '0')}-${String(rangeStart.getDate()).padStart(2, '0')}`;
      const endDate = `${hoverDate.getFullYear()}-${String(hoverDate.getMonth() + 1).padStart(2, '0')}-${String(hoverDate.getDate()).padStart(2, '0')}`;
      const currentDate = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
      
      // Check if date is within range (inclusive)
      return (startDate <= currentDate && currentDate <= endDate) || 
             (endDate <= currentDate && currentDate <= startDate);
    }

    // Fast check using the cached date keys
    if (selectedDateKeys.has(dateKey)) {
      return true;
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

    // If hovering during range selection
    if (rangeStart && hoverDate) {
      return isSameDay(date, rangeStart) || isSameDay(date, hoverDate);
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
      // Create simple date strings for comparison
      const rangeStartStr = `${rangeStart.getFullYear()}-${String(rangeStart.getMonth() + 1).padStart(2, '0')}-${String(rangeStart.getDate()).padStart(2, '0')}`;
      const hoverDateStr = `${hoverDate.getFullYear()}-${String(hoverDate.getMonth() + 1).padStart(2, '0')}-${String(hoverDate.getDate()).padStart(2, '0')}`;
      
      if (rangeStartStr <= hoverDateStr) {
        start = rangeStart;
        end = hoverDate;
      } else {
        start = hoverDate;
        end = rangeStart;
      }
    }
    // Then check for finalized range
    else if (selectedDates.length === 2) {
      const startDateStr = `${selectedDates[0].getFullYear()}-${String(selectedDates[0].getMonth() + 1).padStart(2, '0')}-${String(selectedDates[0].getDate()).padStart(2, '0')}`;
      const endDateStr = `${selectedDates[1].getFullYear()}-${String(selectedDates[1].getMonth() + 1).padStart(2, '0')}-${String(selectedDates[1].getDate()).padStart(2, '0')}`;
      
      if (startDateStr <= endDateStr) {
        start = selectedDates[0];
        end = selectedDates[1];
      } else {
        start = selectedDates[1];
        end = selectedDates[0];
      }
    } else {
      return false;
    }

    if (!start || !end) return false;

    // Create simple date strings for comparison
    const startStr = `${start.getFullYear()}-${String(start.getMonth() + 1).padStart(2, '0')}-${String(start.getDate()).padStart(2, '0')}`;
    const endStr = `${end.getFullYear()}-${String(end.getMonth() + 1).padStart(2, '0')}-${String(end.getDate()).padStart(2, '0')}`;
    const dateStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
    
    // Check if date is strictly between start and end (exclusive)
    return startStr < dateStr && dateStr < endStr;
  };

  // Check if date is before min date or after max date
  const isDateDisabled = (date: Date | null): boolean => {
    if (!date) return true;
    
    // Normalize dates for consistent comparison
    const normalizedDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    const normalizedMinDate = new Date(minDate.getFullYear(), minDate.getMonth(), minDate.getDate());
    const normalizedMaxDate = new Date(maxDate.getFullYear(), maxDate.getMonth(), maxDate.getDate());
    
    // Create simple date strings for comparison
    const dateStr = `${normalizedDate.getFullYear()}-${String(normalizedDate.getMonth() + 1).padStart(2, '0')}-${String(normalizedDate.getDate()).padStart(2, '0')}`;
    const minDateStr = `${normalizedMinDate.getFullYear()}-${String(normalizedMinDate.getMonth() + 1).padStart(2, '0')}-${String(normalizedMinDate.getDate()).padStart(2, '0')}`;
    const maxDateStr = `${normalizedMaxDate.getFullYear()}-${String(normalizedMaxDate.getMonth() + 1).padStart(2, '0')}-${String(normalizedMaxDate.getDate()).padStart(2, '0')}`;
    
    return dateStr < minDateStr || dateStr > maxDateStr;
  };

  // Handle date click based on mode
  const handleDateClick = (date: Date): void => {
    if (isDateDisabled(date)) return;

    // Create a new normalized date (noon time to avoid timezone issues)
    const clickedDate = new Date(date.getFullYear(), date.getMonth(), date.getDate(), 12, 0, 0, 0);
    let newSelectedDates: Date[] = [];

    if (mode === 'single') {
      newSelectedDates = [clickedDate];
    } else if (mode === 'multiple') {
      // Check if date is already selected using our date key comparison
      const clickedDateKey = createDateKey(clickedDate);
      const isAlreadySelected = selectedDateKeys.has(clickedDateKey);

      if (isAlreadySelected) {
        // Remove date if already selected
        newSelectedDates = selectedDates.filter(selectedDate => 
          !isSameDay(selectedDate, clickedDate)
        );
      } else {
        // Add date if not already selected
        newSelectedDates = [...selectedDates, clickedDate];
      }
    } else if (mode === 'range') {
      if (!rangeStart || selectedDates.length === 2) {
        // Start new range
        newSelectedDates = [clickedDate];
        setRangeStart(clickedDate);
      } else {
        // Complete the range
        // Create simple date strings for comparison
        const rangeStartStr = `${rangeStart.getFullYear()}-${String(rangeStart.getMonth() + 1).padStart(2, '0')}-${String(rangeStart.getDate()).padStart(2, '0')}`;
        const clickedDateStr = `${clickedDate.getFullYear()}-${String(clickedDate.getMonth() + 1).padStart(2, '0')}-${String(clickedDate.getDate()).padStart(2, '0')}`;
        
        let start: Date, end: Date;
        
        if (rangeStartStr <= clickedDateStr) {
          start = rangeStart;
          end = clickedDate;
        } else {
          start = clickedDate;
          end = rangeStart;
        }
        
        // For the onChange callback, just return the boundaries
        newSelectedDates = [start, end];
        setRangeStart(null);
      }
    }

    // Update selected dates and cache
    setSelectedDates(newSelectedDates);
    setSelectedDateKeys(new Set(newSelectedDates.map(date => createDateKey(date))));

    // Call onChange with new selected dates
    if (onChange) {
      onChange(newSelectedDates);
    }
  };

  // Handle mouse enter for range selection
  const handleMouseEnter = (date: Date, id: string): void => {
    setHoveredElement(id);
    if (mode === 'range' && rangeStart && !isDateDisabled(date)) {
      // Normalize the hovered date
      setHoverDate(new Date(date.getFullYear(), date.getMonth(), date.getDate(), 12, 0, 0, 0));
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

              // For debugging, add a data attribute with the date
              const dateDebug = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;

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
                  data-date={dateDebug}
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