import React, { useContext } from "react";
import { Text, Pressable, StyleSheet, View, Dimensions } from "react-native";
import { AntDesign } from "@expo/vector-icons";
import { ThemeContext } from "../context/ThemeContext";

const { height } = Dimensions.get("window");

export default function GoogleButton({ onPress }) {
  const { theme } = useContext(ThemeContext);
  return (
    <Pressable style={styles.button} onPress={onPress}>
      <View style={[styles.content, { backgroundColor: theme.textprimary }]}>
        <AntDesign
          name="google"
          size={height * 0.04}
          color={theme.background}
        />
        {/* <Text style={styles.text}>Se connecter avec Google</Text> */}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    // bleu Google

    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
  },
  content: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    width: height * 0.07,
    height: height * 0.07,
    borderRadius: 5,
  },
  text: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 10,
  },
});
