import React from "react";
import { View, StyleSheet, Dimensions } from "react-native";
import Input from "../Input";
import CustomDateAndTimePicker from "../CustomDateAndTimePicker";
import DurationPicker from "../DurationPicker";

const { height, width } = Dimensions.get("window");
export default function ExamForm({
  title,
  setTitle,
  subject,
  setSubject,
  location,
  setLocation,
  date,
  setDate,
  duration,
  setDuration,
}) {
  return (
    <>
      <View style={styles.inputContainer}>
        <Input
          placeholder="Titre"
          value={title}
          onChangeText={setTitle}
          icon="text"
        />
      </View>

      <View style={styles.inputContainer}>
        <Input
          placeholder="Matière"
          value={subject}
          onChangeText={setSubject}
          icon="book"
        />
      </View>

      <View style={styles.inputContainer}>
        <Input
          placeholder="Lieu"
          value={location}
          onChangeText={setLocation}
          icon="location"
        />
      </View>

      <View style={styles.row}>
        <CustomDateAndTimePicker value={date} onChange={setDate} />
        <DurationPicker value={duration} onChange={setDuration} />
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  inputContainer: {
    marginBottom: height * 0.01,
  },
  row: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 8,
    gap: width * 0.04,
  },
});
