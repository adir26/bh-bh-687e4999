# Password Policy Update - Relaxed Requirements

## Summary
Updated password policy across the application to use a more user-friendly approach while maintaining security.

## New Requirements
- **Minimum length**: 8 characters (reduced from 12)
- **Composition**: Must include letters + (numbers OR symbols)
- **Removed requirements**: Uppercase letters no longer mandatory

## Valid Examples
✅ `bonimpo1` (letters + numbers)
✅ `Bonimpo!` (letters + symbols) 
✅ `A1aaaaaa` (letters + numbers)
✅ `aaaaaaa!` (letters + symbols)

## Invalid Examples
❌ `12345678` (no letters)
❌ `aaaaaaaa` (no numbers or symbols)
❌ `A1a` (too short, < 8 characters)

## Files Modified

### Validation Functions
- **src/utils/inputSanitizer.ts**: Updated `validatePassword()` method
- **src/utils/security.ts**: Updated `validatePassword()` function

### Form Validation
- **src/pages/Registration.tsx**: Updated Zod schema regex and validation
- **src/pages/Auth.tsx**: Updated manual password validation logic and placeholder text

### Error Messages
- Updated error messages in both English and Hebrew
- English: "Password must be 8+ chars and include letters + (numbers or symbols)"
- Hebrew: "סיסמה חייבת 8+ תווים ולשלב אותיות + (מספרים או סימנים)"

### UI Changes
- Updated password input placeholder text
- Updated minLength attribute from 6 to 8

## Implementation Details

### New Validation Logic
```javascript
export function validatePassword(password) {
  if (!password || password.length < 8) {
    return { ok: false, reason: 'len' };
  }
  const hasLetter = /[A-Za-z]/.test(password);
  const hasDigit = /\d/.test(password);
  const hasSymbol = /[^A-Za-z0-9]/.test(password);
  const classes = (hasLetter ? 1 : 0) + (hasDigit ? 1 : 0) + (hasSymbol ? 1 : 0);

  // Require letters + (numbers OR symbols)
  if (!hasLetter || classes < 2) {
    return { ok: false, reason: 'classes' };
  }
  return { ok: true };
}
```

### Regex Pattern
For single regex validation: `^(?=.*[A-Za-z])(?:(?=.*\d)|(?=.*[^A-Za-z0-9])).{8,}$`

## Supabase Settings Required
**Manual Action Required**: Update Supabase Dashboard settings:
1. Go to Authentication → Policies/Settings
2. Set Minimum password length = 8
3. Remove uppercase/special character requirements from server-side policies
4. Save settings

## Testing
- Verify signup works with new policy examples
- Verify signup fails with invalid examples  
- Check all auth flows (signup, password reset, change password)
- Confirm error messages display correctly in both languages

## Breaking Changes
- Users with passwords 6-7 characters will need to reset on next login
- Existing validation tests may need updates if they assumed old requirements