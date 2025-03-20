import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, ScrollView, Dimensions } from "react-native";
import { useRouter } from "expo-router";
import Icon from "react-native-vector-icons/MaterialIcons";
import { PieChart } from "react-native-chart-kit";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { SafeAreaView } from "react-native-safe-area-context";

// ✅ Import JSON souborů
import wordsJson from "../(game)/words.json";
import buttonsJson from "../(menu)/buttons.json";

// ✅ Typy dat
type WordEntry = { word: string; hint: string };
type WordsDataType = Record<string, Record<string, WordEntry[]>>;
type ButtonItem = { name: string; color: string };

const wordsData = wordsJson as WordsDataType;

// 🔹 Mapování barev pro témata i úrovně
const topicsMap = Object.fromEntries(buttonsJson.topics.map((t) => [t.name, { color: t.color, icon: t.icon }]));
const difficultyMap = Object.fromEntries(buttonsJson.difficultyLevels.map((d) => [d.name, { color: d.color, icon: d.icon }]));

const screenWidth = Dimensions.get("window").width;

export default function ProgressScreen() {
  const router = useRouter();
  const [expandedKeys, setExpandedKeys] = useState<string[]>([]);
  const [userScores, setUserScores] = useState<Record<string, number>>({});
  const [theme, setTheme] = useState("dark");

  useEffect(() => {
    const loadThemeAndScores = async () => {
      try {
        const storedTheme = await AsyncStorage.getItem("theme");
        if (storedTheme) setTheme(storedTheme);

        const storedScores = await AsyncStorage.getItem("score");
        if (storedScores) setUserScores(JSON.parse(storedScores));
      } catch (error) {
        console.error("Chyba při načítání dat:", error);
      }
    };

    loadThemeAndScores();
  }, []);

  const toggleExpand = (id: string) => {
    setExpandedKeys((prevKeys) =>
      prevKeys.includes(id) ? prevKeys.filter((key) => key !== id) : [...prevKeys, id]
    );
  };

  // 🔹 Funkce pro vykreslení hvězd (1-3 hvězdy)
  const renderStars = (score: number) => (
    <Text style={{ fontSize: 18, marginLeft: 10, color: "#FFD700" }}>
      {"★".repeat(score) + "☆".repeat(3 - score)}
    </Text>
  );

  // ✅ Převod `wordsData` do struktury Tree View
  const treeData = Object.entries(wordsData).map(([topic, difficulties]) => ({
    id: topic,
    name: topic,
    color: topicsMap[topic]?.color || "#6B7280",
    icon: topicsMap[topic]?.icon || "folder",  // Přidej ikonu
    children: Object.entries(difficulties).map(([difficulty, levels]) => ({
      id: `${topic}-${difficulty}`,
      name: difficulty,
      color: difficultyMap[difficulty]?.color || "#9CA3AF",
      icon: difficultyMap[difficulty]?.icon || "flag", // Přidej ikonu
      children: levels.map(({ word }, index) => ({
        id: `${topic}-${difficulty}-${word}`,
        name: word,
        stars: userScores[word] || 0,
        levelNumber: index + 1, // Správné pořadí úrovně
      })),
    })),
  }));

  // 🔹 Funkce pro vykreslení Tree View (témata → obtížnosti → úrovně)
  const renderTreeNode = (
    node: { id: string; name: string; levelNumber?: number; stars?: number; color?: string; icon?: string; children?: any[] }, 
    level = 0
  ) => {
    const isExpanded = expandedKeys.includes(node.id);
  
    return (
        <View key={node.id}>
          <TouchableOpacity
            onPress={() => node.children && toggleExpand(node.id)}
            className={`flex-row items-center rounded-lg my-2 
              ${level === 0 ? "py-4 px-6 text-xl w-full" : 
               level === 1 ? "py-3 px-5 text-lg max-w-[90%]" : 
                             "py-3 px-4 text-base max-w-[75%]"}
            `}
            style={{ 
              paddingLeft: level * 20, 
              backgroundColor: node.color || (theme === "dark" ? "#374151" : "#E5E7EB") 
            }} 
          >
            {/* Ikona šipky nebo indikátor */}
            {node.children ? (
              <Icon name={isExpanded ? "expand-more" : "chevron-right"} size={28} color="white" className="mr-2" />
            ) : (
              <Icon name="circle" size={8} color="white" className="mr-2" />
            )}
      
            {/* Ikona pro téma nebo obtížnost */}
            {node.icon && <Icon name={node.icon} size={level === 0 ? 28 : 24} color="white" className="mr-2" />}
      
            {/* Název tématu, obtížnosti nebo úrovně */}
            <Text className={`font-bold ${level === 0 ? "text-xl" : level === 1 ? "text-lg" : "text-base"} ${theme === "dark" ? "text-white" : "text-black"}`}>
              {node.levelNumber !== undefined
                ? `Úroveň ${node.levelNumber}${node.stars && node.stars > 0 ? ` – ${node.name}` : ""}`
                : node.name}
            </Text>
      
            {/* Pokud je to úroveň, přidej hvězdičky */}
            {node.stars !== undefined && renderStars(node.stars)}
          </TouchableOpacity>
      
          {/* Rekurzivní vykreslení podúrovní (děti) */}
          {isExpanded && node.children && node.children.map((child) => renderTreeNode(child, level + 1))}
        </View>
      );              
  };
  

  // ✅ Data pro koláčový graf – počet hvězd podle témat
  const graphData = Object.keys(wordsData)
  .map((topic) => {
    const totalStars = Object.values(wordsData[topic])
      .flat()
      .reduce((sum, level) => sum + (userScores[level.word] || 0), 0);
    return {
      name: topic,
      stars: totalStars,
      color: topicsMap[topic].color || "#6B7280", 
      legendFontColor: "#FFFFFF",
      legendFontSize: 14,
    };
  })
  .filter((data) => data.stars > 0);

  return (
    <SafeAreaView className={`flex-1 px-6 ${theme === "dark" ? "bg-gray-800" : "bg-white"}`}>
      <ScrollView className="flex-grow pb-5" showsVerticalScrollIndicator={false}>
        {/* 🔹 Tlačítko Zpět */}
        <TouchableOpacity
          onPress={() => router.push("/menu")}
          className={`flex-row items-center py-2 px-4 rounded-2xl mb-5 self-start ${
            theme === "dark" ? "bg-gray-700" : "bg-gray-300"
          }`}
        >
          <Icon name="arrow-back" size={24} color={theme === "dark" ? "white" : "black"} />
          <Text className={`text-lg font-bold ml-2 ${theme === "dark" ? "text-white" : "text-black"}`}>
            Zpět
          </Text>
        </TouchableOpacity>
  
        {/* 🔹 Nadpis */}
        <Text className={`text-2xl font-bold text-center mb-5 ${theme === "dark" ? "text-white" : "text-black"}`}>
          Herní postup
        </Text>
  
        {/* 🔹 Tree View */}
        {treeData.map((node) => renderTreeNode(node))}
  
        {/* 🔹 Koláčový graf */}
        {graphData.length > 0 && (
          <View
            className={`mt-7 p-3 rounded-xl shadow-md ${
              theme === "dark" ? "bg-gray-700" : "bg-white"
            }`}
          >
            <Text className={`text-xl font-bold mb-2 ${theme === "dark" ? "text-white" : "text-black"}`}>
              Počet hvězd podle témat
            </Text>
            <PieChart
              data={graphData}
              width={screenWidth - 40}
              height={220}
              chartConfig={{
                color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
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
