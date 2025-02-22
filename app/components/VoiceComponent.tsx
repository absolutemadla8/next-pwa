"use client";

import React, { useEffect, useRef, useState } from "react";
import { api } from '@/app/lib/axios';
import { useConversation } from "@11labs/react";
import { Mic, MicOff } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import dynamic from 'next/dynamic';
import activeAnimation from "@/app/lottie/TrippyAvatar.json";
import useVoiceChatStore from "@/app/store/voiceChatStore";
import BottomSheet from "./ui/BottomSheet";

const Lottie = dynamic(() => import('lottie-react'), { ssr: false });

const VoiceChat = () => {
  // Local component state
  const [hasPermission, setHasPermission] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [shouldPulse, setShouldPulse] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formData, setFormData] = useState({
    country: '',
    type: 'hotel',
    checkIn: '',
    checkOut: '',
    travelMonth: '',
    additionalRequests: ''
  });
  const lottieRef = useRef();
  //@ts-ignore my life my rules
  lottieRef?.current?.setSpeed(0.5);
  
  // Get store actions
  const { 
    setConversation,
    setStatus,
    setIsSpeaking,
    setSessionPin,
    sessionPin,
    status,
    isSpeaking
  } = useVoiceChatStore();

  const handleInputChange = (e:any) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Initialize the conversation hook
  const conversationHook = useConversation({
    onConnect: () => {
      console.log("Connected to ElevenLabs");
      setStatus("connected");
    },
    onDisconnect: () => {
      setStatus("disconnected");
      setSessionPin(null);
      console.log("Disconnected from ElevenLabs");
    },
    onMessage: (message:any) => {
      console.log("Received message:", message);
      setShouldPulse(true);
      setTimeout(() => setShouldPulse(false), 300);
    },
    onError: (error:any) => {
      const errorMsg = typeof error === "string" ? error : error.message;
      setErrorMessage(errorMsg);
      console.error("Error:", error);
    },
  });

  useEffect(() => {
    setConversation(conversationHook);
  }, []);

  useEffect(() => {
    let previousSpeakingState = isSpeaking;
    
    const checkSpeaking = () => {
      if (conversationHook && conversationHook.isSpeaking !== previousSpeakingState) {
        previousSpeakingState = conversationHook.isSpeaking;
        setIsSpeaking(conversationHook.isSpeaking);
      }
    };
    
    const interval = setInterval(checkSpeaking, 100);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const requestMicPermission = async () => {
      if (!navigator?.mediaDevices?.getUserMedia) {
        setErrorMessage("Browser doesn't support microphone access");
        return;
      }

      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        setHasPermission(true);
        stream.getTracks().forEach(track => track.stop());
      } catch (error) {
        if (error instanceof Error) {
          if (error.name === 'NotAllowedError' || error.name === 'PermissionDeniedError') {
            setErrorMessage("Microphone access denied. Please allow access in your browser settings.");
          } else {
            setErrorMessage("Error accessing microphone: " + error.message);
          }
        } else {
          setErrorMessage("Microphone access denied");
        }
        console.error("Error accessing microphone:", error);
      }
    };

    requestMicPermission();
  }, []);

  const handleFormSubmit = async () => {
    try {
      // First create the session with form data
      console.log(formData)
      const response = await api.post('/trippy/sessions', formData);
      //@ts-ignore my life my rules
      if (response.data && response.data.data && response.data.data.pin) {
        //@ts-ignore my life my rules
        setSessionPin(response.data.data.pin);
        //@ts-ignore my life my rules
        console.log("Session PIN stored:", sessionPin);
        
        // After getting the session pin, start the conversation
        const conversationId = await conversationHook.startSession({
          agentId: process.env.NEXT_PUBLIC_ELEVENLABS_AGENT_ID!,
        });
        console.log("Started conversation:", conversationId);
        
        setIsFormOpen(false);
      } else {
        console.error("Session data format unexpected:", response.data);
        setErrorMessage("Couldn't retrieve session data");
      }
    } catch (error) {
      setErrorMessage("Failed to create session");
      console.error("Error creating session:", error);
    }
  };

  const handleStartConversation = async () => {
    if (!hasPermission) {
      const permissionResult = await requestMicPermission();
      if (!hasPermission) return;
    }
    // Instead of starting the conversation directly, open the form
    setIsFormOpen(true);
  };

  const handleEndConversation = async () => {
    try {
      await conversationHook.endSession();
    } catch (error) {
      setErrorMessage("Failed to end conversation");
      console.error("Error ending conversation:", error);
    }
  };

  const toggleMute = async () => {
    try {
      await conversationHook.setVolume({ volume: isMuted ? 1 : 0 });
      setIsMuted(!isMuted);
    } catch (error) {
      setErrorMessage("Failed to change volume");
      console.error("Error changing volume:", error);
    }
  };

  const requestMicPermission = async () => {
    if (!navigator?.mediaDevices?.getUserMedia) {
      setErrorMessage("Browser doesn't support microphone access");
      return false;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      setHasPermission(true);
      stream.getTracks().forEach(track => track.stop());
      return true;
    } catch (error) {
      setErrorMessage("Microphone access denied");
      console.error("Error accessing microphone:", error);
      return false;
    }
  };
  return(
    <><div className="w-full flex flex-col rounded-full size-44 items-center justify-center border-none bg-transparent">
      <div className="space-y-4">
        {status === "connected" ?
          <div className='flex flex-row items-center justify-center'>
            <MicOff className='text-white' />
            <h2 className='text-white font-bold text-xl'>
              Tap to end call
            </h2>
          </div>
          :
          <div className='flex flex-row items-center justify-center'>
            <Mic className='text-white' />
            <h2 className='text-white font-bold text-xl'>
              Tap to talk
            </h2>
          </div>}
        <div className="flex size-44 rounded-full items-center justify-center">
          <AnimatePresence mode="wait">
            <motion.button
              key="voice-button"
              onClick={status === "connected" ? handleEndConversation : handleStartConversation}
              disabled={!hasPermission}
              className="flex flex-col items-center justify-center p-4 size-44 rounded-full bg-white/20 backdrop-blur-md border border-white shadow-xl shadow-white/20"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{
                scale: shouldPulse ? 1.1 : 1,
                opacity: 1
              }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{
                scale: {
                  duration: 0.3,
                  type: "spring",
                  stiffness: 300,
                  damping: 25
                }
              }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <motion.div
                animate={{
                  scale: shouldPulse ? [1, 1.1, 1] : 1,
                  y: status === "connected" ? 0 : [0, -5, 0]
                }}
                transition={{
                  scale: {
                    duration: 0.3,
                    ease: "easeInOut"
                  },
                  y: {
                    duration: 2,
                    repeat: status === "connected" ? 0 : Infinity,
                    ease: "easeInOut"
                  }
                }}
              >
                <Lottie
                  //@ts-ignore
                  lottieRef={lottieRef}
                  animationData={activeAnimation}
                  className="w-24 h-24"
                  loop={status !== "connected"}
                  autoplay={true}
                  initialSegment={status === "connected" ? [100, 380] : [0, 300]} />
              </motion.div>
            </motion.button>
          </AnimatePresence>
        </div>

        <motion.div
          className="text-center text-sm"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          {status === "connected" && (
            <motion.p
              className="text-green-600"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
            >
              {isSpeaking ? "Agent is speaking..." : "Listening..."}
            </motion.p>
          )}
          {errorMessage && (
            <motion.p
              className="text-red-500"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
            >
              {errorMessage}
            </motion.p>
          )}
        </motion.div>
      </div>
    </div>
    <BottomSheet
      isOpen={isFormOpen}
      onClose={() => setIsFormOpen(false)}
    >
        <div className="p-4 space-y-6 bg-white">
          <h2 style={{ fontFamily: 'var(--font-nohemi)' }} className="text-lg text-blue-950 mb-6">Create New Session</h2>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Select Country</label>
              <select
                name="country"
                value={formData.country}
                onChange={handleInputChange}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-blue-950"
              >
                <option value="">Select a country</option>
                <option value="Maldives">Maldives</option>
                <option value="Bali">Bali</option>
                <option value="Vietnam">Vietnam</option>
                <option value="Thailand">Thailand</option>
                <option value="Mauritius">Mauritius</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Type of Stay</label>
              <div className="flex space-x-4">
                <label className="flex items-center space-x-2">
                  <input
                    type="radio"
                    name="type"
                    value="hotel"
                    checked={formData.type === 'hotel'}
                    onChange={handleInputChange}
                    className="text-blue-600" />
                  <span className='font-normal text-blue-950'>Hotel</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input
                    type="radio"
                    name="type"
                    value="trip"
                    checked={formData.type === 'trip'}
                    onChange={handleInputChange}
                    className="text-blue-600" />
                  <span className='font-normal text-blue-950'>Trip</span>
                </label>
              </div>
            </div>

            {formData.type === 'hotel' ? (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Check-in Date</label>
                  <input
                    type="date"
                    name="checkIn"
                    value={formData.checkIn}
                    onChange={handleInputChange}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-normal text-blue-950" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Check-out Date</label>
                  <input
                    type="date"
                    name="checkOut"
                    value={formData.checkOut}
                    onChange={handleInputChange}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-normal text-blue-950" />
                </div>
              </div>
            ) : (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Travel Month</label>
                <input
                  type="month"
                  name="travelMonth"
                  value={formData.travelMonth}
                  onChange={handleInputChange}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-normal text-blue-950" />
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Additional Requests</label>
              <textarea
                name="additionalRequests"
                value={formData.additionalRequests}
                onChange={handleInputChange}
                rows={4}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-normal text-blue-950"
                placeholder="Any special requirements or preferences..." />
            </div>

            <button
            className="w-full p-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
            onClick={handleFormSubmit}
          >
            Start Session
          </button>
          </div>
        </div>
      </BottomSheet></>
  );
};

export default VoiceChat;