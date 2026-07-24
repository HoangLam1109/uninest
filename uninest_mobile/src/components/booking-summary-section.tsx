import { Pressable, StyleSheet, Text, View } from "react-native";

import { ThemedText } from "@/components/themed-text";
import type { BookingSummaryItem } from "@/utils/booking-summary";

type BookingSummarySectionProps = {
  items: BookingSummaryItem[];
  loading?: boolean;
  title?: string;
  subtitle?: string;
};

export function BookingSummarySection({
  items,
  loading = false,
  title = "Tổng hợp booking",
  subtitle = "Số liệu được tính theo bộ lọc hiện tại.",
}: BookingSummarySectionProps) {
  return (
    <View style={styles.section}>
      <ThemedText type="smallBold" style={styles.title}>
        {title}
      </ThemedText>
      {!loading ? (
        <ThemedText type="small" style={styles.subtitle}>
          {subtitle}
        </ThemedText>
      ) : null}

      <View style={styles.grid}>
        {loading
          ? Array.from({ length: 4 }).map((_, index) => (
              <View key={index} style={styles.skeleton} />
            ))
          : items.map((item) => (
              <View key={item.id} style={styles.card}>
                <View style={styles.cardHeader}>
                  <ThemedText type="small" style={styles.cardLabel}>
                    {item.label}
                  </ThemedText>
                  <View
                    style={[
                      styles.iconWrap,
                      { backgroundColor: item.iconBackground },
                    ]}
                  >
                    <Text style={styles.icon}>{item.icon}</Text>
                  </View>
                </View>
                <ThemedText
                  type="smallBold"
                  style={[styles.cardValue, { color: item.valueColor }]}
                >
                  {item.value}
                </ThemedText>
              </View>
            ))}
      </View>
    </View>
  );
}

export function BookingStatusFilterRow({
  filters,
  activeId,
  onChange,
  accentColor = "#E68A2E",
}: {
  filters: { id: string; label: string }[];
  activeId: string;
  onChange: (id: string) => void;
  accentColor?: string;
}) {
  return (
    <View style={styles.filterSection}>
      <ThemedText type="small" style={styles.filterLabel}>
        BỘ LỌC TRẠNG THÁI
      </ThemedText>
      <View style={styles.filterRow}>
        {filters.map((item) => {
          const active = activeId === item.id;
          return (
            <Pressable
              key={item.id}
              onPress={() => onChange(item.id)}
              style={[
                styles.filterChip,
                active && {
                  backgroundColor: "#FFF0DF",
                  borderColor: accentColor,
                },
              ]}
            >
              <Text
                style={[
                  styles.filterChipText,
                  active && { color: "#C47A10" },
                ]}
              >
                {item.label}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: "#ECE7DF",
  },
  title: {
    fontSize: 17,
    color: "#1F2940",
  },
  subtitle: {
    color: "#7A869A",
    marginTop: 4,
    lineHeight: 18,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginTop: 14,
  },
  card: {
    width: "47%",
    flexGrow: 1,
    backgroundColor: "#F7F6F2",
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: "#ECE7DF",
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 8,
  },
  cardLabel: {
    flex: 1,
    color: "#7A869A",
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 0.4,
    textTransform: "uppercase",
  },
  iconWrap: {
    width: 32,
    height: 32,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  icon: {
    fontSize: 14,
  },
  cardValue: {
    fontSize: 24,
    marginTop: 10,
  },
  skeleton: {
    width: "47%",
    flexGrow: 1,
    height: 96,
    borderRadius: 14,
    backgroundColor: "#ECE7DF",
  },
  filterSection: {
    marginBottom: 14,
  },
  filterLabel: {
    color: "#7A869A",
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  filterRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  filterChip: {
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 8,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#ECE7DF",
  },
  filterChipText: {
    color: "#7A869A",
    fontSize: 12,
    fontWeight: "700",
  },
});
