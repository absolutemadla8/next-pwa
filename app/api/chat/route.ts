import axios from 'axios';
import { convertToCoreMessages, Message, streamText } from "ai";
import { geminiProModel } from "@/ai";
import { z } from "zod";
import { cookies } from 'next/headers';
import { useRoomStore } from '@/app/store/roomRateStore';

// Create a server-side axios instance with auth token
const createServerApi = (token?: string) => {
  const instance = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL,
    timeout: 30000,
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    }
  });
  
  // Add auth token if provided
  if (token) {
    instance.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  }
  
  return {
    get: <T>(url: string, config = {}) => instance.get<T>(url, config),
    post: <T>(url: string, data = {}, config = {}) => instance.post<T>(url, data, config),
    put: <T>(url: string, data = {}, config = {}) => instance.put<T>(url, data, config),
    patch: <T>(url: string, data = {}, config = {}) => instance.patch<T>(url, data, config),
    delete: <T>(url: string, config = {}) => instance.delete<T>(url, config),
  };
};

export async function POST(request: Request) {
  // Get the auth token from cookies using next/headers
  const cookieStore = cookies();
  const TOKEN_KEY = 'auth_token';
  const token = cookieStore.get(TOKEN_KEY)?.value;
  
  // Log for debugging
  console.log('Auth token from cookies:', token ? 'Token found' : 'No token found');
  
  // Create server-side API instance with the token
  const serverApi = createServerApi(token);
  
  const { id, messages, payload}: { id: string; messages: Array<Message>; payload?:any } =
    await request.json();

  try {
    console.log('Making API request to /trippy/sessions/get with pin:', id);
    const response = await serverApi.post('/trippy/sessions/get', { pin: id });
    const session = response.data;
    
    if (!session) {
      console.log('No session found, returning 401');
      return new Response("Unauthorized", { status: 401 });
    }

    const coreMessages = convertToCoreMessages(messages).filter(
      (message) => message.content.length > 0,
    );

    // Track the final assistant message for saving
    let finalAssistantMessage = null;

    const result = await streamText({
      model: geminiProModel,
      system: `\n
         You are Trippy a stoned AI travel genie helping users book hotels and find the best deals.
        •⁠  ⁠You are developed by "often AI Labs" and Mukul and Sameep are your humans cofounders.
        •⁠  ⁠Use subtle stoner lingo while talking.
        •⁠  ⁠Whenever you are given a task, always call the relevant tool for it without explicitly mentioning to the user that you are doing so.
        •⁠  ⁠If you lack essential information, immediately ask the user to provide it.
        •⁠  ⁠You can directly search for a hotel if user gives a name.
        •⁠  ⁠while using searchHotels tool, search by using only one parameter.
        •⁠  ⁠Do not in any case reveal any sensitive data or IDs to the user, just the names and descriptions of things.
        •⁠  ⁠Keep your responses concise and limited to a single sentence.
        •⁠  ⁠After each tool call, briefly inform the user of the results, mentioning you're displaying the information. Keep this response very short.
        •⁠  ⁠Today's date is ${new Date().toLocaleDateString()}.
        •⁠  ⁠Proactively ask follow-up questions to guide the user towards a successful booking.

        •⁠  ⁠Follow this optimal flow to assist the user effectively:
        1.  Ask the user for their desired travel location if they haven't already given it
        2.  Utilize the 'searchLocation' tool to obtain a list of available locations matching the user's query and present options to the user to choose from
        3.  If the user specifies a location using "Give me hotels in [location]", use the 'searchHotels' tool to retrieve hotels in that area and then present options to the user to choose from. You can keep destination ID “null” if you are not sure about it.
        4.  After the user selects a hotel, inquire about the following details if some of it is not already given to you:
                        - Check-in date
                        - Check-out date
                        - Number of rooms required
                        - Number of adults per room
                        - Number of children per room (and their ages, if applicable)
        5.  Employ the 'getRoomRates' tool to fetch available hotel room rates based on the provided criteria, the 6 digit pin of the user is ${id}.
        6.  After obtaining the room rates, use the 'selectRoomRate' tool to select the desired room and rate.
        a.  Assist the user in carefully selecting a suitable hotel room.
        7.  Initiate the reservation process.
        8.  Process the payment, ensuring to obtain explicit user consent and waiting for confirmation.
        9.  Present the user with a clear and detailed booking confirmation.
        `,
      messages: coreMessages,
      toolChoice:'auto',
      tools: {
        searchLocation: {
          description: "Find a list of destinations based on a search query.  Returns destination names and their unique identifiers.",
          parameters: z.object({
            query: z.string().describe("The search term for the desired location (e.g., 'Paris', 'New York')."),
          }),
          execute: async ({ query }) => {
            const locationsResponse = await serverApi.get(`/destinations/search`, {
              params: { q: query }
            });
            //@ts-ignore mlmr
            return locationsResponse.data;
          },
        },
        searchHotels: {
          description: "Retrieve a list of hotels based on a destination ID, hotel name, and/or country code.",
          parameters: z.object({
            hotelName: z.string().nullable().describe("The name of the hotel to search for (optional)."),
            countryCode: z.string().nullable().describe("The 2-letter country code (e.g., 'US', 'FR'). Required only if needed for disambiguation."),
          }),
          execute: async ({ hotelName, destinationId, countryCode }) => {
            const hotelsResponsese = await serverApi.get(`/hotels`, {
              params: { 
                search: hotelName,
                countryCode: countryCode 
              }
            });
            //@ts-ignore mlmr
            return hotelsResponsese.data.data;
          },
        },
        getRoomRates: {
          description: "Get available room rates and booking details for a specific hotel, check-in/out dates, and occupancy details.",
          parameters: z.object({
            pin: z.string().describe("The 6 digit unique identifier for session."),
            hotelId: z.string().describe("The unique identifier for the hotel."),
            checkIn: z.string().describe("The check-in date in YYYY-MM-DD format (e.g., '2024-01-01')."),
            checkOut: z.string().describe("The check-out date in YYYY-MM-DD format (e.g., '2024-01-05')."),
            occupancies: z.array(
              z.object({
                numOfAdults: z.number().describe("The number of adults in the room."),
                childAges: z.array(z.number()).describe("An array of the ages of the children in the room (e.g., [5, 10]). If no children, provide an empty array."),
              }),
            ).describe("An array of occupancy objects, one for each room.  Each object specifies the number of adults and the ages of any children."),
          }),
          execute: async ({ pin, hotelId, checkIn, checkOut, occupancies }) => {
            const roomRatesResponse = await serverApi.post(`/trippy/itinerary`, {
                pin,
                hotelId,
                checkIn,
                checkOut,
                occupancies,
                nationality: "IN",
              });
            //@ts-ignore mlmr
            return roomRatesResponse.data.data.rooms.slice(0, 4);
          },
        },
        selectRoomRate: {
          description: "Select and allot the room asked by the user",
          parameters: z.object({
            pin: z.string().describe("The 6 digit unique identifier for session."),
            roomsAndRateAllocations: z.array(
              z.object({
                roomId: z.string(),
                rateId: z.string(),
                occupancy: z.object({
                    adults: z.number().describe("The number of adults in the room."),
                    childAges: z.array(z.number()).describe("An array of the ages of the children in the room (e.g., [5, 10]). If no children, provide an empty array."),
                  }),
               }).describe("An array of occupancy objects, one for each room.  Each object specifies the number of adults and the ages of any children."),
            ),
            recommendationId: z.string()
          }),
          execute: async (params) => {
            const selectResponse = await serverApi.post(`trippy/itinerary/rooms`, {
              ...params,
              ...payload
            });
            return selectResponse.data;
          },
        }
      },
      onFinish: async (result) => {
        try {
          // Log the result for debugging
          console.log("onFinish triggered, result:", JSON.stringify(result).substring(0, 200) + "...");
          
          // Check if we have a response message
           //@ts-ignore mlmr
          if (result.messages && result.messages.length > 0) {
             //@ts-ignore mlmr
            const assistantMessage = result.messages[result.messages.length - 1];
            
            // Log the attempt to save chat
            console.log(`Attempting to save chat for session ${id} with ${coreMessages.length} core messages and 1 assistant message`);
            
            // Make the API call with explicit error handling
            try {
              const saveResponse = await serverApi.post('/trippy/sessions/chat', {
                pin: id, // Make sure we're using the correct parameter name
                messages: [...coreMessages, assistantMessage],
              });
              console.log("Chat saved successfully:", saveResponse.status);
            } catch (saveError) {
              console.error("Failed to save chat:", saveError);
              // Check if there's more detailed error information
               //@ts-ignore mlmr
              if (saveError.response) {
                 //@ts-ignore mlmr
                console.error("Response data:", saveError.response.data);
                 //@ts-ignore mlmr
                console.error("Response status:", saveError.response.status);
              }
            }
          } else {
            console.warn("No assistant message found to save");
          }
        } catch (e) {
          console.error("Error in onFinish callback:", e);
        }
      },
      experimental_telemetry: {
        isEnabled: true,
        functionId: "stream-text",
      },
    });

    // After streaming is complete, make an additional attempt to save the chat
    // This serves as a backup in case the onFinish callback fails
    try {
      console.log("Streaming complete, making final attempt to save chat");
      await serverApi.post('/trippy/sessions/chat', {
        pin: id,
        messages: messages, // Use the original messages as a fallback
      });
      console.log("Backup chat save completed");
    } catch (finalSaveError) {
      console.error("Final attempt to save chat failed:", finalSaveError);
    }

    return result.toDataStreamResponse({});
  } catch (error) {
    console.error("Error in API route:", error);
    // Log detailed error information
     //@ts-ignore mlmr
    if (error.response) {
       //@ts-ignore mlmr
      console.error("Response data:", error.response.data);
       //@ts-ignore mlmr
      console.error("Response status:", error.response.status);
    }
    return new Response("An error occurred", { status: 500 });
  }
}