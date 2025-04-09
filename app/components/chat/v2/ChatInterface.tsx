import { CheckCircle, CheckCircle2, User2Icon } from 'lucide-react';
import React, { useState, useRef, useEffect } from 'react';
import Stepper from './StepperComponent';

// TypeScript interfaces
export interface Message {
  id: string;
  type: 'assistant' | 'user' | 'system' | 'tool';
  content: string;
  attachments?: string[];
  timestamp: Date;
  isPartial?: boolean;
  tool_calls?: Array<{
    name: string;
    args: Record<string, any>;
    id: string;
    type: string;
  }>;
}

interface Step {
  step_id: number;
  title: string;
  description: string;
  is_complete: boolean;
  steps?: string[];
  note?: string;
}

interface ChatInterfaceProps {
  initialMessages?: Message[];
  onSendMessage?: (message: string) => void;
  isLoading?: boolean;
}

export const ChatInterfaceComponent: React.FC<ChatInterfaceProps> = ({
  initialMessages = [],
  onSendMessage = () => {},
  isLoading = false,
}) => {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [inputValue, setInputValue] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  
  // Update messages when initialMessages changes
  useEffect(() => {
    setMessages(initialMessages);
  }, [initialMessages]);

  // Auto-scroll to bottom when new messages are added
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);
  
  // Function to handle submitting a new message
  const handleSendMessage = () => {
    if (inputValue.trim() === '' || isLoading) return;
    
    onSendMessage(inputValue);
    setInputValue('');
    
    // Reset textarea height
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  // Handle pressing Enter to send message
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Auto-resize textarea
  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInputValue(e.target.value);
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  };

  // Format tool message content
  const formatToolContent = (content: string) => {
    try {
      // Try to parse as JSON
      const parsed = JSON.parse(content);
      
      // Check if it's a trip plan
      if (parsed.tripPlan) {
        // Convert tripPlan to stepper format
        const tripSteps = parsed.tripPlan.steps || [];
        const stepperSteps = tripSteps.map((step: any, index: number) => ({
          step_id: index + 1,
          title: step.title,
          description: step.description,
          is_complete: false
        }));
        
        // Mark first step as active
        if (stepperSteps.length > 0) {
          stepperSteps[0].is_complete = true;
        }
        
        // Return the stepper component with trip plan data
        return (
          <div className="bg-white">
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-gray-50 p-3 rounded-md">
                  <p className="text-xs text-slate-600 mb-1">Destination</p>
                  <p style={{ fontFamily: 'var(--font-nohemi)' }} className="text-sm text-primary">{parsed.tripPlan.destination}</p>
                </div>
                <div className="bg-gray-50 p-3 rounded-md">
                  <p className="text-xs text-slate-600 mb-1">Duration</p>
                  <p style={{ fontFamily: 'var(--font-nohemi)' }} className="text-sm text-primary">{parsed.tripPlan.duration}</p>
                </div>
                <div className="bg-gray-50 p-3 rounded-md">
                  <p className="text-xs text-slate-600 mb-1">Budget</p>
                  <p style={{ fontFamily: 'var(--font-nohemi)' }} className="text-sm text-primary">{parsed.tripPlan.budget}</p>
                </div>
                <div className="bg-gray-50 p-3 rounded-md">
                  <p className="text-xs text-slate-600 mb-1">Travelers</p>
                  <p style={{ fontFamily: 'var(--font-nohemi)' }} className="text-sm text-primary">{parsed.tripPlan.travelerCount}</p>
                </div>
              </div>
            
            <h3 className="text-sm font-medium mb-4">Trip Itinerary</h3>
            <Stepper
              steps={stepperSteps} 
              currentStep={2} 
              onContinue={(stepId) => console.log('Continue from step', stepId)}
              onBack={(stepId) => console.log('Back from step', stepId)}
            />
          </div>
        );
      } else {
        // Just display other JSON content
        return (
          <pre className="text-xs overflow-auto whitespace-pre-wrap bg-gray-50 p-3 rounded-md text-gray-800">
            {JSON.stringify(parsed, null, 2)}
          </pre>
        );
      }
    } catch (e) {
      // Not valid JSON, return as is
      return content;
    }
  };

  return (
    <div className="flex flex-col h-full w-full overflow-hidden bg-white">
      {/* Messages area (with scrolling) */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden pb-4 px-4 sm:px-6 pt-14">
        <div className="max-w-3xl mx-auto space-y-6 pt-4">
          {/* Chat Messages */}
          {messages.map((message) => (
            <div key={message.id} className="mb-6">
              {message.type === 'assistant' || message.type === 'tool' ? (
                // Bot message
                <div className="flex flex-row gap-x-2 items-start">
                  <div className="min-w-8 mr-4 pt-1">
                    <div className="flex-shrink-0 size-8 flex items-center justify-center">
                      <img 
                        src="https://often-public-assets.blr1.cdn.digitaloceanspaces.com/trippy.png" 
                        alt="Trippy" 
                        className="size-6"
                      />
                    </div>
                  </div>
                  
                  <div className="flex-1">
                    <div>
                      {message.type === 'assistant' && (
                         <>
                         {/* Show tool invocation message if no content but tool_calls exist */}
                         {(message.content === "" || !message.content) && message.tool_calls ? (
                           <div className="inline-flex items-center px-3 py-1.5 mb-3 text-sm font-medium rounded-full bg-gray-100 text-gray-700 border gap-x-2">
                             <CheckCircle2 className='fill-gray-500 text-gray-100 size-5'/>
                             <span>Invoking {message.tool_calls[0].name.replace(/_/g, ' ')} tool</span>
                           </div>
                         ) : message.content && (
                           <p 
                             style={{fontFamily: "var(--font-domine)"}}
                             className="text-md text-gray-800 mb-1 leading-relaxed"
                           >
                             {message.content}
                           </p>
                         )}
                       </>
                      )}
                      
                      {message.type === 'tool' && (
                        <div className="mb-2 w-full mt-4">
                          {formatToolContent(message.content)}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                // User message
                <div className="flex flex-row gap-x-2 justify-start">
                   <User2Icon className='fill-gray-500 text-gray-100 size-5'/>
                  <div className="max-w-[85%]">
                    <p className="text-md font-normal text-gray-700 tracking-tight">
                      {message.content}
                    </p>
                    
                    {message.attachments && message.attachments.length > 0 && (
                      <div className="mt-2">
                        {message.attachments.map((attachment, index) => (
                          <div key={index} className="flex items-center text-xs text-gray-500 hover:text-blue-600 mb-1">
                            <svg className="mr-1 size-4" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="m21.44 11.05-9.19 9.19a6 6 0 0 1-8.49-8.49l8.57-8.57A4 4 0 1 1 18 8.84l-8.59 8.57a2 2 0 0 1-2.83-2.83l8.49-8.48"/>
                            </svg>
                            {attachment}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}
          
          {/* Initial Welcome Message if no messages */}
          {messages.length === 0 && (
            <div className="pt-6 pb-4">
              <div className="flex">
                <div className="flex-shrink-0 h-10 w-10 rounded-full bg-blue-600 flex items-center justify-center mr-4">
                  <img 
                    src="https://often-public-assets.blr1.cdn.digitaloceanspaces.com/trippy.png" 
                    alt="Trippy" 
                    className="h-6 w-6"
                  />
                </div>
                
                <div>
                  <p style={{fontFamily: "var(--font-domine)"}} className="text-lg text-gray-800 mb-4">
                    How can I help with your trip today?
                  </p>
                  
                  <div className="space-y-2 text-sm text-gray-600">
                    <p className="mb-2">Try asking something like:</p>
                    <div className="space-y-3">
                      <div className="bg-gray-50 hover:bg-gray-100 px-4 py-2 rounded-lg cursor-pointer">
                        Plan a trip to Bali for 7 days
                      </div>
                      <div className="bg-gray-50 hover:bg-gray-100 px-4 py-2 rounded-lg cursor-pointer">
                        Find me budget-friendly hotels in New York
                      </div>
                      <div className="bg-gray-50 hover:bg-gray-100 px-4 py-2 rounded-lg cursor-pointer">
                        What are the best beaches in Thailand?
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {/* Loading indicator */}
          {isLoading && !messages.length && (
            <div className="flex items-start animate-pulse py-4">
              <div className="flex-shrink-0 h-8 w-8 rounded-full bg-blue-600 flex items-center justify-center mr-4">
                <img 
                  src="https://often-public-assets.blr1.cdn.digitaloceanspaces.com/trippy.png" 
                  alt="Trippy" 
                  className="h-5 w-5"
                />
              </div>
              <div className="h-4 w-24 bg-gray-200 rounded"></div>
            </div>
          )}
          
          {/* Empty div for scroll reference */}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Fixed Textarea Input at bottom */}
      <div className="w-full px-4 py-3">
        <div className="max-w-3xl mx-auto">
          <div className="relative rounded-xl bg-gray-50">
            <textarea
              ref={textareaRef}
              className="p-3 pb-12 block w-full bg-gray-50 rounded-xl text-sm text-gray-700 border-0 focus:ring-0 resize-none"
              placeholder={isLoading ? "Wait for response..." : "Ask me anything about your trip..."}
              value={inputValue}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              rows={1}
              disabled={isLoading}
            ></textarea>

            {/* Toolbar */}
            <div className="absolute bottom-0 inset-x-0 p-2 rounded-b-lg">
              <div className="flex justify-between items-center">
                {/* Left Button Group */}
                <div className="flex items-center">
                  <button type="button" className="inline-flex justify-center items-center size-8 rounded-lg text-gray-400 hover:text-gray-600">
                    <svg className="size-5" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m21.44 11.05-9.19 9.19a6 6 0 0 1-8.49-8.49l8.57-8.57A4 4 0 1 1 18 8.84l-8.59 8.57a2 2 0 0 1-2.83-2.83l8.49-8.48"/></svg>
                  </button>
                </div>

                {/* Right Button Group */}
                <div>
                  <button 
                    type="button" 
                    className={`p-2 rounded-full ${isLoading || !inputValue.trim() 
                      ? 'text-gray-300 cursor-not-allowed' 
                      : 'text-blue-600 hover:bg-blue-50'}`}
                    onClick={handleSendMessage}
                    disabled={isLoading || !inputValue.trim()}
                  >
                    <svg className="size-5" xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                      <path d="M15.964.686a.5.5 0 0 0-.65-.65L.767 5.855H.766l-.452.18a.5.5 0 0 0-.082.887l.41.26.001.002 4.995 3.178 3.178 4.995.002.002.26.41a.5.5 0 0 0 .886-.083l6-15Zm-1.833 1.89L6.637 10.07l-.215-.338a.5.5 0 0 0-.154-.154l-.338-.215 7.494-7.494 1.178-.471-.47 1.178Z"/>
                    </svg>
                  </button>
                </div>
              </div>
            </div>
            {/* End Toolbar */}
          </div>
        </div>
      </div>
      {/* End Textarea */}
    </div>
  );
};