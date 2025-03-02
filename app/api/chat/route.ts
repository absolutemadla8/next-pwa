import axios from 'axios';
import { convertToCoreMessages, Message, streamText } from "ai";
import { geminiProModel } from "@/ai";
import { z } from "zod";
import { cookies } from 'next/headers';

// Create a server-side axios instance with auth token
const createServerApi = (token?: string) => {
  const instance = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL,
    timeout: 20000,
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
  
  const { id, messages }: { id: string; messages: Array<Message> } =
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
          - You help users book hotels and find deals!
  - Keep your responses limited to a sentence.
  - After every tool call, pretend you're showing the result to the user and keep your response limited to a phrase.
  - Today's date is ${new Date().toLocaleDateString()}.
  - Ask follow up questions to nudge user into the optimal flow.
  - Ask for any details you don't know.
  - Here's the optimal flow:
  - Ask user for desired location
  - Use tool to get list of available locations for selection
  - Once location selected, ask for:
    - Check-in date
    - Check-out date
    - Number of rooms
    - Adults per room
    - Children per room (and their ages if applicable)
    - Use getHotels tool to fetch available hotels
    - Help user select hotel
    - Create reservation
    - Process payment (require user consent, wait for confirmation)
    - Display booking confirmation
          '
        `,
      messages: coreMessages,
      tools: {
        getLocations: {
          description: "Get the locations for the given query",
          parameters: z.object({
            query: z.string().describe("Search query"),
          }),
          execute: async ({ query }) => {
            const locationsResponse = await serverApi.get(`/hotels/search-locations`, {
              params: { search_keyword: query }
            });
            //@ts-ignore mlmr
            return locationsResponse.data.data;
          },
        },
        getHotels: {
          description: "Get the hotels for the given location",
          parameters: z.object({
            locationId: z.string().describe("Location ID"),
            checkIn: z.string().describe("Check-in date in YYYY-MM-DD format"),
            checkOut: z.string().describe("Check-out date YYYY-MM-DD format"),
            occupancies: z.array(
              z.object({
                numOfAdults: z.number().describe("Number of adults"),
                childAges: z.array(z.number()).describe("Child ages"),
              }),
            ).describe("Occupancies"),
          }),
          execute: async ({ locationId, checkIn, checkOut, occupancies }) => {
            const hotelsResponse = await serverApi.post(`/hotels/search-hotels`, {
                locationId,
                nationality: "IN",
                checkIn,
                checkOut,
                occupancies,
              });
            //@ts-ignore mlmr
            return hotelsResponse.data.data.results;
          },
        },
        getRoomRates: {
          description: "Get the room rates for the given hotel",
          parameters: z.object({
            hotelId: z.string().describe("Hotel ID"),
            checkIn: z.string().describe("Check-in date in YYYY-MM-DD format"),
            checkOut: z.string().describe("Check-out date YYYY-MM-DD format"),
            occupancies: z.array(
              z.object({
                numOfAdults: z.number().describe("Number of adults"),
                childAges: z.array(z.number()).describe("Child ages"),
              }),
            ).describe("Occupancies"),
          }),
          execute: async ({ hotelId, checkIn, checkOut, occupancies }) => {
            const roomRatesResponse = await serverApi.post(`/hotels/itineraries/create`, {
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