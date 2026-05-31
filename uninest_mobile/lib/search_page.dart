import 'package:flutter/material.dart';

import 'detail_page.dart';
import 'home_page.dart';
import 'sample_apartments.dart';
import 'favorites_store.dart';
import 'saved_page.dart';
import 'bottom_nav.dart';

class SearchPage extends StatefulWidget {
  const SearchPage({super.key, this.initialIndex = 2});

  final int initialIndex;

  @override
  State<SearchPage> createState() => _SearchPageState();
}

class _SearchPageState extends State<SearchPage> {
  late int _selectedIndex;

  @override
  void initState() {
    super.initState();
    _selectedIndex = widget.initialIndex;
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFF4EEDF),
      body: SafeArea(
        child: Column(
          children: [
            Padding(
              padding: const EdgeInsets.fromLTRB(16, 8, 16, 0),
              child: Row(
                children: [
                  IconButton(
                    onPressed: () => Navigator.of(context).pop(),
                    icon: const Icon(Icons.arrow_back_rounded),
                  ),
                  const Expanded(
                    child: Text(
                      'Tìm UniNest của bạn',
                      textAlign: TextAlign.center,
                      style: TextStyle(
                        fontSize: 20,
                        fontWeight: FontWeight.w800,
                        color: Color(0xFF2F2721),
                      ),
                    ),
                  ),
                  IconButton(
                    onPressed: () {},
                    icon: const Icon(Icons.notifications_none_rounded),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 8),
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 16),
              child: Container(
                padding: const EdgeInsets.symmetric(
                  horizontal: 14,
                  vertical: 12,
                ),
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(18),
                  boxShadow: const [
                    BoxShadow(
                      color: Color(0x14000000),
                      blurRadius: 14,
                      offset: Offset(0, 6),
                    ),
                  ],
                ),
                child: const Row(
                  children: [
                    Icon(Icons.search_rounded, color: Color(0xFF8A7E6E)),
                    SizedBox(width: 10),
                    Expanded(
                      child: Text(
                        'Đại học Kinh tế TP.HCM',
                        style: TextStyle(
                          fontSize: 16,
                          fontWeight: FontWeight.w600,
                          color: Color(0xFF3F362D),
                        ),
                      ),
                    ),
                    Icon(Icons.tune_rounded, color: Color(0xFFF09A2A)),
                  ],
                ),
              ),
            ),
            const SizedBox(height: 12),
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 16),
              child: SingleChildScrollView(
                scrollDirection: Axis.horizontal,
                child: Row(
                  children: const [
                    _FilterChip(label: 'Ngân sách'),
                    SizedBox(width: 8),
                    _FilterChip(label: 'Khoảng cách'),
                    SizedBox(width: 8),
                    _FilterChip(label: 'Loại phòng'),
                  ],
                ),
              ),
            ),
            const SizedBox(height: 14),
            const Divider(height: 1, color: Color(0xFFE2D8C8)),
            Padding(
              padding: const EdgeInsets.fromLTRB(16, 16, 16, 0),
              child: Container(
                padding: const EdgeInsets.all(6),
                decoration: BoxDecoration(
                  color: const Color(0xFFEFE8DC),
                  borderRadius: BorderRadius.circular(16),
                ),
                child: Row(
                  children: [
                    Expanded(
                      child: Container(
                        padding: const EdgeInsets.symmetric(vertical: 10),
                        decoration: BoxDecoration(
                          color: Colors.white,
                          borderRadius: BorderRadius.circular(12),
                        ),
                        child: const Row(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            Icon(
                              Icons.grid_view_rounded,
                              size: 18,
                              color: Color(0xFF2F2721),
                            ),
                            SizedBox(width: 8),
                            Text(
                              'DANG LƯỚI',
                              style: TextStyle(
                                fontSize: 14,
                                fontWeight: FontWeight.w800,
                                color: Color(0xFF2F2721),
                              ),
                            ),
                          ],
                        ),
                      ),
                    ),
                    Expanded(
                      child: Container(
                        padding: const EdgeInsets.symmetric(vertical: 10),
                        child: const Row(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            Icon(
                              Icons.map_outlined,
                              size: 18,
                              color: Color(0xFF9A8B78),
                            ),
                            SizedBox(width: 8),
                            Text(
                              'BẢN ĐỒ',
                              style: TextStyle(
                                fontSize: 14,
                                fontWeight: FontWeight.w700,
                                color: Color(0xFF9A8B78),
                              ),
                            ),
                          ],
                        ),
                      ),
                    ),
                  ],
                ),
              ),
            ),
            const SizedBox(height: 12),
            const Padding(
              padding: EdgeInsets.symmetric(horizontal: 16),
              child: Align(
                alignment: Alignment.centerLeft,
                child: Text(
                  'Hiển thị 128 căn hộ gần ĐH Kinh tế',
                  style: TextStyle(
                    fontSize: 14,
                    color: Color(0xFF8B7C69),
                    fontWeight: FontWeight.w500,
                  ),
                ),
              ),
            ),
            const SizedBox(height: 12),
            Expanded(
              child: ListView(
                padding: const EdgeInsets.fromLTRB(16, 0, 16, 12),
                children: [
                  for (final apt in featuredApartments) ...[
                    _SearchResultCard(
                      label: apt.badge.toUpperCase(),
                      title: apt.title,
                      price: apt.price,
                      location: apt.subtitle,
                      amenities: apt.amenities,
                      onTap: () {
                        Navigator.of(context).push(
                          MaterialPageRoute(
                            builder: (_) => DetailPage(
                              title: apt.title,
                              location: apt.subtitle,
                              price: apt.price,
                              imageLabel: '1/1',
                            ),
                          ),
                        );
                      },
                    ),
                    const SizedBox(height: 16),
                  ],
                  _SearchResultCard(
                    label: 'ĐÃ XÁC MINH',
                    title: 'Căn hộ Landmark',
                    price: '8.500.000',
                    location: 'Quận 1, cách cơ sở 0.4 km',
                    amenities: const [
                      'WiFi miễn phí',
                      'Phòng gym',
                      'Sân thượng',
                    ],
                    onTap: () {
                      Navigator.of(context).push(
                        MaterialPageRoute(
                          builder: (_) => const DetailPage(
                            title: 'Phòng Studio Cao cấp UniNest',
                            location: '123 Đại Lộ Võ Văn Kiệt, Quận 1, TP.HCM',
                            price: '8.500.000',
                            imageLabel: '1/12',
                          ),
                        ),
                      );
                    },
                  ),
                  const SizedBox(height: 16),
                  _SearchResultCard(
                    label: 'ĐÃ XÁC MINH',
                    title: 'Phòng trọ St. Pancras',
                    price: '6.200.000',
                    location: 'Quận 7, gần RMIT (0.9 km)',
                    amenities: const ['Bao gồm điện nước', 'Giặt ủi'],
                    onTap: () {
                      Navigator.of(context).push(
                        MaterialPageRoute(
                          builder: (_) => const DetailPage(
                            title: 'Phòng Studio Cao cấp UniNest',
                            location: '123 Đại Lộ Võ Văn Kiệt, Quận 1, TP.HCM',
                            price: '6.200.000',
                            imageLabel: '1/12',
                          ),
                        ),
                      );
                    },
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
      bottomNavigationBar: BottomNavBar(initialIndex: widget.initialIndex),
    );
  }
}

class _FilterChip extends StatelessWidget {
  const _FilterChip({required this.label});

  final String label;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(999),
        border: Border.all(color: const Color(0xFFE6DCCC)),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Text(
            label,
            style: const TextStyle(
              fontSize: 13,
              fontWeight: FontWeight.w700,
              color: Color(0xFF4B4237),
            ),
          ),
          const SizedBox(width: 4),
          const Icon(
            Icons.keyboard_arrow_down_rounded,
            size: 18,
            color: Color(0xFF8B857C),
          ),
        ],
      ),
    );
  }
}

class _SearchResultCard extends StatelessWidget {
  const _SearchResultCard({
    required this.label,
    required this.title,
    required this.price,
    required this.location,
    required this.amenities,
    required this.onTap,
  });

  final String label;
  final String title;
  final String price;
  final String location;
  final List<String> amenities;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    final card = Container(
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(18),
        boxShadow: const [
          BoxShadow(
            color: Color(0x10000000),
            blurRadius: 16,
            offset: Offset(0, 6),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Container(
            height: 210,
            decoration: const BoxDecoration(
              borderRadius: BorderRadius.vertical(top: Radius.circular(18)),
              gradient: LinearGradient(
                begin: Alignment.topLeft,
                end: Alignment.bottomRight,
                colors: [Color(0xFFB8AEA3), Color(0xFFF0ECE7)],
              ),
            ),
            child: Stack(
              children: [
                Positioned(left: 12, top: 12, child: _CardBadge(text: label)),
                Positioned(
                  right: 12,
                  top: 12,
                  child:
                      ValueListenableBuilder<Map<String, Map<String, String>>>(
                        valueListenable: FavoriteStore.instance.items,
                        builder: (context, items, _) {
                          final saved = items.containsKey(title);
                          return GestureDetector(
                            onTap: () {
                              FavoriteStore.instance.toggle(title, {
                                'price': price,
                                'location': location,
                                'label': label,
                              });
                            },
                            child: CircleAvatar(
                              radius: 16,
                              backgroundColor: const Color(0x66FFFFFF),
                              child: Icon(
                                saved
                                    ? Icons.favorite_rounded
                                    : Icons.favorite_border_rounded,
                                size: 18,
                                color: saved
                                    ? const Color(0xFFF09A2A)
                                    : Colors.white,
                              ),
                            ),
                          );
                        },
                      ),
                ),
              ],
            ),
          ),
          Padding(
            padding: const EdgeInsets.fromLTRB(16, 14, 16, 16),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Expanded(
                      child: Text(
                        title,
                        style: const TextStyle(
                          fontSize: 20,
                          fontWeight: FontWeight.w800,
                          color: Color(0xFF2F2721),
                        ),
                      ),
                    ),
                    const SizedBox(width: 8),
                    Text(
                      '$priceđ/tháng',
                      style: const TextStyle(
                        fontSize: 18,
                        fontWeight: FontWeight.w800,
                        color: Color(0xFFF09A2A),
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 8),
                Text(
                  location,
                  style: const TextStyle(
                    fontSize: 14,
                    color: Color(0xFF7A7064),
                  ),
                ),
                const SizedBox(height: 12),
                const Divider(height: 1, color: Color(0xFFECE3D7)),
                const SizedBox(height: 12),
                Wrap(
                  spacing: 14,
                  runSpacing: 8,
                  children: amenities
                      .map(
                        (amenity) => Text(
                          amenity,
                          style: const TextStyle(
                            fontSize: 13,
                            fontWeight: FontWeight.w600,
                            color: Color(0xFF7A7064),
                          ),
                        ),
                      )
                      .toList(),
                ),
              ],
            ),
          ),
        ],
      ),
    );

    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(18),
      child: card,
    );
  }
}

class _CardBadge extends StatelessWidget {
  const _CardBadge({required this.text});

  final String text;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
      decoration: BoxDecoration(
        color: const Color(0xFFF8F2E8),
        borderRadius: BorderRadius.circular(999),
      ),
      child: Text(
        text,
        style: const TextStyle(
          fontSize: 11,
          fontWeight: FontWeight.w800,
          color: Color(0xFF4E4335),
        ),
      ),
    );
  }
}
