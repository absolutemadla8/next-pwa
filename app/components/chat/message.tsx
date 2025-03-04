"use client";

import { Attachment, ToolInvocation } from "ai";
import { motion } from "framer-motion";
import { ReactNode } from "react";

import { PreviewAttachment } from "./preview-attachment";
import { Markdown } from "./markdown";
import { BotIcon, UserIcon } from "./icons";
import { SearchLocationResults } from "./SearchLocationResults";
import { HotelsList } from "./HotelsList";
import { RoomRates } from "./RoomRates";
import AnimatedButton from "../ui/AnimatedButton";
import { SessionCheckout } from "./SessionCheckout";

export const Message = ({
  chatId,
  role,
  content,
  toolInvocations,
  attachments,
}: {
  chatId: string;
  role: string;
  content: string | ReactNode;
  toolInvocations: Array<ToolInvocation> | undefined;
  attachments?: Array<Attachment>;
}) => {
  return (
    <motion.div
      className={`flex flex-col gap-2 px-4 w-full md:w-[500px] md:px-0 first-of-type:pt-20`}
      initial={{ y: 5, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
    >
      <div className="rounded-sm p-1 flex flex-col justify-center items-start shrink-0 text-zinc-500">
        {role === "assistant" ? <img 
        src="https://often-public-assets.blr1.cdn.digitaloceanspaces.com/Group%20482055.png" className="size-[28px] object-contain"
        /> : <span className="text-xs text-slate-500 tracking-tight">You</span>}
      </div>

      <div className="flex flex-col gap-2 w-full">
        {content && typeof content === "string" && (
          <div
          style={{ fontFamily: role === "assistant" ? 'var(--font-domine)' : ''}}
          className={`text-blue-950 flex flex-col gap-4 ${role === "assistant" ? "text-xl" : "text-sm tracking-tight bg-white rounded-lg p-2 border border-slate-200"}`}>
            <Markdown>{content}</Markdown>
          </div>
        )}

        {toolInvocations && (
          <div className="flex flex-col gap-4">
            {toolInvocations.map((toolInvocation) => {
              const { toolName, toolCallId, state } = toolInvocation;

              if (state === "result") {
                const { result } = toolInvocation;

                return (
                  <div key={toolCallId}>
                    {toolName === "searchLocation" ? (
                      <SearchLocationResults chatId={chatId} results={result} />
                    ) :
                    toolName === "searchHotels"? (
                      <HotelsList results={result} chatId={chatId} />
                    ) :
                    toolName === "getRoomRates" ? (
                      <RoomRates results={result} chatId={chatId} />
                    )
                    :
                    toolName === "selectRoomRate"? (
                      <SessionCheckout results={result} chatId={chatId} />
                    ) :
                    (
                      <div>{JSON.stringify(result, null, 2)}</div>
                    )}
                  </div>
                );
              } else {
                return (
                  <div key={toolCallId} className="skeleton">
                    {toolName === "searchLocation" ? (
                      <SearchLocationResults chatId={chatId} />
                    ) :
                    toolName === "searchHotels"? (
                      <HotelsList chatId={chatId} />
                    ) :
                    toolName === "getRoomRates" ? (
                      <RoomRates chatId={chatId} />
                    ):
                    toolName === "selectRoomRate"? (
                      <SessionCheckout chatId={chatId} />
                    ) :
                    null}
                  </div>
                );
              }
            })}
          </div>
        )}

        {attachments && (
          <div className="flex flex-row gap-2">
            {attachments.map((attachment) => (
              <PreviewAttachment key={attachment.url} attachment={attachment} />
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
};
