import { useRouter } from "expo-router";
import { View, Text, TouchableOpacity, Animated, Easing } from "react-native";
import Icon from "react-native-vector-icons/MaterialIcons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useState, useEffect, useRef } from "react";

/**
 * Hlavni obrazovka aplikace - zobrazuje tlacitka pro spusteni hry, nastaveni a ukonceni.
 */
export default function Index() {
  const router = useRouter();
  const [theme, setTheme] = useState("dark");

  // Reference na animaci tlacitka
  const scaleAnim = useRef(new Animated.Value(1)).current;

  // Nacteni tematu ze storage pri spusteni aplikace
  useEffect(() => {
    const loadTheme = async () => {
      try {
        const storedTheme = await AsyncStorage.getItem("theme");
        if (storedTheme) {
          setTheme(storedTheme);
        }
      } catch (error) {
        console.error("Chyba pri nacitani tematu:", error);
      }
    };

    loadTheme();
  }, []);

  // Spusteni animace pro tlacitko "Zacit hru"
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(scaleAnim, {
          toValue: 1.05,
          duration: 1000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 1000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  return (
    <View
      className="flex-1 items-center justify-center px-6"
      style={{ backgroundColor: theme === "dark" ? "#1F2937" : "#FFFFFF" }}
    >
      <View className="w-full max-w-[400px] items-center">
        {/* Nadpis */}
        <View
          className="rounded-2xl px-10 py-6 mb-12 flex-row justify-center items-center border-4"
          style={{
            backgroundColor: theme === "dark" ? "#374151" : "#F3F4F6",
            borderColor: theme === "dark" ? "#4B5563" : "#D1D5DB",
          }}
        >
          <Text
            className="text-center uppercase font-bold"
            style={{
              fontSize: 44,
              color: theme === "dark" ? "#FFFFFF" : "#000000",
              letterSpacing: 3,
            }}
          >
            ŠIBENICE
          </Text>
        </View>

        {/* Tlacitko - Zacit hru */}
        <Animated.View style={{ width: "100%", transform: [{ scale: scaleAnim }] }}>
          <TouchableOpacity
            className="bg-green-600 px-6 py-5 rounded-xl mb-6 w-full flex-row justify-center items-center"
            activeOpacity={0.8}
            onPress={() => router.push("/menu")}
          >
            <Icon name="play-arrow" size={30} color="white" />
            <Text className="text-white font-bold text-xl ml-2">Začít hru</Text>
          </TouchableOpacity>
        </Animated.View>

        {/* Tlacitko - Nastaveni */}
        <TouchableOpacity
          className="bg-blue-600 px-6 py-5 rounded-xl mb-6 w-full flex-row justify-center items-center"
          activeOpacity={0.8}
          onPress={() => router.push("/settings")}
        >
          <Icon name="settings" size={30} color="white" />
          <Text className="text-white font-bold text-xl ml-2">Nastavení</Text>
        </TouchableOpacity>

        {/* Tlacitko - Ukoncit hru */}
        <TouchableOpacity
          className="bg-red-600 px-6 py-5 rounded-xl w-full flex-row justify-center items-center"
          activeOpacity={0.8}
        >
          <Icon name="exit-to-app" size={30} color="white" />
          <Text className="text-white font-bold text-xl ml-2">Ukončit hru</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
