# FraudGuard SDK — React Native

## Instalasi

```bash
npm install @bank-indonesia/fraudguard-rn
# atau
yarn add @bank-indonesia/fraudguard-rn
```

### Linking (React Native < 0.60)

```bash
npx react-native link @bank-indonesia/fraudguard-rn
```

> React Native 0.60+ menggunakan auto-linking, tidak perlu langkah manual.

## Minimum Requirements

| Requirement | Version |
|------------|---------|
| React Native | 0.72+ |
| Node.js | 18+ |
| iOS | 15.0+ |
| Android API | 24+ |

## Konfigurasi Platform

### Android

Tambahkan di `android/app/build.gradle`:

```groovy
dependencies {
    implementation project(':@bank-indonesia_fraudguard-rn')
}
```

### iOS

```bash
cd ios && pod install
```

## Package.json Entry

```json
{
  "dependencies": {
    "@bank-indonesia/fraudguard-rn": "^2.4.1"
  }
}
```
