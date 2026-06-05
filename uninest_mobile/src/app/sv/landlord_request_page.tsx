import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
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

import { authApi } from "@/api/auth.api";
import { propertyApi } from "@/api/property.api";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { useAuth } from "@/context/auth-context";
import { getApiErrorMessage } from "@/lib/api-error";
import type { Property } from "@/types/property";
import type { AuthUser } from "@/types/auth";
import { getRoleLabel, isLandlordRole } from "@/utils/landlord-access";

const PROPERTY_TYPES = [
  "Nhà trọ",
  "Chung cư mini",
  "Căn hộ",
  "Nhà nguyên căn",
  "Khác",
] as const;

type PageView = "loading" | "form" | "pending" | "approved";

type FormState = {
  propertyName: string;
  address: string;
  district: string;
  propertyType: string;
  roomCount: string;
  message: string;
};

function validateForm(form: FormState): string | null {
  const name = form.propertyName.trim();
  const address = form.address.trim();
  const roomCount = Number(form.roomCount);

  if (name.length < 3) {
    return "Tên bất động sản phải có ít nhất 3 ký tự.";
  }
  if (address.length < 5) {
    return "Vui lòng nhập địa chỉ đầy đủ.";
  }
  if (!form.propertyType) {
    return "Vui lòng chọn loại hình bất động sản.";
  }
  if (!Number.isFinite(roomCount) || roomCount < 1) {
    return "Số phòng phải là số nguyên dương.";
  }
  return null;
}

function buildDescription(form: FormState) {
  const lines = [
    "Đơn đăng ký làm chủ nhà UniNest",
    `Loại hình: ${form.propertyType}`,
  ];
  const note = form.message.trim();
  if (note) {
    lines.push(`Ghi chú: ${note}`);
  }
  return lines.join("\n");
}

function formatSubmittedAt(value?: string) {
  if (!value) return "Vừa gửi";
  const date = new Date(value);
  return date.toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function LandlordRequestPage() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { user: sessionUser } = useAuth();

  const [view, setView] = useState<PageView>("loading");
  const [refreshing, setRefreshing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [profileUser, setProfileUser] = useState<AuthUser | null>(sessionUser);
  const [pendingProperty, setPendingProperty] = useState<Property | null>(null);

  const [propertyName, setPropertyName] = useState("");
  const [address, setAddress] = useState("");
  const [district, setDistrict] = useState("");
  const [propertyType, setPropertyType] = useState<string>(PROPERTY_TYPES[0]);
  const [roomCount, setRoomCount] = useState("1");
  const [message, setMessage] = useState("");

  const loadPage = useCallback(async () => {
    try {
      const me = await authApi.getMe();
      const user = me.data.user;
      setProfileUser(user);

      if (isLandlordRole(user.role)) {
        setView("approved");
        setPendingProperty(null);
        return;
      }

      const properties = await propertyApi.listMine({ page: 1, limit: 1 });
      const existing = properties.data?.[0] ?? null;

      if (existing) {
        setPendingProperty(existing);
        setView("pending");
        return;
      }

      setPendingProperty(null);
      setView("form");
    } catch (err) {
      setProfileUser(sessionUser);
      setView("form");
      Alert.alert(
        "Không tải được dữ liệu",
        getApiErrorMessage(err, "Vui lòng thử lại sau."),
      );
    }
  }, [sessionUser]);

  useFocusEffect(
    useCallback(() => {
      void loadPage();
    }, [loadPage]),
  );

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadPage();
    setRefreshing(false);
  };

  const handleSubmit = async () => {
    const error = validateForm({
      propertyName,
      address,
      district,
      propertyType,
      roomCount,
      message,
    });

    if (error) {
      Alert.alert("Không thể gửi đơn", error);
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await propertyApi.create({
        name: propertyName.trim(),
        address: address.trim(),
        city: "TP. Hồ Chí Minh",
        district: district.trim() || undefined,
        totalRooms: Number(roomCount),
        description: buildDescription({
          propertyName,
          address,
          district,
          propertyType,
          roomCount,
          message,
        }),
      });

      setPendingProperty(response.data);
      setView("pending");
      Alert.alert(
        "Đã gửi đơn đăng ký",
        "Admin sẽ xem xét hồ sơ bất động sản của bạn. Khi được duyệt, vai trò tài khoản sẽ được nâng lên Chủ nhà.",
      );
    } catch (err) {
      Alert.alert(
        "Gửi đơn thất bại",
        getApiErrorMessage(err, "Không thể gửi yêu cầu. Vui lòng thử lại."),
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const displayUser = profileUser ?? sessionUser;

  return (
    <ThemedView style={styles.screen}>
      <SafeAreaView style={styles.safeArea}>
        <View style={[styles.header, { paddingTop: insets.top }]}>
          <Pressable style={styles.iconButton} onPress={() => router.back()}>
            <Text style={styles.iconText}>←</Text>
          </Pressable>
          <ThemedText type="smallBold" style={styles.headerTitle}>
            Làm chủ nhà
          </ThemedText>
          <View style={styles.iconButton} />
        </View>

        {view === "loading" ? (
          <View style={styles.centered}>
            <ActivityIndicator color="#F28C1B" size="large" />
          </View>
        ) : (
          <KeyboardAvoidingView
            behavior={Platform.select({ ios: "padding", android: undefined })}
            style={styles.keyboardWrap}
          >
            <ScrollView
              showsVerticalScrollIndicator={false}
              refreshControl={
                <RefreshControl
                  refreshing={refreshing}
                  onRefresh={() => void handleRefresh()}
                  tintColor="#F28C1B"
                />
              }
              contentContainerStyle={{
                paddingHorizontal: 16,
                paddingBottom: 32 + insets.bottom,
              }}
              keyboardShouldPersistTaps="handled"
            >
              <View style={styles.heroCard}>
                <View style={styles.heroIconWrap}>
                  <Text style={styles.heroIcon}>🏢</Text>
                </View>
                <ThemedText type="title" style={styles.heroTitle}>
                  Trở thành chủ nhà UniNest
                </ThemedText>
                <ThemedText type="small" style={styles.heroSubtitle}>
                  Gửi hồ sơ bất động sản để admin xem xét. Sau khi được duyệt,
                  bạn có thể quản lý phòng, người thuê và hóa đơn.
                </ThemedText>
              </View>

              <ProcessSteps activeStep={view === "approved" ? 3 : view === "pending" ? 2 : 1} />

              {view === "approved" ? (
                <ApprovedCard
                  user={displayUser}
                  onEnter={() => router.replace("/landlord/home_page" as any)}
                />
              ) : null}

              {view === "pending" && pendingProperty ? (
                <PendingCard
                  property={pendingProperty}
                  user={displayUser}
                  onRefresh={() => void handleRefresh()}
                />
              ) : null}

              {view === "form" ? (
                <>
                  <View style={styles.sectionCard}>
                    <ThemedText type="smallBold" style={styles.sectionTitle}>
                      Thông tin liên hệ
                    </ThemedText>
                    <ThemedText type="small" style={styles.sectionHint}>
                      Lấy từ hồ sơ tài khoản của bạn
                    </ThemedText>
                    <InfoRow label="Họ và tên" value={displayUser?.fullName ?? "—"} />
                    <InfoRow label="Email" value={displayUser?.email ?? "—"} />
                    <InfoRow label="Số điện thoại" value={displayUser?.phone ?? "—"} />
                    <InfoRow
                      label="Vai trò hiện tại"
                      value={getRoleLabel(displayUser?.role)}
                    />
                  </View>

                  <View style={styles.sectionCard}>
                    <ThemedText type="smallBold" style={styles.sectionTitle}>
                      Hồ sơ bất động sản
                    </ThemedText>
                    <ThemedText type="small" style={styles.sectionHint}>
                      Thông tin này sẽ được gửi cho admin duyệt
                    </ThemedText>

                    <FieldLabel text="Tên bất động sản" />
                    <TextInput
                      value={propertyName}
                      onChangeText={setPropertyName}
                      placeholder="VD: Nhà trọ Sunrise Q.7"
                      placeholderTextColor="#9A8B78"
                      style={styles.input}
                    />

                    <FieldLabel text="Địa chỉ" />
                    <TextInput
                      value={address}
                      onChangeText={setAddress}
                      placeholder="Số nhà, đường, phường/xã"
                      placeholderTextColor="#9A8B78"
                      style={styles.input}
                    />

                    <FieldLabel text="Quận / Huyện" />
                    <TextInput
                      value={district}
                      onChangeText={setDistrict}
                      placeholder="VD: Quận 7"
                      placeholderTextColor="#9A8B78"
                      style={styles.input}
                    />

                    <FieldLabel text="Loại hình" />
                    <View style={styles.typeRow}>
                      {PROPERTY_TYPES.map((type) => {
                        const active = propertyType === type;
                        return (
                          <Pressable
                            key={type}
                            onPress={() => setPropertyType(type)}
                            style={[
                              styles.typeChip,
                              active && styles.typeChipActive,
                            ]}
                          >
                            <ThemedText
                              type="small"
                              style={[
                                styles.typeChipText,
                                active && styles.typeChipTextActive,
                              ]}
                            >
                              {type}
                            </ThemedText>
                          </Pressable>
                        );
                      })}
                    </View>

                    <FieldLabel text="Số phòng quản lý" />
                    <TextInput
                      value={roomCount}
                      onChangeText={setRoomCount}
                      placeholder="VD: 10"
                      placeholderTextColor="#9A8B78"
                      style={styles.input}
                      keyboardType="number-pad"
                    />

                    <FieldLabel text="Ghi chú thêm" />
                    <TextInput
                      value={message}
                      onChangeText={setMessage}
                      placeholder="Mô tả thêm về bất động sản, giấy tờ, kinh nghiệm cho thuê..."
                      placeholderTextColor="#9A8B78"
                      style={[styles.input, styles.textArea]}
                      multiline
                      textAlignVertical="top"
                    />
                  </View>

                  <Pressable
                    style={[
                      styles.submitButton,
                      isSubmitting && styles.submitButtonDisabled,
                    ]}
                    onPress={() => void handleSubmit()}
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <ActivityIndicator color="#FFFFFF" />
                    ) : (
                      <ThemedText type="smallBold" style={styles.submitText}>
                        Gửi đơn đăng ký
                      </ThemedText>
                    )}
                  </Pressable>

                  <ThemedText type="small" style={styles.footerNote}>
                    Sau khi gửi, admin sẽ kiểm tra hồ sơ và cập nhật vai trò tài
                    khoản của bạn thành Chủ nhà khi được duyệt.
                  </ThemedText>
                </>
              ) : null}
            </ScrollView>
          </KeyboardAvoidingView>
        )}
      </SafeAreaView>
    </ThemedView>
  );
}

function ProcessSteps({ activeStep }: { activeStep: 1 | 2 | 3 }) {
  const steps = [
    { id: 1, label: "Gửi đơn" },
    { id: 2, label: "Admin duyệt" },
    { id: 3, label: "Làm chủ nhà" },
  ] as const;

  return (
    <View style={styles.stepsCard}>
      <View style={styles.stepsRow}>
        {steps.map((step, index) => {
          const done = step.id < activeStep;
          const active = step.id === activeStep;
          return (
            <View key={step.id} style={styles.stepItem}>
              <View
                style={[
                  styles.stepDot,
                  done && styles.stepDotDone,
                  active && styles.stepDotActive,
                ]}
              >
                <Text
                  style={[
                    styles.stepDotText,
                    (done || active) && styles.stepDotTextActive,
                  ]}
                >
                  {done ? "✓" : String(step.id)}
                </Text>
              </View>
              <ThemedText
                type="small"
                style={[
                  styles.stepLabel,
                  active && styles.stepLabelActive,
                  done && styles.stepLabelDone,
                ]}
              >
                {step.label}
              </ThemedText>
              {index < steps.length - 1 ? (
                <View
                  style={[
                    styles.stepLine,
                    done && styles.stepLineDone,
                  ]}
                />
              ) : null}
            </View>
          );
        })}
      </View>
    </View>
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

function FieldLabel({ text }: { text: string }) {
  return (
    <ThemedText type="smallBold" style={styles.fieldLabel}>
      {text}
    </ThemedText>
  );
}

function PendingCard({
  property,
  user,
  onRefresh,
}: {
  property: Property;
  user: AuthUser | null;
  onRefresh: () => void;
}) {
  return (
    <View style={styles.statusCard}>
      <View style={styles.statusBadgePending}>
        <ThemedText type="smallBold" style={styles.statusBadgeTextPending}>
          ĐANG CHỜ DUYỆT
        </ThemedText>
      </View>
      <ThemedText type="title" style={styles.statusTitle}>
        Đơn đã được gửi
      </ThemedText>
      <ThemedText type="small" style={styles.statusBody}>
        Admin đang xem xét hồ sơ bất động sản của bạn. Khi được duyệt, vai trò
        tài khoản sẽ chuyển thành Chủ nhà và bạn có thể vào cổng quản lý.
      </ThemedText>

      <View style={styles.summaryBox}>
        <SummaryRow label="Người gửi" value={user?.fullName ?? "—"} />
        <SummaryRow label="Bất động sản" value={property.name} />
        <SummaryRow label="Địa chỉ" value={property.address} />
        <SummaryRow
          label="Số phòng"
          value={String(property.totalRooms ?? "—")}
        />
        <SummaryRow
          label="Thời gian gửi"
          value={formatSubmittedAt(property.createdAt)}
        />
      </View>

      <Pressable style={styles.secondaryButton} onPress={onRefresh}>
        <ThemedText type="smallBold" style={styles.secondaryButtonText}>
          Kiểm tra trạng thái duyệt
        </ThemedText>
      </Pressable>
    </View>
  );
}

function ApprovedCard({
  user,
  onEnter,
}: {
  user: AuthUser | null;
  onEnter: () => void;
}) {
  return (
    <View style={styles.statusCard}>
      <View style={styles.statusBadgeApproved}>
        <ThemedText type="smallBold" style={styles.statusBadgeTextApproved}>
          ĐÃ DUYỆT
        </ThemedText>
      </View>
      <ThemedText type="title" style={styles.statusTitle}>
        Chúc mừng, {user?.fullName ?? "bạn"}!
      </ThemedText>
      <ThemedText type="small" style={styles.statusBody}>
        Tài khoản của bạn đã có quyền chủ nhà. Bạn có thể bắt đầu quản lý phòng,
        đơn đặt và hóa đơn ngay bây giờ.
      </ThemedText>

      <Pressable style={styles.submitButton} onPress={onEnter}>
        <ThemedText type="smallBold" style={styles.submitText}>
          Vào cổng chủ nhà
        </ThemedText>
      </Pressable>
    </View>
  );
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.summaryRow}>
      <ThemedText type="small" style={styles.summaryLabel}>
        {label}
      </ThemedText>
      <ThemedText type="smallBold" style={styles.summaryValue}>
        {value}
      </ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#F5EFE6",
  },
  safeArea: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  iconButton: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  iconText: {
    fontSize: 22,
    color: "#3D3428",
  },
  headerTitle: {
    fontSize: 18,
    color: "#2F261A",
    fontWeight: "700",
  },
  keyboardWrap: {
    flex: 1,
  },
  centered: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  heroCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 20,
    alignItems: "center",
    marginBottom: 14,
    borderWidth: 1,
    borderColor: "#E8E1D8",
  },
  heroIconWrap: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "#FFF0DF",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  heroIcon: {
    fontSize: 28,
  },
  heroTitle: {
    fontSize: 22,
    color: "#2F261A",
    textAlign: "center",
    marginBottom: 8,
  },
  heroSubtitle: {
    color: "#7A6B58",
    textAlign: "center",
    lineHeight: 20,
  },
  stepsCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: "#E8E1D8",
  },
  stepsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  stepItem: {
    flex: 1,
    alignItems: "center",
    position: "relative",
  },
  stepDot: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: "#F0EBE4",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  stepDotActive: {
    backgroundColor: "#F28C1B",
  },
  stepDotDone: {
    backgroundColor: "#2E8B57",
  },
  stepDotText: {
    color: "#8A7B68",
    fontWeight: "700",
    fontSize: 13,
  },
  stepDotTextActive: {
    color: "#FFFFFF",
  },
  stepLine: {
    position: "absolute",
    top: 14,
    left: "58%",
    right: "-42%",
    height: 2,
    backgroundColor: "#E8E1D8",
    zIndex: -1,
  },
  stepLineDone: {
    backgroundColor: "#B8E0C8",
  },
  stepLabel: {
    color: "#9A8B78",
    fontSize: 11,
    textAlign: "center",
  },
  stepLabelActive: {
    color: "#F28C1B",
    fontWeight: "700",
  },
  stepLabelDone: {
    color: "#2E8B57",
    fontWeight: "700",
  },
  sectionCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: "#E8E1D8",
  },
  sectionTitle: {
    fontSize: 16,
    color: "#2F261A",
    marginBottom: 4,
  },
  sectionHint: {
    color: "#8A7B68",
    marginBottom: 14,
    lineHeight: 18,
  },
  infoRow: {
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#F0EBE4",
  },
  infoLabel: {
    color: "#8A7B68",
    marginBottom: 2,
  },
  infoValue: {
    color: "#2F261A",
    fontSize: 15,
  },
  fieldLabel: {
    color: "#2F261A",
    marginBottom: 8,
    marginTop: 4,
  },
  input: {
    backgroundColor: "#FAF8F5",
    borderWidth: 1,
    borderColor: "#E8E1D8",
    borderRadius: 10,
    paddingHorizontal: 14,
    minHeight: 48,
    fontSize: 15,
    color: "#2F261A",
    marginBottom: 12,
  },
  textArea: {
    minHeight: 96,
    paddingTop: 12,
    paddingBottom: 12,
  },
  typeRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 12,
  },
  typeChip: {
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#E8E1D8",
    backgroundColor: "#FAF8F5",
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  typeChipActive: {
    borderColor: "#F28C1B",
    backgroundColor: "#FFF0DF",
  },
  typeChipText: {
    color: "#7A6B58",
  },
  typeChipTextActive: {
    color: "#C47A10",
    fontWeight: "700",
  },
  submitButton: {
    backgroundColor: "#F28C1B",
    borderRadius: 12,
    minHeight: 52,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  submitButtonDisabled: {
    opacity: 0.7,
  },
  submitText: {
    color: "#FFFFFF",
    fontSize: 16,
  },
  secondaryButton: {
    borderRadius: 12,
    minHeight: 48,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#F28C1B",
    backgroundColor: "#FFF8F0",
  },
  secondaryButtonText: {
    color: "#F28C1B",
    fontSize: 15,
  },
  footerNote: {
    color: "#8A7B68",
    textAlign: "center",
    lineHeight: 18,
    paddingHorizontal: 8,
  },
  statusCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 20,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: "#E8E1D8",
  },
  statusBadgePending: {
    alignSelf: "flex-start",
    backgroundColor: "#FFF4D6",
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 5,
    marginBottom: 12,
  },
  statusBadgeTextPending: {
    color: "#C47A10",
    fontSize: 11,
    letterSpacing: 0.4,
  },
  statusBadgeApproved: {
    alignSelf: "flex-start",
    backgroundColor: "#E2F5E8",
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 5,
    marginBottom: 12,
  },
  statusBadgeTextApproved: {
    color: "#2E8B57",
    fontSize: 11,
    letterSpacing: 0.4,
  },
  statusTitle: {
    fontSize: 20,
    color: "#2F261A",
    marginBottom: 8,
  },
  statusBody: {
    color: "#7A6B58",
    lineHeight: 20,
    marginBottom: 16,
  },
  summaryBox: {
    backgroundColor: "#FAF8F5",
    borderRadius: 12,
    padding: 14,
    marginBottom: 16,
    gap: 10,
  },
  summaryRow: {
    gap: 2,
  },
  summaryLabel: {
    color: "#9A8B78",
    fontSize: 12,
  },
  summaryValue: {
    color: "#2F261A",
    fontSize: 14,
    lineHeight: 20,
  },
});
