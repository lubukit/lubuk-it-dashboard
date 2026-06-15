# Lubuk IT Dashboard Firebase Setup

Dashboard ini boleh jalan dalam dua mode:

1. Local mode
   - Data disimpan dalam browser/device sahaja.
   - Sesuai untuk test UI dan role.

2. Firebase mode
   - Staff login guna email/password.
   - Data Lubuk IT sync antara semua PC/phone.
   - Sesuai untuk production.

## Data Yang Sync

- `settings`
- `company`
- `pricelist`
- `sales`
- `staffTasks`
- `attendanceRecords`
- `staffProfiles`
- `sops`
- `achievements`
- `projectChatRooms`

## Role Access

- Boss: full access semua bahagian.
- Admin: manage company, pricelist, sales, project, task, attendance, staff, SOP, achievement.
- HR: manage attendance, staff, SOP, achievement, report.
- Sale: manage sale, booking, project, client chat.
- Marketing: manage pricelist, task, project view, SOP view.
- Graphic Designer: attendance sendiri, task sendiri, project view, SOP view, chat.

## Cara Enable Firebase

1. Create Firebase project.
2. Enable Authentication > Email/Password.
3. Enable Firestore Database.
4. Masukkan config dalam `firebase-config.js`.
5. Tukar:

```js
enabled: true,
syncEnabled: true,
businessId: "lubuk-it",
```

6. Add staff dalam Attendance > Admin.
7. Pastikan email staff sama dengan email Firebase Authentication.
8. Set role staff di profile staff.

## Firestore Path

Data sync disimpan di:

```text
businesses/lubuk-it/storage/{key}
projectChats/{projectId}/messages/{messageId}
```

## Nota Security

Untuk production sebenar, set Firestore Rules supaya hanya user login boleh baca/tulis data `businesses/lubuk-it`.
Role UI dalam app membantu kawal interface, tetapi Firestore Rules tetap perlu untuk security server-side.
