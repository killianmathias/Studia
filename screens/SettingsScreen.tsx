import { Alert, TouchableOpacity, StyleSheet, Button } from "react-native";
import ThemedSafeAreaView from "../components/Themed/ThemedSafeAreaView";
import ThemedText from "../components/Themed/ThemedText";
import { supabase } from "../lib/supabase";
import { useEffect, useState, useContext } from "react";
import { ThemeContext } from "../context/ThemeContext";

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
export default function SettingsScreen() {
  const { theme, setMode, mode } = useContext(ThemeContext);
  return (
    <ThemedSafeAreaView
      style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
    >
      <ThemedText style={styles.title} type="title">
        Profil
      </ThemedText>
      <TouchableOpacity onPress={() => logOut()}>
        <ThemedText style={styles.btn}>Se Déconnecter</ThemedText>
      </TouchableOpacity>
      <Button title="Clair" onPress={() => setMode("light")} />
      <Button title="Sombre" onPress={() => setMode("dark")} />
      <Button title="Système" onPress={() => setMode("system")} />
      <ThemedText style={styles.text}>{mode}</ThemedText>
    </ThemedSafeAreaView>
  );
}
const styles = StyleSheet.create({});
