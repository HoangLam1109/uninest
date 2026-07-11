import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  RefreshControl,
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

import { blogApi } from "@/api/blog.api";
import { BottomNavigation } from "@/components/bottom-navigation";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { useAuth } from "@/context/auth-context";
import { getApiErrorMessage } from "@/lib/api-error";
import type { BlogPost } from "@/types/blog";
import { formatBlogDate } from "@/utils/blog-display";

export default function BlogListPage() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  const loadPosts = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    setError(null);
    try {
      const res = await blogApi.listPublic({ page: 1, limit: 100 });
      setPosts(res.data ?? []);
    } catch (err) {
      setError(getApiErrorMessage(err, "Không tải được danh sách blog."));
      setPosts([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    void loadPosts();
  }, [loadPosts]);

  const filteredPosts = useMemo(() => {
    const keyword = search.trim().toLowerCase();
    if (!keyword) return posts;
    return posts.filter((post) =>
      [post.title, post.excerpt ?? "", post.content, post.authorName].some(
        (value) => value.toLowerCase().includes(keyword),
      ),
    );
  }, [posts, search]);

  return (
    <ThemedView style={styles.screen}>
      <SafeAreaView style={styles.safeArea}>
        <View style={[styles.header, { paddingTop: insets.top }]}>
          <Pressable style={styles.iconButton} onPress={() => router.back()}>
            <Text style={styles.iconText}>←</Text>
          </Pressable>
          <ThemedText type="smallBold" style={styles.headerTitle}>
            UniNest Blog
          </ThemedText>
          <View style={styles.iconButton} />
        </View>

        <ScrollView
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => void loadPosts(true)}
              tintColor="#F28C1B"
            />
          }
          contentContainerStyle={{
            paddingHorizontal: 16,
            paddingBottom: isAuthenticated ? 120 + insets.bottom : 32 + insets.bottom,
          }}
        >
          <ThemedText type="small" style={styles.subtitle}>
            Kinh nghiệm thuê phòng, quản lý nhà trọ và thông tin hữu ích.
          </ThemedText>

          <TextInput
            value={search}
            onChangeText={setSearch}
            placeholder="Tìm bài viết..."
            placeholderTextColor="#A89888"
            style={styles.searchInput}
          />

          {loading && !refreshing ? (
            <ActivityIndicator color="#F28C1B" style={{ marginTop: 32 }} />
          ) : null}

          {!loading && error ? (
            <View style={styles.emptyCard}>
              <ThemedText type="small" style={styles.errorText}>
                {error}
              </ThemedText>
              <Pressable style={styles.retryButton} onPress={() => void loadPosts()}>
                <ThemedText type="smallBold" style={styles.retryText}>
                  Thử lại
                </ThemedText>
              </Pressable>
            </View>
          ) : null}

          {!loading && !error && filteredPosts.length === 0 ? (
            <View style={styles.emptyCard}>
              <ThemedText type="smallBold" style={styles.emptyTitle}>
                {posts.length === 0 ? "Chưa có bài viết" : "Không tìm thấy bài viết"}
              </ThemedText>
            </View>
          ) : null}

          {!loading && !error
            ? filteredPosts.map((post) => (
                <Pressable
                  key={post._id}
                  style={styles.card}
                  onPress={() =>
                    router.push({
                      pathname: "/sv/blog_detail_page",
                      params: { slug: post.slug },
                    } as any)
                  }
                >
                  {post.coverImageUrl ? (
                    <Image
                      source={{ uri: post.coverImageUrl }}
                      style={styles.cover}
                      contentFit="cover"
                    />
                  ) : (
                    <View style={[styles.cover, styles.coverPlaceholder]}>
                      <Text style={styles.coverPlaceholderText}>📰</Text>
                    </View>
                  )}
                  <View style={styles.cardBody}>
                    <ThemedText type="small" style={styles.cardDate}>
                      {formatBlogDate(post.publishedAt ?? post.createdAt)}
                    </ThemedText>
                    <ThemedText type="smallBold" style={styles.cardTitle}>
                      {post.title}
                    </ThemedText>
                    {post.excerpt ? (
                      <ThemedText type="small" style={styles.cardExcerpt} numberOfLines={3}>
                        {post.excerpt}
                      </ThemedText>
                    ) : null}
                    <ThemedText type="small" style={styles.cardAuthor}>
                      {post.authorName}
                    </ThemedText>
                  </View>
                </Pressable>
              ))
            : null}
        </ScrollView>

        {isAuthenticated ? <BottomNavigation activeTab="home" /> : null}
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
  subtitle: {
    color: "#8A7B68",
    lineHeight: 20,
    marginTop: 8,
    marginBottom: 14,
  },
  searchInput: {
    backgroundColor: "#FFFFFF",
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "#E8E1D8",
    paddingHorizontal: 16,
    paddingVertical: 12,
    color: "#2F261A",
    marginBottom: 16,
  },
  emptyCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    padding: 24,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E8E1D8",
  },
  emptyTitle: { color: "#2F261A" },
  errorText: { color: "#D14343", textAlign: "center", marginBottom: 12 },
  retryButton: {
    backgroundColor: "#F28C1B",
    borderRadius: 10,
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  retryText: { color: "#FFFFFF" },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    overflow: "hidden",
    marginBottom: 14,
    borderWidth: 1,
    borderColor: "#E8E1D8",
  },
  cover: {
    width: "100%",
    height: 160,
    backgroundColor: "#EDE6DC",
  },
  coverPlaceholder: {
    alignItems: "center",
    justifyContent: "center",
  },
  coverPlaceholderText: { fontSize: 40 },
  cardBody: { padding: 14, gap: 6 },
  cardDate: { color: "#F28C1B", fontWeight: "700", fontSize: 11 },
  cardTitle: { color: "#2F261A", fontSize: 17, lineHeight: 22 },
  cardExcerpt: { color: "#6B5E4D", lineHeight: 20 },
  cardAuthor: { color: "#8A7B68", marginTop: 4 },
});
