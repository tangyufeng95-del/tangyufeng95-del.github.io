# Security Specifications & Rules Verification Specification

This security specification details the data invariants, threat model payloads, and test runner requirements designed to safeguard **Legendary's Hub** (such as preventing privilege escalation, unauthorized writes, and invalid inputs).

---

## 1. Data Invariants & Access Control Policy

Our system outlines four distinct client roles:
- **Admin**: Email `tangyufeng95@gmail.com` or users explicitly assigned `"admin"` role in their `/users/{userId}` records. Full read/write authority across all collections and role assignment powers.
- **Member**: Users assigned the `"member"` role. Can read and write `/games` and `/activities`, and update their own `/users/{userId}` details.
- **Guest** (or **Pending**): Default role on registration for anyone except the primary admin. Can read `/games` and `/activities`, but is forbidden from adding, updating, or deleting any documents within those collections.
- **Blocked**: Zero access. Forbidden from reading or writing any data.

### Global Safety Invariants
1. **Verified Email constraint**: All write operations require `request.auth.token.email_verified == true`.
2. **Immutability of owners**: An owner identifier field `ownerUid` or `uid` must not be reassigned during updates.
3. **Strict key matching**: Creation of documents must strictly conform to allowed keys and sizes to eliminate shadow fields.
4. **Valid timestamps**: `createdAt` must match `request.time` on creation, and `updatedAt` must match `request.time` during updates.

---

## 2. Threat Matrix: The "Dirty Dozen" Malicious Payloads

The following attack operations are tested to guarantee they return `PERMISSION_DENIED`:

### Category A: Privilege Escalation
1. **Malicious Role Assignment**: A newly signed-in guest user attempts to set their role to `"admin"` during document registration.
2. **Self-Approval Attack**: A non-admin user attempts to upgrade their existing `"guest"` role to `"member"`.
3. **Identity Impersonation**: A user tries to create a game or user profile under a different caller's UID (`ownerUid = "victim_uid"`).

### Category B: Game Library Exploitation
4. **Unauthorized Game Addition by Guest**: A guest tries to create a game record in `/games`.
5. **Malicious Game Deletion**: A member tries to delete a game added by another user, or a guest tries to delete any game.
6. **Denial-of-Wallet (ID Poisoning)**: An attacker attempts to create a game doc with a 2,000-character gibberish document ID.
7. **Value Poisoning**: An attacker attempts to update a game with a negative rating (e.g. `rating = -5`) or an inflated rating (e.g. `rating = 99`).
8. **Immutability Breach**: An attacker attempts to modify another user's `ownerUid` field on a game record.

### Category C: Activity Stream Corruption
9. **Guest Activity Spam**: A guest tries to create a post in `/activities`.
10. **Shadow Field Injection**: A user tries to post an activity with a hidden property to hijack client rendering (e.g., injecting `isSystemMessage: true`).
11. **Malicious Comment Hijack**: A user tries to modify or purge comments written by other users.
12. **Temporal Forgery**: A user tries to supply a backdated client timestamp instead of standard `request.time` for an activity's registration.

---

## 3. Test Cases (TDD Blueprint)

The test runner will emulate these 12 vectors to verify all return `PERMISSION_DENIED`. The live implementation is written securely and checked using our flat ESLint rules before moving to production.
