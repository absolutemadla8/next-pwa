'use client'
import RoomRateCard from '@/app/components/stays/RoomRateCard'
import StayInformationHeader from '@/app/components/stays/StayInformationHeader'
import { useRoomStore } from '@/app/store/roomRateStore'
import React, { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import AnimatedButton from '@/app/components/ui/AnimatedButton'
import useItineraryStore from '@/app/store/itineraryStore'
import { SelectRoomRatesPayload } from '@/app/types/roomRate'
import { api } from '@/app/lib/axios'
import { formatDate } from '@/app/lib/utils'
import useBottomOrderStore from '@/app/store/bottomOrderStore'
import { validateRateSelection, getCompatibleRates } from '@/app/lib/roomValidation';

const Page = () => {
  const params = useParams();
  const [selectedPrice, setSelectedPrice] = React.useState(0);
  const { 
    rooms, 
    itineraryId, 
    traceId, 
    type, 
    compatibleRates,
    selectedRateIds,
    recommendations,
    addSelectedRateId,
    clearSelectedRateIds,
    setCompatibleRates
  } = useRoomStore();
  
  const [loading, setLoading] = useState(false);
  const [currentRoomIndex, setCurrentRoomIndex] = useState(0);
  const [isMultiRoom, setIsMultiRoom] = useState(false);
  const [error, setError] = useState('');
  const [currentRecommendationId, setCurrentRecommendationId] = useState('');
  const {setButtonText, setHandleCreateItinerary, setInfoSubtitle, setInfoTitle} = useBottomOrderStore();
  const {itinerary, setRecommendationId, setRoomDetails, getTotalPrice} = useItineraryStore();
  const router = useRouter();

  // Check if we're dealing with multiple rooms
  useEffect(() => {
    // Set multi-room mode based on the number of rooms in the itinerary
    const numRoomsInItinerary = itinerary.rooms.length;
    
    if (numRoomsInItinerary > 1) {
      setIsMultiRoom(true);
      clearSelectedRateIds(); // Reset selected rates when component mounts
    } else {
      setIsMultiRoom(false);
    }
  }, [itinerary.rooms.length, clearSelectedRateIds]);
  
  // Function to get current room to display
  const getCurrentRoom = () => {
    // If we have compatible rates and we're past the first room, show those
    if (currentRoomIndex > 0 && compatibleRates && compatibleRates.length > 0) {
      return compatibleRates;
    }
    
    // For first room or when there are no compatible rates, show original rooms
    // If multi-room selection and we're not showing all rooms at once, show just 
    // the first filtered subset of available rooms
    if (isMultiRoom && rooms.length > 0) {
      // Here the idea is to show relevant room options for the current room selection
      // This way we can present the most suitable options for each room rather than
      // showing all available rooms for each selection
      return rooms;
    }
    
    // Otherwise show all the original rooms (for single room selection)
    return rooms;
  };
  
  // Handle rate selection for a room
  const handleRateSelection = async (roomId: string, rateId: string, recommendationId: string, price: number) => {
    // Single room selection - just update the details
    if (!isMultiRoom) {
      // Update room details in the itinerary store
      itinerary.rooms.forEach(room => {
        setRoomDetails(room.id, { rateId, roomId, price });
        setRecommendationId(recommendationId);
      });
      
      // Update total price
      const totalPrice = getTotalPrice();
      setSelectedPrice(totalPrice);
      
      // Store the current recommendation ID
      setCurrentRecommendationId(recommendationId);
      return;
    }
    
    // Multi-room selection flow
    console.log(`Selected rate for room ${currentRoomIndex + 1}: ${rateId}`);
    
    // Clear any error
    setError('');

    // Always ensure we have the right number of rate IDs
    const updatedRateIds = [...selectedRateIds];
    
    // Add empty strings if we need to fill the array to the current index
    // This happens if we've jumped ahead in the room selection
    while (updatedRateIds.length < currentRoomIndex) {
      updatedRateIds.push('');
      console.log(`Adding empty rate ID for room ${updatedRateIds.length}`);
    }
    
    // Update or append the rate ID for the current room
    if (updatedRateIds.length <= currentRoomIndex) {
      // Add a new rate ID
      updatedRateIds.push(rateId);
    } else {
      // Replace the existing rate ID
      updatedRateIds[currentRoomIndex] = rateId;
    }
    
    // Update the store with the new rate IDs
    clearSelectedRateIds();
    updatedRateIds.forEach(id => addSelectedRateId(id));
    
    // Debug log the current state of rate selections
    console.log(`Room ${currentRoomIndex + 1} selected rate: ${rateId}`);
    console.log(`All selected rates: ${updatedRateIds.join(', ')}`);
    console.log(`Total selected: ${updatedRateIds.length} of ${itinerary.rooms.length} rooms`);
    
    // Update room details in the itinerary store for the current room
    if (itinerary.rooms[currentRoomIndex]) {
      setRoomDetails(itinerary.rooms[currentRoomIndex].id, { rateId, roomId, price });
      setRecommendationId(recommendationId);
    }
    
    // Store the current recommendation ID if this is the first room
    if (currentRoomIndex === 0) {
      setCurrentRecommendationId(recommendationId);
    }
    
    // Update total price
    const totalPrice = getTotalPrice();
    setSelectedPrice(totalPrice);
    
    // If this isn't the last room, get compatible rates for the next room
    if (currentRoomIndex < itinerary.rooms.length - 1) {
      try {
        setLoading(true);
        
        // Get compatible rates for the next room using our utility function
        const compatRates = getCompatibleRates(updatedRateIds, rooms, recommendations);
        
        // Update compatible rates in the store
        setCompatibleRates(compatRates);
        
        // Move to the next room
        setCurrentRoomIndex(currentRoomIndex + 1);
      } catch (error) {
        console.error("Error getting compatible rates:", error);
      } finally {
        setLoading(false);
      }
    } else {
      // This is the last room, validate the final selection
      try {
        setLoading(true);
        
        // Get all rate IDs selected so far (not including the one just selected)
        let allRateIds = [...selectedRateIds];
        
        // Add or update the current rate ID
        if (allRateIds.length < itinerary.rooms.length) {
          allRateIds.push(rateId);
        } else {
          // Replace the last rate ID
          allRateIds[itinerary.rooms.length - 1] = rateId;
        }
        
        // Make sure we have exactly the right number of rate IDs
        if (allRateIds.length > itinerary.rooms.length) {
          console.warn(`Too many rate IDs (${allRateIds.length}), trimming to ${itinerary.rooms.length}`);
          allRateIds = allRateIds.slice(0, itinerary.rooms.length);
        }
        
        // Validate the complete selection using our utility function
        const validation = validateRateSelection(allRateIds, recommendations);
        
        if (!validation.valid) {
          console.error("Invalid rate selection combination");
          setError("This room selection is not compatible with your previous selections. Please try a different option.");
          setLoading(false);
          return;
        }
        
        // If we have a valid recommendation ID, store it
        if (validation.recommendationId) {
          setCurrentRecommendationId(validation.recommendationId);
          setRecommendationId(validation.recommendationId);
        }
        
        // Selection is valid, update the store for consistent state
        clearSelectedRateIds();
        allRateIds.forEach(id => addSelectedRateId(id));
        
        // Selection is valid, complete the flow
        console.log("Rate selection is valid, ready to book");
      } catch (error) {
        console.error("Error validating rate selection:", error);
      } finally {
        setLoading(false);
      }
    }
  };
  
  // Combined function that handles both room selection and booking
  const handleRoomSelectAndBook = async (
    roomId: string, 
    rateId: string, 
    recommendationId: string, 
    price: number,
    bookNow = false // Optional parameter to indicate if we should proceed to booking
  ) => {
    // For single room selection, update the itinerary directly
    if (!isMultiRoom) {
      // Update room details in the itinerary store for all rooms in single selection mode
      itinerary.rooms.forEach(room => {
        setRoomDetails(room.id, { rateId, roomId, price });
      });
      
      // Set the recommendation ID for the itinerary
      setRecommendationId(recommendationId);
      setCurrentRecommendationId(recommendationId);
      
      // Update total price
      const totalPrice = getTotalPrice();
      setSelectedPrice(totalPrice);
    } else if (!bookNow) {
      // For multi-room selection without booking, use the existing handleRateSelection
      await handleRateSelection(roomId, rateId, recommendationId, price);
    }
    
    // If bookNow is true, proceed with booking process
    if (bookNow) {
      try {
        if (!itineraryId) {
          console.error('No itinerary ID found');
          return;
        }
        setLoading(true);
  
        // Get all selected rate IDs - handle both single and multi-room cases
        let allRateIds = isMultiRoom 
          ? [...selectedRateIds] // Use selected rate IDs for multi-room
          : [rateId]; // For single room, just use the selected rate ID
          
        // Make sure we have exactly the right number of rate IDs for multi-room selection
        if (isMultiRoom) {
          // If we have too many rate IDs, trim the excess
          if (allRateIds.length > itinerary.rooms.length) {
            console.warn(`Too many rate IDs (${allRateIds.length}), trimming to ${itinerary.rooms.length}`);
            allRateIds = allRateIds.slice(0, itinerary.rooms.length);
          }
          
          // If we don't have enough rate IDs, can't proceed
          if (allRateIds.length < itinerary.rooms.length) {
            console.error(`Not enough rate IDs selected (${allRateIds.length}), need ${itinerary.rooms.length}`);
            setError(`Please complete selecting all ${itinerary.rooms.length} rooms before booking`);
            
            // Set the current room index to the first missing selection
            const firstMissingIndex = allRateIds.findIndex(id => !id);
            if (firstMissingIndex !== -1) {
              setCurrentRoomIndex(firstMissingIndex);
            } else {
              // If all existing entries are valid, go to the next room that needs selection
              setCurrentRoomIndex(allRateIds.length);
            }
            
            setLoading(false);
            return;
          }
        }
        
        // Validate the selection before proceeding (for multiple rooms)
        if (isMultiRoom && allRateIds.length > 1) {
          const validation = validateRateSelection(allRateIds, recommendations);
          
          if (!validation.valid) {
            console.error('Rate selection validation failed');
            setError('Your room selection is not valid. Please try selecting different room types that are compatible with each other.');
            setLoading(false);
            return;
          }
          
          // If we have a valid recommendation ID, use it
          if (validation.recommendationId) {
            recommendationId = validation.recommendationId;
          }
        }
  
        // Create the payload for booking
        const payload: SelectRoomRatesPayload = {
          roomsAndRateAllocations: itinerary.rooms.map((room, index) => ({
            rateId: String(isMultiRoom ? allRateIds[index] : rateId),
            roomId: String(isMultiRoom ? room.roomId : roomId),
            occupancy: {
              adults: room.adults,
              childAges: room.children.map(child => child.age)
            }
          })),
          journeyId:traceId,
          recommendationId: String(recommendationId || currentRecommendationId)
        };
  
        const response = await api.post(`/hotels/itinerary/${itineraryId}/select-rooms`, payload);
  
        //@ts-ignore mlmr
        if (response?.data.status === 'success') {
           //@ts-ignore mlmr
          router.push(`/trippy/stays/itinerary/session/${response.data.data.bookingId}`)
        }
        console.log('Room selection response:', response);
      } catch (error) {
        console.error('Error selecting room rates:', error);
        // You might want to show an error toast or message to the user
      } finally {
        setLoading(false);
      }
    }
  };

  // Progress controls for multi-room selection
  const goToPreviousRoom = () => {
    if (currentRoomIndex > 0) {
      // First clear any errors
      setError('');
      
      // Calculate the index of the room we're going back to
      const newPreviousIndex = currentRoomIndex - 1;
      
      // Create a copy of the selected rate IDs
      const updatedRateIds = [...selectedRateIds];
      
      // Unselect the current room by setting its rate ID to empty string
      if (updatedRateIds.length > currentRoomIndex) {
        updatedRateIds[currentRoomIndex] = '';
        
        // Also trim any excess rate IDs beyond the current index
        // This ensures we only have selections up to the room we're viewing
        const trimmedRateIds = updatedRateIds.slice(0, currentRoomIndex);
        
        // Update the store with the modified rate IDs
        clearSelectedRateIds();
        trimmedRateIds.forEach(id => {
          if (id) { // Only add non-empty rate IDs
            addSelectedRateId(id);
          }
        });
        
        console.log(`Unselected rate for room ${currentRoomIndex + 1}`);
        console.log(`Updated selected rates: ${trimmedRateIds.join(', ')}`);
      }
      
      // Move to the previous room
      setCurrentRoomIndex(newPreviousIndex);
      
      // Update the view based on which room we're now looking at
      if (currentRoomIndex === 1) {
        // If we're going back to the first room, show the original rooms
        setCompatibleRates([]);
      } else if (currentRoomIndex > 1) {
        // If we're going back to an intermediate room, get compatible rates
        // based on selections up to that point
        const previousSelections = updatedRateIds.slice(0, newPreviousIndex);
        if (previousSelections.length > 0) {
          // Get compatible rates based on previous selections
          const compatRates = getCompatibleRates(previousSelections, rooms, recommendations);
          setCompatibleRates(compatRates);
        }
      }
    }
  };

  React.useEffect(() => {
    // Set up bottom order bar with the combined function
    setButtonText('Book now');
    setHandleCreateItinerary(() => handleRoomSelectAndBook(
      itinerary.rooms[0]?.roomId || '',
      itinerary.rooms[0]?.rateId || '',
      itinerary.recommendationId || currentRecommendationId,
      getTotalPrice(),
      true // Pass true to initiate booking
    ));
    setInfoTitle('inclusive of all taxes');
    setInfoSubtitle(`Rs.${getTotalPrice()} total` || 'Guests not Selected');
  }, [setButtonText, setHandleCreateItinerary, setInfoSubtitle, setInfoTitle, itinerary, getTotalPrice, selectedRateIds, currentRecommendationId])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-[#F1F2F4] w-full">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
      </div>
    );
  }
  
  // The current rooms to display
  const currentRooms = getCurrentRoom();
  
  return (
    <div className='flex flex-col items-start justify-start w-full bg-[#F1F2F4] h-full'>
      <div className='flex w-full sticky top-0 z-20'>
        <StayInformationHeader />
      </div>
      
      {/* Multi-room progress indicator */}
      {isMultiRoom && (
        <div className="w-full bg-white p-4 sticky top-[72px] shadow-sm z-10">
          {error && (
            <div className="mb-2 px-4 py-2 bg-red-100 border border-red-400 text-red-700 rounded">
              {error}
            </div>
          )}
          <div className="flex flex-row w-full items-center justify-between">
            {currentRoomIndex > 0 ?
              <button
                onClick={goToPreviousRoom}
                className="text-blue-600 flex items-center"
              >
                <span className="mr-1">←</span> Back
              </button>
              :
              <div className="w-[60px]"></div>
            }
            
            <div className="flex flex-col justify-center items-center">
              <h2 style={{ fontFamily: 'var(--font-nohemi)' }} className="text-sm font-medium text-gray-800">
                Room {currentRoomIndex + 1} of {itinerary.rooms.length}
              </h2>
              <div className="flex justify-center mt-2">
            {Array.from({ length: itinerary.rooms.length }).map((_, index) => (
              <div 
                key={index}
                className={`w-2 h-2 mx-1 rounded-full ${
                  index === currentRoomIndex 
                    ? 'bg-blue-600' 
                    : index < currentRoomIndex 
                      ? 'bg-green-500' 
                      : 'bg-gray-300'
                }`}
              />
            ))}
          </div>
            </div>
            
            <div className="w-[60px]"></div> {/* Spacer to balance the layout */}
          </div>
          
          {/* Progress dots */}
        </div>
      )}
      
      <div className='flex flex-col w-full items-start justify-start p-6 gap-6'>
        {isMultiRoom ? (
          // For multi-room selection, show only the current room(s)
          currentRooms && currentRooms.length > 0 ? (
            currentRooms.map(room => (
              <RoomRateCard 
                key={room.id || room.roomId} 
                room={room} 
                onBookNow={(roomId, rateId, recommendationId, price) => 
                  handleRateSelection(roomId, rateId, recommendationId, price)
                }
                selectedRateId={
                  // Only pass the selected rate ID for the current room being selected
                  selectedRateIds[currentRoomIndex]
                }
                roomIndex={currentRoomIndex}
                isMultiRoom={true}
              />
            ))
          ) : (
            <div className="w-full text-center py-8 text-gray-500">
              No compatible rooms available for your selection
            </div>
          )
        ) : (
          // For single room selection, show all rooms
          currentRooms && currentRooms.length > 0 ? (
            currentRooms.map(room => (
              <RoomRateCard 
                key={room.id} 
                room={room} 
                onBookNow={(roomId, rateId, recommendationId, price) => 
                  handleRoomSelectAndBook(roomId, rateId, recommendationId, price)
                }
                roomIndex={0} // Single room selection always uses the first room
                isMultiRoom={false} // Explicitly set to single room mode
              />
            ))
          ) : (
            <div className="w-full text-center py-8 text-gray-500">
              No rooms available for the selected criteria
            </div>
          )
        )}
      </div>
    </div>
  )
}

export default Page