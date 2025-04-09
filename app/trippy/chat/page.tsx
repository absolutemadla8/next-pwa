'use client';

import React, { useState } from 'react';
import { api } from '@/app/lib/axios';
import { useRouter } from 'next/navigation';
import { useChat } from 'ai/react';
import { IconArrowUpRight } from '@tabler/icons-react';
import HorizontalScroll from '@/app/components/ui/HorizontalScroll';
import TripTemplateGenerator from '@/app/components/trippy/TripTemplateGenerator';

const Page = () => {
  const router = useRouter();
  const [messageInput, setMessageInput] = useState('');
  const [loading, setLoading] = useState(false);
  const { append } = useChat();

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
      
      router.push(`/trippy/chat/${newPin}`);
      
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
      setMessageInput('');
    }
  };

  const handleSelectTemplate = (template: string) => {
    setMessageInput(template);
  };

  return (
    <div className="flex flex-col h-screen items-center justify-center w-full overflow-hidden">
      <form onSubmit={handleSubmit} className="w-full md:max-w-md">
        <div className="relative flex flex-col w-full px-4">
          <div className="flex flex-col items-center justify-center w-full p-4">
            <img src="https://often-public-assets.blr1.cdn.digitaloceanspaces.com/Group%20482081.png" className="h-44 w-44 object-contain" />
          </div>
          {/* <textarea
            value={messageInput}
            onChange={(e) => setMessageInput(e.target.value)}
            placeholder="Ask about your trip..."
            className="w-full h-32 p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none shadow-sm text-primary"
            disabled={loading}
          />
          <button
            type="submit"
            disabled={loading}
            className={`absolute bottom-3 right-6 p-2 rounded-full ${
              loading ? 'bg-gray-300' : 'bg-blue-600 hover:bg-blue-700'
            } text-white transition-colors`}
          >
            <IconArrowUpRight size={18} />
          </button> */}
        </div>
        
        <div className="mt-4">
          <TripTemplateGenerator onSelectTemplate={handleSelectTemplate} />
        </div>
      </form>
    </div>
  );
};

export default Page;