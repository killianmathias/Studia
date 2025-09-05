// ThemeContext.tsx
import React, {
  createContext,
  useState,
  useMemo,
  useEffect,
  ReactNode,
} from "react";
import { useColorScheme } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { lightTheme, darkTheme, Theme } from "../themes/themes";

export type ThemeMode = "light" | "dark" | "system";

type ThemeContextType = {
  theme: Theme;
  mode: ThemeMode;
  setMode: (mode: ThemeMode) => void;
};

export const ThemeContext = createContext<ThemeContextType>({
  theme: lightTheme,
  mode: "system",
  setMode: () => {},
});

type ThemeProviderProps = {
  children: ReactNode;
};

const STORAGE_KEY = "@theme_mode";

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const systemScheme = useColorScheme(); // "light" | "dark" | null
  const [mode, setModeState] = useState<ThemeMode>("system");
  const [loaded, setLoaded] = useState(false);

  // Charger le mode sauvegardé au démarrage
  useEffect(() => {
    const loadMode = async () => {
      try {
        const savedMode = await AsyncStorage.getItem(STORAGE_KEY);
        if (
          savedMode === "light" ||
          savedMode === "dark" ||
          savedMode === "system"
        ) {
          setModeState(savedMode);
        }
      } catch (error) {
        console.log("Erreur lors du chargement du thème :", error);
      } finally {
        setLoaded(true);
      }
    };
    loadMode();
  }, []);

  // Fonction pour changer le mode et le sauvegarder
  const setMode = async (newMode: ThemeMode) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, newMode);
      setModeState(newMode);
    } catch (error) {
      console.log("Erreur lors de la sauvegarde du thème :", error);
    }
  };

  const theme = useMemo<Theme>(() => {
    if (mode === "light") return lightTheme;
    if (mode === "dark") return darkTheme;
    return systemScheme === "dark" ? darkTheme : lightTheme;
  }, [mode, systemScheme]);

  // Attendre le chargement du mode avant de rendre l'app
  if (!loaded) return null;

  return (
    <ThemeContext.Provider value={{ theme, mode, setMode }}>
      {children}
    </ThemeContext.Provider>
  );
};
