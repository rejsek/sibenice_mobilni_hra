import { useRouter, useLocalSearchParams } from "expo-router";
import { View, Text, TouchableOpacity, ScrollView } from "react-native";
import { useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { SafeAreaView } from "react-native-safe-area-context";

// 1) Typy pro JSON data
type WordEntry = { word: string; hint: string; score: number };
type WordsDataType = Record<string, Record<string, WordEntry[]>>;

// 2) Import JSON dat
import wordsJson from "../(game)/words.json";
const wordsData = wordsJson as WordsDataType; // TODO - u kazdeho zaznamu v jsonu neni score

export default function LevelSelect() {
  const router = useRouter();
  const { topic, difficulty } = useLocalSearchParams();
  const [levelsData, setLevelsData] = useState<WordEntry[]>([]);
  const [scores, setScores] = useState<number[]>([]);

  useEffect(() => {
    try {
      const safeTopic = Array.isArray(topic) ? topic[0] : topic;
      const safeDifficulty = Array.isArray(difficulty) ? difficulty[0] : difficulty;

      if (safeTopic && safeDifficulty && wordsData[safeTopic] && wordsData[safeTopic][safeDifficulty]) {
        const selectedLevels = wordsData[safeTopic][safeDifficulty];
        setLevelsData(selectedLevels);

        // Načíst skóre z AsyncStorage
        AsyncStorage.getItem(`scores_${safeTopic}_${safeDifficulty}`).then((storedScores) => {
          if (storedScores) {
            setScores(JSON.parse(storedScores));
          } else {
            setScores(selectedLevels.map((level) => level.score)); // Výchozí skóre
          }
        });
      }
    } catch (error) {
      console.error("Chyba při načítání JSON souboru:", error);
    }
  }, [topic, difficulty]);

  const renderStars = (score: number) => {
    const stars = "★".repeat(score) + "☆".repeat(3 - score);
    return <Text className="text-yellow-400 text-lg">{stars}</Text>;
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-800 px-6">
      <ScrollView contentContainerStyle={{ flexGrow: 1, alignItems: "center", paddingVertical: 20 }}>
        <TouchableOpacity
          onPress={() => router.push("/menu")}
          className="absolute top-5 left-0 bg-gray-700 px-4 py-2 rounded-full z-50"
        >
          <Text className="text-white text-lg font-semibold">← Zpět</Text>
        </TouchableOpacity>

        <View className="mt-16 w-full items-center">
          <Text className="text-white text-3xl font-bold mb-6">Vyber level</Text>
          <Text className="text-gray-300 text-lg mb-4">Téma: {topic} | Obtížnost: {difficulty}</Text>

          {Array.from({ length: Math.ceil(levelsData.length / 2) }, (_, rowIndex) => (
            <View key={rowIndex} className="flex-row justify-between w-full px-6 mb-4">
              {[0, 1].map((colIndex) => {
                const levelIndex = rowIndex * 2 + colIndex;
                if (levelIndex >= levelsData.length) return null;

                return (
                  <TouchableOpacity
                    key={levelIndex}
                    onPress={() => router.push({ pathname: "/game", params: { topic, difficulty, level: levelIndex + 1 } })}
                    className="w-40 bg-gray-700 px-6 py-4 rounded-xl shadow-lg shadow-black items-center"
                  >
                    <Text className="text-white text-xl font-semibold">Level {levelIndex + 1}</Text>
                    {renderStars(scores[levelIndex] || 0)}
                  </TouchableOpacity>
                );
              })}
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
