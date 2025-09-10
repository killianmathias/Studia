import * as ImagePicker from "expo-image-picker";
import * as FileSystem from "expo-file-system";
import { Alert, Dimensions } from "react-native";
import { View, StyleSheet, Button } from "react-native";
import { supabase } from "../../lib/supabase";
import TextualButton from "../TextualButton";

const { width, height } = Dimensions.get("window");
const LoadImageButton = ({ setLoading, setProfilePicture, userId }) => {
  async function pickAndUploadImage() {
    // Demander la permission
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert(
        "Permission refusée",
        "Nous avons besoin d'accéder à la galerie."
      );
      return;
    }

    // Ouvrir la galerie
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });

    if (result.canceled) return;

    setLoading(true);
    try {
      const image = result.assets[0];
      const fileExt = image.uri.split(".").pop() || "jpg";
      const filePath = `${userId}/profile.${fileExt}`;

      // Lire l’image en base64
      const base64 = await FileSystem.readAsStringAsync(image.uri, {
        encoding: FileSystem.EncodingType.Base64,
      });

      // Convertir en Uint8Array
      const byteCharacters = atob(base64);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);

      // Upload dans Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(filePath, byteArray.buffer, {
          contentType: "image/jpeg", // tu peux adapter si besoin
          upsert: true,
        });

      if (uploadError) throw uploadError;

      // Met à jour seulement l’état local
      setProfilePicture(filePath);
    } catch (err: any) {
      Alert.alert("Erreur", err.message);
    } finally {
      setLoading(false);
    }
  }
  return (
    <View style={styles.changePPButtonContainer}>
      <TextualButton title="Changer Pdp" onPress={() => pickAndUploadImage()} />
    </View>
  );
};

export default LoadImageButton;

const styles = StyleSheet.create({
  changePPButtonContainer: {
    marginTop: height * 0.02,
  },
});
