import { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  Dimensions,
  Animated,
  Modal,
  Vibration,
  TouchableOpacity,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter, useLocalSearchParams } from "expo-router";
import ConfettiCannon from "react-native-confetti-cannon";
import Icon from "react-native-vector-icons/MaterialIcons";

// Import JSON s daty slov
import wordsJson from "./words.json";
const wordsData = wordsJson as Record<
  string,
  Record<string, { word: string; hint: string }[]>
>;

// Pomocná funkce pro výpočet skóre na základě počtu chyb
function calculateScore(wrongCount: number): number {
  if (wrongCount === 0) return 3;
  if (wrongCount <= 2) return 2;
  if (wrongCount <= 4) return 1;
  return 0;
}

export default function GameScreen() {
  const router = useRouter();
  const { topic, difficulty, level } = useLocalSearchParams();
  const screenWidth = Dimensions.get("window").width;

  // Stavové proměnné
  const [targetWord, setTargetWord] = useState<string>("REACT");
  const [wordHint, setWordHint] = useState<string>("");
  const [isHintVisible, setIsHintVisible] = useState<boolean>(true);
  const [guessedLetters, setGuessedLetters] = useState<string[]>([]);
  const [wrongGuesses, setWrongGuesses] = useState<string[]>([]);
  const [isGameOver, setIsGameOver] = useState(false);
  const [isWinner, setIsWinner] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);

  // Nastavení
  const [vibrationEnabled, setVibrationEnabled] = useState<boolean>(true);
  const [limitAttemptsEnabled, setLimitAttemptsEnabled] = useState(true);
  const [timeLimit, setTimeLimit] = useState<number | null>(null);
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const [theme, setTheme] = useState("dark");
  const poleColor = theme === "dark" ? "bg-white" : "bg-black";

  const opacityAnim = useRef(new Animated.Value(0)).current; // Začínáme na 0 (neviditelné)
  const scaleAnim = useRef(new Animated.Value(0.8)).current; // Začínáme s menší velikostí
  const [isAnimating, setIsAnimating] = useState(false);

  // Skóre
  const [scoreData, setScoreData] = useState<Record<string, number>>({});
  const possibleWrongGuesses = 11;

  // Animace (pop-up pro výhru/prohru)
  const translateYAnim = useRef(new Animated.Value(300)).current;

  // -------------------------------------------------
  // ============   Funkce pro ukládání skóre  =======
  // -------------------------------------------------
  const loadScores = async () => {
    try {
      const savedScores = await AsyncStorage.getItem("score");
      if (savedScores) {
        setScoreData(JSON.parse(savedScores));
      }
    } catch (error) {
      console.error("Chyba při načítání skóre:", error);
    }
  };

  const saveScore = async (word: string, newScore: number) => {
    try {
      const oldScore = scoreData[word] ?? 0;
      const betterScore = Math.max(oldScore, newScore);
      const updatedScoreData = { ...scoreData, [word]: betterScore };

      await AsyncStorage.setItem("score", JSON.stringify(updatedScoreData));
      setScoreData(updatedScoreData);
    } catch (error) {
      console.error("Chyba při ukládání skóre:", error);
    }
  };

  // -------------------------------------------------
  // ============   Načtení a příprava hry   =========
  // -------------------------------------------------
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

    // Načti všechna nastavení a skóre
    (async () => {
      try {
        // 1) Skóre
        await loadScores();

        // 2) Časový limit
        const storedTimeLimit = await AsyncStorage.getItem("timeLimit");
        if (storedTimeLimit) {
          const limit = parseInt(storedTimeLimit, 10);
          if (!isNaN(limit)) {
            setTimeLimit(limit);
            setTimeLeft(limit);
          }
        }

        // 3) Limit pokusů
        const savedLimitAttempts = await AsyncStorage.getItem("limitAttempts");
        if (savedLimitAttempts !== null) {
          setLimitAttemptsEnabled(savedLimitAttempts === "true");
        }

        // 4) Vibrace
        const savedSetting = await AsyncStorage.getItem("vibrationEnabled");
        if (savedSetting !== null) {
          setVibrationEnabled(savedSetting === "true");
        }

        // 5) Nastav slovo z JSONu
        const safeTopic = Array.isArray(topic) ? topic[0] : topic;
        const safeDifficulty = Array.isArray(difficulty) ? difficulty[0] : difficulty;
        const safeLevel = Number(level) - 1;

        if (
          safeTopic &&
          safeDifficulty &&
          wordsData[safeTopic] &&
          wordsData[safeTopic][safeDifficulty]
        ) {
          const possibleWords = wordsData[safeTopic][safeDifficulty];
          if (safeLevel >= 0 && safeLevel < possibleWords.length) {
            const selectedWordData = possibleWords[safeLevel];
            setTargetWord(selectedWordData.word);
            setWordHint(selectedWordData.hint);
          } else {
            console.warn("Neplatný level, nemá přiřazené slovo.");
          }
        }
      } catch (error) {
        console.error("Chyba při nastavování hry:", error);
      }
    })();
  }, [topic, difficulty, level]);

  // -------------------------------------------------
  // ============   Odpočet času   ===================
  // -------------------------------------------------
  useEffect(() => {
    if (timeLeft === null || isGameOver || isWinner) return;

    if (timeLeft > 0) {
      const timer = setInterval(() => {
        setTimeLeft((prevTime) => (prevTime !== null ? prevTime - 1 : null));
      }, 1000);

      return () => clearInterval(timer);
    }

    // Pokud čas dojde (timeLeft === 0)
    if (timeLeft === 0) {
      setIsGameOver(true);
    }
  }, [timeLeft, isGameOver, isWinner]);

  // -------------------------------------------------
  // ============   Efekt po dohrání   ===============
  // -------------------------------------------------
  useEffect(() => {
    // Pokud nastane konec hry (výhra/prohra), spustí se animace
    if (isGameOver || isWinner) {
      Animated.timing(translateYAnim, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }).start();

      // Zjisti finální skóre (pouze pokud je to skutečně konec)
      let finalScore = 0;

      if (isWinner) {
        // Pokud hráč vyhrál, spočítáme skóre podle počtu špatných pokusů
        finalScore = calculateScore(wrongGuesses.length);
        // Navigace na obrazovku výhry
        router.push({
          pathname: "/(game)/win",
          params: {
            word: targetWord,
            wrongCount: wrongGuesses.length,
            difficulty,
            topic,
            level,
          },
        });
      } else {
        // Pokud prohrál (pokud došel čas nebo pokusy), skóre bude 0
        finalScore = 0;
      }

      // Uložíme finální skóre
      saveScore(targetWord, finalScore);
    }
  }, [isGameOver, isWinner]);

  // -------------------------------------------------
  // ============   Ovládání navigace   ==============
  // -------------------------------------------------
  const goToLevelSelect = () => {
    // Reset stavů hry
    setIsGameOver(false);
    setIsWinner(false);
    setShowConfetti(false);
    // Zpět na výběr úrovní
    router.push({ pathname: "/levels", params: { topic, difficulty } });
  };

  const restartGame = () => {
    setIsGameOver(false);
    setIsWinner(false);
    setShowConfetti(false);
    setGuessedLetters([]);
    setWrongGuesses([]);
    setIsHintVisible(true);

    // Pokud máme časový limit, resetuj zbývající čas
    if (timeLimit !== null) {
      setTimeLeft(timeLimit);
    }
  };

  // -------------------------------------------------
  // ============   Logika hádání písmen  ============
  // -------------------------------------------------
  const alphabet = "AÁBCČDĎEÉĚFGHIÍJKLMNŇOÓPQRŘSŠTŤUÚŮVWXYÝZŽ".split("");

  const handleGuess = (letter: string) => {
    if (targetWord.includes(letter)) {
      const updatedGuessedLetters = [...guessedLetters, letter];
      setGuessedLetters(updatedGuessedLetters);

      // Kontrola, zda jsme uhodli všechna písmena
      const allLettersGuessed = targetWord
        .split("")
        .every((char) => updatedGuessedLetters.includes(char));

      if (allLettersGuessed) {
        setIsWinner(true);
        setShowConfetti(true);
      }
    } else {
      if (vibrationEnabled) {
        Vibration.vibrate(100);
      }

      const newWrongGuesses = [...wrongGuesses, letter];
      setWrongGuesses(newWrongGuesses);

      // Šest špatných pokusů -> prohra
      if (newWrongGuesses.length >= possibleWrongGuesses && limitAttemptsEnabled) {
        setIsGameOver(true);
      }
    }
  };

  // -------------------------------------------------
  // ============   Zobrazení slova   ================
  // -------------------------------------------------
  const displayedWord = targetWord
    .split("")
    .map((letter) => (guessedLetters.includes(letter) ? letter : "_"))
    .join(" ");

    useEffect(() => {
      if (isHintVisible) {
        // Otevření: Spustíme animaci a zobrazíme Modal
        setIsAnimating(true);
        Animated.parallel([
          Animated.timing(opacityAnim, {
            toValue: 1,
            duration: 300,
            useNativeDriver: true,
          }),
          Animated.timing(scaleAnim, {
            toValue: 1,
            duration: 300,
            useNativeDriver: true,
          }),
        ]).start();
      } else {
        // Zavření: Spustíme animaci a po jejím dokončení skryjeme Modal
        Animated.parallel([
          Animated.timing(opacityAnim, {
            toValue: 0,
            duration: 300,
            useNativeDriver: true,
          }),
          Animated.timing(scaleAnim, {
            toValue: 0.8,
            duration: 300,
            useNativeDriver: true,
          }),
        ]).start(() => {
          // Po dokončení animace skryjeme Modal
          setIsAnimating(false);
        });
      }
    }, [isHintVisible]);

  // -------------------------------------------------
  // ============   Render   =========================
  // -------------------------------------------------
  return (
    <SafeAreaView className={`flex-1 px-6 items-center justify-center ${theme === "dark" ? "bg-gray-800" : "bg-white"}`}> 
    
      {/* MODÁLNÍ OKNO S NÁPOVĚDOU */}
      <Modal visible={isHintVisible || isAnimating} transparent={true} animationType="none">
        <View className="flex-1 justify-center items-center bg-black/70">
          <Animated.View
            className={`p-6 rounded-lg w-4/5 items-center ${theme === "dark" ? "bg-gray-800" : "bg-white"}`}
            style={{
              opacity: opacityAnim,
              transform: [{ scale: scaleAnim }],
            }}
          >
            <Icon name="help-outline" size={60} color="#FACC15" className="mb-4" />
            <Text className={`text-lg mb-6 text-center ${theme === "dark" ? "text-gray-300" : "text-gray-700"}`}>
              {wordHint}
            </Text>
            <TouchableOpacity
              className="bg-blue-600 px-4 py-2 rounded-lg flex-row items-center"
              onPress={() => setIsHintVisible(false)}
            >
              <Text className="text-white text-lg font-semibold text-center ml-2">Rozumím</Text>
            </TouchableOpacity>
          </Animated.View>
        </View>
      </Modal>

      {/* TLAČÍTKO ZPĚT */}
      <TouchableOpacity
        onPress={goToLevelSelect}
        className={`absolute top-14 left-5 px-4 py-2 rounded-full z-50 flex-row items-center ${
          theme === "dark" ? "bg-gray-700" : "bg-gray-300"
        }`}
      >
        <Icon name="arrow-back" size={24} color={theme === "dark" ? "white" : "black"} />
        <Text className={`text-lg font-semibold ml-2 ${theme === "dark" ? "text-white" : "text-black"}`}>Zpět</Text>
      </TouchableOpacity>

      {/* TLAČÍTKO PRO NÁPOVĚDU K HLEDANÉMU SLOVU */}
      <TouchableOpacity
        onPress={() => setIsHintVisible(true)}
        className="absolute top-14 right-5 bg-yellow-500 px-4 py-2 rounded-full z-50 flex-row items-center"
      >
        <Icon name="help-outline" size={24} color={theme === "dark" ? "black" : "white"} />
        <Text className={`text-lg font-semibold ml-2 ${theme === "dark" ? "text-black" : "text-white"}`}>
          Poradit
        </Text>
      </TouchableOpacity>

      <View className="w-full max-w-[400px] items-center top-8">
        <Text className={`text-3xl font-bold mb-4 ${theme === "dark" ? "text-white" : "text-black"}`}>{topic}</Text>
        <Text className={`text-lg mb-2 ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}>Obtížnost: {difficulty}</Text>

        {/* ZOBRAZENÍ ŠIBENICE NEBO ČASU */}
        {limitAttemptsEnabled && timeLimit === null ? (
          <View className={`w-full h-48 rounded-lg mb-10 items-center justify-center relative top-3 ${theme === "dark" ? "bg-gray-900" : "bg-gray-300"}`}>           
              {/* Základna */}
              {wrongGuesses.length > 0 && (
                <View className={`w-32 h-1 ${poleColor} absolute bottom-2 left-1/2 -translate-x-1/2`} />
              )}
              {/* Svislý sloup */}
              {wrongGuesses.length > 1 && (
                <View className={`w-1 h-40 ${poleColor} absolute bottom-2 left-1/3`} />
              )}
              {/* Horní trám */}
              {wrongGuesses.length > 2 && (
                <View className={`w-1/4 h-1 ${poleColor} absolute top-6 left-1/3`} />
              )}
              {/* Provaz */}
              {wrongGuesses.length > 3 && (
                <View className={`w-1 h-1/4 ${poleColor} absolute top-6 left-52`} />
              )}
              {/* Hlava */}
              {wrongGuesses.length > 4 && (
                <View className={`w-6 h-6 ${poleColor} rounded-full absolute top-1/3 left-1/2`} />
              )}
              {/* Tělo */}
              {wrongGuesses.length > 5 && (
                <View className={`w-1 h-14 ${poleColor} absolute top-22 left-52`} />
              )}
              {/* Levá ruka */}
              {wrongGuesses.length > 6 && (
                <View className={`w-5 h-1 ${poleColor} absolute top-24 left-52 rotate-45`} />
              )}
              {/* Pravá ruka */}
              {wrongGuesses.length > 7 && (
                <View className={`w-5 h-1 ${poleColor} absolute top-24 left-48 -rotate-45`} />
              )}
              {/* Levá noha */}
              {wrongGuesses.length > 8 && (
                <View className={`w-5 h-1 ${poleColor} absolute top-32 left-52 rotate-45`} />
              )}
              {/* Pravá noha */}
              {wrongGuesses.length > 9 && (
                <View className={`w-5 h-1 ${poleColor} absolute top-32 left-48 -rotate-45`} />
              )}
          </View>

        ) : (
          <View className={`w-full h-48 rounded-lg mb-10 items-center justify-center relative top-3 ${theme === "dark" ? "bg-gray-900" : "bg-gray-300"}`}> 
            {timeLimit !== null ? (
              <Text className="text-red-500 text-9xl font-bold mt-5">{timeLeft}</Text>
            ) : (
              <Text className={`text-9xl font-bold mt-5 ${theme === "dark" ? "text-white" : "text-black"}`}>
                {wrongGuesses.length}
              </Text>

            )}
          </View>
        )}

        <Text className={`text-4xl font-bold tracking-widest mb-6 ${theme === "dark" ? "text-white" : "text-black"}`}>
          {displayedWord}
        </Text>

      {/* ABECEDA */}
      {!isGameOver && !isWinner && (
        <View className="flex-wrap flex-row justify-center mb-4">
          {alphabet.map((letter) => {
            const isGuessed = guessedLetters.includes(letter);
            const isWrong = wrongGuesses.includes(letter);
            const isDisabled = isGuessed || isWrong;
        
            return (
              <TouchableOpacity
                key={letter}
                onPress={() => handleGuess(letter)}
                disabled={isDisabled}
                className="px-4 py-3 m-1 rounded-lg"
                style={{
                  flexBasis: "12%",
                  height: 50,
                  backgroundColor: isGuessed
                    ? "#22C55E" // Správná odpověď - zelená
                    : isWrong
                    ? "#DC2626" // Špatná odpověď - červená
                    : theme === "dark"
                    ? "#374151" // Tmavý režim - šedá
                    : "#D1D5DB", // Světlý režim - světlá šedá
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Text
                  className="text-lg font-bold"
                  style={{
                    color: isGuessed || isWrong ? "white" : theme === "dark" ? "white" : "black",
                  }}
                >
                  {letter}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>        
        )}
      </View>

      {/* KONFETY */}
      {showConfetti && (
        <ConfettiCannon count={200} origin={{ x: screenWidth / 2, y: 0 }} />
      )}

      {/* MODÁLNÍ OKNO - VÝHRA */}
      <Modal visible={isWinner} animationType="fade" transparent={true}>
        <View className="flex-1 justify-center items-center bg-black/70">
          <View className={`p-6 rounded-lg w-4/5 ${theme === "dark" ? "bg-gray-800" : "bg-white"}`}>
            <Text className="text-green-600 text-2xl font-bold mb-4 text-center">🎉 Gratulace!</Text>
            <Text className={`text-lg mb-6 text-center ${theme === "dark" ? "text-gray-300" : "text-gray-700"}`}>
              Vyhrál jsi! Slovo bylo "{targetWord}".
            </Text>
            <TouchableOpacity className="bg-blue-600 px-4 py-2 rounded-lg mb-2" onPress={restartGame}>
              <Text className="text-white text-lg font-semibold text-center">Hrát znovu</Text>
            </TouchableOpacity>
            <TouchableOpacity className="bg-gray-600 px-4 py-2 rounded-lg" onPress={goToLevelSelect}>
              <Text className="text-white text-lg font-semibold text-center">Zpět do menu</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* MODÁLNÍ OKNO - PROHRA */}
      <Modal visible={isGameOver} animationType="fade" transparent={true}>
        <View className="flex-1 justify-center items-center bg-black/70">
          <View className={`p-6 rounded-lg w-4/5 ${theme === "dark" ? "bg-gray-800" : "bg-white"}`}>
            <Text className="text-red-600 text-2xl font-bold mb-4 text-center">❌ Prohra!</Text>
            <Text className={`text-lg mb-6 text-center ${theme === "dark" ? "text-gray-300" : "text-gray-700"}`}>
              Prohrál jsi! Zkus to znovu.
            </Text>
            <TouchableOpacity className="bg-yellow-600 px-4 py-2 rounded-lg mb-2" onPress={restartGame}>
              <Text className="text-white text-lg font-semibold text-center">Zkusit znovu</Text>
            </TouchableOpacity>
            <TouchableOpacity className="bg-gray-600 px-4 py-2 rounded-lg" onPress={goToLevelSelect}>
              <Text className="text-white text-lg font-semibold text-center">Zpět do menu</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}
