import React, { useContext } from "react";
import {
  FlatList,
  Pressable,
  View,
  StyleSheet,
  Dimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import ReanimatedSwipeable from "react-native-gesture-handler/ReanimatedSwipeable";
import TextualButton from "../TextualButton";
import ThemedText from "../Themed/ThemedText";
import { ThemeContext } from "../../context/ThemeContext";

const { height, width } = Dimensions.get("window");

export default function ChapterList({ contents, setContents, openModal }) {
  const { theme } = useContext(ThemeContext);

  return (
    <>
      <TextualButton
        title="Ajouter un chapitre à réviser"
        onPress={openModal}
        style={styles.addButton}
      />

      <FlatList
        style={styles.list}
        data={contents}
        keyExtractor={(_, i) => i.toString()}
        renderItem={({ item, index }) => {
          const renderRightActions = () => (
            <Pressable
              style={styles.deleteButton}
              onPress={() =>
                setContents((prev) => prev.filter((_, i) => i !== index))
              }
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
                  styles.chapterContainer,
                  { backgroundColor: theme.surface },
                ]}
              >
                <ThemedText type="subtitle" style={styles.chapterTitle}>
                  {item.title}
                </ThemedText>

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
    </>
  );
}

const styles = StyleSheet.create({
  addButton: { marginVertical: 10 },
  list: { maxHeight: height * 0.15 },
  deleteButton: {
    backgroundColor: "red",
    justifyContent: "center",
    alignItems: "flex-end",
    paddingHorizontal: 20,
    borderRadius: 15,
  },
  chapterContainer: {
    padding: 10,
    borderRadius: 10,
    marginVertical: 5,
    width: width * 0.8,
  },
  chapterTitle: { fontWeight: "bold", marginBottom: 5 },
});
