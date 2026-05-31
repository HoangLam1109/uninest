import 'package:flutter/material.dart';
import 'home_page.dart';

class BookingSuccessPage extends StatelessWidget {
  final String bookingId;
  final String roomTitle;
  final String date;
  final String total;

  const BookingSuccessPage({
    super.key,
    required this.bookingId,
    required this.roomTitle,
    required this.date,
    required this.total,
  });

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFF7F1E8),
      appBar: AppBar(
        backgroundColor: const Color(0xFFF7F1E8),
        elevation: 0,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back_rounded, color: Color(0xFF2F2721)),
          onPressed: () => Navigator.of(context).pop(),
        ),
        title: const Text(
          'Xác nhận đặt phòng',
          style: TextStyle(
            color: Color(0xFF2F2721),
            fontWeight: FontWeight.w800,
          ),
        ),
        centerTitle: true,
      ),
      body: LayoutBuilder(
        builder: (context, constraints) {
          return SingleChildScrollView(
            child: ConstrainedBox(
              constraints: BoxConstraints(minHeight: constraints.maxHeight),
              child: IntrinsicHeight(
                child: Padding(
                  padding: const EdgeInsets.all(16),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Container(
                        width: double.infinity,
                        height: 180,
                        decoration: BoxDecoration(
                          color: Colors.grey.shade300,
                          borderRadius: BorderRadius.circular(12),
                          image: const DecorationImage(
                            image: AssetImage('assets/placeholder.jpg'),
                            fit: BoxFit.cover,
                          ),
                        ),
                      ),
                      const SizedBox(height: 20),
                      Center(
                        child: Container(
                          width: 64,
                          height: 64,
                          decoration: const BoxDecoration(
                            color: Color(0xFFF09A2A),
                            shape: BoxShape.circle,
                          ),
                          child: const Icon(
                            Icons.check,
                            color: Colors.white,
                            size: 36,
                          ),
                        ),
                      ),
                      const SizedBox(height: 16),
                      Center(
                        child: Column(
                          children: const [
                            Text(
                              'Đặt phòng thành công!',
                              style: TextStyle(
                                fontSize: 22,
                                fontWeight: FontWeight.w900,
                              ),
                            ),
                            SizedBox(height: 8),
                          ],
                        ),
                      ),
                      const SizedBox(height: 18),
                      Container(
                        width: double.infinity,
                        padding: const EdgeInsets.all(14),
                        decoration: BoxDecoration(
                          color: Colors.white,
                          borderRadius: BorderRadius.circular(12),
                        ),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            const Text(
                              'Chi tiết đặt phòng',
                              style: TextStyle(fontWeight: FontWeight.w800),
                            ),
                            const SizedBox(height: 12),
                            Row(
                              mainAxisAlignment: MainAxisAlignment.spaceBetween,
                              children: [
                                const Text('Mã đặt phòng'),
                                Text(
                                  bookingId,
                                  style: const TextStyle(
                                    fontWeight: FontWeight.w800,
                                  ),
                                ),
                              ],
                            ),
                            const SizedBox(height: 8),
                            Row(
                              mainAxisAlignment: MainAxisAlignment.spaceBetween,
                              children: [
                                const Text('Chỗ ở'),
                                Flexible(
                                  child: Text(
                                    roomTitle,
                                    textAlign: TextAlign.right,
                                    style: const TextStyle(
                                      fontWeight: FontWeight.w700,
                                    ),
                                  ),
                                ),
                              ],
                            ),
                            const SizedBox(height: 8),
                            Row(
                              mainAxisAlignment: MainAxisAlignment.spaceBetween,
                              children: [
                                const Text('Ngày nhận phòng'),
                                Text(
                                  date,
                                  style: const TextStyle(
                                    fontWeight: FontWeight.w700,
                                  ),
                                ),
                              ],
                            ),
                            const SizedBox(height: 8),
                            Row(
                              mainAxisAlignment: MainAxisAlignment.spaceBetween,
                              children: [
                                const Text('Tổng thanh toán'),
                                Text(
                                  total,
                                  style: const TextStyle(
                                    fontSize: 18,
                                    fontWeight: FontWeight.w900,
                                    color: Color(0xFFF09A2A),
                                  ),
                                ),
                              ],
                            ),
                            const SizedBox(height: 12),
                            SizedBox(
                              width: double.infinity,
                              child: OutlinedButton.icon(
                                onPressed: () {},
                                icon: const Icon(Icons.download),
                                label: const Text('Tải hóa đơn thanh toán'),
                              ),
                            ),
                          ],
                        ),
                      ),
                      const SizedBox(height: 24),

                      // Các bước tiếp theo
                      const Text(
                        'Các bước tiếp theo',
                        style: TextStyle(
                          fontSize: 18,
                          fontWeight: FontWeight.w800,
                        ),
                      ),
                      const SizedBox(height: 12),
                      _NextStep(
                        number: 1,
                        title: 'Kiểm tra Email',
                        description:
                            'Chúng tôi đã gửi một bản biên nhận và hướng dẫn chi tiết tới email của bạn.',
                      ),
                      const SizedBox(height: 8),
                      _NextStep(
                        number: 2,
                        title: 'Cập nhật hồ sơ sinh viên',
                        description:
                            'Vui lòng tải lên ảnh thẻ sinh viên hoặc giấy báo nhập học để hoàn tất thủ tục.',
                      ),
                      const SizedBox(height: 8),
                      _NextStep(
                        number: 3,
                        title: 'Nhận phòng',
                        description:
                            'Đến quầy lễ tân UniNest vào ngày nhận phòng để nhận chìa khóa và thẻ cư dân.',
                      ),

                      const SizedBox(height: 18),
                      const Expanded(child: SizedBox()),
                      Padding(
                        padding: const EdgeInsets.only(bottom: 8.0),
                        child: Center(
                          child: ElevatedButton.icon(
                            onPressed: () =>
                                Navigator.of(context).pushAndRemoveUntil(
                                  MaterialPageRoute(
                                    builder: (_) =>
                                        const HomePage(showBottomNav: true),
                                  ),
                                  (route) => false,
                                ),
                            icon: const Icon(Icons.home),
                            label: const Text('Quay lại Trang chủ'),
                            style: ElevatedButton.styleFrom(
                              backgroundColor: const Color(0xFFF09A2A),
                              padding: const EdgeInsets.symmetric(
                                horizontal: 24,
                                vertical: 14,
                              ),
                            ),
                          ),
                        ),
                      ),
                    ],
                  ),
                ),
              ),
            ),
          );
        },
      ),
    );
  }
}

class _NextStep extends StatelessWidget {
  final int number;
  final String title;
  final String description;

  const _NextStep({
    required this.number,
    required this.title,
    required this.description,
  });

  @override
  Widget build(BuildContext context) {
    return Row(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Container(
          width: 36,
          height: 36,
          decoration: BoxDecoration(
            color: const Color(0xFFF9E6CF),
            shape: BoxShape.circle,
          ),
          child: Center(
            child: Text(
              number.toString(),
              style: const TextStyle(
                fontWeight: FontWeight.w700,
                color: Color(0xFFF09A2A),
              ),
            ),
          ),
        ),
        const SizedBox(width: 12),
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(title, style: const TextStyle(fontWeight: FontWeight.w800)),
              const SizedBox(height: 6),
              Text(
                description,
                style: const TextStyle(color: Color(0xFF7A7064)),
              ),
            ],
          ),
        ),
      ],
    );
  }
}
