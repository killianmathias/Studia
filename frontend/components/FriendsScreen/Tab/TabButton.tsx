import {
  Dimensions,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Image,
} from "react-native";
import React, { useContext } from "react";
import { ThemeContext } from "../../../context/ThemeContext";
const { width, height } = Dimensions.get("window");
import { Ionicons } from "@expo/vector-icons";
import ThemedText from "../../Themed/ThemedText";

const TabButton = ({
  onPress,
  title,
  tab,
}: {
  onPress: any;
  title: string;
  tab: string;
}) => {
  const { theme, mode: themeMode } = useContext(ThemeContext);
  return (
    <TouchableOpacity onPress={onPress} style={[styles.container]}>
      <View style={styles.buttonContainer}>
        <ThemedText
          type="subtitle"
          style={[
            styles.text,
            { color: tab === title ? "white" : theme.textprimary },
          ]}
        >
          {title === "friends" ? "Amis" : "Demandes"}
        </ThemedText>
      </View>
    </TouchableOpacity>
  );
};

export default TabButton;

const styles = StyleSheet.create({
  container: {
    width: width / 2.5,
    height: "60%",
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
