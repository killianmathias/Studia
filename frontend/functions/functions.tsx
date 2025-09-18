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
export async function getUserXp(userId) {
  if (!userId) return 0;

  const { data: users_id, error: firstError } = await supabase
    .from("User_providers")
    .select("user_id")
    .eq("provider_user_id", userId)
    .limit(1);

  if (firstError) {
    Alert.alert("Erreur", firstError.message);
    return 0;
  }
  const { data: xp, error: secondError } = await supabase
    .from("Users")
    .select("xp")
    .eq("id", users_id[0].user_id);
  if (secondError) {
    Alert.alert("Erreur", secondError.message);
    return 0;
  }
  return xp || 0;
}

export async function fetchUserInfos(userId) {
  if (!userId) return [];

  const { data: users_id, error: firstError } = await supabase
    .from("User_providers")
    .select("user_id")
    .eq("provider_user_id", userId)
    .single();

  if (firstError) {
    Alert.alert("Erreur", firstError.message);
    return [];
  }
  const { data: userInfos, error: secondError } = await supabase
    .from("Users")
    .select(
      "email, name, surname, date_of_birth, profile_picture, level, username"
    )
    .eq("id", users_id.user_id);
  if (secondError) {
    Alert.alert("Erreur", secondError.message);
    console.log("Erreur");
    return [];
  }
  console.log(userInfos[0]);
  return userInfos[0] || [];
}

export async function fetchUserInfosFromUserId(userId) {
  if (!userId) {
    console.warn("⚠️ fetchUserInfosFromUserId appelé sans userId");
    return null;
  }

  const { data, error } = await supabase
    .from("Users")
    .select(
      "email, name, surname, date_of_birth, profile_picture, level, username"
    )
    .eq("id", userId)
    .limit(1);

  if (error) {
    // Alert.alert("Erreur", error.message);
    console.error("Erreur Supabase:", error.message);
    return null;
  }

  return data && data.length > 0 ? data[0] : null;
}
export const formatTwoDigits = (num: number) => {
  return num.toString().padStart(2, "0");
};

// Récupérer un signed URL à partir du path stocké en base
export async function getSignedUrlFromPath(path) {
  // expires en secondes (ex: 3600 = 1 heure)
  const { data, error } = await supabase.storage
    .from("avatars")
    .createSignedUrl(path, 3600);

  if (error) throw error;
  return data.signedUrl;
}

export async function fetchUserIdFromUsers(userId) {
  if (!userId) return;

  const { data, error } = await supabase
    .from("User_providers")
    .select("user_id")
    .eq("provider_user_id", userId);
  if (error) {
    Alert.alert("Une erreur est survenue");
    return "";
  }
  return data[0].user_id;
}

export async function fetchAuthIdFromUserId(userId) {
  if (!userId) return;

  const { data, error } = await supabase
    .from("User_providers")
    .select("provider_user_id")
    .eq("user_id", userId);
  if (error) {
    Alert.alert("Une erreur est survenue");
    return "";
  }
  return data[0].provider_user_id;
}

export async function verifyProfileCompletion(userId) {
  if (!userId) {
    return false;
  }
  const { data, error } = await supabase
    .from("User_providers")
    .select("user_id")
    .eq("provider_user_id", userId)
    .single();
  if (!data) {
    return false;
  }
  const { data: userData, error: userError } = await supabase
    .from("Users")
    .select("*")
    .eq("id", data.user_id);
  if (!userData) {
    return false;
  } else {
    return true;
  }
}

export async function getUserLevel() {
  const uid = await fetchUserId();
  if (!uid) {
    return;
  }
  const userId = await fetchUserIdFromUsers(uid);
  if (!userId) {
    return;
  }
  const { data, error } = await supabase
    .from("Users")
    .select("level")
    .eq("id", userId)
    .single();
  if (error) {
    console.log("Erreur: ", error.message);
  }
  if (!data) {
    return;
  }
  return data.level;
}
