# DESIGN_SYSTEM.md — Gymnastics Facility Management Platform

## Design Philosophy

Clean, professional, data-dense interface inspired by Linear (task management clarity) and Stripe Dashboard (financial readability). The platform serves gym owners, coaches, and parents — people who need information fast, not decoration. Every pixel serves a purpose.

**Core principles:**
- Information density over white space
- Instant clarity — users understand what they're looking at in under 2 seconds
- Professional trust — this handles payments and children's data, it must feel serious
- Mobile-capable — coaches use this on the gym floor from a phone or tablet

---

## Color System

### Tailwind Config (tailwind.config.ts)

```typescript
const config = {
  theme: {
    extend: {
      colors: {
        brand: {
          50:  '#EEF0FF',
          100: '#D9DCFF',
          200: '#B3B8FF',
          300: '#8D95FF',
          400: '#6E78E0',
          500: '#5E6AD2',  // PRIMARY — buttons, links, active states
          600: '#4B55A8',
          700: '#3A4285',
          800: '#2A3063',
          900: '#1B1F42',
        },
        surface: {
          DEFAULT: '#FFFFFF',   // card backgrounds
          raised: '#FAFAFA',    // page background
          sunken: '#F5F5F5',    // input backgrounds, table headers
          overlay: '#FFFFFF',   // modals, dropdowns
        },
        border: {
          DEFAULT: '#E5E5E5',   // card borders, dividers
          strong:  '#D4D4D4',   // table borders, focused inputs
          subtle:  '#F0F0F0',   // light separators
        },
        text: {
          primary:   '#171717', // headings, important text
          secondary: '#525252', // body text, descriptions
          tertiary:  '#737373', // help text, timestamps
          disabled:  '#A3A3A3', // disabled states
          inverse:   '#FFFFFF', // text on dark/brand backgrounds
        },
        status: {
          success:     '#00BA88', // payments received, skills achieved
          'success-bg': '#ECFDF5',
          warning:     '#F59E0B', // expiring waivers, low attendance
          'warning-bg': '#FFFBEB',
          error:       '#EF4444', // failed payments, system errors
          'error-bg':  '#FEF2F2',
          info:        '#3B82F6', // general notices
          'info-bg':   '#EFF6FF',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['SF Mono', 'Menlo', 'Monaco', 'monospace'],
      },
      fontSize: {
        xs:   ['0.75rem',  { lineHeight: '1rem' }],     // 12px — timestamps, badges
        sm:   ['0.875rem', { lineHeight: '1.25rem' }],   // 14px — table cells, help text
        base: ['1rem',     { lineHeight: '1.5rem' }],    // 16px — body text
        lg:   ['1.125rem', { lineHeight: '1.75rem' }],   // 18px — card titles
        xl:   ['1.25rem',  { lineHeight: '1.75rem' }],   // 20px — section headers
        '2xl':['1.5rem',   { lineHeight: '2rem' }],      // 24px — page titles
        '3xl':['1.875rem', { lineHeight: '2.25rem' }],   // 30px — dashboard headlines
        '4xl':['2.25rem',  { lineHeight: '2.5rem' }],    // 36px — hero numbers (KPIs)
      },
      borderRadius: {
        sm:  '4px',
        DEFAULT: '6px',
        md:  '8px',
        lg:  '12px',
        xl:  '16px',
      },
      boxShadow: {
        sm:    '0 1px 2px rgba(0, 0, 0, 0.05)',
        DEFAULT: '0 1px 3px rgba(0, 0, 0, 0.1), 0 1px 2px rgba(0, 0, 0, 0.06)',
        md:    '0 4px 6px rgba(0, 0, 0, 0.07)',
        lg:    '0 10px 15px rgba(0, 0, 0, 0.1)',
        xl:    '0 25px 50px rgba(0, 0, 0, 0.15)',
      },
    },
  },
};
```

### When to Use Each Color

| Scenario | Color |
|----------|-------|
| Primary action button | `brand-500` bg, white text |
| Secondary button | white bg, `brand-500` text, `border-DEFAULT` border |
| Destructive button | `status-error` bg, white text |
| Page background | `surface-raised` (#FAFAFA) |
| Card background | `surface-DEFAULT` (#FFFFFF) with `shadow-sm` |
| Table header row | `surface-sunken` (#F5F5F5) |
| Active navigation item | `brand-50` bg, `brand-500` text |
| Success badge/tag | `status-success-bg` bg, `status-success` text |
| Warning badge/tag | `status-warning-bg` bg, `status-warning` text |
| Error state | `status-error-bg` bg, `status-error` text |
| Links | `brand-500`, underline on hover |
| Disabled elements | `text-disabled` text, `surface-sunken` bg |

---

## Typography

### Hierarchy

| Element | Size | Weight | Color | Usage |
|---------|------|--------|-------|-------|
| Page title | `2xl` (24px) | `font-semibold` (600) | `text-primary` | One per page, top-left |
| Section header | `xl` (20px) | `font-semibold` (600) | `text-primary` | Section dividers within a page |
| Card title | `lg` (18px) | `font-medium` (500) | `text-primary` | Card headers, list item titles |
| Body text | `base` (16px) | `font-normal` (400) | `text-secondary` | Descriptions, paragraphs |
| Table cell | `sm` (14px) | `font-normal` (400) | `text-secondary` | Data in tables |
| Help text | `sm` (14px) | `font-normal` (400) | `text-tertiary` | Form hints, secondary info |
| Badge/tag | `xs` (12px) | `font-medium` (500) | varies | Status badges, labels |
| KPI number | `4xl` (36px) | `font-bold` (700) | `text-primary` | Dashboard metric values |
| KPI label | `sm` (14px) | `font-medium` (500) | `text-tertiary` | Dashboard metric labels |

### Rules
- **Never use more than 3 font sizes on a single card.** Title + body + helper is the max.
- **Never bold body text for emphasis.** Use `font-medium` (500) if you need slight emphasis.
- **Numbers in tables are right-aligned.** Text is left-aligned.
- **Use tabular-nums** for monetary values and counts so digits align vertically.

---

## Spacing

Base unit: `4px` (Tailwind `1`)

| Token | Value | Use |
|-------|-------|-----|
| `p-1` | 4px | Tight padding inside badges |
| `p-2` | 8px | Icon buttons, compact elements |
| `p-3` | 12px | Table cell padding |
| `p-4` | 16px | Card padding (compact) |
| `p-5` | 20px | Standard card padding |
| `p-6` | 24px | Modal padding, spacious cards |
| `gap-2` | 8px | Between inline elements (icon + text) |
| `gap-3` | 12px | Between form fields |
| `gap-4` | 16px | Between cards, list items |
| `gap-6` | 24px | Between page sections |
| `gap-8` | 32px | Major section breaks |

### Rules
- **Cards:** `p-5` padding, `gap-4` between cards in a grid
- **Tables:** `px-3 py-2.5` for cells, `px-3 py-3` for header cells
- **Forms:** `gap-4` between fields, `gap-6` between field groups
- **Page layout:** `p-6` content padding on desktop, `p-4` on mobile

---

## Component Patterns

### Cards
```
┌─────────────────────────────────────┐
│  Card Title              Action Btn  │  ← px-5 pt-5, flex justify-between
│  Optional description text           │  ← text-sm text-tertiary
├─────────────────────────────────────┤  ← border-t border-subtle, my-4
│                                      │
│  Card content goes here              │  ← px-5 pb-5
│                                      │
└─────────────────────────────────────┘
```
- Background: `bg-surface` (white)
- Border: `border border-DEFAULT rounded-lg`
- Shadow: `shadow-sm`
- No colored headers. Color only via status badges or brand accents.

### KPI Cards (Dashboard)
```
┌──────────────────┐
│  Active Students  │  ← text-sm font-medium text-tertiary
│  247             │  ← text-4xl font-bold text-primary tabular-nums
│  ↑ 12% from last │  ← text-xs text-status-success (or error for negative)
└──────────────────┘
```
- Grid: `grid-cols-2 md:grid-cols-4 gap-4`
- Each card: white background, same border/shadow as standard cards

### Data Tables
```
┌──────────┬──────────┬──────────┬──────────┐
│  Name ↕  │  Class   │  Status  │  Actions │  ← bg-surface-sunken, text-xs uppercase tracking-wider font-medium text-tertiary
├──────────┼──────────┼──────────┼──────────┤
│  Alice   │  Beg 6-8 │  ●Active │  ⋮       │  ← text-sm text-secondary, hover:bg-surface-raised
│  Bob     │  Adv 9+  │  ●Active │  ⋮       │
│  Carol   │  Team    │  ○Paused │  ⋮       │
└──────────┴──────────┴──────────┴──────────┘
          « 1 2 3 ... 12 »                     ← pagination below table
```
- Header: `bg-surface-sunken` background, `text-xs uppercase tracking-wider font-medium text-tertiary`
- Rows: `hover:bg-surface-raised` for hover highlight
- Borders: horizontal only (`border-b border-subtle`), no vertical lines
- Row actions: kebab menu (⋮) or icon buttons, never text links inline
- Pagination: below table, centered, compact

### Forms
```
Label                          ← text-sm font-medium text-primary, mb-1.5
┌──────────────────────────┐
│  Placeholder text         │  ← bg-surface-sunken, border-DEFAULT, rounded, px-3 py-2
└──────────────────────────┘
  Helper text or error        ← text-xs text-tertiary (or text-status-error)

[Required fields marked with * after label]
```
- Labels always above inputs (never beside on mobile)
- Required indicator: red `*` after label text
- Error state: `border-status-error` on input, error message below in `text-status-error`
- Focus state: `ring-2 ring-brand-500 ring-offset-1`
- Disabled: `bg-surface-sunken opacity-50 cursor-not-allowed`

### Buttons

| Variant | Style | Use |
|---------|-------|-----|
| Primary | `bg-brand-500 text-white hover:bg-brand-600` | Main page action (Save, Create, Submit) |
| Secondary | `bg-white border border-DEFAULT text-text-secondary hover:bg-surface-sunken` | Cancel, secondary actions |
| Destructive | `bg-status-error text-white hover:bg-red-600` | Delete, remove (always with confirmation) |
| Ghost | `text-text-secondary hover:bg-surface-sunken` | Toolbar actions, subtle buttons |
| Link | `text-brand-500 hover:underline` | Inline actions within text |

- Height: `h-9` (36px) for standard, `h-8` (32px) for compact/table rows
- Border radius: `rounded-md`
- Always include loading state (spinner replacing text) for async actions
- Destructive actions always require a confirmation dialog

### Badges / Status Tags
```
●  Active    → bg-status-success-bg text-status-success
●  Pending   → bg-status-warning-bg text-status-warning
●  Expired   → bg-status-error-bg text-status-error
●  Draft     → bg-surface-sunken text-text-tertiary
```
- `px-2 py-0.5 rounded-full text-xs font-medium`
- Small dot (●) before text for extra scannability

### Navigation

**Desktop Sidebar:**
```
┌─────────────┬──────────────────────────────────────────┐
│  LOGO       │  Page Title                   User ▼     │
│             ├──────────────────────────────────────────┤
│  Dashboard  │                                          │
│  Students   │  Main content area                       │
│  Classes    │                                          │
│  Schedule   │                                          │
│  Billing    │                                          │
│  Staff      │                                          │
│  Messages   │                                          │
│  Events     │                                          │
│  Reports    │                                          │
│             │                                          │
│  ─────────  │                                          │
│  Settings   │                                          │
└─────────────┴──────────────────────────────────────────┘
```
- Sidebar width: `w-60` (240px), collapsible to `w-16` (64px, icons only)
- Sidebar bg: `bg-white` with `border-r border-DEFAULT`
- Active item: `bg-brand-50 text-brand-500 font-medium`
- Inactive item: `text-text-secondary hover:bg-surface-raised`
- Icons: Lucide React icons, `w-5 h-5`, left of label
- Section dividers: thin `border-t border-subtle` with `my-2`

**Mobile Bottom Navigation (< 640px):**
- Fixed bottom bar with 5 key tabs (Dashboard, Schedule, Students, Messages, More)
- Active tab: `text-brand-500`, inactive: `text-text-tertiary`
- No sidebar on mobile — sidebar content moves to hamburger menu under "More"

### Modals / Dialogs
- Overlay: `bg-black/50`
- Modal: `bg-white rounded-xl shadow-xl max-w-lg w-full mx-4`
- Header: title + close button (X icon, top-right)
- Footer: action buttons right-aligned (Cancel left, Primary right)
- Focus trap inside modal
- Close on Escape key and overlay click

### Toast Notifications
- Position: bottom-right on desktop, top-center on mobile
- Auto-dismiss: 5 seconds for success, sticky for errors
- Variants match status colors (success green, error red, warning amber, info blue)
- Use shadcn/ui Sonner or similar

---

## Role-Specific UI Guidelines

### Admin Dashboard
- **Layout:** Full sidebar + main content
- **Homepage:** 4 KPI cards across top (revenue, active students, attendance rate, upcoming events), then two-column layout with recent activity feed and quick-action cards
- **Data-heavy:** Tables are the primary interface for managing students, staff, billing
- **Actions:** Bulk operations in tables (select multiple → action dropdown)

### Coach Interface
- **Layout:** Simplified sidebar (only relevant nav items: My Classes, Roster, Schedule, Messages)
- **Mobile-first:** Designed to work on phone held in one hand
- **Today view:** Shows today's classes stacked vertically, each as a tappable card
- **Class view:** Roster as a checklist — tap student row to toggle attendance
- **Tap targets:** Minimum 44px height for all interactive elements

### Parent Portal
- **Layout:** Top navigation bar (no sidebar) on desktop, bottom tabs on mobile
- **Homepage:** Child cards (one per child) showing next class, balance due, recent achievement
- **Clean:** Minimal navigation, clear CTAs for common actions (Pay Balance, Register for Class, Message Coach)
- **No jargon:** Labels say "Your Balance" not "Accounts Receivable"

### Student/Gymnast View
- **Layout:** Simple, minimal — just their schedule and progress
- **Visual:** Skill badges and achievement cards for motivation
- **Age-appropriate:** Larger text, colorful skill badges, encouraging language

---

## Responsive Breakpoints

| Breakpoint | Width | Layout Changes |
|-----------|-------|----------------|
| Mobile | < 640px | Single column, bottom nav, stacked cards, no sidebar |
| Tablet | 640-1024px | Collapsible sidebar (icon-only), 2-column grids |
| Desktop | > 1024px | Full sidebar, multi-column layouts, expanded tables |

### Rules
- Tables become cards on mobile (each row → stacked card)
- Multi-column forms collapse to single column on mobile
- Calendar views switch from week to day on mobile
- Sidebar collapses to hamburger on tablet, disappears on mobile (use bottom nav)

---

## Icons

Use **Lucide React** (`lucide-react` package) exclusively. Never mix icon libraries.

Common icons for this app:
| Concept | Icon |
|---------|------|
| Students | `Users` |
| Classes | `BookOpen` |
| Schedule | `Calendar` |
| Billing | `CreditCard` |
| Messages | `MessageSquare` |
| Dashboard | `LayoutDashboard` |
| Settings | `Settings` |
| Events | `PartyPopper` |
| Staff | `UserCog` |
| Reports | `BarChart3` |
| Check-in | `CheckCircle` |
| Search | `Search` |
| Add/Create | `Plus` |
| Edit | `Pencil` |
| Delete | `Trash2` |
| More actions | `MoreVertical` |
| Close | `X` |
| Back | `ArrowLeft` |
| Warning | `AlertTriangle` |
| Success | `CheckCircle2` |

Size: `w-4 h-4` in buttons and nav, `w-5 h-5` in sidebar nav, `w-6 h-6` standalone.

---

## Animation & Transitions

Keep animations minimal and purposeful. This is a business tool, not a marketing site.

- **Page transitions:** None (instant page loads)
- **Modal open/close:** `150ms ease-out` fade + scale (0.95 → 1.0)
- **Dropdown open:** `100ms ease-out` fade + translateY(-4px → 0)
- **Toast notifications:** `200ms ease-out` slide-in from right
- **Hover states:** `150ms ease` for color/background transitions
- **Skeleton loaders:** Pulse animation (`animate-pulse`) with `bg-surface-sunken` shapes matching content layout
- **No bouncing, no spring physics, no elaborate entrance animations**

---

## Dark Mode

Not in scope for initial release. Design system is light-mode only. Use CSS variables so dark mode can be added later without refactoring.

---

## Accessibility

- All interactive elements must be keyboard-navigable
- Focus indicators: `ring-2 ring-brand-500 ring-offset-1` (never remove focus outlines)
- Color contrast: minimum 4.5:1 for text, 3:1 for large text and UI components
- All images need alt text
- Form inputs must have associated labels
- Error messages connected to inputs via `aria-describedby`
- Status changes announced with `aria-live` regions
- Modal focus trap and Escape-to-close

---

## File: Design Tokens Quick Reference

For pasting into new component files:

```
COLORS:
  brand-500:    #5E6AD2   (primary actions)
  surface:      #FFFFFF   (cards)
  surface-raised: #FAFAFA (page bg)
  surface-sunken: #F5F5F5 (inputs, table headers)
  border:       #E5E5E5   (default borders)
  text-primary: #171717   (headings)
  text-secondary: #525252 (body)
  text-tertiary: #737373  (helpers)
  success:      #00BA88
  warning:      #F59E0B
  error:        #EF4444

SIZING:
  Button height: 36px (standard), 32px (compact)
  Touch target:  44px minimum
  Sidebar:       240px (expanded), 64px (collapsed)
  Card padding:  20px
  Table cell:    12px horizontal, 10px vertical
  Border radius: 6px (default), 8px (cards), 12px (modals)

FONTS:
  Family: Inter
  Body:   16px/400
  Small:  14px/400
  Tiny:   12px/500
  Title:  24px/600
  KPI:    36px/700
```
