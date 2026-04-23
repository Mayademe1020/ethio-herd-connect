# EthioHerd Connect Design System

## Purpose
This document establishes the visual language and component standards for EthioHerd Connect, ensuring a professional, consistent, and purposeful user experience that builds trust with Ethiopian farmers.

## Design Tokens

### Color Palette
All colors are defined as CSS variables in `src/index.css` and should be referenced using `var(--variable-name)` or Tailwind's `text-/bg-/border-` utilities.

#### Primary Palette (Emerald - Growth & Vitality)
- `--primary-50`: #ECFDF5 (Very light backgrounds)
- `--primary-100`: #D1FAE5 (Light hover states)
- `--primary-500`: #10B981 (Main brand color - use for primary actions)
- `--primary-600`: #059669 (Pressed states)
- `--primary-700`: #047857 (Dark accents)

#### Neutrals (Approachable Professionalism)
- `--gray-50`: #F9FAFB (App background)
- `--gray-100`: #F3F4F6 (Card backgrounds)
- `--gray-200`: #E5E7EB (Borders, dividers)
- `--gray-400`: #9CA3AF (Placeholder text, disabled elements)
- `--gray-600`: #4B5563 (Secondary text, hints)
- `--gray-900`: #111827 (Primary text, headings)

#### Semantic Colors (Meaningful States)
- `--blue-500`: #3B82F6 (Info, secondary actions)
- `--amber-500`: #F59E0B (Warning, attention needed)
- `--red-500`: #EF4444 (Error, destructive actions)
- `--purple-500`: #8B5CF6 (Premium features, special highlights)

#### Gradients (Premium Feel - Use Sparingly)
- `--gradient-emerald`: linear-gradient(135deg, #10B981 0%, #059669 100%)
- `--gradient-blue`: linear-gradient(135deg, #3B82F6 0%, #2563EB 100%)
- `--gradient-purple`: linear-gradient(135deg, #8B5CF6 0%, #7C3AED 100%)

### Spacing (8-Point Grid System)
All spacing should use multiples of 4px for consistent vertical and horizontal rhythm.

- `--space-1`: 0.25rem (4px) - Tiny spacing
- `--space-2`: 0.5rem (8px) - Small spacing
- `--space-3`: 0.75rem (12px) - Compact spacing
- `--space-4`: 1rem (16px) - Default padding, form spacing
- `--space-5`: 1.25rem (20px) - Section spacing
- `--space-6`: 1.5rem (24px) - Card spacing, section gaps
- `--space-8`: 2rem (32px) - Large section spacing
- `--space-10`: 2.5rem (40px) - Extra-large sections
- `--space-12`: 3rem (48px) - Major section divisions
- `--space-16`: 4rem (64px) - Page-level spacing

### Typography
Establishes clear hierarchy for information digestion.

#### Font Sizes
- `--text-xs`: 0.75rem (12px) - Captions, helper text
- `--text-sm`: 0.875rem (14px) - Small text, form labels
- `--text-base`: 1rem (16px) - Body text, default
- `--text-lg`: 1.125rem (18px) - Large body, small headings
- `--text-xl`: 1.25rem (20px) - Card headings, subsection titles
- `--text-2xl`: 1.5rem (24px) - Page headings, important stats
- `--text-3xl`: 1.875rem (30px) - Hero sections, major titles
- `--text-4xl`: 2.25rem (36px) - Hero numbers, prominent statistics

#### Font Weights
- `font-regular`: 400 - Body text
- `font-medium`: 500 - Semi-bold text, subtle emphasis
- `font-semibold`: 600 - Section headings, strong emphasis
- `font-bold`: 700 - Page headings, critical information

#### Line Heights
- `leading-tight`: 1.25 - Headings, compact text
- `leading-normal`: 1.5 - Body text, comfortable reading
- `leading-relaxed`: 1.75 - Long-form content, better readability

### Shadow System (Elevation & Depth)
Creates visual hierarchy and indicates interactivity.

- `--shadow-xs`: 0 1px 2px 0 rgba(0, 0, 0, 0.05) - Subtle elevation
- `--shadow-sm`: 0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px -1px rgba(0, 0, 0, 0.1) - Small cards, inputs
- `--shadow-md`: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1) - Standard cards, modals
- `--shadow-lg`: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -4px rgba(0, 0, 0, 0.1) - Elevated components, drawers
- `--shadow-xl`: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1) - Prominent elements, floating action buttons
- `--shadow-primary`: 0 4px 12px rgba(16, 185, 129, 0.2) - Primary action emphasis
- `--shadow-blue`: 0 4px 12px rgba(59, 130, 246, 0.2) - Info/secondary emphasis

### Border Radius (Friendly & Modern)
Consistent rounding that matches component importance.

- `--radius-sm`: 0.375rem (6px) - Small elements, chips, tags
- `--radius-md`: 0.5rem (8px) - Default, inputs, buttons
- `--radius-lg`: 0.75rem (12px) - Cards, modals, containers
- `--radius-xl`: 1rem (16px) - Large cards, hero elements
- `--radius-2xl`: 1.5rem (24px) - Prominent elements, special containers
- `--radius-full`: 9999px - Pills, circles, avatars

## Component Usage Guidelines

### Buttons
Use the standardized `Button` component from `@/components/ui/button` or `EnhancedButton` for advanced variants.

#### Variants & When to Use:
- **default / primary**: Main actions (Save, Submit, Confirm, Next)
- **outline**: Secondary actions (Cancel, Back, Learn More)
- **ghost**: Tertiary actions, text-like buttons, icon buttons
- **tertiary**: Subtle actions, low-emphasis interactions (new variant)
- **destructive**: Delete, Remove, Cancel irreversible actions
- **success**: Confirmation of successful actions
- **gradient**: Premium/CTA actions, special promotions

#### Sizes:
- **icon**: Icon-only buttons (w-10 h-10)
- **sm**: Compact spaces, toolbars
- **default**: Standard button height
- **lg**: Prominent calls-to-action
- **xl**: Hero sections, special emphasis

### Cards
Use the standardized `Card` component from `@/components/ui/card`. The card component now focuses on semantic styling (background and text colors) while layout and styling are handled through utility classes.

#### Variants (Utility Classes):
- **card-standard**: Default card with padding, shadow, and border (use `.card-standard` utility)
- **card-list-item**: Compact cards for lists with minimal padding (use `.card-list-item` utility)
- **card-hover**: Interactive cards with hover lift effect and shadow increase
- **card-elevated**: Cards with more pronounced shadow for emphasis

#### Card Structure:
Use the Card subcomponents for consistent internal structure:
- `CardHeader`: For section headers with proper spacing
- `CardTitle`: For main headings with appropriate typography
- `CardDescription`: For secondary text content
- `CardContent`: For main content area with standard padding
- `CardFooter`: For action areas with consistent styling

### Forms & Inputs
Use standardized `Input`, `Label`, and related components.

#### Guidelines:
- Always pair inputs with `Label` components for accessibility
- Use consistent input heights: h-10 (compact), h-12 (standard), h-14 (large)
- Error states should use `--red-500` for borders and ring effects
- Helper text should use `--gray-600` or `--gray-500`
- Successful validation can use `--green-500` subtly

### Navigation
#### Bottom Navigation:
- Use consistent icon sizes (w-5 h-5 for standard, w-6 h-6 for active indicators)
- Active state: `--primary-600` text with `--primary-50` background and active indicator
- Inactive state: `--gray-500` text with hover states (`--gray-100` background, `--gray-600` text)
- Notification badges: `--red-600` background with white text
- Active indicator: `--primary-600` dot
- Height: Consistent with touch targets (min 48px)
- Shadow: `--shadow-lg` for elevation indication
- Container: Horizontal padding with responsive values (px-4 sm:px-6 lg:px-8)

#### Top Bar:
- Background: `--white` or `--gray-50`
- Border bottom: `--gray-200`
- Height: Consistent with touch targets (min 44px)
- Shadow: `--shadow-sm` for elevation indication
- Padding: Horizontal px-4, vertical py-2

## Interaction Standards

### Hover States
- Buttons: Slight scale increase (scale-[1.02]) or background opacity change
- Cards: Gentle lift (translate-y-[-2px]) with shadow increase
- Interactive elements: Should feel responsive but not distracting

### Press/Active States
- Buttons: Scale decrease (scale-[0.98]) or background darkening
- Touch targets: Provide clear tactile feedback

### Focus States
- All interactive elements must have visible focus indicators
- Use `--ring-2` with `--primary-500` color
- Offset: `ring-offset-2` to prevent layout shift
- Never remove outline without providing equivalent visual feedback

### Loading States
- Use skeleton loaders for content placeholders
- Button loading states should show spinner and disable interaction
- Page-level loading: Use spinners in predictable locations (center or top)

### Animation & Motion
- Purposeful only: Every animation should serve a communication purpose
- Duration: 150ms-300ms for most interactions
- Easing: cubic-bezier(0.4, 0, 0.2, 1) for natural motion
- Respect reduced motion preferences

## Accessibility Requirements (WCAG AA)

### Color Contrast
- Text and interactive elements: Minimum 4.5:1 contrast ratio
- Large text (18pt+ bold or 24pt+): Minimum 3:1 contrast ratio
- UI components and graphical objects: Minimum 3:1 contrast ratio
- Test all states (default, hover, focus, active, disabled)

### Touch Targets
- Minimum size: 44x44 dp (approximately 48px with spacing)
- Adequate spacing between touch targets (minimum 8dp)
- Critical actions should be easily reachable with one hand

### Typography
- Base font size: 16px minimum for body text
- Line height: Minimum 1.5 for paragraph text
- Letter spacing: Adjust for readability in all caps or small text
- Avoid relying on color alone to convey information

### Screen Reader Support
- All meaningful icons need `aria-label` or `aria-hidden` appropriately
- Form fields require associated labels
- Live regions for dynamic content updates
- Logical tab order and focus management

## Implementation Principles

### 1. Design Token First
Never use hardcoded color, spacing, or typography values. Always reference design tokens.

✅ Correct: `bg-primary-500 text-primary-foreground`
❌ Incorrect: `bg-[#10B981] text-white`

### 2. Component First
Check `@/components/ui/` for existing components before creating custom implementations.

✅ Correct: Import and use `Button`, `Input`, `Card`
❌ Incorrect: Creating custom button variants from scratch

### 3. Utility Class Consistency
Use Tailwind utility classes consistently following the design token scale.

✅ Correct: `p-4 space-y-3`
❌ Incorrect: `p-[16px] space-y-[12px]` or inconsistent values like `p-3 py-2`

### 4. Accessibility as Foundation
Consider accessibility requirements from the start, not as an afterthought.

✅ Correct: Include `aria-label`, test contrast, ensure keyboard navigation
❌ Incorrect: Fix accessibility issues only during QA or after user complaints

### 5. Purposeful Design
Every design decision should serve the user's goals and communicate professionalism.

✅ Correct: Using emerald for primary actions to convey growth and vitality
❌ Incorrect: Choosing colors based solely on personal preference

## Getting Started

### For Developers:
1. Review this document before starting any UI work
2. Reference `src/index.css` for all design tokens
3. Use components from `@/components/ui/` as your first choice
4. Run `npm run lint` to catch any styling inconsistencies
5. Test with accessibility tools (axe, Lighthouse, screen readers)

### For Designers:
1. Use this document as your specification
2. Reference the token values in your design tools
3. Component variations should follow the established patterns
4. Provide rationale for any proposed deviations

## Maintenance

This design system should evolve with the product but only through careful consideration:
- Propose changes in the `#design-system` Slack channel
- Document rationale for any additions or modifications
- Update this document and `src/index.css` together
- Ensure backward compatibility where possible
- Deprecate old patterns with clear migration paths

---

*Last Updated: March 14, 2026*
*Version: 1.0.0*