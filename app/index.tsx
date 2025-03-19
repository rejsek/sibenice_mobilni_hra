import { useRouter } from "expo-router";
import { View, Text, TouchableOpacity, Animated, Easing } from "react-native";
import Icon from "react-native-vector-icons/MaterialIcons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useState, useEffect, useRef } from "react";

export default function Index() {
  const router = useRouter();
  const [theme, setTheme] = useState("dark");
  const scaleAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const loadTheme = async () => {
      try {
        const storedTheme = await AsyncStorage.getItem("theme");
        if (storedTheme) {
          setTheme(storedTheme);
        }
      } catch (error) {
        console.error("Chyba při načítání tématu:", error);
      }
    };

    loadTheme();
  }, []);

  useEffect(() => {
    // Animace tlačítka "Začít hru"
    Animated.loop(
      Animated.sequence([
        Animated.timing(scaleAnim, {
          toValue: 1.05, // Jemné zvětšení
          duration: 1000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 1, // Návrat na původní velikost
          duration: 1000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: theme === "dark" ? "#1F2937" : "#FFFFFF",
        paddingHorizontal: 24,
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <View style={{ width: "100%", maxWidth: 400, alignItems: "center" }}>
        {/* Hlavní nadpis */}
        <View
          style={{
            borderWidth: 4,
            borderColor: theme === "dark" ? "#4B5563" : "#D1D5DB",
            borderRadius: 20,
            paddingHorizontal: 40,
            paddingVertical: 24,
            marginBottom: 50, // Větší mezera pod nadpisem
            backgroundColor: theme === "dark" ? "#374151" : "#F3F4F6",
            flexDirection: "row",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <Text
            style={{
              fontSize: 44,
              fontWeight: "bold",
              color: theme === "dark" ? "white" : "black",
              textTransform: "uppercase",
              letterSpacing: 3,
              textAlign: "center",
            }}
          >
            ŠIBENICE
          </Text>
        </View>

        {/* Tlačítko - Začít hru (s animací, ale pevná šířka) */}
        <Animated.View style={{ width: "100%", transform: [{ scale: scaleAnim }] }}>
          <TouchableOpacity
            onPress={() => router.push("/menu")}
            activeOpacity={0.8}
            style={{
              backgroundColor: "#16A34A",
              paddingHorizontal: 24,
              paddingVertical: 16,
              borderRadius: 12,
              marginBottom: 24, // Větší mezera
              width: "100%",
              flexDirection: "row",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <Icon name="play-arrow" size={28} color="white" />
            <Text style={{ color: "white", fontSize: 20, fontWeight: "bold", marginLeft: 8 }}>Začít hru</Text>
          </TouchableOpacity>
        </Animated.View>

        {/* Tlačítko - Nastavení */}
        <TouchableOpacity
          onPress={() => router.push("/settings")}
          activeOpacity={0.8}
          style={{
            backgroundColor: "#2563EB",
            paddingHorizontal: 24,
            paddingVertical: 16,
            borderRadius: 12,
            marginBottom: 24, // Větší mezera
            width: "100%",
            flexDirection: "row",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <Icon name="settings" size={28} color="white" />
          <Text style={{ color: "white", fontSize: 20, fontWeight: "bold", marginLeft: 8 }}>Nastavení</Text>
        </TouchableOpacity>

        {/* Tlačítko - Ukončit hru */}
        <TouchableOpacity
          activeOpacity={0.8}
          style={{
            backgroundColor: "#DC2626",
            paddingHorizontal: 24,
            paddingVertical: 16,
            borderRadius: 12,
            width: "100%",
            flexDirection: "row",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <Icon name="exit-to-app" size={28} color="white" />
          <Text style={{ color: "white", fontSize: 20, fontWeight: "bold", marginLeft: 8 }}>Ukončit hru</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
