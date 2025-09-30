import { create } from "zustand";
import { persist, combine, createJSONStorage } from "zustand/middleware";
import { CalendarEvent, User } from "../types/types";
import { Session } from "@supabase/supabase-js";

export const useAppStore = create(
  persist(
    combine(
      {
        // Authentication
        session: null as null | Session,
        user: null as null | User,
        isProfileComplete: false,

        // Events sources
        googleEvents: [] as CalendarEvent[],
        appleEvents: [] as CalendarEvent[],
        studiaEvents: [] as CalendarEvent[],
        events: [] as CalendarEvent[],

        // UI / global state
        loading: false,
      },
      (set, get) => ({
        load: () => set(() => ({ loading: true })),
        stopLoad: () => set(() => ({ loading: false })),
        setSession: (s: Session) => set({ session: s }),
        setUser: (user: User) => set({ user }),
        setIsProfileComplete: (bool: boolean) =>
          set({ isProfileComplete: bool }),

        setGoogleEvents: (e: CalendarEvent[]) =>
          set((state) => ({
            googleEvents: e,
            events: [...state.studiaEvents, ...e, ...state.appleEvents],
          })),

        setAppleEvents: (e: CalendarEvent[]) =>
          set((state) => ({
            appleEvents: e,
            events: [...state.studiaEvents, ...state.googleEvents, ...e],
          })),

        setStudiaEvents: (e: CalendarEvent[]) =>
          set((state) => ({
            studiaEvents: e,
            events: [...e, ...state.googleEvents, ...state.appleEvents],
          })),
      })
    ),
    {
      name: "app-storage",
      storage: createJSONStorage(() => {
        if (typeof window !== "undefined") return localStorage;
        return {
          getItem: () => null,
          setItem: () => {},
          removeItem: () => {},
        };
      }),
    }
  )
);
