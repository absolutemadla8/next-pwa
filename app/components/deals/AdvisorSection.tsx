import React from 'react';
import SeeMoreText from '../ui/SeeMoreText';

interface Advisor {
  name: string;
  description: string;
  pictureUrl: string;
}

interface AdvisorSectionProps {
  advisor: Advisor;
}

const AdvisorSection: React.FC<AdvisorSectionProps> = ({ advisor }) => {
  return (
    <div className="flex flex-col w-full h-fit rounded-lg bg-white">
      <div className="bg-gradient-to-r rounded-t-lg from-[#030F57] to-[#0C66E4] px-4 py-2">
        <span style={{ fontFamily: 'var(--font-nohemi)' }} className="text-white text-sm">
          Your Personal Travel Advisor
        </span>
      </div>

      <div className="flex flex-row p-4 gap-4">
        <div className="relative w-20 h-20">
          <img
            src={advisor.pictureUrl}
            alt={advisor.name}
            className="w-full h-full rounded-full border-3 border-slate-50 object-cover"
          />
          
          <div className="absolute -right-1 -bottom-2 bg-gray-800 px-2 py-1 rounded-full border-2 border-white">
            <span className="text-white text-xs tracking-tight font-semibold">
              Advisor
            </span>
          </div>
        </div>

        <div className="flex flex-col gap-1 flex-1">
          <h3 style={{ fontFamily: 'var(--font-nohemi)' }} className="text-blue-950 text-lg">
            {advisor.name}
          </h3>
          <span className="text-blue-600 text-xs font-medium tracking-tight">
            Co-Founder @ Often
          </span>
          
          <SeeMoreText text={advisor.description} />
        </div>
      </div>
    </div>
  );
};

export default AdvisorSection;