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
import ThemedText from "../Themed/ThemedText";

const SelectorButton = ({
  setMastery,
  mastery,
  color,
}: {
  setMastery: any;
  mastery: string;
  color: string;
}) => {
  return (
    <TouchableOpacity
      onPress={() => setMastery(mastery)}
      style={[styles.container]}
    >
      <View style={styles.buttonContainer}>
        <ThemedText type="subtitle" style={{ color }}>
          {mastery}
        </ThemedText>
      </View>
    </TouchableOpacity>
  );
};

export default SelectorButton;

const styles = StyleSheet.create({
  container: {
    width: (width * 0.7) / 4,
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
