import React, { useEffect, useRef, useState } from "react";
import {
  SafeAreaView,
  View,
  Text,
  Dimensions,
  Animated,
  TouchableOpacity
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import ConfettiCannon from "react-native-confetti-cannon";
import * as Progress from "react-native-progress";

const screenWidth = Dimensions.get("window").width;
const screenHeight = Dimensions.get("window").height;

export default function WinScreen() {
  const router = useRouter();
  const { word, wrongCount, topic, difficulty, level} = useLocalSearchParams();
  const translateYAnim = useRef(new Animated.Value(300)).current;
  const [showConfetti, setShowConfetti] = useState(true);

  useEffect(() => {
    Animated.timing(translateYAnim, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start();

    setTimeout(() => setShowConfetti(false), 5000);
  }, []);

  const parsedWrongCount = Number(wrongCount);
  const parsedLevel = Number(level);
  const stars = parsedWrongCount === 0 ? 3 : parsedWrongCount <= 2 ? 2 : parsedWrongCount <= 4 ? 1 : 0;

  return (
    <SafeAreaView className="flex-1 bg-gray-800 px-6 items-center justify-center">
      {showConfetti && <ConfettiCannon count={200} origin={{ x: screenWidth / 2, y: screenHeight }} fadeOut={true} />}

      <Animated.View className="items-center mb-8" style={{ transform: [{ translateY: translateYAnim }] }}>
        <Text className="text-4xl font-bold text-white text-center">Úroveň dokončena!</Text>
        <Text className="text-lg text-white mt-2">Hledané slovo bylo:</Text>
      </Animated.View>

      <View className="bg-white p-5 rounded-lg shadow-lg items-center">
        <Text className="text-3xl font-bold text-black">{word}</Text>
      </View>

      <View style={{ flexDirection: "row", marginVertical: 30, justifyContent: "center", alignItems: "center" }}>
        <Text style={{ fontSize: stars >= 1 ? 50 : 40, color: stars >= 1 ? "#FFD700" : "gray", marginHorizontal: 10 }}>★</Text>
        <Text style={{ fontSize: stars === 3 ? 65 : 50, color: stars === 3 ? "#FFD700" : "gray", marginHorizontal: 10 }}>★</Text>
        <Text style={{ fontSize: stars >= 2 ? 50 : 40, color: stars >= 2 ? "#FFD700" : "gray", marginHorizontal: 10 }}>★</Text>
      </View>

      <Progress.Bar progress={1} width={screenWidth * 0.8} color="#FFD700" className="my-5" />

      <TouchableOpacity
        onPress={() => router.push({ pathname: "/game", params: { topic, difficulty, level: parsedLevel + 1 } })}
        className="bg-white py-4 rounded-lg mt-4 w-4/5 items-center shadow-md"
      >
        <Text className="text-xl font-bold text-blue-500">Další úroveň</Text>
      </TouchableOpacity>

      <TouchableOpacity
        onPress={() => router.push({ pathname: "/levels", params: { topic, difficulty } })}
        className="py-4 rounded-lg mt-4 w-4/5 items-center border-2 border-white shadow-md"
      >
        <Text className="text-xl font-bold text-white">Hlavní menu</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}
