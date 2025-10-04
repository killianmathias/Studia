import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import { fetchUserId } from "./user";
import { Alert } from "react-native";
import { useEventStore } from "../store/useEventStore";
import { CalendarEvent, SupabaseEvent } from "../types/types";
import { getProvider } from "./auth";
// import { GoogleSignin } from "@react-native-google-signin/google-signin";

function toCalendarEvent(event: SupabaseEvent): CalendarEvent {
  const start = new Date(event.date);
  const end = new Date(start.getTime() + event.duration * 60 * 1000);
  return { id: event.id, title: event.title, start, end, type: event.type }; // conserve l'id
}
export function useStudiaEvents() {
  const setStudiaEvents = useEventStore((state) => state.setStudiaEvents);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    const getUser = async () => {
      const id = await fetchUserId();
      if (!id) {
        console.error("Erreur : manque userID");
        return;
      }
      setUserId(id);
    };

    getUser();
  }, []);

  useEffect(() => {
    if (!userId) return;

    const fetchEvents = async () => {
      const { data, error } = await supabase
        .from("Event")
        .select("*")
        .eq("user_id", userId);

      if (error) {
        console.error("Erreur lors de la récupération des events :", error);
        return;
      }

      setStudiaEvents((data ?? []).map(toCalendarEvent));
    };

    // 1. Récupération initiale
    fetchEvents();

    // 2. Abonnement en temps réel
    const channel = supabase
      .channel("events-changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "Event",
          filter: `user_id=eq.${userId}`,
        },
        async () => {
          await fetchEvents();
        }
      )
      .subscribe();

    // 3. Cleanup
    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId, setStudiaEvents]);
}
export async function fetchGoogleEvents() {
  const setGoogleEvents = useEventStore((s) => s.setGoogleEvents);
  const providers = await getProvider();
  // if (providers.includes("google")) {
  //   const { accessToken } = await GoogleSignin.getTokens();
  //   const res = await fetch(
  //     "https://www.googleapis.com/calendar/v3/calendars/primary/events",
  //     {
  //       headers: { Authorization: `Bearer ${accessToken}` },
  //     }
  //   );
  //   const data = await res.json();
  //   if (data.items?.length) {
  //     const googleEvents = data.items.map((item: any) => ({
  //       title: item.summary || "Sans titre",
  //       start: new Date(item.start?.dateTime || item.start?.date),
  //       end: new Date(item.end?.dateTime || item.end?.date),
  //     }));
  //     setGoogleEvents(googleEvents);
  //   }
  // }
  return [];
}
