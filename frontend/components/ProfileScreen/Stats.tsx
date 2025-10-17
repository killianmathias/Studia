import {
  StyleSheet,
  Text,
  View,
  Dimensions,
  ActivityIndicator,
} from "react-native";
import React, { useContext, useEffect, useState } from "react";
import { ThemeContext } from "../../context/ThemeContext";
import ThemedText from "../Themed/ThemedText";
import { getUserStats } from "../../functions/stats";
import { supabase } from "../../lib/supabase";
import { formatTwoDigits } from "../../functions/functions";
import { useAuthStore } from "../../store/useAuthStore";
const { width, height } = Dimensions.get("window");

const Stats = () => {
  const { theme } = useContext(ThemeContext);
  const userId = useAuthStore((s) => s.profile?.id);
  const [stats, setStats] = useState({ nbSession: 0 });
  const [loading, setLoading] = useState(false);
  useEffect(() => {
    async function getStats() {
      setLoading(true);
      const stats = await getUserStats(userId);
      setStats(stats);
      setLoading(false);
    }
    getStats();
  }, []);
  console.log(stats);
  return (
    <View style={[styles.statsContainer, { backgroundColor: theme.surface }]}>
      {loading ? (
        <>
          <ActivityIndicator />
        </>
      ) : (
        <>
          <View style={styles.titleContainer}>
            <ThemedText style={styles.title} type="title">
              Statistiques
            </ThemedText>
          </View>
          <View style={{ flexDirection: "column" }}>
            {stats.nbSession === 0 ? (
              <View style={styles.noSession}>
                <ThemedText style={styles.noSessionText} type="paragraph">
                  Veuillez effectuer au moins une session pour avoir vos
                  statistiques
                </ThemedText>
              </View>
            ) : (
              <>
                <View style={styles.rowContainer}>
                  <View style={styles.element}>
                    <ThemedText style={styles.statTitle}>
                      Nombre de session
                    </ThemedText>
                    <ThemedText style={styles.numberText} type="title">
                      {stats.nbSession}
                    </ThemedText>
                  </View>
                  <View style={styles.element}>
                    <ThemedText style={styles.statTitle}>
                      Temps en session
                    </ThemedText>
                    <ThemedText style={styles.numberText} type="title">
                      {formatTwoDigits(stats.totalHours?.hours)}h
                      {formatTwoDigits(stats.totalHours?.minutes)}
                    </ThemedText>
                  </View>
                </View>
                <View style={styles.rowContainer}>
                  <View style={styles.element}>
                    <ThemedText style={styles.statTitle}>
                      Sessions complétées (%)
                    </ThemedText>
                    <ThemedText style={styles.numberText} type="title">
                      {stats.percentageFinished}%
                    </ThemedText>
                  </View>
                  <View style={styles.element}>
                    <ThemedText style={styles.statTitle}>
                      Sujet préféré
                    </ThemedText>

                    <ThemedText style={styles.numberText} type="title">
                      {stats.favoriteSubject}
                    </ThemedText>
                  </View>
                </View>
              </>
            )}
          </View>
        </>
      )}
    </View>
  );
};

export default Stats;

const styles = StyleSheet.create({
  statsContainer: {
    height: height * 0.35,
    width: width * 0.9,
    borderRadius: 30,
    margin: 0.02 * height,
    alignItems: "center",
    flexDirection: "column",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
  },
  rowContainer: {
    width: width * 0.9,
    height: height * 0.35 * 0.4,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
  },
  element: {
    flexDirection: "column",
    width: "40%",
    alignItems: "center",
    justifyContent: "space-between",
  },
  numberText: {
    fontSize: height * 0.5,
    textAlign: "center",
  },
  statTitle: {
    textAlign: "center",
  },
  title: {
    textAlign: "center",
  },
  titleContainer: {
    width: "100%",
    height: "20%",
    alignItems: "center",
    justifyContent: "center",
  },
  noSession: {
    height: height * 0.35 * 0.8,
    justifyContent: "center",
    alignItems: "center",
    padding: width * 0.05,
  },
  noSessionText: {
    marginTop: -height * 0.35 * 0.1,
    textAlign: "center",
  },
});
