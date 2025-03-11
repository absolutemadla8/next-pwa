import axios from 'axios';
import { convertToCoreMessages, generateText, Message, Output, streamText } from "ai";
import { geminiProModel } from "@/ai";
import { z } from "zod";
import { cookies } from 'next/headers';
import { ApifyClient } from 'apify-client';

const client = new ApifyClient({
  token: 'apify_api_peJ0VY2xUz7rjdF443QoMQAXAuAm6a4CysGm',
});

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
        •⁠  ⁠Always use tools wherever possible
        Sequence:
        1. If user mentions a location, immediately call searchLocation tool
        2. After location selection, call getRoutes tool
        3. After route selection, call getLabels tool to get definite labels for the itinerary creation
        3. After route selection, call createItinerary tool with a creative name and use label slugs recieved from getLabels tool.
        4. Ask for any missing details like start date
        5. Todays date is ${new Date().toISOString().split('T')[0]}
        Rules:
        - Use subtle stoner lingo
        - Call relevant tools without mentioning it to user
        - Keep responses to one concise sentence
        - Never reveal sensitive data/IDs
        - Briefly summarize tool results
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
        getRoutes: {
          description: "Get a list of routes for a country using ISO 2 digit country code.",
          parameters: z.object({
            countryCode: z.string().describe("The 2-letter country code (e.g., 'US', 'FR')."),
          }),
          execute: async ({ countryCode }) => {
            const routesResponse = await serverApi.get(`/routes/country/${countryCode}`);
            //@ts-ignore mlmr
            return routesResponse.data;
          },
        },
        getLabels: {
          description: "Get a list of labels in the server from the preferences of user.",
          parameters: z.object({
            labels: z.array(z.string()).describe("An array of labels for the trip on basis of user preferences (e.g., ['romantic', 'luxe'])."),
          }),
          execute: async ({ labels }) => {
            const labelsResponse = await serverApi.post(`/labels/search`, {
              keywords: labels
            });
            //@ts-ignore mlmr
            return labelsResponse.data;
          },
        },
        // getCheapestDates: {
        //   description: "Get the cheapest dates for a destination based on the given month and departure city.",
        //   parameters: z.object({
        //     adults: z.number().describe("The number of adults in the room."),
        //     departureAirport: z.string().describe("The 3-letter IATA code for the departure airport (e.g., 'LHR')."),
        //     month: z.string().describe("The month for which to find the cheapest dates (e.g., 'January')."),
        //   }),
        //   execute: async ({ departureAirport, month }) => {
        //     const run = await client.actor("wIfblEie7OF0dOs3C").call(
        //       {
        //         "direct": false,
        //         "origin": departureAirport,
        //         "destination": "LAS",
        //         "datefrom": "251101",
        //         "adults": 2,
        //         "children": [],
        //         "classtype": "economy",
        //         "nearby": "none",
        //         "format": true,
        //         "delay": 3,
        //         "retries": 3,
        //         "proxy": {
        //             "useApifyProxy": true,
        //             "apifyProxyGroups": [
        //                 "RESIDENTIAL"
        //             ]
        //         }
        //     }
        //     );
        //     //@ts-ignore mlmr
        //     return cheapestDatesResponse.data;
        //   },
        // },
        // searchHotels: {
        //   description: "Retrieve a list of hotels based on a destination ID, hotel name, and/or country code.",
        //   parameters: z.object({
        //     hotelName: z.string().nullable().describe("The name of the hotel to search for (optional)."),
        //     countryCode: z.string().nullable().describe("The 2-letter country code (e.g., 'US', 'FR'). Required only if needed for disambiguation."),
        //   }),
        //   execute: async ({ hotelName, destinationId, countryCode }) => {
        //     const hotelsResponsese = await serverApi.get(`/hotels`, {
        //       params: { 
        //         search: hotelName,
        //         countryCode: countryCode 
        //       }
        //     });
        //     //@ts-ignore mlmr
        //     return hotelsResponsese.data.data;
        //   },
        // },
        createItinerary: {
          description: "Create initial itinerary for the user",
          parameters: z.object({
            trip_route_id: z.string().describe("The unique identifier for the trip route."),
            trip_name: z.string().describe("The name of the trip."),
            start_date: z.string().describe("The start date of the trip in YYYY-MM-DD format (e.g., '2024-01-01')."),
            nights: z.number().describe("The number of nights for the trip."),
            labels: z.array(z.string()).describe("An array of labels slugs recieved for user's preferences from getLabels tool."),
          }),
          execute: async ({ trip_route_id, trip_name, start_date, nights, labels }) => {
            const createItineraryResponsese = await serverApi.post(`/trippy/trip/create`, {
              trip_route_id,
              trip_name,
              start_date,
              nights,
              labels
            });
            //@ts-ignore mlmr
            return createItineraryResponsese.data.data;
          },
        },
        // getRoomRates: {
        //   description: "Get available room rates and booking details for a specific hotel, check-in/out dates, and occupancy details.",
        //   parameters: z.object({
        //     pin: z.string().describe("The 6 digit unique identifier for session."),
        //     hotelId: z.string().describe("The unique identifier for the hotel."),
        //     checkIn: z.string().describe("The check-in date in YYYY-MM-DD format (e.g., '2024-01-01')."),
        //     checkOut: z.string().describe("The check-out date in YYYY-MM-DD format (e.g., '2024-01-05')."),
        //     occupancies: z.array(
        //       z.object({
        //         numOfAdults: z.number().describe("The number of adults in the room."),
        //         childAges: z.array(z.number()).describe("An array of the ages of the children in the room (e.g., [5, 10]). If no children, provide an empty array."),
        //       }),
        //     ).describe("An array of occupancy objects, one for each room.  Each object specifies the number of adults and the ages of any children."),
        //   }),
        //   execute: async ({ pin, hotelId, checkIn, checkOut, occupancies }) => {
        //     const roomRatesResponse = await serverApi.post(`/trippy/itinerary`, {
        //         pin,
        //         hotelId,
        //         checkIn,
        //         checkOut,
        //         occupancies,
        //         nationality: "IN",
        //       });
        //     //@ts-ignore mlmr
        //     return roomRatesResponse.data.data.rooms.slice(0, 4);
        //   },
        // },
        // selectRoomRate: {
        //   description: "Select and allot the room asked by the user",
        //   parameters: z.object({
        //     pin: z.string().describe("The 6 digit unique identifier for session."),
        //     roomsAndRateAllocations: z.array(
        //       z.object({
        //         roomId: z.string(),
        //         rateId: z.string(),
        //         occupancy: z.object({
        //             adults: z.number().describe("The number of adults in the room."),
        //             childAges: z.array(z.number()).describe("An array of the ages of the children in the room (e.g., [5, 10]). If no children, provide an empty array."),
        //           }),
        //        }).describe("An array of occupancy objects, one for each room.  Each object specifies the number of adults and the ages of any children."),
        //     ),
        //     recommendationId: z.string()
        //   }),
        //   execute: async (params) => {
        //     const selectResponse = await serverApi.post(`trippy/itinerary/rooms`, {
        //       ...params,
        //       ...payload
        //     });
        //     return selectResponse.data;
        //   },
        // },
        // hotelExpert:{
        //   description: "Get hotel expert recommendation",
        //   parameters: z.object({
        //     prompt: z.string().describe("The prompt for the hotel expert."),
        //   }),
        //   execute: async ({prompt}) => {
        //     console.log("hotelExpert called with prompt:", prompt);
        //     const expertResponse = await generateText({
        //       model: geminiProModel,
        //       system: `You are a hotel expert. You are given a prompt and you have to give a recommendation for the hotel.`,
        //       messages: [{
        //         role: "user",
        //         content: prompt
        //       }]
        //     });
        //     //@ts-ignore mlmr
        //     return expertResponse.messages;
        //   },
        // }
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