import React, { useEffect, useState, useRef, useContext } from "react";
import { StyleSheet, Text, View, Dimensions } from "react-native";
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

  const [isWorkSession, setIsWorkSession] = useState(true);
  const [secondsLeft, setSecondsLeft] = useState(Math.min(WORK_TIME, duration));
  const [totalSecondsLeft, setTotalSecondsLeft] = useState(duration);
  const [allFinished, setAllFinished] = useState(false);

  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const navigation = useNavigation();
  const user_id = useAuthStore((s) => s.profile?.id);
  const { theme } = useContext(ThemeContext);

  // 🎵 Préparer les sons
  const transitionSound = useAudioPlayer(
    require("../assets/sounds/transition.mp3")
  );
  const endSound = useAudioPlayer(require("../assets/sounds/notification.mp3"));

  // 🕒 Gérer le minuteur
  useEffect(() => {
    if (!isRunning) {
      if (intervalRef.current) clearInterval(intervalRef.current);
      return;
    }

    intervalRef.current = setInterval(() => {
      setSecondsLeft((prev) => prev - 1);
      setTotalSecondsLeft((prev) => prev - 1);
    }, 1000);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isRunning]);

  // 🔁 Quand le timer d’une session arrive à 0 → changer de phase
  useEffect(() => {
    if (secondsLeft > 0) return;

    if (totalSecondsLeft <= 0) {
      // Fin de toute la session
      if (intervalRef.current) clearInterval(intervalRef.current);
      setAllFinished(true);
      stopSession();
      endSound.play();
      return;
    }

    // Fin d’une sous-session (travail/pause)
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    transitionSound.seekTo(0);
    transitionSound.play();

    setIsWorkSession((prev) => !prev);
    setSecondsLeft(isWorkSession ? BREAK_TIME : WORK_TIME);
  }, [secondsLeft, totalSecondsLeft]);

  // 🧠 Démarrer / arrêter le minuteur
  const runAndStop = () => {
    if (isRunning) stopRunning();
    else run();
  };

  const stopSession = async () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    stopRunning();

    let result = allFinished;
    if (!allFinished) {
      result = await showAlert({
        type: "confirm",
        title: "Sauvegarde",
        message: "Êtes-vous sûr de vouloir sauvegarder vos changements ?",
        buttons: [
          { text: "Non", value: false, style: { backgroundColor: "grey" } },
          { text: "Oui", value: true },
        ],
      });
    }

    if (!result) {
      if (!isRunning) run();
      return;
    }

    if (!id) {
      await showAlert({
        type: "error",
        title: "Erreur",
        message: "ID de session manquant",
        buttons: [{ text: "OK", value: true }],
      });
      return;
    }

    const durationDone = Math.ceil((duration - totalSecondsLeft) / 60);
    if (isNaN(durationDone)) {
      console.error("Durée incorrecte :", durationDone);
      return;
    }

    const { data, error } = await supabase
      .from("Session")
      .update({ duration_done: durationDone, finished: true })
      .eq("event_id", id)
      .select();

    if (error || !data?.length) {
      await showAlert({
        type: "error",
        title: "Erreur",
        message: error?.message || "Aucune session mise à jour",
        buttons: [{ text: "OK", value: true }],
      });
      return;
    }

    const { error: userError } = await supabase.rpc("increment_xp", {
      user_id,
      amount: getXpForSessionTime(durationDone, false),
    });

    if (userError) {
      await showAlert({
        type: "error",
        title: "Erreur",
        message:
          userError.message || "Impossible de mettre à jour votre expérience",
        buttons: [{ text: "OK", value: true }],
      });
      return;
    }

    await showAlert({
      type: "success",
      title: "Succès",
      message: "Session sauvegardée avec succès",
      buttons: [{ text: "OK", value: true }],
    });

    navigation.goBack();
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60)
      .toString()
      .padStart(2, "0");
    const seconds = (time % 60).toString().padStart(2, "0");
    return `${minutes}:${seconds}`;
  };

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
  sessionText: {
    fontSize: 24,
    color: "#bbb",
  },
  totalSeconds: {
    marginBottom: 20,
  },
  time: {
    backgroundColor: "transparent",
    fontSize: 50,
    color: "#FFF",
    fontWeight: "700",
  },
  circleContainer: {
    marginVertical: height * 0.05,
  },
  buttonRow: {
    flexDirection: "row",
    gap: 10,
  },
});
