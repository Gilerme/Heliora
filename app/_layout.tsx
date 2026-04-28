import { useColorScheme } from "@/hooks/use-color-scheme";
import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import * as Notifications from "expo-notifications";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { Platform } from "react-native";
import "react-native-reanimated";

import {
  Merriweather_400Regular,
  Merriweather_700Bold,
  useFonts,
} from "@expo-google-fonts/merriweather";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

if (Platform.OS === "android") {
  Notifications.setNotificationChannelAsync("default", {
    name: "Padrão",
    importance: Notifications.AndroidImportance.MAX,
    vibrationPattern: [0, 250, 250, 250],
    lightColor: "#4A729A",
  });
}

export const unstable_settings = {
  anchor: "(tabs)",
};

export default function RootLayout() {
  const colorScheme = useColorScheme();

  const [fontsLoaded] = useFonts({
    Merriweather_Regular: Merriweather_400Regular,
    Merriweather_Bold: Merriweather_700Bold,
  });

  if (!fontsLoaded) {
    return null;
  }

  return (
    <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
      <Stack>
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="cadastro" options={{ headerShown: false }} />
        <Stack.Screen name="esqueci-senha" options={{ headerShown: false }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen
          name="modal"
          options={{ presentation: "modal", headerShown: false }}
        />
        <Stack.Screen
          name="alergias"
          options={{ presentation: "modal", headerShown: false }}
        />
        <Stack.Screen
          name="condicoes"
          options={{ presentation: "modal", headerShown: false }}
        />
        <Stack.Screen
          name="exames"
          options={{ presentation: "modal", headerShown: false }}
        />
        <Stack.Screen
          name="perfil"
          options={{ presentation: "modal", headerShown: false }}
        />
      </Stack>
      <StatusBar style="dark" />
    </ThemeProvider>
  );
}
