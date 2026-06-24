import { useRouter } from "expo-router";
import { useCallback } from "react";
import { Alert } from "react-native";

import { useAuth } from "@/context/auth-context";

const LOGIN_ROUTE = "/sv/login_page";

export function useLogout() {
  const router = useRouter();
  const { signOut } = useAuth();

  const logout = useCallback(() => {
    Alert.alert("Đăng xuất", "Bạn có chắc muốn đăng xuất?", [
      { text: "Hủy", style: "cancel" },
      {
        text: "Đăng xuất",
        style: "destructive",
        onPress: () => {
          signOut();
          Alert.alert(
            "Đăng xuất thành công",
            "Tài khoản đã đăng xuất.",
            [
              {
                text: "Quay lại trang đăng nhập",
                onPress: () => router.replace(LOGIN_ROUTE as never),
              },
            ],
            { cancelable: false },
          );
        },
      },
    ]);
  }, [router, signOut]);

  return logout;
}
