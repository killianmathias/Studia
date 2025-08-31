import {
  Dimensions,
  StyleSheet,
  View,
  Image,
  TouchableOpacity,
} from "react-native";
import React, { useEffect, useState, useContext } from "react";
import ThemedText from "../Themed/ThemedText";
import ThemedSafeAreaView from "../Themed/ThemedSafeAreaView";
import { supabase } from "../../lib/supabase";
import { ThemeContext } from "../../context/ThemeContext";

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
  const { theme } = useContext(ThemeContext);

  useEffect(() => {
    const loadUser = async () => {
      const userData = await fetchUser();
      if (userData) setUser(userData);
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
        <TouchableOpacity onPress={() => console.log(user.profile_picture)}>
          <Image
            source={
              user.profile_picture
                ? { uri: encodeURI(user.profile_picture) }
                : require("../../assets/default-profile.png")
            }
            style={styles.profilePictureImage}
          />
        </TouchableOpacity>
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
  },
  profilePictureImage: {
    width: "100%",
    height: "100%",
    borderRadius: 100,
  },
});
