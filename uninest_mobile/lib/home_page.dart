import 'package:flutter/material.dart';
import 'login_page.dart';
import 'bottom_nav.dart';
import 'search_page.dart';
import 'detail_page.dart';
import 'sample_apartments.dart';

class HomePage extends StatelessWidget {
  const HomePage({super.key, this.showBottomNav = false});

  final bool showBottomNav;

  @override
  Widget build(BuildContext context) {
    final horizontalPadding = MediaQuery.sizeOf(context).width > 600
        ? 28.0
        : 16.0;

    return Scaffold(
      backgroundColor: const Color(0xFFF7F0E3),
      body: SafeArea(
        child: Stack(
          children: [
            const _BackgroundOrbs(),
            SingleChildScrollView(
              child: Padding(
                padding: EdgeInsets.fromLTRB(
                  horizontalPadding,
                  10,
                  horizontalPadding,
                  128,
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    _TopBar(
                      onPressed: () {
                        Navigator.of(context).push(
                          MaterialPageRoute(builder: (_) => const LoginPage()),
                        );
                      },
                    ),
                    const SizedBox(height: 24),
                    const SizedBox(height: 16),
                    _HeroHeadline(
                      textStyle:
                          Theme.of(context).textTheme.displayMedium ??
                          const TextStyle(),
                    ),
                    const SizedBox(height: 18),
                    Text(
                      'Giá rẻ, uy tín và gần trường học. Khám phá nhà ở được thiết kế riêng cho cuộc sống đại học và ngân sách của bạn.',
                      style: Theme.of(context).textTheme.bodyLarge?.copyWith(
                        color: const Color(0xFF6E6558),
                        height: 1.45,
                        fontSize: 18,
                      ),
                    ),
                    const SizedBox(height: 18),
                    const _SearchCard(),
                    const SizedBox(height: 20),
                    const _RoomShowcase(),
                    const SizedBox(height: 34),
                    const _WhyUniNestSection(),
                    const SizedBox(height: 34),
                    _FeaturedApartmentsSection(enableTap: showBottomNav),
                    const SizedBox(height: 34),
                    const _LandlordCtaSection(),
                    const SizedBox(height: 28),
                    const _FooterSection(),
                    const SizedBox(height: 20),
                  ],
                ),
              ),
            ),
            Positioned(left: 12, bottom: 12, child: const _TrustBadge()),
          ],
        ),
      ),
      bottomNavigationBar: showBottomNav
          ? const BottomNavBar(initialIndex: 0)
          : null,
    );
  }
}

class _TopBar extends StatelessWidget {
  const _TopBar({required this.onPressed});

  final VoidCallback onPressed;

  @override
  Widget build(BuildContext context) {
    return Row(
      children: [
        Row(
          children: [
            Container(
              width: 34,
              height: 34,
              decoration: BoxDecoration(
                color: const Color(0xFF2D7A55),
                borderRadius: BorderRadius.circular(10),
              ),
              child: const Icon(
                Icons.house_rounded,
                color: Colors.white,
                size: 20,
              ),
            ),
            const SizedBox(width: 10),
            Text(
              'UniNest',
              style: Theme.of(context).textTheme.titleLarge?.copyWith(
                fontSize: 24,
                fontWeight: FontWeight.w800,
                color: const Color(0xFF2F2721),
                letterSpacing: -0.3,
                fontFamily: 'Georgia',
              ),
            ),
          ],
        ),
        const Spacer(),
        FilledButton(
          onPressed: onPressed,
          style: FilledButton.styleFrom(
            backgroundColor: const Color(0xFFF09A2A),
            foregroundColor: Colors.white,
            elevation: 0,
            padding: const EdgeInsets.symmetric(horizontal: 18, vertical: 14),
            shape: RoundedRectangleBorder(
              borderRadius: BorderRadius.circular(12),
            ),
          ),
          child: const Text(
            'Bắt đầu ngay',
            style: TextStyle(fontWeight: FontWeight.w700),
          ),
        ),
      ],
    );
  }
}

class _TrustBadge extends StatelessWidget {
  const _TrustBadge();

  @override
  Widget build(BuildContext context) {
    return Container(
      constraints: const BoxConstraints(maxWidth: 260),
      padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(18),
        border: Border.all(color: const Color(0xFFF0E3D0)),
        boxShadow: const [
          BoxShadow(
            color: Color(0x22000000),
            blurRadius: 14,
            offset: Offset(0, 6),
          ),
        ],
      ),
      child: const Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          CircleAvatar(
            radius: 22,
            backgroundColor: Color(0xFFE6F5E1),
            child: Icon(
              Icons.verified_rounded,
              color: Color(0xFF5FA856),
              size: 24,
            ),
          ),
          SizedBox(width: 10),
          Flexible(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              mainAxisSize: MainAxisSize.min,
              children: [
                Text(
                  'Chỉ tin đăng đã xác thực',
                  style: TextStyle(
                    color: Color(0xFF2D2A26),
                    fontWeight: FontWeight.w800,
                    fontSize: 15,
                    height: 1.1,
                  ),
                ),
                SizedBox(height: 3),
                Text(
                  'Cam kết 100% không lừa đảo',
                  style: TextStyle(
                    color: Color(0xFF6E6558),
                    fontWeight: FontWeight.w500,
                    fontSize: 12,
                    height: 1.1,
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

class _HeroHeadline extends StatelessWidget {
  const _HeroHeadline({required this.textStyle});

  final TextStyle textStyle;

  @override
  Widget build(BuildContext context) {
    const dark = Color(0xFF2F2721);
    const accent = Color(0xFFF09A2A);

    return RichText(
      text: TextSpan(
        style: textStyle.copyWith(
          fontSize: 36,
          height: 1.06,
          fontWeight: FontWeight.w800,
          color: dark,
          letterSpacing: -1.1,
          fontFamily: 'Georgia',
        ),
        children: const [
          TextSpan(text: 'Tìm ngôi nhà\n'),
          TextSpan(
            text: 'ngôi nhà của\n',
            style: TextStyle(color: accent),
          ),
          TextSpan(text: 'bạn'),
        ],
      ),
    );
  }
}

class _SearchCard extends StatelessWidget {
  const _SearchCard();

  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(18),
        boxShadow: const [
          BoxShadow(
            color: Color(0x1A8A6A3F),
            blurRadius: 22,
            offset: Offset(0, 12),
          ),
        ],
      ),
      child: Column(
        children: [
          _SearchRow(
            icon: Icons.place_outlined,
            text: 'Nhập tên trường hoặc khu vực',
            showDivider: true,
          ),
          _SearchRow(
            icon: Icons.payments_outlined,
            text: 'Khoảng giá',
            trailing: Icons.keyboard_arrow_down_rounded,
            showDivider: true,
          ),
          _SearchRow(
            icon: Icons.bed_outlined,
            text: 'Loại phòng',
            trailing: Icons.keyboard_arrow_down_rounded,
            showDivider: false,
          ),
          Padding(
            padding: const EdgeInsets.fromLTRB(12, 8, 12, 12),
            child: SizedBox(
              width: double.infinity,
              height: 48,
              child: FilledButton.icon(
                onPressed: () {},
                icon: const Icon(Icons.search_rounded),
                label: const Text(
                  'Tìm kiếm',
                  style: TextStyle(fontWeight: FontWeight.w700, fontSize: 16),
                ),
                style: FilledButton.styleFrom(
                  backgroundColor: const Color(0xFFF09A2A),
                  foregroundColor: Colors.white,
                  elevation: 0,
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(10),
                  ),
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }
}

class _SearchRow extends StatelessWidget {
  const _SearchRow({
    required this.icon,
    required this.text,
    this.trailing,
    required this.showDivider,
  });

  final IconData icon;
  final String text;
  final IconData? trailing;
  final bool showDivider;

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        SizedBox(
          height: 54,
          child: Padding(
            padding: const EdgeInsets.symmetric(horizontal: 16),
            child: Row(
              children: [
                Icon(icon, color: const Color(0xFFF09A2A), size: 20),
                const SizedBox(width: 14),
                Expanded(
                  child: Text(
                    text,
                    style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                      fontSize: 15,
                      color: const Color(0xFF5F5A52),
                      fontWeight: FontWeight.w500,
                    ),
                  ),
                ),
                Icon(
                  trailing ?? Icons.chevron_right_rounded,
                  color: const Color(0xFF8B857C),
                ),
              ],
            ),
          ),
        ),
        if (showDivider)
          const Divider(height: 1, thickness: 1, color: Color(0xFFF0E8DA)),
      ],
    );
  }
}

class _RoomShowcase extends StatelessWidget {
  const _RoomShowcase();

  @override
  Widget build(BuildContext context) {
    return Stack(
      clipBehavior: Clip.none,
      children: [
        Container(
          height: 372,
          width: double.infinity,
          decoration: BoxDecoration(
            borderRadius: BorderRadius.circular(18),
            boxShadow: const [
              BoxShadow(
                color: Color(0x1A8A6A3F),
                blurRadius: 24,
                offset: Offset(0, 14),
              ),
            ],
          ),
          child: ClipRRect(
            borderRadius: BorderRadius.circular(18),
            child: Stack(
              children: [
                Container(
                  decoration: const BoxDecoration(
                    gradient: LinearGradient(
                      begin: Alignment.topCenter,
                      end: Alignment.bottomCenter,
                      colors: [Color(0xFFF8F7F2), Color(0xFFF0E7D8)],
                    ),
                  ),
                ),
                Positioned(
                  left: 18,
                  right: 18,
                  top: 24,
                  child: Container(
                    height: 170,
                    decoration: BoxDecoration(
                      color: Colors.white.withValues(alpha: 0.35),
                      borderRadius: BorderRadius.circular(16),
                    ),
                    child: Stack(
                      children: [
                        Positioned.fill(
                          child: Align(
                            alignment: Alignment.center,
                            child: Container(
                              width: 138,
                              height: 128,
                              decoration: BoxDecoration(
                                color: const Color(0xFFF9FBFD),
                                borderRadius: BorderRadius.circular(12),
                                border: Border.all(
                                  color: const Color(0xFFD9E4EF),
                                ),
                              ),
                              child: Stack(
                                children: [
                                  Positioned(
                                    left: 8,
                                    top: 10,
                                    right: 8,
                                    bottom: 10,
                                    child: Container(
                                      decoration: BoxDecoration(
                                        gradient: const LinearGradient(
                                          colors: [
                                            Color(0xFFFDFEFE),
                                            Color(0xFFEFF7F4),
                                          ],
                                          begin: Alignment.topCenter,
                                          end: Alignment.bottomCenter,
                                        ),
                                        borderRadius: BorderRadius.circular(8),
                                      ),
                                    ),
                                  ),
                                  Positioned(
                                    left: 22,
                                    top: 22,
                                    right: 22,
                                    height: 58,
                                    child: Row(
                                      children: const [
                                        _WindowPane(),
                                        SizedBox(width: 6),
                                        _WindowPane(),
                                      ],
                                    ),
                                  ),
                                  Positioned(
                                    left: 16,
                                    bottom: 22,
                                    child: _Plant(height: 46, width: 26),
                                  ),
                                  Positioned(
                                    right: 16,
                                    bottom: 20,
                                    child: _Plant(height: 44, width: 24),
                                  ),
                                ],
                              ),
                            ),
                          ),
                        ),
                        Positioned(
                          left: 8,
                          right: 8,
                          bottom: 8,
                          child: Container(
                            height: 68,
                            decoration: BoxDecoration(
                              color: const Color(0xFF6E7379),
                              borderRadius: BorderRadius.circular(14),
                              boxShadow: const [
                                BoxShadow(
                                  color: Color(0x26000000),
                                  blurRadius: 10,
                                  offset: Offset(0, 6),
                                ),
                              ],
                            ),
                            child: Stack(
                              children: [
                                Positioned(
                                  left: 10,
                                  top: 8,
                                  child: Container(
                                    width: 46,
                                    height: 52,
                                    decoration: BoxDecoration(
                                      color: const Color(0xFF8A9198),
                                      borderRadius: BorderRadius.circular(11),
                                    ),
                                  ),
                                ),
                                Positioned(
                                  left: 56,
                                  top: 13,
                                  child: Container(
                                    width: 46,
                                    height: 44,
                                    decoration: BoxDecoration(
                                      color: const Color(0xFF858D94),
                                      borderRadius: BorderRadius.circular(11),
                                    ),
                                  ),
                                ),
                                Positioned(
                                  right: 14,
                                  top: 8,
                                  child: Container(
                                    width: 50,
                                    height: 50,
                                    decoration: BoxDecoration(
                                      color: const Color(0xFF747A80),
                                      borderRadius: BorderRadius.circular(14),
                                    ),
                                  ),
                                ),
                                Positioned(
                                  left: 28,
                                  bottom: 10,
                                  child: Container(
                                    width: 78,
                                    height: 12,
                                    decoration: BoxDecoration(
                                      color: const Color(0xFF646A70),
                                      borderRadius: BorderRadius.circular(999),
                                    ),
                                  ),
                                ),
                              ],
                            ),
                          ),
                        ),
                        Positioned(
                          left: 18,
                          bottom: 12,
                          child: Container(
                            width: 84,
                            height: 84,
                            decoration: BoxDecoration(
                              color: const Color(0xFFEFE8D9),
                              borderRadius: BorderRadius.circular(14),
                            ),
                            child: Column(
                              mainAxisAlignment: MainAxisAlignment.end,
                              children: [
                                Container(
                                  width: 52,
                                  height: 10,
                                  decoration: BoxDecoration(
                                    color: const Color(0xFFC8B79E),
                                    borderRadius: BorderRadius.circular(999),
                                  ),
                                ),
                                const SizedBox(height: 6),
                              ],
                            ),
                          ),
                        ),
                        Positioned(
                          right: 12,
                          bottom: 14,
                          child: Container(
                            width: 30,
                            height: 64,
                            decoration: BoxDecoration(
                              color: const Color(0xFF6DA15A),
                              borderRadius: BorderRadius.circular(12),
                            ),
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
      ],
    );
  }
}

class _WhyUniNestSection extends StatelessWidget {
  const _WhyUniNestSection();

  @override
  Widget build(BuildContext context) {
    final cards = const [
      _WhyCardData(
        icon: Icons.verified_user_outlined,
        title: 'Nhà ở tin cậy',
        description:
            'Mọi bất động sản và chủ nhà đều được đội ngũ của chúng tôi xác minh thủ công để đảm bảo an toàn cho bạn.',
      ),
      _WhyCardData(
        icon: Icons.map_outlined,
        title: 'Gần trường học',
        description:
            'Chúng tôi lập bản đồ mọi tin đăng so với trường đại học của bạn, hiển thị thời gian đi bộ, xe đạp và phương tiện công cộng.',
      ),
      _WhyCardData(
        icon: Icons.support_agent_rounded,
        title: 'Hỗ trợ sinh viên',
        description:
            'Đội ngũ hỗ trợ tận tâm của chúng tôi giúp bạn xử lý hợp đồng, dọn vào ở và tìm bạn cùng phòng.',
      ),
    ];

    return Column(
      crossAxisAlignment: CrossAxisAlignment.center,
      children: [
        Padding(
          padding: const EdgeInsets.symmetric(horizontal: 8),
          child: Column(
            children: [
              Text(
                'Tại sao sinh viên chọn\nUniNest',
                textAlign: TextAlign.center,
                style: Theme.of(context).textTheme.headlineMedium?.copyWith(
                  fontSize: 28,
                  height: 1.08,
                  fontWeight: FontWeight.w800,
                  color: const Color(0xFF2F2721),
                  fontFamily: 'Georgia',
                ),
              ),
              const SizedBox(height: 16),
              Text(
                'Chúng tôi đơn giản hóa việc tìm kiếm nhà ở để bạn có thể tập trung vào những điều quan trọng nhất: việc học và trải nghiệm đại học.',
                textAlign: TextAlign.center,
                style: Theme.of(context).textTheme.bodyLarge?.copyWith(
                  color: const Color(0xFF6E7A8A),
                  height: 1.45,
                  fontSize: 15.5,
                ),
              ),
            ],
          ),
        ),
        const SizedBox(height: 22),
        for (final card in cards) ...[
          _WhyFeatureCard(data: card),
          const SizedBox(height: 16),
        ],
      ],
    );
  }
}

class _WhyFeatureCard extends StatelessWidget {
  const _WhyFeatureCard({required this.data});

  final _WhyCardData data;

  @override
  Widget build(BuildContext context) {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: const Color(0xFFF7F2E8),
        borderRadius: BorderRadius.circular(22),
        border: Border.all(color: const Color(0xFFF0E3D0)),
      ),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Container(
            width: 42,
            height: 42,
            decoration: BoxDecoration(
              color: const Color(0xFFF1D8AA),
              borderRadius: BorderRadius.circular(12),
            ),
            child: Icon(data.icon, color: const Color(0xFFF08F1A), size: 22),
          ),
          const SizedBox(width: 16),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  data.title,
                  style: Theme.of(context).textTheme.titleLarge?.copyWith(
                    fontSize: 20,
                    fontWeight: FontWeight.w800,
                    color: const Color(0xFF2F2721),
                    fontFamily: 'Georgia',
                  ),
                ),
                const SizedBox(height: 10),
                Text(
                  data.description,
                  style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                    fontSize: 15,
                    height: 1.5,
                    color: const Color(0xFF5F5A52),
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

class _WhyCardData {
  const _WhyCardData({
    required this.icon,
    required this.title,
    required this.description,
  });

  final IconData icon;
  final String title;
  final String description;
}

class _FeaturedApartmentsSection extends StatelessWidget {
  const _FeaturedApartmentsSection({this.enableTap = false});

  final bool enableTap;

  @override
  Widget build(BuildContext context) {
    final cards = featuredApartments;

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          'Căn hộ sinh viên tiêu biểu',
          style: Theme.of(context).textTheme.headlineMedium?.copyWith(
            fontSize: 28,
            height: 1.08,
            fontWeight: FontWeight.w800,
            color: const Color(0xFF2F2721),
            fontFamily: 'Georgia',
          ),
        ),
        const SizedBox(height: 12),
        Text(
          'Bất động sản được chọn lọc kỹ lưỡng gần các trường đại học hàng đầu',
          style: Theme.of(context).textTheme.bodyLarge?.copyWith(
            fontSize: 16,
            color: const Color(0xFF6E7A8A),
            height: 1.45,
          ),
        ),
        const SizedBox(height: 18),
        Row(
          mainAxisAlignment: MainAxisAlignment.end,
          children: const [
            _CircleNavButton(icon: Icons.chevron_left_rounded),
            SizedBox(width: 10),
            _CircleNavButton(icon: Icons.chevron_right_rounded),
          ],
        ),
        const SizedBox(height: 18),
        for (final card in cards) ...[
          GestureDetector(
            onTap: enableTap
                ? () {
                    Navigator.of(context).push(
                      MaterialPageRoute(
                        builder: (_) => DetailPage(
                          title: card.title,
                          location: card.subtitle,
                          price: card.price,
                          imageLabel: '1/1',
                        ),
                      ),
                    );
                  }
                : null,
            child: _ApartmentCard(data: card),
          ),
          const SizedBox(height: 18),
        ],
        const SizedBox(height: 4),
        Center(
          child: TextButton(
            onPressed: () {},
            style: TextButton.styleFrom(
              foregroundColor: const Color(0xFFF08F1A),
              textStyle: const TextStyle(
                fontSize: 16,
                fontWeight: FontWeight.w700,
              ),
            ),
            child: const Text('Xem tất cả hơn 2.400 tin đăng →'),
          ),
        ),
      ],
    );
  }
}

class _LandlordCtaSection extends StatelessWidget {
  const _LandlordCtaSection();

  @override
  Widget build(BuildContext context) {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(18),
      decoration: BoxDecoration(
        gradient: const LinearGradient(
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
          colors: [Color(0xFF5A4126), Color(0xFF231B18)],
        ),
        borderRadius: BorderRadius.circular(24),
        boxShadow: const [
          BoxShadow(
            color: Color(0x26000000),
            blurRadius: 24,
            offset: Offset(0, 14),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.center,
        children: [
          Text(
            'Are you a\nlandlord?',
            textAlign: TextAlign.center,
            style: Theme.of(context).textTheme.headlineMedium?.copyWith(
              fontSize: 30,
              height: 1.02,
              fontWeight: FontWeight.w800,
              color: Colors.white,
              fontFamily: 'Georgia',
            ),
          ),
          const SizedBox(height: 14),
          Text(
            'Reach thousands of students looking for their next home. List your property on UniNest and find quality tenants quickly.',
            textAlign: TextAlign.center,
            style: Theme.of(context).textTheme.bodyLarge?.copyWith(
              fontSize: 15,
              height: 1.5,
              color: const Color(0xFFD7D4D0),
            ),
          ),
          const SizedBox(height: 22),
          SizedBox(
            width: double.infinity,
            height: 48,
            child: FilledButton(
              onPressed: () {},
              style: FilledButton.styleFrom(
                backgroundColor: const Color(0xFFF09A2A),
                foregroundColor: Colors.white,
                elevation: 0,
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(12),
                ),
              ),
              child: const Text(
                'List Your Property',
                style: TextStyle(fontSize: 16, fontWeight: FontWeight.w700),
              ),
            ),
          ),
          const SizedBox(height: 12),
          SizedBox(
            width: double.infinity,
            height: 46,
            child: OutlinedButton(
              onPressed: () {},
              style: OutlinedButton.styleFrom(
                foregroundColor: Colors.white,
                side: const BorderSide(color: Color(0xFF66706B)),
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(12),
                ),
                backgroundColor: const Color(0xFF433A34),
              ),
              child: const Text(
                'Learn More',
                style: TextStyle(fontSize: 16, fontWeight: FontWeight.w700),
              ),
            ),
          ),
        ],
      ),
    );
  }
}

class _FooterSection extends StatelessWidget {
  const _FooterSection();

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        const Divider(height: 1, thickness: 1, color: Color(0xFFE9DCC6)),
        const SizedBox(height: 28),
        Row(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Container(
              width: 28,
              height: 28,
              decoration: BoxDecoration(
                color: const Color(0xFF3D7C5B),
                borderRadius: BorderRadius.circular(6),
              ),
              child: const Icon(
                Icons.house_rounded,
                color: Colors.white,
                size: 16,
              ),
            ),
            const SizedBox(width: 8),
            Text(
              'UniNest',
              style: Theme.of(context).textTheme.titleLarge?.copyWith(
                fontSize: 22,
                fontWeight: FontWeight.w800,
                color: const Color(0xFF2F2721),
                fontFamily: 'Georgia',
              ),
            ),
          ],
        ),
        const SizedBox(height: 10),
        Text(
          '© 2024 UniNest Student Housing. Bảo lưu mọi quyền.',
          textAlign: TextAlign.center,
          style: Theme.of(context).textTheme.bodyMedium?.copyWith(
            fontSize: 13,
            color: const Color(0xFF7A7D85),
          ),
        ),
        const SizedBox(height: 14),
        Row(
          mainAxisAlignment: MainAxisAlignment.center,
          children: const [
            _FooterIcon(icon: Icons.emoji_events_outlined),
            SizedBox(width: 14),
            _FooterIcon(icon: Icons.share_outlined),
            SizedBox(width: 14),
            _FooterIcon(icon: Icons.language_rounded),
          ],
        ),
      ],
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
        Text(
          'Vị trí',
          style: Theme.of(context).textTheme.headlineMedium?.copyWith(
            fontSize: 28,
            height: 1.05,
            fontWeight: FontWeight.w800,
            color: const Color(0xFF2F2721),
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
        Row(
          children: const [
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

class _FooterIcon extends StatelessWidget {
  const _FooterIcon({required this.icon});

  final IconData icon;

  @override
  Widget build(BuildContext context) {
    return Icon(icon, size: 22, color: const Color(0xFF7C8797));
  }
}

class _ApartmentCard extends StatelessWidget {
  const _ApartmentCard({required this.data});

  final Apartment data;

  @override
  Widget build(BuildContext context) {
    return Container(
      width: double.infinity,
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(20),
        boxShadow: const [
          BoxShadow(
            color: Color(0x1A8A6A3F),
            blurRadius: 24,
            offset: Offset(0, 12),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          ClipRRect(
            borderRadius: const BorderRadius.vertical(top: Radius.circular(20)),
            child: SizedBox(
              height: 214,
              child: Stack(
                children: [
                  _ApartmentIllustration(data: data),
                  Positioned(
                    left: 14,
                    top: 14,
                    child: _CardBadge(text: data.badge),
                  ),
                  Positioned(
                    right: 14,
                    top: 14,
                    child: Container(
                      width: 34,
                      height: 34,
                      decoration: const BoxDecoration(
                        color: Colors.white,
                        shape: BoxShape.circle,
                      ),
                      child: const Icon(
                        Icons.favorite_border_rounded,
                        size: 18,
                        color: Color(0xFF7E8794),
                      ),
                    ),
                  ),
                ],
              ),
            ),
          ),
          Padding(
            padding: const EdgeInsets.fromLTRB(18, 16, 18, 18),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Expanded(
                      child: Text(
                        data.title,
                        style: Theme.of(context).textTheme.titleLarge?.copyWith(
                          fontSize: 20,
                          height: 1.25,
                          fontWeight: FontWeight.w800,
                          color: const Color(0xFF2F2721),
                          fontFamily: 'Georgia',
                        ),
                      ),
                    ),
                    const SizedBox(width: 12),
                    RichText(
                      textAlign: TextAlign.right,
                      text: TextSpan(
                        children: [
                          TextSpan(
                            text: data.price,
                            style: const TextStyle(
                              color: Color(0xFFF08F1A),
                              fontSize: 18,
                              fontWeight: FontWeight.w800,
                            ),
                          ),
                          TextSpan(
                            text: data.priceSuffix,
                            style: const TextStyle(
                              color: Color(0xFF9AA2AE),
                              fontSize: 13,
                              fontWeight: FontWeight.w500,
                            ),
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 10),
                Row(
                  children: [
                    const Icon(
                      Icons.place_outlined,
                      size: 16,
                      color: Color(0xFF93A1B1),
                    ),
                    const SizedBox(width: 4),
                    Expanded(
                      child: Text(
                        data.subtitle,
                        style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                          fontSize: 14,
                          color: const Color(0xFF728196),
                          fontWeight: FontWeight.w500,
                        ),
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 14),
                Divider(color: const Color(0xFFEDEFF3), height: 1),
                const SizedBox(height: 12),
                Wrap(
                  spacing: 14,
                  runSpacing: 10,
                  children: data.amenities
                      .map(
                        (amenity) =>
                            _AmenityChip(label: amenity, color: data.accent),
                      )
                      .toList(),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

class _ApartmentIllustration extends StatelessWidget {
  const _ApartmentIllustration({required this.data});

  final Apartment data;

  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: BoxDecoration(
        gradient: LinearGradient(
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
          colors: [
            data.imageTone.withValues(alpha: 0.70),
            data.accent.withValues(alpha: 0.28),
          ],
        ),
      ),
      child: Stack(
        children: [
          Positioned(
            left: 18,
            top: 20,
            child: _TallPlant(color: data.accent.withValues(alpha: 0.58)),
          ),
          Positioned(
            left: 0,
            right: 0,
            bottom: 12,
            child: Row(
              mainAxisAlignment: MainAxisAlignment.center,
              crossAxisAlignment: CrossAxisAlignment.end,
              children: [
                _SimpleChair(
                  seatColor: Colors.white.withValues(alpha: 0.45),
                  frameColor: Colors.white.withValues(alpha: 0.75),
                ),
                const SizedBox(width: 12),
                _SimpleTable(color: data.accent.withValues(alpha: 0.42)),
                const SizedBox(width: 14),
                _SimplePlant(color: data.accent.withValues(alpha: 0.62)),
              ],
            ),
          ),
          Positioned(
            right: 16,
            top: 42,
            child: _SimplePlant(
              color: data.accent.withValues(alpha: 0.42),
              small: true,
            ),
          ),
        ],
      ),
    );
  }
}

class _ApartmentCardData {
  const _ApartmentCardData({
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

class _CardBadge extends StatelessWidget {
  const _CardBadge({required this.text});

  final String text;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(999),
        boxShadow: const [
          BoxShadow(
            color: Color(0x1A000000),
            blurRadius: 10,
            offset: Offset(0, 4),
          ),
        ],
      ),
      child: Text(
        text,
        style: const TextStyle(
          color: Color(0xFFF08F1A),
          fontSize: 12,
          fontWeight: FontWeight.w700,
        ),
      ),
    );
  }
}

class _AmenityChip extends StatelessWidget {
  const _AmenityChip({required this.label, required this.color});

  final String label;
  final Color color;

  @override
  Widget build(BuildContext context) {
    return Row(
      mainAxisSize: MainAxisSize.min,
      children: [
        Icon(Icons.check_circle_outline, size: 15, color: color),
        const SizedBox(width: 6),
        Text(
          label,
          style: Theme.of(context).textTheme.bodyMedium?.copyWith(
            fontSize: 13,
            color: const Color(0xFF495566),
            fontWeight: FontWeight.w500,
          ),
        ),
      ],
    );
  }
}

class _CircleNavButton extends StatelessWidget {
  const _CircleNavButton({required this.icon});

  final IconData icon;

  @override
  Widget build(BuildContext context) {
    return Container(
      width: 38,
      height: 38,
      decoration: BoxDecoration(
        color: const Color(0xFFF8EFE0),
        shape: BoxShape.circle,
        border: Border.all(color: const Color(0xFFE4C89B)),
      ),
      child: Icon(icon, size: 20, color: const Color(0xFF2F2721)),
    );
  }
}

class _TallPlant extends StatelessWidget {
  const _TallPlant({required this.color});

  final Color color;

  @override
  Widget build(BuildContext context) {
    return SizedBox(
      width: 52,
      height: 120,
      child: Stack(
        alignment: Alignment.bottomCenter,
        children: [
          Positioned(
            bottom: 0,
            child: Container(
              width: 22,
              height: 48,
              decoration: BoxDecoration(
                color: Colors.white.withValues(alpha: 0.82),
                borderRadius: BorderRadius.circular(10),
              ),
            ),
          ),
          Positioned(
            bottom: 34,
            child: Container(
              width: 42,
              height: 76,
              decoration: BoxDecoration(
                color: color,
                borderRadius: BorderRadius.circular(22),
              ),
            ),
          ),
        ],
      ),
    );
  }
}

class _SimpleChair extends StatelessWidget {
  const _SimpleChair({required this.seatColor, required this.frameColor});

  final Color seatColor;
  final Color frameColor;

  @override
  Widget build(BuildContext context) {
    return SizedBox(
      width: 56,
      height: 72,
      child: Stack(
        alignment: Alignment.bottomCenter,
        children: [
          Positioned(
            bottom: 12,
            child: Container(
              width: 44,
              height: 18,
              decoration: BoxDecoration(
                color: seatColor,
                borderRadius: BorderRadius.circular(8),
              ),
            ),
          ),
          Positioned(
            bottom: 28,
            child: Container(
              width: 28,
              height: 32,
              decoration: BoxDecoration(
                color: seatColor.withValues(alpha: 0.65),
                borderRadius: BorderRadius.circular(8),
                border: Border.all(color: frameColor, width: 1.2),
              ),
            ),
          ),
          Positioned(
            bottom: 0,
            child: Container(width: 3, height: 20, color: frameColor),
          ),
        ],
      ),
    );
  }
}

class _SimpleTable extends StatelessWidget {
  const _SimpleTable({required this.color});

  final Color color;

  @override
  Widget build(BuildContext context) {
    return SizedBox(
      width: 58,
      height: 72,
      child: Stack(
        alignment: Alignment.bottomCenter,
        children: [
          Positioned(
            bottom: 16,
            child: Container(
              width: 54,
              height: 18,
              decoration: BoxDecoration(
                color: color.withValues(alpha: 0.88),
                borderRadius: BorderRadius.circular(6),
              ),
            ),
          ),
          Positioned(
            bottom: 0,
            left: 18,
            child: Container(width: 3, height: 20, color: color),
          ),
          Positioned(
            bottom: 0,
            right: 18,
            child: Container(width: 3, height: 20, color: color),
          ),
        ],
      ),
    );
  }
}

class _SimplePlant extends StatelessWidget {
  const _SimplePlant({required this.color, this.small = false});

  final Color color;
  final bool small;

  @override
  Widget build(BuildContext context) {
    final height = small ? 44.0 : 54.0;
    final width = small ? 20.0 : 24.0;
    return SizedBox(
      width: width,
      height: height,
      child: Stack(
        alignment: Alignment.bottomCenter,
        children: [
          Positioned(
            bottom: 0,
            child: Container(
              width: width * 0.45,
              height: 14,
              decoration: BoxDecoration(
                color: Colors.white.withValues(alpha: 0.8),
                borderRadius: BorderRadius.circular(999),
              ),
            ),
          ),
          Positioned(
            bottom: 10,
            child: Container(
              width: width,
              height: height * 0.7,
              decoration: BoxDecoration(
                color: color,
                borderRadius: BorderRadius.circular(999),
              ),
            ),
          ),
        ],
      ),
    );
  }
}

class _WindowPane extends StatelessWidget {
  const _WindowPane();

  @override
  Widget build(BuildContext context) {
    return Expanded(
      child: Container(
        decoration: BoxDecoration(
          color: const Color(0xFFFFFFFF),
          borderRadius: BorderRadius.circular(10),
          border: Border.all(color: const Color(0xFFD6E0E8)),
        ),
      ),
    );
  }
}

class _Plant extends StatelessWidget {
  const _Plant({required this.height, required this.width});

  final double height;
  final double width;

  @override
  Widget build(BuildContext context) {
    return SizedBox(
      width: width,
      height: height,
      child: Stack(
        alignment: Alignment.bottomCenter,
        children: [
          Positioned(
            bottom: 0,
            child: Container(
              width: width * 0.35,
              height: height * 0.28,
              decoration: BoxDecoration(
                color: const Color(0xFFB88956),
                borderRadius: BorderRadius.circular(999),
              ),
            ),
          ),
          Positioned(
            bottom: 4,
            child: Container(
              width: width,
              height: height * 0.8,
              decoration: BoxDecoration(
                color: const Color(0xFF7DB164),
                borderRadius: BorderRadius.circular(999),
              ),
            ),
          ),
        ],
      ),
    );
  }
}

class _BackgroundOrbs extends StatelessWidget {
  const _BackgroundOrbs();

  @override
  Widget build(BuildContext context) {
    return const IgnorePointer(
      child: Stack(
        children: [
          Positioned(
            top: -50,
            right: -40,
            child: _Orb(size: 160, color: Color(0x14F09A2A)),
          ),
          Positioned(
            left: -48,
            top: 120,
            child: _Orb(size: 120, color: Color(0x10D9AE64)),
          ),
          Positioned(
            bottom: 80,
            right: -30,
            child: _Orb(size: 100, color: Color(0x10C19A66)),
          ),
        ],
      ),
    );
  }
}

class _Orb extends StatelessWidget {
  const _Orb({required this.size, required this.color});

  final double size;
  final Color color;

  @override
  Widget build(BuildContext context) {
    return Container(
      width: size,
      height: size,
      decoration: BoxDecoration(shape: BoxShape.circle, color: color),
    );
  }
}
