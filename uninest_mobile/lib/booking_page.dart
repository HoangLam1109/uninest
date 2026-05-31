import 'package:flutter/material.dart';
import 'booking_success_page.dart';

class BookingPage extends StatefulWidget {
  const BookingPage({super.key});

  @override
  State<BookingPage> createState() => _BookingPageState();
}

class _BookingPageState extends State<BookingPage> {
  String _selectedPayment = 'bank';
  DateTime? _selectedDate;
  int _selectedTerm = 6; // months
  final int _monthlyPrice = 8500000;
  final int _serviceFee = 200000;

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
          'Đặt phòng UniNest',
          style: TextStyle(
            color: Color(0xFF2F2721),
            fontWeight: FontWeight.w800,
          ),
        ),
        centerTitle: true,
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.fromLTRB(16, 18, 16, 28),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Room summary card
            Container(
              width: double.infinity,
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(14),
                boxShadow: const [
                  BoxShadow(
                    color: Color(0x11000000),
                    blurRadius: 12,
                    offset: Offset(0, 6),
                  ),
                ],
              ),
              padding: const EdgeInsets.all(14),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: [
                      Container(
                        width: 86,
                        height: 66,
                        decoration: BoxDecoration(
                          borderRadius: BorderRadius.circular(8),
                          color: const Color(0xFFEFE8DC),
                        ),
                      ),
                      const SizedBox(width: 12),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: const [
                            Text(
                              'Studio Ban công - Quận 1',
                              style: TextStyle(
                                fontSize: 16,
                                fontWeight: FontWeight.w800,
                              ),
                            ),
                            SizedBox(height: 6),
                            Text(
                              'Đa Kao, Quận 1, TP. HCM',
                              style: TextStyle(color: Color(0xFF7A7064)),
                            ),
                          ],
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 12),
                  const Divider(color: Color(0xFFECE3D7)),
                  const SizedBox(height: 12),
                  Row(
                    children: [
                      Expanded(
                        child: Text(
                          'Giá thuê (${_selectedTerm} tháng)',
                          style: const TextStyle(color: Color(0xFF768095)),
                        ),
                      ),
                      Text(
                        '${_formatCurrency(_monthlyPrice)}b / tháng',
                        style: const TextStyle(fontWeight: FontWeight.w800),
                      ),
                    ],
                  ),
                  const SizedBox(height: 8),
                  Row(
                    children: [
                      const Expanded(
                        child: Text(
                          'Tiền đặt cọc (1 tháng)',
                          style: TextStyle(color: Color(0xFF768095)),
                        ),
                      ),
                      Text(
                        '${_formatCurrency(_monthlyPrice)}b',
                        style: const TextStyle(fontWeight: FontWeight.w800),
                      ),
                    ],
                  ),
                  const SizedBox(height: 8),
                  Row(
                    children: [
                      const Expanded(
                        child: Text(
                          'Phí dịch vụ',
                          style: TextStyle(color: Color(0xFF768095)),
                        ),
                      ),
                      Text(
                        '${_formatCurrency(_serviceFee)}b',
                        style: const TextStyle(fontWeight: FontWeight.w800),
                      ),
                    ],
                  ),
                  const SizedBox(height: 12),
                  const Divider(color: Color(0xFFECE3D7)),
                  const SizedBox(height: 12),
                  Row(
                    children: [
                      const Expanded(
                        child: Text(
                          'Tổng thanh toán dự kiến',
                          style: TextStyle(fontWeight: FontWeight.w800),
                        ),
                      ),
                      Text(
                        _formatCurrency(_monthlyPrice * 2 + _serviceFee) + 'đ',
                        style: const TextStyle(
                          fontSize: 18,
                          fontWeight: FontWeight.w900,
                          color: Color(0xFFF09A2A),
                        ),
                      ),
                    ],
                  ),
                ],
              ),
            ),
            const SizedBox(height: 18),

            const Text(
              'Ngày nhận phòng',
              style: TextStyle(fontSize: 18, fontWeight: FontWeight.w800),
            ),
            const SizedBox(height: 12),
            GestureDetector(
              onTap: () async {
                final now = DateTime.now();
                final picked = await showDatePicker(
                  context: context,
                  initialDate:
                      _selectedDate ?? now.add(const Duration(days: 1)),
                  firstDate: now,
                  lastDate: now.add(const Duration(days: 365)),
                );
                if (picked != null) setState(() => _selectedDate = picked);
              },
              child: Container(
                width: double.infinity,
                padding: const EdgeInsets.symmetric(
                  horizontal: 14,
                  vertical: 16,
                ),
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(12),
                  border: Border.all(color: const Color(0xFFECE6DE)),
                ),
                child: Row(
                  children: [
                    const Icon(
                      Icons.calendar_month_outlined,
                      color: Color(0xFF7A7064),
                    ),
                    const SizedBox(width: 12),
                    Expanded(
                      child: Text(
                        _selectedDate == null
                            ? 'Chọn ngày nhận phòng'
                            : '${_selectedDate!.day}/${_selectedDate!.month}/${_selectedDate!.year}',
                        style: const TextStyle(
                          fontWeight: FontWeight.w700,
                          color: Color(0xFF2F2721),
                        ),
                      ),
                    ),
                    const Icon(Icons.chevron_right, color: Color(0xFFB4ADA2)),
                  ],
                ),
              ),
            ),
            const SizedBox(height: 16),

            const Text(
              'Thời hạn thuê',
              style: TextStyle(fontSize: 18, fontWeight: FontWeight.w800),
            ),
            const SizedBox(height: 12),
            Row(
              children: [
                ChoiceChip(
                  label: const Text(
                    'NGẮN HẠN\n6 tháng',
                    textAlign: TextAlign.center,
                  ),
                  selected: _selectedTerm == 6,
                  onSelected: (_) => setState(() => _selectedTerm = 6),
                  selectedColor: const Color(0xFFFDF0E2),
                  backgroundColor: Colors.white,
                  padding: const EdgeInsets.symmetric(
                    horizontal: 12,
                    vertical: 10,
                  ),
                ),
                const SizedBox(width: 8),
                ChoiceChip(
                  label: const Text(
                    'PHỔ BIẾN\n12 tháng',
                    textAlign: TextAlign.center,
                  ),
                  selected: _selectedTerm == 12,
                  onSelected: (_) => setState(() => _selectedTerm = 12),
                  selectedColor: const Color(0xFFFDF0E2),
                  backgroundColor: Colors.white,
                  padding: const EdgeInsets.symmetric(
                    horizontal: 12,
                    vertical: 10,
                  ),
                ),
                const SizedBox(width: 8),
                ChoiceChip(
                  label: const Text(
                    'ƯU ĐÃI\n24 tháng',
                    textAlign: TextAlign.center,
                  ),
                  selected: _selectedTerm == 24,
                  onSelected: (_) => setState(() => _selectedTerm = 24),
                  selectedColor: const Color(0xFFFDF0E2),
                  backgroundColor: Colors.white,
                  padding: const EdgeInsets.symmetric(
                    horizontal: 12,
                    vertical: 10,
                  ),
                ),
              ],
            ),
            const SizedBox(height: 18),

            const Text(
              'Phương thức thanh toán',
              style: TextStyle(fontSize: 18, fontWeight: FontWeight.w800),
            ),
            const SizedBox(height: 12),

            _PaymentOption(
              value: 'bank',
              groupValue: _selectedPayment,
              title: 'Chuyển khoản ngân hàng',
              subtitle: 'Xác nhận nhanh trong 5-10 phút',
              onChanged: (v) => setState(() => _selectedPayment = v!),
            ),
            const SizedBox(height: 10),
            _PaymentOption(
              value: 'wallet',
              groupValue: _selectedPayment,
              title: 'Ví điện tử (Momo, ZaloPay)',
              subtitle: 'Thanh toán tức thì, bảo mật cao',
              onChanged: (v) => setState(() => _selectedPayment = v!),
            ),
            const SizedBox(height: 10),
            _PaymentOption(
              value: 'card',
              groupValue: _selectedPayment,
              title: 'Thẻ quốc tế (Visa, Mastercard)',
              subtitle: 'Hỗ trợ trả góp 0% lãi suất',
              onChanged: (v) => setState(() => _selectedPayment = v!),
            ),
            const SizedBox(height: 18),

            Container(
              width: double.infinity,
              padding: const EdgeInsets.all(14),
              decoration: BoxDecoration(
                color: const Color(0xFFF9F2E8),
                borderRadius: BorderRadius.circular(12),
                border: Border.all(color: const Color(0xFFE6DCCC)),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: const [
                  Text(
                    'Chính sách hủy phòng',
                    style: TextStyle(fontWeight: FontWeight.w800),
                  ),
                  SizedBox(height: 8),
                  Text(
                    'Hoàn trả 100% tiền cọc nếu hủy trước ngày nhận phòng 07 ngày. Sau thời gian này, phí hủy sẽ tương đương 50% tiền cọc.',
                  ),
                ],
              ),
            ),
            const SizedBox(height: 18),
          ],
        ),
      ),
      bottomNavigationBar: Container(
        color: Colors.white,
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
        child: Row(
          children: [
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                mainAxisSize: MainAxisSize.min,
                children: [
                  const Text(
                    'Bạn sẽ thanh toán ngày:',
                    style: TextStyle(color: Color(0xFF7A7064)),
                  ),
                  const SizedBox(height: 6),
                  Text(
                    _formatCurrency(_monthlyPrice * 2 + _serviceFee) + 'đ',
                    style: const TextStyle(
                      fontSize: 18,
                      fontWeight: FontWeight.w900,
                      color: Color(0xFFF09A2A),
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(width: 12),
            SizedBox(
              height: 56,
              child: ElevatedButton(
                onPressed: () {
                  final bId =
                      'UN-${DateTime.now().millisecondsSinceEpoch.toString().substring(7)}';
                  final dateStr = _selectedDate == null
                      ? 'Chưa chọn'
                      : '${_selectedDate!.day}/${_selectedDate!.month}/${_selectedDate!.year}';
                  final total =
                      _formatCurrency(_monthlyPrice * 2 + _serviceFee) + 'đ';
                  Navigator.of(context).push(
                    MaterialPageRoute(
                      builder: (_) => BookingSuccessPage(
                        bookingId: bId,
                        roomTitle: 'Studio Ban công - Quận 1',
                        date: dateStr,
                        total: total,
                      ),
                    ),
                  );
                },
                style: ElevatedButton.styleFrom(
                  backgroundColor: const Color(0xFFF09A2A),
                  foregroundColor: Colors.white,
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(12),
                  ),
                  padding: const EdgeInsets.symmetric(horizontal: 18),
                ),
                child: Row(
                  children: const [
                    Text(
                      'Xác nhận &\nThanh toán',
                      textAlign: TextAlign.center,
                      style: TextStyle(fontWeight: FontWeight.w800),
                    ),
                    SizedBox(width: 8),
                    Icon(Icons.arrow_forward, size: 20),
                  ],
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  String _formatCurrency(int v) {
    final s = v.toString();
    final reg = RegExp(r'\B(?=(\d{3})+(?!\d))');
    return s.replaceAllMapped(reg, (m) => '.');
  }
}

class _PaymentOption extends StatelessWidget {
  const _PaymentOption({
    required this.value,
    required this.groupValue,
    required this.title,
    required this.subtitle,
    required this.onChanged,
  });

  final String value;
  final String groupValue;
  final String title;
  final String subtitle;
  final ValueChanged<String?> onChanged;

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: () => onChanged(value),
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 14),
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(12),
          border: Border.all(color: const Color(0xFFECE6DE)),
        ),
        child: Row(
          children: [
            Radio<String>(
              value: value,
              groupValue: groupValue,
              onChanged: onChanged,
              activeColor: const Color(0xFFF09A2A),
            ),
            const SizedBox(width: 8),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    title,
                    style: const TextStyle(fontWeight: FontWeight.w800),
                  ),
                  const SizedBox(height: 6),
                  Text(
                    subtitle,
                    style: const TextStyle(color: Color(0xFF7A7064)),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}
