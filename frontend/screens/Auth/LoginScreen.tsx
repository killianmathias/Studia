import {
  SafeAreaView,
  StyleSheet,
  Text,
  View,
  Alert,
  Button,
} from "react-native";
import React from "react";
import { useState } from "react";
import { supabase } from "../../lib/supabase";
import Input from "../../components/Input";
import { Dimensions } from "react-native";
import { useNavigation } from "@react-navigation/native";
import CustomButton from "../../components/CustomButton";
import { useContext } from "react";
import { ThemeContext } from "../../context/ThemeContext";
import { SignInWithApple } from "./SignInWithApple";
import TextualButton from "../../components/TextualButton";
import { useAlert } from "../../components/CustomAlertService";
import GoogleAuth from "../../components/GoogleAuth";
import GoogleSignInButton from "../../components/GoogleAuth";
const { width, height } = Dimensions.get("window");

const LoginScreen = () => {
  const { showAlert } = useAlert();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { theme, setMode, mode } = useContext(ThemeContext);
  async function signInWithEmail() {
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({
      email: email,
      password: password,
    });

    if (error) Alert.alert(error.message);
    setLoading(false);
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
        Se connecter
      </Text>
      <View style={[styles.verticallySpaced, styles.mt20]}>
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

      <View style={[styles.verticallySpaced, styles.mt20]}>
        <CustomButton
          onPress={() => signInWithEmail()}
          title="Se connecter"
          disabled={loading}
        />
      </View>

      <View style={styles.lineContainer}>
        <View style={[styles.line, { backgroundColor: theme.textsecondary }]} />
        <Text style={[styles.text, { color: theme.textsecondary }]}>
          ou alors connectez-vous via
        </Text>
        <View style={[styles.line, { backgroundColor: theme.textsecondary }]} />
      </View>
      <View style={styles.otherLoginContainer}>
        <GoogleSignInButton />
        <SignInWithApple />
      </View>
      <View style={[styles.verticallySpaced, styles.mt20]}>
        <Text style={[styles.registerText, { color: theme.textprimary }]}>
          Vous n'avez pas encore de compte ?
        </Text>
        <TextualButton
          title="Inscrivez-vous !"
          disabled={loading}
          onPress={() => navigation.navigate("RegisterStep1")}
        />
      </View>
    </SafeAreaView>
  );
};

export default LoginScreen;

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
  registerText: {
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
  otherLoginContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
});
