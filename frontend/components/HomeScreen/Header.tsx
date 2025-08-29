import {
  Dimensions,
  StyleSheet,
  View,
  Image,
  TouchableOpacity,
} from "react-native";
import React, { useEffect, useState } from "react";
import ThemedText from "../Themed/ThemedText";
import ThemedSafeAreaView from "../Themed/ThemedSafeAreaView";
import { supabase } from "../../lib/supabase";
import { blue } from "react-native-reanimated/lib/typescript/Colors";
import { ThemeContext } from "../../context/ThemeContext";
import { useContext } from "react";

const { width, height } = Dimensions.get("window");

async function fetchUserId() {
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

async function fetchUser() {
  const userId = await fetchUserId();
  if (!userId) return "";

  const { data: user, error } = await supabase
    .from("User")
    .select("*")
    .eq("id", userId)
    .single();

  if (error) {
    console.error("Erreur récupération username :", error.message);
    return "";
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
      const user = await fetchUser();
      setUser(user);
      console.log(user);
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
            source={{ uri: encodeURI(user.profile_picture) }}
            defaultSource={require("../../assets/default-profile.png")}
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
