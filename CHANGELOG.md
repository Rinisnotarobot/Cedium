# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- Article search functionality
- Virtual article list with infinite scroll

### Changed
- Refactored article routing structure

### Fixed
- Real-time like count updates after liking articles

## [0.1.0] - 2026-05-20

### Added
- Initial release
- User authentication (email/password + OTP)
- Article writing with Tiptap editor
- Article listing and detail pages
- User profiles and settings
- Avatar upload via Cloudflare R2
- Email notifications via Resend
- Dark/light theme toggle
- Responsive layout with sidebar

### Technical
- TanStack Start (React SSR)
- TanStack Router (file-based routing)
- TanStack Query (data fetching)
- Prisma + PostgreSQL
- Better Auth
- Tailwind CSS v4 + Shadcn/UI
- Vitest testing setup

---

[Unreleased]: https://github.com/Rinisnotarobot/cedium/compare/v0.1.0...HEAD
[0.1.0]: https://github.com/Rinisnotarobot/cedium/releases/tag/v0.1.0