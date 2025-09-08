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
import { useContext, useEffect, useState } from "react";
import { ThemeContext } from "../context/ThemeContext";

import {
  fetchAuthIdFromUserId,
  fetchUserIdFromUsers,
  fetchUserInfosFromUserId,
} from "../functions/functions";
import XPProgressCircle from "../components/HomeScreen/XPProgresseCircle";
import Stats from "../components/ProfileScreen/Stats";
import { useNavigation, useRoute } from "@react-navigation/native";
const { width, height } = Dimensions.get("window");
import { Ionicons } from "@expo/vector-icons";

// --- Screens ---
export default function OtherProfileScreen() {
  const { theme, setMode, mode } = useContext(ThemeContext);
  const [username, setUsername] = useState("username");
  const [name, setName] = useState("");
  const [surname, setSurname] = useState("");
  const [birthday, setBirthday] = useState(new Date(Date.now()));
  const [email, setEmail] = useState("");
  const [profilePicture, setProfilePicture] = useState("");
  const [level, setLevel] = useState("");
  const [loading, setLoading] = useState(false);
  const route = useRoute();
  const [user_id, setUser_id] = useState("");
  const { userId } = route.params;
  useEffect(() => {
    setLoading(true);
    async function fetchUserIdFromAuth() {
      const id = await fetchAuthIdFromUserId(userId);
      setUser_id(id);
    }
    async function fetchUser() {
      const data = await fetchUserInfosFromUserId(userId);
      if (data) {
        setName(data.name);
        setSurname(data.surname);
        setBirthday(new Date(data.date_of_birth));
        setEmail(data.email);
        setLevel(data.level);
        setProfilePicture(data.profile_picture);
        setUsername(data.username);
      }
      setLoading(false);
    }
    fetchUser();
    fetchUserIdFromAuth();
  }, [userId]);
  const navigation = useNavigation();
  return (
    <ThemedSafeAreaView style={{ alignItems: "center" }}>
      {loading ? (
        <ActivityIndicator />
      ) : (
        <>
          <View style={styles.header}>
            <TouchableOpacity onPress={() => navigation.goBack()}>
              <Ionicons
                name="chevron-back"
                size={height * 0.04}
                color={theme.primary}
              />
            </TouchableOpacity>
          </View>
          <XPProgressCircle
            imageUri={profilePicture}
            size={width / 4}
            strokeWidth={5}
            uid={user_id}
          />

          <View style={styles.usernameContainer}>
            <ThemedText style={styles.username} type="subtitle">
              {/* {surname} {name} */} @{username}
            </ThemedText>
          </View>

          <Stats userId={userId} />
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
    backgroundColor: "#ccc",
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
  header: {
    width: width,
    marginLeft: height * 0.04,
  },
});
