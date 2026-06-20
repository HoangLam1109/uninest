import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { identityApi } from "@/api/identity.api";
import { IdentityDetailView } from "@/components/identity-detail-view";
import { ThemedText } from "@/components/themed-text";
import { getApiErrorMessage } from "@/lib/api-error";
import type { Identity } from "@/types/identity";

type IdentityDetailModalProps = {
  visible: boolean;
  identityId: string | null;
  onClose: () => void;
};

export function IdentityDetailModal({
  visible,
  identityId,
  onClose,
}: IdentityDetailModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [identity, setIdentity] = useState<Identity | null>(null);

  useEffect(() => {
    if (!visible || !identityId) {
      setIdentity(null);
      setError(null);
      return;
    }

    let cancelled = false;
    setLoading(true);
    setError(null);

    void identityApi
      .getById(identityId)
      .then((res) => {
        if (cancelled) return;
        if (res.data) {
          setIdentity(res.data);
        } else {
          setError("Không tìm thấy hồ sơ định danh.");
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setError(getApiErrorMessage(err, "Không tải được hồ sơ."));
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [visible, identityId]);

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <SafeAreaView style={styles.screen} edges={["top", "bottom"]}>
        <View style={styles.header}>
          <Pressable onPress={onClose} style={styles.closeBtn}>
            <Text style={styles.closeText}>✕</Text>
          </Pressable>
          <ThemedText type="smallBold" style={styles.title}>
            Hồ sơ định danh người thuê
          </ThemedText>
          <View style={styles.closeBtn} />
        </View>

        {loading ? (
          <ActivityIndicator color="#E68A2E" style={{ marginTop: 24 }} />
        ) : error ? (
          <View style={styles.errorBox}>
            <ThemedText type="small" style={styles.errorText}>
              {error}
            </ThemedText>
          </View>
        ) : identity ? (
          <View style={styles.content}>
            <IdentityDetailView identity={identity} />
          </View>
        ) : null}
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#F7F6F2",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  closeBtn: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  closeText: {
    fontSize: 20,
    color: "#1F2940",
  },
  title: {
    fontSize: 16,
    color: "#1F2940",
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
  },
  errorBox: {
    margin: 16,
    padding: 16,
    borderRadius: 12,
    backgroundColor: "#FFEBEE",
  },
  errorText: {
    color: "#C62828",
  },
});
