// RegisterStep1Screen.js
import React, { useContext, useState } from "react";
import { View, Text, SafeAreaView, StyleSheet, Dimensions } from "react-native";
import { useNavigation } from "@react-navigation/native";
import Input from "../../../components/Input";
import CustomButton from "../../../components/CustomButton";
import { SignInWithApple } from "./../SignInWithApple";
import { ThemeContext } from "../../../context/ThemeContext";
import ThemedText from "../../../components/Themed/ThemedText";
import TextualButton from "../../../components/TextualButton";

const { width, height } = Dimensions.get("window");

const RegisterStep1Screen = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigation = useNavigation();
  const { theme } = useContext(ThemeContext);

  const goToStep2 = () => {
    if (email != "" && password != "") {
      navigation.navigate("RegisterStep2", { email, password });
    }
  };

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.background }]}
    >
      <Text style={[styles.title, { color: theme.primary }]}>
        Créer un compte
      </Text>

      {/* Connexion par email */}
      <View style={styles.inputContainer}>
        <Input
          icon="mail"
          onChangeText={setEmail}
          value={email}
          placeholder="email@address.com"
          type="email"
          autoCapitalize={"none"}
        />
      </View>
      <View style={styles.inputContainer}>
        <Input
          icon="lock-closed"
          onChangeText={setPassword}
          value={password}
          secureTextEntry
          type="password"
          placeholder="Mot de passe"
        />
      </View>
      <View style={styles.inputContainer}>
        <CustomButton title="Continuer" onPress={goToStep2} />
      </View>
      <View style={styles.lineContainer}>
        <View style={[styles.line, { backgroundColor: theme.textsecondary }]} />
        <Text style={[styles.text, { color: theme.textsecondary }]}>
          ou inscrivez-vous via
        </Text>
        <View style={[styles.line, { backgroundColor: theme.textsecondary }]} />
      </View>

      {/* Providers */}
      {/* <LoginWithGoogle /> */}
      <View style={styles.otherLoginContainer}>
        <SignInWithApple
          onSuccess={(authUser) => {
            // on passe juste le provider à l’étape 2
            navigation.navigate("RegisterStep2", {
              provider: "apple",
              authUser,
            });
          }}
        />
      </View>

      <Text style={[styles.textButton, { color: theme.textprimary }]}>
        Vous avez déjà un compte ?
      </Text>
      <TextualButton
        onPress={() => navigation.navigate("Connexion")}
        title={"Connectez-vous !"}
      />
    </SafeAreaView>
  );
};

export default RegisterStep1Screen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  title: { fontSize: width / 12, fontWeight: "bold", marginBottom: 20 },
  lineContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 20,
    width: "70%",
  },
  line: { flex: 1, height: 1, backgroundColor: "#000" },
  text: { marginHorizontal: 10, fontSize: 14, color: "#333" },
  inputContainer: {
    marginTop: height * 0.01,
  },
  textButton: {
    marginTop: height * 0.02,
    fontSize: 18,
  },
  otherLoginContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
});
