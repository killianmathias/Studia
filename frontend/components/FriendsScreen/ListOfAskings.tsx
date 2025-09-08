import {
  Dimensions,
  StyleSheet,
  View,
  FlatList,
  Alert,
  Image,
  TouchableOpacity,
} from "react-native";
import React, { useContext, useEffect, useState } from "react";
import ThemedText from "../Themed/ThemedText";
import { supabase } from "../../lib/supabase";
import { fetchUserIdFromUsers } from "../../functions/functions";
import { ThemeContext } from "../../context/ThemeContext";
import {
  getSignedUrlFromPath,
  getLevelFromXp,
} from "../../functions/functions";
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { fetchUserId } from "../../functions/functions";

const { height, width } = Dimensions.get("window");

const Item = ({ id, title, theme, xp, imageUri, myId }) => {
  const [loading, setLoading] = useState(false);
  const [signedUrl, setSignedUrl] = useState(null);
  const navigation = useNavigation();

  // ✅ Accepter une demande
  async function acceptRequest() {
    if (!id) return;

    Alert.alert(
      "Confirmer",
      "Veux-tu accepter cette demande d'ami ?",
      [
        { text: "Annuler", style: "cancel" },
        {
          text: "Accepter",
          onPress: async () => {
            setLoading(true);
            const { error } = await supabase
              .from("Friendships")
              .update({ status: "accepted" })
              .eq("requester", id)
              .eq("addressee", myId);

            setLoading(false);

            if (error) {
              Alert.alert("Erreur", error.message);
            } else {
              Alert.alert("Succès", "Demande acceptée ✅");
            }
          },
        },
      ],
      { cancelable: true }
    );
  }

  // ✅ Rejeter une demande
  async function rejectRequest() {
    if (!id) return;

    Alert.alert(
      "Confirmer",
      "Veux-tu rejeter cette demande d'ami ?",
      [
        { text: "Annuler", style: "cancel" },
        {
          text: "Rejeter",
          style: "destructive",
          onPress: async () => {
            setLoading(true);
            const { error } = await supabase
              .from("Friendships")
              .delete()
              .eq("requester", id)
              .eq("addressee", myId);

            setLoading(false);

            if (error) {
              Alert.alert("Erreur", error.message);
            } else {
              Alert.alert("Succès", "Demande rejetée ❌");
            }
          },
        },
      ],
      { cancelable: true }
    );
  }

  // ✅ Charger l'image de profil
  useEffect(() => {
    let isMounted = true;
    async function fetchSignedUrl() {
      if (imageUri) {
        const url = await getSignedUrlFromPath(imageUri);
        if (isMounted) setSignedUrl(url);
      }
    }
    fetchSignedUrl();
    return () => {
      isMounted = false;
    };
  }, [imageUri]);

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
            style={[styles.text, { color: theme.textPrimary }]}
          >
            @{title}
          </ThemedText>
          <ThemedText
            style={[styles.playerLevel, { color: theme.textSecondary }]}
          >
            Niveau {getLevelFromXp(xp).level}
          </ThemedText>
        </View>
      </View>
      <View style={styles.rightView}>
        <TouchableOpacity onPress={acceptRequest}>
          <Ionicons
            name="checkmark-circle-outline"
            size={height * 0.045}
            color={theme.success}
          />
        </TouchableOpacity>
        <TouchableOpacity onPress={rejectRequest}>
          <Ionicons name="ban" size={height * 0.04} color={theme.error} />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
};

const ListOfAskings = ({ user_id }) => {
  const [askings, setAskings] = useState([]);
  const [userId, setUserId] = useState("");
  const [myId, setMyId] = useState("");
  const { theme } = useContext(ThemeContext);

  // ✅ Récupérer mes IDs
  useEffect(() => {
    async function fetchMyId() {
      const id = await fetchUserId();
      const secondId = await fetchUserIdFromUsers(id);
      setMyId(secondId);
    }
    async function fetchUserIdValue() {
      const id = await fetchUserIdFromUsers(user_id);
      setUserId(id);
    }
    fetchUserIdValue();
    fetchMyId();
  }, [user_id]);

  // ✅ Charger la liste des demandes
  async function fetchAskings() {
    if (!userId) return;

    const { data, error } = await supabase
      .from("Friendships")
      .select("requester")
      .eq("addressee", userId)
      .eq("status", "pending");

    if (error) {
      Alert.alert("Erreur", error.message);
      return;
    }

    let requesters = data?.map((r) => r.requester) || [];

    const { data: askingData, error: askingError } = await supabase
      .from("Users")
      .select("*")
      .in("id", requesters);

    if (askingError) {
      Alert.alert("Erreur", askingError.message);
      return;
    }
    setAskings(askingData);
  }

  // ✅ Fetch initial
  useEffect(() => {
    fetchAskings();
  }, [userId]);

  // ✅ Realtime updates
  useEffect(() => {
    if (!userId) return;

    const channel = supabase
      .channel("friendship-changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "Friendships",
          filter: `addressee=eq.${userId}`,
        },
        () => {
          fetchAskings();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId]);

  return (
    <View style={styles.container}>
      <ThemedText type="title" style={styles.title}>
        Utilisateurs en attente
      </ThemedText>
      <FlatList
        data={askings}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <Item
            id={item.id}
            title={item.username || "anonyme"}
            theme={theme}
            xp={item.xp || 0}
            imageUri={item.profile_picture}
            myId={myId}
          />
        )}
      />
    </View>
  );
};

export default ListOfAskings;

const styles = StyleSheet.create({
  container: {
    height: height * 0.6,
    width: width * 0.9,
    justifyContent: "center",
    alignItems: "center",
  },
  item: {
    width: 0.9 * width,
    height: height * 0.08,
    borderRadius: 15,
    justifyContent: "space-between",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: width * 0.04,
    marginVertical: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
  },
  leftView: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  text: { fontWeight: "700" },
  title: { marginVertical: height * 0.01 },
  rightView: {
    flexDirection: "row",
    alignItems: "center",
    gap: width * 0.04,
  },
});
