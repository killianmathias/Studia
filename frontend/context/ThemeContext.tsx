// ThemeContext.tsx
import React, { createContext, useState, useMemo, ReactNode } from "react";
import { useColorScheme } from "react-native";
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

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const systemScheme = useColorScheme(); // "light" | "dark" | null
  const [mode, setMode] = useState<ThemeMode>("system");

  const theme = useMemo<Theme>(() => {
    if (mode === "light") return lightTheme;
    if (mode === "dark") return darkTheme;
    return systemScheme === "dark" ? darkTheme : lightTheme;
  }, [mode, systemScheme]);

  return (
    <ThemeContext.Provider value={{ theme, mode, setMode }}>
      {children}
    </ThemeContext.Provider>
  );
};
