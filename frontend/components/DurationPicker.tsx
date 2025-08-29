import React, { useState } from "react";
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Picker } from "@react-native-picker/picker";
import { useContext } from "react";
import { ThemeContext } from "../context/ThemeContext";

const { width, height } = Dimensions.get("window");

const DurationPicker = ({ value, onChange }) => {
  const [visible, setVisible] = useState(false);
  const { theme } = useContext(ThemeContext);

  // Valeurs initiales (durée en minutes)
  const initialHours = Math.floor((value || 0) / 60);
  const initialMinutes = (value || 0) % 60;

  const [hours, setHours] = useState(initialHours);
  const [minutes, setMinutes] = useState(initialMinutes);

  const hoursOptions = Array.from({ length: 24 }, (_, i) => i); // 0 → 23h
  const minutesOptions = Array.from({ length: 12 }, (_, i) => i * 5); // 0, 5, 10 ... 55

  const confirmDuration = () => {
    const totalMinutes = hours * 60 + minutes;
    onChange(totalMinutes); // renvoie la durée en minutes
    setVisible(false);
  };

  const formatValue = (val) => val.toString().padStart(2, "0");

  return (
    <View>
      <TouchableOpacity style={[styles.input]} onPress={() => setVisible(true)}>
        <Ionicons
          name="time"
          size={height * 0.035}
          color={"#007bff"}
          style={styles.icon}
        />
        <Text>{`${formatValue(hours)}h${formatValue(minutes)}`}</Text>
      </TouchableOpacity>

      <Modal visible={visible} transparent animationType="slide">
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.title}>Sélectionner une durée</Text>

            <View style={styles.pickers}>
              <Picker
                selectedValue={hours}
                onValueChange={setHours}
                style={styles.picker}
              >
                {hoursOptions.map((h) => (
                  <Picker.Item
                    key={h}
                    label={`${h} h`}
                    value={h}
                    color={theme.primary}
                  />
                ))}
              </Picker>

              <Picker
                selectedValue={minutes}
                onValueChange={setMinutes}
                style={styles.picker}
              >
                {minutesOptions.map((m) => (
                  <Picker.Item
                    key={m}
                    label={`${formatValue(m)} min`}
                    value={m}
                    color={theme.primary}
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
              <TouchableOpacity
                onPress={confirmDuration}
                style={styles.confirm}
              >
                <Text style={{ color: "white" }}>OK</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default DurationPicker;

const styles = StyleSheet.create({
  input: {
    borderWidth: 3,
    padding: 12,
    borderRadius: 12,
    marginVertical: 8,
    flexDirection: "row",
    alignItems: "center",
    width: 0.25 * width,
    justifyContent: "center",
    borderColor: "#007bff",
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
  pickers: { flexDirection: "row", justifyContent: "space-between" },
  picker: { flex: 1 },
  actions: { flexDirection: "row", justifyContent: "flex-end", marginTop: 16 },
  cancel: { padding: 10, marginRight: 10 },
  confirm: { backgroundColor: "#007bff", padding: 10, borderRadius: 8 },
  icon: { marginRight: 8 },
});
