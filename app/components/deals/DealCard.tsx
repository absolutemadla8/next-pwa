import { IconBolt, IconCircleCheckFilled, IconClock, IconHeart } from '@tabler/icons-react';
import { useRouter } from 'next/navigation';
import React from 'react';

interface DealCardProps {
  deal: any;
  onFavoritePress?: (dealId: string) => void;
  onPress?: (dealId: string) => void;
}

const DealCard: React.FC<DealCardProps> = ({ deal, onFavoritePress, onPress }) => {
  const router = useRouter();

  const handlePress = () => {
    if (onPress) {
      onPress(deal.id);
      console.log('Pressed Deal:', deal.id);
    } else {
      router.push(`/trippy/deals/${deal.id}`);
    }
  };

  // Calculate correct discount percentage
  const discountPercentage = Math.round(((deal.pricing - deal.discountedPrice) / deal.pricing) * 100);

  return (
    <div 
      onClick={handlePress}
      className="flex flex-col w-full items-start justify-start bg-white rounded-xl shadow-sm mb-6 cursor-pointer transition-transform duration-200 hover:scale-[1.02]"
    >
      {/* Image with gradient overlay */}
      <div 
        className="relative w-full h-[220px] rounded-t-xl overflow-hidden"
        style={{
          backgroundImage: `url(${deal.images[0]?.url})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-black/10 to-black/60">
          <div className="flex w-full flex-row items-start justify-between gap-x-2 p-4">
            <div className="flex flex-row items-center justify-start gap-x-2">
              {deal.isFlashDeal && (
                <div className="flex flex-row items-center justify-center gap-x-1.5 rounded-lg bg-white/90 backdrop-blur-sm px-3 py-2 border border-white/20">
                  <IconBolt color="#1A365D" size={16} />
                  <span className="font-semibold text-[#1A365D] text-xs">
                    Flash Deal
                  </span>
                </div>
              )}
              {deal.timeLeft && (
                <div className="flex flex-row items-center justify-center gap-x-1.5 rounded-lg bg-white/90 backdrop-blur-sm px-3 py-2 border border-white/20">
                  <IconClock color="#1A365D" size={16} />
                  <span className="font-semibold text-[#1A365D] text-xs">
                    {deal.timeLeft}
                  </span>
                </div>
              )}
            </div>
            <button 
              onClick={(e) => {
                e.stopPropagation();
                onFavoritePress?.(deal.id);
              }}
              className="p-2 rounded-full bg-white/20 backdrop-blur-sm"
            >
              <IconHeart color="#FFF" size={24}/>
            </button>
          </div>
          
          {/* Location displayed on the image with better visibility */}
          <div className="absolute bottom-0 left-0 w-full p-4">
            <span className="font-medium text-sm text-white bg-black/40 px-2 py-1 rounded">
              {deal.country}
            </span>
          </div>
        </div>
      </div>

      {/* Content section */}
      <div className="flex flex-col items-start justify-start gap-y-3 p-4 w-full">
        {/* Title and rating - now more prominent */}
        <div className="flex flex-col w-full mb-2">
          <h3 style={{ fontFamily: 'var(--font-nohemi)' }} className="font-normal text-blue-950 text-lg leading-tight mb-2">
            {deal.name}
          </h3>
          
          <div className="flex flex-row items-center justify-between w-full">
            <div className="bg-gradient-to-r from-[#E9F2FF] to-[#CCE0FF] py-1 px-3 rounded-md flex flex-row items-center gap-x-1 w-56 truncate text-ellipsis">
              <span className="font-semibold text-[#1D4F7B] text-xs">
                {deal.itineraries[0]?.name}
              </span>
            </div>
            
            <div className="flex flex-row items-center justify-start gap-x-1">
              {[...Array(5)].map((_, index) => (
                <svg 
                  key={index}
                  className={`w-4 h-4 ${index < Math.round(Number(deal.itineraries[0].property_rating)) ? 'text-[#030F57]' : 'text-[#F1F2F4]'}`}
                  fill="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                </svg>
              ))}
            </div>
          </div>
        </div>

        {/* Amenities */}
        <div className="flex flex-row flex-wrap items-center justify-start gap-x-3 gap-y-2 border-t border-gray-100 pt-3">
          {deal.inclusions.split(',').slice(0, 3).map((amenity:any, index:any) => (
            <div key={index} className="flex flex-row items-center justify-start gap-x-1.5">
              <IconCircleCheckFilled color="#2C7A7B" size={16}/>
              <span className="font-medium text-[#44546F] text-xs">
                {amenity.trim()}
              </span>
            </div>
          ))}
          {deal.inclusions.split(',').length > 3 && (
            <span className="text-blue-600 text-xs font-medium">
              +{deal.inclusions.split(',').length - 3} more
            </span>
          )}
        </div>

        {/* Price information */}
        <div className="flex flex-row items-center justify-between w-full border-t border-gray-100 pt-3 mt-1">
          <div className="flex flex-col">
            <div className="flex flex-row items-center gap-x-2">
              <span style={{ fontFamily: 'var(--font-nohemi)' }} className="font-normal text-[#718096] text-sm line-through">
                ₹{deal.pricing.toLocaleString()}
              </span>
              <span style={{ fontFamily: 'var(--font-nohemi)' }} className="font-normal text-[#1A365D] text-xl">
                ₹{deal.discountedPrice.toLocaleString()}
              </span>
            </div>
            <p className="font-medium text-[#44546F] text-xs mt-1">
              <span className="font-semibold text-[#0C66E4]">{deal.unit}</span> {deal.taxIncluded ? 'inclusive of all taxes & fee' : '+ taxes & fees'}
            </p>
          </div>
          
          <div className="bg-gradient-to-r from-[#0C66E4] to-[#1D7AFC] py-1.5 px-3 rounded-md">
            <span style={{ fontFamily: 'var(--font-nohemi)' }} className="font-normal text-white text-xs">
              {discountPercentage.toFixed()}% OFF
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DealCard;