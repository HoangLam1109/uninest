import 'package:flutter/material.dart';
import 'favorites_store.dart';
import 'bottom_nav.dart';
import 'search_page.dart';
import 'detail_page.dart';

class SavedPage extends StatelessWidget {
  const SavedPage({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFF7F0E3),
      appBar: AppBar(
        backgroundColor: const Color(0xFFF7F0E3),
        elevation: 0,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back_rounded, color: Color(0xFF2F2721)),
          onPressed: () => Navigator.of(context).pushReplacement(
            MaterialPageRoute(
              builder: (_) => const SearchPage(initialIndex: 1),
            ),
          ),
        ),
        title: const Text(
          'Phòng đã lưu',
          style: TextStyle(
            color: Color(0xFF2F2721),
            fontWeight: FontWeight.w800,
          ),
        ),
        centerTitle: true,
      ),
      body: ValueListenableBuilder<Map<String, Map<String, String>>>(
        valueListenable: FavoriteStore.instance.items,
        builder: (context, items, _) {
          if (items.isEmpty) {
            return const Center(
              child: Text(
                'Bạn chưa lưu phòng nào',
                style: TextStyle(color: Color(0xFF6E6558)),
              ),
            );
          }

          return ListView.separated(
            padding: const EdgeInsets.fromLTRB(16, 12, 16, 28),
            itemCount: items.length,
            separatorBuilder: (_, __) => const SizedBox(height: 14),
            itemBuilder: (context, idx) {
              final key = items.keys.elementAt(idx);
              final data = items[key]!;
              return InkWell(
                borderRadius: BorderRadius.circular(14),
                onTap: () {
                  Navigator.of(context).push(
                    MaterialPageRoute(
                      builder: (_) => DetailPage(
                        title: key,
                        location: data['location'] ?? '',
                        price: data['price'] ?? '',
                        imageLabel: '1/1',
                      ),
                    ),
                  );
                },
                child: Card(
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(14),
                  ),
                  child: Padding(
                    padding: const EdgeInsets.all(12),
                    child: Row(
                      children: [
                        Container(
                          width: 96,
                          height: 72,
                          decoration: BoxDecoration(
                            borderRadius: BorderRadius.circular(12),
                            color: const Color(0xFFEFE8DC),
                          ),
                        ),
                        const SizedBox(width: 12),
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(
                                key,
                                style: const TextStyle(
                                  fontWeight: FontWeight.w800,
                                  fontSize: 16,
                                ),
                              ),
                              const SizedBox(height: 6),
                              Text(
                                data['location'] ?? '',
                                style: const TextStyle(
                                  color: Color(0xFF7A7064),
                                ),
                              ),
                              const SizedBox(height: 8),
                              Text(
                                '${data['price'] ?? ''}đ/tháng',
                                style: const TextStyle(
                                  color: Color(0xFFF09A2A),
                                  fontWeight: FontWeight.w800,
                                ),
                              ),
                            ],
                          ),
                        ),
                        IconButton(
                          onPressed: () => FavoriteStore.instance.remove(key),
                          icon: const Icon(Icons.delete_outline_rounded),
                        ),
                      ],
                    ),
                  ),
                ),
              );
            },
          );
        },
      ),
      bottomNavigationBar: const BottomNavBar(initialIndex: 2),
    );
  }
}
