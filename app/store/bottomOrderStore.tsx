import { create } from 'zustand';

interface BottomOrderState {
  infoTitle: string;
  infoSubtitle: string;
  buttonText: string;
  handleCreateItinerary: () => void;
  setInfoTitle: (title: string) => void;
  setInfoSubtitle: (subtitle: string) => void;
  setButtonText: (text: string) => void;
  setHandleCreateItinerary: (handler: () => void) => void;
}

const useBottomOrderStore = create<BottomOrderState>((set) => ({
  infoTitle: '',
  infoSubtitle: '',
  buttonText: '',
  handleCreateItinerary: () => {},
  setInfoTitle: (title) => set({ infoTitle: title }),
  setInfoSubtitle: (subtitle) => set({ infoSubtitle: subtitle }),
  setButtonText: (text) => set({ buttonText: text }),
  setHandleCreateItinerary: (handler) => set({ handleCreateItinerary: handler }),
}));

export default useBottomOrderStore;