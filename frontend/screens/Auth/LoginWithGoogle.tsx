import { StyleSheet, Text, View } from "react-native";
import {
  GoogleSignin,
  GoogleSigninButton,
  statusCodes,
} from "@react-native-google-signin/google-signin";
import React, { useContext } from "react";
import { ThemeContext } from "../../context/ThemeContext";

const LoginWithGoogle = () => {
  const { theme, mode } = useContext(ThemeContext);
  GoogleSignin.configure({
    scopes: ["https://www.googleapis.com/auth/calendar-readonly"],
    webClientId: "",
  });
  return (
    <GoogleSigninButton
      size={GoogleSigninButton.Size.Icon}
      color={
        mode === "dark"
          ? GoogleSigninButton.Color.Dark
          : GoogleSigninButton.Color.Light
      }
      onPress={async () => {
        try {
          await GoogleSignin.hasPlayServices();
          const userInfos = await GoogleSignin.signIn();
          console.log(JSON.stringify(userInfos, null, 2));
        } catch (error: any) {
          if (error.code === statusCodes.SIGN_IN_CANCELLED) {
          } else if (error.code === statusCodes.IN_PROGRESS) {
          } else if (error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
          } else {
          }
        }
      }}
    />
  );
};

export default LoginWithGoogle;

const styles = StyleSheet.create({});
