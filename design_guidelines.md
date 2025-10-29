# Design Guidelines: Kindergarten Management Platform

## Design Approach

**System Foundation: Material Design 3** with customized warmth for childcare context
- Prioritizes clarity, accessibility, and data density for administrative tasks
- Provides robust component patterns for forms, tables, and complex layouts
- Adaptable elevation system for clear information hierarchy
- Strong accessibility foundations (already aligned with 4.5:1 contrast requirement)

**Supplementary Inspiration:**
- Slack: Chat interface patterns, message threading, file preview cards
- Google Classroom: Parent-teacher communication patterns, child progress cards
- Healthcare dashboards: Trust signals, data visualization, critical alerts

**Rationale:** This is a trust-critical application handling children's safety and health data. The design must convey security and professionalism while remaining approachable for parents. Material Design 3 provides the systematic foundation needed for complex enterprise features while allowing emotional warmth through customization.

---

## Core Design Principles

1. **Trust Through Clarity:** Every interaction should feel secure and transparent
2. **Hierarchy by Importance:** Critical information (health alerts, urgent messages) always visible
3. **Calm Data Density:** Information-rich without overwhelming
4. **Warmth in Rigidity:** Professional structure with gentle, caring touches

---

## Typography System

**Primary Font Family:** Inter (Google Fonts)
- Excellent readability at small sizes (critical for data tables)
- Professional yet approachable
- Comprehensive Cyrillic support for RU/KZ

**Secondary Font (Optional Headers):** Manrope
- Slightly rounded terminals for warmth
- Use sparingly for marketing/welcome content

**Type Scale:**
- Display/Hero: text-4xl font-bold (dashboard greeting, empty states)
- H1/Section Headers: text-2xl font-semibold (page titles)
- H2/Card Headers: text-lg font-semibold (card titles, child names)
- H3/Subsections: text-base font-semibold (tab labels, form sections)
- Body: text-sm font-normal (primary content)
- Small/Meta: text-xs font-normal (timestamps, badges, secondary info)
- Tiny/Labels: text-xs font-medium uppercase tracking-wide (table headers, field labels)

**Special Typography:**
- Monospace for: timestamps in Day timeline, transaction IDs, session tokens
- Use font-medium for important status text (payment due, document expiring)

---

## Layout & Spacing System

**Container Strategy:**
- Main content area: max-w-7xl mx-auto px-6 (desktop), px-4 (mobile)
- Dashboard cards: max-w-sm to max-w-md individual card widths
- Forms: max-w-2xl centered for focused input
- Chat: fixed width sidebar (w-80), flexible message area
- Tables: w-full with horizontal scroll on mobile

**Spacing Primitives:** Tailwind units of 2, 4, 6, 8, 12
- 2: Tight internal spacing (badge padding, icon margins)
- 4: Default component padding (buttons, input fields, card padding)
- 6: Section spacing within cards (between form groups)
- 8: Card gaps in grids, margin between major sections
- 12: Page section separation (between dashboard cards and calendar)

**Grid Systems:**
- Dashboard: grid-cols-1 md:grid-cols-2 gap-6 (4 cards in 2x2)
- Children list: grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4
- Services catalog: grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6

**Sidebar Navigation:**
- Desktop: fixed w-64, always visible
- Mobile: overlay drawer, full-screen with backdrop blur
- Active state: subtle background fill, left border accent (4px)

---

## Component Library

### Navigation & Structure

**Left Sidebar:**
- Items: py-3 px-4 with icon (w-5 h-5) and text-sm label
- Sections separated by divider (border-t with my-2)
- Active item: font-semibold with left border indicator
- User profile at top: avatar (w-10 h-10 rounded-full), name, role badge

**Top Bar (when sidebar collapsed on mobile):**
- h-16 with hamburger menu, page title, notification bell
- Sticky positioning (sticky top-0)

**Breadcrumbs (for deep navigation):**
- text-sm with separator chevrons
- Last item font-semibold
- Only show on tablet/desktop

### Cards & Containers

**Dashboard Cards:**
- Elevated surface (shadow-md hover:shadow-lg transition)
- rounded-xl border
- p-6 with clear header/content/footer sections
- Header: flex justify-between items-start
- Footer CTA: text-sm font-medium link with arrow →

**Data Cards (Child Profile, Staff):**
- rounded-lg border
- p-4 with consistent internal spacing
- Avatar/image section (if applicable): w-16 h-16 rounded-lg
- Badge row: flex gap-2 flex-wrap at top-right

**Empty States:**
- Centered vertically in parent container
- Icon (w-12 h-12) in muted tone
- text-lg font-semibold title
- text-sm description with max-w-sm
- Primary button CTA below

### Forms & Inputs

**Input Fields:**
- h-10 px-4 rounded-lg border
- Label: text-sm font-medium mb-1.5
- Focus: ring-2 ring-offset-1
- Error state: border red, text-xs error message below
- Helper text: text-xs mt-1

**Buttons:**
- Primary: h-10 px-6 rounded-lg font-medium
- Secondary: border variant
- Icon-only: w-10 h-10 rounded-lg
- Disabled: opacity-50 cursor-not-allowed

**Form Layout:**
- Vertical stack with gap-6 between fields
- Related fields grouped with gap-4
- Form sections separated by border-t pt-6

### Tables & Lists

**Data Tables:**
- Sticky header: sticky top-0 backdrop-blur
- Header: text-xs font-medium uppercase tracking-wide py-3
- Rows: py-4 border-b hover:background transition
- Cell padding: px-4 first:pl-6 last:pr-6
- Mobile: Convert to stacked cards

**Child/Staff List:**
- Card-based on mobile/tablet
- Table on desktop (lg:)
- Quick actions: icon buttons in last column
- Status indicators: rounded-full badge (px-2.5 py-0.5 text-xs)

### Chat Interface

**Message List:**
- Padding: p-4 gap-3 between messages
- Own messages: ml-auto max-w-[70%] rounded-2xl rounded-tr-sm
- Other messages: mr-auto max-w-[70%] rounded-2xl rounded-tl-sm
- Timestamp: text-xs mt-1
- Attachments: rounded-lg border preview card

**Composer:**
- Fixed bottom: border-t backdrop-blur
- Input: flexible height (min-h-10 max-h-32)
- Actions: icon buttons in row (attach, send)

**Conversation List:**
- Item: px-4 py-3 border-b hover transition
- Avatar: w-12 h-12 rounded-full
- Preview: text-sm truncate max-w-[200px]
- Unread badge: absolute top-right, rounded-full (w-5 h-5 or w-6 h-6 with count)
- Pinned: different background, pin icon

### Video Player

**Player Container:**
- aspect-video rounded-lg overflow-hidden
- Controls overlay: absolute bottom-0 backdrop-blur
- Timeline: h-2 with event markers (rounded-full indicators at positions)
- Quality toggle: rounded-full badge in top-right

**Event Markers on Timeline:**
- Sleep: moon icon
- Meal: utensils icon
- Activity: play icon
- Positioned at percentage of timeline

### Badges & Status

**Health Badges (⚠️ 💊 📄):**
- Inline with name/header: gap-2
- Size: w-5 h-5 or w-6 h-6 rounded-full
- Tooltip on hover with details

**Status Badges:**
- Pill shape: rounded-full px-2.5 py-1 text-xs font-medium
- Success/Active: green tone
- Warning: amber tone
- Error/Overdue: red tone
- Info: blue tone

### Tabs

**Tab Navigation:**
- Horizontal scroll on mobile
- border-b with sliding indicator
- Tab button: px-4 py-3 font-medium hover transition
- Active: border-b-2 font-semibold

**Tab Content:**
- pt-6 fade-in animation

### Calendar Widget (Mini)

**Dashboard Mini-Calendar:**
- Compact grid (7 columns for days)
- Current day: font-bold with subtle background
- Event dots: flex gap-1 below date number (max 3 visible dots)
- Month navigation: arrow buttons in header

### Notifications

**Bell Dropdown:**
- w-96 max-h-[500px] rounded-lg shadow-xl border
- Tabs at top: 3 tabs (Payments/Messages/Events)
- List: divide-y
- Item: p-4 hover transition, unread with accent left border
- Mark all read: text-sm link in header

### Drawers (Side Panels)

**Detail Drawer:**
- Slide from right
- w-full md:w-96 lg:w-[500px]
- Backdrop: backdrop-blur
- Header: sticky with close button
- Content: p-6 overflow-y-auto

---

## Special Patterns

**Day Timeline (Child's Day):**
- Vertical timeline with left line connector
- Time labels: text-xs font-medium
- Activity cards: ml-8 p-4 rounded-lg border
- Icons on timeline: positioned at -left-3

**Payment Flow:**
- Invoice card: clear hierarchy (amount prominent, status badge, due date)
- Pay button: large, primary, with security icon
- Success state: checkmark animation, confetti (subtle)

**Document Upload:**
- Drag-drop zone: dashed border rounded-lg p-8
- File preview cards: thumbnail + metadata + remove button
- Progress bar during upload

---

## Accessibility Specifications

- Focus visible: ring-2 ring-offset-2 on all interactive elements
- Skip links: sr-only positioned absolutely, visible on focus
- ARIA labels: all icon buttons, video controls, complex widgets
- Color never sole indicator: combine with icons, text, patterns
- Touch targets: minimum 44x44px (h-11 w-11 for icon buttons)
- Keyboard navigation: logical tab order, escape closes modals/drawers

---

## Responsive Breakpoints

- Mobile: base (< 640px) - single column, stacked navigation
- Tablet: md (≥ 768px) - 2-column grids, visible sidebar option
- Desktop: lg (≥ 1024px) - multi-column, permanent sidebar
- Large: xl (≥ 1280px) - optimized spacing, max-widths active

---

## Animation & Motion

**Minimal, Purposeful Motion:**
- Page transitions: fade + subtle slide (150ms)
- Modals/drawers: slide from edge (200ms ease-out)
- Button hover: scale-[1.02] (100ms)
- Loading states: skeleton shimmer animation
- Success feedback: checkmark scale + fade (300ms)

**No Animations:**
- Decorative scroll effects
- Parallax
- Complex hero animations
- Auto-playing carousels

---

## Images

**Where to Use Images:**
- Dashboard welcome: Small illustration (w-24 h-24) in greeting card
- Empty states: Simple 2-color illustrations (w-32 h-32)
- Child/staff avatars: Circular photos with fallback initials
- Document previews: Thumbnails in cards
- Services catalog: Rectangular images (aspect-[4/3]) for activities

**No Large Hero:** This is a dashboard application, not a marketing site. Focus on data and functionality.