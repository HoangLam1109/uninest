import { Image } from "expo-image";
import { StyleSheet, View } from "react-native";

import { LOGIN_BANNER_IMAGE } from "@/constants/images";

export function AuthBanner() {
  return (
    <View style={styles.wrap}>
      <Image
        source={LOGIN_BANNER_IMAGE}
        style={styles.image}
        contentFit="contain"
        contentPosition="center"
        accessibilityLabel="Minh họa tìm phòng trọ UniNest"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    width: "100%",
    alignSelf: "center",
    aspectRatio: 4 / 3,
    borderRadius: 14,
    overflow: "hidden",
    marginBottom: 18,
    backgroundColor: "#F4E8DC",
  },
  image: {
    width: "100%",
    height: "100%",
  },
});
