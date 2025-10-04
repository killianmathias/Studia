// RegisterStep2Screen.js
import React, { useState, useEffect, useContext } from "react";
import {
  View,
  Text,
  SafeAreaView,
  StyleSheet,
  Alert,
  Dimensions,
} from "react-native";
import { supabase } from "../../../lib/supabase";
import Input from "../../../components/Input";
import CustomButton from "../../../components/CustomButton";
import CustomDatePicker from "../../../components/CustomDatePicker";
import LevelPicker from "../../../components/LevelPicker";
import Checkbox from "expo-checkbox";
import { ThemeContext } from "../../../context/ThemeContext";
import { useNavigation, useRoute } from "@react-navigation/native";
import LoadImageButton from "../../../components/ProfileScreen/LoadImageButton";
import { fetchUserId } from "../../../functions/user";
import { useAuthStore } from "../../../store/useAuthStore";

const { width, height } = Dimensions.get("window");

function calculateAge(birthDate) {
  if (!birthDate) return null;
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const m = today.getMonth() - birthDate.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) age--;
  return age;
}

const RegisterStep2Screen = () => {
  const { user, profile } = useAuthStore();
  const [surname, setSurname] = useState(profile?.surname || "");
  const [name, setName] = useState(profile?.name || "");
  const [username, setUsername] = useState(profile?.username || "");

  const [dateOfBirth, setDateOfBirth] = useState(new Date());
  const [level, setLevel] = useState("");
  const [checked, setChecked] = useState(false);
  const [loading, setLoading] = useState(false);
  const [age, setAge] = useState(0);
  const { theme } = useContext(ThemeContext);
  const updateProfile = useAuthStore((s) => s.updateProfile);

  useEffect(() => {
    if (dateOfBirth) setAge(calculateAge(dateOfBirth));
  }, [dateOfBirth]);
  const navigation = useNavigation();

  async function finishRegistration() {
    if (username === "" || surname === "" || name === "") {
      Alert.alert(
        "Veuillez saisir tous les champs afin de compléter votre inscription"
      );
      return;
    }
    if (!checked) {
      Alert.alert("Erreur", "Veuillez accepter les conditions");
      return;
    }
    if (age < 12) {
      Alert.alert("Âge minimum requis : 12 ans");
      return;
    }

    setLoading(true);
    updateProfile({
      username: username,
      name: name,
      surname: surname,
      date_of_birth: dateOfBirth,
      level: level,
    });
    setLoading(false);
  }

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.background }]}
    >
      <Text style={[styles.title, { color: theme.primary }]}>
        Vos informations
      </Text>
      <View style={styles.inputContainer}>
        <Input
          placeholder="Nom d'utilisateur"
          value={username}
          onChangeText={setUsername}
          autoCapitalize="none"
        />
      </View>
      <View style={styles.inputContainer}>
        <Input
          placeholder="Prénom"
          value={surname}
          onChangeText={setSurname}
          type="text"
          autoCapitalize="none"
        />
      </View>
      <View style={styles.inputContainer}>
        <Input
          placeholder="Nom"
          value={name}
          onChangeText={setName}
          type="text"
          autoCapitalize="none"
        />
      </View>
      <View style={styles.inputContainer}>
        <CustomDatePicker value={dateOfBirth} onChange={setDateOfBirth} />
        <LevelPicker value={level} onChange={setLevel} />
      </View>

      <View style={styles.checkboxContainer}>
        <Checkbox value={checked} onValueChange={setChecked} />
        <Text>J'accepte les conditions d'utilisations</Text>
      </View>
      <View style={styles.finishButton}>
        <CustomButton
          title="Finaliser l'inscription"
          onPress={finishRegistration}
          disabled={loading}
        />
      </View>
    </SafeAreaView>
  );
};

export default RegisterStep2Screen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  title: { fontSize: width / 12, fontWeight: "bold", marginBottom: 20 },
  row: { flexDirection: "row", gap: 10 },
  checkboxContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 20,
    gap: width * 0.01,
  },
  inputContainer: {
    flexDirection: "row",
    marginTop: height * 0.01,
    gap: width * 0.02,
    alignItems: "center",
    justifyContent: "center",
  },
  finishButton: {
    marginTop: height * 0.02,
  },
});
