import { useRouter } from "expo-router";
import { View, Text, TouchableOpacity } from "react-native";
import Icon from "react-native-vector-icons/MaterialIcons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useState, useEffect } from "react";

export default function Index() {
  const router = useRouter();
  const [theme, setTheme] = useState("dark");

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
            marginBottom: 40,
            shadowColor: "#000",
            shadowOpacity: 0.5,
            shadowRadius: 10,
            backgroundColor: theme === "dark" ? "#374151" : "#F3F4F6",
            flexDirection: "row",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <Icon name="sports-esports" size={50} color={theme === "dark" ? "white" : "black"} style={{ marginRight: 10 }} />
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

        {/* Tlačítko - Začít hru */}
        <TouchableOpacity
          onPress={() => router.push("/menu")}
          style={{
            backgroundColor: "#16A34A",
            paddingHorizontal: 24,
            paddingVertical: 16,
            borderRadius: 12,
            marginBottom: 16,
            width: "100%",
            flexDirection: "row",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <Icon name="play-arrow" size={28} color="white" />
          <Text style={{ color: "white", fontSize: 20, fontWeight: "bold", marginLeft: 8 }}>Začít hru</Text>
        </TouchableOpacity>

        {/* Tlačítko - Nastavení */}
        <TouchableOpacity
          onPress={() => router.push("/settings")}
          style={{
            backgroundColor: "#2563EB",
            paddingHorizontal: 24,
            paddingVertical: 16,
            borderRadius: 12,
            marginBottom: 16,
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
