// import React, { useEffect } from "react";
// import { Alert } from "react-native";
// import {
//   GoogleSignin,
//   GoogleSigninButton,
//   statusCodes,
// } from "@react-native-google-signin/google-signin";
// import { supabase } from "../lib/supabase";
// import * as SecureStore from "expo-secure-store";
// import { useNavigation } from "@react-navigation/native";

// type Props = {
//   mode?: "signIn" | "link"; // par défaut "signIn"
// };

// export default function GoogleSignInButton({ mode = "signIn" }: Props) {
//   const navigation = useNavigation();

//   useEffect(() => {
//     // Configure Google sign-in au montage
//     GoogleSignin.configure({
//       scopes: ["https://www.googleapis.com/auth/calendar.readonly"],
//       webClientId:
//         "955178443030-051q3cpk4c92m9ghh45ceq67csptigbd.apps.googleusercontent.com",
//       offlineAccess: true,
//     });
//   }, []);

//   const handlePress = async () => {
//     try {
//       await GoogleSignin.hasPlayServices();
//       const userInfo = await GoogleSignin.signIn();
//       const { idToken, accessToken } = await GoogleSignin.getTokens();

//       if (!idToken) {
//         throw new Error("Impossible de récupérer l'idToken Google.");
//       }

//       // Sauvegarde accessToken localement si tu veux t’en servir côté client
//       if (accessToken) {
//         await SecureStore.setItemAsync("googleAccessToken", accessToken);
//       }

//       if (mode === "signIn") {
//         // --- connexion / création compte Supabase
//         const { data: authData, error: authError } =
//           await supabase.auth.signInWithIdToken({
//             provider: "google",
//             token: idToken,
//           });

//         if (authError) throw authError;

//         const authUser = authData?.user;
//         console.log("Signed in with Google:", authUser);

//         // Vérifier si user existe déjà dans ta table Users
//         const { data: existingUser } = await supabase
//           .from("Users")
//           .select("*")
//           .eq("id", authUser?.id)
//           .single();

//         if (!existingUser) {
//           // Rediriger vers la 2ème étape inscription
//           navigation.navigate(
//             "RegisterStep2" as never,
//             {
//               authUser,
//               provider: "google",
//             } as never
//           );
//         }
//       } else if (mode === "link") {
//         // --- liaison au compte existant
//         const { data, error } = await supabase.auth.linkIdentity({
//           provider: "google",
//           token: idToken,
//         });
//         if (error) throw error;
//         console.log("Google account linked:", data);
//         Alert.alert("Succès", "Ton compte Google a bien été lié !");
//       }
//     } catch (error: any) {
//       console.log("Google Sign-in error:", error);

//       if (error.code === statusCodes.SIGN_IN_CANCELLED) return;
//       if (error.code === statusCodes.IN_PROGRESS) return;
//       if (error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
//         Alert.alert("Erreur", "Google Play Services non disponible");
//         return;
//       }

//       Alert.alert("Erreur", error.message || "Échec de connexion Google");
//     }
//   };

//   return (
//     <GoogleSigninButton
//       size={GoogleSigninButton.Size.Wide}
//       color={GoogleSigninButton.Color.Light}
//       onPress={handlePress}
//     />
//   );
// }
