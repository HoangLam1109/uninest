import {
  Image,
  ImageStyle,
  StyleProp,
  StyleSheet,
  View,
  ViewStyle,
} from "react-native";

import { APP_LOGO } from "@/constants/branding";

type AppLogoProps = {
  size?: number;
  style?: StyleProp<ViewStyle>;
  imageStyle?: StyleProp<ImageStyle>;
  withBackground?: boolean;
};

export function AppLogo({
  size = 48,
  style,
  imageStyle,
  withBackground = true,
}: AppLogoProps) {
  const imageSize = Math.round(size * 0.92);

  return (
    <View
      style={[
        withBackground && styles.background,
        {
          width: size,
          height: size,
          borderRadius: Math.round(size * 0.22),
        },
        style,
      ]}
    >
      <Image
        source={APP_LOGO}
        style={[
          styles.image,
          { width: imageSize, height: imageSize },
          imageStyle,
        ]}
        resizeMode="contain"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  background: {
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  image: {
    resizeMode: "contain",
  },
});
