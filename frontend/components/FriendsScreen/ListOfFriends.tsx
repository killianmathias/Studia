import {
  Dimensions,
  StyleSheet,
  Text,
  View,
  FlatList,
  Alert,
  Image,
  TouchableOpacity,
} from "react-native";
import React, { useContext, useState, useEffect } from "react";
import ThemedText from "../Themed/ThemedText";
const { height, width } = Dimensions.get("window");
import { ThemeContext } from "../../context/ThemeContext";
import { Ionicons } from "@expo/vector-icons";
import {
  fetchUserIdFromUsers,
  getLevelFromXp,
  getSignedUrlFromPath,
} from "../../functions/functions";
import { supabase } from "../../lib/supabase";
import { useNavigation } from "@react-navigation/native";
import { useAlert } from "../CustomAlertService";

const Item = ({ id, title, xp, imageUri, userId, refreshFriends }) => {
  const [signedUrl, setSignedUrl] = useState(null);
  const { theme } = useContext(ThemeContext);
  const navigation = useNavigation();
  const { showAlert } = useAlert();

  useEffect(() => {
    let isMounted = true;
    async function fetchSignedUrl() {
      if (imageUri) {
        const url = await getSignedUrlFromPath(imageUri);
        if (isMounted) {
          setSignedUrl(url);
        }
      }
    }
    fetchSignedUrl();
    return () => {
      isMounted = false;
    };
  }, [imageUri]);

  async function deleteFriendship(friendId) {
    const result = await showAlert({
      type: "confirm",
      title: "Confirmer",
      message: "Veux-tu supprimer cet ami ?",
      buttons: [
        { text: "Non", value: false, style: { backgroundColor: "grey" } },
        { text: "Oui", value: true },
      ],
    });
    if (result) {
      const { data, error } = await supabase
        .from("Friendships")
        .delete()
        .or(
          `and(requester.eq.${userId},addressee.eq.${friendId}),and(requester.eq.${friendId},addressee.eq.${userId})`
        );

      if (error) {
        Alert.alert("Erreur", error.message);
      } else {
        console.log("Amitié supprimée :", data);
        refreshFriends(); // recharge la liste après suppression
      }
    }
  }

  return (
    <TouchableOpacity
      style={[styles.item, { backgroundColor: theme.surface }]}
      onPress={() => navigation.navigate("OtherUsers", { userId: id })}
    >
      <View style={styles.leftView}>
        <View style={styles.profilePictureContainer}>
          <Image
            style={{ width: 40, height: 40, borderRadius: 20 }}
            source={
              signedUrl
                ? { uri: signedUrl }
                : require("../../assets/default-profile.png")
            }
          />
        </View>
        <View style={styles.textContainer}>
          <ThemedText
            type="subtitle"
            style={[styles.text, { color: theme.textprimary }]}
            numberOfLines={1}
          >
            @{title}
          </ThemedText>
          <ThemedText
            style={[styles.playerLevel, { color: theme.textsecondary }]}
          >
            Niveau {getLevelFromXp(xp).level}
          </ThemedText>
        </View>
      </View>
      <View style={styles.rightView}>
        <TouchableOpacity onPress={() => deleteFriendship(id)}>
          <Ionicons name="trash" size={height * 0.04} color={theme.error} />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
};

const ListOfFriends = ({ user_id }) => {
  const [friends, setFriends] = useState([]);
  const [userId, setUserId] = useState("");
  const { theme } = useContext(ThemeContext);

  useEffect(() => {
    async function fetchUserId() {
      const id = await fetchUserIdFromUsers(user_id);
      setUserId(id);
    }
    fetchUserId();
  }, [user_id]);

  async function fetchFriends() {
    if (!userId) return;

    // Relations où l'utilisateur est requester ou addressee
    const { data, error } = await supabase
      .from("Friendships")
      .select("requester, addressee, status")
      .or(`requester.eq.${userId},addressee.eq.${userId}`)
      .eq("status", "accepted");

    if (error) {
      Alert.alert("Une erreur est survenue", error.message);
      return;
    }

    // Extraire les IDs amis
    const friendIds = data
      ? data.map((row) =>
          row.requester === userId ? row.addressee : row.requester
        )
      : [];

    if (friendIds.length === 0) {
      setFriends([]);
      return;
    }

    // Charger les infos des amis
    const { data: friendsData, error: friendsError } = await supabase
      .from("Users")
      .select("*")
      .in("id", friendIds);

    if (friendsError) {
      Alert.alert("Une erreur est survenue", friendsError.message);
      return;
    }

    setFriends(friendsData);
  }

  useEffect(() => {
    fetchFriends();
  }, [userId]);

  return (
    <View style={styles.container}>
      <ThemedText type="title" style={[styles.title, { color: theme.primary }]}>
        Vos Amis
      </ThemedText>
      <FlatList
        data={friends}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <Item
            title={item.username || item.email}
            theme={theme}
            xp={item.xp}
            imageUri={item.profile_picture}
            id={item.id}
            userId={userId}
            refreshFriends={fetchFriends}
          />
        )}
      />
    </View>
  );
};

export default ListOfFriends;

const styles = StyleSheet.create({
  container: {
    height: height * 0.6,
    width: width * 0.9,
    justifyContent: "center",
    alignItems: "center",
  },
  item: {
    width: 0.9 * width,
    height: height * 0.06,
    borderRadius: 15,
    justifyContent: "flex-start",
    flexDirection: "row",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    marginTop: height * 0.02,
  },
  leftView: {
    width: "75%",
    flexDirection: "row",
    justifyContent: "space-around",
  },
  text: { fontWeight: 900 },
  title: { marginTop: height * 0.02 },
  textContainer: {
    width: "70%",
  },
  rightView: {
    flexDirection: "row",
    alignItems: "center",
    gap: width * 0.04,
    width: "25%",
    justifyContent: "center",
  },
});
