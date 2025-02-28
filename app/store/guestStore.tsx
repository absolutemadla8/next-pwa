import { create } from 'zustand';

export interface Guest {
  title: string;
  firstName: string;
  lastName: string;
  type: string;
  email: string;
  isdCode: string;
  contactNumber: string;
  panCardNumber?: string | null;
  passportNumber?: string | null;
  passportExpiry?: string | null;
}

interface GuestStore {
  // The initial guest list to compare against
  initialGuests: Guest[];
  // The current guest list
  guests: Guest[];
  // Flag indicating whether the current guest list has changed
  hasChanged: boolean;

  // Methods to manage guest entries:
  setInitialGuests: (guests: Guest[]) => void;
  setGuests: (guests: Guest[]) => void;
  addGuest: (guest: Guest) => void;
  updateGuest: (index: number, updatedGuest: Partial<Guest>) => void;
  removeGuest: (index: number) => void;
  clearGuests: () => void;

  // Method to return the change flag
  checkChanges: () => boolean;
  // Resets the change flag by marking the current list as the initial list
  resetChanges: () => void;
}

/**
 * A simple deep equality check for guest arrays using JSON.stringify.
 * Note: This approach works for plain objects and arrays where key ordering is predictable.
 */
const areGuestsEqual = (a: Guest[], b: Guest[]): boolean => {
  return JSON.stringify(a) === JSON.stringify(b);
};

export const useGuestStore = create<GuestStore>((set, get) => ({
  initialGuests: [],
  guests: [],
  hasChanged: false,

  // Set the initial guest list. This is used as a baseline for change detection.
  setInitialGuests: (guests: Guest[]) =>
    set({ initialGuests: guests, guests: JSON.parse(JSON.stringify(guests)), hasChanged: false }),

  // Replace the entire guest list
  setGuests: (guests: Guest[]) => {
    const changed = !areGuestsEqual(guests, get().initialGuests);
    set({ guests, hasChanged: changed });
  },

  // Add a new guest to the list
  addGuest: (guest: Guest) => {
    const newGuests = [...get().guests, guest];
    const changed = !areGuestsEqual(newGuests, get().initialGuests);
    set({ guests: newGuests, hasChanged: changed });
  },

  // Update an existing guest by its index
  updateGuest: (index: number, updatedGuest: Partial<Guest>) => {
    const newGuests = get().guests.map((guest, i) =>
      i === index ? { ...guest, ...updatedGuest } : guest
    );
    const changed = !areGuestsEqual(newGuests, get().initialGuests);
    set({ guests: newGuests, hasChanged: changed });
  },

  // Remove a guest from the list by its index
  removeGuest: (index: number) => {
    const newGuests = get().guests.filter((_, i) => i !== index);
    const changed = !areGuestsEqual(newGuests, get().initialGuests);
    set({ guests: newGuests, hasChanged: changed });
  },

  // Clear all guests from the list
  clearGuests: () => {
    const newGuests: Guest[] = [];
    const changed = !areGuestsEqual(newGuests, get().initialGuests);
    set({ guests: newGuests, hasChanged: changed });
  },

  // Returns the current change flag
  checkChanges: () => get().hasChanged,

  // Resets the change flag by setting the current guests as the new initialGuests.
  resetChanges: () => {
    const currentGuests = JSON.parse(JSON.stringify(get().guests));
    set({ initialGuests: currentGuests, hasChanged: false });
  }
}));