import { Image } from "expo-image";
import { useFocusEffect } from "expo-router";
import { useCallback, useEffect, useMemo, useState, type ReactNode } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Modal,
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

import { roomApi } from "@/api/room.api";
import { LandlordBottomNavigation } from "@/components/landlord/bottom-navigation";
import { ThemedText } from "@/components/themed-text";
import { getApiErrorMessage } from "@/lib/api-error";
import type { Room, RoomPayload, RoomStatus, RoomType } from "@/types/room";
import {
  formatPrice,
  formatRoomLocation,
  roomStatusLabel,
  roomTypeLabel,
} from "@/utils/room-display";

const ROOM_PLACEHOLDER = require("@/assets/images/tutorial-web.png");

const ROOM_TYPES: RoomType[] = ["STUDIO", "SINGLE", "SHARED", "APARTMENT"];

const STATUS_FILTERS: { id: "ALL" | RoomStatus; label: string }[] = [
  { id: "ALL", label: "Tất cả" },
  { id: "AVAILABLE", label: "Còn trống" },
  { id: "RENTED", label: "Đã thuê" },
  { id: "MAINTENANCE", label: "Bảo trì" },
];

type FormState = {
  title: string;
  address: string;
  district: string;
  roomType: RoomType;
  pricePerMonth: string;
  depositAmount: string;
  maxOccupants: string;
  areaSqm: string;
  description: string;
};

const EMPTY_FORM: FormState = {
  title: "",
  address: "",
  district: "",
  roomType: "SINGLE",
  pricePerMonth: "",
  depositAmount: "",
  maxOccupants: "1",
  areaSqm: "",
  description: "",
};

function parseNumber(value: string): number | undefined {
  const trimmed = value.trim();
  if (!trimmed) return undefined;
  const parsed = Number(trimmed);
  return Number.isFinite(parsed) ? parsed : undefined;
}

function validateForm(form: FormState): string | null {
  if (form.title.trim().length < 3) {
    return "Tên phòng phải có ít nhất 3 ký tự.";
  }
  if (form.address.trim().length < 5) {
    return "Vui lòng nhập địa chỉ đầy đủ.";
  }
  const price = parseNumber(form.pricePerMonth);
  if (price == null || price <= 0) {
    return "Giá thuê phải lớn hơn 0.";
  }
  const maxOccupants = parseNumber(form.maxOccupants);
  if (maxOccupants == null || maxOccupants < 1) {
    return "Số người ở tối đa phải ≥ 1.";
  }
  return null;
}

function toPayload(form: FormState): RoomPayload {
  return {
    title: form.title.trim(),
    address: form.address.trim(),
    district: form.district.trim() || undefined,
    city: "TP. Hồ Chí Minh",
    roomType: form.roomType,
    pricePerMonth: parseNumber(form.pricePerMonth) ?? 0,
    depositAmount: parseNumber(form.depositAmount),
    maxOccupants: parseNumber(form.maxOccupants) ?? 1,
    areaSqm: parseNumber(form.areaSqm),
    description: form.description.trim() || undefined,
  };
}

function statusStyle(status?: string) {
  if (status === "AVAILABLE") return styles.badgeAvailable;
  if (status === "RENTED") return styles.badgeRented;
  if (status === "MAINTENANCE") return styles.badgeMaintenance;
  return styles.badgeMuted;
}

export default function LandlordRoomsPage() {
  const insets = useSafeAreaInsets();
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [statusFilter, setStatusFilter] = useState<"ALL" | RoomStatus>("ALL");
  const [formOpen, setFormOpen] = useState(false);
  const [editingRoom, setEditingRoom] = useState<Room | null>(null);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [actionRoomId, setActionRoomId] = useState<string | null>(null);

  const loadRooms = useCallback(async () => {
    try {
      const res = await roomApi.listMy({
        page: 1,
        limit: 100,
        status: statusFilter === "ALL" ? undefined : statusFilter,
      });
      setRooms(res.data ?? []);
    } catch (err) {
      Alert.alert(
        "Không tải được danh sách phòng",
        getApiErrorMessage(err, "Vui lòng thử lại."),
      );
      setRooms([]);
    }
  }, [statusFilter]);

  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      void loadRooms().finally(() => setLoading(false));
    }, [loadRooms]),
  );

  const summary = useMemo(() => {
    return rooms.reduce(
      (acc, room) => {
        acc.total += 1;
        if (room.status === "AVAILABLE") acc.available += 1;
        if (room.status === "RENTED") acc.rented += 1;
        if (room.status === "MAINTENANCE") acc.maintenance += 1;
        if (room.isPublished) acc.published += 1;
        return acc;
      },
      { total: 0, available: 0, rented: 0, maintenance: 0, published: 0 },
    );
  }, [rooms]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadRooms();
    setRefreshing(false);
  };

  const openCreateForm = () => {
    setEditingRoom(null);
    setForm(EMPTY_FORM);
    setFormOpen(true);
  };

  const openEditForm = (room: Room) => {
    setEditingRoom(room);
    setForm({
      title: room.title,
      address: room.address,
      district: room.district ?? "",
      roomType: (room.roomType as RoomType) ?? "SINGLE",
      pricePerMonth: String(room.pricePerMonth ?? ""),
      depositAmount: room.depositAmount ? String(room.depositAmount) : "",
      maxOccupants: String(room.maxOccupants ?? 1),
      areaSqm: room.areaSqm ? String(room.areaSqm) : "",
      description: room.description ?? "",
    });
    setFormOpen(true);
  };

  const closeForm = () => {
    setFormOpen(false);
    setEditingRoom(null);
    setForm(EMPTY_FORM);
  };

  const handleSubmit = async () => {
    const error = validateForm(form);
    if (error) {
      Alert.alert("Không thể lưu", error);
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = toPayload(form);
      if (editingRoom) {
        await roomApi.update(editingRoom._id, payload);
      } else {
        await roomApi.create(payload);
      }
      closeForm();
      await loadRooms();
      Alert.alert(
        "Thành công",
        editingRoom ? "Đã cập nhật phòng." : "Đã tạo phòng mới.",
      );
    } catch (err) {
      Alert.alert(
        "Lưu thất bại",
        getApiErrorMessage(err, "Không thể lưu phòng."),
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleTogglePublish = async (room: Room) => {
    setActionRoomId(room._id);
    try {
      if (room.isPublished) {
        await roomApi.unpublish(room._id);
      } else {
        await roomApi.publish(room._id);
      }
      await loadRooms();
    } catch (err) {
      Alert.alert(
        "Thao tác thất bại",
        getApiErrorMessage(err, "Không thể thay đổi trạng thái đăng tin."),
      );
    } finally {
      setActionRoomId(null);
    }
  };

  const handleDelete = (room: Room) => {
    Alert.alert("Xóa phòng", `Bạn có chắc muốn xóa "${room.title}"?`, [
      { text: "Hủy", style: "cancel" },
      {
        text: "Xóa",
        style: "destructive",
        onPress: () => {
          setActionRoomId(room._id);
          void roomApi
            .delete(room._id)
            .then(() => loadRooms())
            .catch((err) =>
              Alert.alert(
                "Xóa thất bại",
                getApiErrorMessage(err, "Không thể xóa phòng."),
              ),
            )
            .finally(() => setActionRoomId(null));
        },
      },
    ]);
  };

  return (
    <View style={styles.screen}>
      <SafeAreaView style={styles.safeArea} edges={["top"]}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => void handleRefresh()}
              tintColor="#E68A2E"
            />
          }
          contentContainerStyle={[
            styles.scrollContent,
            { paddingBottom: 120 + insets.bottom },
          ]}
        >
          <View style={styles.header}>
            <View>
              <ThemedText type="title" style={styles.pageTitle}>
                Quản lý phòng
              </ThemedText>
              <ThemedText type="small" style={styles.pageSubtitle}>
                Theo dõi trạng thái, giá thuê và tin đăng của bạn
              </ThemedText>
            </View>
            <Pressable style={styles.addButton} onPress={openCreateForm}>
              <Text style={styles.addButtonIcon}>+</Text>
            </Pressable>
          </View>

          <View style={styles.statsRow}>
            <StatCard label="Tổng phòng" value={String(summary.total)} />
            <StatCard
              label="Còn trống"
              value={String(summary.available)}
              accent="#2E8B57"
            />
            <StatCard
              label="Đã thuê"
              value={String(summary.rented)}
              accent="#E68A2E"
            />
            <StatCard
              label="Đang đăng"
              value={String(summary.published)}
              accent="#4B6CB7"
            />
          </View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.filterRow}
          >
            {STATUS_FILTERS.map((item) => {
              const active = statusFilter === item.id;
              return (
                <Pressable
                  key={item.id}
                  onPress={() => setStatusFilter(item.id)}
                  style={[styles.filterChip, active && styles.filterChipActive]}
                >
                  <ThemedText
                    type="smallBold"
                    style={[
                      styles.filterChipText,
                      active && styles.filterChipTextActive,
                    ]}
                  >
                    {item.label}
                  </ThemedText>
                </Pressable>
              );
            })}
          </ScrollView>

          {loading ? (
            <ActivityIndicator
              color="#E68A2E"
              style={{ marginTop: 40 }}
              size="large"
            />
          ) : rooms.length === 0 ? (
            <View style={styles.emptyCard}>
              <Text style={styles.emptyIcon}>🛏️</Text>
              <ThemedText type="smallBold" style={styles.emptyTitle}>
                Chưa có phòng nào
              </ThemedText>
              <ThemedText type="small" style={styles.emptyText}>
                Tạo phòng đầu tiên để bắt đầu đăng tin cho sinh viên.
              </ThemedText>
              <Pressable style={styles.emptyButton} onPress={openCreateForm}>
                <ThemedText type="smallBold" style={styles.emptyButtonText}>
                  Thêm phòng
                </ThemedText>
              </Pressable>
            </View>
          ) : (
            rooms.map((room) => (
              <RoomCard
                key={room._id}
                room={room}
                busy={actionRoomId === room._id}
                onEdit={() => openEditForm(room)}
                onTogglePublish={() => void handleTogglePublish(room)}
                onDelete={() => handleDelete(room)}
              />
            ))
          )}
        </ScrollView>

        <RoomFormModal
          visible={formOpen}
          editing={Boolean(editingRoom)}
          form={form}
          isSubmitting={isSubmitting}
          onChange={setForm}
          onClose={closeForm}
          onSubmit={() => void handleSubmit()}
        />

        <LandlordBottomNavigation activeTab="rooms" />
      </SafeAreaView>
    </View>
  );
}

function StatCard({
  label,
  value,
  accent = "#1F2940",
}: {
  label: string;
  value: string;
  accent?: string;
}) {
  return (
    <View style={styles.statCard}>
      <ThemedText type="small" style={styles.statLabel}>
        {label}
      </ThemedText>
      <Text style={[styles.statValue, { color: accent }]}>{value}</Text>
    </View>
  );
}

function RoomCard({
  room,
  busy,
  onEdit,
  onTogglePublish,
  onDelete,
}: {
  room: Room;
  busy: boolean;
  onEdit: () => void;
  onTogglePublish: () => void;
  onDelete: () => void;
}) {
  const [imageUrl, setImageUrl] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    void roomApi
      .listImages(room._id)
      .then((res) => {
        if (cancelled) return;
        const images = res.data ?? [];
        const primary = images.find((img) => img.isPrimary) ?? images[0];
        if (primary?.url) setImageUrl(primary.url);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [room._id]);

  return (
    <View style={styles.roomCard}>
      <Image
        source={imageUrl ? { uri: imageUrl } : ROOM_PLACEHOLDER}
        style={styles.roomImage}
        contentFit="cover"
      />
      <View style={styles.roomBody}>
        <View style={styles.roomTopRow}>
          <ThemedText type="smallBold" style={styles.roomTitle} numberOfLines={1}>
            {room.title}
          </ThemedText>
          <View style={[styles.badge, statusStyle(room.status)]}>
            <ThemedText type="small" style={styles.badgeText}>
              {roomStatusLabel(room.status)}
            </ThemedText>
          </View>
        </View>

        <ThemedText type="small" style={styles.roomMeta} numberOfLines={2}>
          {formatRoomLocation(room)}
        </ThemedText>

        <View style={styles.roomInfoRow}>
          <ThemedText type="smallBold" style={styles.roomPrice}>
            {formatPrice(room.pricePerMonth)}
            <ThemedText type="small" style={styles.roomPriceUnit}>
              /tháng
            </ThemedText>
          </ThemedText>
          <ThemedText type="small" style={styles.roomType}>
            {roomTypeLabel(room.roomType)}
          </ThemedText>
        </View>

        <View style={styles.publishRow}>
          <View
            style={[
              styles.publishBadge,
              room.isPublished ? styles.publishOn : styles.publishOff,
            ]}
          >
            <ThemedText
              type="small"
              style={
                room.isPublished ? styles.publishOnText : styles.publishOffText
              }
            >
              {room.isPublished ? "Đang hiển thị" : "Ẩn tin"}
            </ThemedText>
          </View>
          {room.maxOccupants ? (
            <ThemedText type="small" style={styles.occupants}>
              Tối đa {room.maxOccupants} người
            </ThemedText>
          ) : null}
        </View>

        <View style={styles.actionRow}>
          <Pressable style={styles.actionBtn} onPress={onEdit} disabled={busy}>
            <ThemedText type="smallBold" style={styles.actionBtnText}>
              Sửa
            </ThemedText>
          </Pressable>
          <Pressable
            style={[
              styles.actionBtn,
              room.isPublished ? styles.actionBtnMuted : styles.actionBtnPrimary,
            ]}
            onPress={onTogglePublish}
            disabled={busy}
          >
            {busy ? (
              <ActivityIndicator
                size="small"
                color={room.isPublished ? "#7A869A" : "#FFFFFF"}
              />
            ) : (
              <ThemedText
                type="smallBold"
                style={
                  room.isPublished
                    ? styles.actionBtnMutedText
                    : styles.actionBtnPrimaryText
                }
              >
                {room.isPublished ? "Ẩn tin" : "Đăng tin"}
              </ThemedText>
            )}
          </Pressable>
          <Pressable
            style={[styles.actionBtn, styles.actionBtnDanger]}
            onPress={onDelete}
            disabled={busy}
          >
            <ThemedText type="smallBold" style={styles.actionBtnDangerText}>
              Xóa
            </ThemedText>
          </Pressable>
        </View>
      </View>
    </View>
  );
}

function RoomFormModal({
  visible,
  editing,
  form,
  isSubmitting,
  onChange,
  onClose,
  onSubmit,
}: {
  visible: boolean;
  editing: boolean;
  form: FormState;
  isSubmitting: boolean;
  onChange: (next: FormState) => void;
  onClose: () => void;
  onSubmit: () => void;
}) {
  const insets = useSafeAreaInsets();

  const setField = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    onChange({ ...form, [key]: value });
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.modalBackdrop}>
        <KeyboardAvoidingView
          behavior={Platform.select({ ios: "padding", android: undefined })}
          style={styles.modalKeyboard}
        >
          <View
            style={[
              styles.modalSheet,
              { paddingBottom: Math.max(insets.bottom, 16) },
            ]}
          >
            <View style={styles.modalHeader}>
              <ThemedText type="smallBold" style={styles.modalTitle}>
                {editing ? "Cập nhật phòng" : "Thêm phòng mới"}
              </ThemedText>
              <Pressable onPress={onClose} hitSlop={10}>
                <Text style={styles.modalClose}>✕</Text>
              </Pressable>
            </View>

            <ScrollView
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
            >
              <Field label="Tên phòng" required>
                <TextInput
                  value={form.title}
                  onChangeText={(v) => setField("title", v)}
                  placeholder="VD: Phòng 203 - Sunrise House"
                  placeholderTextColor="#9AA3B2"
                  style={styles.input}
                />
              </Field>

              <Field label="Địa chỉ" required>
                <TextInput
                  value={form.address}
                  onChangeText={(v) => setField("address", v)}
                  placeholder="Số nhà, đường, phường/xã"
                  placeholderTextColor="#9AA3B2"
                  style={styles.input}
                />
              </Field>

              <Field label="Quận / Huyện">
                <TextInput
                  value={form.district}
                  onChangeText={(v) => setField("district", v)}
                  placeholder="VD: Quận 7"
                  placeholderTextColor="#9AA3B2"
                  style={styles.input}
                />
              </Field>

              <Field label="Loại phòng">
                <View style={styles.typeRow}>
                  {ROOM_TYPES.map((type) => {
                    const active = form.roomType === type;
                    return (
                      <Pressable
                        key={type}
                        onPress={() => setField("roomType", type)}
                        style={[styles.typeChip, active && styles.typeChipActive]}
                      >
                        <ThemedText
                          type="small"
                          style={[
                            styles.typeChipText,
                            active && styles.typeChipTextActive,
                          ]}
                        >
                          {roomTypeLabel(type)}
                        </ThemedText>
                      </Pressable>
                    );
                  })}
                </View>
              </Field>

              <View style={styles.formRow}>
                <View style={styles.formCol}>
                  <Field label="Giá thuê / tháng" required>
                    <TextInput
                      value={form.pricePerMonth}
                      onChangeText={(v) => setField("pricePerMonth", v)}
                      placeholder="3500000"
                      placeholderTextColor="#9AA3B2"
                      style={styles.input}
                      keyboardType="number-pad"
                    />
                  </Field>
                </View>
                <View style={styles.formCol}>
                  <Field label="Tiền cọc">
                    <TextInput
                      value={form.depositAmount}
                      onChangeText={(v) => setField("depositAmount", v)}
                      placeholder="3500000"
                      placeholderTextColor="#9AA3B2"
                      style={styles.input}
                      keyboardType="number-pad"
                    />
                  </Field>
                </View>
              </View>

              <View style={styles.formRow}>
                <View style={styles.formCol}>
                  <Field label="Số người tối đa" required>
                    <TextInput
                      value={form.maxOccupants}
                      onChangeText={(v) => setField("maxOccupants", v)}
                      placeholder="1"
                      placeholderTextColor="#9AA3B2"
                      style={styles.input}
                      keyboardType="number-pad"
                    />
                  </Field>
                </View>
                <View style={styles.formCol}>
                  <Field label="Diện tích (m²)">
                    <TextInput
                      value={form.areaSqm}
                      onChangeText={(v) => setField("areaSqm", v)}
                      placeholder="20"
                      placeholderTextColor="#9AA3B2"
                      style={styles.input}
                      keyboardType="number-pad"
                    />
                  </Field>
                </View>
              </View>

              <Field label="Mô tả">
                <TextInput
                  value={form.description}
                  onChangeText={(v) => setField("description", v)}
                  placeholder="Tiện ích, nội thất, quy định..."
                  placeholderTextColor="#9AA3B2"
                  style={[styles.input, styles.textArea]}
                  multiline
                  textAlignVertical="top"
                />
              </Field>

              <Pressable
                style={[
                  styles.submitButton,
                  isSubmitting && styles.submitButtonDisabled,
                ]}
                onPress={onSubmit}
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <ThemedText type="smallBold" style={styles.submitButtonText}>
                    {editing ? "Lưu thay đổi" : "Tạo phòng"}
                  </ThemedText>
                )}
              </Pressable>
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
}

function Field({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: ReactNode;
}) {
  return (
    <View style={styles.field}>
      <ThemedText type="smallBold" style={styles.fieldLabel}>
        {label}
        {required ? " *" : ""}
      </ThemedText>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#F7F6F2",
  },
  safeArea: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  header: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    marginBottom: 16,
    gap: 12,
  },
  pageTitle: {
    fontSize: 24,
    color: "#1F2940",
    marginBottom: 4,
  },
  pageSubtitle: {
    color: "#7A869A",
    lineHeight: 18,
  },
  addButton: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: "#E68A2E",
    alignItems: "center",
    justifyContent: "center",
  },
  addButtonIcon: {
    color: "#FFFFFF",
    fontSize: 28,
    lineHeight: 30,
    fontWeight: "300",
  },
  statsRow: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 14,
  },
  statCard: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: "#ECE7DF",
  },
  statLabel: {
    color: "#7A869A",
    fontSize: 10,
    marginBottom: 6,
  },
  statValue: {
    fontSize: 20,
    fontWeight: "800",
  },
  filterRow: {
    gap: 8,
    paddingBottom: 14,
  },
  filterChip: {
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 8,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#ECE7DF",
  },
  filterChipActive: {
    backgroundColor: "#FFF0DF",
    borderColor: "#E68A2E",
  },
  filterChipText: {
    color: "#7A869A",
  },
  filterChipTextActive: {
    color: "#C47A10",
  },
  emptyCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 28,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#ECE7DF",
  },
  emptyIcon: {
    fontSize: 40,
    marginBottom: 12,
  },
  emptyTitle: {
    fontSize: 17,
    color: "#1F2940",
    marginBottom: 8,
  },
  emptyText: {
    color: "#7A869A",
    textAlign: "center",
    lineHeight: 20,
    marginBottom: 16,
  },
  emptyButton: {
    backgroundColor: "#E68A2E",
    borderRadius: 10,
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  emptyButtonText: {
    color: "#FFFFFF",
  },
  roomCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    overflow: "hidden",
    marginBottom: 14,
    borderWidth: 1,
    borderColor: "#ECE7DF",
  },
  roomImage: {
    width: "100%",
    height: 150,
    backgroundColor: "#EDE6DC",
  },
  roomBody: {
    padding: 14,
  },
  roomTopRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
    marginBottom: 6,
  },
  roomTitle: {
    flex: 1,
    fontSize: 16,
    color: "#1F2940",
  },
  badge: {
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: "800",
    color: "#4B5568",
  },
  badgeAvailable: {
    backgroundColor: "#E2F5E8",
  },
  badgeRented: {
    backgroundColor: "#FFF0DF",
  },
  badgeMaintenance: {
    backgroundColor: "#FDECEC",
  },
  badgeMuted: {
    backgroundColor: "#F0EBE4",
  },
  roomMeta: {
    color: "#7A869A",
    lineHeight: 18,
    marginBottom: 8,
  },
  roomInfoRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  roomPrice: {
    color: "#E68A2E",
    fontSize: 16,
  },
  roomPriceUnit: {
    color: "#9AA3B2",
    fontWeight: "500",
  },
  roomType: {
    color: "#7A869A",
  },
  publishRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  publishBadge: {
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  publishOn: {
    backgroundColor: "#E8F0FF",
  },
  publishOff: {
    backgroundColor: "#F0EBE4",
  },
  publishOnText: {
    color: "#4B6CB7",
    fontSize: 11,
    fontWeight: "700",
  },
  publishOffText: {
    color: "#7A869A",
    fontSize: 11,
    fontWeight: "700",
  },
  occupants: {
    color: "#9AA3B2",
  },
  actionRow: {
    flexDirection: "row",
    gap: 8,
  },
  actionBtn: {
    flex: 1,
    minHeight: 38,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#ECE7DF",
    backgroundColor: "#FAFAF8",
  },
  actionBtnText: {
    color: "#4B5568",
  },
  actionBtnPrimary: {
    backgroundColor: "#E68A2E",
    borderColor: "#E68A2E",
  },
  actionBtnPrimaryText: {
    color: "#FFFFFF",
  },
  actionBtnMuted: {
    backgroundColor: "#FFFFFF",
  },
  actionBtnMutedText: {
    color: "#7A869A",
  },
  actionBtnDanger: {
    borderColor: "#F5D0D0",
    backgroundColor: "#FFF5F5",
  },
  actionBtnDangerText: {
    color: "#D14343",
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(31, 41, 64, 0.45)",
    justifyContent: "flex-end",
  },
  modalKeyboard: {
    maxHeight: "92%",
  },
  modalSheet: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 16,
    paddingTop: 14,
    maxHeight: "100%",
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  modalTitle: {
    fontSize: 18,
    color: "#1F2940",
  },
  modalClose: {
    fontSize: 20,
    color: "#7A869A",
  },
  field: {
    marginBottom: 12,
  },
  fieldLabel: {
    color: "#1F2940",
    marginBottom: 8,
  },
  input: {
    backgroundColor: "#FAFAF8",
    borderWidth: 1,
    borderColor: "#ECE7DF",
    borderRadius: 10,
    paddingHorizontal: 14,
    minHeight: 48,
    fontSize: 15,
    color: "#1F2940",
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
  },
  typeChip: {
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: "#ECE7DF",
    backgroundColor: "#FAFAF8",
  },
  typeChipActive: {
    borderColor: "#E68A2E",
    backgroundColor: "#FFF0DF",
  },
  typeChipText: {
    color: "#7A869A",
  },
  typeChipTextActive: {
    color: "#C47A10",
    fontWeight: "700",
  },
  formRow: {
    flexDirection: "row",
    gap: 10,
  },
  formCol: {
    flex: 1,
  },
  submitButton: {
    backgroundColor: "#E68A2E",
    borderRadius: 12,
    minHeight: 52,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 4,
    marginBottom: 8,
  },
  submitButtonDisabled: {
    opacity: 0.7,
  },
  submitButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
  },
});
