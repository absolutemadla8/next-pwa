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
import { RouteList } from "./RouteList";
import { useChat } from "ai/react";
import { SelectedHotels } from "./SelectedHotels";
import { LabelSearchResults } from "./LabelSearchResults";
import { SelectedActivities } from "./SelectedActivities";
import { ItineraryMessage } from "./ItineraryMessage";
import { HumanRefer } from "./humanRefer";

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
  const { append, error, reload } = useChat({
    id: chatId,
    body: { id: chatId },
    maxSteps: 5,
  });
  return (
    <motion.div
      className={`flex flex-col gap-2 px-4 w-full md:w-[500px] md:px-0 first-of-type:pt-20`}
      initial={{ y: 5, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
    >
      <div className="rounded-sm p-1 flex flex-col justify-center items-start shrink-0 text-zinc-500">
        {role === "assistant" ? <img 
        src="https://often-public-assets.blr1.cdn.digitaloceanspaces.com/Group%20482055.png" className="size-[24px] object-contain"
        /> : <span className="text-xs text-slate-500 tracking-tight">You</span>}
      </div>

      <div className="flex flex-col gap-2 w-full">
        {toolInvocations && (
          <div className="flex flex-col gap-4">
            {toolInvocations.map((toolInvocation) => {
              const { toolName, toolCallId, state, args } = toolInvocation;

              if (state === "result") {
                const { result } = toolInvocation;

                return (
                  <div key={toolCallId}>
                    {toolName === "searchLocation" ? (
                      <SearchLocationResults isOpen={true} onOpenChange={()=>{}} toolName={toolName} args={args} state={state} chatId={chatId} results={result} />
                    ) :
                    toolName === "getRoutes"? (
                      <RouteList isOpen={true} onOpenChange={()=>{}} toolName={toolName} args={args} state={state} chatId={chatId} results={result} />
                    ) :
                    toolName === "getLabels"? (
                      <LabelSearchResults isOpen={true} onOpenChange={()=>{}} toolName={toolName} args={args} state={state} chatId={chatId} results={result} />
                    ):
                    toolName === "createItinerary" ? (
                      <SelectedHotels isOpen={true} onOpenChange={()=>{}} toolName={toolName} args={args} state={state} chatId={chatId} results={result} />
                    ):
                    toolName === "addActivities" ? (
                      <SelectedActivities isOpen={true} onOpenChange={()=>{}} toolName={toolName} args={args} state={state} chatId={chatId} results={result} />
                    ):
                    toolName === "searchHotels"? (
                      <HotelsList isOpen={true} onOpenChange={()=>{}} toolName={toolName} args={args} state={state} chatId={chatId} results={result} />
                    ) :
                    toolName === "getTrip" ? (
                      <ItineraryMessage isOpen={true} onOpenChange={()=>{}} toolName={toolName} args={args} state={state} chatId={chatId} results={result} />
                    ) :
                    toolName === "referToHuman" ? (
                      <HumanRefer isOpen={true} onOpenChange={()=>{}} toolName={toolName} args={args} state={state} chatId={chatId} results={result} />
                    ):
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
                      <SearchLocationResults toolName={toolName} chatId={chatId} />
                    ) :
                    toolName === "getRoutes"? (
                      <RouteList toolName={toolName} chatId={chatId} />
                    ) :
                    toolName === "getLabels"? (
                      <LabelSearchResults toolName={toolName} chatId={chatId} />
                    ):
                    toolName === "createItinerary" ? (
                      <SelectedHotels toolName={toolName} chatId={chatId}/>
                    ):
                    toolName === "searchHotels"? (
                      <HotelsList toolName={toolName} chatId={chatId} />
                    ) :
                    toolName === "getRoomRates" ? (
                      <RoomRates chatId={chatId} />
                    ):
                    toolName === "selectRoomRate"? (
                      <SessionCheckout chatId={chatId} />
                    ) :
                    <AnimatedButton onClick={reload} variant="primary">
                      Reload
                      </AnimatedButton>}
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

        {content && typeof content === "string" && (
          <div
          style={{ fontFamily: role === "assistant" ? 'var(--font-domine)' : ''}}
          className={`text-blue-950 flex flex-col gap-4 ${role === "assistant" ? "text-lg" : "text-sm tracking-tight bg-white rounded-lg p-2 border border-slate-200"}`}>
            <Markdown>{content}</Markdown>
          </div>
        )}
      </div>
    </motion.div>
  );
};
