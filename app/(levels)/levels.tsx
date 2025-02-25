import { useRouter, useLocalSearchParams } from "expo-router";
import { View, Text, ScrollView, TouchableOpacity } from "react-native";
import { useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { SafeAreaView } from "react-native-safe-area-context";
import Icon from "react-native-vector-icons/MaterialIcons";


// 1) Typy pro JSON data
type WordEntry = { word: string; hint: string; score?: number };
type WordsDataType = Record<string, Record<string, WordEntry[]>>;

// 2) Import JSON dat
import wordsJson from "../(game)/words.json";
const wordsData = wordsJson as WordsDataType;

export default function LevelSelect() {
  const router = useRouter();
  const { topic, difficulty } = useLocalSearchParams();
  const [levelsData, setLevelsData] = useState<WordEntry[]>([]);
  const [userScores, setUserScores] = useState<Record<string, number>>({});
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

    const loadData = async () => {
      try {
        // 1. Načtení zvoleného tématu a obtížnosti + příslušná data z JSONu
        const safeTopic = Array.isArray(topic) ? topic[0] : topic;
        const safeDifficulty = Array.isArray(difficulty) ? difficulty[0] : difficulty;

        if (
          safeTopic &&
          safeDifficulty &&
          wordsData[safeTopic] &&
          wordsData[safeTopic][safeDifficulty]
        ) {
          setLevelsData(wordsData[safeTopic][safeDifficulty]);
        }

        // 2. Načtení skóre z AsyncStorage (klíč "score")
        const storedScores = await AsyncStorage.getItem("score");
        if (storedScores) {
          setUserScores(JSON.parse(storedScores));
        }
      } catch (error) {
        console.error("Chyba při načítání dat:", error);
      }
    };

    loadData();
    loadTheme();
  }, [topic, difficulty]);

  const renderStars = (score: number) => {
    const stars = "★".repeat(score) + "☆".repeat(3 - score);
    return <Text className="text-yellow-400 text-lg">{stars}</Text>;
  };

  return (
    <SafeAreaView className={`flex-1 px-6 ${theme === "dark" ? "bg-gray-800" : "bg-white"}`}>
      <ScrollView contentContainerStyle={{ flexGrow: 1, alignItems: "center", paddingVertical: 20 }}>
        {/* Tlačítko zpět s ikonou */}
        <TouchableOpacity
          onPress={() => router.push("/menu")}
          className={`absolute top-5 left-0 px-4 py-2 rounded-full flex-row items-center z-50 ${
            theme === "dark" ? "bg-gray-700" : "bg-gray-300"
          }`}
        >
          <Icon name="arrow-back" size={24} color={theme === "dark" ? "white" : "black"} />
          <Text className={`text-lg font-semibold ml-2 ${theme === "dark" ? "text-white" : "text-black"}`}>Zpět</Text>
        </TouchableOpacity>
  
        <View className="mt-16 w-full items-center">
          {/* Nadpis a info o výběru */}
          <Text className={`text-3xl font-bold mb-6 ${theme === "dark" ? "text-white" : "text-black"}`}>
            Vyber si úroveň
          </Text>
          <View className="flex-row items-center mb-4">
            <Icon name="category" size={24} color={theme === "dark" ? "white" : "black"} style={{ marginRight: 5 }} />
            <Text className={`text-lg ${theme === "dark" ? "text-gray-300" : "text-gray-600"}`}>
              Téma: {topic}
            </Text>
          </View>
          <View className="flex-row items-center mb-6">
            <Icon name="bar-chart" size={24} color={theme === "dark" ? "white" : "black"} style={{ marginRight: 5 }} />
            <Text className={`text-lg ${theme === "dark" ? "text-gray-300" : "text-gray-600"}`}>
              Obtížnost: {difficulty}
            </Text>
          </View>
  
          {/* Mřížka levelů */}
          {Array.from({ length: Math.ceil(levelsData.length / 2) }, (_, rowIndex) => (
            <View key={rowIndex} className="flex-row justify-between w-full px-6 mb-4">
              {[0, 1].map((colIndex) => {
                const levelIndex = rowIndex * 2 + colIndex;
                if (levelIndex >= levelsData.length) return null;
  
                // Zjistíme slovo na tomto levelu
                const currentWord = levelsData[levelIndex].word;
                // Najdeme skóre z userScores
                const currentScore = userScores[currentWord] || 0;
  
                return (
                  <TouchableOpacity
                    key={levelIndex}
                    onPress={() => router.push({ pathname: "/game", params: { topic, difficulty, level: levelIndex + 1 } })}
                    className={`w-40 px-6 py-4 rounded-xl shadow-lg items-center ${
                      theme === "dark" ? "bg-gray-700 shadow-black" : "bg-gray-200 shadow-gray-500"
                    }`}
                  >
                    <Text className={`text-xl font-semibold ${theme === "dark" ? "text-white" : "text-black"}`}>
                      Úroveň {levelIndex + 1}
                    </Text>
                    {renderStars(currentScore)}
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
