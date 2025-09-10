import "react-native-url-polyfill/auto";
import { useState, useEffect, useContext } from "react";
import { supabase } from "./lib/supabase";
import { StyleSheet } from "react-native";
import { Session } from "@supabase/supabase-js";
import * as React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";

// Screens
import LoginScreen from "./screens/Auth/LoginScreen";
import HomeScreen from "./screens/HomeScreen";
import CalendarScreen from "./screens/CalendarScreen";
import AddExamScreen from "./screens/AddExamScreen";
import ProfileScreen from "./screens/ProfileScreen";
import FriendsScreen from "./screens/FriendsScreen";
import RegisterStep1Screen from "./screens/Auth/Register/RegisterStep1Screen";
import RegisterStep2Screen from "./screens/Auth/Register/RegisterStep2Screen";

// Components
import TabBar from "./components/TabBar";

// Context & utils
import { ThemeContext, ThemeProvider } from "./context/ThemeContext";
import { fetchUserId } from "./functions/functions";
import OtherProfileScreen from "./screens/OtherProfileScreen";
import { CustomAlertProvider } from "./components/CustomAlertService";

// --- Définition des types ---
export type RootStackParamList = {
  Connexion: undefined;
  RegisterStep1: undefined;
  RegisterStep2: undefined;
};

export type RootTabParamList = {
  home: undefined;
  calendar: undefined;
  add: undefined;
  friends: { userId: string | null };
  profile: { userId: string | null };
};

export type FriendsStackParamList = {
  Friends: { userId: string | null };
  OtherUsers: { userId: string | null };
};

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<RootTabParamList>();
const FriendsStack = createNativeStackNavigator<FriendsStackParamList>();

// --- Stack imbriqué pour les amis ---
function FriendsNavigator({ route }) {
  const { userId } = route.params;

  return (
    <FriendsStack.Navigator screenOptions={{ headerShown: false }}>
      <FriendsStack.Screen
        name="Friends"
        component={FriendsScreen}
        initialParams={{ userId }}
      />
      <FriendsStack.Screen
        name="OtherUsers"
        component={OtherProfileScreen}
        initialParams={{ userId }}
      />
    </FriendsStack.Navigator>
  );
}

// --- Tabs visibles après connexion ---
function MainTabs() {
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    async function fetchUid() {
      const uid = await fetchUserId();
      setUserId(uid);
    }
    fetchUid();
  }, []); // 👈 tableau de dépendances vide

  return (
    <Tab.Navigator
      tabBar={(props) => <TabBar {...props} />}
      screenOptions={{ headerShown: false }}
    >
      <Tab.Screen
        name="home"
        component={HomeScreen}
        options={{ tabBarLabel: "Accueil" }}
      />
      <Tab.Screen
        name="calendar"
        component={CalendarScreen}
        options={{ tabBarLabel: "Calendrier" }}
      />
      <Tab.Screen
        name="add"
        component={AddExamScreen}
        options={{ tabBarLabel: "Ajouter" }}
      />
      <Tab.Screen
        name="friends"
        component={FriendsNavigator}
        options={{ tabBarLabel: "Amis" }}
        initialParams={{ userId }}
      />
      <Tab.Screen
        name="profile"
        component={ProfileScreen}
        options={{ tabBarLabel: "Profil" }}
        initialParams={{ userId }}
      />
    </Tab.Navigator>
  );
}

// --- App principale ---
export default function App() {
  const [isLoggedIn, setIsLoggedIn] = React.useState(false);
  const { theme } = useContext(ThemeContext);
  const [session, setSession] = useState<Session | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setIsLoggedIn(!!session);
    });

    const { data: authListener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session);
        setIsLoggedIn(!!session);
      }
    );

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  return (
    <ThemeProvider>
      <CustomAlertProvider>
        <NavigationContainer>
          {isLoggedIn ? (
            <MainTabs />
          ) : (
            <Stack.Navigator screenOptions={{ headerShown: false }}>
              <Stack.Screen name="Connexion" component={LoginScreen} />
              <Stack.Screen
                name="RegisterStep1"
                component={RegisterStep1Screen}
              />
              <Stack.Screen
                name="RegisterStep2"
                component={RegisterStep2Screen}
              />
            </Stack.Navigator>
          )}
        </NavigationContainer>
      </CustomAlertProvider>
    </ThemeProvider>
  );
}

const styles = StyleSheet.create({});
