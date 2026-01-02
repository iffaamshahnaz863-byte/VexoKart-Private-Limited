# VexoKart Flutter Mobile App

A premium, production-ready mobile application built with Flutter and Supabase.

## Features
- Full Supabase Auth & DB integration
- Razorpay Online Payments (UPI/Cards/Netbanking)
- Automated GST (18%) Calculation
- Post-checkout PDF Invoicing
- Transactional Emails (via Edge Functions)

## Setup Steps
1. **Prerequisites**: Ensure Flutter SDK (Stable) is installed.
2. **Install Deps**: Run `flutter pub get`.
3. **Android Configuration**:
   - Ensure your `android/app/build.gradle` has `minSdkVersion 19`.
   - Update `AndroidManifest.xml` with Razorpay/Browser intents.
4. **Environment**:
   - Supabase URL: `https://ghzadiplpazekzgjbdxu.supabase.co`
   - Razorpay Key: `rzp_live_RxmIholkGEOYaL` (Already configured in `payment_service.dart`)
5. **Run**: `flutter run`

## Backend Requirement
The app calls a Supabase Edge Function `send-invoice` to dispatch emails from `bictcomputereducation1@gmail.com`. Ensure this function is deployed in your Supabase project.
