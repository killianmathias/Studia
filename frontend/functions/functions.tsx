import { supabase } from "../lib/supabase";
import { SupabaseEvent, CalendarEvent } from "../types/types";
import { Alert } from "react-native";
export async function fetchUserId() {
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();
  if (error) {
    console.error("Erreur récupération utilisateur :", error.message);
    return null;
  }
  return user.id;
}

export async function fetchEvents(): Promise<SupabaseEvent[]> {
  const userId = await fetchUserId();
  if (!userId) return [];

  const { data: events, error } = await supabase
    .from("Event")
    .select("*")
    .eq("user_id", userId);

  if (error) {
    Alert.alert("Erreur", error.message);
    return [];
  }
  return events || [];
}

export function getXpForLevel(level: number): number {
  return 100 * level * level;
}

export function getLevelFromXp(xp: number) {
  let level = 1;
  while (xp >= getXpForLevel(level + 1)) {
    level++;
  }

  const currentXp = xp - getXpForLevel(level);
  const nextLevelXp = getXpForLevel(level + 1) - getXpForLevel(level);

  return { level, currentXp, nextLevelXp };
}
export async function getUserXp() {
  const userId = await fetchUserId();
  if (!userId) return 0;

  const { data: users_id, error: firstError } = await supabase
    .from("User_providers")
    .select("user_id")
    .eq("provider_user_id", userId)
    .single();

  if (firstError) {
    Alert.alert("Erreur", firstError.message);
    return 0;
  }
  const { data: xp, error: secondError } = await supabase
    .from("Users")
    .select("xp")
    .eq("id", users_id.user_id);
  if (secondError) {
    Alert.alert("Erreur", secondError.message);
    return 0;
  }
  return xp || 0;
}
