import React from 'react';

// Define TypeScript interfaces for our data structure
interface Review {
  rating: string | number;
  count: number;
}

interface HotelRatingProps {
  reviews?: Review[] | null;
}

const HotelRating: React.FC<HotelRatingProps> = ({ reviews }) => {
  // Function to determine color based on rating
  const getRatingColor = (rating: number): string => {
    if (rating >= 4.0) return 'bg-emerald-600'; // green
    if (rating >= 3.5) return 'bg-blue-500';    // blue
    if (rating >= 3.0) return 'bg-amber-500';   // orange
    return 'bg-red-500';                        // red
  };

  // Function to determine text color based on rating
  const getRatingTextColor = (rating: number): string => {
    if (rating >= 4.0) return 'text-emerald-600'; // green
    if (rating >= 3.5) return 'text-blue-500';    // blue
    if (rating >= 3.0) return 'text-amber-500';   // orange
    return 'text-red-500';                        // red
  };

  // Function to determine rating text based on score
  const getRatingText = (rating: number): string => {
    if (rating >= 4.0) return 'Excellent';
    if (rating >= 3.5) return 'Very Good';
    if (rating >= 3.0) return 'Good';
    return 'Fair';
  };

  // Safely parse rating with fallback to 0
  const rating = parseFloat(String(reviews?.[0]?.rating || '0'));
  
  return (
    <div className="flex flex-row items-center justify-start gap-x-4">
      <div className={`flex flex-col items-center justify-center size-16 rounded-xl ${getRatingColor(rating)}`}>
        <span style={{ fontFamily: 'var(--font-nohemi)' }} className=" text-white text-xl">
          {reviews?.[0]?.rating || 0}
        </span>
      </div>
      <div className="flex flex-col items-start justify-start">
        <span style={{ fontFamily: 'var(--font-nohemi)' }} className={`font-medium text-base ${getRatingTextColor(rating)}`}>
          {getRatingText(rating)}
        </span>
        <span className="font-semibold text-slate-800 text-xs max-w-xs tracking-tight">
          <span style={{ fontFamily: 'var(--font-nohemi)' }} className="font-bold text-slate-800 text-xs">
            {reviews?.[0]?.count || 0}
          </span>
          {" travelers have shared their experiences at this property"}
        </span>
      </div>
    </div>
  );
};

export default HotelRating;