# Security Specification (Phase 0: Payload-First TDD)

## 1. Data Invariants
- **reviews**: Public users can create reviews but must set `approved = false`. The rating must be an integer between 1 and 5. Only admins can read unapproved reviews, delete reviews, or update approvals.
- **gallery**: Public users can upload photos with `approved = false`. Caption size must be restricted. Only admins can read unapproved gallery items, delete gallery items, or update approvals.
- **messages**: Anyone can create support messages. Message structures of name, email, and message are mandatory. Only admins can read/list/delete messages.
- **donations**: Anyone can create donation records (after payment integration). Only admins can read/list or update donation elements.
- **admins**: Defines the set of authenticated admin users. Only existing admins with verified emails can write or read this collection.

## 2. The "Dirty Dozen" Payloads (Designed to Break Identity/Integrity/State)
1. **Malicious Review (Self-Approving)**: Write `approved = true` as a public user.
2. **Review Resource Poisoning**: Submit a review with a 1MB string or high rating (9999).
3. **Ghost Fields Review**: Adding field `isVerifiedAdmin: true` into a review.
4. **Gallery Approval Bypass**: Upload a gallery item with `approved = true` as a guest.
5. **Junk Gallery ID**: Document ID injection with massive special characters and overflow sizes.
6. **Pre-dated Gallery Item**: Inserting custom `createdAt` representing 2050.
7. **Contact Inbox Spoofing / Spam**: Writing contact messages with fields like `role: "admin"`.
8. **Malicious Message ID**: Document ID path variables containing directory transversals or huge character counts.
9. **Donation Verification Spoofing**: Attempting to write a donation document with `verified = true` from client without proper transaction tracking, or changing verification status from false to true.
10. **Admin Self-Promotion**: Writing directly into `/admins/{myLocalUid}` to make oneself an admin without credentials.
11. **PII Collection Scanning**: Querying `/messages` collection as an anonymous user.
12. **Storage Object Poisoning**: Overwriting another user's image in `/gallery/` bucket without administrative rights.

## 3. Test Runner Definition
These attacks are blocked by the production-level security rules matching the Eight Pillars.
