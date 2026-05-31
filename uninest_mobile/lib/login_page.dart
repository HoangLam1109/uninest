import 'package:flutter/material.dart';

import 'search_page.dart';

class LoginPage extends StatefulWidget {
  const LoginPage({super.key});

  @override
  State<LoginPage> createState() => _LoginPageState();
}

class _LoginPageState extends State<LoginPage> {
  int selectedTab = 0;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFEDEDED),
      body: SafeArea(
        child: SingleChildScrollView(
          child: Padding(
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Text(
                  'Đăng nhập (HCMC)',
                  style: TextStyle(
                    fontSize: 24,
                    fontWeight: FontWeight.w500,
                    color: Color(0xFF9A9A9A),
                  ),
                ),
                const SizedBox(height: 14),
                Container(
                  width: double.infinity,
                  padding: const EdgeInsets.fromLTRB(18, 28, 18, 26),
                  decoration: BoxDecoration(
                    color: const Color(0xFFF8F2E8),
                    borderRadius: BorderRadius.circular(2),
                  ),
                  child: Column(
                    children: [
                      Container(
                        width: 74,
                        height: 74,
                        decoration: BoxDecoration(
                          color: const Color(0xFFF3E8D2),
                          borderRadius: BorderRadius.circular(999),
                        ),
                        child: const Icon(
                          Icons.school_rounded,
                          color: Color(0xFFF09A2A),
                          size: 40,
                        ),
                      ),
                      const SizedBox(height: 18),
                      const Text(
                        'UniNest',
                        style: TextStyle(
                          fontSize: 34,
                          fontWeight: FontWeight.w900,
                          color: Color(0xFF1F2440),
                        ),
                      ),
                      const SizedBox(height: 4),
                      const Text(
                        'Ngôi nhà của bạn xa giảng đường',
                        textAlign: TextAlign.center,
                        style: TextStyle(
                          fontSize: 16,
                          color: Color(0xFF5F687E),
                        ),
                      ),
                      const SizedBox(height: 26),
                      Container(
                        decoration: const BoxDecoration(
                          border: Border(
                            bottom: BorderSide(color: Color(0xFFE8D9BF)),
                          ),
                        ),
                        child: Row(
                          children: [
                            Expanded(
                              child: GestureDetector(
                                onTap: () => setState(() => selectedTab = 0),
                                child: Column(
                                  mainAxisSize: MainAxisSize.min,
                                  children: [
                                    Padding(
                                      padding: const EdgeInsets.symmetric(
                                        vertical: 14,
                                      ),
                                      child: Text(
                                        'Đăng nhập Sinh viên',
                                        textAlign: TextAlign.center,
                                        style: TextStyle(
                                          fontSize: 14,
                                          fontWeight: FontWeight.w800,
                                          color: selectedTab == 0
                                              ? const Color(0xFFF09A2A)
                                              : const Color(0xFF6D7588),
                                        ),
                                      ),
                                    ),
                                    Container(
                                      height: 3,
                                      color: selectedTab == 0
                                          ? const Color(0xFFF09A2A)
                                          : Colors.transparent,
                                    ),
                                  ],
                                ),
                              ),
                            ),
                            Expanded(
                              child: GestureDetector(
                                onTap: () => setState(() => selectedTab = 1),
                                child: Column(
                                  mainAxisSize: MainAxisSize.min,
                                  children: [
                                    Padding(
                                      padding: const EdgeInsets.symmetric(
                                        vertical: 14,
                                      ),
                                      child: Text(
                                        'Đăng nhập Cho nhà',
                                        textAlign: TextAlign.center,
                                        style: TextStyle(
                                          fontSize: 14,
                                          fontWeight: FontWeight.w800,
                                          color: selectedTab == 1
                                              ? const Color(0xFFF09A2A)
                                              : const Color(0xFF6D7588),
                                        ),
                                      ),
                                    ),
                                    Container(
                                      height: 3,
                                      color: selectedTab == 1
                                          ? const Color(0xFFF09A2A)
                                          : Colors.transparent,
                                    ),
                                  ],
                                ),
                              ),
                            ),
                          ],
                        ),
                      ),
                      const SizedBox(height: 18),
                      ClipRRect(
                        borderRadius: BorderRadius.circular(14),
                        child: Container(
                          height: 180,
                          width: double.infinity,
                          decoration: const BoxDecoration(
                            gradient: LinearGradient(
                              begin: Alignment.topLeft,
                              end: Alignment.bottomRight,
                              colors: [Color(0xFFD9D8D5), Color(0xFFF3EEE5)],
                            ),
                          ),
                          child: const Center(
                            child: Icon(
                              Icons.people_alt_rounded,
                              color: Color(0xFF8A8A8A),
                              size: 88,
                            ),
                          ),
                        ),
                      ),
                      const SizedBox(height: 18),
                      _FieldLabel(text: 'Địa chỉ Email'),
                      const SizedBox(height: 10),
                      _InputBox(
                        icon: Icons.mail_outline_rounded,
                        hintText: 'ten@truong.edu.vn',
                      ),
                      const SizedBox(height: 16),
                      Row(
                        children: const [
                          Expanded(child: _FieldLabel(text: 'Mật khẩu')),
                          Text(
                            'Quên mật khẩu?',
                            style: TextStyle(
                              fontSize: 14,
                              fontWeight: FontWeight.w700,
                              color: Color(0xFFF09A2A),
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 10),
                      _InputBox(
                        icon: Icons.lock_outline_rounded,
                        hintText: '••••••••',
                        trailingIcon: Icons.visibility_outlined,
                      ),
                      const SizedBox(height: 18),
                      SizedBox(
                        width: double.infinity,
                        height: 58,
                        child: FilledButton(
                          onPressed: () {
                            Navigator.of(context).pushReplacement(
                              MaterialPageRoute(
                                builder: (_) =>
                                    const SearchPage(initialIndex: 1),
                              ),
                            );
                          },
                          style: FilledButton.styleFrom(
                            backgroundColor: const Color(0xFFF09A2A),
                            foregroundColor: Colors.white,
                            shape: RoundedRectangleBorder(
                              borderRadius: BorderRadius.circular(12),
                            ),
                          ),
                          child: const Text(
                            'Đăng nhập',
                            style: TextStyle(
                              fontSize: 18,
                              fontWeight: FontWeight.w800,
                            ),
                          ),
                        ),
                      ),
                      const SizedBox(height: 22),
                      const Row(
                        children: [
                          Expanded(child: Divider(color: Color(0xFFDEE2EC))),
                          Padding(
                            padding: EdgeInsets.symmetric(horizontal: 12),
                            child: Text(
                              'HOẶC TIẾP TỤC VỚI',
                              style: TextStyle(
                                fontSize: 13,
                                fontWeight: FontWeight.w700,
                                color: Color(0xFF9AA4B7),
                              ),
                            ),
                          ),
                          Expanded(child: Divider(color: Color(0xFFDEE2EC))),
                        ],
                      ),
                      const SizedBox(height: 18),
                      Row(
                        children: [
                          Expanded(
                            child: _SocialButton(
                              icon: Icons.g_mobiledata,
                              label: 'Google',
                            ),
                          ),
                          const SizedBox(width: 14),
                          Expanded(
                            child: _SocialButton(
                              icon: Icons.apple,
                              label: 'Apple',
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 22),
                      const Text.rich(
                        TextSpan(
                          children: [
                            TextSpan(
                              text: 'Bạn chưa có tài khoản? ',
                              style: TextStyle(
                                fontSize: 15,
                                color: Color(0xFF5F687E),
                              ),
                            ),
                            TextSpan(
                              text: 'Đăng ký ngay',
                              style: TextStyle(
                                fontSize: 15,
                                fontWeight: FontWeight.w800,
                                color: Color(0xFFF09A2A),
                              ),
                            ),
                          ],
                        ),
                        textAlign: TextAlign.center,
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}

class _FieldLabel extends StatelessWidget {
  const _FieldLabel({required this.text});

  final String text;

  @override
  Widget build(BuildContext context) {
    return Text(
      text,
      style: const TextStyle(
        fontSize: 16,
        fontWeight: FontWeight.w800,
        color: Color(0xFF1F2432),
      ),
    );
  }
}

class _InputBox extends StatelessWidget {
  const _InputBox({
    required this.icon,
    required this.hintText,
    this.trailingIcon,
  });

  final IconData icon;
  final String hintText;
  final IconData? trailingIcon;

  @override
  Widget build(BuildContext context) {
    return Container(
      height: 58,
      padding: const EdgeInsets.symmetric(horizontal: 12),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(10),
        border: Border.all(color: const Color(0xFFDDE3EF)),
      ),
      child: Row(
        children: [
          Icon(icon, color: const Color(0xFF9AA4B7), size: 22),
          const SizedBox(width: 12),
          Expanded(
            child: Text(
              hintText,
              style: const TextStyle(
                fontSize: 16,
                color: Color(0xFF80889B),
                fontWeight: FontWeight.w500,
              ),
            ),
          ),
          if (trailingIcon != null)
            Icon(trailingIcon, color: const Color(0xFF9AA4B7), size: 22),
        ],
      ),
    );
  }
}

class _SocialButton extends StatelessWidget {
  const _SocialButton({required this.icon, required this.label});

  final IconData icon;
  final String label;

  @override
  Widget build(BuildContext context) {
    return Container(
      height: 50,
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(10),
        border: Border.all(color: const Color(0xFFDDE3EF)),
      ),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(icon, color: const Color(0xFF3F4658), size: 24),
          const SizedBox(width: 8),
          Text(
            label,
            style: const TextStyle(
              fontSize: 16,
              fontWeight: FontWeight.w700,
              color: Color(0xFF3F4658),
            ),
          ),
        ],
      ),
    );
  }
}
