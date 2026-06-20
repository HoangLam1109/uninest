import { Image } from "expo-image";
import { useState } from "react";
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { ThemedText } from "@/components/themed-text";
import type { Identity } from "@/types/identity";
import {
  formatIdentityDate,
  identityStatusLabel,
} from "@/utils/identity-display";

type IdentityDetailViewProps = {
  identity: Identity;
};

export function IdentityDetailView({ identity }: IdentityDetailViewProps) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  return (
    <>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View
          style={[
            styles.statusBadge,
            identity.status === "VERIFIED" && styles.statusVerified,
            identity.status === "REJECTED" && styles.statusRejected,
          ]}
        >
          <Text style={styles.statusText}>
            {identityStatusLabel(identity.status)}
          </Text>
          {identity.verifiedAt ? (
            <Text style={styles.statusSub}>
              {formatIdentityDate(identity.verifiedAt)}
            </Text>
          ) : null}
        </View>

        <View style={styles.infoCard}>
          <InfoRow label="Họ tên" value={identity.fullName} />
          <InfoRow label="Ngày sinh" value={formatIdentityDate(identity.dateOfBirth)} />
          <InfoRow label="Số điện thoại" value={identity.phone} />
          <InfoRow label="CCCD/CMND" value={identity.cccdNumber} />
        </View>

        <ThemedText type="smallBold" style={styles.sectionTitle}>
          Ảnh CCCD
        </ThemedText>
        <View style={styles.imageGrid}>
          <Pressable
            style={styles.imageCard}
            onPress={() => setPreviewUrl(identity.cccdFrontImage)}
          >
            <Image
              source={{ uri: identity.cccdFrontImage }}
              style={styles.cccdImage}
              contentFit="cover"
            />
            <Text style={styles.imageLabel}>Mặt trước</Text>
          </Pressable>
          <Pressable
            style={styles.imageCard}
            onPress={() => setPreviewUrl(identity.cccdBackImage)}
          >
            <Image
              source={{ uri: identity.cccdBackImage }}
              style={styles.cccdImage}
              contentFit="cover"
            />
            <Text style={styles.imageLabel}>Mặt sau</Text>
          </Pressable>
        </View>
      </ScrollView>

      <Modal visible={Boolean(previewUrl)} transparent animationType="fade">
        <Pressable style={styles.previewBackdrop} onPress={() => setPreviewUrl(null)}>
          {previewUrl ? (
            <Image
              source={{ uri: previewUrl }}
              style={styles.previewImage}
              contentFit="contain"
            />
          ) : null}
        </Pressable>
      </Modal>
    </>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.infoRow}>
      <ThemedText type="small" style={styles.infoLabel}>
        {label}
      </ThemedText>
      <ThemedText type="smallBold" style={styles.infoValue}>
        {value}
      </ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  statusBadge: {
    alignSelf: "flex-start",
    backgroundColor: "#FFF4E8",
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 16,
  },
  statusVerified: {
    backgroundColor: "#E8F5E9",
  },
  statusRejected: {
    backgroundColor: "#FFEBEE",
  },
  statusText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#2F261A",
  },
  statusSub: {
    marginTop: 2,
    fontSize: 11,
    color: "#6B5E4D",
  },
  infoCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#E8E1D8",
    padding: 14,
    gap: 10,
    marginBottom: 16,
  },
  infoRow: {
    gap: 4,
  },
  infoLabel: {
    color: "#8A7B68",
  },
  infoValue: {
    color: "#2F261A",
  },
  sectionTitle: {
    color: "#2F261A",
    marginBottom: 10,
  },
  imageGrid: {
    flexDirection: "row",
    gap: 12,
    paddingBottom: 8,
  },
  imageCard: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E8E1D8",
    overflow: "hidden",
  },
  cccdImage: {
    width: "100%",
    height: 120,
    backgroundColor: "#F5EFE6",
  },
  imageLabel: {
    textAlign: "center",
    paddingVertical: 8,
    fontSize: 12,
    fontWeight: "600",
    color: "#6B5E4D",
  },
  previewBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.92)",
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
  },
  previewImage: {
    width: "100%",
    height: "80%",
  },
});
