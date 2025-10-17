import { supabase } from "../lib/supabase";
import { SupabaseEvent, CalendarEvent } from "../types/types";
import { Alert } from "react-native";
import { useState, useEffect } from "react";
import { fetchUserId } from "./user";

export function getXpForLevel(level: number): number {
  return 100 * (level - 1) * (level - 1);
}

export function getLevelFromXp(xp: number) {
  let level = 1;
  // console.log("level 2 : ", getLevelFromXp(2));
  while (xp >= getXpForLevel(level + 1)) {
    level++;
  }
  let currentXp = xp;
  if (level > 1) {
    currentXp = xp - getXpForLevel(level);
  }
  const nextLevelXp = getXpForLevel(level + 1) - getXpForLevel(level);

  return { level, currentXp, nextLevelXp };
}

export function useUserXp(providerUserId) {
  const [xp, setXp] = useState(0);

  useEffect(() => {
    if (!providerUserId) return;

    let userId;
    let subscription;

    const fetchInitialXp = async () => {
      // Récupérer le user_id à partir du providerUserId
      const { data: users_id, error: firstError } = await supabase
        .from("User_providers")
        .select("user_id")
        .eq("provider_user_id", providerUserId)
        .single();

      if (firstError) return console.error(firstError.message);

      userId = users_id.user_id;

      // Récupérer l'XP initiale
      const { data: xpData, error: secondError } = await supabase
        .from("Users")
        .select("xp")
        .eq("id", userId)
        .single();

      if (secondError) return console.error(secondError.message);

      setXp(xpData?.xp || 0);

      // Subscription Realtime sur l'utilisateur
      subscription = supabase
        .channel(`realtime-user-xp-${userId}`)
        .on(
          "postgres_changes",
          {
            event: "UPDATE",
            schema: "public",
            table: "Users",
            filter: `id=eq.${userId}`,
          },
          (payload) => {
            setXp(payload.new.xp || 0);
          }
        )
        .subscribe();
    };

    fetchInitialXp();

    // Nettoyage de la subscription à la destruction du composant
    return () => {
      if (subscription) {
        supabase.removeChannel(subscription);
      }
    };
  }, [providerUserId]);

  return xp;
}
export function useUserInfos(providerUserId) {
  const [userInfos, setUserInfos] = useState(null);

  useEffect(() => {
    if (!providerUserId) return;

    let subscription;

    const fetchInitialInfos = async () => {
      try {
        // 1. Récupérer userId
        const { data: userRecord, error: firstError } = await supabase
          .from("User_providers")
          .select("user_id")
          .eq("provider_user_id", providerUserId)
          .single();

        if (firstError) {
          console.error("Erreur User_providers:", firstError.message);
          return;
        }
        console.log(userRecord);

        const userId = userRecord.user_id;

        // 2. Récupérer infos utilisateur
        const { data: infos, error: secondError } = await supabase
          .from("Users")
          .select(
            "email, name, surname, date_of_birth, profile_picture, level, username, xp"
          )
          .eq("id", userId)
          .single();

        if (secondError) {
          console.error("Erreur Users:", secondError.message);
          return;
        }

        setUserInfos(infos);

        // 3. Subscription Realtime
        subscription = supabase
          .channel(`public:Users:id=eq.${userId}`)
          .on(
            "postgres_changes",
            {
              event: "UPDATE",
              schema: "public",
              table: "Users",
              filter: `id=eq.${userId}`,
            },
            (payload) => {
              setUserInfos(payload.new);
            }
          )
          .subscribe();
      } catch (err) {
        console.error("Erreur useUserInfos:", err);
      }
    };

    fetchInitialInfos();

    return () => {
      if (subscription) supabase.removeChannel(subscription);
    };
  }, [providerUserId]);

  return userInfos;
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

export function getXpForSessionTime(
  sessionTime: number,
  finished: boolean
): number {
  const FINISH_BONUS = 30;

  // Sécurité : pas d’XP pour une durée négative ou nulle
  if (sessionTime <= 0) return 0;

  // Table des paliers de ratio XP/min
  const xpTiers = [
    { min: 0, max: 10, ratio: 1 },
    { min: 10, max: 30, ratio: 1.5 },
    { min: 30, max: 60, ratio: 2 },
    { min: 60, max: Infinity, ratio: 2.5 },
  ];

  // Trouver le bon palier
  const tier = xpTiers.find(
    (t) => sessionTime >= t.min && sessionTime < t.max
  )!;

  // Calcul de base
  let xp = sessionTime * tier.ratio;

  // Bonus de fin uniquement si la session est terminée
  if (finished) xp += FINISH_BONUS;

  // (Optionnel) : Plafonner l’XP pour éviter les abus
  const MAX_XP = 300;
  return Math.min(Math.round(xp), MAX_XP);
}
