import 'package:flutter/material.dart';

import 'home_page.dart';
import 'search_page.dart';
import 'saved_page.dart';

class BottomNavBar extends StatefulWidget {
  const BottomNavBar({super.key, this.initialIndex = 1});

  final int initialIndex;

  @override
  State<BottomNavBar> createState() => _BottomNavBarState();
}

class _BottomNavBarState extends State<BottomNavBar> {
  late int _selectedIndex;

  @override
  void initState() {
    super.initState();
    _selectedIndex = widget.initialIndex;
  }

  void _onTap(int index) {
    setState(() => _selectedIndex = index);

    // delay so user sees selection color
    Future.delayed(const Duration(milliseconds: 140), () {
      if (!mounted) return;
      if (index == 0) {
        Navigator.of(context).pushReplacement(
          MaterialPageRoute(
            builder: (_) => const HomePage(showBottomNav: true),
          ),
        );
        return;
      }
      if (index == 1) {
        Navigator.of(context).pushReplacement(
          MaterialPageRoute(builder: (_) => const SearchPage(initialIndex: 1)),
        );
        return;
      }
      if (index == 2) {
        Navigator.of(
          context,
        ).pushReplacement(MaterialPageRoute(builder: (_) => const SavedPage()));
        return;
      }
      // for messages and profile, keep selection visual only
    });
  }

  @override
  Widget build(BuildContext context) {
    final colorSelected = const Color(0xFFF09A2A);
    final colorUnselected = const Color(0xFF9A8B78);

    Widget _item(IconData icon, String label, int index) => GestureDetector(
      onTap: () => _onTap(index),
      behavior: HitTestBehavior.opaque,
      child: SizedBox(
        width: 72,
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(
              icon,
              size: 22,
              color: _selectedIndex == index ? colorSelected : colorUnselected,
            ),
            const SizedBox(height: 4),
            Text(
              label,
              style: TextStyle(
                fontSize: 12,
                fontWeight: FontWeight.w700,
                color: _selectedIndex == index
                    ? colorSelected
                    : colorUnselected,
              ),
            ),
          ],
        ),
      ),
    );

    return Container(
      color: Colors.white,
      child: SafeArea(
        top: false,
        child: SizedBox(
          height: 64,
          child: Row(
            mainAxisAlignment: MainAxisAlignment.spaceAround,
            children: [
              _item(Icons.home_outlined, 'Trang chủ', 0),
              _item(Icons.explore_outlined, 'Khám phá', 1),
              _item(Icons.favorite_border_rounded, 'Đã lưu', 2),
              _item(Icons.chat_bubble_outline_rounded, 'Tin nhắn', 3),
              _item(Icons.person_outline_rounded, 'Cá nhân', 4),
            ],
          ),
        ),
      ),
    );
  }
}
