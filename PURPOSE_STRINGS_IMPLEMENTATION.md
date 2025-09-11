# Purpose Strings Implementation for iOS App Store Compliance

## Overview
This document outlines the implementation of Purpose Strings (Info.plist entries) for camera, photo library, and tracking permissions in compliance with App Store Guideline 5.1.1.

## Implementation Details

### 1. Capacitor Configuration
- **App ID**: `app.lovable.57d67ee3eaea43b29008fdf2d0a75dc7`
- **App Name**: `bh-bh`
- **Configuration File**: `capacitor.config.ts`
- **Sandbox URL**: `https://57d67ee3-eaea-43b2-9008-fdf2d0a75dc7.lovableproject.com?forceHideBadge=true`

### 2. Purpose Strings (Info.plist)

#### NSCameraUsageDescription
**English**: "We use the camera to capture photos or videos you attach to orders, quotes, reviews, or support requests (e.g., documenting an issue or product)."

**Hebrew**: "אנו משתמשים במצלמה כדי לצלם תמונות או סרטונים שאתה מצרף להזמנות, הצעות מחיר, ביקורות או פניות לתמיכה (לדוגמה, תיעוד בעיה או מוצר)."

#### NSPhotoLibraryUsageDescription
**English**: "We access your photo library so you can attach existing images to orders, reviews, and support requests."

**Hebrew**: "אנו ניגשים לספריית התמונות שלך כדי שתוכל לצרף תמונות קיימות להזמנות, ביקורות ופניות תמיכה."

#### NSPhotoLibraryAddUsageDescription
**English**: "We save images generated in the app to your photo library when you choose to download them."

**Hebrew**: "אנו שומרים תמונות שנוצרו באפליקציה לספריית התמונות שלך כאשר אתה בוחר להוריד אותן."

#### NSUserTrackingUsageDescription
**English**: "Allow tracking so we can measure ad performance by linking your activity with third-party data. This is optional and not required to use the app."

**Hebrew**: "אפשר מעקב כדי שנוכל למדוד ביצועי פרסומות על ידי קישור הפעילות שלך עם נתונים של צד שלישי. זה אופציונלי ולא נדרש לשימוש באפליקציה."

### 3. Native Camera Integration

#### useCapacitorCamera Hook
- **Location**: `src/hooks/useCapacitorCamera.ts`
- **Functionality**: 
  - Camera photo capture
  - Gallery photo selection
  - Platform detection
  - File conversion utilities
  - Error handling with user-friendly messages

#### Updated Components
1. **PhotoUploadModal**: Enhanced with camera and gallery buttons for native apps
2. **FileUploader**: Added camera functionality for image file uploads

### 4. User Experience Flow

#### Permission Request Flow
1. User clicks "Take Photo" or "Select from Gallery"
2. iOS displays permission dialog with purpose string
3. User grants or denies permission
4. App handles response appropriately

#### Fallback Behavior
- Native apps: Show camera and gallery buttons
- Web browsers: Show traditional file upload interface
- Graceful degradation with clear messaging

### 5. File Structure

```
ios/
├── App/
│   └── App/
│       ├── Info.plist                    # Main Info.plist with purpose strings
│       └── he.lproj/
│           └── InfoPlist.strings         # Hebrew translations
├── capacitor.config.ts                   # Capacitor configuration
└── src/
    ├── hooks/
    │   └── useCapacitorCamera.ts         # Camera functionality hook
    └── components/
        ├── inspiration/
        │   └── PhotoUploadModal.tsx      # Enhanced photo upload
        └── supplier/
            └── FileUploader.tsx          # Enhanced file upload
```

### 6. Development and Deployment Instructions

#### For Development Testing
1. Run `npx cap init` to initialize Capacitor
2. Add platform: `npx cap add ios`
3. Sync project: `npx cap sync`
4. Open in Xcode: `npx cap open ios`

#### For Production Deployment
1. Build project: `npm run build`
2. Sync with Capacitor: `npx cap sync`
3. Open in Xcode and configure signing
4. Submit to App Store

### 7. Compliance Verification

#### App Store Guidelines 5.1.1 Requirements ✅
- [x] Clear purpose explanation for each permission
- [x] Specific examples of app usage
- [x] Hebrew localization support
- [x] No generic permission requests
- [x] Purpose strings match actual app functionality

#### Testing Checklist
- [ ] Permission dialogs display correct purpose strings
- [ ] Hebrew translations appear correctly on Hebrew iOS devices
- [ ] Camera functionality works as described
- [ ] Photo library access works as described
- [ ] App gracefully handles permission denial
- [ ] Fallback mechanisms work in web browsers

### 8. Supported Languages
- **English** (default)
- **Hebrew** (he.lproj)

### 9. Security and Privacy
- Camera access only requested when user initiates photo capture
- Gallery access only requested when user selects from library
- No automatic background access to camera or photos
- User tracking permission clearly marked as optional
- All file uploads use secure HTTPS endpoints

### 10. Future Enhancements
- Support for additional languages if needed
- Video recording capabilities
- Advanced photo editing features
- Cloud storage integration
- Biometric authentication for sensitive files

## Contact and Support
For technical questions about this implementation, refer to the Capacitor and iOS development documentation or contact the development team.