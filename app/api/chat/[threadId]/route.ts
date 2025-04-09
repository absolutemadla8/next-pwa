// app/api/chat/[threadId]/route.ts
import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

// Handle GET requests to fetch thread history
export async function GET(
  request: NextRequest,
  { params }: { params: { threadId: string } }
) {
  const threadId = params.threadId;
  
  try {
    // Construct the URL for fetching the thread
    const apiUrl = `http://127.0.0.1:2024/chat/${threadId}`;
    
    // Make the GET request to your backend
    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    // Check if the response is ok
    if (!response.ok) {
      console.error(`Error from backend: ${response.status} ${response.statusText}`);
      return NextResponse.json(
        { success: false, error: `Backend error: ${response.status}` },
        { status: response.status }
      );
    }
    
    // Parse the response data
    const threadData = await response.json();
    
    // Process messages to ensure tool_calls are properly included
    if (threadData.messages && Array.isArray(threadData.messages)) {
      // The response structure remains the same, but we ensure tool_calls are preserved
      threadData.messages = threadData.messages.map((msg:any) => {
        // Ensure tool_calls are preserved in assistant messages
        if (msg.role === 'assistant' && msg.tool_calls) {
          return {
            ...msg,
            tool_calls: msg.tool_calls // Explicitly preserve tool_calls
          };
        }
        return msg;
      });
    }
    
    return NextResponse.json(threadData);
  } catch (error) {
    console.error('Error fetching thread:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch thread' },
      { status: 500 }
    );
  }
}

// Handle POST requests to send a message and get response
export async function POST(
  request: NextRequest,
  { params }: { params: { threadId: string } }
) {
  const threadId = params.threadId;
  
  try {
    // Get the message from the request body
    const data = await request.json();
    
    // Send the message to your backend
    const apiUrl = `http://127.0.0.1:2024/chat/${threadId}`;
    
    // Make the POST request to your backend
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ message: data.message }),
    });
    
    // Check if the response is ok
    if (!response.ok) {
      console.error(`Error from backend: ${response.status} ${response.statusText}`);
      return NextResponse.json(
        { success: false, error: `Backend error: ${response.status}` },
        { status: response.status }
      );
    }
    
    // Parse the response data
    const responseData = await response.json();
    
    // Ensure tool_calls are included in the response
    if (responseData.response && responseData.response.messages) {
      responseData.response.messages = responseData.response.messages.map((msg:any) => {
        // Make sure tool_calls are preserved when present
        if (msg.role === 'assistant' && msg.tool_calls) {
          return {
            ...msg,
            tool_calls: msg.tool_calls // Explicitly preserve tool_calls
          };
        }
        return msg;
      });
    }
    
    return NextResponse.json(responseData);
  } catch (error) {
    console.error('Error posting message:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to post message' },
      { status: 500 }
    );
  }
}