# Kindergarten Management Platform

## Overview

A B2B2C platform for kindergartens in Kazakhstan that connects childcare facilities with families. The system provides secure video surveillance, subscription/payment management, parent-teacher communication, and comprehensive daily activity tracking. Built with a focus on trust, transparency, and ease of use for administrators, teachers, and parents.

**Core Value Proposition:**
- Parents: Real-time transparency, digital payments, child development reports
- Kindergartens: Automated billing, reduced administrative overhead, occupancy analytics
- Teachers: Easy multimedia sharing, attendance tracking, templated reporting

**Tech Stack:**
- Frontend: React + TypeScript, Vite, Wouter (routing)
- Backend: Express.js + Node.js
- Database: PostgreSQL via Neon (serverless)
- ORM: Drizzle
- UI Framework: shadcn/ui (Radix UI primitives)
- Styling: Tailwind CSS with Material Design 3 inspiration
- Internationalization: i18next (Russian/Kazakh support)
- State Management: TanStack Query

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Design Philosophy

**Material Design 3 Foundation with Childcare Context:**
- Trust-critical application requiring professional presentation with warm, approachable touches
- Information-dense interfaces for administrative tasks while maintaining clarity
- Accessibility-first: 4.5:1 minimum contrast ratios, clear visual hierarchy
- Timezone: Asia/Almaty (Kazakhstan)
- Multi-language: Russian (primary), Kazakh, with English support

**Typography System:**
- Primary: Inter (excellent small-size readability, Cyrillic support)
- Secondary: Manrope (rounded terminals for warmth, used sparingly)
- Monospace: For timestamps, IDs, session tokens

### Frontend Architecture

**Component Structure:**
- **UI Components**: shadcn/ui library (Radix UI + Tailwind) in `client/src/components/ui/`
- **Application Components**: Custom components in `client/src/components/`
- **Pages**: Route-based pages in `client/src/pages/`
- **Routing**: Wouter (lightweight client-side routing)

**State Management:**
- TanStack Query for server state (caching, invalidation, mutations)
- React hooks for local UI state
- Custom hooks: `useAuth`, `useLanguage`, `use-toast`, `use-mobile`

**Internationalization:**
- i18next for translations (RU/KK)
- Locale-aware date/time formatting (Asia/Almaty timezone)
- Currency formatting (KZT with space separators: "1 234 567 ₸")

**Key Features:**
- Multi-role authentication (parent, teacher, admin, network_owner)
- Real-time chat with message threading
- Video surveillance interface with timeline events
- Billing and subscription management
- Daily activity tracking (meals, sleep, activities, mood)
- Document management with expiration tracking
- Extra classes enrollment and attendance

### Backend Architecture

**Server Framework:**
- Express.js with TypeScript
- Session-based authentication (Passport.js + LocalStrategy)
- Session storage: MemoryStore (development), can be upgraded to connect-pg-simple for production

**Authentication & Authorization:**
- Role-Based Access Control (RBAC) via middleware (`requireAuth`, `requireRole`, `canAccessChild`)
- Access logging for sensitive resources (children data, health records)
- Password hashing: scrypt with random salts
- Session management: express-session with secure cookies

**API Design:**
- RESTful endpoints under `/api/*`
- Request/response logging for API routes
- JSON payloads with proper error handling
- Stripe webhook support (raw body buffering for signature verification)

**Database Layer:**
- PostgreSQL via @neondatabase/serverless
- Drizzle ORM for type-safe queries
- Schema-first approach with Zod validation
- Migration management: drizzle-kit

**Key Domain Models:**
- Organizations & Facilities (multi-tenant structure)
- Groups (classroom groupings)
- Children with health records, allergies, medications, documents
- Users with role assignments (userRoles table)
- Staff with group assignments
- Attendance & daily activities
- Chat threads & messages
- Invoices & subscriptions
- Events & extra classes
- Trusted contacts (emergency contacts, authorized pickup)

### Data Storage Solutions

**Primary Database: PostgreSQL (Neon)**
- Connection pooling via @neondatabase/serverless
- WebSocket support for serverless environments
- Schema defined in `shared/schema.ts`

**Schema Highlights:**
- **Multi-tenancy**: Organizations → Facilities → Groups → Children
- **Health & Safety**: Allergies (severity levels), medications (schedules), emergency contacts
- **Document Tracking**: Expiration statuses (valid, expiring_soon, expired, pending)
- **Activity Logging**: Type-safe enums for activities (sleep, meal, activity, medication, mood)
- **Billing**: Invoices with status tracking, subscriptions, additional services
- **Communication**: Chat threads with participant management, messages with read receipts
- **Access Control**: User roles, staff group assignments, parent-child relationships

**Session Storage:**
- In-memory (development): memorystore
- Production-ready option: connect-pg-simple for PostgreSQL-backed sessions

### External Dependencies

**Payment Processing:**
- Stripe integration (@stripe/stripe-js, @stripe/react-stripe-js)
- Webhook handling for payment events
- Subscription management

**UI Component Library:**
- shadcn/ui (customized Radix UI primitives)
- 40+ components: dialogs, dropdowns, forms, tables, calendars, etc.
- Fully accessible, keyboard navigable

**Date/Time Handling:**
- date-fns with timezone support (date-fns-tz)
- Locale support for RU/KK (date-fns/locale)
- Consistent Asia/Almaty timezone formatting

**Form Management:**
- react-hook-form for form state
- @hookform/resolvers for Zod schema validation

**Development Tools:**
- Vite for fast development builds and HMR
- TypeScript for type safety across frontend/backend
- ESLint + Prettier (implicit via tooling)
- Replit-specific plugins: runtime error overlay, cartographer, dev banner

**Fonts:**
- Google Fonts: Inter, DM Sans, Fira Code, Geist Mono, Architects Daughter
- Preconnected for performance

**Build & Deployment:**
- Development: `tsx server/index.ts` with Vite middleware
- Production: Vite build → esbuild bundle → Node.js server
- Static assets served from `dist/public`