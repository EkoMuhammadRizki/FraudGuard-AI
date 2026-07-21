# FraudGuard SDK — Android (Kotlin/Java)

## Build Artifact

File `fraudguard-sdk-v2.4.1.aar` di-generate otomatis oleh CI/CD pipeline Bank Indonesia dan didistribusikan via Maven Central atau Nexus Repository internal BI.

> **Catatan**: File `.aar` tidak disertakan dalam repositori ini karena merupakan binary build artifact. Gunakan dependency Gradle di bawah untuk mengunduh SDK.

## Instalasi

### Gradle (build.gradle - Module: app)

```groovy
dependencies {
    implementation("id.go.bi.fraudguard:sdk-android:2.4.1")
}
```

### Repository (build.gradle - Project level)

```groovy
repositories {
    google()
    mavenCentral()
    // BI Private Maven (jika diperlukan)
    maven { url = uri("https://maven.bi.go.id/repository/fraudguard/") }
}
```

## Minimum Requirements

| Requirement | Version |
|------------|---------|
| Android API Level | 24 (Android 7.0+) |
| Kotlin | 1.9+ |
| Gradle | 8.0+ |

## Permissions

SDK membutuhkan izin berikut di `AndroidManifest.xml`:

```xml
<uses-permission android:name="android.permission.INTERNET" />
<uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" />
```

SDK **TIDAK** memerlukan izin akses kamera, mikrofon, kontak, atau penyimpanan.

## ProGuard Rules

```proguard
-keep class id.go.bi.fraudguard.** { *; }
-dontwarn id.go.bi.fraudguard.**
```
