import {
  Alert,
  TouchableOpacity,
  StyleSheet,
  Button,
  View,
  Dimensions,
} from "react-native";
import ThemedSafeAreaView from "../components/Themed/ThemedSafeAreaView";
import ThemedText from "../components/Themed/ThemedText";
import { supabase } from "../lib/supabase";
import { useContext, useState } from "react";
import { ThemeContext } from "../context/ThemeContext";
import EditButton from "../components/profileScreen/EditButton";
import ThemeButton from "../components/profileScreen/ThemeButton";
import ThemeSelector from "../components/profileScreen/ThemeSelector";
import LogoutButton from "../components/profileScreen/LogoutButton";

const { width, height } = Dimensions.get("window");

async function logOut() {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (user != null) {
    let { error } = supabase.auth.signOut();
    if (error) Alert.alert(error.message);
  }
}
// --- Screens ---
export default function ProfileScreen() {
  const { theme, setMode, mode } = useContext(ThemeContext);
  const [editing, setEditing] = useState(false);
  return (
    <ThemedSafeAreaView
      style={{ justifyContent: "center", alignItems: "center" }}
    >
      <EditButton onPress={() => setEditing(!editing)} editing={editing} />
      <ThemedText style={styles.title} type="title">
        Profil
      </ThemedText>

      <ThemeSelector />
      <ThemedText style={styles.text}>{mode}</ThemedText>
      {/* <TouchableOpacity onPress={() => logOut()}>
        <ThemedText style={styles.btn}>Se Déconnecter</ThemedText>
      </TouchableOpacity> */}
      <LogoutButton />
    </ThemedSafeAreaView>
  );
}
const styles = StyleSheet.create({
  themeButtonContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
    width,
  },
});
