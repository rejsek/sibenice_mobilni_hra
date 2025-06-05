import { useRouter, useLocalSearchParams } from "expo-router";
import { View, Text, ScrollView, TouchableOpacity } from "react-native";
import { useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { SafeAreaView } from "react-native-safe-area-context";
import Icon from "react-native-vector-icons/MaterialIcons";

// Definice typu pro jednotlive levely
type WordEntry = { word: string; hint: string; score?: number };
type WordsDataType = Record<string, Record<string, WordEntry[]>>;

// Import hernich dat (tema → obtiznost → seznam slov)
import wordsJson from "../(game)/words.json";
const wordsData = wordsJson as WordsDataType;

/**
 * Komponenta pro vyber urovne na zaklade tematu a obtiznosti
 */
export default function LevelSelect() {
  const router = useRouter();
  const { topic, difficulty } = useLocalSearchParams();

  const [levelsData, setLevelsData] = useState<WordEntry[]>([]);
  const [userScores, setUserScores] = useState<Record<string, number>>({});
  const [theme, setTheme] = useState("dark");

  // Nacteni tematu, dat a skore pri nacitani obrazovky
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

    const loadData = async () => {
      try {
        const safeTopic = Array.isArray(topic) ? topic[0] : topic;
        const safeDifficulty = Array.isArray(difficulty) ? difficulty[0] : difficulty;

        // Nacteni slov podle vybraneho tematu a obtiznosti
        if (
          safeTopic &&
          safeDifficulty &&
          wordsData[safeTopic] &&
          wordsData[safeTopic][safeDifficulty]
        ) {
          setLevelsData(wordsData[safeTopic][safeDifficulty]);
        }

        // Nacteni skore z AsyncStorage
        const storedScores = await AsyncStorage.getItem("score");
        if (storedScores) {
          setUserScores(JSON.parse(storedScores));
        }
      } catch (error) {
        console.error("Chyba pri nacitani dat:", error);
      }
    };

    loadTheme();
    loadData();
  }, [topic, difficulty]);

  // Zobrazeni hvezd podle skore
  const renderStars = (score: number) => {
    const stars = "★".repeat(score) + "☆".repeat(3 - score);
    
    return (
      <Text className={`text-lg ${theme === "dark" ? "text-yellow-400" : "text-yellow-500"}`}>
        {stars}
      </Text>
    );
  };

  return (
    <SafeAreaView className={`flex-1 px-6 ${theme === "dark" ? "bg-gray-800" : "bg-white"}`}>
      <ScrollView contentContainerStyle={{ flexGrow: 1, alignItems: "center", paddingVertical: 20 }}>
        {/* Tlacitko zpet */}
        <TouchableOpacity
          onPress={() => router.push("/menu")}
          className={`absolute top-5 left-0 px-4 py-2 rounded-full flex-row items-center z-50 ${
            theme === "dark" ? "bg-gray-700" : "bg-gray-300"
          }`}
        >
          <Icon name="arrow-back" size={24} color={theme === "dark" ? "white" : "black"} />
          <Text className={`text-lg font-semibold ml-2 ${theme === "dark" ? "text-white" : "text-black"}`}>Zpět</Text>
        </TouchableOpacity>

        {/* Nadpis a informace o vyberu */}
        <View className="mt-16 w-full items-center">
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

          {/* Mrizka s urovnemi (2 sloupce) */}
          {Array.from({ length: Math.ceil(levelsData.length / 2) }, (_, rowIndex) => (
            <View key={rowIndex} className="flex-row justify-between w-full px-6 mb-4">
              {[0, 1].map((colIndex) => {
                const levelIndex = rowIndex * 2 + colIndex;
                if (levelIndex >= levelsData.length) return null;

                const currentWord = levelsData[levelIndex].word;
                const currentScore = userScores[currentWord] || 0;

                return (
                  <TouchableOpacity
                    key={levelIndex}
                    onPress={() =>
                      router.push({
                        pathname: "/game",
                        params: { topic, difficulty, level: levelIndex + 1 },
                      })
                    }
                    
                    // Přidáno zarovnání na střed
                    className={`w-[48%] px-4 py-4 rounded-xl items-center ${
                      theme === "dark" ? "bg-gray-700 shadow-lg shadow-black" : "bg-gray-200"
                    } mb-4`}
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
