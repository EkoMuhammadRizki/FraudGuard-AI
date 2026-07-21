# FraudGuard SDK — iOS (Swift/Objective-C)

## Build Artifact

File `FraudGuardSDK.xcframework` di-generate otomatis oleh CI/CD pipeline Bank Indonesia dan didistribusikan via CocoaPods atau Swift Package Manager.

> **Catatan**: File `.xcframework` tidak disertakan dalam repositori ini karena merupakan binary build artifact.

## Instalasi

### CocoaPods

```ruby
# Podfile
pod 'FraudGuardBI', '~> 2.4.1'
```

Kemudian jalankan:
```bash
pod install
```

### Swift Package Manager

Tambahkan dependency di Xcode:
- **URL**: `https://pkg.bi.go.id/fraudguard-ios-sdk.git`
- **Version**: `2.4.1`

## Minimum Requirements

| Requirement | Version |
|------------|---------|
| iOS | 15.0+ |
| Xcode | 15.0+ |
| Swift | 5.9+ |

## Privacy Manifest (PrivacyInfo.xcprivacy)

SDK mematuhi Apple App Tracking Transparency (ATT) dan **TIDAK** mengumpulkan data yang memerlukan izin ATT:

```xml
<dict>
    <key>NSPrivacyTracking</key>
    <false/>
    <key>NSPrivacyCollectedDataTypes</key>
    <array/>
</dict>
```

## Info.plist

Tidak ada entri tambahan yang diperlukan di `Info.plist`. SDK hanya membutuhkan akses jaringan yang sudah tersedia secara default di iOS.
