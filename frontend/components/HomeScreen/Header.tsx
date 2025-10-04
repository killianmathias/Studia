import {
  Dimensions,
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";

import React, { useEffect, useState, useContext } from "react";
import ThemedText from "../Themed/ThemedText";
import ThemedSafeAreaView from "../Themed/ThemedSafeAreaView";
import { supabase } from "../../lib/supabase";
import { ThemeContext } from "../../context/ThemeContext";
import { useNavigation } from "@react-navigation/native";
import XPProgressCircle from "./XPProgresseCircle";
import { useAuthStore } from "../../store/useAuthStore";

const { width, height } = Dimensions.get("window");

const Header = () => {
  const { theme, mode } = useContext(ThemeContext);
  const navigation = useNavigation();
  const profile = useAuthStore((s) => s.profile);
  const user = useAuthStore((s) => s.user);

  return (
    <View style={[styles.header, { backgroundColor: theme.surface }]}>
      {profile ? (
        <>
          <ThemedText style={styles.text} type="subtitle">
            Bienvenue {profile?.surname}
          </ThemedText>
          <View style={styles.profilePicture}>
            <TouchableOpacity onPress={() => navigation.navigate("profile")}>
              {user?.aud != "authenticated" ? (
                <ActivityIndicator />
              ) : (
                <XPProgressCircle
                  imageUri={profile.profile_picture}
                  size={50}
                  strokeWidth={5}
                />
              )}
            </TouchableOpacity>
          </View>
        </>
      ) : (
        <></>
      )}
    </View>
  );
};

export default Header;

const styles = StyleSheet.create({
  text: {
    marginLeft: width * 0.025,
  },

  header: {
    width: width * 0.9,
    height: 0.08 * height,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderRadius: 25,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
  },
  profilePicture: {
    width: height * 0.06,
    height: height * 0.06,
    marginRight: width * 0.025,
    borderRadius: 100,
    alignItems: "center",
  },
  profilePictureImage: {
    width: "100%",
    height: "100%",
    borderRadius: 100,
  },
  levelContainer: {
    position: "absolute",
    top: height * 0.045,
    width: 0.02 * height,
    height: 0.02 * height,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 100,
  },
  level: {
    fontWeight: 700,
    fontSize: 15,
    color: "#FFFFFF",
  },
});
