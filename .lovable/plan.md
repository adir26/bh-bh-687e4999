
## תוכנית: שדרוג מערכת ההודעות הפנימית

### מצב נוכחי
- **`MyMessages.tsx`** — מציג רשימת לידים בלבד, ללא צ'אט אמיתי
- **טבלת `messages`** קיימת ב-DB עם: `sender_id`, `recipient_id`, `content`, `status` (sent/delivered/read), `read_at`, `project_id`, `order_id`
- **`OrderChat.tsx`** — צ'אט פר-הזמנה עם real-time (קיים ופועל)
- **`messagesService`** — CRUD בסיסי בלי realtime
- **אין**: רשימת שיחות (conversations), bucket לקבצי הודעות, תצוגת inbox

### גישה
שכתוב מלא של `MyMessages.tsx` למערכת inbox + chat מבוססת טבלת `messages` הקיימת. נוסיף טבלת `conversations` לניהול שיחות, bucket לקבצים, ו-realtime subscriptions.

### שינויים

#### 1. מיגרציית DB
- טבלת **`conversations`**: `id`, `participant_1`, `participant_2`, `last_message_text`, `last_message_at`, `unread_count_1`, `unread_count_2`, `created_at`
  - RLS: משתתפים רואים את השיחות שלהם
- הוספת עמודת `conversation_id` ל-`messages` + `file_url`, `file_name`
- פונקציית `get_or_create_conversation(other_user_id)` — יוצרת שיחה אם לא קיימת
- טריגר `update_conversation_on_message` — מעדכן `last_message_text`, `last_message_at`, `unread_count`
- פונקציית `mark_conversation_read(conversation_id)` — מאפס unread count
- Storage bucket **`chat-files`** (private)

#### 2. Hook חדש — `src/hooks/useChat.ts`
- `useConversations()` — רשימת שיחות + realtime subscription
- `useConversationMessages(conversationId)` — הודעות שיחה + realtime
- `useSendMessage()` — שליחת הודעה (טקסט + קובץ אופציונלי)
- `useMarkConversationRead(conversationId)` — סימון כנקרא
- `useStartConversation()` — יצירת שיחה חדשה
- `useUnreadConversationsCount()` — ספירת שיחות עם הודעות חדשות

#### 3. שכתוב `MyMessages.tsx` — Inbox + Chat
Layout: רשימת שיחות בצד (sidebar) + חלון צ'אט במרכז (במובייל — שני מסכים נפרדים)

```text
Desktop:
┌──────────────────┬───────────────────────────┐
│  Conversations   │  Chat Window              │
│  ┌────────────┐  │  ┌─────────────────────┐  │
│  │ User A  •2 │  │  │ bubble messages     │  │
│  │ User B     │  │  │ with file previews  │  │
│  │ User C  •1 │  │  │                     │  │
│  └────────────┘  │  ├─────────────────────┤  │
│                  │  │ [📎] [input] [Send]  │  │
│                  │  └─────────────────────┘  │
└──────────────────┴───────────────────────────┘

Mobile: 
Screen 1: Conversation list (full width)
Screen 2: Chat view (full width, back button)
```

כל שיחה מציגה:
- אווטאר + שם המשתמש השני
- הודעה אחרונה (truncated)
- זמן + badge הודעות לא נקראו

חלון הצ'אט:
- בועות הודעות (שלי/שלו) עם שעה + סטטוס קריאה (✓✓)
- תצוגת קובץ מצורף (תמונות inline, קבצים כלינק)
- שדה הודעה + כפתור צירוף קובץ + שליחה
- Auto-scroll + realtime

#### 4. עדכונים נוספים
- **`src/App.tsx`** — ללא שינוי (נתיב `/my-messages` קיים)
- **`src/hooks/useNotifications.ts`** — ללא שינוי (כבר שולח התראות על הודעות)

### קבצים חדשים
- `supabase/migrations/...conversations_chat.sql`
- `src/hooks/useChat.ts`

### קבצים לעדכון
- `src/pages/MyMessages.tsx` — שכתוב מלא
