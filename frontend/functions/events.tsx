import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import { fetchUserId } from "./functions";
import { Alert } from "react-native";

export type SupabaseEvent = {
  id: string;
  title: string;
  user_id: string;
  created_at: string;
  // ajoute ici les autres champs de ta table Event
};

export function useEvents() {
  const [events, setEvents] = useState<SupabaseEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let channel: any;

    async function loadEvents() {
      const userId = await fetchUserId();
      if (!userId) {
        setEvents([]);
        return;
      }

      // 1. Charger les events existants
      const { data, error } = await supabase
        .from("Event")
        .select("*")
        .eq("user_id", userId);

      if (error) {
        Alert.alert("Erreur", error.message);
      } else {
        setEvents(data || []);
      }

      // 2. Ecouter les changements en temps réel
      channel = supabase
        .channel("events-changes")
        .on(
          "postgres_changes",
          {
            event: "*", // INSERT | UPDATE | DELETE
            schema: "public",
            table: "Event",
            filter: `user_id=eq.${userId}`, // 👈 important pour écouter que les events de l'utilisateur
          },
          (payload) => {
            console.log("Changement Event:", payload);

            if (payload.eventType === "INSERT") {
              setEvents((prev) => [payload.new as SupabaseEvent, ...prev]);
              console.log("Événement ajouté !");
            }
            if (payload.eventType === "UPDATE") {
              setEvents((prev) =>
                prev.map((e) =>
                  e.id === payload.new.id ? (payload.new as SupabaseEvent) : e
                )
              );
              console.log("Événement modifié !");
            }
            if (payload.eventType === "DELETE") {
              setEvents((prev) => prev.filter((e) => e.id !== payload.old.id));
              console.log("Événement supprimé !");
            }
          }
        )
        .subscribe();

      setLoading(false);
    }

    loadEvents();

    return () => {
      if (channel) supabase.removeChannel(channel);
    };
  }, []);

  return { events, loading };
}
