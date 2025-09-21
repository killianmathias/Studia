import {
  Dimensions,
  StyleSheet,
  Text,
  View,
  Pressable,
  FlatList,
  Modal,
  ActivityIndicator,
} from "react-native";
import React, { useContext, useEffect, useState } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import ReanimatedSwipeable from "react-native-gesture-handler/ReanimatedSwipeable";
import { Ionicons } from "@expo/vector-icons";
import ThemedText from "../components/Themed/ThemedText";
import ThemedSafeAreaView from "../components/Themed/ThemedSafeAreaView";
import CustomButton from "../components/CustomButton";
import Input from "../components/Input";
import CustomDateAndTimePicker from "../components/CustomDateAndTimePicker";
import DurationPicker from "../components/DurationPicker";
import TextualButton from "../components/TextualButton";
import MasterySelector from "../components/AddExamScreen/MasterySelector/MasterySelector";
import TypeOfCourseSelector from "../components/AddExamScreen/TypeOfCourseSelector/TypeOfCourseSelector";
import { getUserLevel } from "../functions/functions";
import { ThemeContext } from "../context/ThemeContext";
import { useAlert } from "../components/CustomAlertService";
import { supabase } from "../lib/supabase";
import { getRevisionPlan } from "../lib/openai";
const { height, width } = Dimensions.get("window");

const AddExamScreen = () => {
  const [date, setDate] = useState(null);
  const [duration, setDuration] = useState(null);
  const [title, setTitle] = useState("");
  const [subject, setSubject] = useState("");
  const [location, setLocation] = useState("");
  const [contents, setContents] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [chapterTitle, setChapterTitle] = useState("");
  const [parts, setParts] = useState([]);
  const [currentType, setCurrentType] = useState("Cours classique");
  const [currentMastery, setCurrentMastery] = useState("moyen");
  const [level, setLevel] = useState("Collège");
  const [examId, setExamId] = useState("");
  const [loading, setLoading] = useState(false);

  const { showAlert } = useAlert();
  const { theme } = useContext(ThemeContext);

  async function savePlan(plan, examId) {
    if (!plan) {
      await showAlert({
        type: "error",
        title: "Erreur",
        message:
          "Une erreur est survenue ! Veuillez réessayer ultérieurement. 1",
        buttons: [{ text: "OK", value: true }],
      });
      setLoading(false);
      return;
    }
    if (!Array.isArray(plan)) {
      await showAlert({
        type: "error",
        title: "Erreur",
        message: "Le plan généré n'est pas valide.",
        buttons: [{ text: "OK", value: true }],
      });
      setLoading(false);
      return;
    }

    for (const session of plan) {
      const { data: eventData, error: eventError } = await supabase
        .from("Event")
        .insert([
          {
            type: "session",
            title: session.title, // <-- correction
            date: session.date,
            duration: Number(session.duration),
            subject: subject || "", // <-- éviter la référence invalide
          },
        ])
        .select();

      if (eventError || !eventData || eventData.length === 0) {
        await showAlert({
          type: "error",
          title: "Erreur",
          message:
            "Une erreur est survenue lors de la création d'un événement.",
          buttons: [{ text: "OK", value: true }],
        });
        setLoading(false);
        return;
      }

      const eventId = eventData[0].id;

      const { error: sessionError } = await supabase.from("Session").insert([
        {
          event_id: Number(eventId),
          exam_id: Number(examId), // <-- passé en paramètre
          content: session.content || "",
          finished: false,
          duration_done: 0,
        },
      ]);

      if (sessionError) {
        await showAlert({
          type: "error",
          title: "Erreur",
          message:
            "Une erreur est survenue lors de la création d'une session : " +
            sessionError.message,
          buttons: [{ text: "OK", value: true }],
        });
        setLoading(false);
        return;
      }
    }

    await showAlert({
      type: "success",
      title: "Succès",
      message: "Planning généré avec succès.",
      buttons: [{ text: "OK", value: true }],
    });
    setLoading(false);
    resetForm();
  }
  async function generatePlan() {
    const prompt = `
Voici la liste de mes chapitres et leurs détails :
${JSON.stringify(contents, null, 2)}

Planifie des sessions de révision optimales avant mon examen le ${date}.

⚠️ Règles de sortie :
- Tu dois me répondre **uniquement** avec une liste d'objets JSON.
- Pas de texte explicatif avant ou après.
- Chaque objet doit avoir les clés suivantes :
  {"title": "string", "date": "YYYY-MM-DD HH:mm:ss", "duration": number, "content": "string"}
- Le résultat doit être un tableau JSON valide, rien d’autre.
  `;

    try {
      const rawPlan = await getRevisionPlan(prompt);

      // Vérifie et parse la chaîne JSON
      let plan;
      try {
        plan = JSON.parse(rawPlan);
      } catch (e) {
        console.error("Réponse non-JSON :", rawPlan);
        await showAlert({
          type: "error",
          title: "Erreur",
          message: "Le plan généré est invalide. Réessaie.",
          buttons: [{ text: "OK", value: true }],
        });
        setLoading(false);
        return;
      }
      console.log(plan);
      // Passe le plan parsé et l'examId
      savePlan(plan, examId);
    } catch (err) {
      setLoading(false);
      console.error(err);
    }
  }

  useEffect(() => {
    async function fetchUserLevel() {
      const lvl = await getUserLevel();
      setLevel(lvl);
    }
    fetchUserLevel();
  }, [level]);

  async function addEvent() {
    setLoading(true);
    if (
      title == "" ||
      date == null ||
      duration == null ||
      location == "" ||
      subject == ""
    ) {
      await showAlert({
        type: "error",
        title: "Erreur",
        message: "Veuillez compléter tous les champs !",
        buttons: [{ text: "OK", value: true }],
      });
      setLoading(false);
      return;
    }

    const { data, error } = await supabase
      .from("Event")
      .insert([{ type: "exam", title, date, duration, subject }])
      .select();

    if (error) {
      await showAlert({
        type: "error",
        title: "Erreur",
        message: error.message,
        buttons: [{ text: "OK", value: true }],
      });
      setLoading(false);
      return null;
    }
    const eventId = data[0].id;
    addExam(eventId);
  }

  async function addExam(id: number) {
    const { data, error } = await supabase
      .from("Exam")
      .insert([{ event_id: id, location, subject }])
      .select();

    if (error) {
      await showAlert({
        type: "error",
        title: "Erreur",
        message: error.message,
        buttons: [{ text: "OK", value: true }],
      });
      setLoading(false);
      return null;
    }

    const examId = data[0].id;
    setExamId(examId);

    // insérer les contenus liés
    if (contents.length > 0) {
      const rows = contents.map((c) => ({
        exam_id: examId,
        name: c.title,
        contents: c.parts,
      }));
      console.log(rows);
      const { error } = await supabase.from("Chapters").insert(rows);
      if (error) {
        await showAlert({
          type: "error",
          title: "Erreur",
          message: "Erreur lors de l'ajout de chapitre." + error.message,
          buttons: [{ text: "OK", value: true }],
        });
        setLoading(false);
      }
    }

    generatePlan();
  }

  function resetForm() {
    setDate(null);
    setDuration(null);
    setLocation("");
    setSubject("");
    setTitle("");
    setContents([]);
  }

  function addPart() {
    const newPart = { type: currentType, mastery: currentMastery };
    setParts([...parts, newPart]);
  }

  function saveChapter() {
    if (!chapterTitle || parts.length === 0) return;
    const newChapter = { title: chapterTitle, parts };
    setContents([...contents, newChapter]);
    setChapterTitle("");
    setParts([]);
    setModalVisible(false);
    console.log(contents);
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
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
          title="Ajouter un chapitre à réviser"
          onPress={() => setModalVisible(true)}
          style={{ marginVertical: 10 }}
        />
        <FlatList
          style={{ maxHeight: height * 0.15 }}
          data={contents}
          keyExtractor={(_, i) => i.toString()}
          renderItem={({ item, index }) => {
            const renderRightActions = () => (
              <Pressable
                style={{
                  backgroundColor: "red",
                  justifyContent: "center",
                  alignItems: "flex-end",
                  paddingHorizontal: 20,
                  borderRadius: 15,
                }}
                onPress={() => {
                  setContents((prev) => prev.filter((_, i) => i !== index));
                }}
              >
                <Ionicons name="trash" size={24} color="white" />
              </Pressable>
            );

            return (
              <ReanimatedSwipeable
                renderRightActions={renderRightActions}
                overshootRight={false}
              >
                <View
                  style={[
                    styles.courseContainer,
                    {
                      backgroundColor: theme.surface,
                      flexDirection: "column",
                      alignItems: "flex-start",
                    },
                  ]}
                >
                  <ThemedText
                    type="subtitle"
                    style={{ fontWeight: "bold", marginBottom: 5 }}
                  >
                    {item.title}
                  </ThemedText>

                  {/* Liste des parties */}
                  {item.parts.map((p, i) => (
                    <ThemedText
                      key={i}
                      style={{
                        color:
                          p.mastery === "Faible"
                            ? theme.error
                            : p.mastery === "Moyen"
                            ? theme.warning
                            : theme.success,
                      }}
                    >
                      - {p.type} ({p.mastery})
                    </ThemedText>
                  ))}
                </View>
              </ReanimatedSwipeable>
            );
          }}
        />
        {loading ? (
          <View>
            <ActivityIndicator />
          </View>
        ) : (
          <View style={styles.addButtonContainer}>
            <CustomButton title={"Ajouter l'examen"} onPress={addEvent} />
          </View>
        )}

        <Modal visible={modalVisible} animationType="slide" transparent>
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <Input
                placeholder="Titre du chapitre"
                value={chapterTitle}
                onChangeText={setChapterTitle}
                inputWidth={width * 0.7}
              />

              {level === "Université" && (
                <View style={[styles.buttonContainer]}>
                  <ThemedText
                    style={styles.buttonContainerText}
                    type="subtitle"
                  >
                    Type de cours :
                  </ThemedText>
                  <TypeOfCourseSelector setValue={setCurrentType} />
                </View>
              )}

              <View style={styles.buttonContainer}>
                <ThemedText style={styles.buttonContainerText} type="subtitle">
                  Niveau de maîtrise :
                </ThemedText>
                <MasterySelector setValue={setCurrentMastery} />
              </View>

              <TextualButton
                style={styles.addPart}
                title="Ajouter cette partie"
                onPress={addPart}
              />

              <FlatList
                data={parts}
                keyExtractor={(_, i) => i.toString()}
                renderItem={({ item, index }) => {
                  const renderRightActions = () => (
                    <Pressable
                      style={{
                        backgroundColor: "red",
                        justifyContent: "center",
                        alignItems: "flex-end",
                        paddingHorizontal: 20,
                        borderRadius: 15,
                        flex: 1,
                      }}
                      onPress={() => {
                        setParts((prev) => prev.filter((_, i) => i !== index));
                      }}
                    >
                      <Ionicons name="trash" size={24} color="white" />
                    </Pressable>
                  );

                  return (
                    <ReanimatedSwipeable
                      renderRightActions={renderRightActions}
                      overshootRight={false}
                    >
                      <View
                        style={[
                          styles.courseContainer,
                          { backgroundColor: theme.background },
                        ]}
                      >
                        <ThemedText type="subtitle">{item.type}</ThemedText>
                        <ThemedText
                          type="subtitle"
                          style={{
                            color:
                              item.mastery === "Faible"
                                ? theme.error
                                : item.mastery === "Moyen"
                                ? theme.warning
                                : theme.success,
                          }}
                        >
                          {item.mastery}
                        </ThemedText>
                      </View>
                    </ReanimatedSwipeable>
                  );
                }}
              />

              <CustomButton title="Valider le chapitre" onPress={saveChapter} />
              <Pressable onPress={() => setModalVisible(false)}>
                <Text style={{ marginTop: 10, color: "red" }}>Annuler</Text>
              </Pressable>
            </View>
          </View>
        </Modal>
      </ThemedSafeAreaView>
    </GestureHandlerRootView>
  );
};

export default AddExamScreen;

const styles = StyleSheet.create({
  addExamScreen: {
    justifyContent: "center",
    alignItems: "center",
    height: height,
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
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  modalContent: {
    backgroundColor: "white",
    padding: width * 0.05,
    borderRadius: 12,
    width: width * 0.8,
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
  },
  buttonContainer: {
    width: width * 0.7,
    margin: 10,
  },
  addPart: {
    marginVertical: height * 0.01,
  },
  courseContainer: {
    margin: height * 0.005,
    width: width * 0.7,
    paddingVertical: height * 0.01,
    paddingHorizontal: width * 0.04,
    borderRadius: 15,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  flatlistContainer: {
    height: height * 0.3,
    backgroundColor: "red",
  },
});
