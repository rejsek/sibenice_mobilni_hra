import React, { useEffect, useRef, useState } from "react";
import {
  SafeAreaView,
  View,
  Text,
  Dimensions,
  Animated,
  TouchableOpacity,
  Image,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import ConfettiCannon from "react-native-confetti-cannon";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { imagesMap } from "./imageMap";

// Ziskani rozmeru obrazovky
const screenHeight = Dimensions.get("window").height;
const screenWidth = Dimensions.get("window").width;

export default function WinScreen() {
  const router = useRouter();
  const { word, wrongCount, topic, difficulty, level } = useLocalSearchParams();

  const translateYAnim = useRef(new Animated.Value(300)).current;
  const [showConfetti, setShowConfetti] = useState(true);
  const [theme, setTheme] = useState("dark");

  // Nacteni aktualniho tematu (dark / light)
  useEffect(() => {
    const loadTheme = async () => {
      try {
        const storedTheme = await AsyncStorage.getItem("theme");
        if (storedTheme) setTheme(storedTheme);
      } catch (error) {
        console.error("Chyba pri nacitani tematu:", error);
      }
    };

    // Spusteni animace titulku po vyhre
    Animated.timing(translateYAnim, {
      toValue: 0,
      duration: 500,
      useNativeDriver: true,
    }).start();

    loadTheme();
    setTimeout(() => setShowConfetti(false), 5000);
  }, []);

  // Prevod parametru a vypocet hvezd podle poctu chyb
  const parsedWrongCount = Number(wrongCount);
  const parsedLevel = Number(level);
  const stars = parsedWrongCount === 0 ? 3 : parsedWrongCount <= 2 ? 2 : parsedWrongCount <= 4 ? 1 : 0;
  const chosenImage = word ? imagesMap[word] : null;

  return (
    <SafeAreaView className={`flex-1 items-center justify-center ${theme === "dark" ? "bg-gray-900" : "bg-white"}`}>
      {/* Efekt konfety */}
      {showConfetti && (
        <ConfettiCannon count={200} origin={{ x: screenWidth / 2, y: screenHeight }} fadeOut />
      )}

      {/* Nadpis */}
      <Animated.View
        className="items-center mb-6"
        style={{ transform: [{ translateY: translateYAnim }] }}
      >
        <Text className={`text-4xl font-bold text-center ${theme === "dark" ? "text-white" : "text-gray-900"}`}>
          Úroveň dokončena!
        </Text>
        <Text className={`text-lg mt-2 ${theme === "dark" ? "text-gray-300" : "text-gray-700"}`}>
          Hledané slovo bylo: {"\u00A0"}
          <Text className={`text-2xl font-bold${theme === "dark" ? "text-gray-300" : "text-gray-700"}}`}>
            {word}
          </Text>
        </Text>
      </Animated.View>

      {/* Obrázková karta */}
      <View
        className={`p-5 rounded-xl items-center border-2 ${
          theme === "dark"
            ? "bg-gray-800 border-gray-600 shadow-lg"
            : "bg-gray-200 border-gray-400"
        }`}
      >
        {chosenImage && (
          <Image
            source={chosenImage}
            style={{ width: screenWidth * 0.8, height: screenWidth * 0.7, marginTop: 10, marginBottom: 10 }}
            resizeMode="contain"
          />
        )}
      </View>

      {/* Skóre */}
      <Text className={`text-lg mt-5 ${theme === "dark" ? "text-gray-300" : "text-gray-700"}`}>Dosažené skóre:</Text>

      {/* Hvězdy */}
      <View className="flex-row mt-3 mb-5 justify-center items-center">
        {Array(3)
          .fill(null)
          .map((_, index) => {
            const starScale = useRef(new Animated.Value(0)).current;
            const pulseScale = useRef(new Animated.Value(1)).current;
            const isActive = stars > index;

            useEffect(() => {
              Animated.spring(starScale, {
                toValue: 1,
                friction: 4,
                tension: 100,
                useNativeDriver: true,
                delay: index * 200,
              }).start(() => {
                if (isActive) {
                  Animated.loop(
                    Animated.sequence([
                      Animated.timing(pulseScale, {
                        toValue: 1.2,
                        duration: 600,
                        useNativeDriver: true,
                      }),
                      Animated.timing(pulseScale, {
                        toValue: 1,
                        duration: 600,
                        useNativeDriver: true,
                      }),
                    ])
                  ).start();
                }
              });
            }, []);

            return (
              <Animated.Text
                key={index}
                style={{
                  fontSize: isActive ? (stars === 3 && index === 1 ? 65 : 50) : 40,
                  color: isActive ? "#FFD700" : "gray",
                  marginHorizontal: 10,
                  textShadowColor:
                    theme === "light"
                      ? "black"
                      : isActive
                      ? "white"
                      : "transparent",
                  textShadowOffset: { width: 1, height: 1 },
                  textShadowRadius: 1.5,
                  transform: [{ scale: Animated.multiply(starScale, pulseScale) }],
                }}
              >
                ★
              </Animated.Text>
            );
          })}
      </View>

      {/* Další úroveň */}
      <TouchableOpacity
        onPress={() => router.push({ pathname: "/game", params: { topic, difficulty, level: parsedLevel + 1 } })}
        className={`py-4 rounded-lg w-4/5 items-center ${
          theme === "dark" ? "shadow-md bg-gray-700" : "bg-gray-300"
        }`}
      >
        <Text className={`text-xl font-bold ${theme === "dark" ? "text-white" : "text-gray-900"}`}>
          Další úroveň
        </Text>
      </TouchableOpacity>

      {/* Zpět do menu */}
      <TouchableOpacity
        onPress={() => router.push({ pathname: "/levels", params: { topic, difficulty } })}
        className={`py-3 mt-3 rounded-lg w-4/5 items-center ${
          theme === "dark"
            ? "bg-gray-800 border-2 border-gray-700 shadow-md"
            : "bg-gray-200 border-2 border-gray-400"
        }`}
      >
        <Text className={`text-xl font-bold ${theme === "dark" ? "text-white" : "text-gray-900"}`}>
          Zpět do menu
        </Text>
      </TouchableOpacity>
    </SafeAreaView>

  );
}