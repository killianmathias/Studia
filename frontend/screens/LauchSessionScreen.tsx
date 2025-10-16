import React, { useEffect, useState, useRef, useContext } from "react";
import { StyleSheet, Text, View, Dimensions, Alert } from "react-native";
import ThemedSafeAreaView from "../components/Themed/ThemedSafeAreaView";
import { WORK_TIME, BREAK_TIME } from "../constants/pomodoro";
import { useUiStore } from "../store/useUIStore";
import { useNavigation } from "@react-navigation/native";
import { useAudioPlayer } from "expo-audio";
import * as Haptics from "expo-haptics";
import CustomButton from "../components/CustomButtonWithIcon";
import { ThemeContext } from "../context/ThemeContext";
import ThemedText from "../components/Themed/ThemedText";
import AnimatedProgressCircle from "../components/LauchSession/AnimatedCircle";
import { supabase } from "../lib/supabase";
import { useAlert } from "../components/CustomAlertService";
import { getXpForSessionTime } from "../functions/functions";
import { useAuthStore } from "../store/useAuthStore";
const { width, height } = Dimensions.get("window");

interface LaunchSessionScreenProps {
  duration: number;
  id: number;
}

const LauchSessionScreen: React.FC<LaunchSessionScreenProps> = ({
  duration,
  id,
}) => {
  const isRunning = useUiStore((s) => s.isRunning);
  const run = useUiStore((s) => s.run);
  const stopRunning = useUiStore((s) => s.stopRunning);
  const { showAlert } = useAlert();

  const [isWorkSession, setIsWorkSession] = useState<boolean>(true);
  const [secondsLeft, setSecondsLeft] = useState<number>(WORK_TIME);
  const [totalSecondsLeft, setTotalSecondsLeft] = useState<number>(duration);

  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const navigation = useNavigation();

  const user_id = useAuthStore((s) => s.profile?.id);

  // 🎶 Prépare le lecteur audio pour les sons
  const transitionSound = useAudioPlayer(
    require("../assets/sounds/transition.mp3")
  );
  const endSound = useAudioPlayer(require("../assets/sounds/notification.mp3"));

  // Timer + son + vibration (optionnel)
  useEffect(() => {
    if (isRunning) {
      intervalRef.current = setInterval(() => {
        setSecondsLeft((prev) => {
          if (prev <= 1) {
            // Jouer le son de transition
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            endSound.seekTo(0);
            endSound.play();

            setIsWorkSession((prevSession) => !prevSession);
            return isWorkSession ? BREAK_TIME : WORK_TIME;
          }
          return prev - 1;
        });

        setTotalSecondsLeft((prevTotal) => {
          if (prevTotal <= 1) {
            if (intervalRef.current) clearInterval(intervalRef.current);
            stopRunning();
            // Son de fin
            endSound.play();
            Alert.alert(
              "🎉 Session terminée",
              "Bravo ! Tu as terminé ton Pomodoro !"
            );
            return 0;
          }
          return prevTotal - 1;
        });
      }, 1000);
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
    }

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isRunning, isWorkSession, stopRunning, transitionSound, endSound]);

  const runAndStop = () => {
    if (isRunning) stopRunning();
    else run();
  };
  // const navigation = useNavigation();
  const stopSession = async () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    const running = isRunning;
    stopRunning();

    const result = await showAlert({
      type: "confirm",
      title: "Sauvegarde",
      message: "Êtes-vous sûr de vouloir sauvegarder vos changements ?",
      buttons: [
        { text: "Non", value: false, style: { backgroundColor: "grey" } },
        { text: "Oui", value: true },
      ],
    });

    if (!result && isRunning) {
      run();
      return;
    }
    if (result) {
      if (!id) {
        console.error("⚠️ ID non défini !");
        await showAlert({
          type: "error",
          title: "Erreur",
          message: "ID de session manquant",
          buttons: [{ text: "OK", value: true }],
        });
        return;
      }

      const durationDone = Math.ceil((duration - totalSecondsLeft) / 60);
      console.log(durationDone);
      if (isNaN(durationDone)) {
        console.error("Durée incorrecte :", durationDone);
        return;
      }

      console.log("Durée effectuée :", durationDone);
      console.log("Event ID :", id);

      const { data, error } = await supabase
        .from("Session")
        .update({ duration_done: durationDone, finished: true })
        .eq("event_id", id)
        .select();
      console.log("Résultat Supabase :", { data, error });

      if (error || !data?.length) {
        await showAlert({
          type: "error",
          title: "Erreur",
          message: error?.message || "Aucune session mise à jour",
          buttons: [{ text: "OK", value: true }],
        });
        return;
      }

      const { data: userData, error: userError } = await supabase.rpc(
        "increment_xp",
        {
          user_id,
          amount: getXpForSessionTime(durationDone, false),
        }
      );

      if (userError) {
        await showAlert({
          type: "error",
          title: "Erreur",
          message:
            userError?.message ||
            "Impossible de mettre à jour votre experience",
          buttons: [{ text: "OK", value: true }],
        });
        console.log(userError.message);
        return;
      }

      await showAlert({
        type: "success",
        title: "Succès",
        message: "Session sauvegardée avec succès",
        buttons: [{ text: "OK", value: true }],
      });
      navigation.goBack();
    }
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60)
      .toString()
      .padStart(2, "0");
    const seconds = (time % 60).toString().padStart(2, "0");
    return `${minutes}:${seconds}`;
  };
  const { theme } = useContext(ThemeContext);

  return (
    <ThemedSafeAreaView style={styles.container}>
      <ThemedText style={styles.sessionText} type="title">
        {isWorkSession ? "Session de travail 💪" : "Pause 🍵"}
      </ThemedText>

      <ThemedText style={styles.totalSeconds} type="title">
        Temps total restant : {formatTime(totalSecondsLeft)}
      </ThemedText>
      <View style={styles.circleContainer}>
        <AnimatedProgressCircle
          progress={secondsLeft / WORK_TIME}
          color={theme.primary}
        >
          <Text style={[styles.time, { color: theme.primary }]}>
            {formatTime(secondsLeft)}
          </Text>
        </AnimatedProgressCircle>
      </View>
      <View style={styles.buttonRow}>
        <CustomButton
          title={isRunning ? "Pause" : "Démarrer"}
          onPress={runAndStop}
          icon={isRunning ? "pause" : "play"}
          color={isRunning ? theme.warning : theme.success}
        />
        <CustomButton
          title="Arrêter"
          onPress={stopSession}
          icon="stop"
          color={theme.error}
        />
      </View>
    </ThemedSafeAreaView>
  );
};

export default LauchSessionScreen;

const styles = StyleSheet.create({
  container: {
    width,
    height,
    justifyContent: "center",
    alignItems: "center",
  },
  timerText: {
    fontSize: 72,
    color: "white",
    marginVertical: 20,
  },
  sessionText: {
    fontSize: 24,
    color: "#bbb",
  },
  buttonRow: {
    flexDirection: "row",
    gap: 10,
  },
  totalSeconds: {
    marginBottom: 20,
  },
  time: {
    backgroundColor: "transparent",
    fontSize: 50,
    color: "#FFF",
    fontWeight: 700,
  },
  circleContainer: {
    marginVertical: height * 0.05,
  },
});
