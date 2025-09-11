import { StyleSheet, Text, View, TouchableOpacity, Alert } from "react-native";
import React from "react";
import { supabase } from "../../lib/supabase";
import { useAlert } from "../CustomAlertService";

async function logOut() {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (user != null) {
    const { error } = await supabase.auth.signOut();
    if (error) Alert.alert(error.message);
  }
}

const LogoutButton = () => {
  const { showAlert } = useAlert();
  const confirm = async () => {
    const result = await showAlert({
      title: "Se déconnecter",
      message: "Voulez-vous vous déconnecter ?",
      buttons: [
        { text: "Non", value: false, style: { backgroundColor: "grey" } },
        { text: "Oui", value: true },
      ],
    });
    if (result) {
      logOut();
    } else {
      return;
    }
  };
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
