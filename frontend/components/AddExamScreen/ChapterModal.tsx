import React, { useState, useContext } from "react";
import {
  Modal,
  Pressable,
  Text,
  View,
  FlatList,
  StyleSheet,
  Dimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import ReanimatedSwipeable from "react-native-gesture-handler/ReanimatedSwipeable";
import Input from "../Input";
import CustomButton from "../CustomButton";
import TextualButton from "../TextualButton";
import MasterySelector from "./MasterySelector/MasterySelector";
import TypeOfCourseSelector from "./TypeOfCourseSelector/TypeOfCourseSelector";
import ThemedText from "../Themed/ThemedText";
import { ThemeContext } from "../../context/ThemeContext";

const { width, height } = Dimensions.get("window");

export default function ChapterModal({
  visible,
  setVisible,
  contents,
  setContents,
}) {
  const [chapterTitle, setChapterTitle] = useState("");
  const [parts, setParts] = useState([]);
  const [currentType, setCurrentType] = useState("Cours classique");
  const [currentMastery, setCurrentMastery] = useState("Moyen");

  const { theme } = useContext(ThemeContext);

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
    setVisible(false);
  }

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.modalContainer}>
        <View
          style={[styles.modalContent, { backgroundColor: theme.background }]}
        >
          <Input
            placeholder="Titre du chapitre"
            value={chapterTitle}
            onChangeText={setChapterTitle}
            inputWidth={width * 0.7}
          />

          <View style={styles.section}>
            <ThemedText type="subtitle">Type de cours :</ThemedText>
            <TypeOfCourseSelector setValue={setCurrentType} />
          </View>

          <View style={styles.section}>
            <ThemedText type="subtitle">Niveau de maîtrise :</ThemedText>
            <MasterySelector setValue={setCurrentMastery} />
          </View>

          <TextualButton
            title="Ajouter cette partie"
            onPress={addPart}
            style={styles.addPartButton}
          />

          <FlatList
            data={parts}
            keyExtractor={(_, i) => i.toString()}
            renderItem={({ item, index }) => {
              const renderRightActions = () => (
                <Pressable
                  style={styles.deleteButton}
                  onPress={() =>
                    setParts((prev) => prev.filter((_, i) => i !== index))
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
                      styles.partContainer,
                      { backgroundColor: theme.surface },
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
          <Pressable onPress={() => setVisible(false)}>
            <Text style={styles.cancelText}>Annuler</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  modalContent: {
    padding: 20,
    borderRadius: 12,
    width: width * 0.8,
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
  },
  section: { marginVertical: 10 },
  addPartButton: { marginVertical: height * 0.01 },
  partContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 10,
    borderRadius: 10,
    marginVertical: 5,
    width: width * 0.6,
  },
  deleteButton: {
    backgroundColor: "red",
    justifyContent: "center",
    alignItems: "flex-end",
    paddingHorizontal: 10,
    borderRadius: 15,
  },
  cancelText: { marginTop: 10, color: "red", textAlign: "center" },
});
