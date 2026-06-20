import { useLocalSearchParams, useRouter } from "expo-router";
import { useCallback, useEffect, useRef, useState } from "react";
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

import { chatApi } from "@/api/chat.api";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import {
  formatChatTime,
  useChatSocket,
} from "@/hooks/use-chat-socket";
import { getApiErrorMessage } from "@/lib/api-error";
import { useAuth } from "@/context/auth-context";
import type { ChatMessage } from "@/types/chat";

type ChatThreadPageProps = {
  conversationId: string;
  title?: string;
};

export function ChatThreadScreen({
  conversationId,
  title = "Tin nhắn",
}: ChatThreadPageProps) {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { user } = useAuth();
  const listRef = useRef<FlatList<ChatMessage>>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [draft, setDraft] = useState("");
  const [sending, setSending] = useState(false);

  const loadMessages = useCallback(async () => {
    setLoading(true);
    try {
      const res = await chatApi.messages(conversationId, { page: 1, limit: 80 });
      setMessages(res.data ?? []);
      await chatApi.markAsRead(conversationId).catch(() => undefined);
    } catch {
      setMessages([]);
    } finally {
      setLoading(false);
    }
  }, [conversationId]);

  useEffect(() => {
    void loadMessages();
  }, [loadMessages]);

  const { sendMessage } = useChatSocket(conversationId, (payload) => {
    setMessages((current) => {
      if (current.some((item) => item._id === payload.message._id)) {
        return current;
      }
      return [...current, payload.message];
    });
  });

  const handleSend = async () => {
    const text = draft.trim();
    if (!text || sending) return;
    setSending(true);
    setDraft("");
    try {
      const result = await sendMessage(text);
      if (result?.message) {
        setMessages((current) => {
          if (current.some((item) => item._id === result.message._id)) {
            return current;
          }
          return [...current, result.message];
        });
      }
      requestAnimationFrame(() => {
        listRef.current?.scrollToEnd({ animated: true });
      });
    } catch (err) {
      setDraft(text);
      alert(getApiErrorMessage(err, "Không gửi được tin nhắn."));
    } finally {
      setSending(false);
    }
  };

  const myId = user?.id;

  return (
    <ThemedView style={styles.screen}>
      <SafeAreaView style={styles.safeArea}>
        <View style={[styles.header, { paddingTop: insets.top }]}>
          <Pressable style={styles.iconButton} onPress={() => router.back()}>
            <Text style={styles.iconText}>←</Text>
          </Pressable>
          <ThemedText type="smallBold" style={styles.headerTitle}>
            {title}
          </ThemedText>
          <View style={styles.iconButton} />
        </View>

        {loading ? (
          <ActivityIndicator color="#F28C1B" style={{ marginTop: 24 }} />
        ) : (
          <FlatList
            ref={listRef}
            data={messages}
            keyExtractor={(item) => item._id}
            contentContainerStyle={{
              padding: 16,
              paddingBottom: 12,
              gap: 10,
            }}
            onContentSizeChange={() =>
              listRef.current?.scrollToEnd({ animated: false })
            }
            renderItem={({ item }) => {
              const senderId =
                typeof item.senderId === "object"
                  ? item.senderId._id
                  : item.senderId;
              const isMine = myId && String(senderId) === String(myId);
              return (
                <View
                  style={[
                    styles.bubbleRow,
                    isMine ? styles.bubbleRowMine : styles.bubbleRowOther,
                  ]}
                >
                  <View
                    style={[
                      styles.bubble,
                      isMine ? styles.bubbleMine : styles.bubbleOther,
                    ]}
                  >
                    <ThemedText
                      type="small"
                      style={isMine ? styles.bubbleTextMine : styles.bubbleText}
                    >
                      {item.content}
                    </ThemedText>
                    <ThemedText type="small" style={styles.bubbleTime}>
                      {formatChatTime(item.createdAt)}
                    </ThemedText>
                  </View>
                </View>
              );
            }}
            ListEmptyComponent={
              <View style={styles.emptyCard}>
                <ThemedText type="small" style={styles.emptyText}>
                  Chưa có tin nhắn. Hãy bắt đầu cuộc trò chuyện.
                </ThemedText>
              </View>
            }
          />
        )}

        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          keyboardVerticalOffset={8}
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
              placeholder="Nhập tin nhắn..."
              placeholderTextColor="#A89888"
              style={styles.input}
              multiline
            />
            <Pressable
              style={[styles.sendButton, sending && styles.sendDisabled]}
              onPress={() => void handleSend()}
              disabled={sending}
            >
              <Text style={styles.sendText}>Gửi</Text>
            </Pressable>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </ThemedView>
  );
}

export default function ChatThreadPage() {
  const router = useRouter();
  const params = useLocalSearchParams<{ conversationId?: string; title?: string }>();

  if (!params.conversationId) {
    return (
      <ThemedView style={styles.screen}>
        <SafeAreaView style={styles.safeArea}>
          <Pressable onPress={() => router.back()}>
            <ThemedText type="small">Thiếu conversationId</ThemedText>
          </Pressable>
        </SafeAreaView>
      </ThemedView>
    );
  }

  return (
    <ChatThreadScreen
      conversationId={String(params.conversationId)}
      title={params.title ? String(params.title) : undefined}
    />
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
    borderBottomWidth: 1,
    borderBottomColor: "#E8E1D8",
    backgroundColor: "#F5EFE6",
  },
  iconButton: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  iconText: { fontSize: 22, color: "#3D3428" },
  headerTitle: { fontSize: 17, color: "#2F261A", fontWeight: "700" },
  bubbleRow: { flexDirection: "row" },
  bubbleRowMine: { justifyContent: "flex-end" },
  bubbleRowOther: { justifyContent: "flex-start" },
  bubble: {
    maxWidth: "82%",
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  bubbleMine: { backgroundColor: "#F28C1B" },
  bubbleOther: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E8E1D8",
  },
  bubbleText: { color: "#2F261A" },
  bubbleTextMine: { color: "#FFFFFF" },
  bubbleTime: { color: "#A89888", marginTop: 4, fontSize: 11 },
  emptyCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    padding: 20,
    alignItems: "center",
  },
  emptyText: { color: "#8A7B68", textAlign: "center" },
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
  sendDisabled: { opacity: 0.6 },
  sendText: { color: "#FFFFFF", fontWeight: "700" },
});
