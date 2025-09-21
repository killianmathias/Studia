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
  const { item } = route.params || {};
  const date = new Date(item.date);
  const finalDate = new Date(item.date + item.duration * 60);
  const [session, setSession] = useState(null);
  const [exam, setExam] = useState(null);
  const [examContent, setExamContent] = useState(null);
  const { showAlert } = useAlert();
  const todayDate = new Date();

  useEffect(() => {
    async function getSession() {
      if (!item.id) {
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
        .eq("event_id", item.id)
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
    }
    async function getExam() {
      if (!item.id) {
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
        .eq("event_id", item.id)
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
  console.log(session);
  console.log(exam);
  console.log(examContent);
  return (
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
        <ThemedText type="title">{item?.title || ""}</ThemedText>
        <ThemedText type="subtitle">{item?.subject || ""}</ThemedText>
        <ThemedText
          style={{
            color: item?.type === "session" ? theme.primary : theme.error,
          }}
          type="subtitle"
        >
          {item?.type === "session" ? "Session de révision" : "Examen"}
        </ThemedText>
        <ThemedText type="subtitle">
          {date.getDate() + "/" + date.getMonth() + "/" + date.getFullYear()}
        </ThemedText>
        <ThemedText type="paragraph">
          {date.getHours() +
            ":" +
            date.getMinutes().toString().padStart(2, "0") +
            "-" +
            finalDate.getHours() +
            ":" +
            finalDate.getMinutes().toString().padStart(2, "0")}
        </ThemedText>
        {session && item.type === "session" ? (
          <View>
            <ThemedText type="paragraph">{session?.content}</ThemedText>
            <ProgressBar
              target={item.duration}
              progress={session.duration_done}
            />
          </View>
        ) : exam && item.type === "exam" && examContent ? (
          <FlatList
            style={{ maxHeight: height * 0.15 }}
            data={examContent}
            keyExtractor={(_, i) => i.toString()}
            renderItem={({ item, index }) => {
              return (
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
                    {item.name}
                  </ThemedText>

                  {/* Liste des parties */}
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
                      - {p.type} ({p.mastery})
                    </ThemedText>
                  ))}
                </View>
              );
            }}
          />
        ) : (
          <></>
        )}
        {isSameDay(date, todayDate) ? (
          <TouchableOpacity
            onPress={() => console.log("Effectuer")}
            style={[styles.button, { backgroundColor: theme.success }]}
          >
            <Ionicons
              name="play"
              size={height * 0.04}
              color={theme.textprimary}
            />
            <ThemedText type="subtitle">Réviser</ThemedText>
          </TouchableOpacity>
        ) : (
          <></>
        )}
        <View style={styles.bottomButtons}>
          <TouchableOpacity
            onPress={() => console.log("Reprogrammer")}
            style={[styles.button, { backgroundColor: theme.primary }]}
          >
            <Ionicons
              name="time"
              size={height * 0.04}
              color={theme.textprimary}
            />
            <ThemedText type="subtitle">Décaler</ThemedText>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => console.log("Supprimer")}
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
      </View>
    </ThemedSafeAreaView>
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
  },
  button: {
    width: width * 0.4,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    height: height * 0.06,
    borderRadius: 15,
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
  },
});
