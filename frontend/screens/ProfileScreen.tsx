import {
  Alert,
  TouchableOpacity,
  StyleSheet,
  Button,
  View,
  Text,
  Dimensions,
  ActivityIndicator,
  ScrollView,
} from "react-native";
import ThemedSafeAreaView from "../components/Themed/ThemedSafeAreaView";
import ThemedText from "../components/Themed/ThemedText";
import { supabase } from "../lib/supabase";
import { useContext, useEffect, useState } from "react";
import { ThemeContext } from "../context/ThemeContext";
import EditButton from "../components/ProfileScreen/EditButton";
import ThemeButton from "../components/ProfileScreen/ThemeButton";
import ThemeSelector from "../components/ProfileScreen/ThemeSelector";
import LogoutButton from "../components/ProfileScreen/LogoutButton";
import Input from "../components/Input";
import { useUserInfos } from "../functions/functions";
import { fetchUserId } from "../functions/user";
import CustomDatePicker from "../components/CustomDatePicker";
import LevelPicker from "../components/LevelPicker";
import XPProgressCircle from "../components/HomeScreen/XPProgresseCircle";
import Stats from "../components/ProfileScreen/Stats";
import { useRoute } from "@react-navigation/native";
import { SignInWithApple } from "./Auth/SignInWithApple";
import { Modal } from "react-native";
import { Ionicons } from "@expo/vector-icons";
const { width, height } = Dimensions.get("window");
import * as ImagePicker from "expo-image-picker";
import LoadImageButton from "../components/ProfileScreen/LoadImageButton";
import { useAlert } from "../components/CustomAlertService";

async function logOut() {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (user != null) {
    let { error } = supabase.auth.signOut();
    if (error) Alert.alert(error.message);
  }
}
// --- Screens ---
export default function ProfileScreen() {
  const { theme, setMode, mode } = useContext(ThemeContext);
  const [username, setUsername] = useState("username");
  const [name, setName] = useState("");
  const [surname, setSurname] = useState("");
  const [birthday, setBirthday] = useState(new Date(Date.now()));
  const [email, setEmail] = useState("");
  const [profilePicture, setProfilePicture] = useState("");
  const [level, setLevel] = useState("");
  const [loading, setLoading] = useState(false);
  const [visitorId, setVisitorId] = useState("");
  const [modalVisible, setModalVisible] = useState(false);
  const [isConnectedApple, setIsConnectedApple] = useState(false);
  const [isConnectedGoogle, setIsConnectedGoogle] = useState(false);
  const route = useRoute();
  const { showAlert } = useAlert();

  const { userId } = route.params;

  const openModal = () => {
    setModalVisible(true);
  };
  const closeModal = () => {
    setModalVisible(false);
  };
  useEffect(() => {
    setLoading(true);
    async function fetchUser() {
      const userInfos = useUserInfos(userId);
      console.log("UserInfos", userInfos);
      if (userInfos) {
        setName(userInfos.name);
        setSurname(userInfos.surname);
        setBirthday(new Date(userInfos.date_of_birth));
        setEmail(userInfos.email);
        setLevel(userInfos.level);
        setProfilePicture(userInfos.profile_picture);
        setUsername(userInfos.username);
      } else {
        await showAlert({
          type: "error",
          title: "Erreur",
          message: "Impossible de récupérer vos informations",
          buttons: [{ text: "OK", value: true }],
        });
      }
    }
    async function fetchIsConnected() {
      const { data, error } = await supabase
        .from("User_providers")
        .select("provider")
        .eq("provider_user_id", userId);
      if (error) {
        await showAlert({
          type: "error",
          title: "Erreur",
          message: "Impossible de trouver les différents providers.",
          buttons: [{ text: "OK", value: true }],
        });
        return;
      }
      for (const provider in data) {
        if (provider.provider === "apple") {
          setIsConnectedApple(true);
        } else if (provider.provider === "google") {
          setIsConnectedGoogle(true);
        }
      }
    }
    fetchUser();
    fetchIsConnected();
    setLoading(false);
  }, []);

  async function edit() {
    if (editing == false) {
      setEditing(true);
    } else {
      const result = await showAlert({
        type: "confirm",
        title: "Sauvegarde",
        message: "Êtes vous sûrs de vouloir sauvegarder vos changements ?",
        buttons: [
          { text: "Non", value: false, style: { backgroundColor: "grey" } },
          { text: "Oui", value: true },
        ],
      });
      if (result) {
        saveChanges();
      }
    }
  }

  async function saveChanges() {
    const { data: providerData, error: idError } = await supabase
      .from("User_providers")
      .select("user_id")
      .eq("provider_user_id", visitorId)
      .eq("provider", "email");

    if (idError || !providerData || providerData.length === 0) {
      await showAlert({
        type: "error",
        title: "Erreur",
        message: "Utilisateur introuvable",
        buttons: [{ text: "OK", value: true }],
      });
      return;
    }
    const userId = providerData[0].user_id;

    const { data: emailDatabase, error: emailError } = await supabase
      .from("Users")
      .select("email")
      .eq("id", userId);

    if (emailError || !emailDatabase || emailDatabase.length === 0) {
      await showAlert({
        type: "error",
        title: "Erreur",
        message: "Impossible de récupérer l'adresse email actuelle",
        buttons: [{ text: "OK", value: true }],
      });
      return;
    }

    // 🔹 Mise à jour de l'auth si besoin
    if (email !== emailDatabase[0].email) {
      const { error: authError } = await supabase.auth.updateUser({ email });
      if (authError) {
        await showAlert({
          type: "error",
          title: "Erreur",
          message: "Une erreur est survenue lors du changement de l'email",
          buttons: [{ text: "OK", value: true }],
        });
        return; // on stoppe ici pour éviter une désyncro
      }
    }

    // 🔹 Mise à jour de la table Users
    const { error: updateError } = await supabase
      .from("Users")
      .update({
        name,
        surname,
        date_of_birth: birthday,
        level,
        profile_picture: profilePicture,
        email,
        username,
      })
      .eq("id", userId);

    if (updateError) {
      await showAlert({
        type: "error",
        title: "Erreur",
        message: "Une erreur est survenue lors de la sauvegarde",
        buttons: [{ text: "OK", value: true }],
      });
    } else {
      await showAlert({
        type: "success",
        title: "Succès",
        message: "Votre action a été effectuée ✅",
        buttons: [{ text: "OK", value: true }],
      });
      setEditing(false);
    }
  }

  const [editing, setEditing] = useState(false);
  return (
    <ThemedSafeAreaView style={{ alignItems: "center" }}>
      {loading ? (
        <ActivityIndicator />
      ) : (
        <>
          <View style={styles.profileHeader}>
            {visitorId === userId ? (
              <EditButton onPress={() => edit()} editing={editing} />
            ) : (
              <></>
            )}
          </View>

          <XPProgressCircle
            imageUri={profilePicture}
            size={width / 4}
            strokeWidth={5}
            uid={userId}
          />
          {editing ? (
            <LoadImageButton
              setLoading={setLoading}
              setProfilePicture={setProfilePicture}
              userId={userId}
            />
          ) : (
            <View style={styles.usernameContainer}>
              <ThemedText style={styles.username} type="subtitle">
                {/* {surname} {name} */} @{username}
              </ThemedText>
            </View>
          )}

          {editing ? (
            <View style={styles.editingContainer}>
              <View style={styles.inputContainer}>
                <Input
                  value={username}
                  onChangeText={(text) => setUsername(text)}
                  icon="person"
                  placeholder="Nom d'utilisateur"
                />
              </View>
              <View style={styles.inputContainer}>
                <Input
                  value={surname}
                  onChangeText={(text) => setSurname(text)}
                  icon="person"
                  placeholder="Prénom"
                />
              </View>
              <View style={styles.inputContainer}>
                <Input
                  value={name}
                  onChangeText={(text) => setName(text)}
                  icon="person"
                  placeholder="Nom"
                />
              </View>

              <View style={styles.inputContainer}>
                <Input
                  value={email}
                  onChangeText={(text) => setEmail(text)}
                  icon="mail"
                  placeholder="Email"
                />
              </View>
              <View style={styles.pickerContainer}>
                <CustomDatePicker value={birthday} onChange={setBirthday} />
                <LevelPicker value={level} onChange={setLevel} />
              </View>
              <View style={styles.otherSignInContainer}>
                <TouchableOpacity onPress={() => openModal()}>
                  <Text style={[styles.calendarBtn, { color: theme.primary }]}>
                    Voir mes calendriers
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            <>
              {userId === visitorId ? (
                <View style={styles.themeButtonContainer}>
                  <ThemeSelector />
                </View>
              ) : (
                <></>
              )}
              <Stats userId={userId} />
              {userId === visitorId ? <LogoutButton /> : <></>}
            </>
          )}
          <Modal
            animationType="slide"
            transparent={true}
            visible={modalVisible}
            onRequestClose={closeModal}
          >
            <View style={styles.modalBackground}>
              <View
                style={[
                  styles.bottomSheetContainer,
                  { backgroundColor: theme.background },
                ]}
              >
                <View
                  style={[
                    styles.handle,
                    { backgroundColor: theme.textsecondary },
                  ]}
                />
                <ThemedText
                  style={{
                    fontSize: 18,
                    marginBottom: 15,
                    color: theme.primary,
                  }}
                  type="title"
                >
                  Mes calendriers
                </ThemedText>
                <View style={styles.calendarContainer}>
                  <View style={styles.calendarPresentation}>
                    <Ionicons
                      name={"logo-apple"}
                      size={height * 0.035}
                      color={theme.textprimary}
                      style={styles.icon}
                    />
                    <ThemedText style={styles.calendarName} type="subtitle">
                      Apple
                    </ThemedText>
                  </View>
                  {isConnectedApple ? (
                    <Ionicons
                      name={"checkmark-circle"}
                      size={height * 0.035}
                      color={theme.success}
                      style={styles.icon}
                    />
                  ) : (
                    <SignInWithApple />
                  )}
                </View>
                <View style={styles.calendarContainer}>
                  <View style={styles.calendarPresentation}>
                    <Ionicons
                      name={"logo-google"}
                      size={height * 0.035}
                      color={theme.textprimary}
                      style={styles.icon}
                    />
                    <ThemedText style={styles.calendarName} type="subtitle">
                      Google
                    </ThemedText>
                  </View>
                  {isConnectedGoogle ? (
                    <Ionicons
                      name={"checkmark-circle"}
                      size={height * 0.035}
                      color={theme.success}
                      style={styles.icon}
                    />
                  ) : (
                    <SignInWithApple />
                  )}
                </View>
                <Button title="Fermer" onPress={closeModal} />
              </View>
            </View>
          </Modal>
        </>
      )}
    </ThemedSafeAreaView>
  );
}
const styles = StyleSheet.create({
  themeButtonContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
    width,
    marginTop: height * 0.04,
  },
  pickerContainer: {
    flexDirection: "row",
    gap: 10,
    alignItems: "center",
    justifyContent: "center",
    marginTop: height * 0.02,
  },

  profileHeader: {
    width: width,
    height: height * 0.08,
    alignItems: "center",
    justifyContent: "flex-end",
    flexDirection: "row",
    marginRight: width * 0.08,
    marginBottom: -height * 0.04,
  },
  usernameContainer: {
    marginTop: height * 0.02,
  },
  editingContainer: {
    marginTop: height * 0.02,
  },
  inputContainer: {
    marginTop: height * 0.015,
  },
  lineContainer: {
    flexDirection: "row", // place les éléments en ligne
    alignItems: "center", // aligne verticalement
    marginVertical: 20,
    width: "70%",
  },
  line: {
    flex: 1, // prend tout l’espace dispo
    height: 1,
    backgroundColor: "#000",
  },
  text: {
    marginHorizontal: 10, // espace entre le texte et les lignes
    fontSize: 14,
    color: "#333",
  },
  otherSignInContainer: {
    alignItems: "center",
    justifyContent: "center",
  },
  modalBackground: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.3)", // semi-transparent
    justifyContent: "flex-end", // force le contenu en bas
  },
  bottomSheetContainer: {
    backgroundColor: "white",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: "60%", // la modale couvre 60% de l'écran
    alignItems: "center",
  },
  handle: {
    width: 40,
    height: 5,
    // backgroundColor: "#ccc",
    borderRadius: 2.5,
    marginBottom: 10,
  },
  calendarContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "92%",
    margin: width * 0.04,
  },
  calendarPresentation: {
    flexDirection: "row",
    alignItems: "center",
  },
  calendarName: {
    marginLeft: width * 0.04,
  },
  calendarBtn: {
    fontSize: 18,
    marginTop: height * 0.02,
  },
});
