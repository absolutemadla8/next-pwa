'use client';

import React, { useState } from 'react';
import { api } from '@/app/lib/axios';
import { useRouter } from 'next/navigation';
import { useChat } from 'ai/react';
import { IconArrowUpRight, IconSend2 } from '@tabler/icons-react';

const Page = () => {
  const router = useRouter();
  const [messageInput, setMessageInput] = useState('');
  const [loading, setLoading] = useState(false);
  const { append } = useChat();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageInput.trim()) return;
    
    setLoading(true);
    
    try {
      // Create new chat session
      const sessionResponse = await api.post('/trippy/sessions', {
        messages: [{ role: "user", content: messageInput }]
      });
      //@ts-ignore mlmr
      const { pin } = sessionResponse.data.data;
      
      // Trigger the chat flow with the new message
      await append({
        role: 'user',
        content: messageInput,
      }, {
        //@ts-ignore mlmr
        options: { body: { id: pin } }
      });

      // Redirect to chat page after appending
      router.push(`/trippy/chat/${pin}`);
      
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
      setMessageInput('');
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen w-full p-4 bg-gray-50">
      <div className="w-full max-w-md flex flex-col items-center">
        <div className="mb-8">
          <img 
            src="https://often-public-assets.blr1.cdn.digitaloceanspaces.com/Group%20482081.png" 
            className="size-44 object-contain"
            alt="Travel Assistant"
          />
        </div>
        
        <form onSubmit={handleSubmit} className="w-full">
          <div className="relative">
            <textarea
              value={messageInput}
              style={{ fontFamily: 'var(--font-nohemi)' }}
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
    </div>
  );
};

export default Page;