// This is a basic Flutter widget test.
//
// To perform an interaction with a widget in your test, use the WidgetTester
// utility in the flutter_test package. For example, you can send tap and scroll
// gestures. You can also use WidgetTester to find child widgets in the widget
// tree, read text, and verify that the values of widget properties are correct.

import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';

import 'package:uninest_mobile/main.dart';

void main() {
  testWidgets('Home landing page renders key sections', (
    WidgetTester tester,
  ) async {
    await tester.pumpWidget(const UninestApp());

    expect(find.text('UniNest'), findsNWidgets(2));
    expect(find.text('Bắt đầu ngay'), findsOneWidget);
    expect(find.text('Chỉ tin đăng đã xác thực'), findsOneWidget);
    expect(find.text('Tại sao sinh viên chọn\nUniNest'), findsOneWidget);
    expect(find.text('Nhà ở tin cậy'), findsOneWidget);
    expect(find.text('Gần trường học'), findsOneWidget);
    expect(find.text('Hỗ trợ sinh viên'), findsOneWidget);
    expect(find.text('Căn hộ sinh viên tiêu biểu'), findsOneWidget);
    expect(find.text('Căn hộ The Scholar - Quận 1'), findsOneWidget);
    expect(find.text('Skyline Lofts - Bình Thạnh'), findsOneWidget);
    expect(find.text('Are you a\nlandlord?'), findsOneWidget);
    expect(find.text('List Your Property'), findsOneWidget);
    expect(find.text('Learn More'), findsOneWidget);
    expect(find.text('UniNest'), findsNWidgets(2));

    await tester.tap(find.text('Bắt đầu ngay'));
    await tester.pumpAndSettle();

    expect(find.text('Đăng nhập (HCMC)'), findsOneWidget);
    expect(find.text('Đăng nhập Sinh viên'), findsOneWidget);
    expect(find.widgetWithText(FilledButton, 'Đăng nhập'), findsOneWidget);

    await tester.scrollUntilVisible(
      find.widgetWithText(FilledButton, 'Đăng nhập'),
      200,
      scrollable: find.byType(Scrollable).last,
    );

    await tester.tap(find.widgetWithText(FilledButton, 'Đăng nhập'));
    await tester.pumpAndSettle();

    expect(find.text('Tìm UniNest của bạn'), findsOneWidget);

    await tester.scrollUntilVisible(
      find.text('Căn hộ Landmark'),
      200,
      scrollable: find.byType(Scrollable).last,
    );
    final landmarkCard = find.ancestor(
      of: find.text('Căn hộ Landmark'),
      matching: find.byType(InkWell),
    );
    await tester.tap(landmarkCard);
    await tester.pumpAndSettle();

    expect(find.text('Chi tiết phòng'), findsOneWidget);
    expect(find.text('Phòng Studio Cao cấp UniNest'), findsOneWidget);

    await tester.scrollUntilVisible(
      find.text('Chủ nhà: Nguyễn\nVăn A'),
      200,
      scrollable: find.byType(Scrollable).last,
    );
    expect(
      find.text('Chủ nhà đã xác minh • 3 năm kinh nghiệm'),
      findsOneWidget,
    );
    expect(find.text('Vị trí'), findsOneWidget);
    expect(find.text('5 phút đến Cơ sở\nchính'), findsOneWidget);
    expect(find.text('2 phút đến Trạm xe\nbuýt'), findsOneWidget);

    await tester.scrollUntilVisible(
      find.text('NGÀY DỌN VÀO'),
      200,
      scrollable: find.byType(Scrollable).last,
    );
    expect(
      find.byWidgetPredicate(
        (widget) =>
            widget is RichText &&
            widget.text.toPlainText().contains('15.000.000đ'),
      ),
      findsWidgets,
    );
    expect(find.text('NGÀY DỌN VÀO'), findsOneWidget);
    expect(find.text('25 tháng 8, 2024'), findsOneWidget);
    expect(find.text('THỜI HẠN THUÊ'), findsOneWidget);
    expect(find.text('12 Tháng'), findsOneWidget);
    expect(find.text('Tiền đặt cọc'), findsOneWidget);
    expect(find.text('Phí dịch vụ'), findsOneWidget);
    expect(find.text('Tổng thanh toán hôm nay'), findsOneWidget);
    expect(find.text('Đặt ngay'), findsWidgets);
  });
}
