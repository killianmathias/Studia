import React, { useState } from "react";
import { Dimensions, StyleSheet, View } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import ThemedSafeAreaView from "../components/Themed/ThemedSafeAreaView";
import ThemedText from "../components/Themed/ThemedText";
import CustomButton from "../components/CustomButton";
import { useAppStore } from "../store/useAppStore";
import { useAddExam } from "../hooks/useAddExam";
import ExamForm from "../components/AddExamScreen/ExamForm";
import ChapterList from "../components/AddExamScreen/ChapterList";
import ChapterModal from "../components/AddExamScreen/ChapterModal";
import LoadingOverlay from "../components/LoadingOverlay";

const { width, height } = Dimensions.get("window");

export default function AddExamScreen() {
  const [title, setTitle] = useState("");
  const [subject, setSubject] = useState("");
  const [location, setLocation] = useState("");
  const [date, setDate] = useState(null);
  const [duration, setDuration] = useState(0);
  const [contents, setContents] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);

  const events = useAppStore((s) => s.events);
  const { addExam, loading } = useAddExam({ events });
  const resetForm = () => {
    setTitle("");
    setSubject("");
    setLocation("");
    setDate(null);
    setDuration(0);
  };

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ThemedSafeAreaView style={styles.container}>
        <ThemedText type="title" style={styles.pageTitle}>
          Ajoutez un examen
        </ThemedText>

        <ExamForm
          title={title}
          setTitle={setTitle}
          subject={subject}
          setSubject={setSubject}
          location={location}
          setLocation={setLocation}
          date={date}
          setDate={setDate}
          duration={duration}
          setDuration={setDuration}
        />

        <ChapterList
          contents={contents}
          setContents={setContents}
          openModal={() => setModalVisible(true)}
        />

        <View style={{ marginTop: 0 }}>
          <CustomButton
            title="Ajouter l'examen"
            onPress={() =>
              addExam({
                title,
                subject,
                location,
                date,
                duration,
                contents,
                resetForm,
              })
            }
          />
        </View>

        <ChapterModal
          visible={modalVisible}
          setVisible={setModalVisible}
          contents={contents}
          setContents={setContents}
        />

        {loading && <LoadingOverlay />}
      </ThemedSafeAreaView>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    width: width,
    height,
    alignItems: "center",
    flexDirection: "column",
    justifyContent: "center",
  },
  pageTitle: {
    marginBottom: height * 0.02,
  },
});
