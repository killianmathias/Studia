import {
  Dimensions,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import React, { useContext } from "react";
import ThemedSafeAreaView from "../Themed/ThemedSafeAreaView";
import { Ionicons } from "@expo/vector-icons";
import { ThemeContext } from "../../context/ThemeContext";

const { width, height } = Dimensions.get("window");
const EditButton = ({ onPress, editing }) => {
  const { theme } = useContext(ThemeContext);
  return (
    <TouchableOpacity style={styles.editButtonContainer} onPress={onPress}>
      {editing ? (
        <Ionicons
          name="checkmark-outline"
          size={height * 0.04}
          color={theme.textsecondary}
        />
      ) : (
        <Ionicons
          name="create-outline"
          size={height * 0.04}
          color={theme.textsecondary}
        />
      )}
    </TouchableOpacity>
  );
};

export default EditButton;

const styles = StyleSheet.create({
  editButtonContainer: {},
});
