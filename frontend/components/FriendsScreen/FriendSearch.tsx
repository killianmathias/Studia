import React, { useEffect, useState } from "react";
import {
  View,
  TextInput,
  Button,
  Text,
  StyleSheet,
  FlatList,
  Alert,
  Touchable,
  TouchableOpacity,
} from "react-native";
import { supabase } from "../../lib/supabase";
import { fetchUserId } from "../../functions/functions";
import { useNavigation } from "@react-navigation/native";

export default function FriendSearch() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [visitorId, setVisitorId] = useState("");
  const [userId, setUserId] = useState("");

  useEffect(() => {
    async function fetchVisitorId() {
      const id = await fetchUserId();
      setVisitorId(id);
    }
    fetchVisitorId();
  }, []);

  // Recherche d'utilisateur par username exact

  const checkFriendship = async (userId1, userId2) => {
    const { data, error } = await supabase
      .from("Friendships")
      .select("requester, addressee, status")
      .or(
        `and(requester.eq.${userId1},addressee.eq.${userId2}),and(requester.eq.${userId2},addressee.eq.${userId1})`
      )
      .limit(1)
      .single();

    if (error && error.code !== "PGRST116") {
      // PGRST116 = no rows found
      throw new Error(error.message);
    }

    if (!data) {
      return { areFriends: false, requestPending: false };
    }

    if (data.status === "accepted") {
      return { areFriends: true, requestPending: false };
    }

    if (data.status === "pending") {
      return { areFriends: false, requestPending: true };
    }

    return { areFriends: false, requestPending: false };
  };

  const handleFriendRequest = async (userId, targetUserId) => {
    // Vérifier si une relation existe déjà
    const { data, error } = await supabase
      .from("Friendships")
      .select("id, requester, addressee, status")
      .or(
        `and(requester.eq.${userId},addressee.eq.${targetUserId}),and(requester.eq.${targetUserId},addressee.eq.${userId})`
      )
      .limit(1)
      .single();

    if (error && error.code !== "PGRST116") {
      // PGRST116 = no rows found
      Alert.alert("Erreur", error.message);
      return;
    }

    if (!data) {
      // Pas de relation existante : créer une demande
      const { error: insertError } = await supabase.from("Friendships").insert([
        {
          requester: userId,
          addressee: targetUserId,
          status: "pending",
        },
      ]);

      if (insertError) {
        Alert.alert("Erreur", insertError.message);
      } else {
        Alert.alert("Succès", "Demande d'ami envoyée !");
      }
      return;
    }

    // Relation existante
    if (data.status === "accepted") {
      Alert.alert("Info", "Vous êtes déjà amis !");
      return;
    }

    if (data.status === "pending") {
      if (data.requester === targetUserId) {
        // L'autre utilisateur a déjà envoyé une demande : accepter
        const { error: updateError } = await supabase
          .from("Friendships")
          .update({ status: "accepted" })
          .eq("id", data.id);

        if (updateError) {
          Alert.alert("Erreur", updateError.message);
        } else {
          Alert.alert("Succès", "Demande d'ami acceptée !");
        }
      } else {
        // L'utilisateur a déjà envoyé une demande
        Alert.alert("Info", "Votre demande est déjà en attente.");
      }
    }
  };
  const searchUser = async () => {
    if (!query) return;
    setLoading(true);
    // Récupérer l'utilisateur connecté dans Users
    const { data: currentUserData, error: currentUserError } = await supabase
      .from("User_providers")
      .select("user_id")
      .eq("provider_user_id", visitorId)
      .single();

    if (currentUserError) {
      Alert.alert("Erreur", currentUserError.message);
      setLoading(false);
      return;
    }

    const currentUserId = currentUserData.user_id;
    setUserId(currentUserId);

    // Chercher l'utilisateur par username exact
    const { data, error } = await supabase
      .from("Users")
      .select("id, username, name, surname")
      .eq("username", query)
      .neq("id", currentUserId); // exclure soi-même

    if (error) {
      Alert.alert("Erreur", error.message);
    } else {
      setResults(data);
    }
    const userFriendships = await checkFriendship(currentUserId, data[0].id);

    if (userFriendships.areFriends) {
      Alert.alert("Vous êtes déjà amis !");
      setLoading(false);
      return;
    } else if (userFriendships.requestPending) {
      handleFriendRequest(currentUserId, data[0].id);
      setLoading(false);
      return;
    }

    addFriend(data[0].id);

    setLoading(false);
  };

  // Ajouter un ami
  const addFriend = async (targetUserId) => {
    const { data, error } = await supabase.from("Friendships").insert([
      {
        requester: userId,
        addressee: targetUserId,
      },
    ]);

    if (error) {
      Alert.alert("Erreur", error.message);
    } else {
      Alert.alert("Succès", "Demande d'ami envoyée !");
    }
  };

  const getAuthId = async (user_id) => {
    if (!user_id) return "";

    const { data: currentUserData, error: currentUserError } = await supabase
      .from("User_providers")
      .select("provider_user_id")
      .eq("user_id", user_id)
      .single();

    if (currentUserError) {
      Alert.alert("Erreur", currentUserError.message);
      setLoading(false);
      return;
    }
    return currentUserData.provider_user_id;
  };

  //   const navigation = useNavigation();
  //   const handlePressUser = async (id) => {
  //     const authId = await getAuthId(id);
  //     navigation.navigate("profile", { userId: authId });
  //   };
  return (
    <View style={styles.container}>
      <TextInput
        style={styles.input}
        placeholder="Chercher un username..."
        value={query}
        onChangeText={setQuery}
        autoCapitalize="none"
      />
      <Button title="Rechercher" onPress={searchUser} disabled={loading} />

      {/* <FlatList
        data={results}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.userItem}
            onPress={() => handlePressUser(item.id)}
          >
            <Text>
              {item.username} ({item.name} {item.surname})
            </Text>
            <Button title="Ajouter en ami" onPress={() => addFriend(item.id)} />
          </TouchableOpacity>
        )}
      /> */}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  input: {
    borderColor: "#ccc",
    borderWidth: 1,
    padding: 8,
    marginBottom: 8,
    borderRadius: 8,
  },
  userItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderColor: "#eee",
  },
});
