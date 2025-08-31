import {
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  Button,
  Alert,
  useColorScheme,
  Dimensions,
} from "react-native";
import React, { useState, useEffect } from "react";
import { supabase } from "../../lib/supabase";
import { lightTheme, darkTheme } from "../../themes/themes";
import Input from "../../components/Input";
import { useNavigation } from "@react-navigation/native";
import CustomButton from "../../components/CustomButton";
import CustomDatePicker from "../../components/CustomDatePicker";
import LevelPicker from "../../components/LevelPicker";
import { Checkbox } from "expo-checkbox";
import { useContext } from "react";
import { ThemeContext } from "../../context/ThemeContext";
import LoginWithGoogle from "./LoginWithGoogle";
import { SignInWithApple } from "./SignInWithApple";

const { width, height } = Dimensions.get("window");

function calculateAge(birthDate) {
  if (!birthDate) return null;
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  const dayDiff = today.getDate() - birthDate.getDate();

  if (monthDiff < 0 || (monthDiff === 0 && dayDiff < 0)) {
    age--;
  }
  return age;
}
// ... imports identiques

const RegisterScreen = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState(null);
  const [surname, setSurname] = useState("");
  const [name, setName] = useState("");
  const [level, setLevel] = useState("");
  const [checked, setChecked] = useState(false);
  const [loading, setLoading] = useState(false);
  const [age, setAge] = useState(0);
  const { theme } = useContext(ThemeContext);

  useEffect(() => {
    if (dateOfBirth) {
      setAge(calculateAge(dateOfBirth));
    }
  }, [dateOfBirth]);

  async function signUpWithEmail() {
    setLoading(true);
    if (email === "" || surname === "" || name === "" || password === "") {
      Alert.alert("Veuillez remplir tous les champs");
      setLoading(false);
      return;
    }
    if (!checked) {
      Alert.alert("Erreur", "Veuillez accepter les conditions d'utilisation");
      setLoading(false);
      return;
    }
    if (age < 12) {
      Alert.alert("Vous n'avez pas l'âge requis pour vous inscrire sur Studia");
      setLoading(false);
      return;
    }

    const { data, error } = await supabase.auth.signUp({
      email: email,
      password: password,
    });

    if (error) {
      Alert.alert(error.message);
      setLoading(false);
      return;
    }

    if (data.user) {
      await signUpDatabase(data.user);
    }
  }

  async function signUpDatabase(authUser) {
    try {
      // 1. Créer l'entrée dans la table "users"
      const { data: newUser, error: userError } = await supabase
        .from("Users")
        .insert([
          {
            email: authUser.email,
            name: name,
            surname: surname,
            level: level,
            date_of_birth: dateOfBirth,
          },
        ])
        .select()
        .single();

      if (userError) throw userError;

      // 2. Créer le mapping avec auth.users
      const { error: providerError } = await supabase
        .from("User_providers")
        .insert([
          {
            user_id: newUser.id,
            provider_user_id: authUser.id,
            provider: "email",
          },
        ]);

      if (providerError) throw providerError;

      Alert.alert("Inscription réussie !");
    } catch (err) {
      Alert.alert("Erreur lors de l'inscription", err.message);
    } finally {
      setLoading(false);
    }
  }

  const navigation = useNavigation();

  return (
    <SafeAreaView
      style={[
        styles.container,
        {
          backgroundColor: theme.background,
        },
      ]}
    >
      <Text
        style={[
          styles.title,
          {
            color: theme.primary,
          },
        ]}
      >
        Inscription
      </Text>

      <View style={[styles.verticallySpaced, styles.mt20, styles.names]}>
        <Input
          icon="person"
          onChangeText={(text) => setSurname(text)}
          value={surname}
          placeholder="John"
          autoCapitalize={"none"}
          number={2}
        />
        <Input
          icon="person"
          onChangeText={(text) => setName(text)}
          value={name}
          placeholder="Doe"
          autoCapitalize={"none"}
          number={2}
        />
      </View>

      <View style={[styles.verticallySpaced]}>
        <Input
          icon="mail"
          onChangeText={(text) => setEmail(text)}
          value={email}
          placeholder="email@address.com"
          autoCapitalize={"none"}
        />
      </View>

      <View style={styles.verticallySpaced}>
        <Input
          icon="lock-closed"
          onChangeText={(text) => setPassword(text)}
          value={password}
          secureTextEntry={true}
          placeholder="Password"
          autoCapitalize={"none"}
          type="password"
        />
      </View>

      <View style={[styles.verticallySpaced, styles.pickers]}>
        <CustomDatePicker value={dateOfBirth} onChange={setDateOfBirth} />
        <LevelPicker value={level} onChange={setLevel} />
      </View>

      <View
        style={[styles.verticallySpaced, styles.mt20, styles.checkboxContainer]}
      >
        <Checkbox
          style={styles.checkbox}
          value={checked}
          onValueChange={() => setChecked(!checked)}
          color={checked ? theme.primary : undefined}
        />
        <Text>J'accepte les conditions d'utilisation</Text>
      </View>

      <View style={[styles.verticallySpaced, styles.mt20]}>
        <CustomButton
          title="S'inscrire"
          disabled={loading}
          onPress={() => signUpWithEmail()}
        />
      </View>

      <View style={styles.lineContainer}>
        <View style={styles.line} />
        <Text style={styles.text}>ou alors inscrivez-vous via</Text>
        <View style={styles.line} />
      </View>

      {/* Ici tu pourras ajouter LoginWithGoogle + SignInWithApple avec la même logique */}
      {/* <LoginWithGoogle /> */}
      <SignInWithApple />

      <View style={[styles.verticallySpaced, styles.mt20]}>
        <Text style={styles.textLogin}>Vous avez déjà un compte ? </Text>
        <Button
          title="Connectez-vous !"
          disabled={loading}
          onPress={() => navigation.navigate("Connexion")}
        />
      </View>
    </SafeAreaView>
  );
};
export default RegisterScreen;
const styles = StyleSheet.create({
  container: {
    padding: 12,
    width: width,
    height: height,
    justifyContent: "center",
    alignItems: "center",
  },
  verticallySpaced: {
    paddingTop: 4,
    paddingBottom: 4,
    alignSelf: "stretch",
    alignItems: "center",
  },
  mt20: {
    marginTop: 20,
  },
  title: {
    fontSize: width / 12,
    fontWeight: 700,
  },
  names: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
  },
  pickers: {
    flexDirection: "row",
    justifyContent: "center",
    gap: width * 0.05,
  },
  checkboxContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 10,
  },
  checkbox: {},
  textLogin: {
    fontSize: 18,
  },
  lineContainer: {
    flexDirection: "row", // place les éléments en ligne
    alignItems: "center", // aligne verticalement
    marginVertical: 20,
    width: "70%",
  },
  line: {
    flex: 1, // prend tout l’espace dispo
    height: 1,
    backgroundColor: "#000",
  },
  text: {
    marginHorizontal: 10, // espace entre le texte et les lignes
    fontSize: 14,
    color: "#333",
  },
});
