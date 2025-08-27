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
const CustomDatePicker = ({ value, onChange }) => {
  const today = new Date();
  const [visible, setVisible] = useState(false);

  const [day, setDay] = useState(value ? value.getDate() : today.getDate());
  const [month, setMonth] = useState(
    value ? value.getMonth() + 1 : today.getMonth() + 1
  );
  const [year, setYear] = useState(
    value ? value.getFullYear() : today.getFullYear()
  );
  const scheme = useColorScheme();

  // 🔹 Fonction utilitaire : nb de jours d’un mois donné
  const getDaysInMonth = (m, y) => new Date(y, m, 0).getDate();

  // Génération dynamique des options
  const days = Array.from(
    { length: getDaysInMonth(month, year) },
    (_, i) => i + 1
  );
  const months = Array.from({ length: 12 }, (_, i) => i + 1);
  const years = Array.from(
    { length: 100 },
    (_, i) => today.getFullYear() - 100 + i + 1
  ); // croissant

  // ✅ Si le jour sélectionné est trop grand (ex: 31 → février), on le corrige
  if (day > getDaysInMonth(month, year)) {
    setDay(getDaysInMonth(month, year));
  }

  const confirmDate = () => {
    const selectedDate = new Date(year, month - 1, day);
    onChange(selectedDate);
    setVisible(false);
  };

  return (
    <View>
      <TouchableOpacity
        style={[
          styles.input,
          {
            borderColor:
              scheme == "dark" ? darkTheme.primary : lightTheme.primary,
          },
        ]}
        onPress={() => setVisible(true)}
      >
        <Ionicons
          name={"calendar"}
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
          {value
            ? `${value.getDate().toString().padStart(2, "0")}/${(
                value.getMonth() + 1
              )
                .toString()
                .padStart(2, "0")}/${value.getFullYear()}`
            : `${today.getDate().toString().padStart(2, "0")}/${(
                today.getMonth() + 1
              )
                .toString()
                .padStart(2, "0")}/${today.getFullYear()}`}
        </Text>
      </TouchableOpacity>

      <Modal visible={visible} transparent animationType="slide">
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.title}>Sélectionner une date</Text>

            <View style={styles.pickers}>
              <Picker
                selectedValue={day}
                onValueChange={setDay}
                style={[styles.picker, { width: 100 }]}
              >
                {days.map((d) => (
                  <Picker.Item
                    key={d}
                    label={d.toString()}
                    value={d}
                    color={
                      scheme === "dark" ? darkTheme.primary : lightTheme.primary
                    }
                  />
                ))}
              </Picker>

              <Picker
                selectedValue={month}
                onValueChange={setMonth}
                style={[styles.picker, { width: 120 }]}
              >
                {months.map((m) => (
                  <Picker.Item
                    key={m}
                    label={m.toString()}
                    value={m}
                    color={
                      scheme === "dark" ? darkTheme.primary : lightTheme.primary
                    }
                  />
                ))}
              </Picker>

              <Picker
                selectedValue={year}
                onValueChange={setYear}
                style={[styles.picker, { width: 120 }]}
              >
                {years.map((y) => (
                  <Picker.Item
                    key={y}
                    label={y.toString()}
                    value={y}
                    color={
                      scheme === "dark" ? darkTheme.primary : lightTheme.primary
                    }
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
              <TouchableOpacity onPress={confirmDate} style={styles.confirm}>
                <Text style={{ color: "white" }}>OK</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default CustomDatePicker;

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
