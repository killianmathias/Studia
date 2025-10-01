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
  const names = authUser?.user_metadata?.full_name.split(" ");
  const [profile_picture, setProfile_picture] = useState(
    authUser?.user_metadata?.avatar_url || ""
  );
  const [username, setUsername] = useState("");
  const [surname, setSurname] = useState(
    authUser?.user_metadata?.family_name || names[0] || ""
  );
  const [name, setName] = useState(
    authUser?.user_metadata?.given_name || names[1] || ""
  );
  const [dateOfBirth, setDateOfBirth] = useState(null);
  const [level, setLevel] = useState("");
  const [checked, setChecked] = useState(false);
  const [loading, setLoading] = useState(false);
  const [age, setAge] = useState(0);
  const { theme } = useContext(ThemeContext);

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

    try {
      let user = authUser;

      // Utilisateur email classique
      if (provider !== "google" && provider !== "apple" && email && password) {
        const { data, error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        user = data.user;
      }

      if (!user) throw new Error("Utilisateur non trouvé");

      // Vérifier si l'utilisateur existe déjà
      const { data: existingUser } = await supabase
        .from("Users")
        .select("*")
        .eq("id", user.id)
        .single();

      let newUserId = user.id;
      let authId = await fetchUserId();

      if (!existingUser) {
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
              profile_picture,
            },
          ])
          .select()
          .single();

        if (dbError) throw dbError;
        newUserId = newUser.id;

        await supabase.from("User_providers").insert([
          {
            user_id: newUserId,
            provider_user_id: authId,
            provider: provider || "email",
          },
        ]);
      } else {
        await supabase
          .from("Users")
          .update({
            username,
            name,
            surname,
            date_of_birth: dateOfBirth,
            level,
            profile_picture,
          })
          .eq("id", newUserId);
      }

      // Succès → redirection immédiate
      Alert.alert("Inscription réussie !");
      navigation.reset({
        index: 0,
        routes: [{ name: "MainTabs" as never }], // 👈 Il faut donner un vrai nom à ton composant MainTabs
      });
    } catch (err: any) {
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
