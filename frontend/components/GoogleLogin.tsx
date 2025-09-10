import React from "react";
import { Pressable, Text, View, StyleSheet } from "react-native";
import * as WebBrowser from "expo-web-browser";
import * as AuthSession from "expo-auth-session";
import { AntDesign } from "@expo/vector-icons";
import { supabase } from "../lib/supabase";
import GoogleButton from "./GoogleButton";

WebBrowser.maybeCompleteAuthSession();

export default function GoogleLogin({ onSuccess }) {
  const redirectUri = AuthSession.makeRedirectUri({ path: "/auth/callback" });

  const signInWithGoogle = async () => {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: redirectUri,
        scopes:
          "openid email profile https://www.googleapis.com/auth/calendar.readonly",
      },
    });

    if (error) {
      console.log("Google auth error:", error.message);
      return;
    }

    if (data?.url) {
      // Ouvre la page Google
      const result = await WebBrowser.openAuthSessionAsync(
        data.url,
        redirectUri
      );

      if (result.type === "success") {
        // Récupération de la session Supabase
        const { data: sessionData } = await supabase.auth.getSession();
        const authUser = sessionData.session?.user;

        if (authUser && onSuccess) {
          onSuccess(authUser); // équivalent à SignInWithApple
        }
      }
    }
  };

  return <GoogleButton onPress={signInWithGoogle} />;
}

const styles = StyleSheet.create({
  button: {
    backgroundColor: "#4285F4",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    marginBottom: 10,
  },
  content: {
    flexDirection: "row",
    alignItems: "center",
  },
  text: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 10,
  },
});
