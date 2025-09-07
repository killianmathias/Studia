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
import { useRoute } from "@react-navigation/native";
import LoadImageButton from "../../../components/ProfileScreen/LoadImageButton";

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
  const route = useRoute();
  const { email, password, provider, authUser } = route.params || {};
  const [profile_picture, setProfile_picture] = useState("");
  const [username, setUsername] = useState("");
  const [surname, setSurname] = useState("");
  const [name, setName] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState(null);
  const [level, setLevel] = useState("");
  const [checked, setChecked] = useState(false);
  const [loading, setLoading] = useState(false);
  const [age, setAge] = useState(0);
  const { theme } = useContext(ThemeContext);

  useEffect(() => {
    if (dateOfBirth) setAge(calculateAge(dateOfBirth));
  }, [dateOfBirth]);

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

    try {
      let user = authUser;

      // si c’est une inscription email classique, on crée d’abord l’utilisateur
      if (provider !== "apple" && email && password) {
        const { data, error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        user = data.user;
      }

      if (!user) throw new Error("Utilisateur non trouvé");

      // enregistrement en DB
      const { data: newUser, error: dbError } = await supabase
        .from("Users")
        .insert([
          {
            email: user.email,
            name,
            surname,
            level,
            date_of_birth: dateOfBirth,
            username,
          },
        ])
        .select()
        .single();

      if (dbError) throw dbError;

      await supabase.from("User_providers").insert([
        {
          user_id: newUser.id,
          provider_user_id: user.id,
          provider: provider || "email",
        },
      ]);

      Alert.alert("Inscription réussie !");
    } catch (err) {
      Alert.alert("Erreur", err.message);
    } finally {
      setLoading(false);
    }
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
