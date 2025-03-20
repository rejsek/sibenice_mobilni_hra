import React, { useEffect, useRef, useState } from "react";
import {
  SafeAreaView,
  View,
  Text,
  Dimensions,
  Animated,
  TouchableOpacity,
  Image
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import ConfettiCannon from "react-native-confetti-cannon";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { imagesMap } from "./imageMap";

const screenHeight = Dimensions.get("window").height;

export default function WinScreen() {
  const router = useRouter();
  const { word, wrongCount, topic, difficulty, level, image } = useLocalSearchParams();
  const translateYAnim = useRef(new Animated.Value(300)).current;
  const [showConfetti, setShowConfetti] = useState(true);
  const [theme, setTheme] = useState("dark");
  
  const screenWidth = Dimensions.get("window").width;

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

    Animated.timing(translateYAnim, {
      toValue: 0,
      duration: 500,
      useNativeDriver: true,
    }).start();

    loadTheme();
    setTimeout(() => setShowConfetti(false), 5000);
  }, []);

  const parsedWrongCount = Number(wrongCount);
  const parsedLevel = Number(level);
  const stars = parsedWrongCount === 0 ? 3 : parsedWrongCount <= 2 ? 2 : parsedWrongCount <= 4 ? 1 : 0;
  const chosenImage = word ? imagesMap[word] : null;

  return (
    <SafeAreaView className="flex-1 items-center justify-center bg-gray-100 dark:bg-gray-900">
      {showConfetti && (
        <ConfettiCannon count={200} origin={{ x: screenWidth / 2, y: screenHeight }} fadeOut />
      )}
  
      <Animated.View
        className="items-center mb-6"
        style={{ transform: [{ translateY: translateYAnim }] }}
      >
        <Text className="text-4xl font-bold text-center text-gray-900 dark:text-white">
          Úroveň dokončena!
        </Text>
        
        <Text className="text-lg mt-2 text-gray-700 dark:text-gray-300">
          Hledané slovo bylo:{"\u00A0"}
          <Text className="text-2xl text-gray-700 dark:text-gray-300 font-bold">
            {word}
          </Text>
        </Text>

      </Animated.View>

      {/* Karta s hledaným slovem */}
      <View className="p-5 rounded-xl shadow-lg items-center bg-white dark:bg-gray-800 border-2 border-gray-300 dark:border-gray-600">    
        {chosenImage && (
          <Image
            source={chosenImage}
            style={{ width: screenWidth * 0.8, height: screenWidth * 0.7, marginTop: 10, marginBottom: 10 }}
            resizeMode="contain"
          />
        )}
      </View>

      <Text className="text-lg mt-5 text-gray-700 dark:text-gray-300">
        Dosažené skóre:
      </Text>
  
      {/* Hvězdy s efektem */}
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
                  textShadowColor: isActive ? "rgba(255, 215, 0, 0.8)" : "transparent",
                  textShadowOffset: { width: 0, height: 0 },
                  textShadowRadius: isActive ? 8 : 0,
                  transform: [{ scale: Animated.multiply(starScale, pulseScale) }],
                }}
              >
                ★
              </Animated.Text>
            );
          })}
      </View>
  
      {/* Tlačítko "Další úroveň" */}
      <TouchableOpacity
        onPress={() => router.push({ pathname: "/game", params: { topic, difficulty, level: parsedLevel + 1 } })}
        className="py-4 rounded-lg w-4/5 items-center shadow-md bg-white dark:bg-gray-700"
      >
        <Text className="text-xl font-bold text-white">Další úroveň</Text>
      </TouchableOpacity>
  
      {/* Tlačítko "Hlavní menu" */}
      <TouchableOpacity
        onPress={() => router.push({ pathname: "/levels", params: { topic, difficulty } })}
        className="py-3 mt-3 rounded-lg w-4/5 items-center border-2 shadow-md border-gray-500 dark:border-gray-700 bg-gray-200 dark:bg-gray-800"
      >
        <Text className="text-xl font-bold text-gray-900 dark:text-white">Zpět do menu</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}
