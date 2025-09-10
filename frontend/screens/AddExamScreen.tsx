import {
  Dimensions,
  StyleSheet,
  Text,
  View,
  Alert,
  Button,
} from "react-native";
import React, { useContext, useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import ThemedText from "../components/Themed/ThemedText";
import ThemedSafeAreaView from "../components/Themed/ThemedSafeAreaView";
import CustomButton from "../components/CustomButton";
import Input from "../components/Input";
import CustomDateAndTimePicker from "../components/CustomDateAndTimePicker";
import DurationPicker from "../components/DurationPicker";
const { height, width } = Dimensions.get("window");
import { supabase } from "../lib/supabase";
import * as DocumentPicker from "expo-document-picker";
import TextualButton from "../components/TextualButton";
import { ThemeContext } from "../context/ThemeContext";

const AddExamScreen = () => {
  const [date, setDate] = useState(null);
  const [duration, setDuration] = useState(null);
  const [title, setTitle] = useState("");
  const [subject, setSubject] = useState("");
  const [location, setLocation] = useState("");

  async function pickPdf() {
    const result = await DocumentPicker.getDocumentAsync({
      type: "application/pdf",
    });
    if (result.assets && result.assets.length > 0) {
      console.log("PDF sélectionné :", result.assets[0].uri);
      // ensuite -> upload vers ton backend
    }
  }

  async function addEvent() {
    const { data, error } = await supabase
      .from("Event")
      .insert([
        {
          type: "exam",
          title: title,
          date: date,
          duration: duration,
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
  const { theme } = useContext(ThemeContext);
  return (
    <ThemedSafeAreaView style={styles.addExamScreen}>
      <ThemedText
        style={[styles.addExamText, { color: theme.primary }]}
        type="title"
      >
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
      <TextualButton
        title="Ajouter PDF"
        onPress={() => pickPdf()}
        style={{ marginVertical: 10 }}
      />
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
  addExamText: {
    marginBottom: height * 0.03,
  },
});
