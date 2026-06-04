import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { useRef, useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";

import { ThemedText } from "@/components/themed-text";

const ROOM_IMAGE = require("@/assets/images/tutorial-web.png");

type ChatMessage =
  | { id: string; type: "incoming"; text: string; time: string }
  | { id: string; type: "incoming-images"; time: string }
  | { id: string; type: "outgoing"; text: string; time: string; read?: boolean };

const INITIAL_MESSAGES: ChatMessage[] = [
  {
    id: "1",
    type: "incoming",
    text: "Chào bạn! Căn Studio này vẫn còn trống từ 25/8. Bạn muốn xem phòng trực tiếp không?",
    time: "09:41",
  },
  { id: "2", type: "incoming-images", time: "09:41" },
  {
    id: "3",
    type: "outgoing",
    text: "Chào anh, em muốn đặt lịch xem phòng vào cuối tuần được không ạ?",
    time: "09:42",
    read: true,
  },
  {
    id: "4",
    type: "outgoing",
    text: "Em có thể dọn vào từ 25/8 như trên tin đăng.",
    time: "09:42",
    read: true,
  },
];

export default function MessagesPage() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const scrollRef = useRef<ScrollView>(null);
  const [draft, setDraft] = useState("");
  const [messages, setMessages] = useState(INITIAL_MESSAGES);

  const handleSend = () => {
    const text = draft.trim();
    if (!text) return;

    setMessages((current) => [
      ...current,
      {
        id: String(Date.now()),
        type: "outgoing",
        text,
        time: "09:43",
        read: true,
      },
    ]);
    setDraft("");
    requestAnimationFrame(() => {
      scrollRef.current?.scrollToEnd({ animated: true });
    });
  };

  return (
    <View style={styles.screen}>
      <SafeAreaView style={styles.safeArea} edges={["top"]}>
        <View style={styles.header}>
          <Pressable
            style={styles.headerIconBtn}
            onPress={() => router.back()}
            hitSlop={8}
          >
            <Text style={styles.headerIcon}>‹</Text>
          </Pressable>

          <View style={styles.headerProfile}>
            <View style={styles.avatar}>
              <Text style={styles.avatarEmoji}>👨🏻</Text>
            </View>
            <View style={styles.headerMeta}>
              <ThemedText type="smallBold" style={styles.contactName}>
                Nguyễn Vĩnh A
              </ThemedText>
              <ThemedText type="small" style={styles.contactSubtitle}>
                Cho nhà • Phản hồi nhanh
              </ThemedText>
            </View>
          </View>

          <View style={styles.headerActions}>
            <Pressable style={styles.headerIconBtn} hitSlop={8}>
              <Text style={styles.headerActionIcon}>📞</Text>
            </Pressable>
            <Pressable style={styles.headerIconBtn} hitSlop={8}>
              <View style={styles.infoCircle}>
                <Text style={styles.infoIcon}>i</Text>
              </View>
            </Pressable>
          </View>
        </View>

        <KeyboardAvoidingView
          style={styles.flex}
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 0}
        >
          <ScrollView
            ref={scrollRef}
            style={styles.messagesScroll}
            contentContainerStyle={styles.messagesContent}
            showsVerticalScrollIndicator={false}
            onContentSizeChange={() =>
              scrollRef.current?.scrollToEnd({ animated: false })
            }
          >
            <View style={styles.datePillWrap}>
              <View style={styles.datePill}>
                <ThemedText type="smallBold" style={styles.datePillText}>
                  HÔM NAY
                </ThemedText>
              </View>
            </View>

            {messages.map((message) => {
              if (message.type === "incoming") {
                return (
                  <View key={message.id} style={styles.incomingRow}>
                    <View style={styles.incomingAvatar}>
                      <Text style={styles.incomingAvatarEmoji}>👩🏻</Text>
                    </View>
                    <View style={styles.incomingColumn}>
                      <View style={styles.incomingBubble}>
                        <ThemedText type="small" style={styles.incomingText}>
                          {message.text}
                        </ThemedText>
                      </View>
                      <ThemedText type="small" style={styles.messageTime}>
                        {message.time}
                      </ThemedText>
                    </View>
                  </View>
                );
              }

              if (message.type === "incoming-images") {
                return (
                  <View key={message.id} style={styles.incomingRow}>
                    <View style={styles.incomingAvatar}>
                      <Text style={styles.incomingAvatarEmoji}>👩🏻</Text>
                    </View>
                    <View style={styles.incomingColumn}>
                      <View style={styles.imageRow}>
                        <Image
                          source={ROOM_IMAGE}
                          style={styles.chatImage}
                          contentFit="cover"
                        />
                        <Image
                          source={ROOM_IMAGE}
                          style={styles.chatImage}
                          contentFit="cover"
                        />
                      </View>
                      <ThemedText type="small" style={styles.messageTime}>
                        {message.time}
                      </ThemedText>
                    </View>
                  </View>
                );
              }

              return (
                <View key={message.id} style={styles.outgoingRow}>
                  <View style={styles.outgoingBubble}>
                    <ThemedText type="small" style={styles.outgoingText}>
                      {message.text}
                    </ThemedText>
                  </View>
                  <View style={styles.outgoingMeta}>
                    <ThemedText type="small" style={styles.messageTime}>
                      {message.time}
                    </ThemedText>
                    {message.read ? (
                      <Text style={styles.readIcon}>✓✓</Text>
                    ) : null}
                  </View>
                </View>
              );
            })}
          </ScrollView>

          <View
            style={[styles.composer, { paddingBottom: Math.max(insets.bottom, 12) }]}
          >
            <Pressable style={styles.attachButton}>
              <Text style={styles.attachIcon}>+</Text>
            </Pressable>

            <View style={styles.inputWrap}>
              <TextInput
                value={draft}
                onChangeText={setDraft}
                placeholder="Nhập tin nhắn..."
                placeholderTextColor="#9AA3B2"
                style={styles.input}
                multiline
                maxLength={500}
              />
              <Pressable hitSlop={8}>
                <Text style={styles.emojiIcon}>☺</Text>
              </Pressable>
            </View>

            <Pressable
              style={[styles.sendButton, !draft.trim() && styles.sendButtonDisabled]}
              onPress={handleSend}
              disabled={!draft.trim()}
            >
              <Text style={styles.sendIcon}>➤</Text>
            </Pressable>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#F7F2E9",
  },
  safeArea: {
    flex: 1,
  },
  flex: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: "#FAF8F5",
    borderBottomWidth: 1,
    borderBottomColor: "#EDE6DA",
  },
  headerIconBtn: {
    width: 36,
    height: 36,
    alignItems: "center",
    justifyContent: "center",
  },
  headerIcon: {
    fontSize: 28,
    color: "#2A3344",
    lineHeight: 30,
    marginTop: -2,
  },
  headerProfile: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginLeft: 2,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#E8EDF5",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  avatarEmoji: {
    fontSize: 24,
  },
  headerMeta: {
    flex: 1,
  },
  contactName: {
    color: "#1F2940",
    fontSize: 16,
  },
  contactSubtitle: {
    color: "#F28C1B",
    marginTop: 2,
  },
  headerActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 2,
  },
  headerActionIcon: {
    fontSize: 18,
  },
  infoCircle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 1.5,
    borderColor: "#4B5568",
    alignItems: "center",
    justifyContent: "center",
  },
  infoIcon: {
    color: "#4B5568",
    fontSize: 12,
    fontWeight: "700",
  },
  messagesScroll: {
    flex: 1,
    backgroundColor: "#F7F2E9",
  },
  messagesContent: {
    paddingHorizontal: 14,
    paddingTop: 16,
    paddingBottom: 20,
  },
  datePillWrap: {
    alignItems: "center",
    marginBottom: 18,
  },
  datePill: {
    backgroundColor: "#FFF0DF",
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 999,
  },
  datePillText: {
    color: "#F28C1B",
    letterSpacing: 1,
    fontSize: 12,
  },
  incomingRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    marginBottom: 14,
    gap: 8,
  },
  incomingAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#E8EDF5",
    alignItems: "center",
    justifyContent: "center",
  },
  incomingAvatarEmoji: {
    fontSize: 16,
  },
  incomingColumn: {
    maxWidth: "78%",
  },
  incomingBubble: {
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    borderBottomLeftRadius: 6,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: "#ECE7DE",
  },
  incomingText: {
    color: "#1F2940",
    lineHeight: 21,
  },
  imageRow: {
    flexDirection: "row",
    gap: 8,
  },
  chatImage: {
    width: 118,
    height: 88,
    borderRadius: 12,
    backgroundColor: "#E5E5E5",
  },
  outgoingRow: {
    alignItems: "flex-end",
    marginBottom: 14,
    marginLeft: 48,
  },
  outgoingBubble: {
    backgroundColor: "#F28C1B",
    borderRadius: 18,
    borderBottomRightRadius: 6,
    paddingHorizontal: 14,
    paddingVertical: 12,
    maxWidth: "88%",
  },
  outgoingText: {
    color: "#FFFFFF",
    lineHeight: 21,
  },
  outgoingMeta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 4,
    paddingRight: 4,
  },
  messageTime: {
    color: "#9AA3B2",
    fontSize: 12,
  },
  readIcon: {
    color: "#F28C1B",
    fontSize: 12,
    fontWeight: "700",
  },
  composer: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 10,
    paddingHorizontal: 14,
    paddingTop: 10,
    backgroundColor: "#FAF8F5",
    borderTopWidth: 1,
    borderTopColor: "#EDE6DA",
  },
  attachButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#FFF0DF",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 2,
  },
  attachIcon: {
    color: "#F28C1B",
    fontSize: 24,
    lineHeight: 26,
    fontWeight: "300",
  },
  inputWrap: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    borderWidth: 1,
    borderColor: "#E5DCCF",
    paddingLeft: 16,
    paddingRight: 12,
    minHeight: 48,
    maxHeight: 120,
  },
  input: {
    flex: 1,
    fontSize: 15,
    color: "#1F2940",
    paddingVertical: 10,
    maxHeight: 96,
  },
  emojiIcon: {
    fontSize: 22,
    color: "#9AA3B2",
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#F28C1B",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 2,
  },
  sendButtonDisabled: {
    opacity: 0.55,
  },
  sendIcon: {
    color: "#FFFFFF",
    fontSize: 18,
    marginLeft: 2,
  },
});
