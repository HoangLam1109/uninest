import { useState } from "react";
import { Image, StyleSheet } from "react-native";
import Animated, { Easing, Keyframe } from "react-native-reanimated";
import { scheduleOnRN } from "react-native-worklets";

import { APP_LOGO } from "@/constants/branding";

const DURATION = 700;

export function AnimatedSplashOverlay() {
  const [visible, setVisible] = useState(true);

  if (!visible) return null;

  const splashKeyframe = new Keyframe({
    0: {
      opacity: 1,
      transform: [{ scale: 1 }],
    },
    70: {
      opacity: 1,
    },
    100: {
      opacity: 0,
      transform: [{ scale: 1.02 }],
      easing: Easing.out(Easing.cubic),
    },
  });

  const logoKeyframe = new Keyframe({
    0: {
      opacity: 0,
      transform: [{ scale: 0.88 }],
    },
    100: {
      opacity: 1,
      transform: [{ scale: 1 }],
      easing: Easing.out(Easing.cubic),
    },
  });

  return (
    <Animated.View
      entering={splashKeyframe.duration(DURATION).withCallback((finished) => {
        "worklet";
        if (finished) {
          scheduleOnRN(setVisible, false);
        }
      })}
      pointerEvents="none"
      style={styles.overlay}
    >
      <Animated.View entering={logoKeyframe.duration(DURATION * 0.7)}>
        <Image source={APP_LOGO} style={styles.logo} resizeMode="contain" />
      </Animated.View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "#FFFFFF",
    zIndex: 1000,
    alignItems: "center",
    justifyContent: "center",
  },
  logo: {
    width: 120,
    height: 120,
  },
});
