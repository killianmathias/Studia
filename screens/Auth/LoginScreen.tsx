import {
  SafeAreaView,
  StyleSheet,
  Text,
  View,
  useColorScheme,
  Alert,
  TextInput,
  Button,
} from "react-native";
import React from "react";
import { useState } from "react";
import { supabase } from "../../lib/supabase";
import { darkTheme, lightTheme } from "../../themes/themes";
import Input from "../../components/Input";
import { Dimensions } from "react-native";
import { useNavigation } from "@react-navigation/native";
import CustomButton from "../../components/CustomButton";

const { width, height } = Dimensions.get("window");

const LoginScreen = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const scheme = useColorScheme();
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
          backgroundColor:
            scheme === "dark" ? darkTheme.background : lightTheme.background,
        },
      ]}
    >
      <Text
        style={[
          styles.title,
          {
            color: scheme === "dark" ? darkTheme.primary : lightTheme.primary,
          },
        ]}
      >
        Connexion
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
        {/* <Button
          title="Se connecter"
          disabled={loading}
          onPress={() => signInWithEmail()}
        /> */}
        <CustomButton
          onPress={() => signInWithEmail()}
          title="Se connecter"
          disabled={loading}
        />
      </View>
      <View style={[styles.verticallySpaced, styles.mt20]}>
        <Text style={styles.registerText}>
          Vous n'avez pas encore de compte ?
        </Text>
        <Button
          title="Inscrivez-vous !"
          disabled={loading}
          onPress={() => navigation.navigate("Register")}
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
});
