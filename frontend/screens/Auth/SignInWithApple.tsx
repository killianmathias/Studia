import { Dimensions, Platform, Alert } from "react-native";
import * as AppleAuthentication from "expo-apple-authentication";
import { supabase } from "../../lib/supabase";

const { width } = Dimensions.get("window");

export function SignInWithApple() {
  async function handleAppleSignIn() {
    try {
      const credential = await AppleAuthentication.signInAsync({
        requestedScopes: [
          AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
          AppleAuthentication.AppleAuthenticationScope.EMAIL,
        ],
      });

      if (!credential.identityToken) throw new Error("No identityToken.");
      const name = credential.fullName?.familyName;
      const surname = credential.fullName?.givenName;

      console.log(credential);
      // 1. Authentification via Supabase avec le token Apple
      const {
        data: { user: authUser },
        error: authError,
      } = await supabase.auth.signInWithIdToken({
        provider: "apple",
        token: credential.identityToken,
      });

      if (authError || !authUser) {
        Alert.alert(
          "Erreur Auth Apple",
          authError?.message ?? "Échec connexion Apple"
        );
        return;
      }
      console.log(authUser);
      const provider = "apple";

      // 2. Vérifier si ce provider est déjà lié
      const { data: existingProvider } = await supabase
        .from("User_providers")
        .select("user_id")
        .eq("provider_user_id", authUser.id)
        .single();

      if (existingProvider) {
        console.log("Utilisateur déjà lié :", existingProvider.user_id);
        return;
      }

      // 3. Vérifier si un utilisateur avec ce mail existe déjà
      const { data: existingUser } = await supabase
        .from("Users")
        .select("id")
        .eq("email", authUser.email)
        .single();

      let userId;

      if (existingUser) {
        // Utilisateur déjà existant → on réutilise son id
        userId = existingUser.id;
      } else {
        const { data: newUser, error: insertError } = await supabase
          .from("Users")
          .insert({
            email: authUser.email,
            name: name ?? null,
            surname: surname ?? null,
          })
          .select()
          .single();

        if (insertError) throw insertError;
        userId = newUser.id;
      }

      const { error: linkError } = await supabase
        .from("User_providers")
        .insert({
          user_id: userId,
          provider_user_id: authUser.id,
          provider,
        });

      if (linkError) throw linkError;

      Alert.alert("Connexion réussie", "Bienvenue !");
      console.log("Utilisateur Apple lié avec succès :", userId);
    } catch (e) {
      if (e.code === "ERR_REQUEST_CANCELED") {
        console.log("Connexion Apple annulée");
      } else {
        console.error("Erreur Apple SignIn:", e);
        Alert.alert("Erreur", e.message);
      }
    }
  }

  if (Platform.OS === "ios") {
    return (
      <AppleAuthentication.AppleAuthenticationButton
        buttonType={AppleAuthentication.AppleAuthenticationButtonType.SIGN_UP}
        buttonStyle={AppleAuthentication.AppleAuthenticationButtonStyle.BLACK}
        cornerRadius={5}
        style={{ width: width * 0.15, height: width * 0.15 }}
        onPress={handleAppleSignIn}
      />
    );
  }

  return <>{/* À implémenter pour Android si besoin */}</>;
}
