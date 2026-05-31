import 'package:flutter/material.dart';
import 'home_page.dart';

void main() {
  runApp(const UninestApp());
}

class UninestApp extends StatelessWidget {
  const UninestApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      debugShowCheckedModeBanner: false,
      title: 'Uninest',
      theme: ThemeData(
        useMaterial3: true,
        colorScheme: ColorScheme.fromSeed(
          seedColor: const Color(0xFFF09A2A),
          brightness: Brightness.light,
        ),
        scaffoldBackgroundColor: const Color(0xFFF7F0E3),
        textTheme: const TextTheme(
          headlineLarge: TextStyle(
            fontSize: 28,
            fontWeight: FontWeight.w800,
            letterSpacing: -0.6,
          ),
          headlineMedium: TextStyle(
            fontSize: 22,
            fontWeight: FontWeight.w700,
            letterSpacing: -0.4,
          ),
          titleLarge: TextStyle(fontSize: 18, fontWeight: FontWeight.w700),
          bodyLarge: TextStyle(fontSize: 16, height: 1.4),
          bodyMedium: TextStyle(fontSize: 14, height: 1.45),
        ),
      ),
      home: const HomePage(),
    );
  }
}
