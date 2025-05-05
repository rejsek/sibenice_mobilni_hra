import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, ScrollView, Dimensions } from "react-native";
import { useRouter } from "expo-router";
import Icon from "react-native-vector-icons/MaterialIcons";
import { PieChart } from "react-native-chart-kit";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { SafeAreaView } from "react-native-safe-area-context";

// Nacteni dat ze souboru
import wordsJson from "../(game)/words.json";
import buttonsJson from "../(menu)/buttons.json";

// Definice typu
type WordEntry = { word: string; hint: string };
type WordsDataType = Record<string, Record<string, WordEntry[]>>;
type ButtonItem = { name: string; color: string; icon: string };

// Inicializace dat
const wordsData = wordsJson as WordsDataType;
const topicsMap = Object.fromEntries(buttonsJson.topics.map((t) => [t.name, { color: t.color, icon: t.icon }]));
const difficultyMap = Object.fromEntries(buttonsJson.difficultyLevels.map((d) => [d.name, { color: d.color, icon: d.icon }]));
const screenWidth = Dimensions.get("window").width;

export default function ProgressScreen() {
  const router = useRouter();

  // Stav pro rozbaleni stromu, nactene skore a tema
  const [expandedKeys, setExpandedKeys] = useState<string[]>([]);
  const [userScores, setUserScores] = useState<Record<string, number>>({});
  const [theme, setTheme] = useState("dark");

  // Nacteni tematu a skore z AsyncStorage
  useEffect(() => {
    const loadThemeAndScores = async () => {
      try {
        const storedTheme = await AsyncStorage.getItem("theme");
        if (storedTheme) setTheme(storedTheme);

        const storedScores = await AsyncStorage.getItem("score");
        if (storedScores) setUserScores(JSON.parse(storedScores));
      } catch (error) {
        console.error("Chyba pri nacitani dat:", error);
      }
    };

    loadThemeAndScores();
  }, []);

  // Rozbaleni/zbaveni se urovne ve stromu
  const toggleExpand = (id: string) => {
    setExpandedKeys((prevKeys) =>
      prevKeys.includes(id) ? prevKeys.filter((key) => key !== id) : [...prevKeys, id]
    );
  };

  // Zobrazeni hvezdicek (1–3)
  const renderStars = (score: number) => {
    const stars = "★".repeat(score) + "☆".repeat(3 - score);
    
    return (
      <Text className={`text-lg ${theme === "dark" ? "text-yellow-400" : "text-yellow-500"}`}>
        {stars}
      </Text>
    );
  };

  // Prevod slovniku na strukturovany strom pro TreeView
  const treeData = Object.entries(wordsData).map(([topic, difficulties]) => ({
    id: topic,
    name: topic,
    color: topicsMap[topic]?.color || "#6B7280",
    icon: topicsMap[topic]?.icon || "folder",
    children: Object.entries(difficulties).map(([difficulty, levels]) => ({
      id: `${topic}-${difficulty}`,
      name: difficulty,
      color: difficultyMap[difficulty]?.color || "#9CA3AF",
      icon: difficultyMap[difficulty]?.icon || "flag",
      children: levels.map(({ word }, index) => ({
        id: `${topic}-${difficulty}-${word}`,
        name: word,
        stars: userScores[word] || 0,
        levelNumber: index + 1,
      })),
    })),
  }));

  // Rekurzivni vykresleni jedne vetve stromu
  const renderTreeNode = (
    node: { id: string; name: string; levelNumber?: number; stars?: number; color?: string; icon?: string; children?: any[] },
    level = 0
  ) => {
    const isExpanded = expandedKeys.includes(node.id);
  
    const widthClass =
      level === 0 ? "w-full" :
      level === 1 ? "w-[90%]" :
      "w-[80%]";
  
    const textSize =
      level === 0 ? "text-[20px]" :
      level === 1 ? "text-[18px]" :
      "text-[16px]";
  
    const backgroundClass = node.children
      ? node.color
        ? ""
        : theme === "dark"
          ? "bg-gray-700"
          : "bg-gray-200"
      : theme === "dark"
        ? "bg-gray-800"
        : "bg-gray-300";
  
    return (
      <View key={node.id}>
        <TouchableOpacity
          onPress={() => node.children && toggleExpand(node.id)}
          className={`
            flex-row items-center rounded-2xl my-2 py-3 px-4 self-center ${widthClass} ${backgroundClass}
          `}
          style={
            node.color ? { backgroundColor: node.color } : undefined
          }
        >
          {/* Šipka nebo tečka */}
          {node.children ? (
            <Icon
              name={isExpanded ? "expand-more" : "chevron-right"}
              size={28}
              color="white"
              style={{ marginRight: 8 }}
            />
          ) : (
            <Icon
              name="circle"
              size={8}
              color="white"
              style={{ marginRight: 12 }}
            />
          )}
  
          {/* Ikona */}
          {node.icon && (
            <Icon
              name={node.icon}
              size={level === 0 ? 28 : 24}
              color="white"
              style={{ marginRight: 8 }}
            />
          )}
  
          {/* Text názvu */}
          <Text
            className={`font-bold flex-1 ${textSize} text-white`}
          >
            {node.levelNumber !== undefined
              ? `Úroveň ${node.levelNumber}`
              : node.name}
          </Text>
  
          {/* Hvězdičky */}
          {node.stars !== undefined && renderStars(node.stars)}
        </TouchableOpacity>
  
        {/* Podúrovně */}
        {isExpanded && node.children && node.children.map((child) => renderTreeNode(child, level + 1))}
      </View>
    );
  };
 
  
  // Vypocet dat pro kolacovy graf podle poctu ziskanych hvezd
  const graphData = Object.keys(wordsData)
    .map((topic) => {
      const totalStars = Object.values(wordsData[topic])
        .flat()
        .reduce((sum, level) => sum + (userScores[level.word] || 0), 0);

      return {
        name: topic,
        stars: totalStars,
        color: topicsMap[topic]?.color || "#6B7280",
        legendFontColor: "#FFFFFF",
        legendFontSize: 14,
      };
    })
    .filter((data) => data.stars > 0);

  return (
    <SafeAreaView className={`flex-1 px-6 ${theme === "dark" ? "bg-gray-800" : "bg-white"}`}>
      <ScrollView className="flex-grow pb-5" showsVerticalScrollIndicator={false}>
        {/* Tlacitko Zpet */}
        <TouchableOpacity
          onPress={() => router.push("/menu")}
          className={`flex-row items-center py-2 px-4 rounded-2xl mb-5 self-start ${
            theme === "dark" ? "bg-gray-700" : "bg-gray-300"
          }`}
        >
          <Icon name="arrow-back" size={24} color={theme === "dark" ? "white" : "black"} />
          <Text className={`text-lg font-bold ml-2 ${theme === "dark" ? "text-white" : "text-black"}`}>Zpět</Text>
        </TouchableOpacity>

        {/* Nadpis */}
        <Text className={`text-2xl font-bold text-center mb-5 ${theme === "dark" ? "text-white" : "text-black"}`}>
          Herní postup
        </Text>

        {/* Strom hernich urovni */}
        {treeData.map((node) => renderTreeNode(node))}

        {/* Kolacovy graf */}
        {graphData.length > 0 && (
          <View
            className={`mt-7 p-3 rounded-xl ${
              theme === "dark" ? "shadow-md bg-gray-700" : "shadow-none bg-gray-300"
            }`}
          >
            <Text
              className={`text-xl font-bold mb-2 ${
                theme === "dark" ? "text-white" : "text-white"
              }`}
            >
              Počet hvězd podle témat
            </Text>
            
            <PieChart
              data={graphData}
              width={screenWidth - 40}
              height={220}
              chartConfig={{
                color: (opacity = 1) =>
                  theme === "dark"
                    ? `rgba(255, 255, 255, ${opacity})`
                    : `rgba(0, 0, 0, ${opacity})`,
              }}
              
              accessor="stars"
              backgroundColor="transparent"
              paddingLeft="15"
              absolute
            />
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
