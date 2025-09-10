import React, { useState, ReactNode, createContext, useContext } from "react";
import {
  Modal,
  View,
  Text,
  Pressable,
  StyleSheet,
  Dimensions,
  StyleProp,
  TextStyle,
  ViewStyle,
} from "react-native";

const { width } = Dimensions.get("window");

export type AlertButton = {
  text: string;
  value: any;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
};

type AlertParams = {
  title?: string;
  message: string;
  buttons: AlertButton[];
};

type AlertContextType = {
  showAlert: (params: AlertParams) => Promise<any>;
};

const AlertContext = createContext<AlertContextType | undefined>(undefined);

export const useAlert = () => {
  const context = useContext(AlertContext);
  if (!context)
    throw new Error("useAlert must be used within CustomAlertProvider");
  return context;
};

type Props = {
  children: ReactNode;
};

export const CustomAlertProvider: React.FC<Props> = ({ children }) => {
  const [visible, setVisible] = useState(false);
  const [title, setTitle] = useState<string | undefined>(undefined);
  const [message, setMessage] = useState<string>("");
  const [buttons, setButtons] = useState<AlertButton[]>([]);
  const [resolveCallback, setResolveCallback] = useState<
    ((value: any) => void) | null
  >(null);

  const showAlert = ({ title, message, buttons }: AlertParams) => {
    return new Promise<any>((resolve) => {
      setTitle(title);
      setMessage(message);
      setButtons(buttons);
      setResolveCallback(() => resolve);
      setVisible(true);
    });
  };

  const handlePress = (value: any) => {
    if (resolveCallback) resolveCallback(value);
    setVisible(false);
  };

  return (
    <AlertContext.Provider value={{ showAlert }}>
      {children}
      <Modal transparent animationType="fade" visible={visible}>
        <View style={styles.overlay}>
          <View style={styles.container}>
            {title && <Text style={styles.title}>{title}</Text>}
            <Text style={styles.message}>{message}</Text>
            <View style={styles.buttonContainer}>
              {buttons.map((btn, idx) => (
                <Pressable
                  key={idx}
                  style={[styles.button, btn.style]}
                  onPress={() => handlePress(btn.value)}
                >
                  <Text style={[styles.buttonText, btn.textStyle]}>
                    {btn.text}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>
        </View>
      </Modal>
    </AlertContext.Provider>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  container: {
    width: width * 0.8,
    backgroundColor: "white",
    borderRadius: 15,
    padding: 20,
    elevation: 5,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 10,
    textAlign: "center",
  },
  message: {
    fontSize: 16,
    textAlign: "center",
    marginBottom: 20,
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "flex-end",
  },
  button: {
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 8,
    marginLeft: 10,
    backgroundColor: "#007AFF",
  },
  buttonText: {
    color: "white",
    fontWeight: "bold",
  },
});
