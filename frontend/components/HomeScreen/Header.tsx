import {
  Dimensions,
  StyleSheet,
  View,
  Image,
  Text,
  TouchableOpacity,
} from "react-native";
import React, { useEffect, useState, useContext } from "react";
import ThemedText from "../Themed/ThemedText";
import ThemedSafeAreaView from "../Themed/ThemedSafeAreaView";
import { supabase } from "../../lib/supabase";
import { ThemeContext } from "../../context/ThemeContext";
import { useNavigation } from "@react-navigation/native";
import XPProgressCircle from "./XPProgresseCircle";
import {
  getLevelFromXp,
  getUserXp,
  getXpForLevel,
} from "../../functions/functions";
import { darkTheme, lightTheme } from "../../themes/themes";

const { width, height } = Dimensions.get("window");

// 1️⃣ Récupérer l'utilisateur Supabase Auth
async function fetchAuthUser() {
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();
  if (error || !user) {
    console.error("Erreur récupération utilisateur :", error?.message);
    return null;
  }
  return user;
}

// 2️⃣ Mapper vers users.id via user_providers
async function fetchUser() {
  const authUser = await fetchAuthUser();
  if (!authUser) return null;

  const { data: providerData, error: providerError } = await supabase
    .from("User_providers")
    .select("user_id")
    .eq("provider_user_id", authUser.id)
    .maybeSingle();

  if (providerError || !providerData) {
    console.error("Erreur mapping user_providers :", providerError?.message);
    return null;
  }

  const userId = providerData.user_id;

  const { data: user, error: userError } = await supabase
    .from("Users")
    .select("*")
    .eq("id", userId)
    .single();

  if (userError) {
    console.error("Erreur récupération user :", userError.message);
    return null;
  }
  return user;
}

const Header = () => {
  const [user, setUser] = useState({
    surname: "",
    profile_picture: "",
    name: "",
  });
  const [userXp, setUserXp] = useState(0); // 👈 ajouter un state pour l'XP
  const { theme, mode } = useContext(ThemeContext);
  const navigation = useNavigation();

  // Charger les données utilisateur
  useEffect(() => {
    const loadUser = async () => {
      const userData = await fetchUser();
      if (userData) setUser(userData);

      const xp = await getUserXp();
      const xpValue = xp[0]?.xp || 0;
      setUserXp(xpValue || 0);
    };
    loadUser();
  }, []);

  return (
    <ThemedSafeAreaView
      style={[styles.header, { backgroundColor: theme.surface }]}
    >
      <ThemedText style={styles.text} type="subtitle">
        Bienvenue {user?.surname}
      </ThemedText>
      <View style={styles.profilePicture}>
        <TouchableOpacity onPress={() => navigation.navigate("profile")}>
          <XPProgressCircle
            imageUri={user.profile_picture}
            size={50}
            strokeWidth={5}
            progress={userXp / getLevelFromXp(userXp).nextLevelXp}
          />
        </TouchableOpacity>
        <View
          style={[styles.levelContainer, { backgroundColor: theme.primary }]}
        >
          <Text style={[styles.level]}>{getLevelFromXp(userXp).level}</Text>
        </View>
      </View>
    </ThemedSafeAreaView>
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
