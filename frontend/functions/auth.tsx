import { supabase } from "../lib/supabase";
import { fetchUserId } from "./user";
// export const getGoogleAccessToken = async () => {
//   const { data, error } = await supabase.auth.getSession();
//   if (error) {
//     console.error(error);
//     return;
//   }

//   const session = data.session;
//   console.log("Session: ", session);
//   const googleAccessToken = session?.access_token;
//   console.log("Google Access Token:", googleAccessToken);

//   return googleAccessToken;
// };

export async function getProvider() {
  let providers = [];
  const userId = await fetchUserId();
  const { data, error } = await supabase
    .from("User_providers")
    .select("provider")
    .eq("provider_user_id", userId);
  if (error) {
    console.log("Erreur: ", error.message);
  }
  if (data) {
    data.forEach((element) => {
      providers.push(element.provider);
    });
  } else {
    console.log("Pas de données");
  }
  return providers;
}
