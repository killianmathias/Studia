import * as ImagePicker from "expo-image-picker";
import { Alert, Dimensions, View, StyleSheet } from "react-native";
import { supabase } from "../../lib/supabase";
import TextualButton from "../TextualButton";

const { height } = Dimensions.get("window");

const LoadImageButton = ({ setLoading, setProfilePicture, userId }) => {
  async function pickAndUploadImage() {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert(
        "Permission refusée",
        "Nous avons besoin d'accéder à la galerie."
      );
      return;
    }

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

      // ✅ Fetch as blob (modern method)
      const response = await fetch(image.uri);
      const blob = await response.blob();

      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(filePath, blob, {
          contentType: blob.type || "image/jpeg",
          upsert: true,
        });

      if (uploadError) throw uploadError;

      setProfilePicture(filePath);
    } catch (err) {
      Alert.alert("Erreur", err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <View style={styles.changePPButtonContainer}>
      <TextualButton title="Changer Pdp" onPress={pickAndUploadImage} />
    </View>
  );
};

export default LoadImageButton;

const styles = StyleSheet.create({
  changePPButtonContainer: {
    marginTop: height * 0.02,
  },
});
