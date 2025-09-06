import { StyleSheet, Text, View, TouchableOpacity, Alert } from "react-native";
import React from "react";
import { supabase } from "../../lib/supabase";

async function logOut() {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (user != null) {
    const { error } = await supabase.auth.signOut();
    if (error) Alert.alert(error.message);
  }
}

function confirm() {
  Alert.alert(
    "Se déconnecter",
    "Voulez-vous vous déconnecter ?",
    [
      {
        text: "Non",
        style: "cancel",
      },
      {
        text: "Oui",
        onPress: () => {
          logOut();
        },
      },
    ],
    { cancelable: false }
  );
}

const LogoutButton = () => {
  return (
    <TouchableOpacity style={styles.logoutButton} onPress={confirm}>
      <Text style={{ color: "white", fontWeight: "700" }}>Se Déconnecter</Text>
    </TouchableOpacity>
  );
};

export default LogoutButton;

const styles = StyleSheet.create({
  logoutButton: {
    backgroundColor: "red",
    padding: 10,
    borderRadius: 10,
    alignItems: "center",
  },
});
