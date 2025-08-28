import { Dimensions, StyleSheet, Text, View, Alert } from "react-native";
import React, { useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import ThemedText from "../components/Themed/ThemedText";
import ThemedSafeAreaView from "../components/Themed/ThemedSafeAreaView";
import CustomButton from "../components/CustomButton";
import Input from "../components/Input";
import CustomDateAndTimePicker from "../components/CustomDateAndTimePicker";
import DurationPicker from "../components/DurationPicker";
const { height, width } = Dimensions.get("window");
import { supabase } from "../lib/supabase";

function minutesToTime(minutes) {
  const hrs = Math.floor(minutes / 60);
  const mins = minutes % 60;
  // PostgreSQL time format : HH:MM:SS
  return `${hrs.toString().padStart(2, "0")}:${mins
    .toString()
    .padStart(2, "0")}:00`;
}

const AddExamScreen = () => {
  const [date, setDate] = useState(null);
  const [duration, setDuration] = useState(null);
  const [title, setTitle] = useState("");
  const [subject, setSubject] = useState("");
  const [location, setLocation] = useState("");

  async function addEvent() {
    const { data, error } = await supabase
      .from("Event")
      .insert([
        {
          type: "exam",
          title: title,
          date: date,
          duration: minutesToTime(duration),
        },
      ])
      .select();

    if (error) {
      Alert.alert("Erreur", error.message);
      console.log(error.message);
      return null;
    }
    const eventId = data[0].id;
    addExam(eventId);
  }

  async function addExam(id) {
    const { data, error } = await supabase
      .from("Exam")
      .insert([{ event_id: id, location: location, subject: subject }])
      .select();

    if (error) {
      Alert.alert("Erreur", error.message);
      return null;
    } else {
      Alert.alert("Succès");
    }
  }
  return (
    <ThemedSafeAreaView style={styles.addExamScreen}>
      <ThemedText style={styles.addExamText} type="title">
        Ajoutez un examen
      </ThemedText>
      <View style={styles.input}>
        <Input
          icon="text"
          placeholder="Titre"
          value={title}
          onChangeText={(text) => setTitle(text)}
        />
      </View>
      <View style={styles.input}>
        <Input
          icon="book"
          placeholder="Subject"
          value={subject}
          onChangeText={(text) => setSubject(text)}
        />
      </View>
      <View style={styles.input}>
        <Input
          icon="location"
          placeholder="Location"
          value={location}
          onChangeText={(text) => setLocation(text)}
        />
      </View>
      <View style={styles.pickers}>
        <CustomDateAndTimePicker value={date} onChange={setDate} />
        <DurationPicker value={duration} onChange={setDuration} />
      </View>
      <CustomButton title={"Ajouter"} onPress={() => addEvent()} />
    </ThemedSafeAreaView>
  );
};

export default AddExamScreen;

const styles = StyleSheet.create({
  addExamScreen: {
    justifyContent: "center",
    alignItems: "center",
    height,
    width,
  },
  input: {
    marginTop: height * 0.01,
  },
  pickers: {
    flexDirection: "row",
    justifyContent: "center",
    gap: width * 0.05,
  },
});
