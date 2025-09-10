import React, { useState, useContext, useEffect } from "react";
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
import { ThemeContext } from "../context/ThemeContext";

const { width, height } = Dimensions.get("window");

const CustomDateAndTimePicker = ({ value, onChange }) => {
  const today = new Date();
  const [visible, setVisible] = useState(false);

  const [day, setDay] = useState(value ? value.getDate() : today.getDate());
  const [month, setMonth] = useState(
    value ? value.getMonth() + 1 : today.getMonth() + 1
  );
  const [year, setYear] = useState(
    value ? value.getFullYear() : today.getFullYear()
  );

  const [hour, setHour] = useState(value ? value.getHours() : today.getHours());
  const [minute, setMinute] = useState(
    value ? value.getMinutes() : today.getMinutes()
  );

  const { theme } = useContext(ThemeContext);

  const getDaysInMonth = (m, y) => new Date(y, m, 0).getDate();

  const days = Array.from(
    { length: getDaysInMonth(month, year) },
    (_, i) => i + 1
  );
  const months = Array.from({ length: 12 }, (_, i) => i + 1);
  const years = Array.from({ length: 5 }, (_, i) => today.getFullYear() + i);

  const hours = Array.from({ length: 24 }, (_, i) => i);
  const minutes = Array.from({ length: 12 }, (_, i) => i * 5);

  useEffect(() => {
    if (day > getDaysInMonth(month, year)) setDay(getDaysInMonth(month, year));
  }, [month, year]);

  const confirmDate = () => {
    const selectedDate = new Date(year, month - 1, day, hour, minute);
    onChange(selectedDate);
    setVisible(false);
  };

  const formatValue = (val) => val.toString().padStart(2, "0");

  return (
    <View>
      <TouchableOpacity
        style={[
          styles.input,
          { borderColor: theme.primary },
          { backgroundColor: theme.surface },
        ]}
        onPress={() => setVisible(true)}
      >
        <Ionicons
          name="calendar"
          size={height * 0.035}
          color={theme.primary}
          style={styles.icon}
        />
        <Text style={{ color: theme.textprimary }}>
          {value
            ? `${formatValue(value.getDate())}/${formatValue(
                value.getMonth() + 1
              )}/${value.getFullYear()} ${formatValue(
                value.getHours()
              )}:${formatValue(value.getMinutes())}`
            : `${formatValue(today.getDate())}/${formatValue(
                today.getMonth() + 1
              )}/${today.getFullYear()} ${formatValue(
                today.getHours()
              )}:${formatValue(today.getMinutes())}`}
        </Text>
      </TouchableOpacity>

      <Modal visible={visible} transparent animationType="slide">
        <View
          style={[styles.modalContainer, { backgroundColor: theme.background }]}
        >
          <View
            style={[styles.modalContent, { backgroundColor: theme.background }]}
          >
            <Text style={[styles.title, { color: theme.primary }]}>
              Sélectionner date et heure
            </Text>

            <View style={styles.pickers}>
              <Picker
                selectedValue={day}
                onValueChange={setDay}
                style={styles.picker}
              >
                {days.map((d) => (
                  <Picker.Item
                    key={d}
                    label={d.toString()}
                    value={d}
                    color={theme.primary}
                  />
                ))}
              </Picker>

              <Picker
                selectedValue={month}
                onValueChange={setMonth}
                style={styles.picker}
              >
                {months.map((m) => (
                  <Picker.Item
                    key={m}
                    label={m.toString()}
                    value={m}
                    color={theme.primary}
                  />
                ))}
              </Picker>

              <Picker
                selectedValue={year}
                onValueChange={setYear}
                style={styles.picker}
              >
                {years.map((y) => (
                  <Picker.Item
                    key={y}
                    label={y.toString()}
                    value={y}
                    color={theme.primary}
                  />
                ))}
              </Picker>
            </View>

            <View style={styles.pickers}>
              <Picker
                selectedValue={hour}
                onValueChange={setHour}
                style={styles.picker}
              >
                {hours.map((h) => (
                  <Picker.Item
                    key={h}
                    label={formatValue(h)}
                    value={h}
                    color={theme.primary}
                  />
                ))}
              </Picker>

              <Picker
                selectedValue={minute}
                onValueChange={setMinute}
                style={styles.picker}
              >
                {minutes.map((m) => (
                  <Picker.Item
                    key={m}
                    label={formatValue(m)}
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
                <Text style={{ color: theme.textprimary }}>Annuler</Text>
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

export default CustomDateAndTimePicker;

const styles = StyleSheet.create({
  input: {
    borderWidth: 3,
    padding: 12,
    borderRadius: 12,
    marginVertical: 8,
    flexDirection: "row",
    alignItems: "center",
    width: 0.45 * width,
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
  pickers: { flexDirection: "row", justifyContent: "space-between" },
  picker: { flex: 1 },
  actions: { flexDirection: "row", justifyContent: "flex-end", marginTop: 16 },
  cancel: { padding: 10, marginRight: 10 },
  confirm: { backgroundColor: "#007bff", padding: 10, borderRadius: 8 },
  icon: { marginRight: 8 },
});
