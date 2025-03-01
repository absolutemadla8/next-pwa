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
            location_id: z.string().describe("Location ID"),
            check_in: z.string().describe("Check-in date"),
            check_out: z.string().describe("Check-out date"),
            occupancies: z.array(
              z.object({
                adults: z.number().describe("Number of adults"),
                childAges: z.array(z.number()).describe("Child ages"),
              }),
            ).describe("Occupancies"),
          }),
          execute: async ({ location_id, check_in, check_out, occupancies }) => {
            const hotelsResponse = await serverApi.get(`/hotels/search-hotels`, {
              params: {
                location_id,
                check_in,
                check_out,
                occupancies: occupancies,
              }
            });
            //@ts-ignore mlmr
            return hotelsResponse.data.data;
          },
        },
      },
      //@ts-ignore mlmr
      onFinish: async ({ responseMessages }) => {
          try {
            await serverApi.post('trippy/sessions/chat', {
              id,
              messages: [...coreMessages, ...responseMessages],
            });
          } catch (error) {
            console.error("Failed to save chat", error);
          }
      },
      experimental_telemetry: {
        isEnabled: true,
        functionId: "stream-text",
      },
    });

    return result.toDataStreamResponse({});
  } catch (error) {
    console.error("Error in API route:", error);
    return new Response("An error occurred", { status: 500 });
  }
}