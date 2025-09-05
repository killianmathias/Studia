import {
  Dimensions,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Image,
} from "react-native";
import React, { useContext } from "react";
import { ThemeContext } from "../../context/ThemeContext";
const { width, height } = Dimensions.get("window");
import { Ionicons } from "@expo/vector-icons";

const ThemeButton = ({ onPress, mode }: { onPress: any; mode: string }) => {
  const { theme, mode: themeMode } = useContext(ThemeContext);
  return (
    <TouchableOpacity onPress={onPress} style={[styles.container]}>
      <View style={styles.buttonContainer}>
        <Ionicons
          name={
            mode === "light" ? "sunny" : mode === "dark" ? "moon" : "desktop"
          }
          size={30}
          color={mode == themeMode ? theme.primary : theme.textsecondary}
        />
      </View>
    </TouchableOpacity>
  );
};

export default ThemeButton;

const styles = StyleSheet.create({
  container: {
    width: width / 4,
    height: "80%",
    borderRadius: 15,
  },
  circle: {
    width: 20,
    height: 20,
    borderRadius: 100,
    borderWidth: 2,
    justifyContent: "center",
    alignItems: "center",
  },
  rond: {
    width: 10,
    height: 10,
    borderRadius: 100,
    backgroundColor: "red",
  },
  buttonContainer: {
    justifyContent: "center",
    alignItems: "center",
    width: "100%",
    height: "100%",
  },
});
