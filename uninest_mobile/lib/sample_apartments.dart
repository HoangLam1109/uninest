import 'package:flutter/material.dart';

class Apartment {
  const Apartment({
    required this.badge,
    required this.title,
    required this.price,
    required this.priceSuffix,
    required this.subtitle,
    required this.amenities,
    required this.accent,
    required this.imageTone,
    required this.iconTint,
  });

  final String badge;
  final String title;
  final String price;
  final String priceSuffix;
  final String subtitle;
  final List<String> amenities;
  final Color accent;
  final Color imageTone;
  final Color iconTint;
}

const featuredApartments = <Apartment>[
  Apartment(
    badge: 'Xác thực',
    title: 'Căn hộ The Scholar - Quận 1',
    price: '15.000.000',
    priceSuffix: '/tháng',
    subtitle: '5 phút đi bộ đến ĐH KXH&NV',
    amenities: ['1 PN', '1 PT', 'WiFi miễn phí'],
    accent: Color(0xFFD9B16F),
    imageTone: Color(0xFFF3D9A9),
    iconTint: Color(0xFFF08F1A),
  ),
  Apartment(
    badge: 'Giảm giá sinh viên',
    title: 'Khu tập thể Greenfield - Thủ Đức',
    price: '8.500.000',
    priceSuffix: '/tháng',
    subtitle: '10 phút xe buýt đến ĐH Bách Khoa',
    amenities: ['Ở chung', 'Bếp chung', 'Giặt ủi'],
    accent: Color(0xFFBFA58A),
    imageTone: Color(0xFFDDD2C0),
    iconTint: Color(0xFFF08F1A),
  ),
  Apartment(
    badge: 'Phổ biến',
    title: 'Skyline Lofts - Bình Thạnh',
    price: '18.000.000',
    priceSuffix: '/tháng',
    subtitle: 'Trung tâm thành phố',
    amenities: ['Gym', 'Sân thượng', 'Bảo vệ 24/7'],
    accent: Color(0xFFC08A4D),
    imageTone: Color(0xFFE0C18B),
    iconTint: Color(0xFFF08F1A),
  ),
];
