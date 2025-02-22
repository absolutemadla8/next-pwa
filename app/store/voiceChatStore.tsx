// store/voiceChatStore.ts
import { create } from 'zustand';

interface VoiceChatState {
  // Core conversation state
  conversation: any;
  status: string;
  isSpeaking: boolean;
  
  // Essential session info
  sessionPin: string | null;
  
  // Actions
  setConversation: (conversation: any) => void;
  setStatus: (status: string) => void;
  setIsSpeaking: (isSpeaking: boolean) => void;
  setSessionPin: (pin: string | null) => void;
  clearSessionPin: () => void;
}

// Create store with proper initialization
const useVoiceChatStore = create<VoiceChatState>((set) => ({
  // Initial state
  conversation: null,
  status: "disconnected",
  isSpeaking: false,
  sessionPin: null,
  
  // Actions - with safe state updates
  setConversation: (conversation) => set({ conversation }),
  setStatus: (status) => set((state) => {
    // Only update if different to avoid unnecessary rerenders
    if (state.status !== status) {
      return { status };
    }
    return {};
  }),
  setIsSpeaking: (isSpeaking) => set((state) => {
    // Only update if different to avoid unnecessary rerenders
    if (state.isSpeaking !== isSpeaking) {
      return { isSpeaking };
    }
    return {};
  }),
  setSessionPin: (pin) => set({ sessionPin: pin }),
  clearSessionPin: () => set({ sessionPin: null }),
}));

export default useVoiceChatStore;