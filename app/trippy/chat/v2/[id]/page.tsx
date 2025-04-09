"use client";

import { useState, useRef, useEffect, JSX } from "react";
import { useParams, useRouter } from "next/navigation";
import { useState as useDebugState } from 'react';
import { notFound } from "next/navigation";
import { ChatInterfaceComponent } from "@/app/components/chat/v2/ChatInterface";
import { api } from "@/app/lib/chat/axios";
import { PanelsTopBottom } from "lucide-react";
import useBottomSheetStore from "@/app/store/bottomSheetStore";
import { useAuthStore } from "@/app/store/authStore";
import useChatTripStore from "@/app/store/chatTripStore";

// Define TypeScript interfaces
// Define TypeScript interfaces
interface Message {
    id: string;
    type: 'assistant' | 'user' | 'system' | 'tool';
    content: string;
    timestamp: Date;
    isPartial?: boolean;
    attachments?: string[];
    tool_calls?: Array<{
      name: string;
      args: Record<string, any>;
      id: string;
      type: string;
    }>;
    tool_call_id?: string;
    name?: string;
  }
  
  interface ApiMessage {
    role: 'assistant' | 'user' | 'system' | 'tool';
    content: string;
    tool_calls?: Array<{
      name: string;
      args: Record<string, any>;
      id: string;
      type: string;
    }>;
    tool_call_id?: string;
    name?: string;
    tripPlan?: TripPlan;
  }

interface StreamEvent {
  type: 'message' | 'complete' | 'error';
  message?: ApiMessage;
  error?: string;
}

interface TripPlan {
  id: string;
  destination: string;
  duration: string;
  budget: string;
  travelerCount: number;
  steps: TripPlanStep[];
  departureLocation?: string;
  departureDate?: string;
  interests?: string[];
}

interface TripPlanStep {
  id: string;
  title: string;
  description: string;
  completed: boolean;
}

interface ThreadResponse {
  threadId: string;
  messages: ApiMessage[];
  hasTripPlan: boolean;
  planConfirmed: boolean;
  updatedAt: string;
  tripPlan?: TripPlan;
}

interface RouteParams {
  id: string;
  [key: string]: string;
}

export default function ChatPage(): JSX.Element {
  const params = useParams<RouteParams>();
  const router = useRouter();
  const threadId = params.id;
  const {user, token} = useAuthStore();
  const { openSheet } = useBottomSheetStore();
  const { setTripId } = useChatTripStore();
  const [messages, setMessages] = useState<Message[]>([]);
  const [tripPlan, setTripPlan] = useState<TripPlan | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true); // Start with loading

  // Fetch existing conversation when component mounts
  useEffect(() => {
    if (threadId) {
      fetchChatHistory(threadId);
    } else {
      // If no threadId in URL, router should have redirected already
      notFound();
    }
  }, [threadId]);

  const fetchChatHistory = async (threadId: string): Promise<void> => {
    try {
      setIsLoading(true);
      const response = await api.get<ThreadResponse>(`/chat/${threadId}`);
      
      if (response.data) {
        // Check for messages in the response format
        //@ts-ignore mlmr
        if (response.data.response && response.data.response.messages) {
          //@ts-ignore mlmr
            const chatMessages: Message[] = response.data.response.messages.map(msg => ({
                id: Date.now().toString() + Math.random().toString(36).substring(2, 7),
                type: msg.role === 'assistant' ? 'assistant' : 
                      msg.role === 'tool' ? 'tool' : 
                      msg.role === 'system' ? 'system' : 'user',
                content: msg.content || "", // Handle empty content for tool calls
                timestamp: new Date(),
                tool_calls: msg.tool_calls, // Make sure to preserve tool_calls
                tool_call_id: msg.tool_call_id,
                name: msg.name
              }));
          setMessages(chatMessages);

          // Look for create_granular_trip tool messages in the loaded history
          //@ts-ignore mlmr
          const toolMessages = response.data.response.messages.filter(
            (msg: ApiMessage) => msg.role === 'tool' && msg.name === 'create_granular_trip'
          );
          
          // Process the most recent create_granular_trip message if any
          if (toolMessages.length > 0) {
            const latestToolMsg = toolMessages[toolMessages.length - 1];
            if (latestToolMsg.content) {
              try {
                const parsedContent = JSON.parse(latestToolMsg.content);
                if (parsedContent.success && parsedContent.tripData && parsedContent.tripData.trip && parsedContent.tripData.trip.id) {
                  const tripId = parsedContent.tripData.trip.id;
                  console.log('Found existing trip ID in history:', tripId);
                  setTripId(tripId);
                }
              } catch (err) {
                console.error('Error parsing create_granular_trip response from history:', err);
              }
            }
          }
        } 
        // Fallback to original format if present
        else if (response.data.messages) {
          const chatMessages: Message[] = response.data.messages.map(msg => ({
            id: Date.now().toString() + Math.random().toString(36).substring(2, 7),
            type: msg.role === 'assistant' ? 'assistant' : 
                  msg.role === 'tool' ? 'tool' : 
                  msg.role === 'system' ? 'system' : 'user',
            content: msg.content || "", // Handle empty content for tool calls
            timestamp: new Date(),
            tool_calls: msg.tool_calls, // Make sure to preserve tool_calls
            tool_call_id: msg.tool_call_id,
            name: msg.name
          }));
          setMessages(chatMessages);

          // Look for create_granular_trip tool messages in the loaded history
          const toolMessages = response.data.messages.filter(
            (msg: ApiMessage) => msg.role === 'tool' && msg.name === 'create_granular_trip'
          );
          
          // Process the most recent create_granular_trip message if any
          if (toolMessages.length > 0) {
            const latestToolMsg = toolMessages[toolMessages.length - 1];
            if (latestToolMsg.content) {
              try {
                const parsedContent = JSON.parse(latestToolMsg.content);
                if (parsedContent.success && parsedContent.tripData && parsedContent.tripData.trip && parsedContent.tripData.trip.id) {
                  const tripId = parsedContent.tripData.trip.id;
                  console.log('Found existing trip ID in history:', tripId);
                  setTripId(tripId);
                }
              } catch (err) {
                console.error('Error parsing create_granular_trip response from history:', err);
              }
            }
          }
        }
        
        // Set trip plan if available
        if (response.data.tripPlan) {
          setTripPlan(response.data.tripPlan);
        } else if (response.data.hasTripPlan) {
          // Check for trip plan in messages
          //@ts-ignore mlmr
          const messagesToCheck = response.data.response?.messages || response.data.messages || [];
          for (const msg of messagesToCheck) {
            if (msg.tripPlan) {
              setTripPlan(msg.tripPlan);
              break;
            }
          }
        }
      }
    } catch (error) {
      console.error("Error fetching chat history:", error);
      // If thread not found or error, redirect to new chat
      // router.push('/dashboard/chat');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendMessage = (content: string): void => {
    if (!threadId || !content.trim()) return;

    // Add user message to UI immediately
    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: content,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, userMessage]);
    
    // Set loading state
    setIsLoading(true);
    
    // Send the message to backend
    sendMessage(content);
  };

  const sendMessage = (message: string): void => {
    try {
      // Send the message to the backend using POST
      api.post(`/chat/${threadId}`, { message: message, role: "user", userId: user?.id, userToken: token })
        .then(response => {
          console.log('API response:', response.data); 
          
          // Process the response
          if (response.data && response.data.response && response.data.response.messages) {
            // Extract messages
            const apiMessages = response.data.response.messages;
            
            // Find the last assistant message
            const lastAssistantMessage = apiMessages
              .filter((msg: ApiMessage) => msg.role === 'assistant')
              .pop();
            
            // Only add the latest assistant's response
            if (lastAssistantMessage) {
              const newMessage: Message = {
                id: Date.now().toString() + Math.random().toString(36).substring(2, 7),
                type: 'assistant',
                content: lastAssistantMessage.content || "", // Handle empty content for tool calls
                timestamp: new Date(),
                tool_calls: lastAssistantMessage.tool_calls // Preserve tool calls
              };
              
              setMessages(prev => [...prev, newMessage]);
              
              // Check for trip plan data if available
              if (lastAssistantMessage.tripPlan) {
                setTripPlan(lastAssistantMessage.tripPlan);
              }
            }
            
            // Check for any tool messages to add
            const toolMessages = apiMessages
              .filter((msg: ApiMessage) => msg.role === 'tool');
            
            // Add any tool messages from the response
            toolMessages.forEach((toolMsg: ApiMessage) => {
              const newToolMessage: Message = {
                id: Date.now().toString() + Math.random().toString(36).substring(2, 7),
                type: 'tool',
                content: toolMsg.content || "",
                timestamp: new Date(),
                tool_call_id: toolMsg.tool_call_id,
                name: toolMsg.name
              };
              
              setMessages(prev => [...prev, newToolMessage]);
              
              // Check if this is a create_granular_trip tool message and extract tripId
              if (toolMsg.name === 'create_granular_trip' && toolMsg.content) {
                try {
                  const parsedContent = JSON.parse(toolMsg.content);
                  if (parsedContent.success && parsedContent.tripData && parsedContent.tripData.trip && parsedContent.tripData.trip.id) {
                    const tripId = parsedContent.tripData.trip.id;
                    console.log('Saving trip ID to store:', tripId);
                    setTripId(tripId);
                  }
                } catch (err) {
                  console.error('Error parsing create_granular_trip response:', err);
                }
              }
            });
          }
          
          // End loading state
          setIsLoading(false);
        })
        .catch(error => {
          console.error('Error sending message:', error);
          setIsLoading(false);
          
          // Add error message
          setMessages(prev => [
            ...prev, 
            {
              id: Date.now().toString(),
              type: 'system',
              content: "Failed to send message. Please try again.",
              timestamp: new Date()
            }
          ]);
        });
    } catch (error) {
      console.error('Error sending message:', error);
      setIsLoading(false);
      
      // Add error message
      setMessages(prev => [
        ...prev, 
        {
          id: Date.now().toString(),
          type: 'system',
          content: "An error occurred. Please try again.",
          timestamp: new Date()
        }
      ]);
    }
  };

  return (
    <div className="flex flex-col h-screen w-full overflow-hidden">
        <div className="absolute w-full top-0 z-20 flex flex-row px-4 py-4 bg-white/60 border-b border-gray-300 backdrop-blur-md items-center justify-between">
            <div className="flex flex-row items-center justify-start gap-x-2">
                <h2 style={{ fontFamily: 'var(--font-nohemi)' }} className="text-primary text-sm">
                    4 Days Thailand getaway wi...
                </h2>
            </div>
            <div className="flex flex-row items-center justify-end gap-x-2">
                <button 
                  onClick={() => {
                    openSheet('itineraryviewsheet', { 
                      title: '6-Day Vietnam Adventure: Hanoi t...',
                      maxHeight: '90vh',
                      minHeight: '80vh',
                    });
                  }} 
                  className="flex flex-row items-center justify-center gap-x-2 bg-white border border-slate-400 rounded-xl p-2"
                >
                    <PanelsTopBottom className="w-4 h-4 text-primary" />
                </button>
            </div>
        </div>
        <div className="w-full h-full flex flex-col overflow-hidden">
          <ChatInterfaceComponent 
            initialMessages={messages}
            onSendMessage={handleSendMessage}
            isLoading={isLoading}
          />
        </div>
    </div>
  );
}