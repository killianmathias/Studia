import {
  Dimensions,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import React, { useContext, useEffect, useState } from "react";
import ThemedSafeAreaView from "../components/Themed/ThemedSafeAreaView";
import { useNavigation, useRoute } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { ThemeContext } from "../context/ThemeContext";
import ThemedText from "../components/Themed/ThemedText";
import { useAlert } from "../components/CustomAlertService";
import { supabase } from "../lib/supabase";
import ProgressBar from "../components/DetailScreen/ProgressBar";
import { FlatList } from "react-native";
import { useEventStore } from "../store/useEventStore";
import LauchSessionScreen from "./LauchSessionScreen";
import { useStudiaEvents } from "../functions/events";
import CustomDateAndTimePicker from "../components/CustomDateAndTimePicker";
import ReprogramDateAndTimePicker from "../components/ReprogramDateAndTimePicker";
const { height, width } = Dimensions.get("window");

function isSameDay(date1: Date, date2: Date) {
  return (
    date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDate() === date2.getDate()
  );
}

const EventDetailScreen = () => {
  const navigation = useNavigation();
  const { theme } = useContext(ThemeContext);
  const route = useRoute();
  const { itemId } = route.params || 0;
  const getEventById = useEventStore((s) => s.getEventById);
  const item = getEventById(itemId);
  // useStudiaEvents();

  const date = new Date(item?.start);
  const finalDate = new Date(item?.end);
  const [selectorDate, setSelectorDate] = useState(date);
  const [session, setSession] = useState(null);
  const [exam, setExam] = useState(null);
  const [examContent, setExamContent] = useState(null);
  const { showAlert } = useAlert();
  const todayDate = new Date();

  const [launched, setLaunched] = useState(false);

  const deleteEvent = async () => {
    // 1️⃣ Confirmation utilisateur
    const confirmed = await showAlert({
      type: "confirm",
      title: "Suppression",
      message: "Êtes-vous sûr de vouloir supprimer cet événement ?",
      buttons: [
        { text: "Non", value: false, style: { backgroundColor: "grey" } },
        { text: "Oui", value: true },
      ],
    });

    if (!confirmed) return;

    try {
      if (item?.type === "session") {
        // Supprimer toutes les sessions liées
        await supabase.from("Session").delete().eq("event_id", itemId);

        // Supprimer l'événement
        await supabase.from("Event").delete().eq("id", itemId);
      } else {
        // Supprimer l'examen
        const { data: examData, error: examError } = await supabase
          .from("Exam")
          .delete()
          .eq("event_id", itemId)
          .select("id");

        if (examError || !examData?.length)
          throw new Error("Impossible de supprimer l'examen");

        // Supprimer toutes les sessions liées à cet examen
        const examId = examData[0].id;
        await supabase.from("Session").delete().eq("exam_id", examId);

        // Supprimer l'événement
        await supabase.from("Event").delete().eq("id", itemId);
      }

      // Succès
      await showAlert({
        type: "success",
        title: "Succès",
        message: "Événement supprimé avec succès",
        buttons: [{ text: "Ok", value: true }],
      });
      navigation.goBack();
    } catch (err: any) {
      // Gestion d'erreur unique
      await showAlert({
        type: "error",
        title: "Erreur",
        message: err.message || "Impossible de supprimer l'événement",
        buttons: [{ text: "Ok", value: true }],
      });
    }
  };
  const saveNewDate = async (newDate: Date) => {
    setSelectorDate(newDate);

    const result = await showAlert({
      type: "confirm",
      title: "Sauvegarde",
      message: "Êtes-vous sûr de vouloir sauvegarder vos changements ?",
      buttons: [
        { text: "Non", value: false, style: { backgroundColor: "grey" } },
        { text: "Oui", value: true },
      ],
    });
    if (result) {
      const { data, error } = await supabase
        .from("Event")
        .update({ date: newDate.toISOString() }) // exemple de colonne
        .eq("id", itemId)
        .select();

      if (error) {
        console.error("Erreur de sauvegarde :", error.message);
        return;
      }

      console.log("✅ Nouvelle date enregistrée :", data);
    }
  };

  useEffect(() => {
    async function getSession() {
      if (!itemId) {
        await showAlert({
          type: "error",
          title: "Erreur",
          message:
            "Une erreur est survenue lors de la récupération de la session de révision",
          buttons: [{ text: "OK", value: true }],
        });
        return;
      }

      const { data, error } = await supabase
        .from("Session")
        .select("*")
        .eq("event_id", itemId)
        .single();
      if (error) {
        await showAlert({
          type: "error",
          title: "Erreur",
          message:
            "Une erreur est survenue lors de la récupération de la session de révision",
          buttons: [{ text: "OK", value: true }],
        });
        return;
      }
      if (!data) {
        await showAlert({
          type: "error",
          title: "Erreur",
          message:
            "Une erreur est survenue lors de la récupération de la session de révision",
          buttons: [{ text: "OK", value: true }],
        });
        return;
      }
      setSession(data);
      const { data: contentData, error: contentError } = await supabase
        .from("Chapters")
        .select("*")
        .eq("exam_id", data.exam_id);
      if (contentError) {
        await showAlert({
          type: "error",
          title: "Erreur",
          message:
            "Une erreur est survenue lors de la récupération du contenu de l'examen",
          buttons: [{ text: "OK", value: true }],
        });
        return;
      }
      if (!contentData) {
        await showAlert({
          type: "error",
          title: "Erreur",
          message:
            "Une erreur est survenue lors de la récupération du contenu de l'examen",
          buttons: [{ text: "OK", value: true }],
        });
        return;
      }
      setExamContent(contentData);
    }
    async function getExam() {
      if (!itemId) {
        await showAlert({
          type: "error",
          title: "Erreur",
          message:
            "Une erreur est survenue lors de la récupération de l'examen'",
          buttons: [{ text: "OK", value: true }],
        });
        return;
      }

      const { data, error } = await supabase
        .from("Exam")
        .select("*")
        .eq("event_id", itemId)
        .single();
      if (error) {
        await showAlert({
          type: "error",
          title: "Erreur",
          message:
            "Une erreur est survenue lors de la récupération de la session de révision",
          buttons: [{ text: "OK", value: true }],
        });
        return;
      }
      if (!data) {
        await showAlert({
          type: "error",
          title: "Erreur",
          message:
            "Une erreur est survenue lors de la récupération de la session de révision",
          buttons: [{ text: "OK", value: true }],
        });
        return;
      }
      setExam(data);

      const { data: contentData, error: contentError } = await supabase
        .from("Chapters")
        .select("*")
        .eq("exam_id", data.id);
      if (contentError) {
        await showAlert({
          type: "error",
          title: "Erreur",
          message:
            "Une erreur est survenue lors de la récupération du contenu de l'examen",
          buttons: [{ text: "OK", value: true }],
        });
        return;
      }
      if (!contentData) {
        await showAlert({
          type: "error",
          title: "Erreur",
          message:
            "Une erreur est survenue lors de la récupération du contenu de l'examen",
          buttons: [{ text: "OK", value: true }],
        });
        return;
      }
      setExamContent(contentData);
    }

    if (item.type === "session") {
      getSession();
    } else {
      getExam();
    }
  }, [item]);
  const duration = (finalDate.getTime() - date.getTime()) / 1000;

  return (
    <>
      {launched ? (
        <LauchSessionScreen duration={duration} id={item.id} />
      ) : (
        <ThemedSafeAreaView style={styles.eventDetailContainer}>
          <View style={styles.eventDetailHeader}>
            <TouchableOpacity onPress={() => navigation.goBack()}>
              <Ionicons
                name="chevron-back"
                size={height * 0.04}
                color={theme.textprimary}
              />
            </TouchableOpacity>
          </View>

          <View style={styles.eventDetailContent}>
            <ThemedText
              type="title"
              style={[styles.center, { color: theme.primary }]}
            >
              {item?.title || ""}
            </ThemedText>
            <ThemedText type="subtitle">{item?.subject || ""}</ThemedText>
            <ThemedText
              style={{
                color: item?.type === "session" ? theme.primary : theme.error,
                marginBottom: height * 0.02,
              }}
              type="subtitle"
            >
              {item?.type === "session" ? "Session de révision" : "Examen"}
            </ThemedText>
            <View style={styles.dates}>
              <View style={styles.date}>
                <Ionicons
                  name="calendar"
                  size={height * 0.03}
                  color={theme.textprimary}
                />

                <ThemedText type="subtitle">
                  {date.getDate() +
                    "/" +
                    date.getMonth() +
                    "/" +
                    date.getFullYear()}
                </ThemedText>
              </View>
              <View style={styles.hour}>
                <Ionicons
                  name="time"
                  size={height * 0.03}
                  color={theme.textprimary}
                />

                <ThemedText type="paragraph">
                  {date.getHours() +
                    ":" +
                    date.getMinutes().toString().padStart(2, "0") +
                    "-" +
                    finalDate.getHours() +
                    ":" +
                    finalDate.getMinutes().toString().padStart(2, "0")}
                </ThemedText>
              </View>
            </View>
            {session && item.type === "session" ? (
              <>
                <View style={styles.paragraphContainer}>
                  <ThemedText type="paragraph" style={styles.paragraph}>
                    {session?.content}
                  </ThemedText>
                  <ProgressBar
                    target={duration}
                    progress={session.duration_done}
                  />
                </View>
                <View style={styles.flatlistContainer}>
                  <FlatList
                    style={{ maxHeight: height * 0.2 }}
                    data={examContent}
                    keyExtractor={(_, i) => i.toString()}
                    renderItem={({ item, index }) => {
                      return (
                        <View
                          style={[
                            styles.courseContainer,
                            {
                              backgroundColor: theme.surface,
                            },
                          ]}
                        >
                          <View style={styles.left}>
                            <ThemedText
                              type="subtitle"
                              style={{ fontWeight: "bold" }}
                            >
                              {item.name}
                            </ThemedText>
                          </View>

                          {/* Liste des parties */}
                          <View style={styles.right}>
                            {item.contents.map((p, i) => (
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
                                <Text style={{ fontWeight: "bold" }}>
                                  {p.type}
                                </Text>{" "}
                                ({p.mastery})
                              </ThemedText>
                            ))}
                          </View>
                        </View>
                      );
                    }}
                  />
                </View>
              </>
            ) : (
              <></>
            )}
            {isSameDay(date, todayDate) ? (
              !session?.finished ? (
                <TouchableOpacity
                  onPress={() => setLaunched(true)}
                  style={[styles.button, { backgroundColor: theme.success }]}
                >
                  <Ionicons name="play" size={height * 0.04} color={"#FFF"} />
                  <ThemedText type="subtitle" style={{ color: "#FFF" }}>
                    Réviser
                  </ThemedText>
                </TouchableOpacity>
              ) : (
                <>
                  <ThemedText type="subtitle">Session déjà terminée</ThemedText>
                  <ThemedText type="paragraph">
                    Temps effectué : {session.duration_done} minutes
                  </ThemedText>
                </>
              )
            ) : (
              <View style={styles.bottomButtons}>
                {/* <TouchableOpacity
                  onPress={reprogram}
                  style={[styles.button, { backgroundColor: theme.primary }]}
                >
                  <Ionicons
                    name="time"
                    size={height * 0.04}
                    color={theme.textprimary}
                  />
                  <ThemedText type="subtitle">Décaler</ThemedText>
                </TouchableOpacity> */}
                <ReprogramDateAndTimePicker
                  value={selectorDate}
                  onChange={saveNewDate}
                />
                <TouchableOpacity
                  onPress={deleteEvent}
                  style={[styles.button, { backgroundColor: theme.error }]}
                >
                  <Ionicons
                    name="trash"
                    size={height * 0.04}
                    color={theme.textprimary}
                  />
                  <ThemedText type="subtitle">Supprimer</ThemedText>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </ThemedSafeAreaView>
      )}
    </>
  );
};

export default EventDetailScreen;

const styles = StyleSheet.create({
  eventDetailContainer: {
    width: width,
    height: height,
    flexDirection: "column",
    alignItems: "center",
  },
  eventDetailHeader: {
    width: "100%",
    marginLeft: width * 0.04,
    // height: height * 0.08,
    flexDirection: "row",
    alignItems: "center",
    // backgroundColor: "red",
  },
  bottomButtons: {
    flexDirection: "row",
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
    gap: width * 0.04,
    marginTop: height * 0.04,
  },
  button: {
    padding: 12,
    borderRadius: 12,
    marginVertical: 8,
    flexDirection: "row",
    alignItems: "center",
    width: 0.4 * width,
    justifyContent: "center",
  },
  eventDetailContent: {
    justifyContent: "center",
    flexDirection: "column",
    width: "100%",
    alignItems: "center",
    marginTop: height * 0.04,
  },
  courseContainer: {
    width: width * 0.9,
    borderRadius: 10,
    marginBottom: height * 0.01,
    padding: 10,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  center: {
    textAlign: "center",
  },
  paragraphContainer: {
    width: width * 0.8,
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    gap: height * 0.02,
    marginTop: height * 0.02,
  },
  paragraph: {
    textAlign: "justify",
  },
  flatlistContainer: {
    marginTop: height * 0.04,
  },
  left: {
    width: "60%",
    flex: 1,
    flexDirection: "column",
    justifyContent: "center",
  },
  right: {
    justifyContent: "center",
    alignItems: "flex-start",
  },
  dates: {
    flexDirection: "row",
    alignItems: "center",
    gap: 20,
  },
  date: {
    flexDirection: "row",
    alignItems: "center",
    gap: width * 0.02,
  },
  hour: {
    flexDirection: "row",
    alignItems: "center",
    gap: width * 0.02,
  },
});
