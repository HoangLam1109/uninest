import 'package:flutter/foundation.dart';

class FavoriteStore {
  FavoriteStore._();

  static final FavoriteStore instance = FavoriteStore._();

  // key -> data map (title used as key for simplicity)
  final ValueNotifier<Map<String, Map<String, String>>> items =
      ValueNotifier<Map<String, Map<String, String>>>({});

  bool contains(String key) => items.value.containsKey(key);

  void add(String key, Map<String, String> data) {
    final m = Map<String, Map<String, String>>.from(items.value);
    m[key] = data;
    items.value = m;
  }

  void remove(String key) {
    final m = Map<String, Map<String, String>>.from(items.value);
    m.remove(key);
    items.value = m;
  }

  void toggle(String key, Map<String, String> data) {
    if (contains(key)) {
      remove(key);
    } else {
      add(key, data);
    }
  }
}
