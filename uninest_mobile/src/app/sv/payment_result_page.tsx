import { useLocalSearchParams, useRouter } from "expo-router";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";

import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { useAuth } from "@/context/auth-context";
import { getApiErrorMessage } from "@/lib/api-error";
import { verifyUpgradePayment } from "@/utils/verify-upgrade-payment";

export default function PaymentResultPage() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { updateUser } = useAuth();
  const params = useLocalSearchParams<{ result?: string; orderCode?: string }>();
  const result = params.result === "cancel" ? "cancel" : "success";
  const orderCode = params.orderCode ? String(params.orderCode) : "";
  const handledRef = useRef(false);

  const [state, setState] = useState<
    "loading" | "success" | "cancelled" | "pending" | "error"
  >("loading");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const verify = useCallback(async () => {
    if (!orderCode) {
      setState("error");
      setErrorMessage("Không tìm thấy mã giao dịch.");
      return;
    }
    if (handledRef.current) return;
    handledRef.current = true;

    const outcome = await verifyUpgradePayment(orderCode, result);
    if (outcome.status === "completed") {
      updateUser(outcome.user);
      setState("success");
      return;
    }
    if (outcome.status === "cancelled") {
      setState("cancelled");
      return;
    }
    if (outcome.status === "pending") {
      setState("pending");
      return;
    }
    setState("error");
    setErrorMessage(
      typeof outcome.message === "string"
        ? outcome.message
        : "Không thể xác minh giao dịch.",
    );
  }, [orderCode, result, updateUser]);

  useEffect(() => {
    void verify();
  }, [verify]);

  const title =
    state === "loading"
      ? "Đang xác minh thanh toán..."
      : state === "success"
        ? "Thanh toán thành công"
        : state === "cancelled"
          ? "Thanh toán đã hủy"
          : state === "pending"
            ? "Đang xử lý thanh toán"
            : "Xác minh thất bại";

  const description =
    state === "success"
      ? "Nâng cấp tài khoản thành công! Bạn có thể sử dụng đầy đủ tính năng ngay bây giờ."
      : state === "cancelled"
        ? "Giao dịch đã bị hủy. Bạn có thể thử lại khi sẵn sàng."
        : state === "pending"
          ? "Thanh toán đang được xác minh. Vui lòng kiểm tra lại sau vài phút."
          : errorMessage ?? "Không thể xác minh giao dịch.";

  return (
    <ThemedView style={styles.screen}>
      <SafeAreaView style={[styles.safeArea, { paddingBottom: insets.bottom }]}>
        <View style={styles.content}>
          {state === "loading" ? (
            <ActivityIndicator size="large" color="#F28C1B" />
          ) : (
            <Text style={styles.icon}>
              {state === "success"
                ? "✓"
                : state === "cancelled"
                  ? "✕"
                  : state === "pending"
                    ? "⏳"
                    : "!"}
            </Text>
          )}

          <ThemedText type="title" style={styles.title}>
            {title}
          </ThemedText>
          <ThemedText type="small" style={styles.description}>
            {description}
          </ThemedText>

          {orderCode ? (
            <ThemedText type="small" style={styles.orderCode}>
              Mã giao dịch: {orderCode}
            </ThemedText>
          ) : null}

          <View style={styles.actions}>
            {state === "pending" ? (
              <Pressable
                style={styles.primaryButton}
                onPress={() => {
                  handledRef.current = false;
                  setState("loading");
                  void verify();
                }}
              >
                <Text style={styles.primaryButtonText}>Thử lại</Text>
              </Pressable>
            ) : null}

            <Pressable
              style={[
                styles.primaryButton,
                state !== "pending" && styles.primaryButtonFull,
              ]}
              onPress={() =>
                router.replace(
                  state === "success"
                    ? ("/sv/profile_page" as any)
                    : ("/sv/upgrade_package_page" as any),
                )
              }
            >
              <Text style={styles.primaryButtonText}>
                {state === "success" ? "Về trang cá nhân" : "Quay lại gói nâng cấp"}
              </Text>
            </Pressable>

            <Pressable
              style={styles.secondaryButton}
              onPress={() => router.replace("/" as any)}
            >
              <Text style={styles.secondaryButtonText}>Về trang chủ</Text>
            </Pressable>
          </View>
        </View>
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: "#F5EFE6" },
  safeArea: { flex: 1 },
  content: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
  },
  icon: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: "#FFF4E8",
    color: "#F28C1B",
    fontSize: 36,
    fontWeight: "800",
    textAlign: "center",
    lineHeight: 72,
    marginBottom: 20,
    overflow: "hidden",
  },
  title: {
    color: "#2F261A",
    textAlign: "center",
    marginBottom: 10,
  },
  description: {
    color: "#6B5E4D",
    textAlign: "center",
    lineHeight: 22,
    marginBottom: 12,
  },
  orderCode: {
    color: "#8A7B68",
    marginBottom: 24,
  },
  actions: {
    width: "100%",
    gap: 10,
    marginTop: 8,
  },
  primaryButton: {
    backgroundColor: "#F28C1B",
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: "center",
  },
  primaryButtonFull: {
    width: "100%",
  },
  primaryButtonText: {
    color: "#FFFFFF",
    fontWeight: "800",
    fontSize: 15,
  },
  secondaryButton: {
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E8E1D8",
    backgroundColor: "#FFFFFF",
  },
  secondaryButtonText: {
    color: "#6B5E4D",
    fontWeight: "700",
    fontSize: 15,
  },
});
