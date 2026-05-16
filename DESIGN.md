# Ethio Herd Connect - Design System (DESIGN.md)

## Brand Identity

**Product:** Ethio Herd Connect  
**Type:** Mobile-first livestock management platform for Ethiopian farmers  
**Mission:** Empower 60+ million Ethiopian livestock farmers with AI-powered animal identification

### Core Values

| Value | Expression |
|-------|------------|
| Trustworthy | Secure, reliable, offline-capable |
| Agricultural | Deep green palette, pastoral imagery |
| Ethiopian | National colors, cultural warmth |
| Accessible | Works on basic smartphones |
| Practical | Simple workflows, bilingual |

---

## Color Palette

### Primary (Ethiopian Agriculture - Green)
| Token | Hex | Usage |
|-------|-----|-------|
| Primary | #16a34a | Main CTAs, growth |
| Primary Dark | #15803d | Hover states |
| Primary Light | #22c55e | Success |

### Secondary (Ethiopian Warmth - Gold)
| Token | Hex | Usage |
|-------|-----|-------|
| Secondary | #f59e0b | Warnings, Ethiopia flag gold |
| Secondary Dark | #d97706 | Amber hover |

### Accent (Ethiopian Flag Red)
| Token | Hex | Usage |
|-------|-----|-------|
| Accent Red | #dc2626 | Errors, urgent |

### Surface (Ethiopian Earth Tones)
| Token | Hex | Usage |
|-------|-----|-------|
| Background | #fefce8 | Warm cream |
| Surface | #fffbeb | Cards |
| Surface Alt | #f5f5dc | Beige |

### Text
| Token | Hex | Usage |
|-------|-----|-------|
| Text Primary | #1c1917 | High contrast outdoor |
| Text Secondary | #57534e | Supporting |
| Text Muted | #a8a29e | Hints |

---

## Typography

| Element | Size | Weight |
|---------|------|--------|
| H1 | 32px | Bold (700) |
| H2 | 24px | Semibold (600) |
| H3 | 20px | Semibold (600) |
| Body | 16px | Regular (400) |
| Body Small | 14px | Regular (400) |
| Button | 16px | Semibold (600) |

### Amharic Support
- Font: Noto Sans Ethiopic
- Amharic text: +2px larger than English
- Load font asynchronously

---

## Spacing & Touch Targets

| Token | Value | Usage |
|-------|-------|-------|
| xs | 4px | Tight spacing |
| sm | 8px | Icon gaps |
| md | 16px | Standard |
| lg | 24px | Sections |
| xl | 32px | Margins |

### Touch Targets (CRITICAL)
- Buttons: 44px minimum height
- List Items: 48px minimum
- Form Inputs: 44px height
- Icons: 24px minimum

---

## Components

### Buttons

**Primary Button**
- Background: #16a34a (green)
- Text: White
- Border Radius: 8px
- Min Height: 44px
- Hover: #15803d

**Secondary Button**
- Background: Transparent
- Border: 2px #16a34a
- Text: #16a34a

**Danger Button**
- Background: #dc2626
- Text: White

### Cards

**Animal Card**
- Background: #fffbeb
- Border: 1px #d4d4d4
- Border Radius: 12px
- Padding: 16px
- Shadow: 0 1px 3px rgba(0,0,0,0.1)

### Forms

**Text Input**
- Height: 44px
- Border: 1px #d4d4d4
- Border Radius: 8px
- Focus: Green border with ring

---

## Icons

- **Library:** Lucide React
- **Custom Needed:**
  - Cow head silhouette
  - Goat silhouette
  - Sheep silhouette
  - Ethiopian calendar
  - Offline indicator
  - Muzzle scan icon

---

## Animations

| Element | Duration | Easing |
|---------|----------|--------|
| Button hover | 150ms | ease-out |
| Card lift | 200ms | ease-out |
| Modal | 200ms | ease-out |
| Page | 300ms | ease-in-out |

- Respect prefers-reduced-motion
- Purposeful, not decorative

---

## Layout

### Screen Structure
```
┌──────────────────┐
│ Header (56px)    │
├──────────────────┤
│ Content          │
│ (scrollable)     │
├──────────────────┤
│ Bottom Nav       │
└──────────────────┘
```

### Grid
| Screen | Cards/Row |
|--------|----------|
| Mobile | 1-2 |
| Tablet | 2-3 |
| Desktop | 3-4 |

---

## Cultural Elements

- **Flag colors:** Green, Gold, Red accents
- **Earth tones:** Cream backgrounds
- **Patterns:** Subtle textile-inspired (optional)
- **Calendar:** Ethiopian date display
- **Bilingual:** Toggle always visible
- **Amharic text:** Larger font size

---

## Do's and Don'ts

### Do
- ✅ Green for positive/success
- ✅ Amber for warnings
- ✅ 44px touch targets
- ✅ High contrast text
- ✅ Show offline status
- ✅ Support Amharic

### Don't
- ❌ Red for non-critical UI
- ❌ Pure black on white
- ❌ Touch targets under 44px
- ❌ Small Amharic fonts
- ❌ Hide offline capability
- ❌ Generic Western imagery

---

## Accessibility

- Contrast: 4.5:1 (normal), 3:1 (large)
- Touch: 44px minimum
- Focus: Visible indicators
- Motion: Respect reduced-motion
- Screen reader: Alt text, aria-labels

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | 2026-05-07 | Initial design system |
