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
import { BottomNavigation } from "@/components/bottom-navigation";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import {
  formatChatTime,
  getChatParticipantName,
} from "@/hooks/use-chat-socket";
import { useAuth } from "@/context/auth-context";
import { useTenantGate } from "@/hooks/use-tenant-gate";
import type { ChatConversation } from "@/types/chat";

function getConversationTitle(
  conversation: ChatConversation,
  myUserId?: string,
) {
  const landlordName = getChatParticipantName(conversation.landlordId);
  const tenantName = getChatParticipantName(conversation.tenantId);
  const isLandlord =
    myUserId && String(conversation.landlordId._id) === String(myUserId);
  const peerName = isLandlord ? tenantName : landlordName;
  const roomTitle = conversation.roomId?.title ?? "Phòng";
  return `${peerName} • ${roomTitle}`;
}

export default function MessagesPage() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { isAuthenticated, user } = useAuth();
  const { isGuest, requireTenant, TenantGatePrompt } = useTenantGate();
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
      if (!isAuthenticated) {
        router.replace("/sv/login_page" as any);
        return;
      }
      void loadConversations();
    }, [isAuthenticated, loadConversations, router]),
  );

  if (!isAuthenticated) return null;

  return (
    <ThemedView style={styles.screen}>
      <SafeAreaView style={styles.safeArea}>
        <View style={[styles.header, { paddingTop: insets.top }]}>
          <ThemedText type="smallBold" style={styles.headerTitle}>
            Tin nhắn
          </ThemedText>
        </View>

        <ScrollView
          contentContainerStyle={{
            padding: 16,
            paddingBottom: 100 + insets.bottom,
          }}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => void loadConversations(true)}
              tintColor="#F28C1B"
            />
          }
        >
          {loading ? (
            <ActivityIndicator color="#F28C1B" style={{ marginTop: 24 }} />
          ) : conversations.length === 0 ? (
            isGuest ? (
              <View style={styles.upgradeCard}>
                <Text style={styles.upgradeIcon}>💬</Text>
                <ThemedText type="smallBold" style={styles.upgradeTitle}>
                  Nâng cấp để nhắn tin
                </ThemedText>
                <ThemedText type="small" style={styles.upgradeText}>
                  Gói Người thuê giúp bạn chat trực tiếp với chủ nhà ngay trong
                  ứng dụng.
                </ThemedText>
                <Pressable
                  style={styles.upgradeButton}
                  onPress={() => requireTenant("messages")}
                >
                  <Text style={styles.upgradeButtonText}>Nâng cấp gói</Text>
                </Pressable>
              </View>
            ) : (
              <View style={styles.emptyCard}>
                <ThemedText type="smallBold" style={styles.emptyTitle}>
                  Chưa có cuộc trò chuyện
                </ThemedText>
                <ThemedText type="small" style={styles.emptyText}>
                  Liên hệ chủ nhà từ trang chi tiết phòng để bắt đầu chat.
                </ThemedText>
              </View>
            )
          ) : (
            conversations.map((conversation) => {
              const title = getConversationTitle(conversation, user?.id);
              return (
                <Pressable
                  key={conversation._id}
                  style={styles.card}
                  onPress={() =>
                    router.push({
                      pathname: "/sv/chat_thread_page",
                      params: {
                        conversationId: conversation._id,
                        title,
                      },
                    } as any)
                  }
                >
                  <View style={styles.avatar}>
                    <Text style={styles.avatarText}>💬</Text>
                  </View>
                  <View style={styles.cardBody}>
                    <ThemedText type="smallBold" style={styles.cardTitle}>
                      {title}
                    </ThemedText>
                    <ThemedText
                      type="small"
                      style={styles.cardPreview}
                      numberOfLines={1}
                    >
                      {conversation.lastMessage ?? "Chưa có tin nhắn"}
                    </ThemedText>
                  </View>
                  <ThemedText type="small" style={styles.cardTime}>
                    {formatChatTime(conversation.lastMessageAt)}
                  </ThemedText>
                </Pressable>
              );
            })
          )}
        </ScrollView>

        <BottomNavigation activeTab="messages" />
        <TenantGatePrompt />
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: "#F5EFE6" },
  safeArea: { flex: 1 },
  header: {
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  headerTitle: { fontSize: 22, color: "#2F261A", fontWeight: "800" },
  emptyCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    padding: 24,
    alignItems: "center",
    gap: 8,
  },
  emptyTitle: { color: "#2F261A" },
  emptyText: { color: "#8A7B68", textAlign: "center" },
  upgradeCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 24,
    alignItems: "center",
    gap: 10,
    borderWidth: 1,
    borderColor: "#F28C1B33",
  },
  upgradeIcon: { fontSize: 32 },
  upgradeTitle: { color: "#2F261A", fontSize: 16 },
  upgradeText: { color: "#8A7B68", textAlign: "center", lineHeight: 20 },
  upgradeButton: {
    marginTop: 6,
    backgroundColor: "#F28C1B",
    borderRadius: 12,
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  upgradeButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "700",
  },
  card: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#E8E1D8",
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#FFF0DF",
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: { fontSize: 20 },
  cardBody: { flex: 1, gap: 4 },
  cardTitle: { color: "#2F261A", fontSize: 15 },
  cardPreview: { color: "#8A7B68" },
  cardTime: { color: "#A89888", fontSize: 11 },
});
