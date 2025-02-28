import { Delete, Minus, MinusCircle, Plus, X } from 'lucide-react';
import React from 'react';

// Define types for our data structures
interface Child {
  id?: string;
  age: number;
}

interface Room {
  id: string;
  adults: number;
  children: Child[];
}

interface Itinerary {
  rooms: Room[];
}

// Props interface for the component
interface RoomConfigurationProps {
  itinerary: Itinerary;
  addRoomToItinerary: () => void;
  removeRoomFromItinerary: (roomId: string) => void;
  increaseAdultsInRoom: (roomId: string) => void;
  decreaseAdultsInRoom: (roomId: string) => void;
  addChildToRoom: (roomId: string, age: number) => void;
  removeChildFromRoom: (roomId: string, childIndex: number) => void;
}

const RoomConfiguration: React.FC<RoomConfigurationProps> = ({ 
  itinerary, 
  addRoomToItinerary, 
  removeRoomFromItinerary, 
  increaseAdultsInRoom, 
  decreaseAdultsInRoom, 
  addChildToRoom, 
  removeChildFromRoom 
}) => {
  const handleAgeChange = (roomId: string, index: number, age: string): void => {
    const numericAge = parseInt(age) || 0;
    if (numericAge >= 0 && numericAge <= 17) {
      removeChildFromRoom(roomId, index);
      addChildToRoom(roomId, numericAge);
    }
  };

  return (
    <div className="bg-gray-100 px-4 rounded-lg">
      <div className="space-y-4">
        {itinerary.rooms.map((room, roomIndex) => (
          <div key={room.id} className="bg-white rounded-xl p-4">
            <div className="flex justify-between items-center pb-3 mb-4 border-b border-gray-200">
              <h3 style={{ fontFamily: 'var(--font-nohemi)' }} className=" text-gray-800">Room {roomIndex + 1}</h3>
              {itinerary.rooms.length > 1 && (
                <button 
                  onClick={() => removeRoomFromItinerary(room.id)}
                  className="p-2 text-red-500 hover:text-red-600"
                  aria-label="Remove room"
                >
                  <X size={20} className=' text-rose-600' />
                </button>
              )}
            </div>

            {/* Adults Counter */}
            <div className="mb-5">
              <label className="block text-sm font-medium text-slate-600 mb-3 tracking-tight">Adults</label>
              <div className="flex items-center gap-6">
                <button 
                  onClick={() => decreaseAdultsInRoom(room.id)}
                  disabled={room.adults <= 1}
                  className={`p-2 ${room.adults > 1 ? 'text-purple-900' : 'text-gray-300'} rounded-full transition-colors bg-blue-950`}
                  aria-label="Decrease adults"
                >
                  <Minus size={14} className='text-white' />
                </button>
                <span style={{ fontFamily: 'var(--font-nohemi)' }} className="font-medium text-lg text-gray-800 min-w-10 text-center">{room.adults}</span>
                <button 
                  onClick={() => increaseAdultsInRoom(room.id)}
                  disabled={room.adults >= 3}
                  className={`p-2 ${room.adults < 3 ? 'text-purple-900' : 'text-gray-300'} rounded-full transition-colors bg-blue-950`}
                  aria-label="Increase adults"
                >
                  <Plus size={14} className='text-white' />
                </button>
              </div>
            </div>

            {/* Children Management */}
            <div className="pt-4">
              <label className="block text-sm font-medium text-slate-600 mb-3 tracking-tight">Children (0-17 years)</label>
              
              {room.children.map((child, childIndex) => (
                <div key={childIndex} className="flex items-center gap-3 mb-3">
                  <input
                    type="number"
                    className="border border-gray-200 rounded-lg py-2 px-3 w-20 text-gray-800 text-center"
                    value={child.age.toString()}
                    onChange={(e) => handleAgeChange(room.id, childIndex, e.target.value)}
                    min={0}
                    max={17}
                    placeholder="Age"
                    aria-label="Child age"
                  />
                  <button 
                    onClick={() => removeChildFromRoom(room.id, childIndex)}
                    className="p-2 text-red-500 hover:text-red-600"
                    aria-label="Remove child"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </button>
                </div>
              ))}
              
              {room.children.length < 2 && (
                <button 
                  className="flex items-center gap-2 text-blue-950 bg-slate-100 py-2 px-3 rounded-full"
                  onClick={() => addChildToRoom(room.id, 0)}
                  aria-label="Add child"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  <span className="font-medium text-sm ">Add Child</span>
                </button>
              )}
            </div>
          </div>
        ))}

        <button 
          className="flex items-center justify-center gap-3 text-blue-600 hover:text-blue-700 w-full py-3"
          onClick={addRoomToItinerary}
          disabled={itinerary.rooms.length >= 5}
          aria-label="Add another room"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          <span className="font-medium">Add Another Room</span>
        </button>
      </div>
    </div>
  );
};

export default RoomConfiguration;