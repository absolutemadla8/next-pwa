"use client";

import { Attachment, Message } from "ai";
import { useChat } from "ai/react";
import { useState } from "react";

import { Message as PreviewMessage } from "./message";
import { useScrollToBottom } from "./use-scroll-to-bottom";

import { MultimodalInput } from "./multimodal-input";
import { Overview } from "./overview";

export function Chat({
  id,
  initialMessages,
}: {
  id: string;
  initialMessages: Array<Message>;
}) {
  const { messages, handleSubmit, input, setInput, append, isLoading, stop } =
    useChat({
      id,
      body: { id },
      initialMessages,
      maxSteps: 10,
      onFinish: () => {
        window.history.replaceState({}, "", `/trippy/chat/${id}`);
      },
    });

  const [messagesContainerRef, messagesEndRef] =
    useScrollToBottom<HTMLDivElement>();

  const [attachments, setAttachments] = useState<Array<Attachment>>([]);

  return (
    <div className="flex flex-row justify-center h-dvh overflow-hidden bg-gradient bg-gradient-to-b from-blue-100 to-violet-100 pt-10">
      <div className="flex flex-col justify-between items-center w-full md:max-w-[500px] h-full">
        <div
          ref={messagesContainerRef}
          className="flex-1 flex flex-col gap-4 w-full overflow-y-auto px-4 md:px-0 pt-4"
        >
          {messages.length === 0 && <Overview />}

          {messages.map((message) => (
            <PreviewMessage
              key={message.id}
              chatId={id}
              role={message.role}
              content={message.content}
              attachments={message.experimental_attachments}
              toolInvocations={message.toolInvocations}
            />
          ))}

          <div
            ref={messagesEndRef}
            className="shrink-0 min-w-[24px] min-h-[24px]"
          />
        </div>

        <div className="w-full px-4 md:px-0 pb-4">
        <div className='fixed bottom-0 left-0 right-0 flex flex-col items-center justify-start w-full bg-gradient-to-t from-white via-white to-transparent px-4 pt-4 pb-16 z-20'>
          <form className="flex flex-row gap-2 relative items-end w-full">
            <MultimodalInput
              input={input}
              setInput={setInput}
              handleSubmit={handleSubmit}
              isLoading={isLoading}
              stop={stop}
              attachments={attachments}
              setAttachments={setAttachments}
              messages={messages}
              append={append}
            />
          </form>
          </div>
        </div>
      </div>
    </div>
  );
}
