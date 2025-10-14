import React, { useEffect, useState, useRef } from "react";
import {
  StyleSheet,
  Text,
  View,
  Button,
  Dimensions,
  Alert,
} from "react-native";
import ThemedSafeAreaView from "../components/Themed/ThemedSafeAreaView";
import { WORK_TIME, BREAK_TIME } from "../constants/pomodoro";
import { useUiStore } from "../store/useUIStore";
import { useNavigation } from "@react-navigation/native";
import { useAudioPlayer } from "expo-audio";
import * as Haptics from "expo-haptics";

const { width, height } = Dimensions.get("window");

interface LaunchSessionScreenProps {
  duration: number; // en minutes
}

const LauchSessionScreen: React.FC<LaunchSessionScreenProps> = ({
  duration,
}) => {
  const isRunning = useUiStore((s) => s.isRunning);
  const run = useUiStore((s) => s.run);
  const stopRunning = useUiStore((s) => s.stopRunning);

  const [isWorkSession, setIsWorkSession] = useState<boolean>(true);
  const [secondsLeft, setSecondsLeft] = useState<number>(WORK_TIME);
  const [totalSecondsLeft, setTotalSecondsLeft] = useState<number>(duration);

  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const navigation = useNavigation();

  // 🎶 Prépare le lecteur audio pour les sons
  const transitionSound = useAudioPlayer(
    require("../assets/sounds/transition.mp3")
  );
  const endSound = useAudioPlayer(require("../assets/sounds/notification.mp3"));

  // Bloquer la navigation pendant le timer
  useEffect(() => {
    const beforeRemove = navigation.addListener("beforeRemove", (e: any) => {
      if (!isRunning) return;

      e.preventDefault();
      Alert.alert(
        "Session en cours ⏳",
        "Tu ne peux pas quitter tant que la session Pomodoro n’est pas terminée ou mise en pause.",
        [
          { text: "Annuler", style: "cancel" },
          {
            text: "Mettre en pause et quitter",
            style: "destructive",
            onPress: () => {
              stopRunning();
              navigation.dispatch(e.data.action);
            },
          },
        ]
      );
    });

    return () => {
      navigation.removeListener("beforeRemove", beforeRemove);
    };
  }, [isRunning, navigation, stopRunning]);

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

  const resetTimer = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    stopRunning();
    setSecondsLeft(WORK_TIME);
    setIsWorkSession(true);
    setTotalSecondsLeft(duration);
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
      <Text style={styles.totalSeconds}>
        Temps total restant : {formatTime(totalSecondsLeft)}
      </Text>

      <Text style={styles.sessionText}>
        {isWorkSession ? "Session de travail 💪" : "Pause 🍵"}
      </Text>

      <Text style={styles.timerText}>{formatTime(secondsLeft)}</Text>

      <View style={styles.buttonRow}>
        <Button title={isRunning ? "Pause" : "Démarrer"} onPress={runAndStop} />
        <Button title="Réinitialiser" onPress={resetTimer} />
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
    color: "white",
    marginBottom: 20,
  },
});
