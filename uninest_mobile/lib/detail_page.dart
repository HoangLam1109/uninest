import 'package:flutter/material.dart';
import 'booking_page.dart';

class DetailPage extends StatelessWidget {
  const DetailPage({
    super.key,
    required this.title,
    required this.location,
    required this.price,
    required this.imageLabel,
    this.galleryCount = 12,
  });

  final String title;
  final String location;
  final String price;
  final String imageLabel;
  final int galleryCount;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFF7F1E8),
      bottomNavigationBar: _StickyBookingBar(price: price),
      body: SafeArea(
        child: SingleChildScrollView(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Padding(
                padding: const EdgeInsets.fromLTRB(12, 8, 12, 12),
                child: Row(
                  children: [
                    IconButton(
                      onPressed: () => Navigator.of(context).pop(),
                      icon: const Icon(Icons.arrow_back_rounded),
                    ),
                    const SizedBox(width: 8),
                    const Expanded(
                      child: Text(
                        'Chi tiết phòng',
                        textAlign: TextAlign.center,
                        style: TextStyle(
                          fontSize: 20,
                          fontWeight: FontWeight.w800,
                          color: Color(0xFF2F2721),
                          fontFamily: 'Georgia',
                        ),
                      ),
                    ),
                    IconButton(
                      onPressed: () {},
                      icon: const Icon(Icons.share_outlined),
                    ),
                  ],
                ),
              ),
              Padding(
                padding: const EdgeInsets.symmetric(horizontal: 12),
                child: Stack(
                  children: [
                    Container(
                      height: 420,
                      decoration: BoxDecoration(
                        borderRadius: BorderRadius.circular(18),
                        gradient: const LinearGradient(
                          begin: Alignment.topCenter,
                          end: Alignment.bottomCenter,
                          colors: [Color(0xFFE3DDD0), Color(0xFFBFAF99)],
                        ),
                        boxShadow: const [
                          BoxShadow(
                            color: Color(0x22000000),
                            blurRadius: 20,
                            offset: Offset(0, 10),
                          ),
                        ],
                      ),
                      child: Stack(
                        children: [
                          Positioned.fill(
                            child: ClipRRect(
                              borderRadius: BorderRadius.circular(18),
                              child: _RoomHeroIllustration(label: imageLabel),
                            ),
                          ),
                          Positioned(
                            right: 12,
                            top: 12,
                            child: Container(
                              padding: const EdgeInsets.symmetric(
                                horizontal: 10,
                                vertical: 6,
                              ),
                              decoration: BoxDecoration(
                                color: Colors.white.withValues(alpha: 0.9),
                                borderRadius: BorderRadius.circular(999),
                              ),
                              child: Row(
                                mainAxisSize: MainAxisSize.min,
                                children: [
                                  const Icon(
                                    Icons.photo_library_outlined,
                                    size: 16,
                                  ),
                                  const SizedBox(width: 4),
                                  Text(
                                    '1/$galleryCount',
                                    style: const TextStyle(
                                      fontSize: 12,
                                      fontWeight: FontWeight.w800,
                                      color: Color(0xFF2F2721),
                                    ),
                                  ),
                                ],
                              ),
                            ),
                          ),
                          Positioned(
                            left: 0,
                            right: 0,
                            bottom: 12,
                            child: Row(
                              mainAxisAlignment: MainAxisAlignment.center,
                              children: List.generate(
                                4,
                                (index) => Container(
                                  width: 8,
                                  height: 8,
                                  margin: const EdgeInsets.symmetric(
                                    horizontal: 4,
                                  ),
                                  decoration: BoxDecoration(
                                    color: index == 0
                                        ? Colors.white
                                        : Colors.white.withValues(alpha: 0.45),
                                    shape: BoxShape.circle,
                                  ),
                                ),
                              ),
                            ),
                          ),
                        ],
                      ),
                    ),
                    Positioned(
                      left: 16,
                      top: 16,
                      child: _Badge(
                        icon: Icons.verified_outlined,
                        label: 'VERIFIED LISTING',
                        background: const Color(0xFFF8EFD8),
                        foreground: const Color(0xFFF08F1A),
                      ),
                    ),
                    Positioned(
                      left: 16,
                      top: 60,
                      child: _Badge(
                        icon: Icons.flash_on_rounded,
                        label: 'ĐẶT PHÒNG NHANH',
                        background: const Color(0xFFE9F7EA),
                        foreground: const Color(0xFF5FA856),
                      ),
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 20),
              Padding(
                padding: const EdgeInsets.symmetric(horizontal: 16),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      title,
                      style: Theme.of(context).textTheme.headlineMedium
                          ?.copyWith(
                            fontSize: 28,
                            height: 1.05,
                            fontWeight: FontWeight.w800,
                            color: const Color(0xFF2F2721),
                            fontFamily: 'Georgia',
                          ),
                    ),
                    const SizedBox(height: 10),
                    Row(
                      children: [
                        const Icon(
                          Icons.place_outlined,
                          size: 18,
                          color: Color(0xFF7687A8),
                        ),
                        const SizedBox(width: 6),
                        Expanded(
                          child: Text(
                            location,
                            style: const TextStyle(
                              fontSize: 16,
                              color: Color(0xFF7687A8),
                              fontWeight: FontWeight.w600,
                            ),
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 18),
                    const Divider(height: 1, color: Color(0xFFE4DCCF)),
                    const SizedBox(height: 18),
                    const Text(
                      'Về không gian này',
                      style: TextStyle(
                        fontSize: 22,
                        fontWeight: FontWeight.w800,
                        color: Color(0xFF2F2721),
                        fontFamily: 'Georgia',
                      ),
                    ),
                    const SizedBox(height: 12),
                    const Text(
                      'Căn hộ studio hiện đại, đầy đủ nội thất được thiết kế riêng cho cuộc sống sinh viên. Vị trí đắc địa, chỉ cách thư viện chính 5 phút đi bộ. Internet tốc độ cao, không gian làm việc yên tĩnh và tất cả các chi phí tiện ích đã bao gồm trong giá thuê hàng tháng.',
                      style: TextStyle(
                        fontSize: 16,
                        height: 1.55,
                        color: Color(0xFF4C5B76),
                      ),
                    ),
                    const SizedBox(height: 28),
                    const Text(
                      'Tiện ích',
                      style: TextStyle(
                        fontSize: 22,
                        fontWeight: FontWeight.w800,
                        color: Color(0xFF2F2721),
                        fontFamily: 'Georgia',
                      ),
                    ),
                    const SizedBox(height: 14),
                    GridView.count(
                      crossAxisCount: 2,
                      crossAxisSpacing: 12,
                      mainAxisSpacing: 12,
                      shrinkWrap: true,
                      physics: const NeverScrollableScrollPhysics(),
                      childAspectRatio: 2.2,
                      children: const [
                        _AmenityCard(
                          icon: Icons.wifi_rounded,
                          title: 'Wi-Fi Tốc độ cao',
                        ),
                        _AmenityCard(
                          icon: Icons.ac_unit_rounded,
                          title: 'Điều hòa nhiệt độ',
                        ),
                        _AmenityCard(
                          icon: Icons.local_parking_rounded,
                          title: 'Chỗ đậu xe miễn phí',
                        ),
                        _AmenityCard(
                          icon: Icons.local_laundry_service_rounded,
                          title: 'Máy giặt riêng',
                        ),
                        _AmenityCard(
                          icon: Icons.kitchen_rounded,
                          title: 'Bếp đầy đủ tiện nghi',
                        ),
                        _AmenityCard(
                          icon: Icons.desk_rounded,
                          title: 'Bàn học tập',
                        ),
                      ],
                    ),
                    const SizedBox(height: 30),
                    const _HostAndLocationSection(),
                    const SizedBox(height: 30),
                    _BookingSummaryCard(price: price),
                    const SizedBox(height: 24),
                  ],
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class _RoomHeroIllustration extends StatelessWidget {
  const _RoomHeroIllustration({required this.label});

  final String label;

  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: const BoxDecoration(
        gradient: LinearGradient(
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
          colors: [Color(0xFFF3EEE7), Color(0xFFD6C6B2)],
        ),
      ),
      child: Stack(
        children: [
          Positioned(
            left: 0,
            top: 0,
            bottom: 0,
            child: Container(width: 34, color: const Color(0xB8D7CCBD)),
          ),
          Positioned(
            left: 36,
            bottom: 0,
            right: 0,
            child: Container(height: 92, color: const Color(0x7A8A6F4F)),
          ),
          Positioned(
            left: 84,
            top: 48,
            right: 84,
            bottom: 94,
            child: Container(
              decoration: BoxDecoration(
                color: Colors.white.withValues(alpha: 0.45),
                borderRadius: BorderRadius.circular(12),
                border: Border.all(color: const Color(0x55FFFFFF)),
              ),
              child: Center(
                child: Text(
                  label,
                  style: const TextStyle(
                    fontSize: 40,
                    fontWeight: FontWeight.w800,
                    color: Color(0x66FFFFFF),
                  ),
                ),
              ),
            ),
          ),
          Positioned(
            right: 42,
            top: 120,
            child: Container(
              width: 92,
              height: 112,
              decoration: BoxDecoration(
                color: const Color(0xFFB89B74).withValues(alpha: 0.52),
                borderRadius: BorderRadius.circular(8),
              ),
            ),
          ),
        ],
      ),
    );
  }
}

class _Badge extends StatelessWidget {
  const _Badge({
    required this.icon,
    required this.label,
    required this.background,
    required this.foreground,
  });

  final IconData icon;
  final String label;
  final Color background;
  final Color foreground;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
      decoration: BoxDecoration(
        color: background,
        borderRadius: BorderRadius.circular(999),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(icon, size: 14, color: foreground),
          const SizedBox(width: 4),
          Text(
            label,
            style: TextStyle(
              fontSize: 11,
              fontWeight: FontWeight.w800,
              color: foreground,
            ),
          ),
        ],
      ),
    );
  }
}

class _AmenityCard extends StatelessWidget {
  const _AmenityCard({required this.icon, required this.title});

  final IconData icon;
  final String title;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: const Color(0xFFF9F5EF),
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: const Color(0xFFF0E7DB)),
      ),
      child: Row(
        children: [
          Icon(icon, color: const Color(0xFFF09A2A), size: 22),
          const SizedBox(width: 10),
          Expanded(
            child: Text(
              title,
              style: const TextStyle(
                fontSize: 14,
                fontWeight: FontWeight.w700,
                color: Color(0xFF2F2721),
              ),
            ),
          ),
        ],
      ),
    );
  }
}

class _HostAndLocationSection extends StatelessWidget {
  const _HostAndLocationSection();

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Container(
          width: double.infinity,
          padding: const EdgeInsets.all(18),
          decoration: BoxDecoration(
            color: const Color(0xFFF5EFE4),
            borderRadius: BorderRadius.circular(20),
            border: Border.all(color: const Color(0xFFE9DFC9)),
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Container(
                    width: 56,
                    height: 56,
                    decoration: BoxDecoration(
                      color: const Color(0xFF1E313C),
                      shape: BoxShape.circle,
                      border: Border.all(color: Colors.white, width: 2),
                    ),
                    child: const Icon(
                      Icons.person_rounded,
                      color: Colors.white,
                      size: 30,
                    ),
                  ),
                  const SizedBox(width: 14),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          'Chủ nhà: Nguyễn\nVăn A',
                          style: Theme.of(context).textTheme.titleLarge
                              ?.copyWith(
                                fontSize: 24,
                                height: 1.15,
                                fontWeight: FontWeight.w800,
                                color: const Color(0xFF2F2721),
                                fontFamily: 'Georgia',
                              ),
                        ),
                        const SizedBox(height: 6),
                        Text(
                          'Chủ nhà đã xác minh • 3 năm kinh nghiệm',
                          style: Theme.of(context).textTheme.bodyMedium
                              ?.copyWith(
                                fontSize: 15,
                                height: 1.35,
                                color: const Color(0xFF768095),
                                fontWeight: FontWeight.w500,
                              ),
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(width: 12),
                  Column(
                    crossAxisAlignment: CrossAxisAlignment.end,
                    children: const [
                      Row(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          Icon(
                            Icons.star_border_rounded,
                            color: Color(0xFFF08F1A),
                            size: 28,
                          ),
                          SizedBox(width: 4),
                          Text(
                            '4.9',
                            style: TextStyle(
                              fontSize: 18,
                              fontWeight: FontWeight.w800,
                              color: Color(0xFFF08F1A),
                            ),
                          ),
                        ],
                      ),
                      SizedBox(height: 4),
                      Text(
                        '128 đánh\ngiá',
                        textAlign: TextAlign.right,
                        style: TextStyle(
                          fontSize: 13,
                          height: 1.0,
                          fontWeight: FontWeight.w500,
                          color: Color(0xFF5F6C84),
                        ),
                      ),
                    ],
                  ),
                ],
              ),
              const SizedBox(height: 16),
              const Text(
                '"Tôi mong muốn mang đến trải nghiệm lưu trú tốt nhất cho sinh viên tại thành phố. Phản hồi nhanh chóng và duy trì cơ sở vật chất luôn là ưu tiên hàng đầu của tôi."',
                style: TextStyle(
                  fontSize: 15,
                  height: 1.55,
                  color: Color(0xFF5F6274),
                ),
              ),
              const SizedBox(height: 18),
              SizedBox(
                width: double.infinity,
                height: 48,
                child: OutlinedButton(
                  onPressed: () {},
                  style: OutlinedButton.styleFrom(
                    foregroundColor: const Color(0xFFF08F1A),
                    side: const BorderSide(
                      color: Color(0xFFF08F1A),
                      width: 1.6,
                    ),
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(12),
                    ),
                  ),
                  child: const Text(
                    'Liên hệ chủ nhà',
                    style: TextStyle(fontSize: 16, fontWeight: FontWeight.w800),
                  ),
                ),
              ),
            ],
          ),
        ),
        const SizedBox(height: 28),
        const Text(
          'Vị trí',
          style: TextStyle(
            fontSize: 28,
            fontWeight: FontWeight.w800,
            color: Color(0xFF2F2721),
            fontFamily: 'Georgia',
          ),
        ),
        const SizedBox(height: 16),
        Container(
          width: double.infinity,
          height: 318,
          decoration: BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.circular(20),
            boxShadow: const [
              BoxShadow(
                color: Color(0x16000000),
                blurRadius: 22,
                offset: Offset(0, 10),
              ),
            ],
          ),
          child: ClipRRect(
            borderRadius: BorderRadius.circular(20),
            child: Stack(
              children: [
                Positioned.fill(
                  child: DecoratedBox(
                    decoration: BoxDecoration(
                      gradient: LinearGradient(
                        begin: Alignment.topLeft,
                        end: Alignment.bottomRight,
                        colors: [
                          const Color(0xFFF5FAF3),
                          const Color(0xFFFDF8EA).withValues(alpha: 0.85),
                        ],
                      ),
                    ),
                  ),
                ),
                Positioned(
                  left: 14,
                  top: 20,
                  right: 14,
                  bottom: 22,
                  child: _MapIllustration(
                    accent: const Color(0xFFF08F1A),
                    mapGreen: const Color(0xFF8DB854),
                  ),
                ),
                Positioned(
                  left: 18,
                  right: 18,
                  bottom: 10,
                  child: Container(
                    height: 6,
                    decoration: BoxDecoration(
                      color: const Color(0xFF9CB0BE),
                      borderRadius: BorderRadius.circular(999),
                    ),
                  ),
                ),
              ],
            ),
          ),
        ),
        const SizedBox(height: 14),
        const Row(
          children: [
            Expanded(
              child: _CommuteInfo(
                icon: Icons.directions_walk_rounded,
                title: '5 phút đến Cơ sở\nchính',
              ),
            ),
            SizedBox(width: 16),
            Expanded(
              child: _CommuteInfo(
                icon: Icons.directions_bus_rounded,
                title: '2 phút đến Trạm xe\nbuýt',
              ),
            ),
          ],
        ),
      ],
    );
  }
}

class _MapIllustration extends StatelessWidget {
  const _MapIllustration({required this.accent, required this.mapGreen});

  final Color accent;
  final Color mapGreen;

  @override
  Widget build(BuildContext context) {
    return Stack(
      children: [
        Positioned(
          left: 28,
          top: 24,
          child: Container(
            width: 64,
            height: 44,
            decoration: BoxDecoration(
              color: const Color(0xFFE7F1F6),
              borderRadius: BorderRadius.circular(22),
            ),
          ),
        ),
        Positioned(
          left: 76,
          top: 18,
          child: Container(
            width: 50,
            height: 34,
            decoration: BoxDecoration(
              color: const Color(0xFFE7F1F6),
              borderRadius: BorderRadius.circular(18),
            ),
          ),
        ),
        Positioned(
          left: 92,
          top: 24,
          right: 40,
          bottom: 18,
          child: ClipPath(
            clipper: _MapClipper(),
            child: Container(
              decoration: BoxDecoration(
                gradient: LinearGradient(
                  begin: Alignment.topCenter,
                  end: Alignment.bottomCenter,
                  colors: [
                    mapGreen.withValues(alpha: 0.80),
                    const Color(0xFF7FAB45),
                  ],
                ),
              ),
              child: Stack(
                children: [
                  Positioned(
                    left: 0,
                    top: 28,
                    right: 0,
                    child: Container(
                      height: 8,
                      decoration: BoxDecoration(
                        color: Colors.white.withValues(alpha: 0.55),
                        borderRadius: BorderRadius.circular(999),
                      ),
                    ),
                  ),
                  Positioned(
                    right: 16,
                    top: 6,
                    bottom: 0,
                    child: Container(
                      width: 76,
                      decoration: BoxDecoration(
                        color: const Color(0xFF58A4D4).withValues(alpha: 0.80),
                        borderRadius: BorderRadius.circular(999),
                      ),
                    ),
                  ),
                  Positioned(
                    left: 20,
                    bottom: 12,
                    child: Container(
                      width: 72,
                      height: 28,
                      decoration: BoxDecoration(
                        color: const Color(0xFF6A9F54).withValues(alpha: 0.72),
                        borderRadius: BorderRadius.circular(12),
                      ),
                    ),
                  ),
                  Positioned(
                    left: 54,
                    top: 12,
                    child: Container(
                      width: 12,
                      height: 62,
                      decoration: BoxDecoration(
                        color: Colors.white.withValues(alpha: 0.82),
                        borderRadius: BorderRadius.circular(999),
                      ),
                    ),
                  ),
                  Positioned(
                    left: 100,
                    top: 16,
                    child: Container(
                      width: 10,
                      height: 28,
                      decoration: BoxDecoration(
                        color: Colors.white.withValues(alpha: 0.82),
                        borderRadius: BorderRadius.circular(999),
                      ),
                    ),
                  ),
                  Positioned(
                    right: 28,
                    top: 10,
                    child: Container(
                      width: 12,
                      height: 46,
                      decoration: BoxDecoration(
                        color: Colors.white.withValues(alpha: 0.82),
                        borderRadius: BorderRadius.circular(999),
                      ),
                    ),
                  ),
                  Positioned(
                    left: 110,
                    top: 84,
                    child: Container(
                      width: 78,
                      height: 78,
                      decoration: BoxDecoration(
                        color: accent.withValues(alpha: 0.95),
                        shape: BoxShape.circle,
                        boxShadow: const [
                          BoxShadow(
                            color: Color(0x26000000),
                            blurRadius: 12,
                            offset: Offset(0, 6),
                          ),
                        ],
                      ),
                      child: const Icon(
                        Icons.home_rounded,
                        color: Colors.white,
                        size: 34,
                      ),
                    ),
                  ),
                ],
              ),
            ),
          ),
        ),
        Positioned(
          left: 4,
          top: 36,
          child: Container(
            width: 54,
            height: 30,
            decoration: BoxDecoration(
              color: const Color(0xFFE7EFF5),
              borderRadius: BorderRadius.circular(16),
            ),
          ),
        ),
      ],
    );
  }
}

class _MapClipper extends CustomClipper<Path> {
  @override
  Path getClip(Size size) {
    final path = Path();
    path.moveTo(size.width * 0.10, size.height * 0.18);
    path.quadraticBezierTo(
      size.width * 0.23,
      0,
      size.width * 0.38,
      size.height * 0.02,
    );
    path.quadraticBezierTo(
      size.width * 0.56,
      size.height * 0.05,
      size.width * 0.67,
      size.height * 0.20,
    );
    path.quadraticBezierTo(
      size.width * 0.87,
      size.height * 0.26,
      size.width * 0.90,
      size.height * 0.52,
    );
    path.quadraticBezierTo(
      size.width * 0.86,
      size.height * 0.77,
      size.width * 0.64,
      size.height * 0.88,
    );
    path.quadraticBezierTo(
      size.width * 0.34,
      size.height * 1.00,
      size.width * 0.14,
      size.height * 0.76,
    );
    path.quadraticBezierTo(
      size.width * 0.03,
      size.height * 0.52,
      size.width * 0.10,
      size.height * 0.18,
    );
    path.close();
    return path;
  }

  @override
  bool shouldReclip(covariant CustomClipper<Path> oldClipper) => false;
}

class _CommuteInfo extends StatelessWidget {
  const _CommuteInfo({required this.icon, required this.title});

  final IconData icon;
  final String title;

  @override
  Widget build(BuildContext context) {
    return Row(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Icon(icon, color: const Color(0xFFF08F1A), size: 26),
        const SizedBox(width: 8),
        Expanded(
          child: Text(
            title,
            style: Theme.of(context).textTheme.bodyMedium?.copyWith(
              fontSize: 15,
              height: 1.15,
              color: const Color(0xFF435063),
              fontWeight: FontWeight.w600,
            ),
          ),
        ),
      ],
    );
  }
}

class _BookingSummaryCard extends StatelessWidget {
  const _BookingSummaryCard({required this.price});

  final String price;

  @override
  Widget build(BuildContext context) {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(18),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(24),
        border: Border.all(color: const Color(0xFFE5EAF2)),
        boxShadow: const [
          BoxShadow(
            color: Color(0x11000000),
            blurRadius: 18,
            offset: Offset(0, 8),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          RichText(
            text: TextSpan(
              children: [
                TextSpan(
                  text: '$priceđ',
                  style: const TextStyle(
                    fontSize: 30,
                    fontWeight: FontWeight.w900,
                    color: Color(0xFF2F2721),
                  ),
                ),
                const TextSpan(
                  text: ' / tháng',
                  style: TextStyle(
                    fontSize: 18,
                    fontWeight: FontWeight.w500,
                    color: Color(0xFF768095),
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(height: 20),
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 14),
            decoration: BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.circular(14),
              border: Border.all(color: const Color(0xFFDCE3EE)),
            ),
            child: const Row(
              children: [
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        'NGÀY DỌN VÀO',
                        style: TextStyle(
                          fontSize: 12,
                          fontWeight: FontWeight.w800,
                          color: Color(0xFF9AA4B7),
                        ),
                      ),
                      SizedBox(height: 6),
                      Text(
                        '25 tháng 8, 2024',
                        style: TextStyle(
                          fontSize: 18,
                          fontWeight: FontWeight.w700,
                          color: Color(0xFF2F2721),
                        ),
                      ),
                    ],
                  ),
                ),
                Icon(Icons.calendar_month_outlined, color: Color(0xFF93A1B1)),
              ],
            ),
          ),
          const SizedBox(height: 14),
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 14),
            decoration: BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.circular(14),
              border: Border.all(color: const Color(0xFFDCE3EE)),
            ),
            child: const Row(
              children: [
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        'THỜI HẠN THUÊ',
                        style: TextStyle(
                          fontSize: 12,
                          fontWeight: FontWeight.w800,
                          color: Color(0xFF9AA4B7),
                        ),
                      ),
                      SizedBox(height: 6),
                      Text(
                        '12 Tháng',
                        style: TextStyle(
                          fontSize: 18,
                          fontWeight: FontWeight.w700,
                          color: Color(0xFF2F2721),
                        ),
                      ),
                    ],
                  ),
                ),
                Icon(
                  Icons.keyboard_arrow_down_rounded,
                  color: Color(0xFF93A1B1),
                ),
              ],
            ),
          ),
          const SizedBox(height: 18),
          const Row(
            children: [
              Text(
                'Tiền đặt cọc',
                style: TextStyle(fontSize: 16, color: Color(0xFF768095)),
              ),
              Spacer(),
              Text(
                '15.000.000đ',
                style: TextStyle(
                  fontSize: 16,
                  fontWeight: FontWeight.w700,
                  color: Color(0xFF2F2721),
                ),
              ),
            ],
          ),
          const SizedBox(height: 10),
          const Row(
            children: [
              Text(
                'Phí dịch vụ',
                style: TextStyle(fontSize: 16, color: Color(0xFF768095)),
              ),
              Spacer(),
              Text(
                '500.000đ',
                style: TextStyle(
                  fontSize: 16,
                  fontWeight: FontWeight.w700,
                  color: Color(0xFF2F2721),
                ),
              ),
            ],
          ),
          const Padding(
            padding: EdgeInsets.symmetric(vertical: 14),
            child: Divider(height: 1, color: Color(0xFFE6EAF0)),
          ),
          const Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Expanded(
                child: Text(
                  'Tổng thanh toán hôm nay',
                  style: TextStyle(
                    fontSize: 18,
                    fontWeight: FontWeight.w800,
                    color: Color(0xFF2F2721),
                  ),
                ),
              ),
              SizedBox(width: 12),
              Text(
                '15.500.000đ',
                style: TextStyle(
                  fontSize: 18,
                  fontWeight: FontWeight.w900,
                  color: Color(0xFF2F2721),
                ),
              ),
            ],
          ),
          const SizedBox(height: 18),
          SizedBox(
            width: double.infinity,
            height: 58,
            child: FilledButton(
              onPressed: () {
                Navigator.of(
                  context,
                ).push(MaterialPageRoute(builder: (_) => const BookingPage()));
              },
              style: FilledButton.styleFrom(
                backgroundColor: const Color(0xFFF09A2A),
                foregroundColor: Colors.white,
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(16),
                ),
              ),
              child: const Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Text(
                    'Đặt ngay',
                    style: TextStyle(fontSize: 18, fontWeight: FontWeight.w800),
                  ),
                  SizedBox(width: 8),
                  Icon(Icons.arrow_forward_rounded),
                ],
              ),
            ),
          ),
          const SizedBox(height: 12),
          const Text(
            'Chưa thu tiền thanh toán. Bạn sẽ được xem xét hợp đồng thuê trước khi ký.',
            textAlign: TextAlign.center,
            style: TextStyle(
              fontSize: 13,
              height: 1.35,
              color: Color(0xFF9AA4B7),
            ),
          ),
        ],
      ),
    );
  }
}

class _StickyBookingBar extends StatelessWidget {
  const _StickyBookingBar({required this.price});

  final String price;

  @override
  Widget build(BuildContext context) {
    return SafeArea(
      top: false,
      child: Container(
        color: Colors.white,
        padding: const EdgeInsets.fromLTRB(16, 12, 16, 12),
        child: Row(
          children: [
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                mainAxisSize: MainAxisSize.min,
                children: [
                  Row(
                    crossAxisAlignment: CrossAxisAlignment.end,
                    children: [
                      Text(
                        price,
                        style: const TextStyle(
                          fontSize: 19,
                          fontWeight: FontWeight.w900,
                          color: Color(0xFF222222),
                        ),
                      ),
                      const SizedBox(width: 4),
                      const Padding(
                        padding: EdgeInsets.only(bottom: 1),
                        child: Text(
                          '/tháng',
                          style: TextStyle(
                            fontSize: 14,
                            fontWeight: FontWeight.w500,
                            color: Color(0xFF6D7588),
                          ),
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 4),
                  const Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Icon(
                        Icons.star_border_rounded,
                        size: 16,
                        color: Color(0xFFF39A1A),
                      ),
                      SizedBox(width: 3),
                      Text(
                        '4.9',
                        style: TextStyle(
                          fontSize: 14,
                          fontWeight: FontWeight.w700,
                          color: Color(0xFFF39A1A),
                        ),
                      ),
                    ],
                  ),
                ],
              ),
            ),
            SizedBox(
              height: 56,
              width: 154,
              child: FilledButton(
                onPressed: () {
                  Navigator.of(context).push(
                    MaterialPageRoute(builder: (_) => const BookingPage()),
                  );
                },
                style: FilledButton.styleFrom(
                  backgroundColor: const Color(0xFFF39A1A),
                  foregroundColor: Colors.white,
                  elevation: 0,
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(14),
                  ),
                ),
                child: const Text(
                  'Đặt ngay',
                  style: TextStyle(fontSize: 17, fontWeight: FontWeight.w800),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
