import React from "react";
import { View } from "react-native";
import {
  GoogleSignin,
  GoogleSigninButton,
  statusCodes,
} from "@react-native-google-signin/google-signin";
import { supabase } from "../lib/supabase";
import { useNavigation } from "@react-navigation/native";
import * as SecureStore from "expo-secure-store";

export default function GoogleSignInButton() {
  const navigation = useNavigation();

  GoogleSignin.configure({
    scopes: ["https://www.googleapis.com/auth/calendar.readonly"],
    webClientId:
      "955178443030-051q3cpk4c92m9ghh45ceq67csptigbd.apps.googleusercontent.com",
    offlineAccess: true,
  });

  return (
    <GoogleSigninButton
      size={GoogleSigninButton.Size.Wide}
      color={GoogleSigninButton.Color.Light}
      onPress={async () => {
        try {
          await GoogleSignin.hasPlayServices();
          const userInfo = await GoogleSignin.signIn();
          const { idToken, accessToken } = await GoogleSignin.getTokens();
          await SecureStore.setItemAsync("googleAccessToken", accessToken);
          const { data: authData, error: authError } =
            await supabase.auth.signInWithIdToken({
              provider: "google",
              token: idToken,
            });

          if (authError) throw authError;

          const authUser = authData.user;
          console.log(authUser);

          // Vérifier si l'utilisateur existe déjà dans Users
          const { data: existingUser } = await supabase
            .from("Users")
            .select("*")
            .eq("id", authUser.id)
            .single();

          console.log("Existing User:", existingUser);

          if (!existingUser) {
            // Créer l'entrée minimale pour redirection

            navigation.navigate("RegisterStep2", {
              authUser,
              provider: "google",
            });
          }

          // Redirection vers la page pour compléter l'inscription
        } catch (error: any) {
          console.log(error);
          if (error.code === statusCodes.SIGN_IN_CANCELLED) return;
          if (error.code === statusCodes.IN_PROGRESS) return;
          if (error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) return;
        }
      }}
    />
  );
}
