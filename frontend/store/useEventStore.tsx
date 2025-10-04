import { create } from "zustand";
import { CalendarEvent } from "../types/types";

interface EventState {
  googleEvents: CalendarEvent[];
  appleEvents: CalendarEvent[];
  studiaEvents: CalendarEvent[];
  allEvents: CalendarEvent[];
  setGoogleEvents: (e: CalendarEvent[]) => void;
  setAppleEvents: (e: CalendarEvent[]) => void;
  setStudiaEvents: (e: CalendarEvent[]) => void;
}

export const useEventStore = create<EventState>((set, get) => ({
  googleEvents: [],
  appleEvents: [],
  studiaEvents: [],
  allEvents: [],

  setGoogleEvents: (e) =>
    set({
      googleEvents: e,
      allEvents: [...get().studiaEvents, ...e, ...get().appleEvents],
    }),

  setAppleEvents: (e) =>
    set({
      appleEvents: e,
      allEvents: [...get().studiaEvents, ...get().googleEvents, ...e],
    }),

  setStudiaEvents: (e) =>
    set({
      studiaEvents: e,
      allEvents: [...e, ...get().googleEvents, ...get().appleEvents],
    }),
}));
