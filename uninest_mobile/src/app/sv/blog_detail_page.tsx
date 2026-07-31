import { Image } from "expo-image";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";

import { blogApi } from "@/api/blog.api";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { getApiErrorMessage } from "@/lib/api-error";
import type { BlogPost } from "@/types/blog";
import { formatBlogDate, splitBlogParagraphs } from "@/utils/blog-display";

export default function BlogDetailPage() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const params = useLocalSearchParams<{ slug?: string }>();
  const slug = typeof params.slug === "string" ? params.slug : "";

  const [post, setPost] = useState<BlogPost | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadPost = useCallback(async () => {
    if (!slug) {
      setError("Không tìm thấy bài viết.");
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await blogApi.getBySlug(slug);
      setPost(res.data);
    } catch (err) {
      setPost(null);
      setError(getApiErrorMessage(err, "Không tải được bài viết."));
    } finally {
      setLoading(false);
    }
  }, [slug]);

  useEffect(() => {
    void loadPost();
  }, [loadPost]);

  const paragraphs = post ? splitBlogParagraphs(post.content) : [];

  return (
    <ThemedView style={styles.screen}>
      <SafeAreaView style={styles.safeArea}>
        <View style={[styles.header, { paddingTop: insets.top }]}>
          <Pressable style={styles.iconButton} onPress={() => router.back()}>
            <Text style={styles.iconText}>←</Text>
          </Pressable>
          <ThemedText type="smallBold" style={styles.headerTitle}>
            Bài viết
          </ThemedText>
          <View style={styles.iconButton} />
        </View>

        {loading ? (
          <ActivityIndicator color="#F28C1B" style={{ marginTop: 40 }} />
        ) : error || !post ? (
          <View style={styles.emptyCard}>
            <ThemedText type="smallBold" style={styles.emptyTitle}>
              Không tìm thấy bài viết
            </ThemedText>
            <ThemedText type="small" style={styles.emptyText}>
              {error ?? "Bài viết có thể đã bị xóa hoặc chưa được xuất bản."}
            </ThemedText>
            <Pressable
              style={styles.backLink}
              onPress={() => router.push("/sv/blog_list_page" as any)}
            >
              <ThemedText type="smallBold" style={styles.backLinkText}>
                Quay lại blog
              </ThemedText>
            </Pressable>
          </View>
        ) : (
          <ScrollView
            contentContainerStyle={{
              paddingHorizontal: 16,
              paddingBottom: 32 + insets.bottom,
            }}
          >
            {post.coverImageUrl ? (
              <Image
                source={{ uri: post.coverImageUrl }}
                style={styles.cover}
                contentFit="cover"
              />
            ) : null}

            <ThemedText type="small" style={styles.date}>
              {formatBlogDate(post.publishedAt ?? post.createdAt)}
            </ThemedText>
            <ThemedText type="title" style={styles.title}>
              {post.title}
            </ThemedText>
            <ThemedText type="small" style={styles.author}>
              {post.authorName}
            </ThemedText>
            {post.excerpt ? (
              <ThemedText type="small" style={styles.excerpt}>
                {post.excerpt}
              </ThemedText>
            ) : null}

            <View style={styles.contentCard}>
              {paragraphs.map((paragraph, index) => (
                <ThemedText key={index} type="small" style={styles.paragraph}>
                  {paragraph}
                </ThemedText>
              ))}
            </View>
          </ScrollView>
        )}
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
    paddingBottom: 10,
  },
  iconButton: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  iconText: { fontSize: 22, color: "#3D3428" },
  headerTitle: { fontSize: 18, color: "#2F261A", fontWeight: "700" },
  emptyCard: {
    margin: 16,
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 24,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E8E1D8",
  },
  emptyTitle: { color: "#2F261A", marginBottom: 8 },
  emptyText: { color: "#8A7B68", textAlign: "center" },
  backLink: {
    marginTop: 16,
    backgroundColor: "#F28C1B",
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  backLinkText: { color: "#FFFFFF" },
  cover: {
    width: "100%",
    height: 200,
    borderRadius: 16,
    marginBottom: 16,
    backgroundColor: "#EDE6DC",
  },
  date: {
    color: "#F28C1B",
    fontWeight: "700",
    marginBottom: 8,
  },
  title: {
    color: "#2F261A",
    lineHeight: 32,
    marginBottom: 8,
  },
  author: {
    color: "#8A7B68",
    marginBottom: 12,
  },
  excerpt: {
    color: "#6B5E4D",
    lineHeight: 22,
    marginBottom: 16,
  },
  contentCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: "#E8E1D8",
    gap: 14,
  },
  paragraph: {
    color: "#3D3428",
    lineHeight: 24,
  },
});
