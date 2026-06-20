import { useLocalSearchParams, useRouter } from "expo-router";
import { Pressable } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { ChatThreadScreen } from "@/app/sv/chat_thread_page";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";

export default function LandlordChatThreadPage() {
  const router = useRouter();
  const params = useLocalSearchParams<{ conversationId?: string; title?: string }>();

  if (!params.conversationId) {
    return (
      <ThemedView style={{ flex: 1 }}>
        <SafeAreaView>
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
      title={params.title ? String(params.title) : "Tin nhắn"}
    />
  );
}
