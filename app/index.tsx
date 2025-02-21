import { useRouter } from "expo-router";
import { View, Text, TouchableOpacity } from "react-native";
import Icon from "react-native-vector-icons/MaterialIcons";

export default function Index() {
  const router = useRouter();

  return (
    <View className="flex-1 bg-gray-800 px-6 items-center justify-center">
      <View className="w-full max-w-[400px] items-center">
        <View className="border-4 border-gray-600 rounded-xl px-10 py-6 mb-10 shadow-lg shadow-black w-full flex-row justify-center items-center">
          <Icon name="sports-esports" size={50} color="white" style={{ marginRight: 10 }} />
          <Text
            style={{
              fontSize: 44,
              fontWeight: "bold",
              color: "white",
              textTransform: "uppercase",
              letterSpacing: 3,
              textAlign: "center",
            }}
          >
            ŠIBENICE
          </Text>
        </View>

        <View className="bg-gray-700 px-6 py-4 rounded-lg shadow-md mb-10 w-full flex-row items-center justify-center">
          <Text className="text-gray-300 text-xl text-center">
            Uhádni správné slovo dřív, než bude pozdě!
          </Text>
        </View>

        <TouchableOpacity
          onPress={() => router.push("/menu")}
          className="bg-green-600 px-6 py-4 rounded-xl shadow-lg shadow-black mb-6 w-full flex-row justify-center items-center active:bg-green-800"
        >
          <Icon name="play-arrow" size={28} color="white" />
          <Text className="text-white text-xl font-semibold uppercase tracking-wider text-center ml-2">
            Začít hru
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => router.push("/settings")}
          className="bg-blue-600 px-6 py-4 rounded-xl shadow-lg shadow-black mb-6 w-full flex-row justify-center items-center active:bg-blue-800"
        >
          <Icon name="settings" size={28} color="white" />
          <Text className="text-white text-xl font-semibold uppercase tracking-wider text-center ml-2">
            Nastavení
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          className="bg-red-600 px-6 py-4 rounded-xl shadow-lg shadow-black mb-6 w-full flex-row justify-center items-center active:bg-red-800"
        >
          <Icon name="exit-to-app" size={28} color="white" />
          <Text className="text-white text-xl font-semibold uppercase tracking-wider text-center ml-2">
            Ukončit hru
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
