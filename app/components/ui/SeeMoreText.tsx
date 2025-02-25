import React, { useState } from 'react';

interface SeeMoreTextProps {
    text: string;
    maxLength?: number;
}

const SeeMoreText: React.FC<SeeMoreTextProps> = ({ 
    text, 
    maxLength = 100 
}) => {
    const [isExpanded, setIsExpanded] = useState(false);
    
    // If text is shorter than maxLength, just return it
    if (text.length <= maxLength) {
        return (
            <p className='text-xs font-medium text-[#7e7e7e]'>
                {text}
            </p>
        );
    }

    return (
        <div className='flex flex-col items-start gap-y-1 w-full'>
            <p className='text-xs font-medium text-[#7e7e7e]'>
                {isExpanded ? text : `${text.substring(0, maxLength)}...`}
            </p>
            <button 
                onClick={() => setIsExpanded(!isExpanded)}
                className='text-xs font-medium text-blue-500 hover:text-blue-800 transition-colors'
            >
                {isExpanded ? 'See Less' : 'See More'}
            </button>
        </div>
    );
};

export default SeeMoreText;