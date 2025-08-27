import React, { useState } from "react";
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  StyleSheet,
  useColorScheme,
  Dimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Picker } from "@react-native-picker/picker";
import { darkTheme, lightTheme } from "../themes/themes";
const { width, height } = Dimensions.get("window");
const LevelPicker = ({ value, onChange }) => {
  const scheme = useColorScheme();
  const options = ["Collège", "Lycée", "Université", "Autre"];
  const textColor = scheme === "dark" ? darkTheme.primary : lightTheme.primary;
  const [visible, setVisible] = useState(false);
  const [level, setLevel] = useState(options[0]);

  const confirmLevel = () => {
    const selectedLevel = level;
    onChange(selectedLevel);
    setVisible(false);
  };

  return (
    <View>
      <TouchableOpacity
        style={[
          styles.input,
          {
            borderColor:
              scheme === "dark" ? darkTheme.primary : lightTheme.primary,
          },
        ]}
        onPress={() => setVisible(true)}
      >
        <Ionicons
          name={"school"}
          size={height * 0.035}
          color={scheme === "dark" ? darkTheme.primary : lightTheme.primary}
          style={styles.icon}
        />
        <Text
          style={{
            color:
              scheme === "dark"
                ? darkTheme.textprimary
                : lightTheme.textprimary,
          }}
        >
          {level}
        </Text>
      </TouchableOpacity>

      <Modal visible={visible} transparent animationType="slide">
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.title}>Sélectionner votre niveau d'études</Text>

            <View style={styles.pickers}>
              <Picker
                selectedValue={level}
                onValueChange={setLevel}
                style={styles.picker}
              >
                {options.map((option) => (
                  <Picker.Item
                    key={option}
                    label={option}
                    value={option}
                    color={textColor}
                  />
                ))}
              </Picker>
            </View>
            <View style={styles.actions}>
              <TouchableOpacity
                onPress={() => setVisible(false)}
                style={styles.cancel}
              >
                <Text>Annuler</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={confirmLevel} style={styles.confirm}>
                <Text style={{ color: "white" }}>OK</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default LevelPicker;

const styles = StyleSheet.create({
  input: {
    borderWidth: 3,
    padding: 12,
    borderRadius: 12,
    marginVertical: 8,
    flexDirection: "row",
    alignItems: "center",
    width: 0.35 * width,
    justifyContent: "center",
  },
  modalContainer: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  modalContent: {
    backgroundColor: "white",
    padding: 20,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 12,
    textAlign: "center",
  },
  pickers: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  picker: {
    flex: 1,
  },
  actions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginTop: 16,
  },
  cancel: {
    padding: 10,
    marginRight: 10,
  },
  confirm: {
    backgroundColor: "#007bff",
    padding: 10,
    borderRadius: 8,
  },
  icon: {
    marginRight: 8,
  },
});
