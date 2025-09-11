# Push Notification Consent & Backend Persistence Implementation

## Overview
Implemented full backend persistence for push notification preferences with RLS security and App Store compliant consent flow.

## Database Schema

### Table: `notification_preferences`
```sql
- user_id (uuid, primary key) - References auth.users(id)
- system (boolean) - System/security notifications
- orders (boolean) - Business/order notifications  
- marketing (boolean) - Marketing notifications (explicit opt-in)
- updated_at (timestamptz) - Auto-updated timestamp
```

### Security
- **RLS Enabled**: Users can only access their own preferences
- **Security Definer Function**: `set_notification_pref()` for safe upserts
- **Cascading Delete**: Preferences deleted when user account is deleted

## Frontend Implementation

### Hook: `useNotificationPermissions`
**Key Features:**
- **Permission State Management**: Tracks browser notification permission
- **Backend Integration**: Loads/saves preferences via Supabase RPC
- **Auto-save**: Settings saved immediately when changed
- **Permission Enforcement**: Blocks settings if OS permission not granted

### Page: `NotificationPreferences`  
**App Store Compliant UI:**
- **Permission Gating**: All toggles disabled until OS permission granted
- **Marketing Default OFF**: Marketing stays OFF until explicit opt-in
- **Clear Categories**: System, Orders, Marketing separated
- **Visual Feedback**: Lock icons when permission required

## App Store Compliance Features

### ✅ Consent Before Sending (4.5.4)
- All notification toggles disabled until OS permission granted
- Clear permission request flow with explanation
- Permission state persisted and enforced

### ✅ Marketing Explicit Opt-In
- Marketing notifications default to OFF
- Separate category with clear labeling
- No permission required (can opt-in without notifications)

### ✅ Data Persistence
- Settings survive app restarts/reloads
- Server-side storage with RLS security
- Immediate feedback on save success/failure

## Technical Implementation

### Backend Persistence Flow
```typescript
1. Load preferences: SELECT from notification_preferences
2. Update setting: Call set_notification_pref() RPC function
3. Auto-save: Settings saved immediately when changed
4. Fallback: Default to all OFF if no preferences found
```

### Permission Enforcement
```typescript
// System/Orders require OS permission
if ((category === 'system' || 'orders') && !hasPermission && enabled) {
  // Block and show permission request
}

// Marketing doesn't require OS permission (can opt-in for email/web)
if (category === 'marketing') {
  // Allow toggle regardless of OS permission
}
```

## Key Behaviors

### 🔒 Permission States
- **Default**: All toggles locked, show "Enable Notifications" button
- **Granted**: All toggles unlocked, settings can be changed
- **Denied**: Toggles locked, show "Open Browser Settings" guidance

### 💾 Persistence 
- Settings loaded on component mount
- Changes saved immediately to database
- Toast confirmation on successful save
- Error handling for failed saves

### 🎯 Marketing Compliance
- Marketing toggles work without OS permission
- Can enable for email/web notifications
- Push notifications still require OS permission
- Always defaults to OFF (never pre-enabled)

## Testing Checklist

### ✅ Permission Flow
- [ ] New user sees permission request
- [ ] Toggles locked until permission granted
- [ ] "Allow" button triggers OS permission dialog
- [ ] Settings unlock after permission granted

### ✅ Persistence
- [ ] Settings save immediately when changed
- [ ] Settings persist after page reload
- [ ] Settings persist after app restart
- [ ] Multiple devices sync settings

### ✅ Marketing Compliance  
- [ ] Marketing defaults to OFF
- [ ] Marketing requires explicit opt-in
- [ ] Marketing works without OS permission
- [ ] System/Orders require OS permission

## Files Modified
- `src/hooks/useNotificationPermissions.ts` - Backend integration
- `src/pages/NotificationPreferences.tsx` - Simplified UI
- Database migration - Table + RLS + RPC function

## Evidence for App Review
- Permission-gated toggles (OS consent required)
- Marketing explicit opt-in (defaults OFF)
- Server-side persistence (settings survive restarts)
- Clear categorization (System/Orders/Marketing)