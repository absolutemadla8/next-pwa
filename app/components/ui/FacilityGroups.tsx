import React from 'react';
import { Check } from 'lucide-react';

// Define TypeScript interfaces for our data structures
interface Facility {
  id: string;
  groupId: string;
  name: string;
}

interface FacilityGroup {
  id: string;
  name: string;
  culture: string;
  type: string;
}

interface FacilityGroupsProps {
  facilities: Facility[];
  facilityGroups: FacilityGroup[];
}

const FacilityGroups: React.FC<FacilityGroupsProps> = ({ facilities, facilityGroups }) => {
  // Create a map of groupId to facilities
  const groupedFacilities: Record<string, Facility[]> = facilities.reduce((acc: Record<string, Facility[]>, facility) => {
    if (!acc[facility.groupId]) {
      acc[facility.groupId] = [];
    }
    acc[facility.groupId].push(facility);
    return acc;
  }, {});

  return (
    <div className="w-full max-w-4xl mx-auto p-4 space-y-6">
      {facilityGroups.map((group) => {
        const facilitiesInGroup = groupedFacilities[group.id] || [];
        
        // Only display groups that have facilities
        if (facilitiesInGroup.length === 0) return null;
        
        return (
          <div key={group.id} className="">
            <h2 style={{ fontFamily: 'var(--font-nohemi)' }} className="text-md mb-4 text-gray-800">{group.name}</h2>
            <div className="space-y-2">
              {facilitiesInGroup.map((facility) => (
                <div key={facility.id} className="flex items-center space-x-2">
                  <Check className="h-5 w-5 text-green-600 flex-shrink-0" />
                  <span className="text-slate-700 text-md tracking-tight">{facility.name}</span>
                </div>
              ))}
            </div>
          </div>
        );
      })}
      
      {/* Handle facilities with groupIds that don't match any facilityGroup */}
      {(() => {
        const unmatchedFacilities = facilities.filter(
          facility => !facilityGroups.some(group => group.id === facility.groupId)
        );
        
        if (unmatchedFacilities.length === 0) return null;
        
        return (
          <div className="">
            <h2 style={{ fontFamily: 'var(--font-nohemi)' }} className="text-md mb-4 text-gray-800">Other Facilities</h2>
            <div className="space-y-2">
              {unmatchedFacilities.map((facility) => (
                <div key={facility.id} className="flex items-center space-x-2">
                  <Check className="h-5 w-5 text-green-600 flex-shrink-0" />
                  <span className="text-gray-700 tracking-tight">{facility.name}</span>
                </div>
              ))}
            </div>
          </div>
        );
      })()}
      
      {/* Display a message if no facilities are available */}
      {facilities.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          No facilities available.
        </div>
      )}
    </div>
  );
};

export default FacilityGroups;