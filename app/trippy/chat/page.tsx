'use client';

import React, { useState } from 'react';
import { api } from '@/app/lib/axios';
import { useRouter } from 'next/navigation';
import { useChat } from 'ai/react';
import { IconArrowUpRight } from '@tabler/icons-react';

const Page = () => {
  const router = useRouter();
  const [messageInput, setMessageInput] = useState('');
  const [loading, setLoading] = useState(false);

  // We don't need to initialize useChat with a pin here since we're just creating a new chat
  // and then redirecting to the chat page

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageInput.trim()) return;
    
    setLoading(true);
    
    try {
      // Create new chat session with the initial message
      const sessionResponse = await api.post('/trippy/sessions', {
        messages: [{ role: "user", content: messageInput }]
      });
      
      //@ts-ignore mlmr
      const { pin: newPin } = sessionResponse.data.data;
      
      // Instead of trying to append here, just redirect to the chat page with the new pin
      // The chat page component should handle displaying the messages
      router.push(`/trippy/chat/${newPin}`);
      
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
      setMessageInput('');
    }
  };

  return (
    <div className="container">
      <form onSubmit={handleSubmit}>
        <div className="relative">
          <textarea
            value={messageInput}
            onChange={(e) => setMessageInput(e.target.value)}
            placeholder="Ask about your trip..."
            className="w-full h-32 p-4 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none shadow-sm text-blue-950"
            disabled={loading}
          />
          <button
            type="submit"
            disabled={loading}
            className={`absolute bottom-3 right-3 p-2 rounded-full ${
              loading ? 'bg-gray-300' : 'bg-blue-600 hover:bg-blue-700'
            } text-white transition-colors`}
          >
            <IconArrowUpRight size={18} />
          </button>
        </div>
      </form>
    </div>
  );
};

export default Page;