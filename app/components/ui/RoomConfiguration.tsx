import { ChevronDown, Delete, Minus, MinusCircle, Plus, X } from 'lucide-react';
import React, { useState } from 'react';
import { Listbox, ListboxButton, ListboxOptions, ListboxOption } from '@headlessui/react';

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

interface RoomConfigurationProps {
  itinerary: Itinerary;
  addRoomToItinerary: () => void;
  removeRoomFromItinerary: (roomId: string) => void;
  increaseAdultsInRoom: (roomId: string) => void;
  decreaseAdultsInRoom: (roomId: string) => void;
  addChildToRoom: (roomId: string, age: number) => void;
  removeChildFromRoom: (roomId: string, childIndex: number) => void;
  onClose?: () => void; // Optional onClose prop for the DONE button
}

const RoomConfiguration: React.FC<RoomConfigurationProps> = ({ 
  itinerary, 
  addRoomToItinerary, 
  removeRoomFromItinerary, 
  increaseAdultsInRoom, 
  decreaseAdultsInRoom, 
  addChildToRoom, 
  removeChildFromRoom,
  onClose
 }) => {
  const handleAgeChange = (roomId: string, index: number, age: string): void => {
    const numericAge = parseInt(age) || 0;
    if (numericAge >= 0 && numericAge <= 17) {
      removeChildFromRoom(roomId, index);
      addChildToRoom(roomId, numericAge);
    }
  };

  return (
    <div className="px-4 rounded-lg pb-24">
      <div className="space-y-4">
        {itinerary.rooms.map((room, roomIndex) => (
          <div key={room.id} className="bg-white border border-gray-100 shadow-sm rounded-xl p-4">
            <div className="flex justify-between items-center pb-3 mb-4 border-b border-gray-200">
              <h3 style={{ fontFamily: 'var(--font-domine)' }} className=" text-gray-800 lowercase">Room {roomIndex + 1}</h3>
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
            <div className="flex flex-row items-center justify-between mb-5">
              <label className="block text-sm font-medium text-slate-600 mb-3 tracking-tight">Adults</label>
              <div className="flex items-center gap-6">
                <button 
                  onClick={() => decreaseAdultsInRoom(room.id)}
                  disabled={room.adults <= 1}
                  className={`p-2 ${room.adults > 1 ? 'text-purple-900' : 'text-gray-300'} rounded-full transition-colors bg-primary`}
                  aria-label="Decrease adults"
                >
                  <Minus size={14} className='text-white' />
                </button>
                <span style={{ fontFamily: 'var(--font-nohemi)' }} className="font-medium text-lg text-gray-800 min-w-10 text-center">{room.adults}</span>
                <button 
                  onClick={() => increaseAdultsInRoom(room.id)}
                  disabled={room.adults >= 3}
                  className={`p-2 ${room.adults < 3 ? 'text-purple-900' : 'text-gray-300'} rounded-full transition-colors bg-primary`}
                  aria-label="Increase adults"
                >
                  <Plus size={14} className='text-white' />
                </button>
              </div>
            </div>

            {/* Children Management */}
            <div className="pt-4">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-slate-600 mb-3 tracking-tight">Children</label>
                <div className="flex items-center gap-6">
                  <button 
                    onClick={() => room.children.length > 0 && removeChildFromRoom(room.id, room.children.length - 1)}
                    disabled={room.children.length === 0}
                    className={`p-2 ${room.children.length > 0 ? 'text-purple-900' : 'text-gray-300'} rounded-full transition-colors bg-primary`}
                    aria-label="Decrease children"
                  >
                    <Minus size={14} className='text-white' />
                  </button>
                  <span style={{ fontFamily: 'var(--font-nohemi)' }} className="font-medium text-lg text-gray-800 min-w-10 text-center">{room.children.length}</span>
                  <button 
                    onClick={() => addChildToRoom(room.id, 0)}
                    disabled={room.children.length >= 2}
                    className={`p-2 ${room.children.length < 2 ? 'text-purple-900' : 'text-gray-300'} rounded-full transition-colors bg-primary`}
                    aria-label="Increase children"
                  >
                    <Plus size={14} className='text-white' />
                  </button>
                </div>
              </div>
              
              {room.children.length > 0 && (
                <div className="mt-3 mb-3 p-4 bg-[#F4F2EB] rounded-xl">
                  <p className="text-sm font-medium text-slate-600 mb-4">Age of Children</p>
                  {room.children.map((child, childIndex) => (
                      <div key={childIndex} className="mb-4 last:mb-0">
                        <div className="flex flex-col">
                          <label className="text-sm font-medium text-slate-600 mb-2">Child {childIndex + 1}</label>
                          <Listbox
                            value={child.age.toString()}
                            onChange={(value) => handleAgeChange(room.id, childIndex, value)}
                          >
                            <div className="relative">
                              <ListboxButton
                                className="appearance-none w-full bg-white border border-gray-200 rounded-lg py-3 px-4 pr-8 text-left text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 relative"
                              >
                                <span className="block truncate">{child.age} {child.age === 1 ? 'year' : 'years'}</span>
                                <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                                  <ChevronDown size={18} />
                                </span>
                              </ListboxButton>
                              <ListboxOptions className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                                {[...Array(18)].map((_, age) => (
                                  <ListboxOption
                                    key={age}
                                    value={age.toString()}
                                    className={({ active }) =>
                                      `cursor-default select-none relative py-2 px-4 ${active ? 'bg-blue-100 text-blue-900' : 'text-gray-900'}`
                                    }
                                  >
                                    {({ selected, active }) => (
                                      <>
                                        <span
                                          className={`block truncate ${selected ? 'font-medium' : 'font-normal'}`}
                                        >
                                          {age} {age === 1 ? 'year' : 'years'}
                                        </span>
                                      </>
                                    )}
                                  </ListboxOption>
                                ))}
                              </ListboxOptions>
                            </div>
                          </Listbox>
                        </div>
                      </div>
                  ))}
                  <p className="text-xs text-gray-500 mt-2">Please provide right number of children along with their right age for best options and prices.</p>
                </div>
              )}
            </div>
          </div>
        ))}

      <div className="mt-4">
        {itinerary.rooms.length < 5 ? (
          <button 
            className="flex items-center justify-center gap-3 text-[#1999F5] w-full py-3"
            onClick={addRoomToItinerary}
            disabled={itinerary.rooms.length >= 5}
            aria-label="Add another room"
          >
            <Plus size={18} />
            <span className="font-medium tracking-tight">add another room</span>
          </button>
        ) : (
          <div className="text-center py-2">
            <p className="text-sm text-gray-500">Maximum 5 rooms allowed per booking</p>
          </div>
        )}
      </div>

      <div className="fixed bottom-0 left-0 right-0 py-4 px-4 bg-white border-t border-gray-200 z-10 md:max-w-md mx-auto">
        <button 
          className="w-full py-3 px-4 bg-[#1999F5] text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors tracking-tight"
          onClick={onClose}
        >
          done
        </button>
      </div>
      </div>
    </div>
  );
};

export default RoomConfiguration;