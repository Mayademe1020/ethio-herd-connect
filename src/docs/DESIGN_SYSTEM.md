# Ethio Herd Connect Design System

## Overview

This design system provides comprehensive guidelines for building consistent, accessible, and farmer-friendly interfaces for Ethiopian livestock farmers. The system prioritizes offline functionality, mobile optimization, low-literacy support, and cultural appropriateness.

### Design Principles

1. **Ruthless Simplification**: Better to have 5 features that work perfectly than 20 that are inconsistent
2. **Ethiopian Farmer First**: Every decision evaluated against: "Does this help Ethiopian farmers?"
3. **Offline First**: Core features must work without connectivity
4. **Mobile First**: Optimize for basic smartphones with small screens and limited resources
5. **Accessibility First**: Design for low-literacy users with visual and motor impairments
6. **Touch-Friendly**: Minimum 44x44px touch targets for all interactive elements

---

## Color Palette

### Primary Colors

Our color palette is inspired by Ethiopian culture and optimized for readability on basic smartphones.

```css
/* Ethiopian Green - Primary actions, success states */
--primary: 142 76% 36%;           /* hsl(142, 76%, 36%) - #10b981 */
--primary-foreground: 355.7 100% 97.3%;

/* Ethiopian Gold - Secondary actions, highlights */
--secondary: 45 93% 47%;          /* hsl(45, 93%, 47%) - #fbbf24 */
--secondary-foreground: 0 0% 9%;

/* Emerald Accent - Tertiary actions, accents */
--accent: 164 95% 43%;            /* hsl(164, 95%, 43%) - #14b8a6 */
--accent-foreground: 0 0% 9%;
```

### Status Colors


```css
/* Health Status Colors */
--status-healthy: #22c55e;        /* Green 500 - Healthy animals */
--status-warning: #eab308;        /* Yellow 500 - Needs attention */
--status-danger: #ef4444;         /* Red 500 - Sick/critical */
--status-info: #3b82f6;           /* Blue 500 - Information */

/* Destructive Actions */
--destructive: 0 84.2% 60.2%;     /* Red for delete/remove actions */
--destructive-foreground: 0 0% 98%;
```

### Neutral Colors

```css
/* Background and Surface Colors */
--background: 0 0% 100%;          /* White - Main background */
--foreground: 0 0% 3.9%;          /* Near black - Main text */
--card: 0 0% 100%;                /* White - Card backgrounds */
--card-foreground: 0 0% 3.9%;     /* Near black - Card text */

/* Muted and Borders */
--muted: 0 0% 96.1%;              /* Light gray - Muted backgrounds */
--muted-foreground: 0 0% 45.1%;   /* Medium gray - Muted text */
--border: 0 0% 89.8%;             /* Light gray - Borders */
--input: 0 0% 89.8%;              /* Light gray - Input borders */
```

### Chart Colors

```css
/* Data Visualization */
--chart-1: 142 76% 36%;           /* Ethiopian Green */
--chart-2: 45 93% 47%;            /* Ethiopian Gold */
--chart-3: 164 95% 43%;           /* Emerald */
--chart-4: 43 74% 66%;            /* Light Gold */
--chart-5: 27 87% 67%;            /* Orange */
```

### Usage Guidelines

- **Primary Green**: Use for main CTAs, success messages, healthy status
- **Ethiopian Gold**: Use for secondary actions, highlights, premium features
- **Emerald Accent**: Use for tertiary actions, links, informational elements
- **Status Colors**: Always use consistent colors for health status across the app
- **Destructive Red**: Only use for delete/remove actions with confirmation

---

## Typography

### Font Families

```css
/* Primary Font Stack */
font-family: 'Inter', 'Noto Sans Ethiopic', system-ui, sans-serif;
```

- **Inter**: Modern, readable sans-serif for English and Latin characters
- **Noto Sans Ethiopic**: Optimized for Amharic, Oromo, and other Ethiopian scripts
- **System UI**: Fallback for optimal performance

### Font Sizes


```css
/* Headings - Responsive sizing */
h1: text-2xl sm:text-3xl font-bold          /* 24px → 30px */
h2: text-xl sm:text-2xl font-semibold       /* 20px → 24px */
h3: text-lg sm:text-xl font-semibold        /* 18px → 20px */
h4: text-base sm:text-lg font-medium        /* 16px → 18px */

/* Body Text */
body: text-sm sm:text-base                  /* 14px → 16px */
small: text-xs sm:text-sm                   /* 12px → 14px */

/* Minimum font size: 14px for low-literacy users */
```

### Font Weights

```css
font-light: 300      /* Rarely used */
font-normal: 400     /* Body text */
font-medium: 500     /* Emphasis */
font-semibold: 600   /* Subheadings */
font-bold: 700       /* Headings */
font-extrabold: 800  /* Hero text */
```

### Line Heights

```css
leading-tight: 1.25     /* Headings */
leading-snug: 1.375     /* Subheadings */
leading-normal: 1.5     /* Body text */
leading-relaxed: 1.625  /* Long-form content */
```

### Typography Classes

```css
/* Amharic/Ethiopian Script */
.amharic-text {
  font-family: 'Noto Sans Ethiopic', sans-serif;
  line-height: 1.6;
  letter-spacing: 0.025em;
}
```

### Usage Guidelines

- **Minimum font size**: 14px (text-sm) for readability on basic smartphones
- **Responsive sizing**: Always use responsive text sizes (sm:, md:, lg:)
- **Line height**: Use 1.5+ for body text to improve readability
- **Font weight**: Use semibold (600) or bold (700) for important information
- **Amharic text**: Always apply `.amharic-text` class for Ethiopian scripts

---

## Spacing

### Spacing Scale

```css
/* Tailwind spacing scale (rem units) */
--space-0: 0;           /* 0px */
--space-px: 1px;        /* 1px */
--space-0.5: 0.125rem;  /* 2px */
--space-1: 0.25rem;     /* 4px */
--space-2: 0.5rem;      /* 8px */
--space-3: 0.75rem;     /* 12px */
--space-4: 1rem;        /* 16px */
--space-5: 1.25rem;     /* 20px */
--space-6: 1.5rem;      /* 24px */
--space-8: 2rem;        /* 32px */
--space-10: 2.5rem;     /* 40px */
--space-12: 3rem;       /* 48px */
--space-16: 4rem;       /* 64px */
```


### Responsive Spacing Utilities

```css
/* Responsive padding */
.p-responsive {
  @apply p-3 md:p-4 lg:p-6;        /* 12px → 16px → 24px */
}

.px-responsive {
  @apply px-4 md:px-6 lg:px-8;     /* 16px → 24px → 32px */
}

.py-responsive {
  @apply py-3 md:py-4 lg:py-6;     /* 12px → 16px → 24px */
}

/* Responsive spacing between elements */
.space-y-responsive {
  @apply space-y-3 md:space-y-4 lg:space-y-6;
}

.space-x-responsive {
  @apply space-x-2 md:space-x-3 lg:space-x-4;
}
```

### Container Widths

```css
/* Standard container */
.container-responsive {
  @apply w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8;
}

/* Narrow container (forms, articles) */
.container-narrow {
  @apply w-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-8;
}

/* Wide container (dashboards, tables) */
.container-wide {
  @apply w-full max-w-9xl mx-auto px-4 sm:px-6 lg:px-8 xl:px-12;
}
```

### Usage Guidelines

- **Touch spacing**: Minimum 8px between touch targets
- **Card padding**: Use p-4 (16px) for standard cards
- **Section spacing**: Use space-y-6 (24px) between major sections
- **Responsive**: Always use responsive spacing utilities for better mobile experience

---

## Components

### Buttons

#### Button Variants

**Primary Button (Main Actions)**
```tsx
<Button className="farmer-button">
  Add Animal
</Button>

// CSS
.farmer-button {
  @apply bg-primary text-primary-foreground font-semibold rounded-xl shadow-sm;
  @apply hover:shadow-md hover:scale-[1.02] active:scale-[0.98];
  @apply transition-all duration-200 ease-out;
  @apply min-h-[48px] px-6;
}
```

**Secondary Button (Alternative Actions)**
```tsx
<Button variant="outline" className="min-h-[48px] px-6">
  Cancel
</Button>
```

**Destructive Button (Delete/Remove)**
```tsx
<Button variant="destructive" className="min-h-[48px] px-6">
  Delete Animal
</Button>
```

**Marketplace Button (Marketplace Actions)**
```tsx
<Button className="bg-orange-600 hover:bg-orange-700 text-white min-h-[48px] px-6">
  List for Sale
</Button>
```


#### Button Sizes

```tsx
// Large (Default for farmers)
<Button size="lg" className="min-h-[48px]">Large Button</Button>

// Default
<Button size="default" className="min-h-[44px]">Default Button</Button>

// Small (Use sparingly)
<Button size="sm" className="min-h-[40px]">Small Button</Button>

// Icon Button
<Button size="icon" className="min-h-[44px] min-w-[44px]">
  <Plus className="w-5 h-5" />
</Button>
```

#### Button States

```tsx
// Loading state
<Button disabled={isLoading}>
  {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
  Submit
</Button>

// Disabled state
<Button disabled>
  Disabled Button
</Button>
```

#### Button Guidelines

- **Minimum size**: 44x44px (WCAG AAA standard)
- **Touch target**: 48x48px recommended for primary actions
- **Icon + Text**: Always include text labels for clarity
- **Loading state**: Show spinner and disable during async operations
- **Feedback**: Use scale animations for touch feedback
- **Spacing**: Minimum 8px between adjacent buttons

---

### Cards

#### Standard Card

```tsx
<Card className="farmer-card p-4">
  <CardHeader className="pb-2">
    <CardTitle className="text-lg font-semibold">
      Card Title
    </CardTitle>
  </CardHeader>
  <CardContent>
    Card content goes here
  </CardContent>
</Card>

// CSS
.farmer-card {
  @apply bg-background rounded-2xl shadow-sm border border-border;
  @apply hover:shadow-md hover:border-primary/20;
  @apply transition-all duration-300 ease-out;
}
```

#### Interactive Card (Clickable)

```tsx
<Card 
  className="farmer-card p-4 cursor-pointer hover:scale-[1.02]"
  onClick={handleClick}
>
  <CardContent>
    Clickable card content
  </CardContent>
</Card>
```

#### Status Card (Health, Alerts)

```tsx
// Healthy status
<Card className="farmer-card p-4 border-l-4 border-l-green-500">
  <CardContent>Healthy animal</CardContent>
</Card>

// Warning status
<Card className="farmer-card p-4 border-l-4 border-l-yellow-500">
  <CardContent>Needs attention</CardContent>
</Card>

// Danger status
<Card className="farmer-card p-4 border-l-4 border-l-red-500">
  <CardContent>Critical condition</CardContent>
</Card>
```


#### Card Variants

```tsx
// Compact card (list view)
<Card className="farmer-card p-3">
  <div className="