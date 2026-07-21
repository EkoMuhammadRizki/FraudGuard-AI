# FraudGuard Mobile SDK — Distribution Package

> **Didistribusikan oleh Bank Indonesia — Divisi Sistem Pembayaran & Keamanan Digital**

## Overview

FraudGuard Mobile SDK adalah pustaka client-side ringan yang dirancang untuk diintegrasikan ke dalam aplikasi mobile banking seluruh bank nasional Indonesia. SDK ini menangkap behavioral telemetry (keystroke dynamics, device integrity, remote access detection) tanpa membaca data sensitif nasabah, lalu mengirimkannya sebagai JWT token terenkripsi ke FraudGuard FDS Engine untuk analisis ensemble ML real-time.

## Arsitektur

```
┌──────────────────────┐    JWT Token     ┌───────────────────┐    Forward    ┌─────────────────────┐
│   Mobile Banking     │ ──────────────── │  Core Banking     │ ────────────  │  FraudGuard FDS     │
│   (SDK Embedded)     │                  │  Gateway          │              │  Engine (AI/ML)     │
│                      │                  │  (Bank BUMN)      │              │  (Bank Indonesia)   │
│  • Keystroke Dwell   │  ◄────────────── │                   │ ◄──────────── │                     │
│  • Device Integrity  │    APPROVED/     │  Mandiri / BRI    │   Decision   │  XGBoost + LightGBM │
│  • Remote Access Det │    BLOCKED       │  BNI / BTN        │              │  + Graph GNN        │
└──────────────────────┘                  └───────────────────┘              └─────────────────────┘
```

## Platform Support

| Platform | Package Format | Distribution |
|----------|---------------|-------------|
| Android (Kotlin/Java) | `.aar` | Maven Central / BI Nexus |
| iOS (Swift/Obj-C) | `.xcframework` | CocoaPods / SPM |
| React Native | NPM Package | BI Private NPM Registry |
| Flutter (Dart) | Pub Package | pub.dev |

## Directory Structure

```
sdk/
├── android/           # Android SDK build instructions
├── ios/               # iOS SDK build instructions
├── react-native/      # React Native wrapper
├── docs/              # Developer documentation
│   └── QUICK_START.md # Integration guide
└── README.md          # This file
```

## Quick Start

Lihat [docs/QUICK_START.md](docs/QUICK_START.md) untuk panduan integrasi lengkap.

## Version

- **Current**: v2.4.1
- **Build Date**: 2026-07-21
- **License**: Bank Indonesia — Proprietary
