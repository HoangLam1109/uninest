import { useMemo, useState } from "react";
import {
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { ThemedText } from "@/components/themed-text";

const WEEKDAYS = ["CN", "T2", "T3", "T4", "T5", "T6", "T7"];

function startOfDay(date: Date) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

function isSameDay(a: Date, b: Date) {
  return startOfDay(a).getTime() === startOfDay(b).getTime();
}

function parseDateInput(value: string): Date | null {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value.trim())) return null;
  const date = new Date(`${value.trim()}T00:00:00.000`);
  return Number.isNaN(date.getTime()) ? null : date;
}

function formatDateInput(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function formatDateDisplay(value: string) {
  const date = parseDateInput(value);
  if (!date) return "";
  return date.toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

function formatMonthTitle(date: Date) {
  return `Tháng ${date.getMonth() + 1} ${date.getFullYear()}`;
}

function buildCalendarCells(viewMonth: Date): (Date | null)[] {
  const year = viewMonth.getFullYear();
  const month = viewMonth.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells: (Date | null)[] = [];

  for (let i = 0; i < firstDay; i += 1) {
    cells.push(null);
  }
  for (let day = 1; day <= daysInMonth; day += 1) {
    cells.push(new Date(year, month, day));
  }
  while (cells.length % 7 !== 0) {
    cells.push(null);
  }
  return cells;
}

function isBeforeDay(date: Date, min?: Date) {
  if (!min) return false;
  return startOfDay(date) < startOfDay(min);
}

function isAfterDay(date: Date, max?: Date) {
  if (!max) return false;
  return startOfDay(date) > startOfDay(max);
}

type DatePickerFieldProps = {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  minimumDate?: Date;
  maximumDate?: Date;
};

export function DatePickerField({
  label,
  value,
  onChange,
  placeholder = "Chọn ngày",
  minimumDate,
  maximumDate,
}: DatePickerFieldProps) {
  const parsed = parseDateInput(value);
  const [open, setOpen] = useState(false);
  const [viewMonth, setViewMonth] = useState(() => {
    const base = parsed ?? minimumDate ?? new Date();
    return new Date(base.getFullYear(), base.getMonth(), 1);
  });
  const [draftDate, setDraftDate] = useState<Date | null>(parsed);

  const calendarCells = useMemo(() => buildCalendarCells(viewMonth), [viewMonth]);
  const displayText = formatDateDisplay(value);

  const openPicker = () => {
    const base = parsed ?? minimumDate ?? new Date();
    setViewMonth(new Date(base.getFullYear(), base.getMonth(), 1));
    setDraftDate(parsed);
    setOpen(true);
  };

  const confirmSelection = () => {
    if (draftDate) {
      onChange(formatDateInput(draftDate));
    }
    setOpen(false);
  };

  const clearSelection = () => {
    onChange("");
    setDraftDate(null);
    setOpen(false);
  };

  return (
    <View style={styles.field}>
      <ThemedText type="smallBold" style={styles.label}>
        {label}
      </ThemedText>
      <Pressable style={styles.trigger} onPress={openPicker}>
        <Text style={[styles.triggerText, !displayText && styles.placeholder]}>
          {displayText || placeholder}
        </Text>
        <Text style={styles.triggerIcon}>📅</Text>
      </Pressable>

      <Modal visible={open} transparent animationType="fade" onRequestClose={() => setOpen(false)}>
        <Pressable style={styles.overlay} onPress={() => setOpen(false)}>
          <Pressable style={styles.sheet} onPress={(event) => event.stopPropagation()}>
            <ThemedText type="smallBold" style={styles.sheetTitle}>
              {label}
            </ThemedText>

            <View style={styles.calendarHeader}>
              <Pressable
                style={styles.chevronButton}
                onPress={() =>
                  setViewMonth((prev) => new Date(prev.getFullYear(), prev.getMonth() - 1, 1))
                }
              >
                <Text style={styles.chevronText}>‹</Text>
              </Pressable>
              <ThemedText type="smallBold" style={styles.monthTitle}>
                {formatMonthTitle(viewMonth)}
              </ThemedText>
              <Pressable
                style={styles.chevronButton}
                onPress={() =>
                  setViewMonth((prev) => new Date(prev.getFullYear(), prev.getMonth() + 1, 1))
                }
              >
                <Text style={styles.chevronText}>›</Text>
              </Pressable>
            </View>

            <View style={styles.weekRow}>
              {WEEKDAYS.map((day) => (
                <Text key={day} style={styles.weekText}>
                  {day}
                </Text>
              ))}
            </View>

            <View style={styles.grid}>
              {calendarCells.map((date, index) => {
                if (!date) {
                  return <View key={`empty-${index}`} style={styles.dayCell} />;
                }
                const selected = draftDate ? isSameDay(date, draftDate) : false;
                const disabled =
                  isBeforeDay(date, minimumDate) || isAfterDay(date, maximumDate);
                return (
                  <Pressable
                    key={date.toISOString()}
                    style={[styles.dayCell, selected && styles.dayCellSelected]}
                    disabled={disabled}
                    onPress={() => setDraftDate(date)}
                  >
                    <Text
                      style={[
                        styles.dayText,
                        disabled && styles.dayTextMuted,
                        selected && styles.dayTextSelected,
                      ]}
                    >
                      {date.getDate()}
                    </Text>
                  </Pressable>
                );
              })}
            </View>

            <View style={styles.actions}>
              <Pressable style={styles.secondaryBtn} onPress={clearSelection}>
                <Text style={styles.secondaryBtnText}>Xóa</Text>
              </Pressable>
              <Pressable
                style={[styles.primaryBtn, !draftDate && styles.primaryBtnDisabled]}
                disabled={!draftDate}
                onPress={confirmSelection}
              >
                <Text style={styles.primaryBtnText}>Chọn</Text>
              </Pressable>
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  field: { gap: 6 },
  label: { color: "#1F2940", marginBottom: 4 },
  trigger: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E8E1D8",
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  triggerText: {
    color: "#1F2940",
    fontSize: 15,
  },
  placeholder: {
    color: "#A89888",
  },
  triggerIcon: {
    fontSize: 18,
  },
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.45)",
    justifyContent: "center",
    paddingHorizontal: 20,
  },
  sheet: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
  },
  sheetTitle: {
    color: "#1F2940",
    fontSize: 16,
    marginBottom: 12,
    textAlign: "center",
  },
  calendarHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  chevronButton: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: "center",
    justifyContent: "center",
  },
  chevronText: {
    color: "#1F2940",
    fontSize: 24,
    fontWeight: "700",
  },
  monthTitle: {
    color: "#1F2940",
    fontSize: 16,
  },
  weekRow: {
    flexDirection: "row",
    marginBottom: 8,
  },
  weekText: {
    width: "14.28%",
    textAlign: "center",
    color: "#9AA3B2",
    fontSize: 12,
    fontWeight: "700",
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  dayCell: {
    width: "14.28%",
    aspectRatio: 1,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 6,
  },
  dayCellSelected: {
    backgroundColor: "#E68A2E",
    borderRadius: 18,
  },
  dayText: {
    color: "#1F2940",
    fontSize: 15,
    fontWeight: "700",
  },
  dayTextMuted: {
    color: "#D1D5DB",
  },
  dayTextSelected: {
    color: "#FFFFFF",
  },
  actions: {
    flexDirection: "row",
    gap: 10,
    marginTop: 12,
  },
  secondaryBtn: {
    flex: 1,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#E8E1D8",
    paddingVertical: 12,
    alignItems: "center",
  },
  secondaryBtnText: {
    color: "#6B7280",
    fontWeight: "700",
  },
  primaryBtn: {
    flex: 1,
    borderRadius: 10,
    backgroundColor: "#E68A2E",
    paddingVertical: 12,
    alignItems: "center",
  },
  primaryBtnDisabled: {
    opacity: 0.5,
  },
  primaryBtnText: {
    color: "#FFFFFF",
    fontWeight: "700",
  },
});
