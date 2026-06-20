import { useRouter } from "expo-router";
import { useRef, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";

import { aiApi } from "@/api/ai.api";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { useAuth } from "@/context/auth-context";
import { parseBudgetFromQuestion } from "@/hooks/use-chat-socket";
import { useTenantGate } from "@/hooks/use-tenant-gate";
import { getApiErrorMessage } from "@/lib/api-error";
import { isLandlordUser } from "@/utils/tenant-access";
import type { AiRoomMatch, AiRoomSuggestion } from "@/types/ai";
import { formatPrice } from "@/utils/room-display";

type ChatItem =
  | { id: string; role: "assistant"; text: string }
  | { id: string; role: "user"; text: string }
  | {
      id: string;
      role: "results";
      answer: string;
      rooms: (AiRoomSuggestion | AiRoomMatch)[];
      missingInfo: string[];
    };

export default function AiSearchPage() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { isAuthenticated, user } = useAuth();
  const { requireTenant, handleTenantApiError, TenantGatePrompt } = useTenantGate();
  const listRef = useRef<FlatList<ChatItem>>(null);
  const [items, setItems] = useState<ChatItem[]>([
    {
      id: "welcome",
      role: "assistant",
      text: "Xin chào! Mô tả phòng bạn cần (khu vực, giá, tiện ích...) và tôi sẽ gợi ý phòng phù hợp.",
    },
  ]);
  const [draft, setDraft] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    const question = draft.trim();
    if (!question || loading) return;

    if (!isAuthenticated) {
      router.push("/sv/login_page" as any);
      return;
    }

    if (isLandlordUser(user?.role)) {
      requireTenant("ai_search");
      return;
    }

    if (!requireTenant("ai_search")) return;

    setDraft("");
    setItems((current) => [
      ...current,
      { id: `user-${Date.now()}`, role: "user", text: question },
    ]);
    setLoading(true);

    try {
      const filters = parseBudgetFromQuestion(question);
      const res = await aiApi.searchRooms({ question, filters });
      const data = res.data;
      const rooms = [...(data.rooms ?? []), ...(data.matches ?? [])];
      setItems((current) => [
        ...current,
        {
          id: `result-${Date.now()}`,
          role: "results",
          answer: data.answer,
          rooms,
          missingInfo: data.missingInfo ?? [],
        },
      ]);
    } catch (err) {
      if (handleTenantApiError(err, "ai_search")) {
        setItems((current) => current.slice(0, -1));
      } else {
        setItems((current) => [
          ...current,
          {
            id: `err-${Date.now()}`,
            role: "assistant",
            text: getApiErrorMessage(err, "Không tìm được phòng."),
          },
        ]);
      }
    } finally {
      setLoading(false);
      requestAnimationFrame(() => {
        listRef.current?.scrollToEnd({ animated: true });
      });
    }
  };

  return (
    <ThemedView style={styles.screen}>
      <SafeAreaView style={styles.safeArea}>
        <View style={[styles.header, { paddingTop: insets.top }]}>
          <Pressable style={styles.iconButton} onPress={() => router.back()}>
            <Text style={styles.iconText}>←</Text>
          </Pressable>
          <ThemedText type="smallBold" style={styles.headerTitle}>
            AI tìm phòng
          </ThemedText>
          <View style={styles.iconButton} />
        </View>

        <FlatList
          ref={listRef}
          data={items}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ padding: 16, gap: 12, paddingBottom: 12 }}
          renderItem={({ item }) => {
            if (item.role === "user") {
              return (
                <View style={styles.userBubble}>
                  <ThemedText type="small" style={styles.userText}>
                    {item.text}
                  </ThemedText>
                </View>
              );
            }
            if (item.role === "assistant") {
              return (
                <View style={styles.assistantBubble}>
                  <ThemedText type="small" style={styles.assistantText}>
                    {item.text}
                  </ThemedText>
                </View>
              );
            }
            return (
              <View style={styles.resultsCard}>
                <ThemedText type="small" style={styles.assistantText}>
                  {item.answer}
                </ThemedText>
                {item.missingInfo.length > 0 ? (
                  <ThemedText type="small" style={styles.missingText}>
                    Cần thêm: {item.missingInfo.join(", ")}
                  </ThemedText>
                ) : null}
                {item.rooms.map((room, index) => {
                  const roomId =
                    "roomId" in room && room.roomId
                      ? room.roomId
                      : "_id" in room
                        ? String(room._id)
                        : `room-${index}`;
                  const title = room.title ?? "Phòng";
                  const price = room.pricePerMonth ?? 0;
                  return (
                    <Pressable
                      key={`${roomId}-${index}`}
                      style={styles.roomCard}
                      onPress={() =>
                        router.push({
                          pathname: "/sv/detail_page",
                          params: { id: roomId },
                        } as any)
                      }
                    >
                      <ThemedText type="smallBold" style={styles.roomTitle}>
                        {title}
                      </ThemedText>
                      <ThemedText type="small" style={styles.roomPrice}>
                        {formatPrice(price)}/tháng
                      </ThemedText>
                    </Pressable>
                  );
                })}
              </View>
            );
          }}
        />

        {loading ? (
          <ActivityIndicator color="#F28C1B" style={{ marginBottom: 8 }} />
        ) : null}

        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : undefined}
        >
          <View
            style={[
              styles.composer,
              { paddingBottom: Math.max(insets.bottom, 12) },
            ]}
          >
            <TextInput
              value={draft}
              onChangeText={setDraft}
              placeholder="VD: Phòng gần ĐH Bách Khoa, 4 triệu..."
              placeholderTextColor="#A89888"
              style={styles.input}
              multiline
            />
            <Pressable style={styles.sendButton} onPress={() => void handleSubmit()}>
              <Text style={styles.sendText}>Tìm</Text>
            </Pressable>
          </View>
        </KeyboardAvoidingView>
        <TenantGatePrompt />
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: "#F5EFE6" },
  safeArea: { flex: 1 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  iconButton: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  iconText: { fontSize: 22, color: "#3D3428" },
  headerTitle: { fontSize: 18, color: "#2F261A", fontWeight: "700" },
  userBubble: {
    alignSelf: "flex-end",
    backgroundColor: "#F28C1B",
    borderRadius: 16,
    padding: 12,
    maxWidth: "85%",
  },
  userText: { color: "#FFFFFF" },
  assistantBubble: {
    alignSelf: "flex-start",
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 12,
    maxWidth: "90%",
    borderWidth: 1,
    borderColor: "#E8E1D8",
  },
  assistantText: { color: "#2F261A", lineHeight: 20 },
  resultsCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 14,
    gap: 10,
    borderWidth: 1,
    borderColor: "#E8E1D8",
  },
  missingText: { color: "#C47A10" },
  roomCard: {
    backgroundColor: "#FAF7F2",
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: "#E8E1D8",
  },
  roomTitle: { color: "#2F261A" },
  roomPrice: { color: "#F28C1B", marginTop: 4 },
  composer: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 8,
    paddingHorizontal: 12,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: "#E8E1D8",
    backgroundColor: "#FFFFFF",
  },
  input: {
    flex: 1,
    minHeight: 44,
    maxHeight: 120,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E8E1D8",
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: "#2F261A",
    backgroundColor: "#FAF7F2",
  },
  sendButton: {
    backgroundColor: "#F28C1B",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  sendText: { color: "#FFFFFF", fontWeight: "700" },
});
