import {
  Dimensions,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import React from "react";
import ThemedSafeAreaView from "../Themed/ThemedSafeAreaView";
import { Ionicons } from "@expo/vector-icons";

const { width, height } = Dimensions.get("window");
const EditButton = ({ onPress, editing }) => {
  return (
    <TouchableOpacity style={styles.editButtonContainer} onPress={onPress}>
      {editing ? (
        <Ionicons name="checkmark-outline" size={height * 0.04} />
      ) : (
        <Ionicons name="create-outline" size={height * 0.04} />
      )}
    </TouchableOpacity>
  );
};

export default EditButton;

const styles = StyleSheet.create({
  editButtonContainer: {},
});
