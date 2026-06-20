import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";

import { chatApi } from "@/api/chat.api";
import { LandlordBottomNavigation } from "@/components/landlord/bottom-navigation";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { useAuth } from "@/context/auth-context";
import {
  formatChatTime,
  getChatParticipantName,
} from "@/hooks/use-chat-socket";
import type { ChatConversation } from "@/types/chat";

function getConversationTitle(
  conversation: ChatConversation,
  myUserId?: string,
) {
  const tenantName = getChatParticipantName(conversation.tenantId);
  const isLandlord =
    myUserId && String(conversation.landlordId._id) === String(myUserId);
  const peerName = isLandlord
    ? tenantName
    : getChatParticipantName(conversation.landlordId);
  const roomTitle = conversation.roomId?.title ?? "Phòng";
  return `${peerName} • ${roomTitle}`;
}

export default function LandlordMessagesPage() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { user } = useAuth();
  const [conversations, setConversations] = useState<ChatConversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadConversations = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    try {
      const res = await chatApi.conversations();
      setConversations(res.data ?? []);
    } catch {
      setConversations([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      void loadConversations();
    }, [loadConversations]),
  );

  return (
    <ThemedView style={styles.screen}>
      <SafeAreaView style={styles.safeArea}>
        <View style={[styles.header, { paddingTop: insets.top > 0 ? 0 : 8 }]}>
          <Pressable onPress={() => router.back()} style={styles.backBtn}>
            <Text style={styles.backText}>←</Text>
          </Pressable>
          <ThemedText type="smallBold" style={styles.headerTitle}>
            Tin nhắn
          </ThemedText>
          <View style={styles.backBtn} />
        </View>

        <ScrollView
          contentContainerStyle={{
            padding: 16,
            paddingBottom: 120 + insets.bottom,
          }}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => void loadConversations(true)}
              tintColor="#E68A2E"
            />
          }
        >
          {loading ? (
            <ActivityIndicator color="#E68A2E" style={{ marginTop: 24 }} />
          ) : conversations.length === 0 ? (
            <View style={styles.emptyCard}>
              <ThemedText type="small" style={styles.emptyText}>
                Chưa có cuộc trò chuyện nào. Người thuê sẽ liên hệ từ trang chi tiết phòng.
              </ThemedText>
            </View>
          ) : (
            conversations.map((conversation) => {
              const title = getConversationTitle(conversation, user?.id);
              return (
                <Pressable
                  key={conversation._id}
                  style={styles.card}
                  onPress={() =>
                    router.push({
                      pathname: "/landlord/chat_thread_page",
                      params: {
                        conversationId: conversation._id,
                        title,
                      },
                    } as any)
                  }
                >
                  <View style={styles.cardTop}>
                    <ThemedText type="smallBold" style={styles.cardTitle}>
                      {title}
                    </ThemedText>
                    <ThemedText type="small" style={styles.cardTime}>
                      {formatChatTime(
                        conversation.lastMessageAt ?? conversation.updatedAt,
                      )}
                    </ThemedText>
                  </View>
                  <ThemedText type="small" style={styles.cardPreview} numberOfLines={2}>
                    {conversation.lastMessage ?? "Chưa có tin nhắn"}
                  </ThemedText>
                </Pressable>
              );
            })
          )}
        </ScrollView>

        <LandlordBottomNavigation activeTab="settings" />
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: "#F7F6F2" },
  safeArea: { flex: 1 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  backBtn: { width: 40, height: 40, alignItems: "center", justifyContent: "center" },
  backText: { fontSize: 22, color: "#1F2940" },
  headerTitle: { fontSize: 20, color: "#1F2940" },
  emptyCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    padding: 20,
    borderWidth: 1,
    borderColor: "#EDE8DF",
  },
  emptyText: { color: "#9AA3B2", lineHeight: 20 },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#EDE8DF",
  },
  cardTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
    marginBottom: 6,
  },
  cardTitle: { flex: 1, color: "#1F2940" },
  cardTime: { color: "#9AA3B2" },
  cardPreview: { color: "#6B7280", lineHeight: 18 },
});
