'use client';

import { CoreMessage } from "ai";
import { notFound } from "next/navigation";
import { useEffect, useState } from 'react';
import { Chat as PreviewChat } from "@/app/components/chat/chat";
import { convertToUIMessages } from "@/app/lib/chat/utils";
import { api } from '@/app/lib/axios';

export default function Page({ params }: { params: any }) {
  const { id } = params;
  const [chat, setChat] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchChat = async () => {
      try {
        const response = await api.post('/trippy/sessions/get', { pin: id });
        console.log(response.data);
        if (response.data) {
          const chatData: any = {
            //@ts-ignore mlmr
            ...response.data.data,
            //@ts-ignore mlmr
            messages: convertToUIMessages(response.data.data.messages as Array<CoreMessage>),
          };
          setChat(chatData);
        } else {
          notFound();
        }
      } catch (error) {
        console.error('Error fetching chat:', error);
        notFound();
      } finally {
        setLoading(false);
      }
    };

    fetchChat();
  }, [id]);

  if (loading) {
    return <div className="text-sm text-blue-950">Loading...</div>;
  }

  if (!chat) {
    return notFound();
  }

  return <PreviewChat id={chat.pin} initialMessages={chat.messages} />;
}
