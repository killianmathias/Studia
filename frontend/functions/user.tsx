import { supabase } from "../lib/supabase";

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
