// app/api/chat/v2/route.ts
import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  try {
    // Get the message from the request body
    const data = await request.json();
    
    // Send the message to your backend to initiate a chat
    const apiUrl = 'http://127.0.0.1:2024/chat';
    
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
    
    // Return the response to the client
    const responseData = await response.json();
    return NextResponse.json(responseData);
  } catch (error) {
    console.error('Error initiating chat:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to initiate chat' },
      { status: 500 }
    );
  }
}