import React, { useState } from 'react';

// Define TypeScript interfaces for our data structure
interface Policy {
  type: string;
  text: string;
  id?: string; // Optional ID field
}

interface PolicyListProps {
  policies: Policy[];
  className?: string;
  collapsible?: boolean;
  initialExpandedState?: boolean;
  maxDisplayed?: number;
}

const PolicyList: React.FC<PolicyListProps> = ({ 
  policies, 
  className = '',
  collapsible = false,
  initialExpandedState = false,
  maxDisplayed = 3
}) => {
  const [expanded, setExpanded] = useState<boolean>(initialExpandedState);
  
  if (!policies || policies.length === 0) {
    return <div className="text-gray-500 italic">No policies available</div>;
  }

  const displayedPolicies = expanded ? policies : policies.slice(0, maxDisplayed);
  const hasMorePolicies = policies.length > maxDisplayed;

  return (
    <div className={`space-y-6 ${className}`}>
      {displayedPolicies.map((policy, index) => (
        <div 
          key={policy.id || `policy-${index}`} 
          className="policy-item border-b border-gray-100 pb-4 last:border-0"
        >
          <h3 style={{ fontFamily: 'var(--font-nohemi)' }} className="text-md text-blue-950 mb-2">{policy.type}</h3>
          <p className="text-slate-700 text-sm font-normal tracking-tight">{policy.text}</p>
        </div>
      ))}
      
      {collapsible && hasMorePolicies && (
        <button
          onClick={() => setExpanded(!expanded)}
          className="text-blue-600 hover:text-blue-800 font-medium flex items-center mt-2"
        >
          {expanded ? 'Show less' : `Show ${policies.length - maxDisplayed} more policies`}
        </button>
      )}
    </div>
  );
};

export default PolicyList;